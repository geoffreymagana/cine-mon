
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
    ArrowLeft, 
    Download, 
    Film, 
    Users, 
    FileText, 
    Repeat, 
    Tv,
    Star,
    Calendar,
    Clapperboard,
    Info
} from 'lucide-react';

import type { Movie } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RatingCircle } from '@/components/rating-circle';
import { Skeleton } from '@/components/ui/skeleton';

export default function MovieDetailPage() {
    const params = useParams();
    const movieId = params.id as string;
    const [movie, setMovie] = React.useState<Movie | null | undefined>(undefined);

    React.useEffect(() => {
        if (movieId) {
            try {
                const storedMovies = localStorage.getItem('movies');
                if (storedMovies) {
                    const movies: Movie[] = JSON.parse(storedMovies);
                    const foundMovie = movies.find((m) => m.id === movieId);
                    setMovie(foundMovie || null);
                } else {
                    setMovie(null);
                }
            } catch (error) {
                console.error("Failed to access localStorage:", error);
                setMovie(null);
            }
        }
    }, [movieId]);

    if (movie === undefined) {
        return (
            <div className="bg-background min-h-screen p-8">
                <Skeleton className="h-8 w-48 mb-12" />
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
                    <aside className="md:col-span-4 lg:col-span-3">
                        <Skeleton className="w-full aspect-[2/3] rounded-lg" />
                    </aside>
                    <div className="md:col-span-8 lg:col-span-9 space-y-4">
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                </div>
            </div>
        );
    }
    
    if (!movie) {
        return notFound();
    }

    const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
        <div className="flex items-start gap-3">
            <Icon className="w-5 h-5 text-muted-foreground mt-1" />
            <div>
                <p className="font-semibold">{label}</p>
                <div className="text-muted-foreground">{value}</div>
            </div>
        </div>
    );

    return (
        <div className="bg-background min-h-screen">
            {/* Backdrop */}
            <div className="relative h-48 md:h-64 lg:h-80 w-full">
                <Image
                    src={movie.backdropUrl || movie.posterUrl}
                    alt={`${movie.title} backdrop`}
                    layout="fill"
                    objectFit="cover"
                    className="blur-md opacity-20"
                    data-ai-hint="movie background"
                    unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 -mt-24 md:-mt-32 relative z-10">
                <div className="mb-8">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4"/>
                        <span>Back to Collection</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left Sidebar */}
                    <aside className="md:col-span-4 lg:col-span-3 space-y-6">
                        <Card className="overflow-hidden shadow-lg">
                            <Image
                                src={movie.posterUrl}
                                alt={`Poster for ${movie.title}`}
                                width={500}
                                height={750}
                                className="w-full object-cover"
                                data-ai-hint="movie poster"
                            />
                        </Card>
                         {movie.scriptUrl && (
                            <a href={movie.scriptUrl} download target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" className="w-full">
                                    <Download className="mr-2"/>
                                    Download Script
                                </Button>
                            </a>
                        )}
                    </aside>

                    {/* Main Content */}
                    <div className="md:col-span-8 lg:col-span-9">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-4xl lg:text-5xl font-bold font-headline mb-2">{movie.title}</h1>
                            <div className="flex flex-wrap gap-2">
                                {movie.tags.map(tag => (
                                    <Badge key={tag} variant="secondary">{tag}</Badge>
                                ))}
                            </div>
                        </div>

                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="mb-4">
                                <TabsTrigger value="details"><Info className="mr-2" />Details</TabsTrigger>
                                {movie.cast && movie.cast.length > 0 && <TabsTrigger value="cast"><Users className="mr-2" />Cast & Crew</TabsTrigger>}
                                {movie.alternatePosters && movie.alternatePosters.length > 0 && <TabsTrigger value="media"><Clapperboard className="mr-2" />Media</TabsTrigger>}
                            </TabsList>
                            
                            <TabsContent value="details">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Synopsis</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground max-w-prose">{movie.description}</p>
                                        <hr className="my-6 border-border" />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <DetailItem icon={Star} label="Rating">
                                                <div className="flex items-center gap-2">
                                                    <RatingCircle percentage={movie.rating} />
                                                    <span className="font-bold text-lg text-foreground">{movie.rating}%</span>
                                                </div>
                                            </DetailItem>
                                            <DetailItem icon={Calendar} label="Release Date" value={movie.releaseDate} />
                                            <DetailItem icon={movie.type === "Movie" ? Film : Tv} label="Type" value={movie.type} />
                                            {movie.director && <DetailItem icon={Users} label="Director" value={movie.director} />}
                                            <DetailItem icon={Repeat} label="Rewatched" value={`${movie.rewatchCount || 0} times`} />
                                            {movie.type !== 'Movie' && (
                                                <DetailItem icon={Tv} label="Progress" value={`${movie.watchedEpisodes} / ${movie.totalEpisodes} episodes`} />
                                            )}
                                            {movie.collection && <DetailItem icon={FileText} label="Collection" value={movie.collection} />}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="cast">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Cast</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {movie.cast?.map(person => (
                                            <div key={person.name} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50">
                                                <Avatar>
                                                    <AvatarImage src={person.avatarUrl} alt={person.name} data-ai-hint="person portrait" />
                                                    <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{person.name}</p>
                                                    <p className="text-sm text-muted-foreground">{person.character}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="media">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Alternate Posters</CardTitle>
                                        <CardDescription>Other posters for this title.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {movie.alternatePosters?.map((poster, index) => (
                                                <Image
                                                    key={index}
                                                    src={poster}
                                                    alt={`Alternate poster ${index + 1}`}
                                                    width={200}
                                                    height={300}
                                                    className="rounded-md object-cover w-full aspect-[2/3] hover:scale-105 transition-transform"
                                                    data-ai-hint="movie poster"
                                                />
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    );
}
