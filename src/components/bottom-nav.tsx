
'use client';

import * as React from 'react';
import { Home, Sparkles, Shuffle, BarChart3, DownloadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type BottomNavProps = {
  onSurpriseMeClick: () => void;
};

export const BottomNav = ({ onSurpriseMeClick }: BottomNavProps) => {
  const pathname = usePathname();

  const mainItems = [
    { name: 'Home', icon: Home, href: '/app/dashboard' },
    { name: 'Stats', icon: BarChart3, href: '/app/analytics' },
    { name: 'Collections', icon: Sparkles, href: '/app/collections' },
    { name: 'Backup', icon: DownloadCloud, href: '/app/export' },
  ];

  // Split items for layout around the central button
  const leftItems = mainItems.slice(0, 2);
  const rightItems = mainItems.slice(2);

  const NavButton = ({ item }: { item: { name: string; icon: React.ElementType, href: string }}) => {
    const isActive = pathname === item.href;
    return (
        <Link
            key={item.name}
            href={item.href}
            className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 p-2 text-xs font-medium h-full',
                isActive ? 'text-primary' : 'text-muted-foreground',
                'transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
            )}
        >
            <item.icon className="h-6 w-6" />
            <span className="sr-only">{item.name}</span>
        </Link>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-[60px] md:hidden">
      <div className="relative h-full bg-background/95 border-t border-border backdrop-blur-sm">
        <div className="flex h-full items-center justify-around">
          <div className="flex w-full items-center justify-around">
            {leftItems.map((item) => <NavButton key={item.name} item={item} />)}
          </div>
          <div className="w-[74px] flex-shrink-0" />
          <div className="flex w-full items-center justify-around">
            {rightItems.map((item) => <NavButton key={item.name} item={item} />)}
          </div>
        </div>
      </div>
      <button
        onClick={onSurpriseMeClick}
        aria-label="Surprise Me"
        className="absolute left-1/2 top-[-20px] -translate-x-1/2 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background transition-transform hover:scale-105 focus:scale-105 focus:outline-none focus:ring-primary/50"
      >
        <Shuffle className="h-7 w-7" />
      </button>
    </div>
  );
};
