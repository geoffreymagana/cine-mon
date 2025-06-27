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
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const spin = () => {
    if (movies.length === 0) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setIsSpinning(true);

    const spinDuration = 2000;
    const intervalTime = 100;
    let spinTime = 0;

    intervalRef.current = setInterval(() => {
      spinTime += intervalTime;
      const randomIndex = Math.floor(Math.random() * movies.length);
      setSelectedMovie(movies[randomIndex]);
      
      if (spinTime >= spinDuration) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsSpinning(false);
      }
    }, intervalTime);
  };
  
  React.useEffect(() => {
    if(isOpen) {
      if (movies.length > 0) {
        setSelectedMovie(movies[Math.floor(Math.random() * movies.length)]);
      }
      spin();
    } else {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }
    
    return () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div className="flex flex-col items-center justify-center py-8 min-h-[350px]">
          {isSpinning && selectedMovie ? (
            <div className="flex flex-col items-center text-center">
              <div className="relative w-40 h-[240px] flex items-center justify-center">
                  <div className="w-40 rounded-lg overflow-hidden shadow-lg animate-spin-path">
                      <Image
                          src={selectedMovie.posterUrl}
                          alt="Spinning poster"
                          width={200}
                          height={300}
                          className="w-full h-full object-cover"
                      />
                  </div>
              </div>
              <p className="text-lg font-semibold mt-8">Spinning...</p>
            </div>
          ) : !isSpinning && selectedMovie ? (
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
              <p className="text-lg font-semibold mt-4">No movies to suggest.</p>
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
