'use client';

import * as React from 'react';
import { FileText, Film, Link2, StickyNote } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type NodeCreatorProps = {
  onAddNode: (type: 'custom' | 'sticky' | 'web') => void;
  onAddMovieClick: () => void;
};

export function NodeCreator({ onAddNode, onAddMovieClick }: NodeCreatorProps) {

  return (
    <Card className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 p-2 flex items-center gap-2 shadow-lg bg-background/80 backdrop-blur-sm">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onAddNode('custom')} 
            className="transition-all hover:-translate-y-1 hover:bg-primary/20"
          >
            <FileText className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add Card</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onAddNode('sticky')}
            className="transition-all hover:-translate-y-1 hover:bg-primary/20"
          >
            <StickyNote className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add Sticky Note</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onAddMovieClick} 
            className="transition-all hover:-translate-y-1 hover:bg-primary/20"
          >
            <Film className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add Title from Collection</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onAddNode('web')} 
            className="transition-all hover:-translate-y-1 hover:bg-primary/20"
          >
            <Link2 className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add Web Page</p>
        </TooltipContent>
      </Tooltip>
    </Card>
  );
}
