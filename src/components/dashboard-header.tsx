
"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Plus, MoreVertical, X, Share2, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MovieService } from "@/lib/movie-service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DashboardHeaderProps = {
  onAddMovieClick: () => void;
  onSearchClick: () => void;
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
  selectedCount: number;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  onAddToCollection: () => void;
};

export const DashboardHeader = ({ 
  onAddMovieClick, 
  onSearchClick,
  isSelectionMode,
  onToggleSelectionMode,
  selectedCount,
  onClearSelection,
  onDeleteSelected,
  onAddToCollection
}: DashboardHeaderProps) => {
  const isMobile = useIsMobile();
  const [avatarUrl, setAvatarUrl] = React.useState("https://placehold.co/100x100.png");
  const [userName, setUserName] = React.useState("My");

  // This effect will run on the client to get data from IndexedDB.
  // It also listens for profile updates to stay in sync.
  const loadProfileData = React.useCallback(async () => {
    try {
        const [storedAvatar, storedName] = await Promise.all([
          MovieService.getSetting('profileAvatar'),
          MovieService.getSetting('profileName')
        ]);
        if (storedAvatar) {
            setAvatarUrl(storedAvatar);
        }
        if (storedName) {
            setUserName(storedName);
        } else {
            setUserName("My");
        }
    } catch (error) {
        console.error("Failed to access IndexedDB:", error);
    }
  }, []);
  
  React.useEffect(() => {
    loadProfileData();
    window.addEventListener('profileUpdated', loadProfileData);
    return () => window.removeEventListener('profileUpdated', loadProfileData);
  }, [loadProfileData]);
  
  if (isSelectionMode) {
    return (
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-secondary px-4 md:px-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClearSelection}>
            <X className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-lg">{selectedCount} Selected</span>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Share2 /></Button>
            <Button variant="ghost" size="icon" onClick={onAddToCollection}><PlusCircle /></Button>
            <Button variant="destructive" size="icon" onClick={onDeleteSelected}><Trash2 /></Button>
        </div>
      </header>
    )
  }

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
        <h1 className="text-xl md:text-2xl font-headline font-semibold">{userName === "My" ? "My Collection" : `${userName}'s Collection`}</h1>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onToggleSelectionMode}>Select Items</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
