
'use client';

import * as React from 'react';
import { Palette, Spline, Minus, Check } from 'lucide-react';
import { type Edge } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type EdgeToolbarProps = {
  selectedEdges: Edge[];
  onEdgeColorChange: (color: string) => void;
  onEdgeTypeChange: (type: 'smoothstep' | 'straight') => void;
};

const edgeColors = [
    'hsl(var(--foreground))',
    'hsl(0, 72%, 51%)',
    'hsl(30, 82%, 56%)',
    'hsl(54, 85%, 51%)',
    'hsl(142, 71%, 45%)',
    'hsl(198, 93%, 60%)',
    'hsl(262, 84%, 60%)',
    'hsl(320, 74%, 56%)'
];

export function EdgeToolbar({ selectedEdges, onEdgeColorChange, onEdgeTypeChange }: EdgeToolbarProps) {
  if (selectedEdges.length === 0) return null;

  const currentEdge = selectedEdges[0];
  const currentColor = currentEdge.style?.stroke || 'hsl(var(--foreground))';
  const currentType = currentEdge.type || 'smoothstep';

  return (
    <Card className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 p-1 flex items-center gap-1 shadow-lg bg-background/80 backdrop-blur-sm">
      <Tooltip>
        <TooltipTrigger asChild>
            <Button variant={currentType === 'smoothstep' ? 'secondary' : 'ghost'} size="icon" onClick={() => onEdgeTypeChange('smoothstep')}>
                <Spline className="w-5 h-5" />
            </Button>
        </TooltipTrigger>
        <TooltipContent side="top"><p>Smooth Edge</p></TooltipContent>
      </Tooltip>
       <Tooltip>
        <TooltipTrigger asChild>
            <Button variant={currentType === 'straight' ? 'secondary' : 'ghost'} size="icon" onClick={() => onEdgeTypeChange('straight')}>
                <Minus className="w-5 h-5" />
            </Button>
        </TooltipTrigger>
        <TooltipContent side="top"><p>Straight Edge</p></TooltipContent>
      </Tooltip>
      
      <Separator orientation="vertical" className="h-6 mx-1" />

      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Palette className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Change Edge Color</p>
          </TooltipContent>
        </Tooltip>
        <PopoverContent className="w-auto p-2" side="top">
          <div className="grid grid-cols-4 gap-2">
            {edgeColors.map((color) => (
              <Button
                key={color}
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                style={{ backgroundColor: color }}
                onClick={() => onEdgeColorChange(color)}
              >
                {currentColor === color && <Check className="h-4 w-4 text-white mix-blend-difference" />}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </Card>
  );
}
