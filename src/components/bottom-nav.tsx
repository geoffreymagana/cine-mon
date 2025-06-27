
'use client';

import * as React from 'react';
import { Clapperboard, Film, Tv, Popcorn, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Movie } from '@/lib/types';

type BottomNavProps = {
  filter: 'All' | Movie['type'];
  setFilter: (filter: 'All' | Movie['type']) => void;
  onSurpriseMeClick: () => void;
};

export const BottomNav = ({ filter, setFilter, onSurpriseMeClick }: BottomNavProps) => {
  const navItems = [
    { name: 'All', icon: Clapperboard, filter: 'All' as const },
    { name: 'Movies', icon: Film, filter: 'Movie' as const },
    { name: 'TV', icon: Tv, filter: 'TV Show' as const },
    { name: 'Anime', icon: Popcorn, filter: 'Anime' as const },
    { name: 'Surprise', icon: Shuffle, action: onSurpriseMeClick },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <nav className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => (item.filter ? setFilter(item.filter) : item.action?.())}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 p-2 text-xs font-medium h-full rounded-md',
              (item.filter && filter === item.filter)
                ? 'text-primary'
                : 'text-muted-foreground',
              'transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
