
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
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { BottomNav } from "@/components/bottom-nav";
import Image from "next/image";
import cineMonLogo from '@/app/assets/logo/cine-mon-logo.png';

export default function DashboardPage() {
  const [movies, setMovies] = React.useState<Movie[]>([]);
  const [filter, setFilter] = React.useState<'All' | Movie['type']>('All');
  const [isAddMovieOpen, setIsAddMovieOpen] = React.useState(false);
  const [isSpinWheelOpen, setIsSpinWheelOpen] = React.useState(false);
  const [movieToEdit, setMovieToEdit] = React.useState<Movie | undefined>(undefined);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  React.useEffect(() => {
    try {
      const storedMovies = localStorage.getItem('movies');
      if (storedMovies) {
        setMovies(JSON.parse(storedMovies));
      } else {
        localStorage.setItem('movies', JSON.stringify(initialMovies));
        setMovies(initialMovies);
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

  const handleSaveMovie = (movieData: Movie | Omit<Movie, "id">) => {
    let updatedMovies: Movie[];
    if ("id" in movieData) {
      // Update existing movie
      updatedMovies = movies.map((movie) => (movie.id === movieData.id ? movieData : movie));
      toast({
        title: "Success!",
        description: `${movieData.title} has been updated.`,
      });
    } else {
      // Add new movie
      const movieWithId = { ...movieData, id: crypto.randomUUID() };
      updatedMovies = [movieWithId, ...movies];
      toast({
        title: "Success!",
        description: `${movieData.title} has been added to your collection.`,
      });
    }
    setMovies(updatedMovies);
    updateMoviesInStorage(updatedMovies);
    setMovieToEdit(undefined);
  };

  const handleDeleteMovie = (movieId: string) => {
    const updatedMovies = movies.filter((movie) => movie.id !== movieId);
    setMovies(updatedMovies);
    updateMoviesInStorage(updatedMovies);
    toast({
      title: "Movie Removed",
      description: "The movie has been removed from your collection.",
      variant: "destructive"
    });
  };

  const handleEdit = (movie: Movie) => {
    setMovieToEdit(movie);
    setIsAddMovieOpen(true);
  };
  
  const handleOpenAddDialog = () => {
    setMovieToEdit(undefined);
    setIsAddMovieOpen(true);
  };

  const filteredMovies = React.useMemo(() => {
    if (filter === 'All') {
      return movies;
    }
    return movies.filter((movie) => movie.type === filter);
  }, [movies, filter]);

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
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="View your watch statistics">
                    <Link href="/analytics">
                        <ChartPie />
                        <span>Analytics</span>
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-2">
              <Link href="/profile">
                  <Button variant="ghost" className="w-full justify-start h-auto p-2">
                      <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="person portrait"/>
                          <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                          <span className="font-semibold">Cine-Mon User</span>
                          <span className="text-xs text-muted-foreground">View Profile</span>
                      </div>
                  </Button>
              </Link>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <main className="min-h-screen flex flex-col pb-16 md:pb-0">
          <DashboardHeader onAddMovieClick={handleOpenAddDialog} />
          <div className="flex-grow p-4 md:p-8">
            <MovieGrid
              movies={filteredMovies}
              onEdit={handleEdit}
              onDelete={handleDeleteMovie}
            />
          </div>
        </main>
         {isMobile && <BottomNav filter={filter} setFilter={setFilter} onSurpriseMeClick={() => setIsSpinWheelOpen(true)} />}
      </SidebarInset>

      <AddMovieDialog
        isOpen={isAddMovieOpen}
        setIsOpen={setIsAddMovieOpen}
        onSave={handleSaveMovie}
        movieToEdit={movieToEdit}
      />

      <SpinWheelDialog
        isOpen={isSpinWheelOpen}
        setIsOpen={setIsSpinWheelOpen}
        movies={movies}
      />
    </SidebarProvider>
  );
}
