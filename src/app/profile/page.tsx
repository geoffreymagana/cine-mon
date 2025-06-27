
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
    BarChart3
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

export default function ProfilePage() {
    const [isDarkMode, setIsDarkMode] = React.useState(true);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [activeSection, setActiveSection] = React.useState('personal-info');
    const mainContentRef = React.useRef<HTMLDivElement>(null);

    const sections = ['personal-info', 'appearance', 'settings', 'resources'];
    const sectionRefs = React.useMemo(() => sections.reduce((acc, sec) => {
        acc[sec] = React.createRef<HTMLDivElement>();
        return acc;
    }, {} as Record<string, React.RefObject<HTMLDivElement>>), []);


    React.useEffect(() => {
        document.documentElement.classList.toggle("dark", isDarkMode);
    }, [isDarkMode]);

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

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        e.preventDefault();
        const section = sectionRefs[sectionId]?.current;
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setActiveSection(sectionId);
    };

    return (
        <div className="flex h-screen flex-col bg-background">
            <header className="mx-auto w-full max-w-screen-xl px-4 pt-8 sm:px-6 lg:px-8">
                 <Link href="/" className="inline-flex items-center gap-2 font-semibold text-lg hover:text-primary transition-colors">
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
                                            <Input id="name" defaultValue="Cine-Mon User" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bio">Bio</Label>
                                            <Textarea id="bio" placeholder="Tell us a little about yourself" rows={3} />
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button>Save Changes</Button>
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
                                                <Button aria-label="Purple" variant="outline" size="icon" className="h-8 w-8 rounded-full border-2 border-primary ring-2 ring-primary" style={{ backgroundColor: 'hsl(275, 76%, 58%)' }} />
                                                <Button aria-label="Red" variant="outline" size="icon" className="h-8 w-8 rounded-full" style={{ backgroundColor: 'hsl(347, 77%, 50%)' }} />
                                                <Button aria-label="Green" variant="outline" size="icon" className="h-8 w-8 rounded-full" style={{ backgroundColor: 'hsl(142, 71%, 45%)' }} />
                                                <Button aria-label="Orange" variant="outline" size="icon" className="h-8 w-8 rounded-full" style={{ backgroundColor: 'hsl(38, 92%, 50%)' }} />
                                                <Button aria-label="Blue" variant="outline" size="icon" className="h-8 w-8 rounded-full" style={{ backgroundColor: 'hsl(217, 91%, 60%)' }} />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="dark-mode-profile" className="flex items-center gap-2">
                                                {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                                                <span>Dark Mode</span>
                                            </Label>
                                            <Switch id="dark-mode-profile" checked={isDarkMode} onCheckedChange={setIsDarkMode} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            
                            <div id="settings" ref={sectionRefs['settings']} className="pt-8 -mt-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Settings</CardTitle>
                                        <CardDescription>Manage your application preferences.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                              <Label htmlFor="notifications">Movie Night Recommendations</Label>
                                              <p className="text-sm text-muted-foreground">Receive notifications for movie suggestions.</p>
                                            </div>
                                            <Switch id="notifications" />
                                        </div>
                                         <div className="flex items-center justify-between">
                                            <div>
                                              <Label>Import Library</Label>
                                              <p className="text-sm text-muted-foreground">Import your collection from a CSV file.</p>
                                            </div>
                                            <Button variant="outline" onClick={handleImportClick}>
                                                <Upload className="mr-2 h-4 w-4" /> Import CSV
                                            </Button>
                                            <input type="file" ref={fileInputRef} className="hidden" accept=".csv" />
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
                                        <Link href="/about" passHref>
                                            <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left">
                                                <Info className="mr-3 text-primary"/>
                                                <div className="flex flex-col">
                                                   <span>About Cine-Mon</span>
                                                   <span className="text-xs text-muted-foreground">App info and credits.</span>
                                                </div>
                                            </Button>
                                        </Link>
                                         <Link href="/guide" passHref>
                                            <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left">
                                                <BookOpenCheck className="mr-3 text-primary"/>
                                                <div className="flex flex-col">
                                                   <span>Getting Started Guide</span>
                                                   <span className="text-xs text-muted-foreground">Learn how to use the app.</span>
                                                </div>
                                            </Button>
                                        </Link>
                                        <Link href="/changelog" passHref>
                                            <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left">
                                                <ListOrdered className="mr-3 text-primary"/>
                                                <div className="flex flex-col">
                                                   <span>Changelog</span>
                                                   <span className="text-xs text-muted-foreground">See what's new.</span>
                                                </div>
                                            </Button>
                                        </Link>
                                         <Link href="/feedback" passHref>
                                            <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left">
                                                <Lightbulb className="mr-3 text-primary"/>
                                                <div className="flex flex-col">
                                                   <span>Feedback & Suggestions</span>
                                                   <span className="text-xs text-muted-foreground">Help us improve.</span>
                                                </div>
                                            </Button>
                                        </Link>
                                         <Link href="/shortcuts" passHref>
                                            <Button variant="ghost" className="w-full justify-start h-auto p-3 text-left">
                                                <Keyboard className="mr-3 text-primary"/>
                                                <div className="flex flex-col">
                                                   <span>Keyboard Shortcuts</span>
                                                   <span className="text-xs text-muted-foreground">Boost your productivity.</span>
                                                </div>
                                            </Button>
                                        </Link>
                                         <Link href="/export" passHref>
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
