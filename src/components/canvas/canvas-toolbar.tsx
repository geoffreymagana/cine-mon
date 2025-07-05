
'use client';

import * as React from 'react';
import {
    Settings,
    ZoomIn,
    ZoomOut,
    Minimize,
    Undo2,
    Redo2,
    HelpCircle,
    Layout,
    ArrowDownUp,
    ArrowRightLeft
} from 'lucide-react';
import { useReactFlow } from 'reactflow';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type CanvasToolbarProps = {
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onShowHelp: () => void;
    onLayout: (direction: 'TB' | 'LR') => void;
    isReadOnly: boolean;
    setIsReadOnly: (isReadOnly: boolean) => void;
};

export function CanvasToolbar({ onUndo, onRedo, canUndo, canRedo, onShowHelp, onLayout, isReadOnly, setIsReadOnly }: CanvasToolbarProps) {
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    return (
        <Card className="absolute top-1/2 right-4 -translate-y-1/2 z-10 p-2 flex flex-col gap-1 shadow-lg bg-background/80 backdrop-blur-sm">
            <Tooltip>
                <Popover>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Settings">
                                <Settings className="w-5 h-5" />
                            </Button>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <PopoverContent className="w-64" side="left" align="center">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Settings</h4>
                                <p className="text-sm text-muted-foreground">
                                    Adjust canvas behavior.
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="snap-grid">Snap to grid</Label>
                                    <Switch id="snap-grid" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="snap-objects">Snap to objects</Label>
                                    <Switch id="snap-objects" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="read-only">Read only</Label>
                                    <Switch id="read-only" checked={isReadOnly} onCheckedChange={setIsReadOnly} />
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
                 <TooltipContent side="left"><p>Settings</p></TooltipContent>
            </Tooltip>

            <Separator className="my-1" />
            
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => zoomIn({ duration: 300 })} aria-label="Zoom In">
                        <ZoomIn className="w-5 h-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left"><p>Zoom In</p></TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => zoomOut({ duration: 300 })} aria-label="Zoom Out">
                        <ZoomOut className="w-5 h-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left"><p>Zoom Out</p></TooltipContent>
            </Tooltip>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => fitView({ duration: 300 })} aria-label="Fit to View">
                        <Minimize className="w-5 h-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left"><p>Fit to View</p></TooltipContent>
            </Tooltip>

            <Separator className="my-1" />
            
            <Popover>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Auto Layout" disabled={isReadOnly}>
                                <Layout className="w-5 h-5" />
                            </Button>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="left"><p>Auto-Arrange</p></TooltipContent>
                </Tooltip>
                <PopoverContent className="w-auto p-1" side="left">
                    <div className="flex flex-col gap-1">
                        <Button variant="ghost" className="justify-start" onClick={() => onLayout('TB')}>
                            <ArrowDownUp className="mr-2 h-4 w-4" /> Top to Bottom
                        </Button>
                        <Button variant="ghost" className="justify-start" onClick={() => onLayout('LR')}>
                            <ArrowRightLeft className="mr-2 h-4 w-4" /> Left to Right
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

             <Tooltip>
                <TooltipTrigger asChild>
                     <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo || isReadOnly} aria-label="Undo">
                        <Undo2 className="w-5 h-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left"><p>Undo</p></TooltipContent>
            </Tooltip>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo || isReadOnly} aria-label="Redo">
                        <Redo2 className="w-5 h-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left"><p>Redo</p></TooltipContent>
            </Tooltip>

            <Separator className="my-1" />
            
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onShowHelp} aria-label="Help">
                        <HelpCircle className="w-5 h-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left"><p>Help</p></TooltipContent>
            </Tooltip>
        </Card>
    );
}
