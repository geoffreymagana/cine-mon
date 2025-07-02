
'use client';

import * as React from 'react';
import { 
    Area,
    AreaChart,
    Bar, 
    BarChart, 
    CartesianGrid, 
    Cell,
    Legend,
    Line,
    LineChart,
    Pie, 
    PieChart as RechartsPieChart,
    PolarAngleAxis,
    RadialBar,
    RadialBarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis, 
    YAxis 
} from 'recharts';
import { 
    Activity,
    ArrowLeft, 
    Bookmark, 
    Calendar,
    ChevronRight,
    Clock, 
    Database,
    Edit,
    Film, 
    FlaskConical,
    GripVertical,
    History,
    Layers,
    ListChecks,
    Moon,
    PieChart,
    Repeat,
    Sparkles,
    Star,
    Tv, 
    Users,
    Video,
    Zap,
    Palette,
} from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSwappingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { MovieService } from '@/lib/movie-service';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { EditGoalDialog } from '@/components/edit-goal-dialog';
import type { Movie, UserCollection } from '@/lib/types';


const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const StatCard = ({ icon: Icon, title, value, description, children, className, onEdit, dragHandleProps }: {
    icon?: React.ElementType;
    title: string;
    value?: string | number;
    description?: string;
    children?: React.ReactNode;
    className?: string;
    onEdit?: () => void;
    dragHandleProps?: any;
}) => (
    <div className={`bg-card rounded-lg border p-6 shadow-sm flex flex-col ${className || ''}`}>
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                {dragHandleProps && (
                    <div {...dragHandleProps} className="cursor-grab text-muted-foreground hover:text-foreground transition-colors">
                        <GripVertical className="h-5 w-5" />
                    </div>
                )}
                <div className="min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">{title}</h3>
                    {description && <p className="text-xs text-muted-foreground mt-1 truncate">{description}</p>}
                </div>
            </div>
            {onEdit ? (
                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1" onClick={onEdit}><Edit className="h-4 w-4 text-muted-foreground" /></Button>
            ) : (
                 Icon && <Icon className="h-4 w-4 text-muted-foreground" />
            )}
        </div>
        <div className="flex-grow min-h-0">
            {value && <div className="text-2xl font-bold text-foreground mb-2">{value}</div>}
            {children}
        </div>
    </div>
);

const LastWatchedCard = ({ movie, dragHandleProps }: { movie: Movie | null, dragHandleProps: any }) => (
    <div className="bg-card rounded-lg border p-6 shadow-sm h-full">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                {dragHandleProps && (
                    <div {...dragHandleProps} className="cursor-grab text-muted-foreground hover:text-foreground transition-colors">
                        <GripVertical className="h-5 w-5" />
                    </div>
                )}
                <div>
                    <h3 className="text-sm font-medium text-foreground">Last Watched</h3>
                    <p className="text-xs text-muted-foreground mt-1">From "Surprise Me"</p>
                </div>
            </div>
            <Calendar className="h-4 w-4 text-muted-foreground" />
        </div>
        {movie ? (
            <div className="flex items-center gap-4">
                <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-16 h-24 object-cover rounded-md"
                    data-ai-hint="movie poster"
                />
                <div className="flex-grow min-w-0">
                    <p className="font-bold text-foreground truncate">{movie.title}</p>
                    <p className="text-sm text-muted-foreground">{movie.releaseDate?.substring(0,4)}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
        ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No spin history yet.
            </div>
        )}
    </div>
);

const SortableCardWrapper = ({ id, children }: { id: string, children: React.ReactNode }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        zIndex: isDragging ? 10 : 'auto',
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div className="w-full h-full">
                {React.cloneElement(children as React.ReactElement, { 
                    dragHandleProps: listeners,
                })}
            </div>
        </div>
    );
};

const defaultCardOrder = {
    basic: ['totalTitles', 'episodesWatched', 'timeWatched', 'averageRating', 'watchGoal', 'totalRewatches', 'onWatchlist', 'topGenres', 'curatedCollections', 'lastWatched'],
    geek: ['mostActors', 'mostDirectors', 'topFranchises', 'collectionTimeline', 'rewatchRatio', 'storageUsage', 'seriesCompletion', 'bingeRating', 'nightOwlScore', 'posterPalette']
};

