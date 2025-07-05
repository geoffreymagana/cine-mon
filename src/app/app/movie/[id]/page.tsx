
'use client';

import * as React from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
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
    Info,
    ChevronRight,
    DollarSign,
    TrendingUp,
    Clock,
    Globe,
    CircleCheck,
    PauseCircle,
    CircleOff,
    Bookmark,
    ChevronDown,
    Play,
    Edit,
    MoreVertical,
    Lock,
    Projector,
    Trash2,
    Check,
    PlusCircle
} from 'lucide-react';
import { format } from 'date-fns';

import type { Movie, UserCollection } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingProgressBar } from '@/components/rating-progress-bar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { AmbientPlayer } from '@/components/ambient-player';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CreateCollectionDialog } from '@/components/create-collection-dialog';
import { MovieService } from '@/lib/movie-service';


const statusOptions = [
    { value: 'Watching' as const, label: 'Watching', icon: Clock, className: 'text-chart-1' },
    { value: 'Completed' as const, label: 'Completed', icon: CircleCheck, className: 'text-chart-2' },
    { value: 'On-Hold' as const, label: 'On Hold', icon: PauseCircle, className: 'text-chart-3' },
    { value: 'Dropped' as const, label: 'Dropped', icon: CircleOff, className: 'text-destructive' },
    { value: 'Plan to Watch' as const, label: 'Plan to Watch', icon: Bookmark, className: 'text-muted-foreground' },
];

