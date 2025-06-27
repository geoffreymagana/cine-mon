"use client";

import * as React from "react";
import Image from "next/image";
import type { Movie } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type SpinWheelDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  movies: Movie[];
};

export const SpinWheelDialog = ({ isOpen, setIsOpen, movies }: SpinWheelDialogProps) => {
  const [selectedMovie, setSelectedMovie] = React.useState<Movie | null>(null);
  const [isSpinning, setIsSpinning] = React.useState(false);

  const spin = () => {
    if (movies.length === 0) return;
    setIsSpinning(true);
    setSelectedMovie(null);

    const spinDuration = 2000;
    const intervalTime = 100;
    let spinTime = 0;

    const spinInterval = setInterval(() => {
      spinTime += intervalTime;
      const randomIndex = Math.floor(Math.random() * movies.length);
      setSelectedMovie(movies[randomIndex]);
      
      if (spinTime >= spinDuration) {
        clearInterval(spinInterval);
        setIsSpinning(false);
      }
    }, intervalTime);
  };
  
  React.useEffect(() => {
    if(isOpen) {
        spin();
    }
  }, [isOpen]);

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedMovie(null);
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Surprise Me!</DialogTitle>
          <DialogDescription>
            Let fate decide what you should watch next.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8 min-h-[300px]">
          {selectedMovie && !isSpinning ? (
            <div className="flex flex-col items-center text-center animate-in fade-in duration-500">
                <div className="w-40 rounded-lg overflow-hidden shadow-lg shadow-primary/20">
                    <Image
                        src={selectedMovie.posterUrl}
                        alt={`Poster for ${selectedMovie.title}`}
                        width={200}
                        height={300}
                        className="w-full h-full object-cover"
                        data-ai-hint={`${selectedMovie.type} ${selectedMovie.title}`}
                    />
                </div>
                <h3 className="text-2xl font-bold font-headline mt-4">{selectedMovie.title}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedMovie.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              {selectedMovie && isSpinning && (
                <div className="w-40 rounded-lg overflow-hidden blur-sm">
                  <Image
                      src={selectedMovie.posterUrl}
                      alt="Spinning poster"
                      width={200}
                      height={300}
                      className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-lg font-semibold mt-4">{isSpinning ? "Spinning..." : "No movies to suggest."}</p>
            </div>
          )}
        </div>
        <div className="flex justify-center">
            <Button onClick={spin} disabled={isSpinning || movies.length === 0}>
                {isSpinning ? "Spinning..." : "Spin Again"}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
