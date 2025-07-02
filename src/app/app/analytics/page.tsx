
'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
    ResponsiveContainer,
    Tooltip,
    Treemap,
    XAxis, 
    YAxis 
} from 'recharts';
import { 
    ArrowLeft, 
    Bookmark, 
    Calendar,
    CircleDashed,
    Clock, 
    Database,
    Edit,
    Film, 
    FlaskConical,
    History,
    Layers,
    ListChecks,
    Loader2,
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
import { format } from 'date-fns';
import { MovieService } from '@/lib/movie-service';
import { EditGoalDialog } from '@/components/edit-goal-dialog';
import type { Movie, UserCollection } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getDominantColor, destroyColorSampler } from '@/lib/tmdb';
import { RatingProgressBar } from '@/components/rating-progress-bar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';


const CHART_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#22c55e', // green
  '#f97316', // orange
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#facc15', // yellow
  '#ec4899', // pink
];

const PALETTE_COLORS: Record<string, string> = {
    'Red': '#ef4444',
    'Orange': '#f97316',
    'Yellow': '#facc15',
    'Green': '#22c55e',
    'Cyan': '#06b6d4',
    'Blue': '#3b82f6',
    'Purple': '#8b5cf6',
    'Magenta': '#d946ef',
    'Pink': '#ec4899',
    'Black': '#1f2937',
    'White': '#f8fafc',
    'Gray': '#6b7280',
    'Dark Gray': '#4b5563',
    'Light Gray': '#d1d5db',
};

function formatDuration(minutes: number) {
    if (minutes === 0) return '0h 0m';
    const d = Math.floor(minutes / (24 * 60));
    const h = Math.floor((minutes % (24 * 60)) / 60);
    const m = Math.round(minutes % 60);

    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0 || (d === 0 && h === 0)) parts.push(`${m}m`);
    
    return parts.join(' ');
}

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}


