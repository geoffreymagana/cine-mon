'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { VersionInfo } from '@/app/changelog/page';

type ChangelogDisplayProps = {
  versions: VersionInfo[];
};

export const ChangelogDisplay = ({ versions }: ChangelogDisplayProps) => {
    const getBadgeVariant = (type: string) => {
        const typeLower = type.toLowerCase();
        if (typeLower.includes("feature")) return "default";
        if (typeLower.includes("fix")) return "destructive";
        if (typeLower.includes("perf")) return "secondary";
        return "outline";
    }

    const getBadgeLabel = (type: string) => {
        const typeLower = type.toLowerCase();
        if (typeLower.includes("feature")) return "New";
        if (typeLower.includes("fix")) return "Fix";
        if (typeLower.includes("perf")) return "Perf";
        if (typeLower.includes("refactor")) return "Refactor";
        if (typeLower.includes("docs")) return "Docs";
        if (typeLower.includes("chore")) return "Chore";
        return type;
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
                    <p className="text-muted-foreground mt-2">Discover what's new, improved, and fixed in Cine-Mon. Updated automatically.</p>
                </div>
                
                {versions.length > 0 ? (
                    <div className="relative">
                        {/* Vertical Timeline */}
                        <div className="absolute left-2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-transparent via-border to-transparent -z-10" />

                        {versions.map((versionInfo, v_idx) => (
                            <div key={versionInfo.version} className="flex items-start gap-x-6 mb-16">
                                {/* Dot */}
                                <div className="w-4 h-4 bg-background rounded-full border-2 border-primary ring-4 ring-background mt-1 flex-shrink-0" />
                                
                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-2">
                                        <Badge variant="outline">v{versionInfo.version}</Badge>
                                        <p className="text-sm text-muted-foreground">{versionInfo.date}</p>
                                    </div>

                                    <h2 className="text-3xl font-bold font-headline mb-4">Version {versionInfo.version}</h2>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <ul className="space-y-2">
                                                {versionInfo.changes.map((change, c_idx) => (
                                                    <li key={`${v_idx}-${c_idx}`} className="flex items-start gap-3">
                                                        <Badge variant={getBadgeVariant(change.type)} className="whitespace-nowrap mt-1">
                                                            {getBadgeLabel(change.type)}
                                                        </Badge>
                                                        <span dangerouslySetInnerHTML={{ __html: change.description.replace(/`([^`]+)`/g, '<code class="bg-muted text-muted-foreground px-1 py-0.5 rounded-sm font-mono text-xs">\$1</code>') }} />
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="text-center text-muted-foreground py-16">
                        <p>The changelog is being generated.</p>
                        <p>Please make a commit and push to see the changes.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