export default function AnalyticsPage() {
    const isMobile = useIsMobile();
    const [movies, setMovies] = React.useState<Movie[]>([]);
    const [collections, setCollections] = React.useState<UserCollection[]>([]);
    const [watchGoal, setWatchGoal] = React.useState(50);
    const [lastWatchedMovie, setLastWatchedMovie] = React.useState<Movie | null>(null);
    const [isClient, setIsClient] = React.useState(false);

    const [basicCardOrder, setBasicCardOrder] = React.useState(defaultCardOrder.basic);
    const [geekCardOrder, setGeekCardOrder] = React.useState(defaultCardOrder.geek);
    
    const [isGoalDialogOpen, setIsGoalDialogOpen] = React.useState(false);

    const loadData = React.useCallback(async () => {
        const [moviesFromDb, collectionsFromDb, goalFromDb, lastSpunId] = await Promise.all([
            MovieService.getMovies(),
            MovieService.getCollections(),
            MovieService.getSetting('watchGoal'),
            MovieService.getSetting('lastSpunMovieId')
        ]);
        setMovies(moviesFromDb);
        setCollections(collectionsFromDb);
        if (goalFromDb) setWatchGoal(goalFromDb);
        if (lastSpunId) {
            const lastSpunMovie = moviesFromDb.find(m => m.id === lastSpunId);
            if (lastSpunMovie) setLastWatchedMovie(lastSpunMovie);
        }
    }, []);

    React.useEffect(() => {
        loadData();
        setIsClient(true);
    }, [loadData]);


    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: isMobile ? 250 : 0,
                tolerance: isMobile ? 5 : 2,
            },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent, tab: 'basic' | 'geek') => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            if (tab === 'basic') {
                setBasicCardOrder((items) => {
                    const oldIndex = items.indexOf(active.id as string);
                    const newIndex = items.indexOf(over.id as string);
                    return arrayMove(items, oldIndex, newIndex);
                });
            } else {
                setGeekCardOrder((items) => {
                    const oldIndex = items.indexOf(active.id as string);
                    const newIndex = items.indexOf(over.id as string);
                    return arrayMove(items, oldIndex, newIndex);
                });
            }
        }
    };

    const watchedMovies = React.useMemo(() =>
        movies.filter(movie => movie.status === 'Completed' || movie.status === 'Watching')
    , [movies]);
    
    // Basic Stats
    const totalTitlesWatched = watchedMovies.length;
    const totalEpisodesWatched = watchedMovies.reduce((acc, m) => acc + (m.watchedEpisodes || 0), 0);
    const totalTimeWatchedHours = Math.round(watchedMovies.reduce((acc, movie) => {
        const isMovie = movie.type === 'Movie';
        const duration = isMovie ? (movie.runtime || 90) : ((movie.watchedEpisodes || 0) * (movie.runtime || 24));
        return acc + duration;
    }, 0) / 60);
    const averageRating = watchedMovies.length > 0 ? (watchedMovies.reduce((acc, m) => acc + m.rating, 0) / watchedMovies.length) : 0;
    const onWatchlistCount = movies.filter(movie => movie.status === 'Plan to Watch').length;
    
    const rewatchData = React.useMemo(() => {
        if (watchedMovies.length === 0) return [];
        const rewatchedCount = watchedMovies.filter(m => (m.rewatchCount || 0) > 0).length;
        const watchedOnceCount = watchedMovies.length - rewatchedCount;
        return [
            { name: 'Rewatched', value: rewatchedCount, fill: CHART_COLORS[0] },
            { name: 'Watched Once', value: watchedOnceCount, fill: CHART_COLORS[1] },
        ];
    }, [watchedMovies]);

    const topGenres = React.useMemo(() => {
        const genreCounts = watchedMovies
            .flatMap(m => m.tags || [])
            .reduce((acc: {[key: string]: number}, name) => {
                acc[name] = (acc[name] || 0) + 1;
                return acc;
            }, {});
        return Object.entries(genreCounts).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([name, value], i) => ({name, value, fill: CHART_COLORS[i % CHART_COLORS.length]}));
    }, [watchedMovies]);
    
    const collectionsData = React.useMemo(() => {
        const vaultCount = collections.filter(c => c.type === 'Vault').length;
        const spotlightCount = collections.filter(c => c.type === 'Spotlight').length;
        return [
            { name: 'Vaults', value: vaultCount, fill: CHART_COLORS[0] },
            { name: 'Spotlights', value: spotlightCount, fill: CHART_COLORS[1] },
        ];
    }, [collections]);

    const goalProgress = watchGoal > 0 ? (totalTitlesWatched / watchGoal) * 100 : 0;
    const goalGaugeData = [{ value: Math.min(goalProgress, 100), fill: "hsl(var(--primary))" }];

    // Geek Stats
    const rewatchRatio = React.useMemo(() => {
        if (watchedMovies.length === 0) return 0;
        const rewatchedCount = watchedMovies.filter(m => (m.rewatchCount || 0) > 0).length;
        return Math.round((rewatchedCount / watchedMovies.length) * 100);
    }, [watchedMovies]);

    const storageUsage = React.useMemo(() => {
        try {
            const moviesSize = new Blob([JSON.stringify(movies)]).size;
            const collectionsSize = new Blob([JSON.stringify(collections)]).size;
            const totalBytes = moviesSize + collectionsSize;
            return (totalBytes / 1024).toFixed(2);
        } catch {
            return '0.00';
        }
    }, [movies, collections]);

    const collectionTimelineData = React.useMemo(() => {
        const decadeCounts = watchedMovies.reduce((acc: {[key:string]: number}, movie) => {
            if (movie.releaseDate) {
                const year = parseInt(movie.releaseDate.substring(0, 4), 10);
                if (!isNaN(year)) {
                    const decade = Math.floor(year / 10) * 10;
                    const decadeLabel = `${decade}s`;
                    acc[decadeLabel] = (acc[decadeLabel] || 0) + 1;
                }
            }
            return acc;
        }, {});
    
        return Object.entries(decadeCounts)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .map(([name, value]) => ({ name, value }));
    }, [watchedMovies]);
    
    const watchingSeries = React.useMemo(() => {
        return watchedMovies
            .filter(m => (m.type === 'TV Show' || m.type === 'Anime') && m.status === 'Watching' && m.totalEpisodes > 0)
            .map(m => ({
                id: m.id,
                title: m.title,
                posterUrl: m.posterUrl,
                completion: Math.round(((m.watchedEpisodes || 0) / (m.totalEpisodes || 1)) * 100)
            }))
            .sort((a, b) => b.completion - a.completion)
            .slice(0, 5);
    }, [watchedMovies]);

    const topActors = React.useMemo(() => {
        const actorCounts = watchedMovies
            .flatMap(m => m.cast?.map(c => c.name) || [])
            .reduce((acc: {[key:string]: number}, name) => {
                acc[name] = (acc[name] || 0) + 1;
                return acc;
            }, {});
        return Object.entries(actorCounts).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([name, value], i) => ({name, value, fill: CHART_COLORS[i % CHART_COLORS.length]}));
    }, [watchedMovies]);
    
    const topDirectors = React.useMemo(() => {
        const directorCounts = watchedMovies
            .map(m => m.director)
            .filter(Boolean)
            .reduce((acc: {[key:string]: number}, name) => {
                acc[name!] = (acc[name!] || 0) + 1;
                return acc;
            }, {});
        return Object.entries(directorCounts).sort((a,b) => b[1] - a[1]).slice(0, 8).map(([label, count]) => ({label, count})).reverse();
    }, [watchedMovies]);

    const topFranchises = React.useMemo(() => {
        const franchiseCounts = watchedMovies
            .map(m => m.collection)
            .filter(Boolean)
            .reduce((acc: {[key:string]: number}, name) => {
                acc[name!] = (acc[name!] || 0) + 1;
                return acc;
            }, {});
        return Object.entries(franchiseCounts).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([name, value], i) => ({name, value, fill: CHART_COLORS[i % CHART_COLORS.length]}));
    }, [watchedMovies]);
    
    const nightOwlData = [
        { hour: '6 PM', titles: 2 }, { hour: '7 PM', titles: 3 }, { hour: '8 PM', titles: 5 }, 
        { hour: '9 PM', titles: 8 }, { hour: '10 PM', titles: 12 }, { hour: '11 PM', titles: 7 }, 
        { hour: '12 AM', titles: 4 }, { hour: '1 AM', titles: 2 }
    ];
    
    const posterPaletteData = [
        { color: 'Dark Blue', count: 15, fill: '#1e3a8a' },
        { color: 'Black', count: 12, fill: '#000000' },
        { color: 'Red', count: 8, fill: '#dc2626' },
        { color: 'Green', count: 6, fill: '#16a34a' },
        { color: 'Orange', count: 4, fill: '#ea580c' }
    ];
    
    const [activeTab, setActiveTab] = React.useState('basic');

    const allBasicCards = {
        totalTitles: <StatCard icon={Film} title="Total Titles Watched" value={totalTitlesWatched} />,
        episodesWatched: <StatCard icon={Tv} title="Episodes Watched" value={totalEpisodesWatched.toLocaleString()} />,
        timeWatched: <StatCard icon={Clock} title="Time Watched" value={`${totalTimeWatchedHours.toLocaleString()}h`} description="Estimated total hours" />,
        onWatchlist: <StatCard icon={Bookmark} title="On Your Watchlist" value={onWatchlistCount} />,
        topGenres: <StatCard icon={PieChart} title="Top Genres">
                        <div className="w-full h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie 
                                        data={topGenres} 
                                        dataKey="value" 
                                        nameKey="name" 
                                        cx="50%" 
                                        cy="50%" 
                                        innerRadius={40} 
                                        outerRadius={70} 
                                        paddingAngle={2}
                                    >
                                        {topGenres.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                                    <Legend iconSize={8} />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                   </StatCard>,
        curatedCollections: <StatCard icon={Sparkles} title="Curated Collections">
                            <div className="w-full h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie 
                                            data={collectionsData} 
                                            dataKey="value" 
                                            nameKey="name" 
                                            cx="50%" 
                                            cy="50%" 
                                            innerRadius={40} 
                                            outerRadius={70} 
                                            paddingAngle={2}
                                        >
                                            {collectionsData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                                        <Legend iconSize={8} />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </div>
                        </StatCard>,
        watchGoal: <StatCard title="2025 Watch Goal" onEdit={() => setIsGoalDialogOpen(true)}>
                       <div className="w-full h-48 relative">
                           <ResponsiveContainer width="100%" height="100%">
                               <RadialBarChart
                                   data={goalGaugeData}
                                   startAngle={180}
                                   endAngle={-180}
                                   innerRadius="70%"
                                   outerRadius="100%"
                                   barSize={12}
                               >
                                   <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                                   <RadialBar background={{fill: 'hsl(var(--muted))'}} dataKey="value" cornerRadius={6} />
                               </RadialBarChart>
                           </ResponsiveContainer>
                           <div className="absolute inset-0 flex flex-col items-center justify-center">
                               <span className="text-3xl font-bold">{totalTitlesWatched}</span>
                               <span className="text-sm text-muted-foreground">/ {watchGoal} titles</span>
                           </div>
                       </div>
                   </StatCard>,
        averageRating: <StatCard icon={Star} title="Average Rating">
                        <div className="flex items-center gap-4 pt-2">
                            <span className="text-3xl font-bold">{averageRating.toFixed(1)}/100</span>
                        </div>
                    </StatCard>,
        totalRewatches: <StatCard icon={Repeat} title="Total Rewatches">
                            <div className="w-full h-40">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie 
                                            data={rewatchData} 
                                            dataKey="value" 
                                            nameKey="name" 
                                            innerRadius={30} 
                                            outerRadius={60} 
                                            cx="50%" 
                                            cy="50%" 
                                            paddingAngle={5}
                                        >
                                        {rewatchData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                                        <Legend iconSize={8} />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </div>
                        </StatCard>,
        lastWatched: <LastWatchedCard movie={lastWatchedMovie} />
    };

    const allGeekCards = {
        mostActors: <StatCard icon={Users} title="Most Watched Actors">
                        <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie 
                                        data={topActors} 
                                        dataKey="value" 
                                        nameKey="name" 
                                        cx="50%" 
                                        cy="50%" 
                                        innerRadius={60} 
                                        outerRadius={90} 
                                        paddingAngle={5}
                                    >
                                        {topActors.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                                    <Legend iconSize={8} />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                    </StatCard>,
        mostDirectors: <StatCard icon={Video} title="Most Watched Directors">
                            <div className="w-full h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topDirectors} layout="vertical" margin={{ left: 80, right: 20, top: 10, bottom: 10 }}>
                                        <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} tickMargin={10} width={70} />
                                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} barSize={16} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </StatCard>,
        topFranchises: <StatCard icon={Layers} title="Top Franchises">
                            <div className="w-full h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie 
                                            data={topFranchises} 
                                            dataKey="value" 
                                            nameKey="name" 
                                            cx="50%" 
                                            cy="50%" 
                                            outerRadius={80}
                                        >
                                        {topFranchises.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                                        <Legend iconSize={8} />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </div>
                        </StatCard>,
        collectionTimeline: <StatCard icon={History} title="Collection Timeline" description="Titles watched by release decade">
                <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={collectionTimelineData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </StatCard>,
        rewatchRatio: <StatCard icon={Zap} title="Rewatch Ratio" value={`${rewatchRatio}%`} description="of your collection has been rewatched" />,
        storageUsage: <StatCard icon={Database} title="Storage Usage" value={`${storageUsage} KB`} description="Local space used by library data" />,
        seriesCompletion: <StatCard icon={ListChecks} title="Series Completion">
                            <div className="space-y-4 pt-2">
                                {watchingSeries.map(series => (
                                    <div key={series.id}>
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-sm font-medium truncate">{series.title}</p>
                                            <p className="text-sm text-muted-foreground">{series.completion}%</p>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-1.5">
                                            <div className="bg-primary h-1.5 rounded-full" style={{width: `${series.completion}%`}}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                          </StatCard>,
        bingeRating: <StatCard icon={FlaskConical} title="Binge Rating" value="8.5/10" description="Based on watch velocity" />,
        nightOwlScore: <StatCard icon={Moon} title="Night Owl Score" description="Most active watch times">
                         <div className="w-full h-40">
                             <ResponsiveContainer>
                                 <AreaChart data={nightOwlData}>
                                     <defs>
                                        <linearGradient id="nightOwlFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                        </linearGradient>
                                     </defs>
                                     <Area type="monotone" dataKey="titles" stroke="hsl(var(--primary))" fill="url(#nightOwlFill)" />
                                     <XAxis dataKey="hour" fontSize={12} tickLine={false} axisLine={false} />
                                     <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                                 </AreaChart>
                             </ResponsiveContainer>
                         </div>
                       </StatCard>,
        posterPalette: <StatCard icon={Palette} title="Poster Palette">
                           <div className="flex gap-2 pt-2">
                               {posterPaletteData.map(c => (
                                   <div key={c.color} className="flex flex-col items-center gap-1">
                                       <div className="w-8 h-8 rounded-full" style={{backgroundColor: c.fill}}></div>
                                       <span className="text-xs text-muted-foreground">{c.color}</span>
                                   </div>
                               ))}
                           </div>
                       </StatCard>
    };

    if (!isClient) {
        // Render a skeleton or loading state on the server
        return <div className="bg-background min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <>
            <div className="bg-background min-h-screen">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center gap-2 mb-8">
                        <a href="/app/dashboard" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </a>
                    </div>
                    <div className="flex flex-col xl:flex-row items-baseline justify-between gap-4 border-b border-border pb-6 mb-8">
                        <div>
                            <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground">Your Watchverse</h1>
                            <p className="mt-2 text-lg text-muted-foreground">A deep dive into your cinematic universe.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button onClick={() => setActiveTab('basic')} variant={activeTab === 'basic' ? 'default' : 'outline'}>
                                Basic Stats
                            </Button>
                            <Button onClick={() => setActiveTab('geek')} variant={activeTab === 'geek' ? 'default' : 'outline'}>
                                Geek Out
                            </Button>
                        </div>
                    </div>

                    {activeTab === 'basic' ? (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'basic')}>
                            <SortableContext items={basicCardOrder} strategy={rectSwappingStrategy}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {basicCardOrder.map(id => allBasicCards[id as keyof typeof allBasicCards] ? (
                                        <SortableCardWrapper key={id} id={id}>
                                            {allBasicCards[id as keyof typeof allBasicCards]}
                                        </SortableCardWrapper>
                                    ) : null)}
                                </div>
                            </SortableContext>
                        </DndContext>
                    ) : (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'geek')}>
                            <SortableContext items={geekCardOrder} strategy={rectSwappingStrategy}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {geekCardOrder.map(id => allGeekCards[id as keyof typeof allGeekCards] ? (
                                        <SortableCardWrapper key={id} id={id}>
                                            {allGeekCards[id as keyof typeof allGeekCards]}
                                        </SortableCardWrapper>
                                    ) : null)}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            </div>
            <EditGoalDialog 
                isOpen={isGoalDialogOpen} 
                setIsOpen={setIsGoalDialogOpen} 
                currentGoal={watchGoal} 
                onGoalSet={(newGoal) => {
                    setWatchGoal(newGoal);
                    loadData();
                }}
            />
        </>
    )
}
