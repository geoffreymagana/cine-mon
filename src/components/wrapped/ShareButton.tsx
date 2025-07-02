
'use client';

import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { Share2, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';

type ShareButtonProps = {
  elementRef: React.RefObject<HTMLElement>;
  title: string;
};

export const ShareButton = ({ elementRef, title }: ShareButtonProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    if (!elementRef.current) return;

    setIsSharing(true);
    try {
      const canvas = await html2canvas(elementRef.current, {
        backgroundColor: null, // Use element's background
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `cinemon-wrapped-${title.toLowerCase().replace(/\s/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: 'Error',
        description: 'Could not generate image for sharing.',
        variant: 'destructive',
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button onClick={handleShare} size="icon" variant="ghost" disabled={isSharing}>
      {isSharing ? <Loader2 className="animate-spin" /> : <Share2 />}
    </Button>
  );
};
