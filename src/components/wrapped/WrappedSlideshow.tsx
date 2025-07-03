
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WrappedSlide } from '@/lib/types';
import { WrappedSlideComponent } from '@/components/wrapped/WrappedSlide';
import { SlideNavigation } from '@/components/wrapped/SlideNavigation';
import { ShareButton } from '@/components/wrapped/ShareButton';
import { ParticleBackground } from './ParticleBackground';
import Link from 'next/link';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import { AudioController } from './AudioController';

type WrappedSlideshowProps = {
  slides: WrappedSlide[];
};

export const WrappedSlideshow = ({ slides }: WrappedSlideshowProps) => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);

  const currentSlide = slides[index];

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setIndex(prevIndex => (prevIndex + newDirection + slides.length) % slides.length);
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        paginate(1);
      } else if (e.key === 'ArrowLeft') {
        paginate(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  return (
    <div className="relative w-full h-screen bg-black text-white font-headline overflow-hidden">
        <ParticleBackground />

        <div className="absolute top-4 right-4 z-20 flex gap-2 items-center">
            <AudioController 
              soundscapeSrc={currentSlide.soundscape}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
            />
            <ShareButton elementRef={slideRef} title={currentSlide.title} />
            <Link href="/app/dashboard">
                <Button size="icon" variant="ghost"><X /></Button>
            </Link>
        </div>
      
        <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
                key={index}
                ref={slideRef}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                }}
                className="absolute w-full h-full"
            >
                <WrappedSlideComponent data={currentSlide} />
            </motion.div>
        </AnimatePresence>

        <SlideNavigation
            onNext={() => paginate(1)}
            onPrev={() => paginate(-1)}
            currentIndex={index}
            totalSlides={slides.length}
        />
    </div>
  );
};
