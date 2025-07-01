'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { 
    ArrowLeft, 
    Bookmark, 
    Calendar, 
    Clock, 
    Film, 
    Folders, 
    Goal,
    Library,
    List,
    Moon,
    Palette,
    Percent,
    Repeat, 
    Star, 
    Tags, 
    TrendingUp, 
    Tv, 
    User, 
    UserSquare,
    Database,
    FlaskConical,
    Activity
} from 'lucide-react';

import type { Movie } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MovieService } from '@/lib/movie-service';

const StatCard = ({ icon: Icon, title, value, description, children, className }: { icon?: React.ElementType, title: string, value: React.ReactNode, description?: string, children?: React.ReactNode, className?: string }) => (
    <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
            {children}
        </CardContent>
    </Card>
);

const DetailListCard = ({ icon: Icon, title, description, items }: { icon?: React.ElementType, title: string, description?: string, items: {label: string, value: string | number}[] }) => (
    <Card className="flex flex-col">
        <CardHeader>
            <div className='flex items-center gap-4'>
                {Icon && <Icon className="w-8 h-8 text-muted-foreground" />}
                <div>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </div>
            </div>
        </CardHeader>
        <CardContent className="flex-grow">
            <ScrollArea className="h-48">
                <ul className="space-y-2 pr-4">
                    {items.map(item => (
                        <li key={item.label} className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground truncate" title={item.label}>{item.label}</span>
                            <span className="font-semibold">{item.value}</span>
                        </li>
                    ))}
                </ul>
            </ScrollArea>
        </CardContent>
    </Card>
);


const predefinedGenreColors: Record<string, string> = {
  Action: 'hsl(var(--chart-1))',
  Adventure: 'hsl(var(--chart-2))',
  Comedy: 'hsl(var(--chart-3))',
  Drama: 'hsl(var(--chart-4))',
  'Sci-Fi': 'hsl(var(--chart-5))',
  Fantasy: 'hsl(275, 76%, 58%)',
  Thriller: 'hsl(var(--destructive))',
  Romance: 'hsl(340, 82%, 56%)',
  Animation: 'hsl(45, 93%, 47%)',
  Horror: 'hsl(240, 84%, 30%)',
};

const generateChartConfig = (data: { name: string; value: number }[]) => {
  const config: any = {};
  data.forEach((item, index) => {
    config[item.name] = {
      label: item.name,
      color: predefinedGenreColors[item.name] || `hsl(var(--chart-${(index % 5) + 1}))`,
    };
  });
  return config;
};

