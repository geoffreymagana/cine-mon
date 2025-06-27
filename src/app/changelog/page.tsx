
'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ChangelogPage() {
    const versions = [
        {
            version: "1.0.0",
            date: "October 26, 2023",
            changes: [
                { type: "New", description: "Initial release of Cine-Mon! Track movies, TV shows, and anime." },
                { type: "New", description: "Spin the Wheel feature to get a random suggestion." },
                { type: "New", description: "AI-powered Smart Tagging for descriptions." },
            ]
        },
        {
            version: "1.1.0",
            date: "November 15, 2023",
            changes: [
                { type: "Improved", description: "Redesigned Profile Page with better navigation and layout." },
                { type: "New", description: "Added dedicated pages for About, Help, Changelog and more." },
                { type: "Fix", description: "Fixed various UI inconsistencies and hydration errors." },
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
                 <Link href="/profile" className="inline-flex items-center gap-2 mb-6 font-semibold text-lg hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5"/>
                    <span>Back to Profile</span>
                </Link>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline">Changelog</CardTitle>
                        <CardDescription>Discover what's new, improved, and fixed in Cine-Mon.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {versions.reverse().map((versionInfo, index) => (
                            <div key={versionInfo.version}>
                                <div className="flex items-baseline gap-4">
                                    <h3 className="text-2xl font-semibold font-headline">Version {versionInfo.version}</h3>
                                    <p className="text-sm text-muted-foreground">{versionInfo.date}</p>
                                </div>
                                <ul className="mt-4 space-y-2 list-disc list-inside">
                                    {versionInfo.changes.map((change, idx) => (
                                        <li key={idx} className="flex items-center gap-3">
                                            <Badge variant={getBadgeVariant(change.type)}>{change.type}</Badge>
                                            <span>{change.description}</span>
                                        </li>
                                    ))}
                                </ul>
                                {index < versions.length - 1 && <Separator className="mt-8" />}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
