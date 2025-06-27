
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
import { Loader2 } from "lucide-react";
import { DotLottieReact, type PlayerEvents } from '@lottiefiles/dotlottie-react';

const spinnerCaptions = [
  "Rewinding film reels...",
  "Pulling scenes from the archives...",
  "Projecting something special...",
  "Dusting off an old classic...",
  "Sharpening the focus...",
  "Rolling the end credits backward...",
  "Cueing the next blockbuster...",
  "Scanning the multiverse of media...",
  "Let fate decide your next binge...",
  "Spinning the cinematic wheel of destiny...",
  "Deciding what you didn’t know you needed...",
  "Calculating plot twists...",
  "Consulting the genre gods...",
  "Opening the vault of unseen greatness...",
  "Popcorn’s almost ready...",
  "This one’s gonna be a reel treat...",
  "Let’s give the Oscars a run for their money...",
  "Hold tight, we’re skipping the trailers...",
  "Is it drama? Is it anime? Even we don’t know...",
  "Summoning a cinematic prophecy...",
  "Translating storylines from another dimension...",
  "Rerouting the quantum plot engine...",
  "Running a montage simulation...",
  "Decrypting genre algorithms...",
  "Browsing the director’s cut...",
  "Unfolding the unwritten script...",
  "Digging through deleted scenes...",
  "Quoting plotlines from memory...",
  "Crafting a scene you’ll never forget...",
  "Accessing Cine-Mon mainframe...",
  "Spawning watchlist variants...",
  "Rendering watch probability matrix...",
  "Initializing movieverse index...",
  "Booting script-to-brain interface...",
];

const finalizingCaptions = [
    "And the winner is...",
    "Your next watch is...",
    "The cinematic gods have spoken...",
    "Here's what fate chose for you...",
    "Get the popcorn ready for this one!",
];


type SpinWheelDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  movies: Movie[];
};

export const SpinWheelDialog = ({ isOpen, setIsOpen, movies }: SpinWheelDialogProps) => {
  const [selectedMovie, setSelectedMovie] = React.useState<Movie | null>(null);
  const [isSpinning, setIsSpinning] = React.useState(false);
  const [animationKey, setAnimationKey] = React.useState(0);
  const [caption, setCaption] = React.useState("");
  const [typedCaption, setTypedCaption] = React.useState("");
  const [lottieFailed, setLottieFailed] = React.useState(false);

  // Typewriter effect for captions
  React.useEffect(() => {
    if (!caption) {
        setTypedCaption("");
        return;
    }
    setTypedCaption("");
    let i = 0;
    const intervalId = setInterval(() => {
        if (i < caption.length) {
            setTypedCaption(prev => prev + caption.charAt(i));
            i++;
        } else {
            if (!typedCaption.endsWith("...")) {
                setTypedCaption(prev => prev + "...");
            }
            clearInterval(intervalId);
        }
    }, 25); // Typing speed
    
    return () => clearInterval(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caption]);


  const spin = () => {
    if (movies.length === 0) return;

    setIsSpinning(true);
    setSelectedMovie(null);
    setLottieFailed(false);
    setAnimationKey(prev => prev + 1);

    const shuffledCaptions = [...spinnerCaptions].sort(() => 0.5 - Math.random());
    
    // Set captions at intervals
    setCaption(shuffledCaptions[0] || "Spinning");
    setTimeout(() => setCaption(shuffledCaptions[1] || "Finding a gem..."), 1500);
    setTimeout(() => setCaption(shuffledCaptions[2] || "Almost there..."), 3000);

    const spinDuration = 4500;

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * movies.length);
      const finalMovie = movies[randomIndex];
      const finalizingCaption = finalizingCaptions[Math.floor(Math.random() * finalizingCaptions.length)];
      
      setIsSpinning(false);
      setSelectedMovie(finalMovie);
      setCaption(finalizingCaption);
    }, spinDuration);
  };
  
  React.useEffect(() => {
    if(isOpen) {
      if (movies.length > 0) {
        spin();
      } else {
        setSelectedMovie(null);
        setCaption("Add movies to your collection to get a suggestion!");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setIsSpinning(false);
      setSelectedMovie(null);
      setCaption("");
    }
    setIsOpen(open);
  }
  
  const moviesToDisplay = React.useMemo(() => {
    return [...movies].sort(() => 0.5 - Math.random()).slice(0, 9);
  }, [movies]);
  const carouselMovies = moviesToDisplay.length > 0 ? moviesToDisplay : movies.slice(0,1);

  const numItems = carouselMovies.length;
  const radius = numItems > 1 ? 220 : 0;
  
  const handleLottieEvent = (event: PlayerEvents) => {
    if (event === 'error') {
      setLottieFailed(true);
    }
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
        <div className="flex flex-col items-center justify-center py-8 min-h-[400px]">
          {isSpinning ? (
             <div className="revolving-carousel-container">
              <div key={animationKey} className="revolving-carousel">
                {carouselMovies.map((movie, index) => {
                  const angle = (360 / numItems) * index;
                  return (
                    <div 
                      key={movie.id}
                      className="revolving-card"
                      style={{
                        transform: `rotateY(${angle}deg) translateZ(${radius}px)`
                      }}
                    >
                      <Image
                        src={movie.posterUrl}
                        alt={`Poster for ${movie.title}`}
                        width={200}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )
                })}
              </div>
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
              <p className="text-lg font-semibold mt-4">Your collection is empty.</p>
            </div>
          )}
        </div>
        <div className="text-center h-10 text-muted-foreground text-sm">{typedCaption}</div>
        <div className="flex justify-center">
            <Button onClick={spin} disabled={isSpinning || movies.length === 0} className="w-32 h-12 flex items-center justify-center">
                {isSpinning ? (
                  lottieFailed ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <div className="w-12 h-12">
                      <DotLottieReact
                          src="https://lottie.host/a050cb6d-8846-4b86-9cfb-d4e5d3f5f806/tjYm0mBSbB.lottie"
                          loop
                          autoplay
                          onEvent={handleLottieEvent}
                      />
                    </div>
                  )
                ) : (
                    "Spin Again"
                )}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
