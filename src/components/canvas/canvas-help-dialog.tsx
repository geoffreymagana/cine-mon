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
    <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs font-medium text-muted-foreground">
        {children}
    </kbd>
);

const navigationShortcuts = [
    { command: 'Pan', keys: [<Kbd>Space</Kbd>, '+', <Kbd>Drag</Kbd>] },
    { command: 'Pan (alt)', keys: [<Kbd>Scroll</Kbd>] },
    { command: 'Pan horizontally', keys: [<Kbd>Shift</Kbd>, '+', <Kbd>Scroll</Kbd>] },
    { command: 'Zoom', keys: [<Kbd>Ctrl</Kbd>, '+', <Kbd>Scroll</Kbd>] },
    { command: 'Zoom to fit', keys: [<Kbd>Shift</Kbd>, '+', <Kbd>1</Kbd>] },
    { command: 'Zoom to selection', keys: [<Kbd>Shift</Kbd>, '+', <Kbd>2</Kbd>] },
    { command: 'Select all', keys: [<Kbd>Ctrl</Kbd>, '+', <Kbd>A</Kbd>] },
];

const editingShortcuts = [
    { command: 'Add/remove selection', keys: [<Kbd>Shift</Kbd>, '+', <Kbd>Click</Kbd>] },
    { command: 'Create card', keys: [<Kbd>Ctrl</Kbd>, '+', <Kbd>Drag</Kbd>] },
    { command: 'Clone card', keys: [<Kbd>Ctrl</Kbd>, '+', <Kbd>Drag</Kbd>] },
    { command: 'Constrain movement', keys: [<Kbd>Shift</Kbd>, '+', <Kbd>Drag</Kbd>] },
    { command: 'Remove card', keys: [<Kbd>Backspace</Kbd>] },
    { command: 'Undo', keys: [<Kbd>Ctrl</Kbd>, '+', <Kbd>Z</Kbd>] },
    { command: 'Redo', keys: [<Kbd>Ctrl</Kbd>, '+', <Kbd>Y</Kbd>] },
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
                                    {Array.isArray(keys) ? keys.map((key, index) => (
                                        <React.Fragment key={index}>{key}</React.Fragment>
                                    )) : keys}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-4">
                    <ShortcutTable title="Navigation & View" shortcuts={navigationShortcuts} />
                    <ShortcutTable title="Editing & Actions" shortcuts={editingShortcuts} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
