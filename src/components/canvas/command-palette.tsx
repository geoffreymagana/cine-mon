
'use client';

import * as React from 'react';
import {
  FileText,
  Clapperboard,
  Save,
  Minimize,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

type CommandPaletteProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onAddNode: () => void;
  onAddMovieNode: () => void;
  onSave: () => void;
  onZoomToFit: () => void;
};

export function CommandPalette({
  isOpen,
  setIsOpen,
  onAddNode,
  onAddMovieNode,
  onSave,
  onZoomToFit,
}: CommandPaletteProps) {
  const runCommand = React.useCallback((command: () => unknown) => {
    setIsOpen(false);
    command();
  }, [setIsOpen]);

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runCommand(onAddNode)}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Add Card</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(onAddMovieNode)}>
            <Clapperboard className="mr-2 h-4 w-4" />
            <span>Add Movie from Collection</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(onSave)}>
            <Save className="mr-2 h-4 w-4" />
            <span>Save Canvas</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="View">
          <CommandItem onSelect={() => runCommand(onZoomToFit)}>
            <Minimize className="mr-2 h-4 w-4" />
            <span>Zoom to Fit</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
