
'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText, Clapperboard, FileImage } from 'lucide-react';

type NodeCreatorProps = {
  onAddNode: (type: string) => void;
};

export function NodeCreator({ onAddNode }: NodeCreatorProps) {
  return (
    <Card className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 p-2 bg-background/80 backdrop-blur-sm">
      <CardContent className="p-0 flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => onAddNode('custom')}>
              <FileText className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Card</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" disabled>
              <Clapperboard className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Title (Coming Soon)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" disabled>
              <FileImage className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Media (Coming Soon)</p>
          </TooltipContent>
        </Tooltip>
      </CardContent>
    </Card>
  );
}
