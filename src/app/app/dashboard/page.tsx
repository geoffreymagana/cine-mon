
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

function DashboardContent() {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') || 'All';
  const { toast } = useToast();

  const [movies, setMovies] = React.useState<Movie[]>([]);
  const [isAddMovieOpen, setIsAddMovieOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  React.useEffect(() => {
    try {
      const storedMovies = localStorage.getItem('movies');
      if (storedMovies) {
        setMovies(JSON.parse(storedMovies));
      } else {
        const emptyMovies: Movie[] = [];
        localStorage.setItem('movies', JSON.stringify(emptyMovies));
        setMovies(emptyMovies);
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error);
      setMovies([]);
    }
  }, []);

  const updateMoviesInStorage = (updatedMovies: Movie[]) => {
    try {
      localStorage.setItem('movies', JSON.stringify(updatedMovies));
    } catch (error) {
      console.error("Failed to save movies to localStorage:", error);
      toast({
        title: "Error Saving Data",
        description: "Your changes could not be saved to local storage.",
        variant: "destructive"
      });
    }
  };

  const handleSaveMovie = (movieData: Omit<Movie, "id">) => {
    if (movieData.tmdbId && movies.some(m => m.tmdbId === movieData.tmdbId)) {
        toast({
            title: "Already in Collection",
            description: `${movieData.title} is already in your collection.`,
        });
        return;
    }
    const movieWithId = { ...movieData, id: crypto.randomUUID() };
    const updatedMovies = [movieWithId, ...movies];
    setMovies(updatedMovies);
    updateMoviesInStorage(updatedMovies);
    toast({
      title: "Success!",
      description: `${movieData.title} has been added to your collection.`,
    });
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
        updateMoviesInStorage(newItems);
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
