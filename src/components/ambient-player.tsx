
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type AmbientPlayerProps = {
  imageUrl: string;
  trailerUrl: string;
  title: string;
};

export const AmbientPlayer = ({ imageUrl, trailerUrl, title }: AmbientPlayerProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [gradient, setGradient] = React.useState<string | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!ctx || !canvas) return;

    const img = new Image();
    // This is required for getImageData to work on images from other origins
    img.crossOrigin = "Anonymous"; 
    img.src = imageUrl;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const colorCounts: { [key: string]: number } = {};
        const step = 5; // Process every 5th pixel for performance

        for (let i = 0; i < imageData.length; i += 4 * step) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          // Skip transparent or near-black/white pixels to get more vibrant colors
          if (imageData[i + 3] < 255 || (r < 10 && g < 10 && b < 10) || (r > 245 && g > 245 && b > 245)) {
              continue;
          }
          
          const key = `${r},${g},${b}`;
          colorCounts[key] = (colorCounts[key] || 0) + 1;
        }

        const sortedColors = Object.keys(colorCounts)
          .sort((a, b) => colorCounts[b] - colorCounts[a])
          .slice(0, 3); // Get top 3 colors
        
        if (sortedColors.length > 0) {
            const colors = sortedColors.map(c => `rgb(${c})`);
            const ambientGradient = `radial-gradient(circle at 20% 20%, ${colors[0]} 0%, transparent 70%), radial-gradient(circle at 80% 30%, ${colors[1] || colors[0]} 0%, transparent 60%), radial-gradient(circle at 50% 80%, ${colors[2] || colors[0]} 0%, transparent 50%)`;
            setGradient(ambientGradient);
        } else {
             // Fallback if no suitable colors are found
            setGradient('radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)');
        }

      } catch (e) {
        console.error("Could not get image data for ambient effect (likely a CORS issue):", e);
        setGradient('radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)');
      }
    };
    
    img.onerror = () => {
        console.error("Failed to load image for ambient effect.");
        setGradient('radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)');
    }

  }, [imageUrl]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg">
      {/* Hidden canvas for color extraction */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Ambient background effect */}
      <div 
        className="absolute inset-[-200px] z-0 blur-[120px] opacity-50 transition-all duration-1000"
        style={{
            background: gradient || 'transparent',
            opacity: gradient ? 0.6 : 0,
        }}
      />
      
      {/* Video Player */}
      <div className="relative z-10 w-full h-full">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${trailerUrl}?autoplay=1&showinfo=0&controls=1&rel=0`}
          title={`Trailer for ${title}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};
