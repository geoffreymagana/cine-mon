
'use client';

import * as React from 'react';
import { Palette, Check } from 'lucide-react';
import { type Node } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type ColorPickerToolbarProps = {
  node: Node;
  onColorChange: (color: string) => void;
};

const colors = [
  'hsl(var(--card))', // Default
  'hsl(var(--muted))',
  'hsl(var(--chart-1) / 0.2)',
  'hsl(var(--chart-2) / 0.2)',
  'hsl(var(--chart-3) / 0.2)',
  'hsl(var(--chart-4) / 0.2)',
  'hsl(var(--chart-5) / 0.2)',
  'hsl(var(--destructive) / 0.2)',
];

export function ColorPickerToolbar({ node, onColorChange }: ColorPickerToolbarProps) {
  const currentColor = node.data.color || 'hsl(var(--card))';

  return (
    <Card className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 p-1 flex items-center gap-1 shadow-lg bg-background/80 backdrop-blur-sm">
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
            <p>Change Color</p>
          </TooltipContent>
        </Tooltip>
        <PopoverContent className="w-auto p-2" side="top">
          <div className="grid grid-cols-4 gap-2">
            {colors.map((color) => (
              <Button
                key={color}
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                style={{ backgroundColor: color }}
                onClick={() => onColorChange(color)}
              >
                {currentColor === color && <Check className="h-4 w-4 text-foreground" />}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </Card>
  );
}
