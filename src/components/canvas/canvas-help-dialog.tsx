
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

const Kbd = ({ children }: { children: React.ReactNode }) => (
    <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs font-medium text-muted-foreground">
        {children}
    </kbd>
);

const shortcuts = [
    { command: 'Pan', keys: [<Kbd>Space</Kbd>, '+', <Kbd>Drag</Kbd>, <span className='mx-2'>/</span>, <Kbd>Scroll</Kbd>] },
    { command: 'Pan horizontally', keys: [<Kbd>Shift</Kbd>, '+', <Kbd>Scroll</Kbd>] },
    { command: 'Zoom', keys: [<Kbd>Ctrl</Kbd>, '+', <Kbd>Scroll</Kbd>, <span className='mx-2'>/</span>, <Kbd>Space</Kbd>, '+', <Kbd>Scroll</Kbd>] },
    { command: 'Zoom to fit', keys: [<Kbd>Shift</Kbd>, '+', <Kbd>1</Kbd>] },
    { command: 'Zoom to selection', keys: [<Kbd>Shift</Kbd>, '+', <Kbd>2</Kbd>] },
    { command: 'Select all', keys: [<Kbd>Ctrl</Kbd>, '+', <Kbd>A</Kbd>] },
    { command: 'Add / remove from selection', keys: [<Kbd>Shift</Kbd>, '+', <Kbd>Click</Kbd>, <span className='mx-2'>/</span>, <Kbd>Shift</Kbd>, '+', <Kbd>Drag</Kbd>] },
    { command: 'Create a card with specific size', keys: [<Kbd>Ctrl</Kbd>, '+', <Kbd>Drag</Kbd>] },
    { command: 'Clone card', keys: [<Kbd>Ctrl</Kbd>, '+', <Kbd>Drag</Kbd>] },
    { command: 'Constrain card movement to axis', keys: [<Kbd>Shift</Kbd>, '+', <Kbd>Drag</Kbd>] },
    { command: 'Disable snapping while dragging', keys: [<Kbd>Alt</Kbd>] },
    { command: 'Remove card', keys: [<Kbd>Backspace</Kbd>, <span className='mx-2'>/</span>, <Kbd>Delete</Kbd>] },
    { command: 'Undo', keys: [<Kbd>Ctrl</Kbd>, '+', <Kbd>Z</Kbd>] },
    { command: 'Redo', keys: [<Kbd>Ctrl</Kbd>, '+', <Kbd>Y</Kbd>, <span className='mx-2'>/</span>, <Kbd>Ctrl</Kbd>, '+', <Kbd>Shift</Kbd>, '+', <Kbd>Z</Kbd>] },
];


type CanvasHelpDialogProps = {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
};

export function CanvasHelpDialog({ isOpen, setIsOpen }: CanvasHelpDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Canvas Help</DialogTitle>
                </DialogHeader>
                <Table>
                    <TableBody>
                        {shortcuts.map(({ command, keys }) => (
                            <TableRow key={command}>
                                <TableCell className="font-medium py-3">{command}</TableCell>
                                <TableCell className="text-right py-3">
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
            </DialogContent>
        </Dialog>
    );
}