const StatCard = ({ icon: Icon, title, value, description, children, className, onEdit }: { icon?: React.ElementType, title: string, value?: React.ReactNode, description?: string, children?: React.ReactNode, className?: string, onEdit?: () => void }) => (
    <div className={`bg-card rounded-lg border p-6 shadow-sm flex flex-col ${className || ''}`}>
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                 {Icon && <Icon className="h-6 w-6 text-muted-foreground" />}
                <div className="min-w-0">
                    <h3 className="text-sm font-medium">{title}</h3>
                    {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
                </div>
            </div>
            {onEdit && (
                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1" onClick={onEdit}><Edit className="h-4 w-4 text-muted-foreground" /></Button>
            )}
        </div>
        <div className="flex-grow min-h-0">
            {value !== undefined && <div className="text-3xl font-bold mb-2">{value}</div>}
            {children}
        </div>
    </div>
);

const LastWatchedCard = ({ movie }: { movie: Movie | null }) => (
    <div className="bg-card rounded-lg border p-6 shadow-sm h-full overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-muted-foreground" />
                <div>
                    <h3 className="text-sm font-medium">Last Watched</h3>
                    <p className="text-xs text-muted-foreground mt-1">From "Surprise Me"</p>
                </div>
            </div>
        </div>
        <div className="flex-grow flex items-center justify-center">
            {movie ? (
                <Link href={`/app/movie/${movie.id}`} className="flex items-center gap-4 group w-full">
                    <div className="w-16 h-24 bg-muted rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden">
                        <Image src={movie.posterUrl} alt={movie.title} width={64} height={96} className="object-cover w-full h-full transition-transform group-hover:scale-105" data-ai-hint="movie poster" />
                    </div>
                    <div className="flex-grow min-w-0">
                        <p className="font-bold line-clamp-2 group-hover:text-primary transition-colors" title={movie.title}>{movie.title}</p>
                        <p className="text-sm text-muted-foreground">{movie.releaseDate?.substring(0,4)}</p>
                    </div>
                </Link>
            ) : (
                <div className="text-muted-foreground text-sm">
                    No spin history yet.
                </div>
            )}
        </div>
    </div>
);

const CustomTooltipContent = ({ active, payload, label }: { active?: boolean, payload?: any[], label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-background/90 backdrop-blur-sm p-2.5 shadow-sm text-foreground">
                <div className="grid gap-1.5">
                    {label && <p className="font-medium">{label}</p>}
                    {payload.map((pld: any, index: number) => {
                        const name = pld.payload?.name || pld.name || pld.dataKey;
                        const value = pld.value;
                        const color = pld.payload?.fill || pld.color || pld.fill;
                        
                        if (!name) return null;

                        return (
                            <div key={index} className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                                <p className="text-muted-foreground">{name}:</p>
                                <p className="text-foreground">{value?.toLocaleString?.() || value}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    }
    return null;
};

export default function AnalyticsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('basic');
    const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
    
    const [allMovies, setAllMovies] = useState<Movie[]>([]);
    const [allCollections, setAllCollections] = useState<UserCollection[]>([]);
    const [watchGoal, setWatchGoal] = useState(200);
    const [lastSpunMovie, setLastSpunMovie] = useState<Movie | null>(null);

    const [isMounted, setIsMounted] = useState(false);
    const [colorAnalysisProgress, setColorAnalysisProgress] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [storageUsage, setStorageUsage] = React.useState<{ usage: number, quota: number } | null>(null);

    useEffect(() => {
        if (navigator.storage?.estimate) {
            navigator.storage.estimate().then(estimate => {
                setStorageUsage({
                    usage: estimate.usage ?? 0,
                    quota: estimate.quota ?? 1
                });
            });
        }
    }, []);

    useEffect(() => {
        setIsMounted(true);
        const loadData = async () => {
            const [moviesFromDb, goal, lastSpunId, collectionsFromDb] = await Promise.all([
                MovieService.getMovies(),
                MovieService.getSetting('watchGoal'),
                MovieService.getSetting('lastSpunMovieId'),
                MovieService.getCollections()
            ]);
            
            setAllMovies(moviesFromDb);
            setAllCollections(collectionsFromDb);
            if (goal) setWatchGoal(goal);
            if (lastSpunId) {
                const spunMovie = moviesFromDb.find(m => m.id === lastSpunId);
                setLastSpunMovie(spunMovie || null);
            }
        };
        loadData();
    }, []);

    const watchedMovies = useMemo(() => {
        return allMovies.filter(m => ['Watching', 'Completed'].includes(m.status));
    }, [allMovies]);

    useEffect(() => {
        const analyzeColors = async () => {
            const uncoloredMovies = watchedMovies.filter(m => !m.dominantColor);
            if (uncoloredMovies.length === 0) return;

            setIsAnalyzing(true);
            let processedCount = 0;

            for (const movie of uncoloredMovies) {
                try {
                    const dominantColor = await getDominantColor(movie.posterUrl);
                    await MovieService.updateMovie(movie.id, { dominantColor });

                    setAllMovies(prev =>
                        prev.map(m => (m.id === movie.id ? { ...m, dominantColor } : m))
                    );
                    
                    processedCount++;
                    setColorAnalysisProgress((processedCount / uncoloredMovies.length) * 100);

                } catch (error) {
                    console.error(`Failed to analyze color for ${movie.title}:`, error);
                }
            }
            setIsAnalyzing(false);
        };

        if (isMounted && watchedMovies.length > 0) {
            analyzeColors();
        }
        
        return () => {
            destroyColorSampler();
        }
    }, [watchedMovies, isMounted]);

    const data = useMemo(() => {
        const totalTitlesWatched = watchedMovies.length;
        const onWatchlistCount = allMovies.filter(m => m.status === 'Plan to Watch').length;
        const totalRewatches = allMovies.reduce((acc, m) => acc + (m.rewatchCount || 0), 0);
        
        const topGenres = watchedMovies.flatMap(m => m.tags)
            .reduce((acc, tag) => {
                acc[tag] = (acc[tag] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        const topActors = watchedMovies.flatMap(m => m.cast?.map(c => c.name) || [])
            .reduce((acc, name) => {
                acc[name] = (acc[name] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        const topDirectors = watchedMovies.map(m => m.director).filter(Boolean)
            .reduce((acc, name) => {
                acc[name!] = (acc[name!] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
        
        const topFranchises = watchedMovies.map(m => m.collection).filter(Boolean)
             .reduce((acc, name) => {
                acc[name!] = (acc[name!] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
        const posterPalette = watchedMovies
            .map(m => m.dominantColor)
            .filter(Boolean)
            .reduce((acc, color) => {
                acc[color!] = (acc[color!] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
        
        const totalMinutes = watchedMovies.reduce((acc, m) => {
            if (m.type === 'Movie' && m.runtime) {
                return acc + m.runtime;
            }
            if ((m.type === 'TV Show' || m.type === 'Anime') && m.watchedEpisodes > 0) {
                return acc + (m.runtime || 45) * m.watchedEpisodes;
            }
            return acc;
        }, 0);

        const totalEpisodesWatched = watchedMovies.reduce((acc, m) => {
            if (m.type !== 'Movie') {
                return acc + (m.watchedEpisodes || 0);
            }
            return acc;
        }, 0);

        const ratedMovies = watchedMovies.filter(m => typeof m.rating === 'number' && m.rating > 0);
        const averageRating = ratedMovies.length > 0
            ? ratedMovies.reduce((acc, m) => acc + m.rating, 0) / ratedMovies.length
            : 0;
            
        const topCollections = allCollections
            .map(c => ({
                id: c.id,
                name: c.name,
                count: c.movieIds.length
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 4);
        
        const seriesWithProgress = watchedMovies
            .filter(s => s.type !== 'Movie' && s.totalEpisodes > 0)
            .map(s => ({
                id: s.id,
                title: s.title,
                progress: (s.watchedEpisodes / s.totalEpisodes) * 100
            }))
            .sort((a, b) => b.progress - a.progress)
            .slice(0, 5);

        const rewatchRatio = totalTitlesWatched > 0 ? (totalRewatches / totalTitlesWatched) : 0;
        
        const decadeDistributionData = watchedMovies
            .filter(movie => movie.releaseDate && /^\d{4}/.test(movie.releaseDate))
            .reduce((acc, movie) => {
                const year = parseInt(movie.releaseDate!.substring(0, 4), 10);
                const decade = Math.floor(year / 10) * 10;
                const decadeLabel = `${decade}s`;
                
                acc[decadeLabel] = (acc[decadeLabel] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        const decadeDistribution = Object.entries(decadeDistributionData)
            .map(([decade, count]) => ({ decade, count }))
            .sort((a, b) => a.decade.localeCompare(b.decade));
            
        return {
            totalTitlesWatched,
            onWatchlistCount,
            totalRewatches,
            topGenres: Object.entries(topGenres).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([name, value], i) => ({ name, value, fill: CHART_COLORS[i % CHART_COLORS.length] })),
            topActors: Object.entries(topActors).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([name, value], i) => ({ name, value, fill: CHART_COLORS[i % CHART_COLORS.length] })),
            topDirectors: Object.entries(topDirectors).sort((a,b) => b[1] - a[1]).slice(0, 8).map(([label, count], i) => ({ label, count, fill: CHART_COLORS[i % CHART_COLORS.length] })).reverse(),
            topFranchises: Object.entries(topFranchises).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([name, value], i) => ({ name, value, fill: CHART_COLORS[i % CHART_COLORS.length] })),
            posterPaletteData: Object.entries(posterPalette).map(([name, size]) => ({ name, size, fill: PALETTE_COLORS[name] || '#6b7280' })),
            totalTimeWatched: formatDuration(totalMinutes),
            totalEpisodesWatched,
            averageRating: Math.round(averageRating),
            topCollections,
            seriesCompletion: seriesWithProgress,
            rewatchRatio: rewatchRatio.toFixed(2),
            decadeDistribution,
        };
    }, [allMovies, watchedMovies, allCollections]);
    
    const goalProgress = watchGoal > 0 ? (data.totalTitlesWatched / watchGoal) * 100 : 0;
    
    const chartGrids = (
         <>
            {activeTab === 'basic' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={Film} title="Titles Watched" value={data.totalTitlesWatched} description="Movies & series completed" />
                    <StatCard icon={Clock} title="Total Time Watched" value={data.totalTimeWatched} description="Calculated from runtime"/>
                    <StatCard icon={Tv} title="Episodes Watched" value={data.totalEpisodesWatched.toLocaleString()} description="Across all series"/>
                    <StatCard icon={Bookmark} title="On Watchlist" value={data.onWatchlistCount} description="Titles you plan to watch"/>
                    
                    <StatCard title="2025 Watch Goal" description="Progress on your annual goal" onEdit={() => setIsGoalDialogOpen(true)} className="lg:col-span-2 row-span-2">
                        <div className="w-full h-full relative min-h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <defs>
                                        <linearGradient id="goalGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <Pie
                                        data={[{ name: 'Total', value: 100 }]}
                                        dataKey="value"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={80}
                                        fill="hsl(var(--muted))"
                                        startAngle={90}
                                        endAngle={450}
                                        stroke="none"
                                    />
                                    <Pie
                                        data={[{ name: 'Progress', value: Math.min(goalProgress, 100) }]}
                                        dataKey="value"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={80}
                                        fill="url(#goalGradient)"
                                        startAngle={90}
                                        endAngle={90 + (goalProgress / 100) * 360}
                                        stroke="none"
                                        cornerRadius={5}
                                    />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold">{data.totalTitlesWatched}</span>
                                <span className="text-sm text-muted-foreground">/ {watchGoal} titles</span>
                            </div>
                        </div>
                    </StatCard>

                    <StatCard icon={PieChart} title="Top Genres" description="Your most-watched genres" className="lg:col-span-2 row-span-2">
                        <div className="w-full h-full min-h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie 
                                        data={data.topGenres} 
                                        dataKey="value" 
                                        nameKey="name" 
                                        cx="40%" 
                                        cy="50%" 
                                        innerRadius={50} 
                                        outerRadius={80} 
                                        paddingAngle={2}
                                        fill="#8884d8"
                                    >
                                        {data.topGenres.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltipContent />} />
                                    <Legend 
                                        layout="vertical" 
                                        verticalAlign="middle" 
                                        align="right" 
                                        iconSize={8}
                                        wrapperStyle={{
                                            fontSize: "12px", 
                                            lineHeight: "1.5", 
                                            paddingLeft: '10px', 
                                            width: 110,
                                        }} 
                                    />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                    </StatCard>

                     <StatCard icon={Layers} title="Top Collections" description="Your biggest vaults & spotlights" className="lg:col-span-2 row-span-2">
                        {data.topCollections.length > 0 ? (
                            <ul className="space-y-3 h-full flex flex-col justify-around py-2">
                                {data.topCollections.map(c => (
                                    <li key={c.id} className="flex items-center justify-between text-sm">
                                        <span className="font-semibold truncate pr-2">{c.name}</span>
                                        <Badge variant="secondary">{c.count} items</Badge>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                               No collection data yet.
                            </div>
                        )}
                    </StatCard>

                    <LastWatchedCard movie={lastSpunMovie} />
                    <StatCard icon={Star} title="Average Rating" description="Across all rated titles">
                         <RatingProgressBar percentage={data.averageRating} />
                    </StatCard>
                    <StatCard icon={Repeat} title="Total Rewatches" value={data.totalRewatches} description="Sum of all rewatch counts" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={History} title="Decade Distribution" description="Release decades of your watched titles" className="lg:col-span-4">
                        {data.decadeDistribution.length > 1 ? (
                            <div className="w-full h-64 -ml-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.decadeDistribution} margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="timelineGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                                        <XAxis dataKey="decade" fontSize={11} tickLine={false} axisLine={false} tickMargin={8}/>
                                        <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} width={25} />
                                        <Tooltip content={<CustomTooltipContent />} />
                                        <Area type="monotone" dataKey="count" name="Titles" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#timelineGradient)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm py-16">
                               Not enough data for a timeline. Watch more movies from different decades.
                            </div>
                        )}
                    </StatCard>

                    <StatCard icon={Video} title="Most Watched Directors" description="Directors who appear most often" className="lg:col-span-4">
                        <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.topDirectors} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                                    <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
                                    <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} tickMargin={5} width={100} fontSize={11} />
                                    <Tooltip content={<CustomTooltipContent />} />
                                    <Bar dataKey="count" radius={4} barSize={16}>
                                        {data.topDirectors.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </StatCard>

                    <StatCard icon={ListChecks} title="Series Completion" description="Progress for your most-watched series" className="lg:col-span-2 row-span-2">
                        {data.seriesCompletion.length > 0 ? (
                            <div className="space-y-4 pt-2">
                                {data.seriesCompletion.map(s => (
                                    <div key={s.id}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <p className="text-sm font-medium truncate">{s.title}</p>
                                            <p className="text-xs text-muted-foreground">{Math.round(s.progress)}%</p>
                                        </div>
                                        <Progress value={s.progress} className="h-2" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                               No series data yet.
                            </div>
                        )}
                    </StatCard>

                    <StatCard icon={Users} title="Most Watched Actors" description="Actors appearing most in your collection" className="lg:col-span-2">
                         <div className="w-full h-full min-h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie 
                                        data={data.topActors} 
                                        dataKey="value" 
                                        nameKey="name" 
                                        cx="40%" 
                                        cy="50%" 
                                        innerRadius={60} 
                                        outerRadius={90} 
                                        paddingAngle={5}
                                        fill="#8884d8"
                                    >
                                        {data.topActors.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltipContent />} />
                                    <Legend 
                                        layout="vertical" 
                                        verticalAlign="middle" 
                                        align="right" 
                                        iconSize={8}
                                        wrapperStyle={{
                                            fontSize: "12px", 
                                            lineHeight: "1.5", 
                                            paddingLeft: '10px', 
                                            width: 110,
                                        }} 
                                    />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                    </StatCard>

                    <StatCard icon={Layers} title="Top Franchises" description="Your most-watched movie franchises" className="lg:col-span-2">
                        <div className="w-full h-full min-h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie 
                                        data={data.topFranchises} 
                                        dataKey="value" 
                                        nameKey="name" 
                                        cx="40%" 
                                        cy="50%" 
                                        outerRadius={80}
                                        fill="#8884d8"
                                    >
                                        {data.topFranchises.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltipContent />} />
                                    <Legend 
                                        layout="vertical" 
                                        verticalAlign="middle" 
                                        align="right" 
                                        iconSize={8}
                                        wrapperStyle={{
                                            fontSize: "12px", 
                                            lineHeight: "1.5", 
                                            paddingLeft: '10px', 
                                            width: 110,
                                        }} 
                                    />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                    </StatCard>

                    <StatCard icon={Zap} title="Rewatch Ratio" value={data.rewatchRatio} description="Rewatches per unique title watched" />
                    
                    <StatCard icon={Database} title="Storage Usage" description="Local IndexedDB usage" className="lg:col-span-2">
                        {storageUsage ? (
                            <div className="flex flex-col h-full justify-center">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-2xl font-bold">{formatBytes(storageUsage.usage)}</span>
                                    <span className="text-sm text-muted-foreground">of {formatBytes(storageUsage.quota)}</span>
                                </div>
                                <Progress value={(storageUsage.usage / storageUsage.quota) * 100} className="mt-2" />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                Storage API not supported.
                            </div>
                        )}
                    </StatCard>

                    <StatCard icon={Moon} title="Night Owl Score" description="This requires tracking watch times, which isn't logged yet." className="lg:col-span-2">
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                           Feature coming soon.
                        </div>
                    </StatCard>

                    <StatCard icon={Palette} title="Poster Palette" description="A mosaic of your collection's dominant colors" className="lg:col-span-2 row-span-2">
                        <div className="relative w-full h-full min-h-[200px]">
                          {isAnalyzing && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10 rounded-b-lg">
                              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                              <p className="text-sm font-semibold">Analyzing Colors...</p>
                              <p className="text-xs text-muted-foreground">{Math.round(colorAnalysisProgress)}%</p>
                            </div>
                          )}
                          {!isAnalyzing && data.posterPaletteData.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                               <CircleDashed className="w-8 h-8 text-muted-foreground mb-2"/>
                               <p className="text-sm font-semibold">Not enough data</p>
                               <p className="text-xs text-muted-foreground">Watch more titles to see your color palette.</p>
                            </div>
                           )}
                           <ResponsiveContainer width="100%" height="100%">
                                <Treemap
                                    data={data.posterPaletteData}
                                    dataKey="size"
                                    aspectRatio={4 / 3}
                                    stroke="hsl(var(--card))"
                                    strokeWidth={2}
                                >
                                    <Tooltip content={<CustomTooltipContent />} />
                                </Treemap>
                            </ResponsiveContainer>
                        </div>
                    </StatCard>
                </div>
            )}
        </>
    );

    return (
        <div className="bg-background min-h-screen">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-2 mb-8">
                     <Button variant="ghost" onClick={() => router.push('/app/dashboard')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Button>
                </div>
                <div className="flex flex-col xl:flex-row items-baseline justify-between gap-4 border-b border-border pb-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Your Watchverse</h1>
                        <p className="mt-2 text-lg text-muted-foreground">A deep dive into your cinematic universe.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            onClick={() => setActiveTab('basic')} 
                            variant={activeTab === 'basic' ? 'default' : 'outline'}
                        >
                            Basic Stats
                        </Button>
                        <Button 
                            onClick={() => setActiveTab('geek')} 
                            variant={activeTab === 'geek' ? 'default' : 'outline'}
                        >
                            Geek Out
                        </Button>
                    </div>
                </div>

                <div key={isMounted ? 'mounted' : 'initial'}>
                    {chartGrids}
                </div>
            </div>
             <EditGoalDialog 
                isOpen={isGoalDialogOpen}
                setIsOpen={setIsGoalDialogOpen}
                currentGoal={watchGoal}
                onGoalSet={setWatchGoal}
            />
        </div>
    );
}
