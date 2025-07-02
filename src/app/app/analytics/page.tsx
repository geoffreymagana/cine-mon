
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    Edit,
    Film, 
    FlaskConical,
    GripVertical,
    Layers,
    Moon,
    PieChart,
    Repeat,
    Sparkles,
    Star,
    Tv, 
    Users,
    Video,
    Zap,
} from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSwappingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ResizableBox } from 'react-resizable';

import type { Movie, UserCollection } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EditGoalDialog } from '@/components/edit-goal-dialog';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { MovieService } from '@/lib/movie-service';


const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const StatCard = ({ icon: Icon, title, value, description, children, className, onEdit, dragHandleProps }: { icon?: React.ElementType, title: string, value?: React.ReactNode, description?: string, children?: React.ReactNode, className?: string, onEdit?: () => void, dragHandleProps?: any }) => (
    <Card className={cn("flex flex-col", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
                {dragHandleProps && (
                    <div {...dragHandleProps} className="cursor-grab text-muted-foreground hover:text-foreground transition-colors">
                        <GripVertical className="h-5 w-5" />
                    </div>
                )}
                 <div>
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
                </div>
            </div>
            {onEdit ? (
                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1" onClick={onEdit}><Edit className="h-4 w-4 text-muted-foreground" /></Button>
            ) : (
                 Icon && <Icon className="h-4 w-4 text-muted-foreground" />
            )}
        </CardHeader>
        <CardContent className="flex-grow min-h-0">
            {value && <div className="text-2xl font-bold">{value}</div>}
            {children}
        </CardContent>
    </Card>
);

const LastWatchedCard = ({ movie, dragHandleProps }: { movie: Movie, dragHandleProps?: any }) => (
    <Card className="overflow-hidden h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <div className="flex items-center gap-2">
                {dragHandleProps && (
                    <div {...dragHandleProps} className="cursor-grab text-muted-foreground hover:text-foreground transition-colors">
                        <GripVertical className="h-5 w-5" />
                    </div>
                )}
                <div>
                    <CardTitle className="text-sm font-medium">Last Suggestion</CardTitle>
                    <p className="text-xs text-muted-foreground pt-1">From "Surprise Me"</p>
                </div>
            </div>
             <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex-grow flex items-center">
            <Link href={`/app/movie/${movie.id}`} className="flex items-center gap-4 group w-full">
                <Image
                    src={movie.posterUrl}
                    alt={movie.title}
                    width={60}
                    height={90}
                    className="w-[60px] h-[90px] object-cover rounded-md transition-transform group-hover:scale-105"
                    data-ai-hint="movie poster"
                />
                <div className="flex-grow">
                    <p className="font-bold group-hover:text-primary transition-colors">{movie.title}</p>
                    <p className="text-sm text-muted-foreground">{format(new Date(`${movie.releaseDate}T00:00:00`), 'yyyy')}</p>
                </div>
                 <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
        </CardContent>
    </Card>
);

const SortableCardWrapper = ({ id, children, size, onResize, minConstraints }: { id: string; children: React.ReactNode; size: { width: number; height: number; }; onResize: (size: { width: number; height: number; }) => void; minConstraints: [number, number]; }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style: React.CSSProperties = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        zIndex: isDragging ? 10 : 'auto',
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <ResizableBox
                width={size.width}
                height={size.height}
                onResizeStop={(_e, data) => onResize({ width: data.size.width, height: data.size.height })}
                minConstraints={minConstraints}
                maxConstraints={[800, 800]}
                className="relative"
            >
                <div className="w-full h-full">
                    {React.cloneElement(children as React.ReactElement, { 
                        dragHandleProps: listeners,
                        className: "h-full w-full"
                    })}
                </div>
            </ResizableBox>
        </div>
    );
};

const defaultCardOrder = {
    basic: ['totalTitles', 'episodesWatched', 'timeWatched', 'watchGoal', 'onWatchlist', 'topGenres', 'collectionTypes', 'averageRating', 'totalRewatches', 'lastWatched'],
    geek: ['mostActors', 'mostDirectors', 'topFranchises', 'bingeRating', 'nightOwlScore', 'obscurityIndex']
};

const defaultCardSizes: Record<string, { width: number; height: number }> = {
    totalTitles: { width: 250, height: 150 },
    episodesWatched: { width: 250, height: 150 },
    timeWatched: { width: 250, height: 150 },
    averageRating: { width: 350, height: 150 },
    watchGoal: { width: 350, height: 250 },
    onWatchlist: { width: 250, height: 150 },
    topGenres: { width: 350, height: 280 },
    collectionTypes: { width: 350, height: 280 },
    totalRewatches: { width: 350, height: 200 },
    lastWatched: { width: 350, height: 160 },
    mostActors: { width: 400, height: 380 },
    mostDirectors: { width: 400, height: 380 },
    topFranchises: { width: 400, height: 380 },
    bingeRating: { width: 350, height: 150 },
    nightOwlScore: { width: 400, height: 280 },
    obscurityIndex: { width: 400, height: 280 },
};

const cardMinSizes: Record<string, [number, number]> = {
    totalTitles: [200, 140],
    episodesWatched: [200, 140],
    timeWatched: [200, 140],
    averageRating: [250, 140],
    watchGoal: [250, 240],
    onWatchlist: [200, 140],
    topGenres: [300, 250],
    collectionTypes: [300, 250],
    totalRewatches: [250, 200],
    lastWatched: [300, 160],
    mostActors: [300, 300],
    mostDirectors: [350, 300],
    topFranchises: [300, 300],
    bingeRating: [200, 140],
    nightOwlScore: [300, 250],
    obscurityIndex: [300, 250],
};

const AnalyticsGridSkeleton = ({ items }: { items: string[] }) => (
    <div className="flex flex-wrap gap-6 items-start">
        {items.map(id => (
            <Card key={id} style={{ width: defaultCardSizes[id]?.width || 350, height: defaultCardSizes[id]?.height || 200 }}>
                <CardHeader>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        ))}
    </div>
);


export default function AnalyticsPage() {
    const [movies, setMovies] = React.useState<Movie[]>([]);
    const [collections, setCollections] = React.useState<UserCollection[]>([]);
    const [watchGoal, setWatchGoal] = React.useState(50);
    const [lastWatchedMovie, setLastWatchedMovie] = React.useState<Movie | null>(null);
    const [isGoalDialogOpen, setIsGoalDialogOpen] = React.useState(false);
    const [hasMounted, setHasMounted] = React.useState(false);
    const [cardSizes, setCardSizes] = React.useState<Record<string, { width: number; height: number }>>({});

    const [basicCardOrder, setBasicCardOrder] = React.useState<string[]>(defaultCardOrder.basic);
    const [geekCardOrder, setGeekCardOrder] = React.useState<string[]>(defaultCardOrder.geek);
    const isMobile = useIsMobile();
    const { toast } = useToast();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: isMobile ? 250 : 0,
                tolerance: isMobile ? 5 : 2,
            },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    React.useEffect(() => {
        const loadData = async () => {
            try {
                const [moviesFromDb, collectionsFromDb, goalFromDb, lastSpunIdFromDb, storedBasicOrder, storedGeekOrder, storedCardSizes] = await Promise.all([
                    MovieService.getMovies(),
                    MovieService.getCollections(),
                    MovieService.getSetting('watchGoal'),
                    MovieService.getSetting('lastSpunMovieId'),
                    MovieService.getSetting('analyticsBasicOrder'),
                    MovieService.getSetting('analyticsGeekOrder'),
                    MovieService.getSetting('analyticsCardSizes'),
                ]);
                
                setMovies(moviesFromDb);
                setCollections(collectionsFromDb);
                if (goalFromDb) setWatchGoal(goalFromDb);
                if (storedCardSizes) setCardSizes(storedCardSizes);
                else setCardSizes(defaultCardSizes);

                if (storedBasicOrder) setBasicCardOrder(storedBasicOrder);
                if (storedGeekOrder) setGeekCardOrder(storedGeekOrder);
                
                if (lastSpunIdFromDb) {
                    const lastSpunMovie = moviesFromDb.find(m => m.id === lastSpunIdFromDb);
                    if (lastSpunMovie) setLastWatchedMovie(lastSpunMovie);
                }

            } catch (error) {
                console.error("Failed to load data from DB:", error);
                toast({ title: "Error", description: "Could not load analytics data.", variant: "destructive" });
            }
        };
        loadData();
    }, [toast]);
    
    React.useEffect(() => {
        setHasMounted(true);
    }, []);

    const handleDragEnd = (event: DragEndEvent, tab: 'basic' | 'geek') => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            if (tab === 'basic') {
                setBasicCardOrder((items) => {
                    const oldIndex = items.indexOf(active.id as string);
                    const newIndex = items.indexOf(over.id as string);
                    const newOrder = arrayMove(items, oldIndex, newIndex);
                    MovieService.setSetting('analyticsBasicOrder', newOrder);
                    return newOrder;
                });
            } else {
                setGeekCardOrder((items) => {
                    const oldIndex = items.indexOf(active.id as string);
                    const newIndex = items.indexOf(over.id as string);
                    const newOrder = arrayMove(items, oldIndex, newIndex);
                    MovieService.setSetting('analyticsGeekOrder', newOrder);
                    return newOrder;
                });
            }
        }
    };
    
    const handleResize = (id: string, size: { width: number; height: number; }) => {
        setCardSizes(prev => {
            const newSizes = { ...prev, [id]: size };
            MovieService.setSetting('analyticsCardSizes', newSizes);
            return newSizes;
        });
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
        const rewatchedCount = watchedMovies.filter(m => (m.rewatchCount || 0) > 0).length;
        const watchedOnceCount = watchedMovies.length - rewatchedCount;
        if (watchedMovies.length === 0) return [];
        return [
            { name: 'Rewatched', value: rewatchedCount, fill: 'hsl(var(--chart-1))' },
            { name: 'Watched Once', value: watchedOnceCount, fill: 'hsl(var(--chart-2))' },
        ];
    }, [watchedMovies]);
    
    const rewatchConfig = {
      value: { label: 'Titles' },
      Rewatched: { label: 'Rewatched' },
      'Watched Once': { label: 'Watched Once' },
    } satisfies ChartConfig

    const topGenres = React.useMemo(() => {
        const genreCounts = watchedMovies
            .flatMap(m => m.tags || [])
            .reduce((acc, name) => {
                acc[name] = (acc[name] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
        return Object.entries(genreCounts).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([name, value], i) => ({name, value, fill: CHART_COLORS[i % CHART_COLORS.length]}));
    }, [watchedMovies]);
    
    const genresConfig = {
      value: { label: 'Titles' },
      ...topGenres.reduce((acc, genre) => {
        acc[genre.name] = { label: genre.name, color: genre.fill };
        return acc;
      }, {} as ChartConfig),
    } satisfies ChartConfig;

    const collectionsData = React.useMemo(() => {
        const vaultCount = collections.filter(c => c.type === 'Vault').length;
        const spotlightCount = collections.filter(c => c.type === 'Spotlight').length;
        return [
            { name: 'Vaults', value: vaultCount, fill: 'hsl(var(--chart-1))' },
            { name: 'Spotlights', value: spotlightCount, fill: 'hsl(var(--chart-2))' },
        ];
    }, [collections]);

    const collectionsConfig = {
      value: { label: 'Count' },
      Vaults: { label: 'Vaults' },
      Spotlights: { label: 'Spotlights' },
    } satisfies ChartConfig;
    
    const goalProgress = watchGoal > 0 ? (totalTitlesWatched / watchGoal) * 100 : 0;
    const gaugeValue = Math.min(goalProgress, 100);
    const goalGaugeData = [{ value: gaugeValue, fill: "hsl(var(--primary))" }];


    // Geek Stats
    const topActors = React.useMemo(() => {
        const actorCounts = watchedMovies
            .flatMap(m => m.cast?.map(c => c.name) || [])
            .reduce((acc, name) => {
                acc[name] = (acc[name] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
        return Object.entries(actorCounts).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([name, value], i) => ({name, value, fill: CHART_COLORS[i % CHART_COLORS.length]}));
    }, [watchedMovies]);
    
    const actorsConfig = {
      value: { label: "Appearances" },
      ...topActors.reduce((acc, actor) => {
        acc[actor.name] = { label: actor.name, color: actor.fill };
        return acc;
      }, {} as ChartConfig),
    } satisfies ChartConfig;

    const topDirectors = React.useMemo(() => {
        const directorCounts = watchedMovies
            .map(m => m.director)
            .filter(Boolean)
            .reduce((acc, name) => {
                acc[name!] = (acc[name!] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
        return Object.entries(directorCounts).sort((a,b) => b[1] - a[1]).slice(0, 8).map(([label, count]) => ({label, count})).reverse();
    }, [watchedMovies]);
    
    const directorsConfig = {
      count: { label: "Titles Directed", color: "hsl(var(--primary))" },
    } satisfies ChartConfig;

    const topFranchises = React.useMemo(() => {
        const franchiseCounts = watchedMovies
            .map(m => m.collection)
            .filter(Boolean)
            .reduce((acc, name) => {
                acc[name!] = (acc[name!] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
        return Object.entries(franchiseCounts).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([name, value], i) => ({name, value, fill: CHART_COLORS[i % CHART_COLORS.length]}));
    }, [watchedMovies]);
    
    const franchisesConfig = {
      value: { label: "Titles" },
      ...topFranchises.reduce((acc, franchise) => {
        acc[franchise.name] = { label: franchise.name, color: franchise.fill };
        return acc;
      }, {} as ChartConfig),
    } satisfies ChartConfig;
    
    const nightOwlData = [
        { hour: '6 PM', titles: 2 }, { hour: '7 PM', titles: 3 }, { hour: '8 PM', titles: 5 }, 
        { hour: '9 PM', titles: 8 }, { hour: '10 PM', titles: 12 }, { hour: '11 PM', titles: 7 }, 
        { hour: '12 AM', titles: 4 }, { hour: '1 AM', titles: 2 }
    ];
    
    const nightOwlConfig = {
      titles: { label: "Titles Watched", color: "hsl(var(--primary))" },
    } satisfies ChartConfig;

    const obscurityData = [
        { month: 'Jan', YourTaste: 40, Popular: 65 }, { month: 'Feb', YourTaste: 30, Popular: 59 },
        { month: 'Mar', YourTaste: 50, Popular: 80 }, { month: 'Apr', YourTaste: 48, Popular: 71 },
        { month: 'May', YourTaste: 60, Popular: 80 }, { month: 'Jun', YourTaste: 73, Popular: 85 },
    ];
    
    const obscurityConfig = {
      YourTaste: { label: "Your Taste", color: "hsl(var(--chart-1))" },
      Popular: { label: "Popular", color: "hsl(var(--muted-foreground))" },
    } satisfies ChartConfig;
    
    const allBasicCards: Record<string, React.ReactNode> = {
        totalTitles: <StatCard icon={Film} title="Total Titles Watched" value={totalTitlesWatched} />,
        episodesWatched: <StatCard icon={Tv} title="Episodes Watched" value={totalEpisodesWatched.toLocaleString()} />,
        timeWatched: <StatCard icon={Clock} title="Time Watched" value={`${totalTimeWatchedHours.toLocaleString()}h`} description="Estimated total hours" />,
        onWatchlist: <StatCard icon={Bookmark} title="On Your Watchlist" value={onWatchlistCount} />,
        topGenres: <StatCard icon={PieChart} title="Top Genres">
                        <ChartContainer config={genresConfig} className="h-full w-full">
                            <RechartsPieChart>
                                <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                                <Pie data={topGenres} dataKey="value" nameKey="name" innerRadius={50} paddingAngle={2}>
                                    {topGenres.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                </Pie>
                                <Legend />
                            </RechartsPieChart>
                        </ChartContainer>
                   </StatCard>,
        collectionTypes: <StatCard icon={Sparkles} title="Curated Collections">
                            <ChartContainer config={collectionsConfig} className="h-full w-full">
                                <RechartsPieChart>
                                    <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                                    <Pie data={collectionsData} dataKey="value" nameKey="name" innerRadius={50} paddingAngle={2}>
                                        {collectionsData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                    </Pie>
                                    <Legend />
                                </RechartsPieChart>
                            </ChartContainer>
                        </StatCard>,
        watchGoal: <StatCard title="2025 Watch Goal" onEdit={() => setIsGoalDialogOpen(true)}>
                       <div className="w-full h-full relative">
                           <ChartContainer config={{}} className="w-full h-full">
                               <RadialBarChart
                                   data={goalGaugeData}
                                   startAngle={180}
                                   endAngle={-180}
                                   innerRadius="70%"
                                   outerRadius="100%"
                                   barSize={12}
                               >
                                   <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                                   <RadialBar background dataKey="value" cornerRadius={6} />
                               </RadialBarChart>
                           </ChartContainer>
                           <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
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
                            <ChartContainer config={rewatchConfig} className="h-full w-full">
                                <RechartsPieChart>
                                    <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent hideLabel />} />
                                    <Pie data={rewatchData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={50} paddingAngle={5}>
                                       {rewatchData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                </RechartsPieChart>
                            </ChartContainer>
                        </StatCard>,
        lastWatched: lastWatchedMovie && <LastWatchedCard movie={lastWatchedMovie} />
    };

    const allGeekCards: Record<string, React.ReactNode> = {
        mostActors: <StatCard icon={Users} title="Most Watched Actors">
                        <ChartContainer config={actorsConfig} className="h-full w-full">
                             <RechartsPieChart>
                                <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                                <Pie data={topActors} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                    {topActors.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                </Pie>
                                <Legend iconSize={8} />
                            </RechartsPieChart>
                        </ChartContainer>
                    </StatCard>,
        mostDirectors: <StatCard icon={Video} title="Most Watched Directors">
                            <ChartContainer config={directorsConfig} className="h-full w-full">
                                <BarChart data={topDirectors} layout="vertical" margin={{ left: 20, right: 20 }}>
                                    <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} tickMargin={10} width={120} />
                                    <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} barSize={20} />
                                </BarChart>
                            </ChartContainer>
                        </StatCard>,
        topFranchises: <StatCard icon={Layers} title="Top Franchises">
                            <ChartContainer config={franchisesConfig} className="h-full w-full">
                                <RechartsPieChart>
                                    <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                                    <Pie data={topFranchises} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                                       {topFranchises.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                    </Pie>
                                    <Legend wrapperStyle={{fontSize: '12px'}} />
                                </RechartsPieChart>
                            </ChartContainer>
                        </StatCard>,
        bingeRating: <StatCard icon={Zap} title="Binge Rating" value="High" description="You're watching series pretty quickly!" />,
        nightOwlScore: <StatCard icon={Moon} title="Night Owl Score" description="Titles watched after 9 PM">
                            <ChartContainer config={nightOwlConfig} className="h-full w-full">
                                <LineChart data={nightOwlData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hour" fontSize={12} />
                                    <YAxis fontSize={12} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Line type="monotone" dataKey="titles" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ChartContainer>
                        </StatCard>,
        obscurityIndex: <StatCard icon={FlaskConical} title="Obscurity Index" description="Your taste vs. popular taste">
                             <ChartContainer config={obscurityConfig} className="h-full w-full">
                                <AreaChart data={obscurityData}>
                                    <defs>
                                        <linearGradient id="colorYourTaste" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorPopular" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" fontSize={12} />
                                    <YAxis fontSize={12} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area type="monotone" dataKey="YourTaste" stroke="hsl(var(--chart-1))" fill="url(#colorYourTaste)" />
                                    <Area type="monotone" dataKey="Popular" stroke="hsl(var(--muted-foreground))" fill="url(#colorPopular)" />
                                </AreaChart>
                            </ChartContainer>
                         </StatCard>,
    };

    return (
        <>
        <div className="flex min-h-screen flex-col bg-background p-4 sm:p-8">
            <div className="w-full max-w-7xl mx-auto">
                <Link href="/app/dashboard" className="inline-flex items-center gap-2 mb-8 font-semibold text-lg hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5"/>
                    <span>Back to Collection</span>
                </Link>

                <div className="text-left mb-8">
                    <h1 className="text-5xl font-bold font-headline">Your Watchverse</h1>
                    <p className="text-muted-foreground mt-2">A deep dive into your cinematic universe.</p>
                </div>
                
                 <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="mb-6 grid w-full grid-cols-2">
                        <TabsTrigger value="basic">
                            <Activity className="w-4 h-4 mr-2"/> Basic Stats
                        </TabsTrigger>
                        <TabsTrigger value="geek">
                            <FlaskConical className="w-4 h-4 mr-2" /> Geek Out
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic">
                        {hasMounted ? (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'basic')}>
                                <SortableContext items={basicCardOrder} strategy={rectSwappingStrategy}>
                                    <div className="flex flex-wrap gap-6 items-start">
                                        {basicCardOrder.map(cardId => {
                                            const card = allBasicCards[cardId];
                                            const size = cardSizes[cardId] || defaultCardSizes[cardId] || { width: 350, height: 200 };
                                            const minSize = cardMinSizes[cardId] || [200, 140];
                                            return card ? <SortableCardWrapper key={cardId} id={cardId} size={size} onResize={(newSize) => handleResize(cardId, newSize)} minConstraints={minSize}>{card}</SortableCardWrapper> : null;
                                        })}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        ) : (
                            <AnalyticsGridSkeleton items={basicCardOrder} />
                        )}
                    </TabsContent>

                    <TabsContent value="geek">
                         {hasMounted ? (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'geek')}>
                                <SortableContext items={geekCardOrder} strategy={rectSwappingStrategy}>
                                    <div className="flex flex-wrap gap-6 items-start">
                                        {geekCardOrder.map(cardId => {
                                            const card = allGeekCards[cardId];
                                            const size = cardSizes[cardId] || defaultCardSizes[cardId] || { width: 400, height: 350 };
                                            const minSize = cardMinSizes[cardId] || [250, 250];
                                            return card ? <SortableCardWrapper key={cardId} id={cardId} size={size} onResize={(newSize) => handleResize(cardId, newSize)} minConstraints={minSize}>{card}</SortableCardWrapper> : null;
                                        })}
                                    </div>
                                </SortableContext>
                            </DndContext>
                         ) : (
                            <AnalyticsGridSkeleton items={geekCardOrder} />
                         )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
        <EditGoalDialog
            isOpen={isGoalDialogOpen}
            setIsOpen={setIsGoalDialogOpen}
            currentGoal={watchGoal}
            onGoalSet={setWatchGoal}
        />
        </>
    );
}
