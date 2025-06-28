
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
  const leftItems = [
    { name: 'All', icon: Clapperboard, filter: 'All' as const },
    { name: 'Movies', icon: Film, filter: 'Movie' as const },
  ];
  
  const rightItems = [
    { name: 'TV Shows', icon: Tv, filter: 'TV Show' as const },
    { name: 'Anime', icon: Popcorn, filter: 'Anime' as const },
  ];

  const NavButton = ({ item, isActive, onClick }: { item: { name: string; icon: React.ElementType }, isActive: boolean, onClick: () => void }) => (
    <button
      key={item.name}
      onClick={onClick}
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-1 p-2 text-xs font-medium h-full',
        isActive ? 'text-primary' : 'text-muted-foreground',
        'transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
      )}
    >
      <item.icon className="h-6 w-6" />
      <span>{item.name}</span>
    </button>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-[72px] md:hidden">
      {/* Background and nav items container */}
      <div className="relative h-full bg-background/95 border-t border-border backdrop-blur-sm">
        <div className="flex h-full items-center justify-around">
          {/* Left nav items */}
          <div className="flex w-full items-center justify-around">
            {leftItems.map((item) => (
              <NavButton
                key={item.name}
                item={item}
                isActive={filter === item.filter}
                onClick={() => setFilter(item.filter)}
              />
            ))}
          </div>

          {/* Spacer for the central button */}
          <div className="w-[74px] flex-shrink-0" />

          {/* Right nav items */}
          <div className="flex w-full items-center justify-around">
            {rightItems.map((item) => (
              <NavButton
                key={item.name}
                item={item}
                isActive={filter === item.filter}
                onClick={() => setFilter(item.filter)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={onSurpriseMeClick}
        aria-label="Surprise Me"
        className="absolute left-1/2 top-[-10px] -translate-x-1/2 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-background transition-transform hover:scale-105 focus:scale-105 focus:outline-none focus:ring-primary/50"
      >
        <Shuffle className="h-7 w-7" />
      </button>
    </div>
  );
};
