
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, Plus, Search, Lightbulb, ChevronRight } from "lucide-react";
import type { Movie } from "@/lib/types";
import { getPosterUrl, searchMulti, mapTmdbResultToMovie } from "@/lib/tmdb";
import { Skeleton } from "./ui/skeleton";

type TmdbSearchResult = {
    id: number;
    media_type: 'movie' | 'tv';
    title: string;
    name: string;
    poster_path: string;
    release_date: string;
    first_air_date: string;
    overview: string;
};

type DisplayResult = {
    id: string | number;
    tmdbId?: number;
    title: string;
    posterUrl: string;
    year: string;
    overview: string;
    mediaType: 'Movie' | 'TV Show' | 'Anime' | 'movie' | 'tv';
    isLocal: boolean;
};


type SearchDialogProps = {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onSave: (movie: Omit<Movie, "id">) => void;
    existingMovies: Movie[];
};

export const SearchDialog = ({ isOpen, setIsOpen, onSave, existingMovies }: SearchDialogProps) => {
    const [query, setQuery] = React.useState("");
    const [displayResults, setDisplayResults] = React.useState<DisplayResult[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [importingIds, setImportingIds] = React.useState<Set<number>>(new Set());
    const [isOnline, setIsOnline] = React.useState(true);

    const existingTmdbIds = React.useMemo(() => new Set(existingMovies.map(m => m.tmdbId)), [existingMovies]);

    React.useEffect(() => {
      const updateOnlineStatus = () => setIsOnline(navigator.onLine);
      
      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
      
      updateOnlineStatus();

      return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
      };
    }, []);

    React.useEffect(() => {
        if (!isOpen) {
            setQuery("");
            setDisplayResults([]);
            setIsLoading(false);
        }
    }, [isOpen]);
    
    React.useEffect(() => {
        if (query.length < 2) {
            setDisplayResults([]);
            return;
        }

        setIsLoading(true);
        const debounceTimeout = setTimeout(async () => {
            if (isOnline) {
                const searchResults = await searchMulti(query);
                setDisplayResults(searchResults.map((r: TmdbSearchResult) => ({
                    id: r.id,
                    tmdbId: r.id,
                    title: r.title || r.name,
                    posterUrl: getPosterUrl(r.poster_path),
                    year: (r.release_date || r.first_air_date)?.substring(0, 4) || '',
                    overview: r.overview,
                    mediaType: r.media_type,
                    isLocal: false
                })));
            } else {
                const localResults = existingMovies.filter(m =>
                  m.title.toLowerCase().includes(query.toLowerCase())
                );
                setDisplayResults(localResults.map((m: Movie) => ({
                    id: m.id,
                    tmdbId: m.tmdbId,
                    title: m.title,
                    posterUrl: m.posterUrl,
                    year: m.releaseDate?.substring(0, 4) || '',
                    overview: m.description,
                    mediaType: m.type,
                    isLocal: true,
                })));
            }
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(debounceTimeout);
    }, [query, isOnline, existingMovies]);

    const handleImport = async (result: DisplayResult) => {
        setImportingIds(prev => new Set(prev).add(result.id as number));
        
        const details = await (result.mediaType === 'movie' 
            ? fetch(`https://api.themoviedb.org/3/movie/${result.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&append_to_response=credits,images,videos`).then(res => res.json())
            : fetch(`https://api.themoviedb.org/3/tv/${result.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&append_to_response=credits,images,videos`).then(res => res.json()));

        if (details) {
            const movieData = await mapTmdbResultToMovie({ ...details, media_type: result.mediaType });
            onSave(movieData);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="font-headline">{isOnline ? 'Search & Import' : 'Local Search (Offline)'}</DialogTitle>
                    <DialogDescription>
                        {isOnline 
                            ? "Search The Movie Database (TMDB) to add to your collection." 
                            : "Searching titles already in your collection."}
                    </DialogDescription>
                </DialogHeader>
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder={isOnline ? "Search TMDB..." : "Search your collection..."}
                        className="pl-10 text-base"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="flex-grow overflow-hidden relative pt-2">
                    <ScrollArea className="h-full">
                        <div className="space-y-4 pr-6">
                            {isLoading && query.length > 1 && (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex gap-4 p-2">
                                        <Skeleton className="w-[80px] h-[120px] rounded-md" />
                                        <div className="space-y-2 flex-grow">
                                            <Skeleton className="h-5 w-3/4" />
                                            <Skeleton className="h-4 w-1/4" />
                                            <Skeleton className="h-12 w-full" />
                                        </div>
                                    </div>
                                ))
                            )}
                            {!isLoading && displayResults.length > 0 && displayResults.map((result) => {
                                const isImported = result.tmdbId ? existingTmdbIds.has(result.tmdbId) : false;
                                const isImporting = importingIds.has(result.id as number);

                                const content = (
                                    <div className="flex items-start gap-4 p-2 rounded-lg hover:bg-muted/50 w-full text-left">
                                        <Image
                                            src={result.posterUrl}
                                            alt={result.title}
                                            width={80}
                                            height={120}
                                            className="w-[80px] h-[120px] object-cover rounded-md"
                                            data-ai-hint="movie poster"
                                        />
                                        <div className="flex-grow min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg truncate">{result.title}</h3>
                                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                        <span>{result.year}</span>
                                                        <Badge variant="outline" className="capitalize">{result.mediaType === 'tv' ? 'TV' : 'Movie'}</Badge>
                                                    </div>
                                                </div>
                                                {result.isLocal ? (
                                                    <Button size="sm" variant="ghost" className="pointer-events-none">
                                                        View <ChevronRight className="ml-2" />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        onClick={(e) => { e.preventDefault(); handleImport(result); }}
                                                        disabled={isImported || isImporting}
                                                    >
                                                        {isImported ? <Check className="mr-2" /> : (isImporting ? <Loader2 className="mr-2 animate-spin" /> : <Plus className="mr-2" />)}
                                                        {isImported ? 'Imported' : (isImporting ? 'Importing...' : 'Import')}
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{result.overview}</p>
                                        </div>
                                    </div>
                                );
                                
                                return result.isLocal ? (
                                    <Link key={result.id} href={`/app/movie/${result.id}`} onClick={() => setIsOpen(false)}>
                                        {content}
                                    </Link>
                                ) : (
                                    <div key={result.id}>
                                        {content}
                                    </div>
                                );
                            })}
                            {!isLoading && displayResults.length === 0 && (
                                <div className="text-center py-10 flex flex-col items-center justify-center h-full space-y-4">
                                    {query.length > 1 ? (
                                        <div className="text-center">
                                            <p className="font-semibold">No results found for "{query}".</p>
                                            <p className="text-muted-foreground text-sm">Try checking for typos or searching for another title.</p>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-muted-foreground flex items-start gap-2 p-3 rounded-lg border max-w-md text-left">
                                            <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                                            {isOnline ? (
                                                <span>Tip: You can use 'y:' to filter by year. Example: 'star wars y:1977'.</span>
                                            ) : (
                                                <span>You are offline. Search is limited to your local collection.</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
};
