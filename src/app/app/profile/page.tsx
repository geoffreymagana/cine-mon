
'use client';

import * as React from 'react';
import Link from "next/link";
import { 
    Moon, 
    Sun, 
    Upload, 
    ArrowLeft,
    Info,
    BookOpenCheck,
    ListOrdered,
    Lightbulb,
    Keyboard,
    DownloadCloud,
    FileText,
    Mail,
    ChartPie,
    LibraryBig,
    MessageSquare,
    ShieldCheck
} from "lucide-react";

import { ProfileHeader } from "@/components/profile-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { Movie, UserCollection, CanvasBoard, Setting } from '@/lib/types';
import { MovieService } from '@/lib/movie-service';
import { db } from '@/lib/database';
import { ImportConfirmationDialog } from '@/components/import-confirmation-dialog';
import { version } from '../../../../package.json';

const themes = [
    { name: 'purple', displayColor: 'hsl(275, 76%, 58%)' },
    { name: 'red', displayColor: 'hsl(347, 77%, 50%)' },
    { name: 'green', displayColor: 'hsl(142, 71%, 45%)' },
    { name: 'orange', displayColor: 'hsl(38, 92%, 50%)' },
    { name: 'blue', displayColor: 'hsl(217, 91%, 60%)' },
];

const sanitizeMovie = (movie: any, existing?: Movie): Movie => {
    const sanitized = { ...existing, ...movie };
    
    // Core fields
    sanitized.id = sanitized.id && typeof sanitized.id === 'string' ? sanitized.id : existing?.id || crypto.randomUUID();
    sanitized.title = typeof sanitized.title === 'string' && sanitized.title ? sanitized.title : 'Untitled';
    sanitized.description = typeof sanitized.description === 'string' ? sanitized.description : '';
    sanitized.posterUrl = typeof sanitized.posterUrl === 'string' ? sanitized.posterUrl : 'https://placehold.co/500x750.png';
    sanitized.type = ['Movie', 'TV Show', 'Anime'].includes(sanitized.type) ? sanitized.type : 'Movie';
    sanitized.status = ['Watching', 'Completed', 'On-Hold', 'Dropped', 'Plan to Watch'].includes(sanitized.status) ? sanitized.status : 'Plan to Watch';
    
    // Numeric fields
    sanitized.rating = typeof sanitized.rating === 'number' ? sanitized.rating : 0;
    sanitized.sortOrder = typeof sanitized.sortOrder === 'number' ? sanitized.sortOrder : Date.now();
    sanitized.rewatchCount = typeof sanitized.rewatchCount === 'number' ? sanitized.rewatchCount : 0;
    sanitized.budget = typeof sanitized.budget === 'number' ? sanitized.budget : undefined;
    sanitized.revenue = typeof sanitized.revenue === 'number' ? sanitized.revenue : undefined;
    sanitized.runtime = typeof sanitized.runtime === 'number' ? sanitized.runtime : undefined;

    // Series specific
    sanitized.watchedEpisodes = typeof sanitized.watchedEpisodes === 'number' ? sanitized.watchedEpisodes : 0;
    sanitized.totalEpisodes = typeof sanitized.totalEpisodes === 'number' && sanitized.totalEpisodes > 0 ? sanitized.totalEpisodes : 1;
    sanitized.seasons = Array.isArray(sanitized.seasons) ? sanitized.seasons : undefined;
    
    // String fields
    sanitized.releaseDate = typeof sanitized.releaseDate === 'string' ? sanitized.releaseDate : '';
    sanitized.director = typeof sanitized.director === 'string' ? sanitized.director : undefined;
    sanitized.collection = typeof sanitized.collection === 'string' ? sanitized.collection : undefined;
    sanitized.backdropUrl = typeof sanitized.backdropUrl === 'string' ? sanitized.backdropUrl : undefined;
    sanitized.trailerUrl = typeof sanitized.trailerUrl === 'string' ? sanitized.trailerUrl : undefined;
    sanitized.productionCountries = typeof sanitized.productionCountries === 'string' ? sanitized.productionCountries : undefined;
    sanitized.scriptUrl = typeof sanitized.scriptUrl === 'string' ? sanitized.scriptUrl : undefined;
    sanitized.dominantColor = typeof sanitized.dominantColor === 'string' ? sanitized.dominantColor : undefined;

    // Array fields
    sanitized.tags = Array.isArray(sanitized.tags) ? sanitized.tags.filter((t: any) => typeof t === 'string') : [];
    sanitized.cast = Array.isArray(sanitized.cast) ? sanitized.cast : undefined;
    sanitized.alternatePosters = Array.isArray(sanitized.alternatePosters) ? sanitized.alternatePosters : undefined;
    
    return sanitized as Movie;
};