export default function AnalyticsPage() {
    const [movies, setMovies] = React.useState<Movie[]>([]);

    React.useEffect(() => {
        const loadMovies = async () => {
            try {
                const moviesFromDb = await MovieService.getMovies();
                setMovies(moviesFromDb);
            } catch (error) {
                console.error("Failed to load movies from DB:", error);
            }
        };
        loadMovies();
    }, []);

    const watchedMovies = React.useMemo(() =>
        movies.filter(movie => movie.status !== 'Plan to Watch')
    , [movies]);
    
    const watchlistMovies = React.useMemo(() =>
        movies.filter(movie => movie.status === 'Plan to Watch')
    , [movies]);

    // Basic Stats
    const totalTitlesWatched = watchedMovies.length;
    const totalEpisodesWatched = watchedMovies.reduce((acc, m) => acc + (m.watchedEpisodes || 0), 0);
    const totalTimeWatchedHours = Math.round(watchedMovies.reduce((acc, movie) => {
        const isMovie = movie.type === 'Movie';
        const duration = isMovie ? (movie.runtime || 90) : (movie.watchedEpisodes * (movie.runtime || 24));
        return acc + duration;
    }, 0) / 60);
    const averageRating = watchedMovies.length > 0 ? (watchedMovies.reduce((acc, m) => acc + m.rating, 0) / watchedMovies.length) : 0;
    const watchlistCount = watchlistMovies.length;
    const collectionCount = new Set(movies.map(m => m.collection).filter(Boolean)).size;
    const totalRewatches = watchedMovies.reduce((acc, m) => acc + (m.rewatchCount || 0), 0);

    const topGenres = React.useMemo(() => {
        const genreCounts = watchedMovies.flatMap(m => m.tags).reduce((acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        return Object.entries(genreCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, value]) => ({ name, value, key: name }));
    }, [watchedMovies]);
    
    const genreChartConfig = generateChartConfig(topGenres);

    // Geek Stats
    const topActors = React.useMemo(() => {
        const actorCounts = watchedMovies
            .flatMap(m => m.cast?.map(c => c.name) || [])
            .reduce((acc, name) => {
                acc[name] = (acc[name] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
        return Object.entries(actorCounts).sort((a,b) => b[1] - a[1]).slice(0, 10).map(([label, value]) => ({label, value}));
    }, [watchedMovies]);

    const topDirectors = React.useMemo(() => {
        const directorCounts = watchedMovies
            .map(m => m.director)
            .filter(Boolean)
            .reduce((acc, name) => {
                acc[name!] = (acc[name!] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
        return Object.entries(directorCounts).sort((a,b) => b[1] - a[1]).slice(0, 10).map(([label, value]) => ({label, value}));
    }, [watchedMovies]);

    const moviesPerDecade = React.useMemo(() => {
        const decadeCounts: Record<string, number> = {};
        watchedMovies.forEach(m => {
            const year = m.releaseDate ? new Date(m.releaseDate).getFullYear() : 0;
            if(year) {
                const decade = Math.floor(year / 10) * 10;
                decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
            }
        });
        return Object.entries(decadeCounts).sort((a,b) => parseInt(a[0]) - parseInt(b[0])).map(([decade, count]) => ({decade: `${decade}s`, count}));
    }, [watchedMovies]);

    const decadeChartConfig = { count: { label: "Titles", color: "hsl(var(--primary))" } };

    const rewatchRatio = watchedMovies.length > 0 ? (watchedMovies.filter(m => (m.rewatchCount || 0) > 0).length / watchedMovies.length) * 100 : 0;
    
    const [storageSize, setStorageSize] = React.useState(0);
    React.useEffect(() => {
        const calculateStorage = async () => {
            if (navigator.storage && navigator.storage.estimate) {
                const { usage } = await navigator.storage.estimate();
                setStorageSize(usage ? usage / 1024 / 1024 : 0); // Show in MB
            }
        };
        calculateStorage();
    }, [movies]);

    const seriesCompletion = React.useMemo(() => {
        return watchedMovies
            .filter(m => m.type !== 'Movie' && m.status === 'Watching' && m.totalEpisodes > 0)
            .map(s => ({
                title: s.title,
                completion: Math.round((s.watchedEpisodes / s.totalEpisodes) * 100),
            }))
            .sort((a, b) => b.completion - a.completion);
    }, [watchedMovies]);
    
    const topFranchises = React.useMemo(() => {
        const franchiseCounts = watchedMovies
            .map(m => m.collection)
            .filter(Boolean)
            .reduce((acc, name) => {
                acc[name!] = (acc[name!] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
        return Object.entries(franchiseCounts).sort((a,b) => b[1] - a[1]).slice(0, 10).map(([label, value]) => ({label, value: `${value} titles`}));
    }, [watchedMovies]);

    return (
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            <StatCard icon={Film} title="Total Titles" value={totalTitlesWatched} description="Watched or currently watching" />
                            <StatCard icon={Tv} title="Episodes Watched" value={totalEpisodesWatched.toLocaleString()} description="Across all series" />
                            <StatCard icon={Clock} title="Time Watched" value={`${totalTimeWatchedHours.toLocaleString()}h`} description="Estimated total watch time" />
                            <StatCard icon={Star} title="Average Rating" value={`${averageRating.toFixed(1)}/100`} description="Your average score for all titles" />
                            <StatCard icon={Bookmark} title="On Your Watchlist" value={watchlistCount} description="Titles you plan to watch" />
                            <StatCard icon={Library} title="Curated Collections" value={collectionCount} description="Number of movie/show collections" />
                            <StatCard icon={Repeat} title="Total Rewatches" value={totalRewatches} description="How many times you've revisited" />
                            <StatCard icon={Goal} title="2025 Goal" value="15/50" description="Movies watched this year" />
                            
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Top Genres</CardTitle>
                                    <CardDescription>Your most-watched categories.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex items-center justify-center">
                                    {topGenres.length > 0 ? (
                                        <ChartContainer config={genreChartConfig} className="mx-auto aspect-square h-[200px]">
                                            <PieChart>
                                                <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                                <Pie data={topGenres} dataKey="value" nameKey="name" innerRadius={50} strokeWidth={5}>
                                                    {topGenres.map((entry) => (
                                                        <Cell key={entry.name} fill={genreChartConfig[entry.name]?.color} className="stroke-background"/>
                                                    ))}
                                                </Pie>
                                                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                                            </PieChart>
                                        </ChartContainer>
                                    ) : (
                                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">No genre data available.</div>
                                    )}
                                </CardContent>
                            </Card>
                            
                            <StatCard icon={Calendar} title="Last Watched" value="Inception" description="On this day last year..." />
                        </div>
                    </TabsContent>

                    <TabsContent value="geek">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <DetailListCard icon={User} title="Most Watched Actors" items={topActors} description="Appearances in your collection" />
                            <DetailListCard icon={UserSquare} title="Most Watched Directors" items={topDirectors} description="Projects in your collection" />
                            <DetailListCard icon={Folders} title="Top Franchises" items={topFranchises} description="Based on your collections" />

                             <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Collection Timeline</CardTitle>
                                    <CardDescription>Number of titles watched from each decade.</CardDescription>
                                </CardHeader>
                                <CardContent className="pl-2">
                                    <ChartContainer config={decadeChartConfig} className="h-[300px] w-full">
                                        <ResponsiveContainer>
                                            <BarChart data={moviesPerDecade} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                                                <CartesianGrid vertical={false} />
                                                <XAxis dataKey="decade" tickLine={false} tickMargin={10} axisLine={false} />
                                                <YAxis tickLine={false} axisLine={false} />
                                                <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            <StatCard icon={Percent} title="Rewatch Ratio" value={`${rewatchRatio.toFixed(0)}%`} description="of titles you've rewatched" />
                            
                            <StatCard icon={Database} title="Storage Usage" value={`${storageSize.toFixed(2)} MB`} description="Local space used by your library data." />
                            <StatCard icon={Palette} title="Poster Palette" value="Deep Blue" description="Most common poster color (dummy)" />
                            <StatCard icon={Moon} title="Night Owl Score" value="78%" description="Titles watched after 11pm (dummy)" />

                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Series Completion</CardTitle>
                                    <CardDescription>Your progress in shows you're currently watching.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-40">
                                        <div className="space-y-4 pr-4">
                                            {seriesCompletion.length > 0 ? seriesCompletion.map(s => (
                                                <div key={s.title}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="font-medium truncate" title={s.title}>{s.title}</span>
                                                        <span className="text-muted-foreground">{s.completion}%</span>
                                                    </div>
                                                    <Progress value={s.completion} />
                                                </div>
                                            )) : <p className="text-muted-foreground text-sm">No series currently in progress.</p>}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                             <StatCard icon={TrendingUp} title="Obscurity Index" value="Highly Obscure" description="Your taste vs. TMDB popularity (dummy)" />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
