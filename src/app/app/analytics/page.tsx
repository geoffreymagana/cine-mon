
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
import { MovieService } from '@/lib/movie-service';
import { EditGoalDialog } from '@/components/edit-goal-dialog';
import type { Movie } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getDominantColor, destroyColorSampler } from '@/lib/tmdb';


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

const StatCard = ({ icon: Icon, title, value, description, children, className, onEdit }) => (
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

const LastWatchedCard = ({ movie }) => (
    <div className="bg-card rounded-lg border p-6 shadow-sm h-full overflow-hidden">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-muted-foreground" />
                <div>
                    <h3 className="text-sm font-medium">Last Watched</h3>
                    <p className="text-xs text-muted-foreground mt-1">From "Surprise Me"</p>
                </div>
            </div>
        </div>
        {movie ? (
             <div className="flex items-center gap-4 group cursor-pointer h-full">
                <div className="w-16 h-24 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                    <Image src={movie.posterUrl} alt={movie.title} width={64} height={96} className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                </div>
                <div className="flex-grow min-w-0">
                    <p className="font-bold truncate group-hover:text-primary transition-colors">{movie.title}</p>
                    <p className="text-sm text-muted-foreground">{movie.releaseDate?.substring(0,4)}</p>
                </div>
            </div>
        ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No spin history yet.
            </div>
        )}
    </div>
);

const CustomTooltipContent = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-background/90 backdrop-blur-sm p-2.5 shadow-sm text-foreground">
                <div className="grid gap-1.5">
                    {label && <p className="font-medium">{label}</p>}
                    {payload.map((pld, index) => {
                        const name = pld.payload?.name || pld.name || pld.dataKey;
                        const value = pld.value;
                        const color = pld.payload?.fill || pld.color || pld.fill;
                        
                        if (!name) return null;

                        return (
                            <div key={index} className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                                <p className="text-muted-foreground">{name}:</p>
                                <p className="font-semibold">{value?.toLocaleString?.() || value}</p>
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
    const [watchGoal, setWatchGoal] = useState(200);
    const [lastSpunMovie, setLastSpunMovie] = useState<Movie | null>(null);

    const [isMounted, setIsMounted] = useState(false);
    const [colorAnalysisProgress, setColorAnalysisProgress] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const loadData = async () => {
            const [moviesFromDb, goal, lastSpunId] = await Promise.all([
                MovieService.getMovies(),
                MovieService.getSetting('watchGoal'),
                MovieService.getSetting('lastSpunMovieId')
            ]);
            
            setAllMovies(moviesFromDb);
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

        if (watchedMovies.length > 0) {
            analyzeColors();
        }
        
        return () => {
            destroyColorSampler();
        }
    }, [watchedMovies]);

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
            
        return {
            totalTitlesWatched,
            onWatchlistCount,
            totalRewatches,
            topGenres: Object.entries(topGenres).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([name, value], i) => ({ name, value, fill: CHART_COLORS[i % CHART_COLORS.length] })),
            topActors: Object.entries(topActors).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([name, value], i) => ({ name, value, fill: CHART_COLORS[i % CHART_COLORS.length] })),
            topDirectors: Object.entries(topDirectors).sort((a,b) => b[1] - a[1]).slice(0, 8).map(([label, count], i) => ({ label, count, fill: CHART_COLORS[i % CHART_COLORS.length] })).reverse(),
            topFranchises: Object.entries(topFranchises).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([name, value], i) => ({ name, value, fill: CHART_COLORS[i % CHART_COLORS.length] })),
            posterPaletteData: Object.entries(posterPalette).map(([name, size]) => ({ name, size, fill: PALETTE_COLORS[name] || '#6b7280' })),
        };
    }, [allMovies, watchedMovies]);
    
    const goalProgress = watchGoal > 0 ? (data.totalTitlesWatched / watchGoal) * 100 : 0;
    
    const chartGrids = (
         <>
            {activeTab === 'basic' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={Film} title="Titles Watched" value={data.totalTitlesWatched} description="Movies & series completed" />
                    <StatCard icon={Clock} title="Total Time Watched" value={'N/A'} description="Coming Soon"/>
                    <StatCard icon={Tv} title="Episodes Watched" value={'N/A'} description="Coming Soon"/>
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

                     <StatCard icon={Sparkles} title="Curated Collections" description="Coming Soon" className="lg:col-span-2 row-span-2">
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                           No collection data yet.
                        </div>
                    </StatCard>

                    <LastWatchedCard movie={lastSpunMovie} />
                    <StatCard icon={Star} title="Average Rating" value={'N/A'} description="Coming Soon" />
                    <StatCard icon={Repeat} title="Total Rewatches" value={data.totalRewatches} description="Sum of all rewatch counts" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={History} title="Collection Timeline" description="Coming Soon" className="lg:col-span-4">
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                           No timeline data yet.
                        </div>
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

                    <StatCard icon={ListChecks} title="Series Completion" description="Coming Soon" className="lg:col-span-2 row-span-2">
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                           No series data yet.
                        </div>
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

                    <StatCard icon={Zap} title="Rewatch Ratio" value={'N/A'} description="Coming Soon" />
                    <StatCard icon={Database} title="Storage Usage" value={'N/A'} description="Coming Soon" />

                    <StatCard icon={Moon} title="Night Owl Score" description="Coming Soon" className="lg:col-span-2">
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                           No activity data yet.
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
                                    ratio={4 / 3}
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
