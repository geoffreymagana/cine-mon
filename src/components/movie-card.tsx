
"use client";

import Image from "next/image";
import type { Movie } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RatingCircle } from "./rating-circle";

type MovieCardProps = {
  movie: Movie;
  onEdit: () => void;
  onDelete: () => void;
};

export const MovieCard = ({ movie, onEdit, onDelete }: MovieCardProps) => {
  return (
    <Card className="overflow-visible flex flex-col group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
        <div className="relative">
            <div className="aspect-[2/3] w-full rounded-lg overflow-hidden border border-border/10">
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
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/70 backdrop-blur-sm">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
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
      
      <CardContent className="pt-8 px-2">
        <p className="text-base font-bold leading-tight truncate" title={movie.title}>
          {movie.title}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{movie.releaseDate}</p>
      </CardContent>
    </Card>
  );
};
