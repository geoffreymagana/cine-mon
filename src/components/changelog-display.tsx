
'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import type { VersionInfo } from '@/lib/changelog';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
        <>
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
                                                    <div className="pt-0.5 text-foreground/90">
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm]}
                                                            components={{
                                                                p: ({node, ...props}) => <p className="m-0 leading-relaxed" {...props} />,
                                                                a: ({node, ...props}) => <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                                                code: ({node, ...props}) => <code className="bg-muted text-muted-foreground px-1 py-0.5 rounded-sm font-mono text-xs" {...props} />,
                                                                img: ({node, ...props}) => <img className="max-w-full md:max-w-md rounded-md border my-4 shadow-md" {...props} />,
                                                                ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2" {...props} />,
                                                                ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2" {...props} />,
                                                            }}
                                                        >
                                                            {change.description}
                                                        </ReactMarkdown>
                                                    </div>
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
        </>
    );
}
