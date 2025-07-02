
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { WrappedSlide } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MusicSuggestionCard } from './MusicSuggestionCard';
import { ChartContainer } from '@/components/ui/chart';

type WrappedSlideProps = {
  data: WrappedSlide;
};

const SlideContent = ({ data }: { data: WrappedSlide }) => {
  if (data.component === 'decadeChart' && data.componentData) {
    const decadeData = data.componentData;
    return (
      <div className="w-full h-64 mt-4">
        <ChartContainer config={{ value: { label: 'Titles', color: 'hsl(var(--primary))' } }} className="h-full w-full">
            <ResponsiveContainer>
              <BarChart data={decadeData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="name" tick={{ fill: 'white', fontSize: 12 }} tickLine={{ stroke: 'white' }} axisLine={{ stroke: 'white' }} />
                <YAxis tick={{ fill: 'white', fontSize: 12 }} tickLine={{ stroke: 'white' }} axisLine={{ stroke: 'white' }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
      </div>
    );
  }
  return null;
}

export const WrappedSlideComponent = ({ data }: WrappedSlideProps) => {
  const themeClass = `theme-wrapped-${data.visualTheme}`;
  
  const statsLength = data.stats?.length || 0;
  const statsClassName = cn(
    "text-5xl md:text-8xl font-bold my-4 text-glow",
    {
      "md:text-7xl": statsLength > 15 && statsLength <= 25,
      "md:text-6xl": statsLength > 25 && statsLength <= 35,
      "text-4xl md:text-5xl": statsLength > 35,
    }
  );

  return (
    <div className={cn("w-full h-screen flex flex-col items-center justify-center p-8 text-center text-white transition-colors duration-1000", themeClass)}>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col items-center justify-center max-w-4xl mx-auto"
        >
            <h2 className="text-2xl md:text-3xl font-light opacity-80">{data.subtitle}</h2>
            
            {data.stats && (
                <h1 className={statsClassName} style={{ textShadow: '0 0 20px hsla(var(--primary), 0.7)' }}>
                    {data.stats}
                </h1>
            )}

            <h3 className="text-3xl md:text-5xl font-semibold">{data.title}</h3>
            
            {data.component && <div className="mt-8 w-full"><SlideContent data={data} /></div>}
            
            {data.musicSuggestion && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="mt-12"
                >
                    <MusicSuggestionCard suggestion={data.musicSuggestion} />
                </motion.div>
            )}
        </motion.div>
    </div>
  );
};
