
'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Kbd = ({ children }: { children: React.ReactNode }) => (
    <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-sm font-medium text-muted-foreground">
        {children}
    </kbd>
);

const ShortcutTable = ({ title, shortcuts }: { title: string, shortcuts: {command: string, keys: React.ReactNode[]}[]}) => (
    <div>
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Command</TableHead>
                        <TableHead className="text-right">Shortcut</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {shortcuts.map(({ command, keys }) => (
                        <TableRow key={command}>
                            <TableCell className="font-medium">{command}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                    {keys.map((key, index) => (
                                        <React.Fragment key={index}>{key}</React.Fragment>
                                    ))}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    </div>
);

export default function ShortcutsPage() {
    const globalShortcuts = [
        { command: "Open Search / Command Palette", keys: [<Kbd>⌘</Kbd>, <Kbd>K</Kbd>] },
    ];
    
    const canvasCreationShortcuts = [
        { command: "New Card", keys: [<Kbd>⌘</Kbd>, <Kbd>N</Kbd>] },
        { command: "New Sticky Note", keys: [<Kbd>⌘</Kbd>, <Kbd>Shift</Kbd>, <Kbd>N</Kbd>] },
        { command: "New Movie from Collection", keys: [<Kbd>⌘</Kbd>, <Kbd>Shift</Kbd>, <Kbd>M</Kbd>] },
    ];

    const canvasEditingShortcuts = [
        { command: "Select All", keys: [<Kbd>⌘</Kbd>, <Kbd>A</Kbd>] },
        { command: "Copy Selection", keys: [<Kbd>⌘</Kbd>, <Kbd>C</Kbd>] },
        { command: "Cut Selection", keys: [<Kbd>⌘</Kbd>, <Kbd>X</Kbd>] },
        { command: "Paste Selection", keys: [<Kbd>⌘</Kbd>, <Kbd>V</Kbd>] },
        { command: "Delete Selection", keys: [<Kbd>Backspace</Kbd>] },
    ];

    return (
        <div className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8">
            <div className="w-full max-w-4xl">
                 <Link href="/app/dashboard" className="inline-flex items-center gap-2 mb-6 font-semibold text-lg hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5"/>
                    <span>Back to Dashboard</span>
                </Link>
                <Card className="border-0 shadow-none">
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline">Keyboard Shortcuts</CardTitle>
                        <CardDescription>Use these shortcuts to navigate Cine-Mon even faster.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                       <ShortcutTable title="Global" shortcuts={globalShortcuts} />
                       <ShortcutTable title="Canvas: Creation" shortcuts={canvasCreationShortcuts} />
                       <ShortcutTable title="Canvas: Editing" shortcuts={canvasEditingShortcuts} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
