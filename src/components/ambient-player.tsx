
'use client';

import * as React from 'react';
import Image from 'next/image';

type AmbientPlayerProps = {
  imageUrl: string;
  trailerUrl: string;
  title: string;
};

export const AmbientPlayer = ({ imageUrl, trailerUrl, title }: AmbientPlayerProps) => {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg bg-black">
      {/* Blurred background image */}
      <Image
        src={imageUrl}
        alt={`Ambient background for ${title}`}
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 z-0 scale-110 blur-3xl opacity-50"
        unoptimized
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
