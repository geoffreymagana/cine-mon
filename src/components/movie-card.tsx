"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import type { Movie } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CircleCheck, PauseCircle, CircleOff, Bookmark, Trash2, Check } from "lucide-react";
import { RatingCircle } from "./rating-circle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type MovieCardProps = {
  movie: Movie;
  onRemoveFromCollection?: (movieId: string) => void;
  disableLink?: boolean;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
};

export const MovieCard = ({ movie, onRemoveFromCollection, disableLink = false, isSelectionMode = false, isSelected = false, onSelect }: MovieCardProps) => {

  const handleInteraction = (e: React.MouseEvent) => {
    if (isSelectionMode) {
      e.preventDefault();
      e.stopPropagation();
      onSelect?.();
    }
  };
  
  const statusInfo = {
    'Watching': { icon: Clock, className: 'text-chart-1', label: 'Watching' },
    'Completed': { icon: CircleCheck, className: 'text-chart-2', label: 'Completed' },
    'On-Hold': { icon: PauseCircle, className: 'text-chart-3', label: 'On Hold' },
    'Dropped': { icon: CircleOff, className: 'text-destructive', label: 'Dropped' },
    'Plan to Watch': { icon: Bookmark, className: 'text-muted-foreground', label: 'Plan to Watch' },
  }[movie.status];

  const formattedDate = React.useMemo(() => {
    if (!movie.releaseDate) return 'Unknown';
    try {
        // Appending T00:00:00 ensures the date is parsed in local time, avoiding timezone-related off-by-one errors.
        return format(new Date(`${movie.releaseDate}T00:00:00`), 'MMM d, yyyy');
    } catch (e) {
        return movie.releaseDate;
    }
  }, [movie.releaseDate]);

  const CardInnerComponent = (
    <Card 
      className={cn(
        "overflow-visible flex flex-col transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 bg-card h-full",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
        <div className="relative">
            {statusInfo && !isSelectionMode && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="absolute top-2 left-2 z-20 h-8 w-8 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center cursor-pointer" onClick={handleInteraction}>
                            <statusInfo.icon className={cn("h-4 w-4", statusInfo.className)} />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{statusInfo.label}</p>
                    </TooltipContent>
                </Tooltip>
            )}
             {onRemoveFromCollection && !isSelectionMode && (
              <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Tooltip>
                  <TooltipTrigger asChild>
                      <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-background/70 backdrop-blur-sm"
                          onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onRemoveFromCollection(movie.id);
                          }}
                      >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove from collection</span>
                      </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                      <p>Remove from collection</p>
                  </TooltipContent>
                  </Tooltip>
              </div>
            )}
            {isSelectionMode && (
              <div className="absolute top-2 right-2 z-20 h-6 w-6 rounded-full bg-background/80 flex items-center justify-center border-2 border-primary transition-all"
                style={{
                    transform: isSelected ? 'scale(1)' : 'scale(0.9)',
                    opacity: isSelected ? 1 : 0.8,
                }}
              >
                {isSelected && <Check className="h-4 w-4 text-primary font-bold" />}
              </div>
            )}
            <div className="aspect-[2/3] w-full rounded-t-lg overflow-hidden border border-border/10">
                <Image
                    src={movie.posterUrl}
                    alt={`Poster for ${movie.title}`}
                    width={500}
                    height={750}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={`${movie.type} ${movie.title}`}
                />
            </div>
            <div className="absolute -bottom-5 left-2 z-10">
                <RatingCircle percentage={movie.rating} />
            </div>
        </div>
      
      <CardContent className="pt-6 sm:pt-8 px-2 flex-grow flex flex-col">
        <p className="text-sm sm:text-base font-bold leading-tight truncate flex-grow" title={movie.title}>
          {movie.title}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{formattedDate}</p>
      </CardContent>
    </Card>
  );

  const cardWrapperProps = {
    className: cn("block group outline-none h-full", isSelectionMode && "cursor-pointer"),
    onClick: isSelectionMode ? onSelect : undefined
  };

  if (disableLink) {
    return <div {...cardWrapperProps}>{CardInnerComponent}</div>;
  }

  return (
    <div {...cardWrapperProps}>
      <Link href={isSelectionMode ? '#' : `/app/movie/${movie.id}`} onClick={(e) => {if(isSelectionMode) e.preventDefault()}} className="block h-full" prefetch={false}>
        {CardInnerComponent}
      </Link>
    </div>
  );
};
