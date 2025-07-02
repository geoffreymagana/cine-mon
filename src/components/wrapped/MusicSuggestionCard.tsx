
'use client';

import React from 'react';
import { generateMusicLinks } from '@/lib/wrapped';
import { Button } from '../ui/button';
import { PlayCircle } from 'lucide-react';

type MusicSuggestionCardProps = {
  suggestion: {
    title: string;
    artist: string;
    searchQuery: string;
  };
};

export const MusicSuggestionCard = ({ suggestion }: MusicSuggestionCardProps) => {
  const links = generateMusicLinks(suggestion.searchQuery);

  return (
    <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg max-w-sm mx-auto border border-white/20">
      <div className="text-left">
        <p className="text-xs opacity-70">SOUNDTRACK SUGGESTION</p>
        <p className="font-bold text-lg">{suggestion.title}</p>
        <p className="text-sm opacity-80">{suggestion.artist}</p>
      </div>
      <div className="flex justify-between mt-4">
        <a href={links.spotify} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="sm">Spotify</Button>
        </a>
        <a href={links.youtube} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="sm">YouTube</Button>
        </a>
        <a href={links.apple} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="sm">Apple Music</Button>
        </a>
      </div>
    </div>
  );
};
