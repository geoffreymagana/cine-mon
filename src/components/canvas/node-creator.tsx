
'use client';

import * as React from 'react';
import { FileText, Clapperboard, FileImage } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type NodeCreatorProps = {
  onAddNode: (type: 'custom') => void;
  onAddMovieClick: () => void;
};

export function NodeCreator({ onAddNode, onAddMovieClick }: NodeCreatorProps) {
  const handleAddNode = (type: 'custom') => {
    onAddNode(type);
  };

  return (
    <Card className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 p-2 flex items-center gap-2 shadow-lg bg-background/80 backdrop-blur-sm">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleAddNode('custom')} 
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
            onClick={onAddMovieClick} 
            className="transition-all hover:-translate-y-1 hover:bg-primary/20"
          >
            <Clapperboard className="w-5 h-5" />
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
            disabled 
            className="transition-all hover:-translate-y-1 hover:bg-primary/20"
          >
            <FileImage className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add Media (Coming Soon)</p>
        </TooltipContent>
      </Tooltip>
    </Card>
  );
}
