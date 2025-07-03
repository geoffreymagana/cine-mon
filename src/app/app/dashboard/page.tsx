
"use client";

import * as React from "react";
import type { Movie } from "@/lib/types";
import { DashboardHeader } from "@/components/dashboard-header";
import { MovieGrid } from "@/components/movie-grid";
import { AddMovieDialog } from "@/components/add-movie-dialog";
import { SearchDialog } from "@/components/search-dialog";
import { useToast } from "@/hooks/use-toast";
import { Suspense, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useIsMobile } from "@/hooks/use-mobile";
import { MovieService } from "@/lib/movie-service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AddToCollectionDialog } from "@/components/add-to-collection-dialog";
import { GenreFilter } from "@/components/genre-filter";
import { useSearchParams } from "next/navigation";


function DashboardContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') || 'All';

  const [movies, setMovies] = React.useState<Movie[]>([]);
  const [isAddMovieOpen, setIsAddMovieOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isSelectionMode, setIsSelectionMode] = React.useState(false);
  const [selectedMovieIds, setSelectedMovieIds] = React.useState<Set<string>>(new Set());
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [isAddToCollectionOpen, setIsAddToCollectionOpen] = React.useState(false);

  const isMobile = useIsMobile();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: isMobile ? 250 : 0,
        tolerance: isMobile ? 5 : 2,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadMovies = React.useCallback(async () => {
    const moviesFromDb = await MovieService.getMovies();
    setMovies(moviesFromDb);
  }, []);

  React.useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  const filteredMovies = useMemo(() => {
    if (filter === 'All') return movies;
    return movies.filter((movie) => movie.type === filter);
  }, [movies, filter]);

  const handleSaveMovie = async (movieData: Omit<Movie, "id">) => {
    if (movieData.tmdbId && movies.some(m => m.tmdbId === movieData.tmdbId)) {
        toast({
            title: "Already in Collection",
            description: `${movieData.title} is already in your collection.`,
        });
        return;
    }
    await MovieService.addMovie(movieData);
    toast({
      title: "Success!",
      description: `${movieData.title} has been added to your collection.`,
    });
    loadMovies(); // Refresh list
  };
  
  const handleOpenAddDialog = () => setIsAddMovieOpen(true);
  const handleOpenSearchDialog = () => setIsSearchOpen(true);

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;

    if (over && active.id !== over.id) {
      setMovies((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        if (oldIndex === -1 || newIndex === -1) return items;

        const newItems = arrayMove(items, oldIndex, newIndex);
        
        const now = Date.now();
        const newItemsWithOrder = newItems.map((item, index) => ({ 
            ...item, 
            sortOrder: now - index 
        }));

        MovieService.saveAllMovies(newItemsWithOrder);
        return newItemsWithOrder;
      });
    }
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(prev => !prev);
    setSelectedMovieIds(new Set());
  };

  const handleSelectMovie = (movieId: string) => {
    setSelectedMovieIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(movieId)) {
        newSet.delete(movieId);
      } else {
        newSet.add(movieId);
      }
      return newSet;
    });
  };

  const handleClearSelection = () => {
    setSelectedMovieIds(new Set());
    setIsSelectionMode(false);
  };
  
  const handleDeleteSelected = async () => {
    await MovieService.deleteMovies(Array.from(selectedMovieIds));
    toast({
      title: `${selectedMovieIds.size} Items Deleted`,
      description: "The selected titles have been removed from your collection.",
      variant: 'destructive'
    });
    loadMovies();
    handleClearSelection();
  };
  
  const handleActionComplete = () => {
    handleClearSelection();
  };

  const handleSelectAll = (moviesToSelect: Movie[]) => {
    if (selectedMovieIds.size === moviesToSelect.length) {
      setSelectedMovieIds(new Set());
    } else {
      setSelectedMovieIds(new Set(moviesToSelect.map(m => m.id)));
    }
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
          <DashboardHeader 
            onAddMovieClick={handleOpenAddDialog} 
            onSearchClick={handleOpenSearchDialog}
            isSelectionMode={isSelectionMode}
            onToggleSelectionMode={handleToggleSelectionMode}
            selectedCount={selectedMovieIds.size}
            onClearSelection={handleClearSelection}
            onDeleteSelected={() => setIsDeleteAlertOpen(true)}
            onAddToCollection={() => setIsAddToCollectionOpen(true)}
            onSelectAll={handleSelectAll}
            allMovies={filteredMovies}
          />
        </div>
        
        {/* Horizontally-Scrollable Filter Bar */}
        <div className="w-full border-b">
          <GenreFilter />
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            disabled={isSelectionMode || filter !== 'All'}
          >
            <div className="p-4 md:p-8">
              <MovieGrid
                movies={filteredMovies}
                isSelectionMode={isSelectionMode}
                selectedMovieIds={selectedMovieIds}
                onSelectMovie={handleSelectMovie}
              />
            </div>
          </DndContext>
        </div>
      </div>
      
      <AddMovieDialog
        isOpen={isAddMovieOpen}
        setIsOpen={setIsAddMovieOpen}
        onSave={handleSaveMovie}
      />

      <SearchDialog
        isOpen={isSearchOpen}
        setIsOpen={setIsSearchOpen}
        onSave={handleSaveMovie}
        existingMovies={movies}
      />

      <AddToCollectionDialog
        isOpen={isAddToCollectionOpen}
        setIsOpen={setIsAddToCollectionOpen}
        movieIds={Array.from(selectedMovieIds)}
        onActionComplete={handleActionComplete}
      />

       <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedMovieIds.size} item(s) from your collection. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  )
}
