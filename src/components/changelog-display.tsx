
'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import type { VersionInfo } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

const badgeMap: Record<string, { text: string, className: string }> = {
    Features: { text: 'New', className: 'bg-chart-2/20 text-chart-2 border-chart-2/30' },
    Fixes: { text: 'Fix', className: 'bg-chart-1/20 text-chart-1 border-chart-1/30' },
    'Breaking Changes': { text: 'Breaking!', className: 'bg-destructive/20 text-destructive border-destructive/30' }
};

export const ChangelogDisplay = ({ versions }: { versions: VersionInfo[] }) => {
    return (
        <>
            <div className="text-center mb-16">
                <h1 className="text-5xl font-bold font-headline text-white">Changelog</h1>
                <p className="text-neutral-400 mt-2">Discover what's new, improved, and fixed in Cine-Mon.</p>
            </div>
            
            {versions.length > 0 ? (
                <div className="relative max-w-prose mx-auto">
                    {/* Vertical Timeline */}
                    <div className="absolute left-2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-transparent via-border to-transparent -z-10" />

                    {versions.map((versionInfo, v_idx) => (
                        <div key={`${versionInfo.version}-${v_idx}`} className="flex items-baseline gap-x-6 mb-16">
                            {/* Dot */}
                            <div className="w-4 h-4 bg-background rounded-full border-2 border-primary ring-4 ring-background flex-shrink-0" />
                            
                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-baseline gap-4 mb-4">
                                    <Badge variant="outline" className="text-lg py-1 px-3">v{versionInfo.version}</Badge>
                                    <p className="text-sm text-neutral-400">{versionInfo.date}</p>
                                </div>
                                <div className="space-y-6">
                                    {versionInfo.sections.map((section, s_idx) => {
                                        const badgeInfo = badgeMap[section.type];
                                        return (
                                            <div key={s_idx}>
                                                {badgeInfo && (
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <Badge variant="outline" className={cn("font-semibold", badgeInfo.className)}>{badgeInfo.text}</Badge>
                                                        <h3 className="text-xl font-semibold !m-0 text-white">{section.type}</h3>
                                                    </div>
                                                )}
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    className="text-neutral-300 space-y-4"
                                                    components={{
                                                        a: ({node, ...props}) => <span className="text-primary hover:underline" {...props} />,
                                                        h3: () => null,
                                                        h4: ({node, ...props}) => <h4 className="text-lg font-semibold mt-4 mb-2 text-white" {...props} />,
                                                        ul: ({node, ...props}) => <ul className="list-disc pl-6 my-4 space-y-2" {...props} />,
                                                        li: ({node, ...props}) => <li className="pl-2" {...props} />,
                                                        img: ({node, ...props}) => <img className="max-w-full md:max-w-md rounded-md border my-4 shadow-md" alt="" {...props} />,
                                                        code: ({node, ...props}) => <code className="bg-muted text-muted-foreground px-1 py-0.5 rounded-sm font-mono text-xs" {...props} />,
                                                        p: ({node, ...props}) => <p className="leading-relaxed" {...props} />
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
                 <div className="text-center text-neutral-400 py-16">
                    <p>No changelog entries found.</p>
                </div>
            )}
        </>
    );
}
