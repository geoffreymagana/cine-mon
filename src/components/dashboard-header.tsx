"use client";

import * as React from "react";
import { Search, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

type DashboardHeaderProps = {
  onAddMovieClick: () => void;
};

export const DashboardHeader = ({ onAddMovieClick }: DashboardHeaderProps) => {
  const { isMobile } = useSidebar();
  const [isSearchVisible, setIsSearchVisible] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isMobile && isSearchVisible && inputRef.current) {
        inputRef.current.focus();
    }
  }, [isMobile, isSearchVisible]);
  
  if (isMobile && isSearchVisible) {
      return (
        <header className="sticky top-0 z-10 flex h-16 items-center gap-2 border-b bg-background/80 backdrop-blur-sm px-4">
            <Button variant="ghost" size="icon" onClick={() => setIsSearchVisible(false)} className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
            </Button>
            <form className="flex-1">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        type="search"
                        placeholder="Search library..."
                        className="pl-8 w-full"
                    />
                </div>
            </form>
        </header>
      )
  }

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
        <Button variant="ghost" size="icon" className="sm:hidden shrink-0" onClick={() => setIsSearchVisible(true)}>
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
