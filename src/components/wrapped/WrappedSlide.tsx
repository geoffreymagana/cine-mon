
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import type { WrappedSlide } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MusicSuggestionCard } from './MusicSuggestionCard';
import { ChartContainer } from '@/components/ui/chart';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

type WrappedSlideProps = {
  data: WrappedSlide;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/20 bg-black/50 backdrop-blur-sm p-2 shadow-lg text-white">
        <p className="font-bold">{`${label}`}</p>
        <p className="text-sm">{`Titles: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const SlideContent = ({ data }: { data: WrappedSlide }) => {
  if (data.component === 'decadeChart' && data.componentData) {
    const decadeData = data.componentData;
    return (
      <div className="w-full h-64 mt-4">
        <ChartContainer config={{ value: { label: 'Titles', color: 'hsl(var(--primary))' } }} className="h-full w-full">
            <ResponsiveContainer>
              <AreaChart data={decadeData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                <defs>
                  <linearGradient id="wrappedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="name" tick={{ fill: 'white', fontSize: 12 }} tickLine={{ stroke: 'white' }} axisLine={{ stroke: 'white' }} />
                <YAxis tick={{ fill: 'white', fontSize: 12 }} tickLine={{ stroke: 'white' }} axisLine={{ stroke: 'white' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.1)' }}/>
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#wrappedGradient)" />
              </AreaChart>
            </ResponsiveContainer>
        </ChartContainer>
      </div>
    );
  }
  if (data.component === 'topActorsList' && Array.isArray(data.componentData)) {
    return (
        <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            {data.componentData.map((actor: {name: string, avatarUrl: string}, index: number) => (
                <motion.div
                    key={actor.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.2 }}
                    className="flex flex-col items-center gap-2"
                >
                    <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white/50">
                        <AvatarImage src={actor.avatarUrl} alt={actor.name} data-ai-hint="person portrait" />
                        <AvatarFallback>{actor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="font-semibold text-lg md:text-xl text-center">{actor.name}</p>
                </motion.div>
            ))}
        </div>
    );
  }
  if (data.component === 'colorPalette' && data.componentData) {
      const { name, color } = data.componentData as {name: string, color: string};
      return (
          <div className="mt-8 flex flex-col items-center gap-4">
              <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 100, delay: 0.5 }}
                  className="w-24 h-24 rounded-full shadow-lg"
                  style={{ backgroundColor: color }}
              ></motion.div>
              <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: 0.8 }}
                  className="text-2xl font-semibold mt-2"
                >
                  {name}
              </motion.p>
          </div>
      )
  }
  return null;
}

export const WrappedSlideComponent = ({ data }: WrappedSlideProps) => {
  const isColorPaletteSlide = data.component === 'colorPalette' && data.componentData;
  const themeClass = `theme-wrapped-${data.visualTheme}`;
  const color = isColorPaletteSlide ? data.componentData.color : null;
  
  const statsLength = data.stats?.length || 0;
  const titleLength = data.title?.length || 0;

  const statsClassName = cn(
    "text-5xl md:text-8xl font-bold my-4 text-glow",
    {
      "md:text-7xl": statsLength > 15 && statsLength <= 25,
      "md:text-6xl": statsLength > 25 && statsLength <= 35,
      "text-4xl md:text-5xl": statsLength > 35,
    }
  );

  const titleClassName = cn(
    "text-3xl md:text-5xl font-semibold",
    {
        "md:text-4xl": titleLength > 20 && titleLength <= 30,
        "text-2xl md:text-3xl": titleLength > 30,
    }
  );

  return (
    <div className={cn("w-full h-screen flex flex-col items-center justify-center p-8 text-center text-white transition-colors duration-1000 relative", !isColorPaletteSlide && themeClass)}>
        
        {isColorPaletteSlide && (
          <>
            <div className={cn("absolute inset-0", themeClass)} />
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 1.2 }}
              style={{ backgroundColor: color! }}
            />
          </>
        )}
        
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative z-10 flex flex-col items-center justify-center max-w-4xl mx-auto"
        >
            <h2 className="text-2xl md:text-3xl font-light opacity-80">{data.subtitle}</h2>
            
            {data.stats && (
                <h1 className={statsClassName} style={{ textShadow: '0 0 20px hsla(var(--primary), 0.7)' }}>
                    {data.stats}
                </h1>
            )}

            <h3 className={titleClassName}>{data.title}</h3>
            
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
