
"use client";

import * as React from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Clapperboard, Film, Tv, Ghost, Heart, Palette } from 'lucide-react';

const filters = [
  { name: 'All', icon: Clapperboard, value: 'All' },
  { name: 'Movies', icon: Film, value: 'Movie' },
  { name: 'TV', icon: Tv, value: 'TV Show' },
  { name: 'Anime', icon: Ghost, value: 'Anime' },
  { name: 'K-Drama', icon: Heart, value: 'K-Drama' },
  { name: 'Animation', icon: Palette, value: 'Animation' },
];

export const GenreFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get('filter') || 'All';

  const handleFilterChange = (filter: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('filter', filter);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full px-4 md:px-8">
        <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto py-2">
        {filters.map((filter) => (
            <Button
            key={filter.value}
            variant={currentFilter === filter.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange(filter.value)}
            className="shrink-0"
            >
            <filter.icon className="mr-2 h-4 w-4" />
            {filter.name}
            </Button>
        ))}
        </div>
    </div>
  );
};
