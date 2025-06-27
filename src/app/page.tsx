"use client";

import * as React from "react";
import type { Movie } from "@/lib/types";
import { initialMovies } from "@/lib/data";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, SidebarFooter, SidebarInset } from "@/components/ui/sidebar";
import { Film, Tv, Clapperboard, Shuffle, Settings, Sun, Moon, Popcorn } from "lucide-react";
import { CineMonLogo } from "@/components/cine-mon-logo";
import { DashboardHeader } from "@/components/dashboard-header";
import { MovieGrid } from "@/components/movie-grid";
import { AddMovieDialog } from "@/components/add-movie-dialog";
import { SpinWheelDialog } from "@/components/spin-wheel-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const [movies, setMovies] = React.useState<Movie[]>(initialMovies);
  const [filter, setFilter] = React.useState<'All' | Movie['type']>('All');
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [isAddMovieOpen, setIsAddMovieOpen] = React.useState(false);
  const [isSpinWheelOpen, setIsSpinWheelOpen] = React.useState(false);
  const [movieToEdit, setMovieToEdit] = React.useState<Movie | undefined>(undefined);
  const { toast } = useToast();

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const handleAddMovie = (newMovie: Omit<Movie, "id">) => {
    const movieWithId = { ...newMovie, id: crypto.randomUUID() };
    setMovies((prev) => [movieWithId, ...prev]);
    toast({
      title: "Success!",
      description: `${newMovie.title} has been added to your collection.`,
    });
  };

  const handleUpdateMovie = (updatedMovie: Movie) => {
    setMovies((prev) =>
      prev.map((movie) => (movie.id === updatedMovie.id ? updatedMovie : movie))
    );
    setMovieToEdit(undefined);
    toast({
      title: "Success!",
      description: `${updatedMovie.title} has been updated.`,
    });
  };

  const handleDeleteMovie = (movieId: string) => {
    setMovies((prev) => prev.filter((movie) => movie.id !== movieId));
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
          <div className="flex items-center gap-2">
            <CineMonLogo className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-headline font-bold">Cine-Mon</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setIsSpinWheelOpen(true)} tooltip="Suggest something to watch">
                <Shuffle />
                <span>Surprise Me</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
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
        </SidebarContent>
        <SidebarFooter>
           <div className="flex items-center gap-2 p-2">
            <Settings className="w-5 h-5" />
            <h3 className="font-semibold font-headline">Settings</h3>
          </div>
          <div className="flex items-center justify-between p-2">
            <Label htmlFor="dark-mode" className="flex items-center gap-2">
              {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span>Dark Mode</span>
            </Label>
            <Switch
              id="dark-mode"
              checked={isDarkMode}
              onCheckedChange={setIsDarkMode}
            />
          </div>
          <Separator className="my-1" />
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
        <main className="min-h-screen flex flex-col">
          <DashboardHeader onAddMovieClick={handleOpenAddDialog} />
          <div className="flex-grow p-4 md:p-8">
            <MovieGrid
              movies={filteredMovies}
              onEdit={handleEdit}
              onDelete={handleDeleteMovie}
            />
          </div>
        </main>
      </SidebarInset>

      <AddMovieDialog
        isOpen={isAddMovieOpen}
        setIsOpen={setIsAddMovieOpen}
        onSave={movieToEdit ? handleUpdateMovie : handleAddMovie}
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
