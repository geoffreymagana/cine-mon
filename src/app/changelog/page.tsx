
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ChangelogPage() {
    const versions = [
        {
            version: "1.1.0",
            date: "November 15, 2023",
            title: "Profile & Navigation Overhaul",
            summary: "Introduced a completely redesigned Profile Page for a more intuitive user experience, alongside new dedicated pages for support, information, and app updates. This version also addresses various UI inconsistencies and hydration errors for a smoother experience.",
            imageUrl: "https://placehold.co/700x394.png",
            imageHint: "user profile interface",
            changes: [
                { type: "Improved", description: "Redesigned Profile Page with better navigation and layout." },
                { type: "New", description: "Added dedicated pages for About, Help, Changelog and more." },
                { type: "Fix", description: "Fixed various UI inconsistencies and hydration errors." },
            ]
        },
        {
            version: "1.0.0",
            date: "October 26, 2023",
            title: "Initial Release",
            summary: "The first version of Cine-Mon is here! Start tracking your movies, TV shows, and anime. Discover random picks with the 'Surprise Me' wheel and get organized with AI-powered smart tagging for your descriptions.",
            imageUrl: "https://placehold.co/700x394.png",
            imageHint: "movie posters collage",
            changes: [
                { type: "New", description: "Initial release of Cine-Mon! Track movies, TV shows, and anime." },
                { type: "New", description: "Spin the Wheel feature to get a random suggestion." },
                { type: "New", description: "AI-powered Smart Tagging for descriptions." },
            ]
        }
    ];

    const getBadgeVariant = (type: string) => {
        switch (type) {
            case "New": return "default";
            case "Improved": return "secondary";
            case "Fix": return "destructive";
            default: return "outline";
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8">
            <div className="w-full max-w-4xl">
                <Link href="/dashboard" className="inline-flex items-center gap-2 mb-8 font-semibold text-lg hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5"/>
                    <span>Back to Collection</span>
                </Link>
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold font-headline">Changelog</h1>
                    <p className="text-muted-foreground mt-2">Discover what's new, improved, and fixed in Cine-Mon.</p>
                </div>
                
                <div className="relative">
                    {/* Vertical Timeline */}
                    <div className="absolute left-2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-transparent via-border to-transparent -z-10" />

                    {versions.map((versionInfo) => (
                        <div key={versionInfo.version} className="flex items-start gap-x-6 mb-16">
                            {/* Dot */}
                            <div className="w-4 h-4 bg-background rounded-full border-2 border-primary ring-4 ring-background mt-1 flex-shrink-0" />
                            
                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-2">
                                    <Badge variant="outline">v {versionInfo.version}</Badge>
                                    <p className="text-sm text-muted-foreground">{versionInfo.date}</p>
                                </div>

                                <h2 className="text-3xl font-bold font-headline mb-4">{versionInfo.title}</h2>
                                
                                <div className="space-y-6">
                                    <p className="text-muted-foreground max-w-prose">{versionInfo.summary}</p>
                                    
                                    <div className="overflow-hidden rounded-lg border shadow-lg hover:shadow-primary/20 transition-shadow">
                                        <Image
                                            src={versionInfo.imageUrl}
                                            alt={`Feature screenshot for version ${versionInfo.version}`}
                                            width={700}
                                            height={394}
                                            className="w-full object-cover"
                                            data-ai-hint={versionInfo.imageHint}
                                        />
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Detailed Changes:</h3>
                                        <ul className="space-y-2">
                                            {versionInfo.changes.map((change, idx) => (
                                                <li key={idx} className="flex items-center gap-3">
                                                    <Badge variant={getBadgeVariant(change.type)}>{change.type}</Badge>
                                                    <span>{change.description}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
