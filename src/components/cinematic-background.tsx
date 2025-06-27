import * as React from 'react';
import { cn } from '@/lib/utils';

export const CinematicBackground = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn("absolute inset-0 z-0 w-full h-full opacity-50", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="neon-gradient-primary" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--primary) / 0)" />
        </radialGradient>
        <radialGradient id="neon-gradient-accent" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="hsl(var(--accent))" />
          <stop offset="100%" stopColor="hsl(var(--accent) / 0)" />
        </radialGradient>
        <filter id="neon-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="80" result="coloredBlur" />
        </filter>
      </defs>
      <g filter="url(#neon-blur)" opacity="0.6">
        <circle cx="20%" cy="30%" r="200" fill="url(#neon-gradient-primary)" />
        <circle cx="80%" cy="60%" r="250" fill="url(#neon-gradient-accent)" />
        <ellipse cx="50%" cy="80%" rx="300" ry="150" fill="url(#neon-gradient-primary)" opacity="0.7" />
      </g>
    </svg>
  );
};
