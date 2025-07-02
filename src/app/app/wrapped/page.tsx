
'use client';

import * as React from 'react';
import type { Movie } from '@/lib/types';
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
            const movies: Movie[] = await MovieService.getMovies();
            const generatedSlides = generateWrappedSlides(movies);
            setSlides(generatedSlides);
        } catch (e) {
            console.error("Error generating Wrapped slides:", e);
            setError("Could not generate your Wrapped data.");
        }
    };
    fetchMoviesAndGenerateSlides();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">An Error Occurred</h1>
        <p className="text-muted-foreground mb-8">{error}</p>
        <Link href="/app/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
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