type ImportData = {
    newMovies?: Movie[];
    conflictingMovies?: Movie[];
    movies?: Movie[];
    collections?: UserCollection[];
    canvases?: CanvasBoard[];
    settings?: Setting[];
};

export default function ProfilePage() {
    const [name, setName] = React.useState('Cine-Mon User');
    const [username, setUsername] = React.useState('cinemon_user');
    const [bio, setBio] = React.useState('');
    const { toast } = useToast();

    const [isDarkMode, setIsDarkMode] = React.useState(true);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [activeSection, setActiveSection] = React.useState('personal-info');
    const mainContentRef = React.useRef<HTMLDivElement>(null);
    const [activeTheme, setActiveTheme] = React.useState(themes[0].name);

    const [allMovies, setAllMovies] = React.useState<Movie[]>([]);
    const [isImportConfirmOpen, setIsImportConfirmOpen] = React.useState(false);
    const [importData, setImportData] = React.useState<ImportData | null>(null);
    const [isFullBackupImport, setIsFullBackupImport] = React.useState(false);

    const sections = ['personal-info', 'appearance', 'settings', 'resources'];
    const sectionRefs = React.useMemo(() => sections.reduce((acc, sec) => {
        acc[sec] = React.createRef<HTMLDivElement>();
        return acc;
    }, {} as Record<string, React.RefObject<HTMLDivElement>>), []);

    React.useEffect(() => {
        const loadSettings = async () => {
            const [storedTheme, storedDarkMode, storedName, storedUsername, storedBio, moviesFromDb] = await Promise.all([
                MovieService.getSetting('cinemon-theme'),
                MovieService.getSetting('cinemon-dark-mode'),
                MovieService.getSetting('profileName'),
                MovieService.getSetting('profileUsername'),
                MovieService.getSetting('profileBio'),
                MovieService.getMovies()
            ]);
            
            setAllMovies(moviesFromDb);

            const currentTheme = storedTheme || themes[0].name;
            const currentDarkMode = storedDarkMode !== 'false';
            
            setIsDarkMode(currentDarkMode);
            setActiveTheme(currentTheme);

            document.documentElement.classList.toggle('dark', currentDarkMode);
            document.documentElement.classList.forEach(cls => {
                if (cls.startsWith('theme-')) document.documentElement.classList.remove(cls);
            });
            if (currentTheme !== 'purple') {
                document.documentElement.classList.add(`theme-${currentTheme}`);
            }

            if (storedName) setName(storedName);
            if (storedUsername) setUsername(storedUsername);
            if (storedBio) setBio(storedBio);
        };
        
        loadSettings();
    }, []);

    React.useEffect(() => {
        const scrollContainer = mainContentRef.current;
        if (!scrollContainer) return;

        const observerOptions = {
            root: scrollContainer,
            rootMargin: '-40% 0px -60% 0px',
            threshold: 0,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, observerOptions);

        const refs = Object.values(sectionRefs);
        refs.forEach(ref => {
            if (ref.current) {
                observer.observe(ref.current);
            }
        });

        return () => {
            refs.forEach(ref => {
                if (ref.current) {
                    observer.unobserve(ref.current);
                }
            });
        };
    }, [sectionRefs]);
    
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/json') {
            toast({
                title: "Invalid File Type",
                description: "Please select a valid JSON file.",
                variant: "destructive",
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = event.target?.result as string;
                const parsedData = JSON.parse(json);

                if (parsedData.format === 'CineMon-Backup' && parsedData.data) {
                    setImportData(parsedData.data);
                    setIsFullBackupImport(true);
                    setIsImportConfirmOpen(true);
                    return;
                }

                let importedMovies: any[] = [];
                if (Array.isArray(parsedData)) {
                    importedMovies = parsedData;
                } else if (typeof parsedData === 'object' && parsedData !== null) {
                    if (Array.isArray(parsedData.movies)) {
                        importedMovies = parsedData.movies;
                    } else if (parsedData.title) {
                        importedMovies = [parsedData];
                    }
                }
                
                if (importedMovies.length === 0) {
                    toast({
                        title: "Empty File",
                        description: "The imported file contains no movie data.",
                        variant: 'destructive'
                    });
                    return;
                }
                
                const existingMoviesById = new Map(allMovies.map(m => [m.id, m]));
                const existingMoviesByTmdbId = new Map<number, Movie>();
                const existingMoviesByTitleAndDate = new Map<string, Movie>();

                allMovies.forEach(movie => {
                    if (movie.tmdbId) {
                        existingMoviesByTmdbId.set(movie.tmdbId, movie);
                    }
                    const key = `${(movie.title || '').toLowerCase().trim()}|${movie.releaseDate || ''}`;
                    if(movie.title) existingMoviesByTitleAndDate.set(key, movie);
                });

                const newMovies: Movie[] = [];
                const conflictingMovies: Movie[] = [];
                let skippedCount = 0;

                for (const importedMovie of importedMovies) {
                    if (typeof importedMovie !== 'object' || importedMovie === null || !importedMovie.title) {
                        skippedCount++;
                        continue;
                    }

                    let existingMovie: Movie | undefined = undefined;

                    if (importedMovie.tmdbId && existingMoviesByTmdbId.has(importedMovie.tmdbId)) {
                        existingMovie = existingMoviesByTmdbId.get(importedMovie.tmdbId);
                    } else if (importedMovie.id && existingMoviesById.has(importedMovie.id)) {
                        existingMovie = existingMoviesById.get(importedMovie.id);
                    } else {
                        const key = `${(importedMovie.title || '').toLowerCase().trim()}|${importedMovie.releaseDate || ''}`;
                        if (key && existingMoviesByTitleAndDate.has(key)) {
                            existingMovie = existingMoviesByTitleAndDate.get(key);
                        }
                    }

                    if (existingMovie) {
                        conflictingMovies.push({ ...importedMovie, id: existingMovie.id });
                    } else {
                        newMovies.push(importedMovie);
                    }
                }
                
                if (conflictingMovies.length > 0) {
                    setImportData({ newMovies, conflictingMovies });
                    setIsFullBackupImport(false);
                    setIsImportConfirmOpen(true);
                } else if (newMovies.length > 0) {
                    const moviesToSave = newMovies.map(m => sanitizeMovie(m));
                    await MovieService.saveAllMovies([...allMovies, ...moviesToSave]);
                    toast({
                        title: "Import Successful!",
                        description: `${moviesToSave.length} new titles added. ${skippedCount > 0 ? `${skippedCount} invalid entries skipped.`: ''} The page will now reload.`,
                    });
                    setTimeout(() => window.location.reload(), 3000);
                } else {
                    toast({
                        title: "Nothing to Import",
                        description: `No new titles were found. ${skippedCount > 0 ? `${skippedCount} invalid entries were skipped.`: ''}`,
                    });
                }

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "The selected file could not be imported. Please check the file format.";
                console.error("Failed to parse or process JSON:", error);
                toast({
                    title: "Import Failed",
                    description: errorMessage,
                    variant: "destructive",
                });
            } finally {
                if (e.target) e.target.value = "";
            }
        };
        reader.readAsText(file);
    };
    
    const handleImportConfirm = async (resolution: 'skip' | 'overwrite' | 'cancel' | 'overwrite-all') => {
        setIsImportConfirmOpen(false);

        if (resolution === 'cancel') {
            setImportData(null);
            setIsFullBackupImport(false);
            toast({ title: "Import Canceled" });
            return;
        }

        if (isFullBackupImport && resolution === 'overwrite-all') {
            if (!importData) return;
            try {
                toast({ title: "Restoring library...", description: "Please wait, this may take a moment." });
                await db.transaction('rw', db.movies, db.collections, db.canvases, db.settings, async () => {
                    await Promise.all([
                        db.movies.clear(),
                        db.collections.clear(),
                        db.canvases.clear(),
                        db.settings.clear(),
                    ]);
                    if (importData.movies) await db.movies.bulkPut(importData.movies);
                    if (importData.collections) await db.collections.bulkPut(importData.collections);
                    if (importData.canvases) await db.canvases.bulkPut(importData.canvases);
                    if (importData.settings) await db.settings.bulkPut(importData.settings);
                });
                toast({ title: "Library Restored!", description: "Your data has been restored from the backup. The page will now reload." });
                setTimeout(() => window.location.reload(), 2000);
            } catch (error) {
                console.error("Full backup restore failed:", error);
                toast({ title: "Restore Failed", description: "An error occurred while restoring your library.", variant: "destructive" });
            }
        } else if (!isFullBackupImport && importData) {
            let finalMovies: Movie[] = [...allMovies];
            let toastDescription = "";

            if (resolution === 'skip') {
                const newSanitizedMovies = (importData.newMovies || []).map(m => sanitizeMovie(m));
                finalMovies.push(...newSanitizedMovies);
                toastDescription = `${newSanitizedMovies.length} new titles imported. ${(importData.conflictingMovies || []).length} duplicates skipped.`;
            } else if (resolution === 'overwrite') {
                const movieMap = new Map(finalMovies.map(m => [m.id, m]));
                [...(importData.newMovies || []), ...(importData.conflictingMovies || [])].forEach(m => {
                    const existing = movieMap.get(m.id);
                    movieMap.set(m.id, sanitizeMovie(m, existing));
                });
                finalMovies = Array.from(movieMap.values());
                toastDescription = `${(importData.newMovies || []).length} new titles added and ${(importData.conflictingMovies || []).length} existing titles updated.`;
            }

            try {
                await MovieService.saveAllMovies(finalMovies);
                toast({ title: "Import Complete!", description: `${toastDescription} Page will now reload.` });
                setTimeout(() => window.location.reload(), 3000);
            } catch (error) {
                console.error("Failed to save movies after confirmation:", error);
                toast({ title: "Import Failed", description: "An error occurred while saving the movies.", variant: "destructive" });
            }
        }
        
        setImportData(null);
        setIsFullBackupImport(false);
    };

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        e.preventDefault();
        const section = sectionRefs[sectionId]?.current;
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setActiveSection(sectionId);
    };

    const handleThemeChange = (themeName: string) => {
        document.documentElement.classList.forEach(cls => {
            if (cls.startsWith('theme-')) document.documentElement.classList.remove(cls);
        });

        if (themeName !== 'purple') {
            document.documentElement.classList.add(`theme-${themeName}`);
        }
        
        MovieService.setSetting('cinemon-theme', themeName);
        setActiveTheme(themeName);
    };

    const handleDarkModeToggle = (isDark: boolean) => {
        setIsDarkMode(isDark);
        MovieService.setSetting('cinemon-dark-mode', String(isDark));
        document.documentElement.classList.toggle("dark", isDark);
    };

    const handleSaveChanges = async () => {
        try {
            await Promise.all([
                MovieService.setSetting('profileName', name),
                MovieService.setSetting('profileUsername', username),
                MovieService.setSetting('profileBio', bio),
            ]);
            window.dispatchEvent(new Event('profileUpdated'));
            toast({
                title: "Profile Updated",
                description: "Your changes have been saved successfully.",
            });
        } catch (error) {
            console.error("Failed to save to DB:", error);
            toast({
                title: "Error",
                description: "Could not save your changes.",
                variant: "destructive",
            });
        }
    };

    return (
        <>
        <div className="flex h-screen flex-col bg-background">
            <header className="mx-auto w-full max-w-screen-xl px-4 pt-8 sm:px-6 lg:px-8">
                 <Link href="/app/dashboard" className="inline-flex items-center gap-2 font-semibold text-lg hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5"/>
                    <span>Back to Collection</span>
                </Link>
            </header>
            <div className="mx-auto w-full max-w-screen-xl flex-1 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-x-12 overflow-hidden px-4 pb-8 sm:px-6 lg:px-8">
                <aside className="hidden md:block pt-8">
                    <div className="sticky top-8">
                         <Card>
                            <CardContent className="p-4">
                                <nav className="flex flex-col gap-1">
                                    <a href="#personal-info" onClick={(e) => handleNavClick(e, 'personal-info')} className={cn("block px-3 py-2 rounded-md text-sm font-medium transition-colors", activeSection === 'personal-info' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground')}>Personal Information</a>
                                    <a href="#appearance" onClick={(e) => handleNavClick(e, 'appearance')} className={cn("block px-3 py-2 rounded-md text-sm font-medium transition-colors", activeSection === 'appearance' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground')}>Appearance</a>
                                    <a href="#settings" onClick={(e) => handleNavClick(e, 'settings')} className={cn("block px-3 py-2 rounded-md text-sm font-medium transition-colors", activeSection === 'settings' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground')}>Settings</a>
                                    <a href="#resources" onClick={(e) => handleNavClick(e, 'resources')} className={cn("block px-3 py-2 rounded-md text-sm font-medium transition-colors", activeSection === 'resources' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground')}>Resources & Support</a>
                                </nav>
                            </CardContent>
                        </Card>
                    </div>
                </aside>
                <main className="md:col-start-2 overflow-hidden">
                    <ScrollArea className="h-full pr-6" viewportRef={mainContentRef}>
                        <div className="grid gap-8 pt-8">
                            <ProfileHeader />

                            <div id="personal-info" ref={sectionRefs['personal-info']} className="pt-8 -mt-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Personal Information</CardTitle>
                                        <CardDescription>Update your name and biography.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="username">Username</Label>
                                            <div className="relative">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span className="text-muted-foreground sm:text-sm">@</span>
                                                </div>
                                                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="pl-7" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bio">Bio</Label>
                                            <Textarea id="bio" placeholder="Tell us a little about yourself" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button onClick={handleSaveChanges}>Save Changes</Button>
                                    </CardFooter>
                                </Card>
                            </div>

                            <div id="appearance" ref={sectionRefs['appearance']} className="pt-8 -mt-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Appearance</CardTitle>
                                        <CardDescription>Customize the look and feel of the app.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label>Accent Color</Label>
                                            <div className="flex gap-3">
                                                {themes.map((theme) => (
                                                    <Button
                                                        key={theme.name}
                                                        aria-label={theme.name}
                                                        variant="outline"
                                                        size="icon"
                                                        className={cn(
                                                            "h-8 w-8 rounded-full border-2",
                                                            activeTheme === theme.name ? "border-primary ring-2 ring-primary" : "border-transparent"
                                                        )}
                                                        style={{ backgroundColor: theme.displayColor }}
                                                        onClick={() => handleThemeChange(theme.name)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="dark-mode-profile" className="flex items-center gap-2">
                                                {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                                                <span>Dark Mode</span>
                                            </Label>
                                            <Switch id="dark-mode-profile" checked={isDarkMode} onCheckedChange={handleDarkModeToggle} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div id="settings" ref={sectionRefs['settings']} className="pt-8 -mt-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Settings</CardTitle>
                                        <CardDescription>Manage your application preferences and data.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>Import Library</Label>
                                                <p className="text-sm text-muted-foreground">Restore your library from a backup JSON file.</p>
                                            </div>
                                            <Button variant="outline" onClick={handleImportClick}>
                                                <Upload className="mr-2 h-4 w-4" /> Import Backup
                                            </Button>
                                            <input type="file" ref={fileInputRef} className="hidden" accept=".json,application/json" onChange={handleFileImport} />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                              <Label htmlFor="notifications">Movie Night Recommendations</Label>
                                              <p className="text-sm text-muted-foreground">Receive notifications for movie suggestions.</p>
                                            </div>
                                            <Switch id="notifications" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            
                            <div id="resources" ref={sectionRefs['resources']} className="pt-8 -mt-8">
                                 <Card>
                                    <CardHeader>
                                        <CardTitle>Resources & Support</CardTitle>
                                        <CardDescription>Find help, learn more about the app, or provide feedback.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Link href="/app/wrapped" passHref>
                                            <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                                                <LibraryBig className="mr-3 text-primary"/>
                                                <div className="flex flex-col">
                                                   <span className="font-bold text-foreground">Your 2025 Wrapped</span>
                                                   <span className="text-xs text-muted-foreground">A look back at your year in film.</span>
                                                </div>
                                            </Button>
                                        </Link>
                                        <Link href="/app/collections" passHref>
                                            <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left">
                                                <LibraryBig className="mr-3 text-primary"/>
                                                <div className="flex flex-col">
                                                   <span>My Vaults & Spotlights</span>
                                                   <span className="text-xs text-muted-foreground">Curate personal collections.</span>
                                                </div>
                                            </Button>
                                        </Link>
                                        <Link href="/app/analytics" passHref>
                                            <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left">
                                                <ChartPie className="mr-3 text-primary"/>
                                                <div className="flex flex-col">
                                                   <span>Stats for nerds</span>
                                                   <span className="text-xs text-muted-foreground">Go to your analytics.</span>
                                                </div>
                                            </Button>
                                        </Link>
                                        <Link href="/about" passHref>
                                            <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left">
                                                <Info className="mr-3 text-primary"/>
                                                <div className="flex flex-col">
                                                   <span>About Cine-Mon</span>
                                                   <span className="text-xs text-muted-foreground">App info and credits.</span>
                                                </div>
                                            </Button>
                                        </Link>
                                         <Link href="/app/guide" passHref>
                                            <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left">
                                                <BookOpenCheck className="mr-3 text-primary"/>
                                                <div className="flex flex-col">
                                                   <span>Getting Started Guide</span>
                                                   <span className="text-xs text-muted-foreground">Learn how to use the app.</span>
                                                </div>
                                            </Button>
                                        </Link>
                                        <Link href="/app/changelog" passHref>
                                            <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left">
                                                <ListOrdered className="mr-3 text-primary"/>
                                                <div className="flex flex-col">
                                                   <span>Changelog</span>
                                                   <span className="text-xs text-muted-foreground">See what's new.</span>
                                                </div>
                                            </Button>
                                        </Link>
                                         <Link href="/app/feedback" passHref>
                                            <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left">
                                                <Lightbulb className="mr-3 text-primary"/>
                                                <div className="flex flex-col">
                                                   <span>Feedback & Suggestions</span>
                                                   <span className="text-xs text-muted-foreground">Help us improve.</span>
                                                </div>
                                            </Button>
                                        </Link>
                                         <Link href="/app/shortcuts" passHref>
                                            <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left">
                                                <Keyboard className="mr-3 text-primary"/>
                                                <div className="flex flex-col">
                                                   <span>Keyboard Shortcuts</span>
                                                   <span className="text-xs text-muted-foreground">Boost your productivity.</span>
                                                </div>
                                            </Button>
                                        </Link>
                                         <Link href="/app/export" passHref>
                                            <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left">
                                                <DownloadCloud className="mr-3 text-primary"/>
                                                <div className="flex flex-col">
                                                   <span>Data Backup / Export</span>
                                                   <span className="text-xs text-muted-foreground">Export your collection.</span>
                                                </div>
                                            </Button>
                                        </Link>
                                        <Link href="/legal" passHref>
                                            <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left">
                                                <FileText className="mr-3 text-primary"/>
                                                <div className="flex flex-col">
                                                   <span>Terms & Privacy</span>
                                                   <span className="text-xs text-muted-foreground">Read our legal documents.</span>
                                                </div>
                                            </Button>
                                        </Link>
                                        <a href="mailto:geoffreymagana21@gmail.com">
                                            <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left">
                                                <Mail className="mr-3 text-primary"/>
                                                <div className="flex flex-col">
                                                   <span>Email Support</span>
                                                   <span className="text-xs text-muted-foreground">geoffreymagana21@gmail.com</span>
                                                </div>
                                            </Button>
                                        </a>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            Cine-Mon v{version}
                        </div>
                    </ScrollArea>
                </main>
            </div>
        </div>
        <ImportConfirmationDialog
            isOpen={isImportConfirmOpen}
            onConfirm={handleImportConfirm}
            conflictsCount={importData?.conflictingMovies?.length || 0}
            newCount={importData?.newMovies?.length || 0}
            isFullBackup={isFullBackupImport}
        />
        </>
    );
}

    
