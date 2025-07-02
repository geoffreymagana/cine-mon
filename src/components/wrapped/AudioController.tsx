
'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '../ui/button';

type AudioControllerProps = {
  soundscapeSrc?: string;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
};

export const AudioController = ({ soundscapeSrc, isPlaying, setIsPlaying }: AudioControllerProps) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<{ source: AudioBufferSourceNode; gainNode: GainNode; src: string } | null>(null);

  const changeSound = useCallback(async (newSrc?: string) => {
    if (!audioContextRef.current) return;

    // 1. Fade out the current sound, if it exists
    if (sourceRef.current) {
      const currentSource = sourceRef.current;
      currentSource.gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContextRef.current.currentTime + 0.5);
      
      // Schedule the source to stop after fading out
      setTimeout(() => {
        try { currentSource.source.stop(); } catch(e) { /* Fails silently if already stopped */ }
      }, 550);
    }
    
    // Clear the ref immediately to allow a new sound to be prepared.
    sourceRef.current = null;
    
    // 2. If there's no new sound or we are paused, we're done.
    if (!newSrc || !isPlaying) return;

    // 3. Load and fade in the new sound
    try {
      const response = await fetch(newSrc);
      if (!response.ok) throw new Error('Failed to fetch audio');
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      const sourceNode = audioContextRef.current.createBufferSource();
      const gainNode = audioContextRef.current.createGain();

      sourceNode.buffer = audioBuffer;
      sourceNode.loop = true;
      gainNode.gain.setValueAtTime(0.0001, audioContextRef.current.currentTime);
      
      sourceNode.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      sourceNode.start();

      // Fade in
      gainNode.gain.exponentialRampToValueAtTime(1, audioContextRef.current.currentTime + 0.5);
      
      sourceRef.current = { source: sourceNode, gainNode, src: newSrc };
    } catch (error) {
      console.error('Error changing sound:', error);
    }
  }, [isPlaying]);

  useEffect(() => {
    // Effect to handle changes in sound source
    if (soundscapeSrc !== sourceRef.current?.src) {
      if (audioContextRef.current) { // Ensure context exists before changing sound
        changeSound(soundscapeSrc);
      }
    }
  }, [soundscapeSrc, changeSound]);

  useEffect(() => {
    // Effect to handle play/pause state
    if (!audioContextRef.current || !sourceRef.current) return;

    if (isPlaying) {
      sourceRef.current.gainNode.gain.exponentialRampToValueAtTime(1, audioContextRef.current.currentTime + 0.5);
    } else {
      sourceRef.current.gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContextRef.current.currentTime + 0.5);
    }
  }, [isPlaying]);

  const handleTogglePlay = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setIsPlaying(!isPlaying);

    // If starting from scratch, trigger the sound change
    if (!sourceRef.current && soundscapeSrc && !isPlaying === false) {
      changeSound(soundscapeSrc);
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        try { sourceRef.current.source.stop(); } catch(e) {}
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
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
