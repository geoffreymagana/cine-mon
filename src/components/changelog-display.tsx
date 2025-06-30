
'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import type { VersionInfo } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

type ChangelogDisplayProps = {
  versions: VersionInfo[];
};

const badgeMap: Record<string, { text: string, className: string }> = {
    'Features': { text: 'New', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-700' },
    'Fixes': { text: 'Fix', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-700' },
    'Breaking Changes': { text: 'Breaking!', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-700' },
};

export const ChangelogDisplay = ({ versions }: ChangelogDisplayProps) => {
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
                        <div key={`${versionInfo.version}-${v_idx}`} className="flex items-start gap-x-6 mb-16">
                            {/* Dot */}
                            <div className="w-4 h-4 bg-background rounded-full border-2 border-primary ring-4 ring-background mt-1 flex-shrink-0" />
                            
                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-2">
                                    <Badge variant="outline">v{versionInfo.version}</Badge>
                                    <p className="text-sm text-muted-foreground">{versionInfo.date}</p>
                                </div>

                                <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
                                    {versionInfo.sections.map((section, s_idx) => {
                                        const badgeInfo = badgeMap[section.type];
                                        return (
                                            <div key={s_idx}>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="!m-0">{section.type}</h3>
                                                    {badgeInfo && <Badge variant="outline" className={cn("text-xs", badgeInfo.className)}>{badgeInfo.text}</Badge>}
                                                </div>
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        // Disable github links by rendering them as plain text spans
                                                        a: ({node, ...props}) => <span {...props} />,
                                                        code: ({node, ...props}) => <code className="bg-muted text-muted-foreground px-1 py-0.5 rounded-sm font-mono text-xs" {...props} />,
                                                        img: ({node, ...props}) => <img className="max-w-full md:max-w-md rounded-md border my-4 shadow-md" alt="" {...props} />,
                                                        h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-6 mb-3" {...props} />,
                                                        h4: ({node, ...props}) => <h4 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                                                        ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2 space-y-2" {...props} />,
                                                        li: ({node, ...props}) => <li className="pl-2" {...props} />,
                                                    }}
                                                >
                                                    {section.content}
                                                </ReactMarkdown>
                                            </div>
                                        )
                                    })}
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
