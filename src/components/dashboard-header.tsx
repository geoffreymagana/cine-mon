"use client";

import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

type DashboardHeaderProps = {
  onAddMovieClick: () => void;
};

export const DashboardHeader = ({ onAddMovieClick }: DashboardHeaderProps) => {
  const { isMobile } = useSidebar();
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-8">
      <div className="flex items-center gap-4">
        {isMobile && <SidebarTrigger />}
        <h1 className="text-xl md:text-2xl font-headline font-semibold">My Collection</h1>
      </div>
      <div className="flex items-center gap-2">
        {/* Full search bar for larger screens */}
        <form className="hidden sm:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search library..."
              className="pl-8 sm:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
        {/* Search icon for smaller screens */}
        <Button variant="ghost" size="icon" className="sm:hidden shrink-0">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
        </Button>
        <Button onClick={onAddMovieClick} className="shrink-0">
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline ml-2">Add Movie</span>
        </Button>
      </div>
    </header>
  );
};
