
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ArrowLeft, Clock, Film, Flame, Medal, Tv, Video } from 'lucide-react';

import { initialMovies } from '@/lib/data';
import type { Movie } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

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
    movies: { label: "Movies", color: "hsl(var(--chart-1))" },
    series: { label: "Series", color: "hsl(var(--chart-2))" },
};

export default function AnalyticsPage() {
    const totalWatched = initialMovies.length;

    const totalHoursWatched = React.useMemo(() => {
        return initialMovies.reduce((acc, movie) => {
            const duration = movie.type === 'Movie' ? 120 : movie.watchedEpisodes * 24; // Assumption: 2hr movie, 24min episode
            return acc + duration;
        }, 0) / 60;
    }, []);

    const { favoriteGenre, typeCounts } = React.useMemo(() => {
        const tagCounts = initialMovies.flatMap(movie => movie.tags).reduce((acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const favGenre = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        const tCounts = initialMovies.reduce((acc, movie) => {
            acc[movie.type] = (acc[movie.type] || 0) + 1;
            return acc;
        }, {} as Record<Movie['type'], number>);
        
        return { favoriteGenre: favGenre, typeCounts: tCounts };
    }, []);

    const mostWatchedType = React.useMemo(() => {
        return Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
    }, [typeCounts]);

    return (
        <div className="flex min-h-screen flex-col bg-background p-4 sm:p-8">
            <div className="w-full max-w-7xl mx-auto">
                 <Link href="/profile" className="inline-flex items-center gap-2 mb-8 font-semibold text-lg hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5"/>
                    <span>Back to Profile</span>
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
                        <CardContent className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Film className="h-5 w-5 text-primary" />
                                    <span className="font-medium">Movies</span>
                                </div>
                                <span className="font-bold">{typeCounts['Movie'] || 0}</span>
                            </div>
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Tv className="h-5 w-5 text-primary" />
                                    <span className="font-medium">TV Shows</span>
                                </div>
                                <span className="font-bold">{typeCounts['TV Show'] || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Flame className="h-5 w-5 text-primary" />
                                    <span className="font-medium">Anime</span>
                                </div>
                                <span className="font-bold">{typeCounts['Anime'] || 0}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
