
"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Plus, MoreVertical, X, PlusCircle, Trash2, Share2, LibraryBig } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSearchParams, useRouter } from "next/navigation";
import type { Movie } from "@/lib/types";

type DashboardHeaderProps = {
  onAddMovieClick: () => void;
  onSearchClick: () => void;
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
  selectedCount: number;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  onAddToCollection: () => void;
  onSelectAll: (filteredMovies: Movie[]) => void;
  allMovies: Movie[];
};

export const DashboardHeader = ({ 
  onAddMovieClick, 
  onSearchClick,
  isSelectionMode,
  onToggleSelectionMode,
  selectedCount,
  onClearSelection,
  onDeleteSelected,
  onAddToCollection,
  onSelectAll,
  allMovies,
}: DashboardHeaderProps) => {
  const isMobile = useIsMobile();
  const router = useRouter();
  
  const [avatarUrl, setAvatarUrl] = React.useState("https://placehold.co/100x100.png");
  const [userName, setUserName] = React.useState("My");

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
  
  const isAllSelected = allMovies.length > 0 && selectedCount === allMovies.length;
  
  if (isSelectionMode) {
    return (
      <header className="flex h-16 items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClearSelection}>
            <X className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-lg">{selectedCount}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="select-all"
                    checked={isAllSelected}
                    onCheckedChange={() => onSelectAll(allMovies)}
                />
                <Label htmlFor="select-all" className="text-sm font-medium leading-none cursor-pointer">
                    Select all
                </Label>
            </div>
             <Button
                variant="ghost"
                size="icon"
                disabled={true}
                title="Share selected items (coming soon)"
            >
                <Share2 />
            </Button>
            <Button variant="ghost" size="icon" onClick={onAddToCollection} title="Add to Collection"><PlusCircle /></Button>
            <Button variant="destructive" size="icon" onClick={onDeleteSelected} title="Delete Selected"><Trash2 /></Button>
        </div>
      </header>
    )
  }

  return (
    <header className="flex h-16 items-center justify-between gap-4 px-4 md:px-8">
      <div className="flex items-center gap-4">
        {isMobile ? (
          <Link href="/app/profile" aria-label="Go to profile">
            <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl} alt="User Avatar" data-ai-hint="person portrait"/>
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </Link>
        ) : null}
        <h1 className="text-base md:text-lg font-headline font-semibold">{userName === "My" ? "My Collection" : `${userName}'s Collection`}</h1>
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

        <Button onClick={onAddMovieClick} className="hidden sm:inline-flex shrink-0">
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline ml-2">Add Manually</span>
        </Button>
        <Button onClick={onAddMovieClick} variant="ghost" size="icon" className="sm:hidden shrink-0">
            <Plus className="h-5 w-5" />
            <span className="sr-only">Add Manually</span>
        </Button>
        
        <Button variant="default" size="icon" className="sm:hidden shrink-0" onClick={onSearchClick}>
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onToggleSelectionMode}>Select Items</DropdownMenuItem>
             <DropdownMenuItem onSelect={() => router.push('/app/collections')}>
                <LibraryBig className="mr-2 h-4 w-4" />
                <span>View Collections</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
