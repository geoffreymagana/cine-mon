
'use client';

import React, { useMemo } from 'react';

export const ParticleBackground = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => {
      const size = Math.random() * 3 + 1;
      const style = {
        width: `${size}px`,
        height: `${size}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 10 + 15}s`,
        animationDelay: `${Math.random() * -25}s`,
      };
      return <div key={i} className="particle" style={style} />;
    });
  }, []);

  return <div className="absolute inset-0 z-0 overflow-hidden">{particles}</div>;
};
