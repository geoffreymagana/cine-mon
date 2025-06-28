
"use client";

import * as React from "react";
import { Search, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

type DashboardHeaderProps = {
  onAddMovieClick: () => void;
  onSearchClick: () => void;
};

export const DashboardHeader = ({ onAddMovieClick, onSearchClick }: DashboardHeaderProps) => {
  const { isMobile } = useSidebar();
  
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-8">
      <div className="flex items-center gap-4">
        {isMobile && <SidebarTrigger />}
        <h1 className="text-xl md:text-2xl font-headline font-semibold">My Collection</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search TMDB..."
              className="pl-8 sm:w-[200px] lg:w-[300px] cursor-pointer"
              onFocus={onSearchClick}
              readOnly
            />
        </div>
        <Button variant="ghost" size="icon" className="sm:hidden shrink-0" onClick={onSearchClick}>
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
        </Button>
        <Button onClick={onAddMovieClick} className="shrink-0">
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline ml-2">Add Manually</span>
        </Button>
      </div>
    </header>
  );
};
