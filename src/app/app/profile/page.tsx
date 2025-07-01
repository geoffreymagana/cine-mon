
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
    BarChart3,
    Sparkles,
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
import type { Movie } from '@/lib/types';
import { MovieService } from '@/lib/movie-service';

const themes = [
    { name: 'purple', displayColor: 'hsl(275, 76%, 58%)' },
    { name: 'red', displayColor: 'hsl(347, 77%, 50%)' },
    { name: 'green', displayColor: 'hsl(142, 71%, 45%)' },
    { name: 'orange', displayColor: 'hsl(38, 92%, 50%)' },
    { name: 'blue', displayColor: 'hsl(217, 91%, 60%)' },
];

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

    const sections = ['personal-info', 'appearance', 'settings', 'resources'];
    const sectionRefs = React.useMemo(() => sections.reduce((acc, sec) => {
        acc[sec] = React.createRef<HTMLDivElement>();
        return acc;
    }, {} as Record<string, React.RefObject<HTMLDivElement>>), []);

    React.useEffect(() => {
        const loadSettings = async () => {
            const [storedTheme, storedDarkMode, storedName, storedUsername, storedBio] = await Promise.all([
                MovieService.getSetting('cinemon-theme'),
                MovieService.getSetting('cinemon-dark-mode'),
                MovieService.getSetting('profileName'),
                MovieService.getSetting('profileUsername'),
                MovieService.getSetting('profileBio'),
            ]);

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

                let importedMovies: any[] = [];
                if (Array.isArray(parsedData)) {
                    importedMovies = parsedData;
                } else if (typeof parsedData === 'object' && parsedData !== null && Array.isArray(parsedData.movies)) {
                    importedMovies = parsedData.movies;
                } else {
                    throw new Error("Invalid JSON structure: The file should contain an array of movies, optionally within a 'movies' key.");
                }

                const existingMovies = await MovieService.getMovies();
                const movieMap = new Map(existingMovies.map(m => [m.id, m]));
                let newCount = 0;
                let updatedCount = 0;
                let skippedCount = 0;

                importedMovies.forEach(importedMovie => {
                    if (typeof importedMovie !== 'object' || importedMovie === null || !importedMovie.title) {
                        skippedCount++;
                        return;
                    }

                    // Sanitize every imported movie object to ensure data integrity
                    const sanitizedImportedMovie: Partial<Movie> = { ...importedMovie };
                    if (!Array.isArray(sanitizedImportedMovie.tags)) {
                        sanitizedImportedMovie.tags = [];
                    }
                    if (sanitizedImportedMovie.id && typeof sanitizedImportedMovie.id !== 'string') {
                        sanitizedImportedMovie.id = String(sanitizedImportedMovie.id);
                    }

                    const existingMovie = sanitizedImportedMovie.id ? movieMap.get(sanitizedImportedMovie.id) : undefined;

                    if (existingMovie) {
                        // Update existing movie, ensuring no indexed fields are overwritten with invalid types
                        const updatedMovie = { ...existingMovie, ...sanitizedImportedMovie };
                        if (!Array.isArray(updatedMovie.tags)) updatedMovie.tags = existingMovie.tags;
                        movieMap.set(updatedMovie.id, updatedMovie);
                        updatedCount++;
                    } else {
                        // Create new movie with defaults
                        const newMovie: Movie = {
                            id: sanitizedImportedMovie.id || crypto.randomUUID(),
                            title: sanitizedImportedMovie.title || 'Untitled',
                            description: sanitizedImportedMovie.description || '',
                            posterUrl: sanitizedImportedMovie.posterUrl || 'https://placehold.co/500x750.png',
                            type: ['Movie', 'TV Show', 'Anime'].includes(sanitizedImportedMovie.type as any) ? sanitizedImportedMovie.type as any : 'Movie',
                            status: ['Watching', 'Completed', 'On-Hold', 'Dropped', 'Plan to Watch'].includes(sanitizedImportedMovie.status as any) ? sanitizedImportedMovie.status as any : 'Plan to Watch',
                            watchedEpisodes: typeof sanitizedImportedMovie.watchedEpisodes === 'number' ? sanitizedImportedMovie.watchedEpisodes : 0,
                            totalEpisodes: typeof sanitizedImportedMovie.totalEpisodes === 'number' && sanitizedImportedMovie.totalEpisodes > 0 ? sanitizedImportedMovie.totalEpisodes : 1,
                            rating: typeof sanitizedImportedMovie.rating === 'number' ? sanitizedImportedMovie.rating : 0,
                            tags: Array.isArray(sanitizedImportedMovie.tags) ? sanitizedImportedMovie.tags : [],
                            releaseDate: typeof sanitizedImportedMovie.releaseDate === 'string' ? sanitizedImportedMovie.releaseDate : '',
                            ...sanitizedImportedMovie,
                        };
                        movieMap.set(newMovie.id, newMovie);
                        newCount++;
                    }
                });

                const updatedMovies = Array.from(movieMap.values());
                await MovieService.saveAllMovies(updatedMovies);

                let toastDescription = `${newCount} new titles added and ${updatedCount} updated.`;
                if (skippedCount > 0) {
                    toastDescription += ` ${skippedCount} entries were skipped due to invalid format.`;
                }
                toastDescription += " The page will now reload.";

                toast({
                    title: "Import Successful!",
                    description: toastDescription,
                });
                
                setTimeout(() => window.location.reload(), 3000);

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
                                                <p className="text-sm text-muted-foreground">Import your collection from a JSON file.</p>
                                            </div>
                                            <Button variant="outline" onClick={handleImportClick}>
                                                <Upload className="mr-2 h-4 w-4" /> Import JSON
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
                                        <Link href="/app/collections" passHref>
                                            <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left">
                                                <Sparkles className="mr-3 text-primary"/>
                                                <div className="flex flex-col">
                                                   <span>My Vaults & Spotlights</span>
                                                   <span className="text-xs text-muted-foreground">Curate personal collections.</span>
                                                </div>
                                            </Button>
                                        </Link>
                                        <Link href="/app/analytics" passHref>
                                            <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left">
                                                <BarChart3 className="mr-3 text-primary"/>
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
                    </ScrollArea>
                </main>
            </div>
        </div>
    );
}
