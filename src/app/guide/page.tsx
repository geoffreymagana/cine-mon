
'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
    ArrowLeft, 
    BookOpenCheck, 
    ChevronRight, 
    Clapperboard, 
    DownloadCloud, 
    Edit, 
    Film, 
    HardDriveDownload, 
    Keyboard, 
    Lightbulb, 
    Lock, 
    Palette, 
    Plus, 
    Projector, 
    Search, 
    Shuffle, 
    Sparkles,
    BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const GuideSection = ({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <Card className="overflow-hidden">
    <CardHeader className="flex flex-row items-start gap-4 bg-muted/30">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </div>
    </CardHeader>
    <CardContent className="p-6 space-y-4">
        {children}
    </CardContent>
  </Card>
);

const Step = ({ number, title, children }: { number: number; title: string; children: React.ReactNode }) => (
    <div className="flex items-start gap-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-primary/10 font-bold text-primary flex-shrink-0 mt-1">
            {number}
        </div>
        <div>
            <h4 className="font-bold text-lg">{title}</h4>
            <div className="text-muted-foreground">{children}</div>
        </div>
    </div>
);


export default function GuidePage() {
    return (
        <div className="flex min-h-screen flex-col bg-background p-4 sm:p-8">
            <div className="w-full max-w-4xl mx-auto">
                 <Link href="/dashboard" className="inline-flex items-center gap-2 mb-8 font-semibold text-lg hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5"/>
                    <span>Back to Dashboard</span>
                </Link>

                <header className="text-center mb-16">
                    <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
                        <BookOpenCheck className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-5xl font-bold font-headline">Getting Started</h1>
                    <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">Welcome to Cine-Mon! This guide will walk you through the core features to help you curate your perfect cinematic universe.</p>
                </header>
                
                <div className="space-y-12">
                    <GuideSection
                        icon={Clapperboard}
                        title="1. Building Your Collection"
                        description="Two powerful ways to add movies, TV shows, and anime to your library."
                    >
                        <Step number={1} title="The Fast Way: Search & Import">
                            <p>This is the recommended method. We use The Movie Database (TMDB) to pull in rich data automatically.</p>
                            <ol className="list-decimal pl-5 mt-2 space-y-1">
                                <li>Click the <strong>Search TMDB...</strong> bar or press <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded-sm">⌘</kbd> + <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded-sm">K</kbd>.</li>
                                <li>Type the title you're looking for. You can even filter by year (e.g., <code className="bg-muted text-muted-foreground px-1 py-0.5 rounded-sm">Inception y:2010</code>).</li>
                                <li>Click the <Button size="sm" variant="outline" className="inline-flex pointer-events-none h-auto p-1 text-xs"><Plus className="h-3 w-3 mr-1"/> Import</Button> button next to the correct entry.</li>
                                <li>That's it! The title, poster, cast, and more are added instantly.</li>
                            </ol>
                        </Step>
                        
                        <Step number={2} title="The Detailed Way: Manual Entry">
                             <p>Use this for obscure titles, personal projects, or when you want full control over the data.</p>
                             <ol className="list-decimal pl-5 mt-2 space-y-1">
                                <li>From the dashboard, click the <Button size="sm" className="inline-flex pointer-events-none h-auto p-1 text-xs"><Plus className="h-3 w-3 mr-1"/> Add Manually</Button> button.</li>
                                <li>Fill in the details. You can upload custom posters, add tags, and more.</li>
                                <li>Use the <strong className="text-primary">Smart Tag</strong> feature to automatically generate tags from your synopsis.</li>
                             </ol>
                        </Step>
                    </GuideSection>

                    <GuideSection
                        icon={Sparkles}
                        title="2. Organizing Your Universe"
                        description="Your library is more than a list. It's a curated space."
                    >
                        <Step number={1} title="Master Your Library View">
                            <p>The main dashboard is your canvas. Use the sidebar filters (<Film className="inline h-4 w-4"/>, etc.) to focus your view. On desktop, you can even <strong className="text-primary">drag and drop</strong> posters to reorder your collection manually.</p>
                        </Step>
                        
                        <Step number={2} title="Create Vaults & Spotlights">
                             <p>Collections are the best way to group related titles. Navigate to the <strong className="text-primary">Collections</strong> page from the sidebar.</p>
                             <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li><strong className="flex items-center gap-2"><Lock className="h-4 w-4"/> Vaults:</strong> For your personal, hand-picked lists like "All-Time Favorites" or "Mind-Bending Thrillers". You can reorder titles in a vault.</li>
                                <li><strong className="flex items-center gap-2"><Projector className="h-4 w-4"/> Spotlights:</strong> For high-priority watchlists like "To Watch in October" or "Oscar Winners 2024".</li>
                             </ul>
                             <p className="mt-2">You can add a title to any collection from its details page via the <strong className="text-primary">More Options</strong> menu.</p>
                        </Step>

                         <Step number={3} title="Edit & Manage">
                             <p>Click on any movie poster to go to its details page. From there, you can:</p>
                             <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Update its watch status (e.g., from 'Plan to Watch' to 'Watching').</li>
                                <li>Click the <Button size="sm" variant="outline" className="inline-flex pointer-events-none h-auto p-1 text-xs"><Edit className="h-3 w-3 mr-1"/> Edit</Button> button to modify every detail, from cast and crew to alternate posters and scripts.</li>
                             </ul>
                        </Step>
                    </GuideSection>

                     <GuideSection
                        icon={Lightbulb}
                        title="3. Discover & Personalize"
                        description="Make Cine-Mon truly yours and find your next favorite watch."
                    >
                        <Step number={1} title="Break Decision Paralysis">
                            <p>Can't decide what to watch? Click the <Button size="sm" variant="outline" className="inline-flex pointer-events-none h-auto p-1 text-xs"><Shuffle className="h-3 w-3 mr-1"/> Surprise Me</Button> button. It spins a wheel and randomly selects a title from your collection.</p>
                        </Step>
                        
                        <Step number={2} title="Explore Your Watchverse">
                            <p>Visit your <strong className="text-primary">Profile</strong> and find the <Button size="sm" variant="ghost" className="inline-flex pointer-events-none h-auto p-1 text-xs"><BarChart3 className="h-3 w-3 mr-1"/> Stats for nerds</Button> link to see detailed analytics about your watch habits, from top genres to most-watched actors.</p>
                        </Step>

                        <Step number={3} title="Customize Your Look">
                             <p>In your <strong className="text-primary">Profile</strong>, you can change your avatar, banner, and user details. Under the <strong className="text-primary flex items-center gap-2"><Palette className="h-4 w-4"/> Appearance</strong> section, you can switch the app's accent color and toggle dark mode to match your style.</p>
                        </Step>

                         <Step number={4} title="Manage Your Data">
                            <p>Your data is yours. In your <strong className="text-primary">Profile</strong>, you can find options to:</p>
                             <ul className="list-disc pl-5 mt-2 space-y-1">
                                 <li><strong className="flex items-center gap-2"><HardDriveDownload className="h-4 w-4"/> Import Library:</strong> Add movies from a previously exported JSON file.</li>
                                <li><strong className="flex items-center gap-2"><DownloadCloud className="h-4 w-4"/> Data Backup / Export:</strong> Save your entire collection as a JSON or CSV file.</li>
                             </ul>
                        </Step>
                    </GuideSection>
                </div>
                 <div className="text-center mt-20">
                    <h3 className="text-2xl font-bold font-headline">Ready to Go Faster?</h3>
                    <p className="text-muted-foreground mt-2">Check out all the available keyboard shortcuts to become a power user.</p>
                    <Link href="/shortcuts" passHref>
                        <Button className="mt-4">
                            <Keyboard className="mr-2"/> View All Shortcuts <ChevronRight className="ml-1"/>
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
