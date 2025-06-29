
"use client";

import * as React from 'react';
import type { Movie } from "@/lib/types";
import { MovieCard } from "./movie-card";
import { SortableContext, useSortable, rectSwappingStrategy } from '@dnd-kit/sortable';

type MovieGridProps = {
  movies: Movie[];
  onRemoveFromCollection?: (movieId: string) => void;
};

const SortableMovieItem = ({ movie, onRemoveFromCollection }: { movie: Movie, onRemoveFromCollection?: (movieId: string) => void }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: movie.id });

    const style: React.CSSProperties = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        zIndex: isDragging ? 100 : 'auto',
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <MovieCard
                movie={movie}
                onRemoveFromCollection={onRemoveFromCollection}
            />
        </div>
    );
};

export const MovieGrid = ({ movies, onRemoveFromCollection }: MovieGridProps) => {
  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-headline font-semibold">Your Collection is Empty</h2>
        <p className="text-muted-foreground mt-2">
          Click 'Add Movie' to start building your library.
        </p>
      </div>
    );
  }

  return (
    <SortableContext items={movies.map((m) => m.id)} strategy={rectSwappingStrategy}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
        {movies.map((movie) => (
          <SortableMovieItem
            key={movie.id}
            movie={movie}
            onRemoveFromCollection={onRemoveFromCollection}
          />
        ))}
      </div>
    </SortableContext>
  );
};