export default function MovieDetailPage() {
    const params = useParams();
    const movieId = params.id as string;
    const router = useRouter();
    const [movie, setMovie] = React.useState<Movie | null | undefined>(undefined);
    const [allMovies, setAllMovies] = React.useState<Movie[]>([]);
    const [allCollections, setAllCollections] = React.useState<UserCollection[]>([]);
    const [isCollectionDialogOpen, setIsCollectionDialogOpen] = React.useState(false);
    const [isCreateCollectionDialogOpen, setIsCreateCollectionDialogOpen] = React.useState(false);
    const [createCollectionType, setCreateCollectionType] = React.useState<'Vault' | 'Spotlight'>('Vault');
    const [isTrailerOpen, setIsTrailerOpen] = React.useState(false);
    const [collectionMovies, setCollectionMovies] = React.useState<Movie[]>([]);
    const { toast } = useToast();

    const loadData = React.useCallback(async () => {
        if (!movieId) return;
        try {
            const [foundMovie, movies, collections] = await Promise.all([
                MovieService.getMovie(movieId),
                MovieService.getMovies(),
                MovieService.getCollections()
            ]);
            setMovie(foundMovie || null);
            setAllMovies(movies);
            setAllCollections(collections);
        } catch (error) {
            console.error("Failed to load data from DB:", error);
            setMovie(null);
        }
    }, [movieId]);

    React.useEffect(() => {
        loadData();
    }, [loadData]);
    
    const updateMovieData = async (updatedMovie: Movie) => {
        setMovie(updatedMovie);
        await MovieService.updateMovie(movieId, updatedMovie);
        setAllMovies(allMovies.map(m => m.id === movieId ? updatedMovie : m));
    };

    const handleEpisodeToggle = (seasonNumber: number, episodeNumber: number, watched: boolean) => {
        if (!movie || !movie.seasons) return;

        const newSeasons = movie.seasons.map(season => {
            if (season.seasonNumber === seasonNumber) {
                const newEpisodes = season.episodes.map(episode => {
                    if (episode.episodeNumber === episodeNumber) {
                        return { ...episode, watched };
                    }
                    return episode;
                });
                return { ...season, episodes: newEpisodes };
            }
            return season;
        });

        const newWatchedEpisodes = newSeasons.flatMap(s => s.episodes).filter(e => e.watched).length;
        let newStatus = movie.status;

        if (watched && newStatus === 'Plan to Watch') {
            newStatus = 'Watching';
        }
        if (newWatchedEpisodes === movie.totalEpisodes) {
            newStatus = 'Completed';
        }

        const updatedMovie = {
            ...movie,
            seasons: newSeasons,
            watchedEpisodes: newWatchedEpisodes,
            status: newStatus,
        };
        
        updateMovieData(updatedMovie);
    };

    const handleSeasonToggle = (seasonNumber: number) => {
        if (!movie || !movie.seasons) return;

        const targetSeason = movie.seasons.find(s => s.seasonNumber === seasonNumber);
        if (!targetSeason) return;
        
        const allCurrentlyWatched = targetSeason.episodes.every(e => e.watched);
        const newWatchedState = !allCurrentlyWatched;

        const newSeasons = movie.seasons.map(season => {
            if (season.seasonNumber === seasonNumber) {
                const newEpisodes = season.episodes.map(episode => ({ ...episode, watched: newWatchedState }));
                return { ...season, episodes: newEpisodes };
            }
            return season;
        });

        const newWatchedEpisodes = newSeasons.flatMap(s => s.episodes).filter(e => e.watched).length;
        let newStatus = movie.status;

        if (newWatchedState && newStatus === 'Plan to Watch') {
            newStatus = 'Watching';
        }
        if (newWatchedEpisodes === movie.totalEpisodes) {
            newStatus = 'Completed';
        }

        const updatedMovie = {
            ...movie,
            seasons: newSeasons,
            watchedEpisodes: newWatchedEpisodes,
            status: newStatus,
        };
        
        updateMovieData(updatedMovie);
        toast({
            title: `Season ${seasonNumber} Updated`,
            description: `All episodes marked as ${newWatchedState ? 'watched' : 'unwatched'}.`
        });
    };

    const handleCollectionClick = (collectionName: string) => {
        const moviesInCollection = allMovies.filter(
            (m) => m.collection === collectionName && m.id !== movie?.id
        );
        setCollectionMovies(moviesInCollection);
        setIsCollectionDialogOpen(true);
    };

    const handleStatusChange = (newStatus: Movie['status']) => {
        if (!movie) return;
        
        const isSeries = movie.type !== 'Movie';
        let updatedMovie: Movie = { ...movie, status: newStatus };

        if (newStatus === 'Completed' && isSeries && movie.seasons) {
            const allWatchedSeasons = movie.seasons.map(season => ({
                ...season,
                episodes: season.episodes.map(ep => ({ ...ep, watched: true }))
            }));
            updatedMovie = {
                ...updatedMovie,
                seasons: allWatchedSeasons,
                watchedEpisodes: movie.totalEpisodes,
            };
            toast({
                title: "All Episodes Marked as Watched",
                description: `Since the series is completed, all episodes have been updated.`,
            });
        }
        
        updateMovieData(updatedMovie);
        toast({
            title: "Status Updated",
            description: `"${movie.title}" is now marked as "${newStatus}".`,
        });
    };
    
    const handleDeleteMovie = async () => {
        if (!movie) return;

        await MovieService.deleteMovie(movie.id);

        toast({
            title: "Movie Deleted",
            description: `"${movie.title}" has been permanently deleted.`,
            variant: "destructive"
        });
        
        router.push('/app/dashboard');
    };

    const handleAddToCollection = async (collectionId: string) => {
        if (!movie) return;

        const targetCollection = allCollections.find(c => c.id === collectionId);
        if (!targetCollection) return;
        
        if (targetCollection.movieIds.includes(movie.id)) {
            toast({ title: "Already in Collection", description: `This title is already in "${targetCollection.name}".` });
            return;
        }

        targetCollection.movieIds.push(movie.id);
        await MovieService.updateCollection(collectionId, { movieIds: targetCollection.movieIds });
        setAllCollections([...allCollections]);
        toast({ title: "Success!", description: `Added to "${targetCollection.name}".` });
    };

    const handleCollectionCreated = (newCollection: UserCollection) => {
        if (!movie) return;
        setAllCollections(prev => [...prev, newCollection]);
        toast({
            title: "Collection Created",
            description: `"${movie.title}" has been added to your new ${newCollection.type.toLowerCase()} "${newCollection.name}".`,
        });
    };

    const formattedReleaseDate = React.useMemo(() => {
        if (!movie?.releaseDate) return 'N/A';
        try {
            // Appending T00:00:00 ensures the date is parsed in local time, avoiding timezone-related off-by-one errors.
            return format(new Date(`${movie.releaseDate}T00:00:00`), 'MMM d, yyyy');
        } catch (e) {
            return movie.releaseDate;
        }
    }, [movie?.releaseDate]);

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
    
    const currentStatusInfo = statusOptions.find(opt => opt.value === movie.status);
    const vaults = allCollections.filter(c => c.type === 'Vault');
    const spotlights = allCollections.filter(c => c.type === 'Spotlight');
    const isSeries = movie.type !== 'Movie';

    const moreOptionsMenuContent = (
      <DropdownMenuContent align="end">
          <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                  <Lock className="mr-2 h-4 w-4" />
                  <span>Add to Vault</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                      {vaults.length > 0 && (
                        <>
                          {vaults.map(vault => (
                              <DropdownMenuItem
                                  key={vault.id}
                                  disabled={vault.movieIds.includes(movie.id)}
                                  onClick={() => handleAddToCollection(vault.id)}
                              >
                                  {vault.movieIds.includes(movie.id) && <Check className="mr-2 h-4 w-4" />}
                                  {vault.name}
                              </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setCreateCollectionType('Vault'); setIsCreateCollectionDialogOpen(true); }}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          <span>New Vault...</span>
                      </DropdownMenuItem>
                  </DropdownMenuSubContent>
              </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                  <Projector className="mr-2 h-4 w-4" />
                  <span>Add to Spotlight</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                      {spotlights.length > 0 && (
                        <>
                          {spotlights.map(spotlight => (
                              <DropdownMenuItem
                                  key={spotlight.id}
                                  disabled={spotlight.movieIds.includes(movie.id)}
                                  onClick={() => handleAddToCollection(spotlight.id)}
                              >
                                  {spotlight.movieIds.includes(movie.id) && <Check className="mr-2 h-4 w-4" />}
                                  {spotlight.name}
                              </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setCreateCollectionType('Spotlight'); setIsCreateCollectionDialogOpen(true); }}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          <span>New Spotlight...</span>
                      </DropdownMenuItem>
                  </DropdownMenuSubContent>
              </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <AlertDialog>
              <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                  </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the movie from your collection and all associated vaults and spotlights.
                  </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteMovie}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
      </DropdownMenuContent>
    );

    return (
        <>
            <div className="bg-background min-h-screen">
                <div className="relative h-72 md:h-96 w-full">
                    <Image
                        src={movie.backdropUrl || movie.posterUrl}
                        alt={`Backdrop for ${movie.title}`}
                        fill
                        className="object-cover object-top blur-lg opacity-30 backdrop-gradient-mask"
                        priority
                        data-ai-hint="movie background cinematic"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                </div>

                <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 -mt-48 md:-mt-64 relative z-10">
                    <div className="mb-8 flex justify-between items-center">
                        <Link href="/app/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="w-4 h-4"/>
                            <span className="hidden sm:inline">Back to Collection</span>
                            <span className="sm:hidden">Back</span>
                        </Link>
                        
                        <div className="md:hidden">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">More options</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                {moreOptionsMenuContent}
                            </DropdownMenu>
                        </div>
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
                            
                            <Card>
                                <CardContent className="p-3">
                                    <p className="font-semibold text-xs mb-2 text-muted-foreground px-1">STATUS</p>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between">
                                                <div className="flex items-center gap-2">
                                                    {currentStatusInfo && <currentStatusInfo.icon className={cn("w-4 h-4", currentStatusInfo.className)} />}
                                                    <span>{currentStatusInfo?.label}</span>
                                                </div>
                                                <ChevronDown className="h-4 w-4 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                                            <DropdownMenuRadioGroup value={movie.status} onValueChange={(value) => handleStatusChange(value as Movie['status'])}>
                                                {statusOptions.map(option => (
                                                    <DropdownMenuRadioItem key={option.value} value={option.value} className="flex items-center gap-2">
                                                        <option.icon className={cn("w-4 h-4", option.className)} />
                                                        <span>{option.label}</span>
                                                    </DropdownMenuRadioItem>
                                                ))}
                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardContent>
                            </Card>

                            {movie.scriptUrl && (
                                <a href={movie.scriptUrl} download target="_blank" rel="noopener noreferrer" className="block">
                                    <Button variant="outline" className="w-full">
                                        <Download className="mr-2"/>
                                        Download Script
                                    </Button>
                                </a>
                            )}
                        </aside>

                        {/* Main Content */}
                        <div className="md:col-span-8 lg:col-span-9 min-w-0">
                            {/* Header */}
                            <div className="mb-6 flex justify-between items-start gap-4">
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-4xl lg:text-5xl font-bold font-headline mb-2 break-words">{movie.title}</h1>
                                    <div className="flex flex-wrap gap-2">
                                        {movie.tags.map(tag => (
                                            <Badge key={tag} variant="secondary">{tag}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {movie.trailerUrl && (
                                        <Button onClick={() => setIsTrailerOpen(true)} size="icon" className="md:w-auto md:px-4">
                                            <Play className="h-4 w-4 md:mr-2" />
                                            <span className="hidden md:inline">Play Trailer</span>
                                        </Button>
                                    )}
                                    <Link href={`/app/movie/${movie.id}/edit`}>
                                        <Button variant="outline" size="icon" className="md:w-auto md:px-4">
                                            <Edit className="h-4 w-4 md:mr-2" />
                                            <span className="hidden md:inline">Edit</span>
                                        </Button>
                                    </Link>
                                    <div className="hidden md:inline-flex">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                                <span className="sr-only">More options</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            {moreOptionsMenuContent}
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>

                            <Tabs defaultValue="details" className="w-full">
                                <div className="flex justify-between items-center mb-4">
                                    <TabsList>
                                        <TabsTrigger value="details"><Info className="mr-2" />Details</TabsTrigger>
                                        {isSeries && (movie.seasons?.length ?? 0) > 0 && <TabsTrigger value="seasons"><Tv className="mr-2" />Seasons</TabsTrigger>}
                                        {movie.cast && movie.cast.length > 0 && <TabsTrigger value="cast"><Users className="mr-2" />Cast</TabsTrigger>}
                                        {movie.alternatePosters && movie.alternatePosters.length > 0 && <TabsTrigger value="media"><Clapperboard className="mr-2" />Media</TabsTrigger>}
                                    </TabsList>
                                </div>
                                
                                <TabsContent value="details">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Synopsis</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground max-w-prose">{movie.description}</p>
                                            <hr className="my-6 border-border" />
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div className="flex items-start gap-3">
                                                    <Star className="w-5 h-5 text-muted-foreground mt-1" />
                                                    <div className="w-5/6">
                                                        <p className="font-semibold">Rating</p>
                                                        <RatingProgressBar percentage={movie.rating} className="mt-2" />
                                                    </div>
                                                </div>
                                                <DetailItem icon={Calendar} label="Release Date" value={formattedReleaseDate} />
                                                <DetailItem icon={isSeries ? Tv : Film} label="Type" value={movie.type} />
                                                {movie.director && <DetailItem icon={Users} label="Director" value={movie.director} />}
                                                <DetailItem icon={Repeat} label="Rewatched" value={`${movie.rewatchCount || 0} times`} />
                                                {isSeries && (
                                                    <DetailItem icon={Tv} label="Progress" value={`${movie.watchedEpisodes} / ${movie.totalEpisodes} episodes`} />
                                                )}
                                                {movie.collection && (
                                                    <div className="flex items-start gap-3">
                                                        <FileText className="w-5 h-5 text-muted-foreground mt-1" />
                                                        <div>
                                                            <p className="font-semibold">Collection</p>
                                                            <button onClick={() => handleCollectionClick(movie.collection!)} className="text-muted-foreground hover:text-primary hover:underline cursor-pointer text-left">
                                                                {movie.collection}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                <DetailItem icon={Clock} label="Runtime" value={movie.runtime ? `${movie.runtime} min` : 'N/A'} />
                                                <DetailItem icon={Globe} label="Country" value={movie.productionCountries || 'N/A'} />
                                                <DetailItem icon={DollarSign} label="Budget" value={movie.budget ? `$${movie.budget.toLocaleString()}` : 'N/A'} />
                                                <DetailItem icon={TrendingUp} label="Revenue" value={movie.revenue ? `$${movie.revenue.toLocaleString()}` : 'N/A'} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="seasons">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Seasons & Episodes</CardTitle>
                                            <CardDescription>Track your watch progress for each season.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Accordion type="multiple" className="w-full space-y-4">
                                                {movie.seasons?.map(season => {
                                                    const watchedInSeason = season.episodes.filter(e => e.watched).length;
                                                    const progress = season.episodeCount > 0 ? (watchedInSeason / season.episodeCount) * 100 : 0;
                                                    const allWatched = watchedInSeason === season.episodeCount;

                                                    return (
                                                        <AccordionItem key={season.seasonNumber} value={`season-${season.seasonNumber}`} className="border rounded-lg overflow-hidden">
                                                            <AccordionTrigger className="p-4 hover:no-underline hover:bg-muted/50 data-[state=open]:border-b">
                                                                <div className="flex items-center gap-4 w-full pr-4">
                                                                    <Image src={season.posterPath || movie.posterUrl} alt={`Poster for ${season.name}`} width={80} height={120} className="w-20 h-auto object-cover rounded-md" data-ai-hint="tv season poster" />
                                                                    <div className="flex-grow text-left space-y-2">
                                                                        <h4 className="font-bold text-lg">{season.name}</h4>
                                                                        <p className="text-sm text-muted-foreground">{watchedInSeason} / {season.episodeCount} Episodes</p>
                                                                        <Progress value={progress} className="h-2" />
                                                                    </div>
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent className="p-4 bg-muted/20">
                                                                <Button onClick={() => handleSeasonToggle(season.seasonNumber)} size="sm" className="mb-4">
                                                                    <Check className="mr-2" /> {allWatched ? 'Unmark' : 'Mark'} Season as Watched
                                                                </Button>
                                                                <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                                                    {season.episodes.map(episode => (
                                                                        <li key={episode.episodeNumber} className="flex items-center gap-3">
                                                                            <Checkbox 
                                                                                checked={episode.watched} 
                                                                                onCheckedChange={(checked) => handleEpisodeToggle(season.seasonNumber, episode.episodeNumber, !!checked)}
                                                                                id={`s${season.seasonNumber}e${episode.episodeNumber}`}
                                                                            />
                                                                            <label htmlFor={`s${season.seasonNumber}e${episode.episodeNumber}`} className="text-sm cursor-pointer">
                                                                                <span className="font-semibold">E{episode.episodeNumber}: {episode.name}</span>
                                                                            </label>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    );
                                                })}
                                            </Accordion>
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
                                                <div key={person.name} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50 min-w-0">
                                                    <Avatar>
                                                        <AvatarImage src={person.avatarUrl} alt={person.name} data-ai-hint="person portrait" />
                                                        <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold truncate">{person.name}</p>
                                                        <p className="text-sm text-muted-foreground truncate">{person.character}</p>
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
            <CreateCollectionDialog
                isOpen={isCreateCollectionDialogOpen}
                setIsOpen={setIsCreateCollectionDialogOpen}
                type={createCollectionType}
                onCollectionCreated={handleCollectionCreated}
                movieIdsToAdd={[movie.id]}
            />
            <Dialog open={isCollectionDialogOpen} onOpenChange={setIsCollectionDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Collection: {movie.collection}</DialogTitle>
                        <DialogDescription>
                            Other titles in this collection from your library.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-72 -mx-6 pr-6 pl-6">
                        <div className="space-y-2">
                            {collectionMovies.length > 0 ? (
                                collectionMovies.map(collectionMovie => (
                                    <Link key={collectionMovie.id} href={`/app/movie/${collectionMovie.id}`} passHref>
                                        <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => setIsCollectionDialogOpen(false)}>
                                            <Image
                                                src={collectionMovie.posterUrl}
                                                alt={collectionMovie.title}
                                                width={50}
                                                height={75}
                                                className="w-[50px] h-[75px] object-cover rounded-md"
                                                data-ai-hint="movie poster"
                                            />
                                            <div className="flex-grow">
                                                <p className="font-semibold">{collectionMovie.title}</p>
                                                <p className="text-sm text-muted-foreground">{collectionMovie.releaseDate ? format(new Date(`${collectionMovie.releaseDate}T00:00:00`), 'MMM d, yyyy') : ''}</p>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-10">No other titles from this collection found in your library.</p>
                            )}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
            <Dialog open={isTrailerOpen} onOpenChange={setIsTrailerOpen}>
                <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-0 aspect-video">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Trailer: {movie.title}</DialogTitle>
                    </DialogHeader>
                    {isTrailerOpen && movie.trailerUrl && (
                        <AmbientPlayer 
                            imageUrl={movie.backdropUrl || movie.posterUrl} 
                            trailerUrl={movie.trailerUrl} 
                            title={movie.title}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
