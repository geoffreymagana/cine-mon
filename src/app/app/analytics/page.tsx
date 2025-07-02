
'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
    Area,
    AreaChart,
    Bar, 
    BarChart, 
    CartesianGrid, 
    Cell,
    Legend,
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
    History,
    Layers,
    ListChecks,
    Moon,
    Palette,
    PieChart,
    Repeat,
    Sparkles,
    Star,
    Tv, 
    Users,
    Video,
    Zap,
} from 'lucide-react';
import { MovieService } from '@/lib/movie-service';
import { Button } from '@/components/ui/button';
import { EditGoalDialog } from '@/components/edit-goal-dialog';
import type { Movie, UserCollection } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';


const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(27, 87%, 67%)',
  'hsl(12, 76%, 61%)',
  'hsl(197, 37%, 24%)',
];

const StatCard = ({ icon: Icon, title, value, description, children, className, onEdit }: {
    icon?: React.ElementType;
    title: string;
    value?: string | number;
    description?: string;
    children?: React.ReactNode;
    className?: string;
    onEdit?: () => void;
}) => (
    <div className={`bg-card rounded-lg border p-6 shadow-sm flex flex-col ${className || ''}`}>
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                 {Icon && <Icon className="h-6 w-6 text-muted-foreground" />}
                <div className="min-w-0">
                    <h3 className="text-sm font-medium text-foreground">{title}</h3>
                    {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
                </div>
            </div>
            {onEdit && (
                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1" onClick={onEdit}><Edit className="h-4 w-4 text-muted-foreground" /></Button>
            )}
        </div>
        <div className="flex-grow min-h-0">
            {value !== undefined && <div className="text-3xl font-bold text-foreground mb-2">{value}</div>}
            {children}
        </div>
    </div>
);

const LastWatchedCard = ({ movie }: { movie: Movie | null }) => (
    <div className="bg-card rounded-lg border p-6 shadow-sm h-full overflow-hidden">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-muted-foreground" />
                <div>
                    <h3 className="text-sm font-medium text-foreground">Last Watched</h3>
                    <p className="text-xs text-muted-foreground mt-1">From "Surprise Me"</p>
                </div>
            </div>
        </div>
        {movie ? (
            <div className="flex items-center gap-4 group cursor-pointer h-full">
                <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-16 h-24 object-cover rounded-md transition-transform group-hover:scale-105"
                    data-ai-hint="movie poster"
                />
                <div className="flex-grow min-w-0">
                    <p className="font-bold text-foreground truncate group-hover:text-primary transition-colors">{movie.title}</p>
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

const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-card p-2.5 shadow-sm">
                <div className="grid gap-1.5">
                    {label && <p className="font-medium text-card-foreground">{label}</p>}
                    {payload.map((pld: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pld.payload.fill || pld.color }} />
                            <p className="text-muted-foreground">{pld.name}:</p>
                            <p className="font-semibold text-card-foreground">{pld.value.toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};


export default function AnalyticsPage() {
    const [movies, setMovies] = React.useState<Movie[]>([]);
    const [collections, setCollections] = React.useState<UserCollection[]>([]);
    const [watchGoal, setWatchGoal] = React.useState(50);
    const [lastWatchedMovie, setLastWatchedMovie] = React.useState<Movie | null>(null);
    const [isClient, setIsClient] = React.useState(false);
    
    const [isGoalDialogOpen, setIsGoalDialogOpen] = React.useState(false);
    const isMobile = useIsMobile();

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
    
    const totalRewatches = React.useMemo(() => {
        return watchedMovies.reduce((acc, m) => acc + (m.rewatchCount || 0), 0);
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
    const goalGaugeData = [{ value: Math.min(goalProgress, 100) }];

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
        return Object.entries(directorCounts).sort((a,b) => b[1] - a[1]).slice(0, 8).map(([label, count], i) => ({label, count, fill: CHART_COLORS[i % CHART_COLORS.length]})).reverse();
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
    
    const posterPaletteData = React.useMemo(() => {
        const colors = [
            { name: 'Dark Blue', baseColor: '#1e3a8a', count: 15 },
            { name: 'Black', baseColor: '#000000', count: 12 },
            { name: 'Red', baseColor: '#dc2626', count: 8 },
            { name: 'Green', baseColor: '#16a34a', count: 6 },
            { name: 'Orange', baseColor: '#ea580c', count: 4 }
        ];
        return colors.map((item, index) => ({ ...item, fill: `url(#paletteGradient${index})` }));
    }, []);
    
    const [activeTab, setActiveTab] = React.useState('basic');

    const allBasicCards = {
        totalTitles: <StatCard icon={Film} title="Total Titles" value={totalTitlesWatched} description="Movies & series watched" />,
        timeWatched: <StatCard icon={Clock} title="Time Watched" value={`${totalTimeWatchedHours.toLocaleString()}h`} description="Estimated total hours" />,
        episodesWatched: <StatCard icon={Tv} title="Episodes Watched" value={totalEpisodesWatched.toLocaleString()} description="Across all tracked series" />,
        averageRating: <StatCard icon={Star} title="Average Rating" value={`${averageRating.toFixed(1)}/100`} description="Average of all rated titles" />,
        onWatchlist: <StatCard icon={Bookmark} title="On Watchlist" value={onWatchlistCount} description="Titles you plan to watch" />,
        totalRewatches: <StatCard icon={Repeat} title="Total Rewatches" value={totalRewatches} description="Sum of all rewatch counts" />,
        watchGoal: <StatCard title="2025 Watch Goal" description="Progress on your annual goal" onEdit={() => setIsGoalDialogOpen(true)}>
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
                                    <defs>
                                        <linearGradient id="goalGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="hsl(var(--primary))" />
                                            <stop offset="100%" stopColor="hsl(var(--primary) / 0.5)" />
                                        </linearGradient>
                                    </defs>
                                   <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                                   <RadialBar background={{fill: 'hsl(var(--muted))'}} dataKey="value" cornerRadius={6} fill="url(#goalGradient)"/>
                               </RadialBarChart>
                           </ResponsiveContainer>
                           <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                               <span className="text-3xl font-bold">{totalTitlesWatched}</span>
                               <span className="text-sm text-muted-foreground">/ {watchGoal} titles</span>
                           </div>
                       </div>
                   </StatCard>,
        topGenres: <StatCard icon={PieChart} title="Top Genres" description="Your most-watched genres">
                        <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie 
                                        data={topGenres} 
                                        dataKey="value" 
                                        nameKey="name" 
                                        cx="40%" 
                                        cy="50%" 
                                        innerRadius={50} 
                                        outerRadius={80} 
                                        paddingAngle={2}
                                    >
                                        {topGenres.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                    </Pie>
                                    <Tooltip content={<CustomTooltipContent />} />
                                    {!isMobile && <Legend layout="vertical" verticalAlign="middle" align="right" iconSize={8} wrapperStyle={{fontSize: "12px", lineHeight: "1.5"}} />}
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                   </StatCard>,
        curatedCollections: <StatCard icon={Sparkles} title="Curated Collections" description="Vaults vs. Spotlights">
                            <div className="w-full h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie 
                                            data={collectionsData} 
                                            dataKey="value" 
                                            nameKey="name" 
                                            cx="40%" 
                                            cy="50%" 
                                            outerRadius={80} 
                                            paddingAngle={2}
                                        >
                                            {collectionsData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                        </Pie>
                                        <Tooltip content={<CustomTooltipContent />} />
                                        {!isMobile && <Legend layout="vertical" verticalAlign="middle" align="right" iconSize={8} wrapperStyle={{fontSize: "12px", lineHeight: "1.5"}} />}
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </div>
                        </StatCard>,
        lastWatched: <LastWatchedCard movie={lastWatchedMovie} />
    };

    const allGeekCards = {
        mostActors: <StatCard icon={Users} title="Most Watched Actors" description="Actors appearing most in your collection">
                        <div className="w-full h-64">
                           <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie 
                                        data={topActors} 
                                        dataKey="value" 
                                        nameKey="name" 
                                        cx="40%" 
                                        cy="50%" 
                                        innerRadius={60} 
                                        outerRadius={90} 
                                        paddingAngle={5}
                                    >
                                        {topActors.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                    </Pie>
                                    <Tooltip content={<CustomTooltipContent />} />
                                    {!isMobile && <Legend layout="vertical" verticalAlign="middle" align="right" iconSize={8} wrapperStyle={{fontSize: "12px", lineHeight: "1.5"}} />}
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                    </StatCard>,
        mostDirectors: <StatCard icon={Video} title="Most Watched Directors" description="Directors who appear most often">
                            <div className="w-full h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topDirectors} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                                        <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
                                        <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} tickMargin={5} width={120} fontSize={12} />
                                        <Tooltip content={<CustomTooltipContent />} />
                                        <Bar dataKey="count" radius={4} barSize={16}>
                                            {topDirectors.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </StatCard>,
        topFranchises: <StatCard icon={Layers} title="Top Franchises" description="Your most-watched movie franchises">
                            <div className="w-full h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie 
                                            data={topFranchises} 
                                            dataKey="value" 
                                            nameKey="name" 
                                            cx="40%" 
                                            cy="50%" 
                                            outerRadius={80}
                                        >
                                        {topFranchises.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                        </Pie>
                                        <Tooltip content={<CustomTooltipContent />} />
                                        {!isMobile && <Legend layout="vertical" verticalAlign="middle" align="right" iconSize={8} wrapperStyle={{fontSize: "12px", lineHeight: "1.5"}} />}
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
                            <Tooltip content={<CustomTooltipContent />} />
                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </StatCard>,
        rewatchRatio: <StatCard icon={Zap} title="Rewatch Ratio" value={`${rewatchRatio}%`} description="of your collection has been rewatched" />,
        storageUsage: <StatCard icon={Database} title="Storage Usage" value={`${storageUsage} KB`} description="Local space used by library data" />,
        seriesCompletion: <StatCard icon={ListChecks} title="Series Completion" description="Progress for series you're watching">
                            <div className="space-y-4 pt-2">
                                {watchingSeries.length > 0 ? watchingSeries.map(series => (
                                    <div key={series.id}>
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-sm font-medium truncate">{series.title}</p>
                                            <p className="text-sm text-muted-foreground">{series.completion}%</p>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-1.5">
                                            <div className="bg-primary h-1.5 rounded-full" style={{width: `${series.completion}%`}}></div>
                                        </div>
                                    </div>
                                )) : <p className="text-sm text-muted-foreground text-center pt-8">No series currently being watched.</p>}
                            </div>
                          </StatCard>,
        bingeRating: <StatCard icon={FlaskConical} title="Binge Rating" value="8.5/10" description="Based on watch velocity (dummy data)" />,
        nightOwlScore: <StatCard icon={Moon} title="Night Owl Score" description="Most active watch times (dummy data)">
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
                                     <Tooltip content={<CustomTooltipContent />} />
                                 </AreaChart>
                             </ResponsiveContainer>
                         </div>
                       </StatCard>,
        posterPalette: <StatCard icon={Palette} title="Poster Palette" description="Most common poster colors (dummy data)">
                            <div className="w-full h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart 
                                        data={posterPaletteData} 
                                        innerRadius="10%" 
                                        outerRadius="80%" 
                                        barSize={10} 
                                        startAngle={90}
                                        endAngle={-270}
                                        cx="40%"
                                    >
                                        <defs>
                                            {posterPaletteData.map((entry, index) => (
                                                <radialGradient key={`gradient-${index}`} id={`paletteGradient${index}`}>
                                                    <stop offset="0%" stopColor={entry.baseColor} stopOpacity={0.7} />
                                                    <stop offset="100%" stopColor={entry.baseColor} stopOpacity={1} />
                                                </radialGradient>
                                            ))}
                                        </defs>
                                        <RadialBar dataKey='count' background>
                                            {posterPaletteData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} className="stroke-background stroke-2" />
                                            ))}
                                        </RadialBar>
                                        <Tooltip content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0];
                                                const itemPayload = data.payload as any;
                                                return (
                                                    <div className="rounded-lg border bg-card p-2.5 shadow-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: itemPayload.baseColor}} />
                                                            <p className="font-semibold text-card-foreground">{itemPayload.name}: {data.value}</p>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }} />
                                        {!isMobile && (
                                             <Legend
                                                layout="vertical"
                                                align="right"
                                                verticalAlign="middle"
                                                iconSize={8}
                                                wrapperStyle={{ fontSize: '12px', lineHeight: '1.5', paddingLeft: '10px' }}
                                                payload={posterPaletteData.map(item => ({ value: item.name, type: 'square', color: item.baseColor }))}
                                            />
                                        )}
                                    </RadialBarChart>
                                </ResponsiveContainer>
                            </div>
                       </StatCard>
    };
    
    const basicLayout = [
        { id: 'totalTitles', className: 'lg:col-span-1'},
        { id: 'timeWatched', className: 'lg:col-span-1'},
        { id: 'episodesWatched', className: 'lg:col-span-1'},
        { id: 'onWatchlist', className: 'lg:col-span-1'},
        { id: 'watchGoal', className: 'lg:col-span-2'},
        { id: 'topGenres', className: 'lg:col-span-2'},
        { id: 'curatedCollections', className: 'lg:col-span-2'},
        { id: 'lastWatched', className: 'lg:col-span-1'},
        { id: 'averageRating', className: 'lg:col-span-1'},
        { id: 'totalRewatches', className: 'lg:col-span-1'},
    ];

    const geekLayout = [
        { id: 'collectionTimeline', className: 'lg:col-span-2' },
        { id: 'mostDirectors', className: 'lg:col-span-2' },
        { id: 'seriesCompletion', className: 'lg:col-span-2' },
        { id: 'rewatchRatio', className: 'lg:col-span-1' },
        { id: 'storageUsage', className: 'lg:col-span-1' },
        { id: 'mostActors', className: 'lg:col-span-2' },
        { id: 'topFranchises', className: 'lg:col-span-2' },
        { id: 'nightOwlScore', className: 'lg:col-span-2' },
        { id: 'posterPalette', className: 'lg:col-span-2' },
    ];

    if (!isClient) {
        return <div className="bg-background min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <>
            <div className="bg-background min-h-screen">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center gap-2 mb-8">
                        <Link href="/app/dashboard" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Link>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {basicLayout.map(({ id, className }) => (
                                <div key={id} className={className}>
                                    {allBasicCards[id as keyof typeof allBasicCards]}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {geekLayout.map(({ id, className }) => (
                                <div key={id} className={className}>
                                    {allGeekCards[id as keyof typeof allGeekCards]}
                                </div>
                            ))}
                        </div>
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

    
