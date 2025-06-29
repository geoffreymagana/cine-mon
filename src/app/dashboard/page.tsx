
"use client";

import * as React from "react";
import type { Movie } from "@/lib/types";
import { initialMovies } from "@/lib/data";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, SidebarFooter, SidebarInset, SidebarGroup, SidebarSeparator } from "@/components/ui/sidebar";
import { Film, Tv, Clapperboard, Shuffle, Popcorn, ChartPie } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { MovieGrid } from "@/components/movie-grid";
import { AddMovieDialog } from "@/components/add-movie-dialog";
import { SpinWheelDialog } from "@/components/spin-wheel-dialog";
import { SearchDialog } from "@/components/search-dialog";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { BottomNav } from "@/components/bottom-nav";
import Image from "next/image";
import cineMonLogo from '@/app/assets/logo/cine-mon-logo.png';
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

export default function DashboardPage() {
  const [movies, setMovies] = React.useState<Movie[]>([]);
  const [filter, setFilter] = React.useState<'All' | Movie['type']>('All');
  const [isAddMovieOpen, setIsAddMovieOpen] = React.useState(false);
  const [isSpinWheelOpen, setIsSpinWheelOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState("https://placehold.co/100x100.png");
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
        localStorage.setItem('movies', JSON.stringify(initialMovies));
        setMovies(initialMovies);
      }
      const storedAvatar = localStorage.getItem('profileAvatar');
      if (storedAvatar) {
        setAvatarUrl(storedAvatar);
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error);
      setMovies(initialMovies);
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
    // Check for duplicates before adding
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

  const handleDeleteMovie = (movieId: string) => {
    const movieToDelete = movies.find((movie) => movie.id === movieId);
    if (!movieToDelete) return;

    const updatedMovies = movies.filter((movie) => movie.id !== movieId);
    setMovies(updatedMovies);
    updateMoviesInStorage(updatedMovies);
    toast({
      title: "Movie Removed",
      description: `"${movieToDelete.title}" has been removed from your collection.`,
      variant: "destructive"
    });
  };
  
  const handleOpenAddDialog = () => {
    setIsAddMovieOpen(true);
  };
  
  const handleOpenSearchDialog = () => {
    setIsSearchOpen(true);
  };

  const filteredMovies = React.useMemo(() => {
    if (filter === 'All') {
      return movies;
    }
    return movies.filter((movie) => movie.type === filter);
  }, [movies, filter]);

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;

    if (over && active.id !== over.id) {
      setMovies((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        if (oldIndex === -1 || newIndex === -1) {
            return items;
        }

        const newItems = arrayMove(items, oldIndex, newIndex);
        updateMoviesInStorage(newItems);
        return newItems;
      });
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Image src={cineMonLogo} alt="Cine-Mon Logo" width={32} height={32} data-ai-hint="logo" />
            <h1 className="text-2xl font-headline font-bold">Cine-Mon</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
           {!isMobile && (
              <>
                <SidebarGroup>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton onClick={() => setIsSpinWheelOpen(true)} tooltip="Suggest something to watch">
                        <Shuffle />
                        <span>Surprise Me</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
                <SidebarSeparator />
                <SidebarGroup>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={filter === 'All'} onClick={() => setFilter('All')}>
                        <Clapperboard />
                        <span>All</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={filter === 'Movie'} onClick={() => setFilter('Movie')}>
                        <Film />
                        <span>Movies</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={filter === 'TV Show'} onClick={() => setFilter('TV Show')}>
                        <Tv />
                        <span>TV Shows</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={filter === 'Anime'} onClick={() => setFilter('Anime')}>
                        <Popcorn />
                        <span>Anime</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
                <SidebarSeparator />
              </>
            )}
        </SidebarContent>
        <SidebarFooter>
          <div className="p-2">
              <Link href="/profile">
                  <Button variant="ghost" className="w-full justify-start h-auto p-2">
                      <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={avatarUrl} alt="User Avatar" data-ai-hint="person portrait"/>
                          <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                          <span className="font-semibold">Cine-Mon User</span>
                          <span className="text-xs text-muted-foreground">@cinemon_user</span>
                      </div>
                  </Button>
              </Link>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
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
                onDelete={handleDeleteMovie}
              />
            </DndContext>
          </div>
        </main>
         {isMobile && <BottomNav filter={filter} setFilter={setFilter} onSurpriseMeClick={() => setIsSpinWheelOpen(true)} />}
      </SidebarInset>

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

      <SpinWheelDialog
        isOpen={isSpinWheelOpen}
        setIsOpen={setIsSpinWheelOpen}
        movies={movies}
      />
    </SidebarProvider>
  );
}
