
"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type DashboardHeaderProps = {
  onAddMovieClick: () => void;
  onSearchClick: () => void;
};

export const DashboardHeader = ({ onAddMovieClick, onSearchClick }: DashboardHeaderProps) => {
  const isMobile = useIsMobile();
  const [avatarUrl, setAvatarUrl] = React.useState("https://placehold.co/100x100.png");

  // This effect will run on the client to get the avatar from localStorage.
  // It also listens for profile updates to stay in sync.
  React.useEffect(() => {
    try {
        const storedAvatar = localStorage.getItem('profileAvatar');
        if (storedAvatar) setAvatarUrl(storedAvatar);
    } catch (error) {
        console.error("Failed to access localStorage:", error);
    }

    const handleProfileUpdate = () => {
         const storedAvatar = localStorage.getItem('profileAvatar');
         if (storedAvatar) setAvatarUrl(storedAvatar);
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-8">
      <div className="flex items-center gap-4">
        {isMobile ? (
          <Link href="/app/profile" aria-label="Go to profile">
            <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl} alt="User Avatar" data-ai-hint="person portrait"/>
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </Link>
        ) : null}
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
