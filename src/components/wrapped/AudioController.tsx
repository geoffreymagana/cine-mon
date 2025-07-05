
'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '../ui/button';

type AudioControllerProps = {
  soundscapeSrc?: string;
  isPlaying: boolean; // This will now control the MUTE state
  setIsPlaying: (playing: boolean) => void; // This will now control the MUTE state
};

export const AudioController = ({ soundscapeSrc, isPlaying, setIsPlaying }: AudioControllerProps) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<{ source: AudioBufferSourceNode; gainNode: GainNode; src: string } | null>(null);

  const changeSound = useCallback(async (newSrc?: string) => {
    if (typeof window === 'undefined') return;
    
    // Ensure context exists for any sound change operation
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const context = audioContextRef.current;

    // Fade out current sound
    if (sourceRef.current) {
      const current = sourceRef.current;
      current.gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.3);
      setTimeout(() => {
        try { current.source.stop(); } catch (e) { /* Fails silently if already stopped */ }
      }, 350);
    }
    sourceRef.current = null;

    if (!newSrc) return;

    // Load and play new sound
    try {
      const response = await fetch(newSrc);
      if (!response.ok) {
        console.error(`Failed to fetch audio: ${newSrc}. Status: ${response.status}`);
        return;
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await context.decodeAudioData(arrayBuffer);

      const gainNode = context.createGain();
      const sourceNode = context.createBufferSource();
      
      sourceNode.buffer = audioBuffer;
      sourceNode.loop = true;
      sourceNode.connect(gainNode);
      gainNode.connect(context.destination);
      
      const targetVolume = isPlaying ? 1 : 0; // Check MUTE state
      gainNode.gain.setValueAtTime(targetVolume > 0 ? 0.0001 : 0, context.currentTime);

      sourceNode.start();
      
      if (targetVolume > 0) {
        gainNode.gain.exponentialRampToValueAtTime(targetVolume, context.currentTime + 0.3);
      }
      sourceRef.current = { source: sourceNode, gainNode, src: newSrc };

    } catch (error) {
      console.error('Error processing audio:', error);
    }
  }, [isPlaying]); // isPlaying is now the MUTE state

  // Effect to change sound when slide changes
  useEffect(() => {
    if (soundscapeSrc !== sourceRef.current?.src) {
        changeSound(soundscapeSrc);
    }
  }, [soundscapeSrc, changeSound]);

  // Effect to handle muting/unmuting
  useEffect(() => {
    if (sourceRef.current) {
      const context = audioContextRef.current;
      if (context) {
        const targetVolume = isPlaying ? 1 : 0;
        sourceRef.current.gainNode.gain.exponentialRampToValueAtTime(
          targetVolume > 0 ? targetVolume : 0.0001,
          context.currentTime + 0.3
        );
      }
    }
  }, [isPlaying]);

  const handleTogglePlay = () => {
    // On first click, create and resume context
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setIsPlaying(prev => !prev);
  };
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        try { sourceRef.current.source.stop(); } catch (e) {}
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
      }
    };
  }, []);

  return (
    <Button onClick={handleTogglePlay} size="icon" variant="ghost">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isPlaying ? 'playing' : 'paused'}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {isPlaying ? <Volume2 /> : <VolumeX />}
        </motion.div>
      </AnimatePresence>
    </Button>
  );
};
