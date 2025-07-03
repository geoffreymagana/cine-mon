
'use client';

import * as React from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import type { Movie, UserCollection } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { MovieGrid } from '@/components/movie-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { EditCollectionDialog } from '@/components/edit-collection-dialog';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { MovieService } from '@/lib/movie-service';

export default function CollectionDetailPage() {
    const params = useParams();
    const collectionId = params.id as string;
    const router = useRouter();
    const { toast } = useToast();
    const [collection, setCollection] = React.useState<UserCollection | null | undefined>(undefined);
    const [movies, setMovies] = React.useState<Movie[]>([]);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const isMobile = useIsMobile();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: isMobile ? 250 : 0,
                tolerance: isMobile ? 5 : 2,
            },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const loadCollectionData = React.useCallback(async () => {
        if (!collectionId) return;

        try {
            const foundCollection = await MovieService.getCollection(collectionId);
            setCollection(foundCollection || null);

            if (foundCollection) {
                const allMovies = await MovieService.getMovies();
                const moviesInCollection = foundCollection.movieIds
                    .map(movieId => allMovies.find(m => m.id === movieId))
                    .filter((m): m is Movie => !!m);
                setMovies(moviesInCollection);
            } else {
                setMovies([]);
            }
        } catch (error) {
            console.error("Failed to load collection from DB:", error);
            setCollection(null);
        }
    }, [collectionId]);

    React.useEffect(() => {
        if (collectionId) {
            loadCollectionData();
        }
    }, [collectionId, loadCollectionData]);
    
    const handleRemoveFromCollection = async (movieId: string) => {
        if (!collection) return;
        
        const updatedMovieIds = collection.movieIds.filter(id => id !== movieId);
        
        await MovieService.updateCollection(collection.id, { movieIds: updatedMovieIds });
        
        const updatedCollection = { ...collection, movieIds: updatedMovieIds };
        setCollection(updatedCollection);
        setMovies(movies.filter(m => m.id !== movieId));
        
        toast({
            title: "Movie Removed",
            description: "The movie has been removed from this collection.",
            variant: "destructive"
        });
    };

    const handleDeleteCollection = async () => {
        if (!collection) return;

        await MovieService.deleteCollection(collection.id);
        
        toast({
            title: "Collection Deleted",
            description: `"${collection.name}" has been permanently deleted.`,
        });
        
        router.push('/app/collections');
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!collection || collection.type !== 'Vault' || !over || active.id === over.id) return;

        setMovies((items) => {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            const newOrder = arrayMove(items, oldIndex, newIndex);

            const updatedMovieIds = newOrder.map(m => m.id);
            MovieService.updateCollection(collection.id, { movieIds: updatedMovieIds });
            setCollection({ ...collection, movieIds: updatedMovieIds });

            return newOrder;
        });
    };
    
    const handleCollectionUpdated = () => {
        loadCollectionData();
    };

    if (collection === undefined) {
        return (
             <div className="bg-background min-h-screen p-8">
                <Skeleton className="h-8 w-48 mb-12" />
                <div className="space-y-4">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </div>
        );
    }
    
    if (!collection) {
        return notFound();
    }
    
    return (
        <TooltipProvider>
            <div className="bg-background min-h-screen dotted-background-permanent">
                <div className="relative h-48 md:h-64 lg:h-80 w-full">
                    <Image
                        src={collection.coverImageUrl || 'https://placehold.co/1280x720.png'}
                        alt={`${collection.name} backdrop`}
                        layout="fill"
                        objectFit="cover"
                        className="blur-md opacity-20"
                        data-ai-hint="movie background abstract"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />
                </div>

                <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 -mt-24 md:-mt-32 relative z-10">
                    <div className="mb-8">
                        <Link href="/app/collections" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="w-4 h-4"/>
                            <span>Back to Collections</span>
                        </Link>
                    </div>
                    
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-primary font-semibold">{collection.type}</p>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}><Edit className="mr-2"/>Edit</Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive"><Trash2 className="mr-2"/>Delete</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your collection "{collection.name}".
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteCollection}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-4xl lg:text-5xl font-bold font-headline">{collection.name}</h1>
                        <p className="mt-2 text-muted-foreground max-w-3xl">{collection.description}</p>
                    </div>

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                      disabled={collection.type !== 'Vault'}
                    >
                        <MovieGrid
                            movies={movies}
                            onRemoveFromCollection={handleRemoveFromCollection}
                        />
                    </DndContext>
                </main>
            </div>
            <EditCollectionDialog
                isOpen={isEditDialogOpen}
                setIsOpen={setIsEditDialogOpen}
                collection={collection}
                onCollectionUpdated={handleCollectionUpdated}
            />
        </TooltipProvider>
    );
}
