"use client";

import * as React from "react";
import type { Movie } from "@/lib/types";
import { DashboardHeader } from "@/components/dashboard-header";
import { MovieGrid } from "@/components/movie-grid";
import { AddMovieDialog } from "@/components/add-movie-dialog";
import { SearchDialog } from "@/components/search-dialog";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
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
import { Suspense } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MovieService } from "@/lib/movie-service";

function DashboardContent() {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') || 'All';
  const { toast } = useToast();

  const [movies, setMovies] = React.useState<Movie[]>([]);
  const [isAddMovieOpen, setIsAddMovieOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
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

  const filteredMovies = React.useMemo(() => {
    if (filter === 'All') return movies;
    return movies.filter((movie) => movie.type === filter);
  }, [movies, filter]);

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;

    if (over && active.id !== over.id) {
      setMovies((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        if (oldIndex === -1 || newIndex === -1) return items;

        const newItems = arrayMove(items, oldIndex, newIndex);
        MovieService.saveAllMovies(newItems);
        return newItems;
      });
    }
  };

  return (
    <>
      <main className="min-h-screen flex flex-col pb-16 md:pb-0 dotted-background-permanent">
          <DashboardHeader onAddMovieClick={handleOpenAddDialog} onSearchClick={handleOpenSearchDialog} />
          <div className="flex-grow p-4 md:p-8">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <MovieGrid
                  movies={filteredMovies}
                />
              </DndContext>
          </div>
      </main>
      
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
