
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
    PieChart, 
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
    Edit,
    Film, 
    FlaskConical,
    Folders, 
    Goal,
    Library,
    Moon,
    Palette,
    Percent,
    Repeat, 
    Star, 
    TrendingUp, 
    Tv, 
    User, 
    UserSquare,
    Zap,
} from 'lucide-react';

import type { Movie } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MovieService } from '@/lib/movie-service';
import { RatingCircle } from '@/components/rating-circle';
import { Button } from '@/components/ui/button';
import { EditGoalDialog } from '@/components/edit-goal-dialog';
import { format } from 'date-fns';

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const StatCard = ({ icon: Icon, title, value, description, children, className, onEdit }: { icon?: React.ElementType, title: string, value?: React.ReactNode, description?: string, children?: React.ReactNode, className?: string, onEdit?: () => void }) => (
    <Card className={className}>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
            </div>
            {onEdit ? (
                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1" onClick={onEdit}><Edit className="h-4 w-4 text-muted-foreground" /></Button>
            ) : (
                 Icon && <Icon className="h-4 w-4 text-muted-foreground" />
            )}
        </CardHeader>
        <CardContent>
            {value && <div className="text-2xl font-bold">{value}</div>}
            {children}
        </CardContent>
    </Card>
);

const LastWatchedCard = ({ movie }: { movie: Movie }) => (
    <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
                <CardTitle className="text-sm font-medium">Last Suggestion</CardTitle>
                <p className="text-xs text-muted-foreground pt-1">From "Surprise Me"</p>
            </div>
             <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <Link href={`/app/movie/${movie.id}`} className="flex items-center gap-4 group">
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

export default function AnalyticsPage() {
    const [movies, setMovies] = React.useState<Movie[]>([]);
    const [watchGoal, setWatchGoal] = React.useState(50);
    const [lastWatchedMovie, setLastWatchedMovie] = React.useState<Movie | null>(null);
    const [isGoalDialogOpen, setIsGoalDialogOpen] = React.useState(false);

    React.useEffect(() => {
        const loadData = async () => {
            try {
                const [moviesFromDb, goalFromDb, lastSpunIdFromDb] = await Promise.all([
                    MovieService.getMovies(),
                    MovieService.getSetting('watchGoal'),
                    MovieService.getSetting('lastSpunMovieId')
                ]);
                
                setMovies(moviesFromDb);
                if (goalFromDb) setWatchGoal(goalFromDb);
                
                if (lastSpunIdFromDb) {
                    const lastSpunMovie = moviesFromDb.find(m => m.id === lastSpunIdFromDb);
                    if (lastSpunMovie) setLastWatchedMovie(lastSpunMovie);
                }

            } catch (error) {
                console.error("Failed to load data from DB:", error);
            }
        };
        loadData();
    }, []);

    const watchedMovies = React.useMemo(() =>
        movies.filter(movie => movie.status !== 'Plan to Watch')
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
    
    const rewatchData = React.useMemo(() => {
        const rewatchedCount = watchedMovies.filter(m => (m.rewatchCount || 0) > 0).length;
        const watchedOnceCount = watchedMovies.length - rewatchedCount;
        if (watchedMovies.length === 0) return [];
        return [
            { name: 'Rewatched', value: rewatchedCount, fill: 'hsl(var(--chart-1))' },
            { name: 'Watched Once', value: watchedOnceCount, fill: 'hsl(var(--chart-2))' },
        ];
    }, [watchedMovies]);
    
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
    
    const nightOwlData = [
        { hour: '6 PM', titles: 2 }, { hour: '7 PM', titles: 3 }, { hour: '8 PM', titles: 5 }, 
        { hour: '9 PM', titles: 8 }, { hour: '10 PM', titles: 12 }, { hour: '11 PM', titles: 7 }, 
        { hour: '12 AM', titles: 4 }, { hour: '1 AM', titles: 2 }
    ];
    
    const obscurityData = [
        { month: 'Jan', YourTaste: 40, Popular: 65 }, { month: 'Feb', YourTaste: 30, Popular: 59 },
        { month: 'Mar', YourTaste: 50, Popular: 80 }, { month: 'Apr', YourTaste: 48, Popular: 71 },
        { month: 'May', YourTaste: 60, Popular: 80 }, { month: 'Jun', YourTaste: 73, Popular: 85 },
    ];

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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard icon={Film} title="Total Titles Watched" value={totalTitlesWatched} className="lg:col-span-1" />
                            <StatCard icon={Tv} title="Episodes Watched" value={totalEpisodesWatched.toLocaleString()} />
                            <StatCard icon={Clock} title="Time Watched" value={`${totalTimeWatchedHours.toLocaleString()}h`} description="Estimated total hours" />
                            <StatCard title="Average Rating">
                                <div className="flex items-center gap-4 pt-2">
                                    <RatingCircle percentage={averageRating} />
                                    <span className="text-2xl font-bold">{averageRating.toFixed(1)}/100</span>
                                </div>
                            </StatCard>
                            
                            <StatCard title="2025 Watch Goal" onEdit={() => setIsGoalDialogOpen(true)}>
                                <div className="flex items-end gap-2 text-2xl font-bold pt-2">
                                    {totalTitlesWatched} 
                                    <span className="text-muted-foreground text-lg">/ {watchGoal}</span>
                                </div>
                                <Progress value={(totalTitlesWatched/watchGoal)*100} className="mt-2" />
                            </StatCard>

                            <StatCard title="Total Rewatches" className="md:col-span-2">
                                <ResponsiveContainer width="100%" height={120}>
                                    <PieChart>
                                        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent hideLabel />} />
                                        <Pie data={rewatchData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={50} paddingAngle={5}>
                                           {rewatchData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </StatCard>
                            
                            {lastWatchedMovie && <LastWatchedCard movie={lastWatchedMovie} />}
                        </div>
                    </TabsContent>

                    <TabsContent value="geek">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <StatCard title="Most Watched Actors" className="md:col-span-1 lg:row-span-2">
                                <ResponsiveContainer width="100%" height={300}>
                                     <PieChart>
                                        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                                        <Pie data={topActors} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                            {topActors.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                        </Pie>
                                        <Legend iconSize={8} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </StatCard>
                             <StatCard title="Most Watched Directors" className="md:col-span-1 lg:col-span-2">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={topDirectors} layout="vertical" margin={{ left: 20, right: 20 }}>
                                        <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} tickMargin={10} width={120} />
                                        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </StatCard>
                             <StatCard title="Top Franchises" className="md:col-span-1 lg:col-span-2">
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                                        <Pie data={topFranchises} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                                           {topFranchises.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                        </Pie>
                                        <Legend wrapperStyle={{fontSize: '12px'}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </StatCard>
                            <StatCard icon={Zap} title="Binge Rating" value="High" description="You're watching series pretty quickly!" />
                            <StatCard title="Night Owl Score" description="Titles watched after 9 PM" className="md:col-span-1 lg:col-span-2">
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={nightOwlData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hour" fontSize={12} />
                                        <YAxis fontSize={12} />
                                        <Tooltip content={<ChartTooltipContent />} />
                                        <Line type="monotone" dataKey="titles" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </StatCard>
                             <StatCard title="Obscurity Index" description="Your taste vs. popular taste" className="md:col-span-2 lg:col-span-3">
                                 <ResponsiveContainer width="100%" height={200}>
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
                                        <Tooltip content={<ChartTooltipContent />} />
                                        <Area type="monotone" dataKey="YourTaste" stroke="hsl(var(--chart-1))" fill="url(#colorYourTaste)" />
                                        <Area type="monotone" dataKey="Popular" stroke="hsl(var(--muted-foreground))" fill="url(#colorPopular)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                             </StatCard>
                        </div>
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
