
'use client';

import * as React from 'react';
import type { Movie, WrappedSlide } from '@/lib/types';
import { WrappedSlideshow } from '@/components/wrapped/WrappedSlideshow';
import { generateWrappedSlides } from '@/lib/wrapped';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MovieService } from '@/lib/movie-service';

export default function WrappedPage() {
  const [slides, setSlides] = React.useState<any[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchMoviesAndGenerateSlides = async () => {
        try {
            const [movies, watchGoal] = await Promise.all([
                MovieService.getMovies(),
                MovieService.getSetting('watchGoal')
            ]);
            const generatedSlides = generateWrappedSlides(movies, watchGoal || 200);
            setSlides(generatedSlides);
        } catch (e) {
            console.error("Error generating Wrapped slides:", e);
            setError("Could not generate your Wrapped data.");
        }
    };
    fetchMoviesAndGenerateSlides();
  }, []);

  if (error) {
    const errorSlide: WrappedSlide = {
        id: 'error-slide',
        title: "The film is a bit fuzzy...",
        subtitle: "We couldn't generate your Wrapped data right now.",
        stats: "Try again in a bit, or add more to your collection!",
        visualTheme: 'mystery',
        soundscape: '/sounds/myst-dark-drone-synth-female-vocal-choir-atmo-ambience-cinematic.wav'
    };
    return <WrappedSlideshow slides={[errorSlide]} />;
  }

  if (!slides) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return <WrappedSlideshow slides={slides} />;
}
