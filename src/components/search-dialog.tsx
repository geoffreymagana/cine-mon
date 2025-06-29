"use client";

import * as React from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, Plus, Search, Lightbulb } from "lucide-react";
import type { Movie } from "@/lib/types";
import { getMovieDetails, getTvDetails, getPosterUrl, searchMulti, mapTmdbResultToMovie } from "@/lib/tmdb";
import { Skeleton } from "./ui/skeleton";

type SearchResult = {
    id: number;
    media_type: 'movie' | 'tv';
    title: string;
    name: string;
    poster_path: string;
    release_date: string;
    first_air_date: string;
    overview: string;
};

type SearchDialogProps = {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onSave: (movie: Omit<Movie, "id">) => void;
    existingMovies: Movie[];
};

export const SearchDialog = ({ isOpen, setIsOpen, onSave, existingMovies }: SearchDialogProps) => {
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [importingIds, setImportingIds] = React.useState<Set<number>>(new Set());

    const existingTmdbIds = React.useMemo(() => new Set(existingMovies.map(m => m.tmdbId)), [existingMovies]);

    React.useEffect(() => {
        if (!isOpen) {
            setQuery("");
            setResults([]);
            setIsLoading(false);
        }
    }, [isOpen]);
    
    React.useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        const debounceTimeout = setTimeout(async () => {
            const searchResults = await searchMulti(query);
            setResults(searchResults);
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(debounceTimeout);
    }, [query]);

    const handleImport = async (result: SearchResult) => {
        setImportingIds(prev => new Set(prev).add(result.id));
        
        let details;
        if (result.media_type === 'movie') {
            details = await getMovieDetails(result.id);
        } else {
            details = await getTvDetails(result.id);
        }

        if (details) {
            const movieData = mapTmdbResultToMovie({ ...details, media_type: result.media_type });
            onSave(movieData);
        }
        
        // Note: we don't remove from importingIds to keep the "Imported" state
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="font-headline">Search & Import</DialogTitle>
                    <DialogDescription>Search for movies and TV shows from The Movie Database (TMDB) to add to your collection.</DialogDescription>
                </DialogHeader>
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search for a title (e.g., The Matrix, Breaking Bad)..."
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
                            {!isLoading && results.length > 0 && results.map((result) => {
                                const isImported = existingTmdbIds.has(result.id);
                                const isImporting = importingIds.has(result.id);
                                const year = (result.release_date || result.first_air_date)?.substring(0, 4);

                                return (
                                <div key={result.id} className="flex items-start gap-4 p-2 rounded-lg hover:bg-muted/50">
                                    <Image
                                        src={getPosterUrl(result.poster_path)}
                                        alt={result.title || result.name}
                                        width={80}
                                        height={120}
                                        className="w-[80px] h-[120px] object-cover rounded-md"
                                        data-ai-hint="movie poster"
                                    />
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg">{result.title || result.name}</h3>
                                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <span>{year}</span>
                                                    <Badge variant="outline" className="capitalize">{result.media_type === 'tv' ? 'TV' : 'Movie'}</Badge>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => handleImport(result)}
                                                disabled={isImported || isImporting}
                                            >
                                                {isImported ? <Check className="mr-2" /> : (isImporting ? <Loader2 className="mr-2 animate-spin" /> : <Plus className="mr-2" />)}
                                                {isImported ? 'Imported' : (isImporting ? 'Importing...' : 'Import')}
                                            </Button>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{result.overview}</p>
                                    </div>
                                </div>
                            )})}
                            {!isLoading && results.length === 0 && (
                                <div className="text-center py-10 flex flex-col items-center justify-center h-full">
                                    {query.length > 1 ? (
                                        <>
                                            <p className="font-semibold">No results found for "{query}".</p>
                                            <p className="text-muted-foreground text-sm">Try checking for typos or searching for another title.</p>
                                        </>
                                    ) : (
                                        <>
                                            <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                            <p className="font-semibold">Search for something to import</p>
                                        </>
                                    )}
                                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 px-2 py-1 mt-6 rounded-md border bg-muted/50 max-w-md text-left">
                                        <Lightbulb className="h-6 w-6 shrink-0" />
                                        <span>Tip: You can use the 'y:' filter to narrow your results by year. Example: 'star wars y:1977'.</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
};
