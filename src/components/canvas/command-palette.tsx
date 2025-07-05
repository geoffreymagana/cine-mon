
'use client';

import * as React from 'react';
import {
  FileText,
  Clapperboard,
  Save,
  Minimize,
  ArrowDownUp,
  ArrowRightLeft,
  Link2,
  Lock
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
  onAddWebPageNode: () => void;
  onSave: () => void;
  onZoomToFit: () => void;
  onAutoLayoutTB: () => void;
  onAutoLayoutLR: () => void;
  isReadOnly: boolean;
  setIsReadOnly: (isReadOnly: boolean) => void;
};

export function CommandPalette({
  isOpen,
  setIsOpen,
  onAddNode,
  onAddMovieNode,
  onAddWebPageNode,
  onSave,
  onZoomToFit,
  onAutoLayoutTB,
  onAutoLayoutLR,
  isReadOnly,
  setIsReadOnly,
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
          <CommandItem onSelect={() => runCommand(onAddNode)} disabled={isReadOnly}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Add Card</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(onAddMovieNode)} disabled={isReadOnly}>
            <Clapperboard className="mr-2 h-4 w-4" />
            <span>Add Movie from Collection</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(onAddWebPageNode)} disabled={isReadOnly}>
            <Link2 className="mr-2 h-4 w-4" />
            <span>Add Web Page</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(onSave)} disabled={isReadOnly}>
            <Save className="mr-2 h-4 w-4" />
            <span>Save Canvas</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Layout">
          <CommandItem onSelect={() => runCommand(onAutoLayoutTB)} disabled={isReadOnly}>
            <ArrowDownUp className="mr-2 h-4 w-4" />
            <span>Auto-Arrange (Top to Bottom)</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(onAutoLayoutLR)} disabled={isReadOnly}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            <span>Auto-Arrange (Left to Right)</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
            <CommandItem onSelect={() => { setIsReadOnly(!isReadOnly); setIsOpen(false); }}>
                <Lock className="mr-2 h-4 w-4" />
                <span>{isReadOnly ? 'Disable Read-Only Mode' : 'Enable Read-Only Mode'}</span>
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
