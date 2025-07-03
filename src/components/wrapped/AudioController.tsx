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
      currentSource.gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContextRef.current.currentTime + 0.3);
      setTimeout(() => {
        try { currentSource.source.stop(); } catch (e) { /* Fails silently if already stopped */ }
      }, 350);
    }

    sourceRef.current = null;

    if (!newSrc) return; // if no new sound, just stop.

    // 3. Load and fade in the new sound
    try {
      const response = await fetch(newSrc);
      if (!response.ok) {
        console.error(`Failed to fetch audio: ${newSrc}. Status: ${response.status}`);
        return;
      }
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

      gainNode.gain.exponentialRampToValueAtTime(1, audioContextRef.current.currentTime + 0.3);
      sourceRef.current = { source: sourceNode, gainNode, src: newSrc };
    } catch (error) {
      console.error('Error processing audio:', error);
    }
  }, []); // This callback has no dependencies on state/props, making it stable.

  // Main effect to handle all audio logic
  useEffect(() => {
    if (!audioContextRef.current) return;

    if (isPlaying) {
      // If the source is different, or if there's no source playing, change the sound.
      if (soundscapeSrc !== sourceRef.current?.src) {
        changeSound(soundscapeSrc);
      } else if (sourceRef.current) { // If source is the same, just ensure it's faded in
        sourceRef.current.gainNode.gain.exponentialRampToValueAtTime(1, audioContextRef.current.currentTime + 0.3);
      }
    } else { // if not playing
      if (sourceRef.current) {
        sourceRef.current.gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContextRef.current.currentTime + 0.3);
      }
    }
  }, [isPlaying, soundscapeSrc, changeSound]);

  const handleTogglePlay = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    setIsPlaying(prev => !prev);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        try { sourceRef.current.source.stop(); } catch (e) {}
      }
      if (audioContextRef.current) {
        // Use a variable to hold the context for the cleanup function
        const contextToClose = audioContextRef.current;
        contextToClose.close().catch(console.error);
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