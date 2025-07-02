
'use client';

import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SlideNavigationProps = {
  onNext: () => void;
  onPrev: () => void;
  currentIndex: number;
  totalSlides: number;
};

export const SlideNavigation = ({ onNext, onPrev, currentIndex, totalSlides }: SlideNavigationProps) => {
  return (
    <>
      {/* Navigation Buttons */}
      <div className="absolute z-10 top-1/2 -translate-y-1/2 left-4">
        <Button onClick={onPrev} size="icon" variant="ghost" className="rounded-full h-12 w-12 bg-white/10 hover:bg-white/20">
          <ArrowLeft />
        </Button>
      </div>
      <div className="absolute z-10 top-1/2 -translate-y-1/2 right-4">
        <Button onClick={onNext} size="icon" variant="ghost" className="rounded-full h-12 w-12 bg-white/10 hover:bg-white/20">
          <ArrowRight />
        </Button>
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-2 rounded-full bg-white transition-all duration-300",
              i === currentIndex ? "w-6 opacity-100" : "opacity-50"
            )}
            onClick={() => { /* Can implement direct navigation here if needed */}}
          />
        ))}
      </div>
    </>
  );
};
