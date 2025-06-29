
'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ShortcutsPage() {
    const shortcuts = [
        { command: "Toggle Sidebar", keys: ["⌘", "B"] },
        { command: "Add New Entry", keys: ["N"] },
        { command: "Open Search", keys: ["⌘", "K"] },
        { command: "Go to Profile", keys: ["P"] },
    ];

    return (
        <div className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8">
            <div className="w-full max-w-4xl">
                 <Link href="/dashboard" className="inline-flex items-center gap-2 mb-6 font-semibold text-lg hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5"/>
                    <span>Back to Collection</span>
                </Link>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline">Keyboard Shortcuts</CardTitle>
                        <CardDescription>Use these shortcuts to navigate Cine-Mon even faster.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Command</TableHead>
                                    <TableHead className="text-right">Shortcut</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {shortcuts.map((shortcut) => (
                                <TableRow key={shortcut.command}>
                                    <TableCell className="font-medium">{shortcut.command}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {shortcut.keys.map(key => (
                                                <kbd key={key} className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-sm font-medium text-muted-foreground">
                                                    {key}
                                                </kbd>
                                            ))}
                                        </div>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
