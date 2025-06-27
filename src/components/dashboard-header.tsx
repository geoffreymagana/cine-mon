"use client";

import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DashboardHeaderProps = {
  onAddMovieClick: () => void;
};

export const DashboardHeader = ({ onAddMovieClick }: DashboardHeaderProps) => {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-8">
      <div className="flex-1">
        <h1 className="text-2xl font-headline font-semibold">My Collection</h1>
      </div>
      <div className="flex flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search library..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
        <Button onClick={onAddMovieClick} className="shrink-0">
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline ml-2">Add Movie</span>
        </Button>
      </div>
    </header>
  );
};
