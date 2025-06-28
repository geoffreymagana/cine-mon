
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, Clock, Film, Flame, Medal, Tv, Video } from 'lucide-react';

import type { Movie } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

// Mock data for charts as the real data lacks timestamps
const monthlyWatchData = [
  { month: "Jan", movies: 4, series: 2 },
  { month: "Feb", movies: 3, series: 5 },
  { month: "Mar", movies: 6, series: 3 },
  { month: "Apr", movies: 2, series: 4 },
  { month: "May", movies: 5, series: 1 },
  { month: "Jun", movies: 4, series: 3 },
];

const chartConfig = {
    movies: { label: "Movies", color: "hsl(var(--chart-2))" },
    series: { label: "Series", color: "hsl(var(--primary))" },
    "Movie": { label: "Movies", color: "hsl(var(--chart-2))" },
    "TV Show": { label: "TV Shows", color: "hsl(var(--primary))" },
    "Anime": { label: "Anime", color: "hsl(var(--chart-3))" },
};

export default function AnalyticsPage() {
    const [movies, setMovies] = React.useState<Movie[]>([]);

    React.useEffect(() => {
        try {
            const storedMovies = localStorage.getItem('movies');
            if (storedMovies) {
                setMovies(JSON.parse(storedMovies));
            }
        } catch (error) {
            console.error("Failed to access localStorage:", error);
        }
    }, []);

    const totalWatched = movies.length;

    const totalHoursWatched = React.useMemo(() => {
        return movies.reduce((acc, movie) => {
            const duration = movie.type === 'Movie' ? 120 : movie.watchedEpisodes * 24; // Assumption: 2hr movie, 24min episode
            return acc + duration;
        }, 0) / 60;
    }, [movies]);

    const { favoriteGenre, typeCounts } = React.useMemo(() => {
        if (movies.length === 0) return { favoriteGenre: "N/A", typeCounts: {} };

        const tagCounts = movies.flatMap(movie => movie.tags).reduce((acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const favGenre = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        const tCounts = movies.reduce((acc, movie) => {
            acc[movie.type] = (acc[movie.type] || 0) + 1;
            return acc;
        }, {} as Record<Movie['type'], number>);
        
        return { favoriteGenre: favGenre, typeCounts: tCounts };
    }, [movies]);

    const pieData = React.useMemo(() => {
        return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
    }, [typeCounts]);

    const mostWatchedType = React.useMemo(() => {
        if (Object.keys(typeCounts).length === 0) return "N/A";
        return Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
    }, [typeCounts]);

    return (
        <div className="flex min-h-screen flex-col bg-background p-4 sm:p-8">
            <div className="w-full max-w-7xl mx-auto">
                 <Link href="/dashboard" className="inline-flex items-center gap-2 mb-8 font-semibold text-lg hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5"/>
                    <span>Back to Dashboard</span>
                </Link>

                <div className="text-left mb-12">
                    <h1 className="text-5xl font-bold font-headline">Analytics & Insights</h1>
                    <p className="text-muted-foreground mt-2">A summary of your watching habits and collection.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Watched</CardTitle>
                            <Video className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalWatched}</div>
                            <p className="text-xs text-muted-foreground">items in your collection</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Hours Watched</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Math.round(totalHoursWatched)}</div>
                            <p className="text-xs text-muted-foreground">across all media (est.)</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Favorite Genre</CardTitle>
                            <Flame className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{favoriteGenre}</div>
                            <p className="text-xs text-muted-foreground">most frequent tag</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Most Watched Type</CardTitle>
                            <Medal className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{mostWatchedType}</div>
                            <p className="text-xs text-muted-foreground">based on your entries</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Watch Timeline Chart */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Watch Timeline</CardTitle>
                            <CardDescription>Number of titles watched per month (sample data).</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                             <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                <ResponsiveContainer>
                                    <BarChart data={monthlyWatchData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                                        <YAxis tickLine={false} axisLine={false} />
                                        <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                        <Bar dataKey="movies" fill="var(--color-movies)" radius={4} />
                                        <Bar dataKey="series" fill="var(--color-series)" radius={4} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                    
                    {/* Breakdown by Category */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Breakdown by Type</CardTitle>
                            <CardDescription>How your collection is categorized.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center pt-4">
                            {pieData.length > 0 ? (
                                <ChartContainer
                                    config={chartConfig}
                                    className="mx-auto aspect-square h-[250px]"
                                >
                                    <PieChart>
                                        <Tooltip
                                            cursor={false}
                                            content={<ChartTooltipContent indicator="dot" />}
                                        />
                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={60}
                                            strokeWidth={5}
                                        >
                                            {pieData.map((entry) => (
                                                <Cell key={entry.name} fill={`var(--color-${entry.name})`} className="stroke-background"/>
                                            ))}
                                        </Pie>
                                        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                                    </PieChart>
                                </ChartContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                                    <p>No data to display.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
