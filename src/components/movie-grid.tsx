
"use client";

import type { Movie } from "@/lib/types";
import { MovieCard } from "./movie-card";

type MovieGridProps = {
  movies: Movie[];
  onDelete: (movieId: string) => void;
};

export const MovieGrid = ({ movies, onDelete }: MovieGridProps) => {
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onDelete={() => onDelete(movie.id)}
        />
      ))}
    </div>
  );
};
