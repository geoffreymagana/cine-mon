
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
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const fadeOut = useCallback(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.exponentialRampToValueAtTime(0.0001, audioContextRef.current.currentTime + 0.5);
    }
  }, []);

  const fadeIn = useCallback(() => {
    if (gainNodeRef.current && audioContextRef.current) {
        gainNodeRef.current.gain.setValueAtTime(0.0001, audioContextRef.current.currentTime);
        gainNodeRef.current.gain.exponentialRampToValueAtTime(1, audioContextRef.current.currentTime + 0.5);
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioSourceRef.current) {
      fadeOut();
      setTimeout(() => {
        audioSourceRef.current?.stop();
        audioSourceRef.current = null;
      }, 500);
    }
  }, [fadeOut]);

  const playAudio = useCallback(async (src: string) => {
    if (!audioContextRef.current) return;
    
    stopAudio();

    try {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.loop = true;

      gainNodeRef.current = audioContextRef.current.createGain();
      source.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);
      
      source.start();
      audioSourceRef.current = source;
      fadeIn();

    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, [fadeIn, stopAudio]);

  useEffect(() => {
    if (soundscapeSrc && isPlaying) {
      playAudio(soundscapeSrc);
    } else {
      stopAudio();
    }
  }, [soundscapeSrc, isPlaying, playAudio, stopAudio]);
  
  const handleTogglePlay = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    setIsPlaying(!isPlaying);
  };

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
