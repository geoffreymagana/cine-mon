
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import type { Movie, UserCollection } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2, Clock, CircleCheck, PauseCircle, CircleOff, Bookmark, Lock, Projector } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { RatingCircle } from "./rating-circle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type MovieCardProps = {
  movie: Movie;
  onDelete: (movieId: string) => void;
};

export const MovieCard = ({ movie, onDelete }: MovieCardProps) => {
  const router = useRouter();
  const [collections, setCollections] = React.useState<UserCollection[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    try {
        const storedCollections = localStorage.getItem('collections');
        if (storedCollections) {
            setCollections(JSON.parse(storedCollections));
        }
    } catch (error) {
        console.error("Failed to load collections from localStorage", error);
    }
  }, []);

  const handleInteraction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleEdit = (e: React.MouseEvent) => {
    handleInteraction(e);
    router.push(`/movie/${movie.id}/edit`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    handleInteraction(e);
    onDelete(movie.id);
  };
  
  const handleAddToCollection = (e: React.MouseEvent, collectionId: string) => {
    handleInteraction(e);
    try {
        const storedCollections = localStorage.getItem('collections');
        const allCollections: UserCollection[] = storedCollections ? JSON.parse(storedCollections) : [];
        
        const targetCollection = allCollections.find(c => c.id === collectionId);
        if (!targetCollection) return;

        if (targetCollection.movieIds.includes(movie.id)) {
            toast({
                title: "Already in Collection",
                description: `"${movie.title}" is already in "${targetCollection.name}".`
            });
            return;
        }
        
        const updatedCollections = allCollections.map(c => 
            c.id === collectionId
                ? { ...c, movieIds: [...c.movieIds, movie.id] }
                : c
        );

        localStorage.setItem('collections', JSON.stringify(updatedCollections));
        setCollections(updatedCollections);
        toast({
            title: "Added to Collection",
            description: `"${movie.title}" added to "${targetCollection.name}".`
        });
    } catch (error) {
        console.error("Failed to add to collection:", error);
        toast({
            title: "Error",
            description: "Could not add movie to collection.",
            variant: "destructive"
        });
    }
  };

  const statusInfo = {
    'Watching': { icon: Clock, className: 'text-chart-1', label: 'Watching' },
    'Completed': { icon: CircleCheck, className: 'text-chart-2', label: 'Completed' },
    'On-Hold': { icon: PauseCircle, className: 'text-chart-3', label: 'On Hold' },
    'Dropped': { icon: CircleOff, className: 'text-destructive', label: 'Dropped' },
    'Plan to Watch': { icon: Bookmark, className: 'text-muted-foreground', label: 'Plan to Watch' },
  }[movie.status];

  const vaults = collections.filter(c => c.type === 'Vault');
  const spotlights = collections.filter(c => c.type === 'Spotlight');

  return (
    <Link href={`/movie/${movie.id}`} className="block group outline-none" prefetch={false}>
      <Card className="overflow-visible flex flex-col transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 bg-card h-full">
          <div className="relative">
              {statusInfo && (
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
              <div className="absolute top-2 right-2 z-20">
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/70 backdrop-blur-sm" onClick={handleInteraction}>
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Movie actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={handleInteraction}>
                        <DropdownMenuItem onClick={handleEdit}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <Lock className="mr-2 h-4 w-4" />
                            <span>Add to Vault</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              {vaults.length > 0 ? vaults.map(vault => (
                                <DropdownMenuItem key={vault.id} onClick={(e) => handleAddToCollection(e, vault.id)}>
                                  {vault.name}
                                </DropdownMenuItem>
                              )) : <DropdownMenuItem disabled>No vaults created</DropdownMenuItem>}
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>

                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <Projector className="mr-2 h-4 w-4" />
                            <span>Add to Spotlight</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              {spotlights.length > 0 ? spotlights.map(spotlight => (
                                <DropdownMenuItem key={spotlight.id} onClick={(e) => handleAddToCollection(e, spotlight.id)}>
                                  {spotlight.name}
                                </DropdownMenuItem>
                              )) : <DropdownMenuItem disabled>No spotlights created</DropdownMenuItem>}
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
              </div>
              <div className="absolute -bottom-5 left-2 z-10">
                  <RatingCircle percentage={movie.rating} />
              </div>
          </div>
        
        <CardContent className="pt-8 px-2 flex-grow flex flex-col">
          <p className="text-base font-bold leading-tight truncate flex-grow" title={movie.title}>
            {movie.title}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{movie.releaseDate}</p>
        </CardContent>
      </Card>
    </Link>
  );
};
