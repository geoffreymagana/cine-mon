
'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import type { Movie } from '@/lib/types';

type ImportMovieDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  movies: Movie[];
  onImport: (movie: Movie) => void;
};

export function ImportMovieDialog({ isOpen, setIsOpen, movies, onImport }: ImportMovieDialogProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredMovies = React.useMemo(() => {
    return movies.filter(movie =>
      movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [movies, searchQuery]);

  const handleSelect = (movie: Movie) => {
    onImport(movie);
    setIsOpen(false);
  };

  React.useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import from Collection</DialogTitle>
          <DialogDescription>Select a title from your library to add it to the canvas.</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <ScrollArea className="flex-grow -mx-6 pr-6 pl-6">
          <div className="space-y-1">
            {filteredMovies.length > 0 ? (
              filteredMovies.map(movie => (
                <button
                  key={movie.id}
                  onClick={() => handleSelect(movie)}
                  className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 w-full text-left"
                >
                  <Image
                    src={movie.posterUrl}
                    alt={movie.title}
                    width={40}
                    height={60}
                    className="w-10 h-[60px] object-cover rounded-md"
                    data-ai-hint="movie poster"
                  />
                  <div className="flex-grow min-w-0">
                    <p className="font-semibold truncate">{movie.title}</p>
                    <p className="text-sm text-muted-foreground">{movie.releaseDate?.substring(0, 4)}</p>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-10">
                {searchQuery ? 'No matching titles found.' : 'Your movie collection is empty.'}
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
