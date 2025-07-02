
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

const Kbd = ({ children }: { children: React.ReactNode }) => (
    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
        {children}
    </kbd>
);

const navigationShortcuts = [
    { command: 'Pan', keys: [<Kbd>Space</Kbd>, <Kbd>Drag</Kbd>] },
    { command: 'Zoom', keys: [<Kbd>⌘</Kbd>, <Kbd>Scroll</Kbd>] },
    { command: 'Zoom to Fit', keys: [<Kbd>Shift</Kbd>, <Kbd>1</Kbd>] },
];

const creationShortcuts = [
    { command: 'New Card', keys: [<Kbd>⌘</Kbd>, <Kbd>N</Kbd>] },
    { command: 'New Sticky Note', keys: [<Kbd>⌘</Kbd>, <Kbd>Shift</Kbd>, <Kbd>N</Kbd>] },
    { command: 'New Movie Card', keys: [<Kbd>⌘</Kbd>, <Kbd>Shift</Kbd>, <Kbd>M</Kbd>] },
];

const editingShortcuts = [
    { command: 'Select All', keys: [<Kbd>⌘</Kbd>, <Kbd>A</Kbd>] },
    { command: 'Copy', keys: [<Kbd>⌘</Kbd>, <Kbd>C</Kbd>] },
    { command: 'Cut', keys: [<Kbd>⌘</Kbd>, <Kbd>X</Kbd>] },
    { command: 'Paste', keys: [<Kbd>⌘</Kbd>, <Kbd>V</Kbd>] },
    { command: 'Delete', keys: [<Kbd>Backspace</Kbd>] },
];


type CanvasHelpDialogProps = {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
};

const ShortcutTable = ({ title, shortcuts }: { title: string, shortcuts: {command: string, keys: React.ReactNode[]}[]}) => (
    <div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div className="border rounded-lg">
            <Table>
                <TableBody>
                    {shortcuts.map(({ command, keys }) => (
                        <TableRow key={command}>
                            <TableCell className="font-medium py-2">{command}</TableCell>
                            <TableCell className="text-right py-2">
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
        </div>
    </div>
);


export function CanvasHelpDialog({ isOpen, setIsOpen }: CanvasHelpDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Canvas Shortcuts</DialogTitle>
                    <DialogDescription>Use these shortcuts to navigate the canvas faster.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 pt-4">
                    <ShortcutTable title="Navigation & View" shortcuts={navigationShortcuts} />
                    <ShortcutTable title="Editing" shortcuts={editingShortcuts} />
                    <ShortcutTable title="Creation" shortcuts={creationShortcuts} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
