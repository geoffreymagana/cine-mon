'use client';

import * as React from 'react';
import {
  FileText,
  Clapperboard,
  BoxSelect,
  Undo2,
  ClipboardPaste,
  Grid,
  Lock,
  Check,
  StickyNote,
  ArrowUpRightSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type MenuItemProps = {
  icon: React.ElementType;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  checked?: boolean;
  isCheckbox?: boolean;
};

const MenuItem = ({ icon: Icon, children, onClick, disabled, checked, isCheckbox }: MenuItemProps) => (
  <Button
    variant="ghost"
    className="w-full justify-start h-8 px-2 text-sm font-normal"
    onClick={onClick}
    disabled={disabled}
  >
    <Icon className="mr-2 h-4 w-4" />
    <span className="flex-grow text-left">{children}</span>
    {isCheckbox && checked && <Check className="h-4 w-4" />}
  </Button>
);

type CanvasContextMenuProps = {
    top: number;
    left: number;
    onClose: () => void;
    onAddNode: (type: 'custom' | 'sticky' | 'movie' | 'web') => void;
    isSnapToGrid: boolean;
    setIsSnapToGrid: (value: boolean) => void;
    isReadOnly: boolean;
    setIsReadOnly: (value: boolean) => void;
    canUndo: boolean;
};


export function CanvasContextMenu({
    top,
    left,
    onClose,
    onAddNode,
    isSnapToGrid,
    setIsSnapToGrid,
    isReadOnly,
    setIsReadOnly,
    canUndo,
}: CanvasContextMenuProps) {
    const menuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleAction = (action: (() => void) | undefined) => {
        if (action) {
            action();
        }
        onClose();
    }

    return (
        <Card
            ref={menuRef}
            style={{ top, left }}
            className="fixed z-50 w-56 p-1 shadow-lg bg-popover"
            onContextMenu={(e) => e.preventDefault()}
        >
            <MenuItem icon={FileText} onClick={() => handleAction(() => onAddNode('custom'))} disabled={isReadOnly}>Add card</MenuItem>
            <MenuItem icon={StickyNote} onClick={() => handleAction(() => onAddNode('sticky'))} disabled={isReadOnly}>Add sticky note</MenuItem>
            <MenuItem icon={Clapperboard} onClick={() => handleAction(() => onAddNode('movie'))} disabled={isReadOnly}>Add media from vault</MenuItem>
            <MenuItem icon={ArrowUpRightSquare} onClick={() => handleAction(() => onAddNode('web'))} disabled={isReadOnly}>Add web page</MenuItem>
            <MenuItem icon={BoxSelect} disabled>Create group</MenuItem>
            <Separator className="my-1" />
            <MenuItem icon={Undo2} disabled={!canUndo || isReadOnly}>Undo</MenuItem>
            <MenuItem icon={ClipboardPaste} disabled={isReadOnly}>Paste</MenuItem>
            <Separator className="my-1" />
            <MenuItem icon={Grid} onClick={() => setIsSnapToGrid(!isSnapToGrid)} isCheckbox checked={isSnapToGrid}>Snap to grid</MenuItem>
            <MenuItem icon={Lock} onClick={() => setIsReadOnly(!isReadOnly)} isCheckbox checked={isReadOnly}>Read-only</MenuItem>
        </Card>
    );
}
