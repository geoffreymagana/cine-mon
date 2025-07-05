
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeResizer, type NodeProps, useViewport } from 'reactflow';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRouter } from 'next/navigation';
import { FileImage, Globe, Link2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { Movie } from '@/lib/types';
import { MovieCard } from '../movie-card';

type CustomNodeData = {
  label: string;
  title: string;
  color?: string;
  onLabelChange: (id: string, label: string) => void;
  onTitleChange: (id: string, title: string) => void;
  onColorChange: (id: string, color: string) => void;
  nodeType?: 'movie' | 'standard' | 'web';
  movieData?: Movie;
  url?: string;
  onUrlChange?: (id: string, url: string) => void;
  isReadOnly?: boolean;
};


const CustomNode = ({ id, data, selected }: NodeProps<CustomNodeData>) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [title, setTitle] = useState(data.title);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const [isUrlEditing, setIsUrlEditing] = useState(!data.url);
  const [url, setUrl] = useState(data.url || '');
  const urlInputRef = useRef<HTMLInputElement>(null);
  
  const { zoom } = useViewport();
  const ZOOM_THRESHOLD = 0.5;

  const isMovieNode = data.nodeType === 'movie' && data.movieData;
  const isWebNode = data.nodeType === 'web';

  useEffect(() => {
    setLabel(data.label);
  }, [data.label]);
  
  useEffect(() => {
    setTitle(data.title);
  }, [data.title]);
  
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);
  
  useEffect(() => {
    if (isTitleEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isTitleEditing]);

  useEffect(() => {
    if (isUrlEditing && urlInputRef.current) {
      urlInputRef.current.focus();
      urlInputRef.current.select();
    }
  }, [isUrlEditing]);

  const handleUrlBlur = () => {
    setIsUrlEditing(false);
    if (data.onUrlChange) {
      data.onUrlChange(id, url);
    }
  };
  
  const handleUrlDoubleClick = () => {
    if (data.isReadOnly) return;
    setIsUrlEditing(true);
  }

  const getDomainFromUrl = (urlString: string | undefined): string => {
    if (!urlString) return '';
    try {
      const url = new URL(urlString);
      return url.hostname;
    } catch (e) {
      return '';
    }
  }
  
  const handleNodeDoubleClick = () => {
    if (data.isReadOnly) return;
    if (isMovieNode && data.movieData) {
        router.push(`/app/movie/${data.movieData.id}`);
    } else if (isWebNode && data.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer');
    } else if (isWebNode && !data.url) {
        setIsUrlEditing(true);
    } else {
        setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    data.onLabelChange(id, label);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLabel(e.target.value);
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    if (data.isReadOnly) return;
    e.stopPropagation();
    setIsTitleEditing(true);
  };

  const handleTitleBlur = () => {
    setIsTitleEditing(false);
    data.onTitleChange(id, title);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  
  const getBorderColor = () => {
    if (selected) {
      return 'hsl(var(--primary))';
    }
    const color = data.color;
    if (!color || color === 'hsl(var(--card))' || color === 'hsl(var(--muted))') {
      return 'hsl(var(--border))';
    }
    return color.replace(/(\/\s*)[\d.]+\)/, '$11)');
  };

  return (
    <div className="relative w-full h-full" onDoubleClick={handleNodeDoubleClick}>
      <div 
        className="absolute bottom-full left-0 mb-1 px-1 nodrag cursor-text"
        onClick={handleTitleClick}
      >
        {isTitleEditing ? (
          <input
            ref={titleInputRef}
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => { if (e.key === 'Enter') handleTitleBlur(); }}
            className="w-full bg-transparent p-0 text-3xs text-foreground outline-none capitalize"
            placeholder="Card title..."
          />
        ) : (
          <h3 className="text-3xs text-muted-foreground hover:text-foreground break-words capitalize">
            {title || `Card Title...`}
          </h3>
        )}
      </div>

      <div
        className="nopan nowheel rounded-lg shadow-md border-[3px] h-full flex flex-col"
        style={{ 
          borderColor: getBorderColor(),
          backgroundColor: data.color ? data.color.replace(/(\/\s*)[\d.]+\)/, '$10.8)') : 'hsl(var(--card))'
        }}
      >
        <NodeResizer 
          isVisible={selected && !data.isReadOnly} 
          minWidth={isMovieNode ? 120 : 150} 
          minHeight={isMovieNode ? 213 : 150}
          handleClassName="bg-primary rounded-sm w-3 h-3 hover:bg-primary/80"
          lineClassName="border-primary"
        />

        <Handle type="target" position={Position.Left} id="target-left" className="!bg-blue-500 !w-1.5 !h-8 !rounded-sm" />
        <Handle type="target" position={Position.Top} id="target-top" className="!bg-blue-500 !w-8 !h-1.5 !rounded-sm" />
        <Handle type="source" position={Position.Right} id="source-right" className="!bg-green-500 !w-1.5 !h-8 !rounded-sm" />
        <Handle type="source" position={Position.Bottom} id="source-bottom" className="!bg-green-500 !w-8 !h-1.5 !rounded-sm" />

        <div 
            className={cn(
                "w-full h-full overflow-hidden",
                isMovieNode && "p-0 rounded-lg"
            )} 
        >
          {isWebNode ? (
            <div className="w-full h-full flex flex-col text-left">
              {isUrlEditing ? (
                <div className="p-4 flex flex-col justify-center items-center h-full">
                    <Link2 className="w-8 h-8 text-muted-foreground mb-2" />
                    <h4 className="font-bold">Web Bookmark</h4>
                    <input
                        ref={urlInputRef}
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onBlur={handleUrlBlur}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleUrlBlur(); }}
                        placeholder="Paste a URL..."
                        className="mt-2 w-full bg-background/50 border border-input rounded-md p-2 text-xs text-center outline-none nodrag"
                    />
                </div>
              ) : (
                <div
                  className="block w-full h-full text-foreground no-underline"
                >
                    <div className="w-full h-2/3 bg-muted/50 flex items-center justify-center overflow-hidden">
                        <Globe className="w-1/3 h-1/3 text-muted-foreground/70" />
                    </div>
                    <div className="p-3" onDoubleClick={(e) => { e.stopPropagation(); handleUrlDoubleClick(); }}>
                        <p className="text-sm font-bold truncate">{data.title || data.url}</p>
                        <p className="text-xs text-muted-foreground truncate">{getDomainFromUrl(data.url)}</p>
                    </div>
                </div>
              )}
            </div>
          ) : isMovieNode ? (
            zoom < ZOOM_THRESHOLD ? (
                <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                    <FileImage className="w-1/3 h-1/3 text-muted-foreground/70" />
                </div>
            ) : (
                <div className="w-full h-full [&>div>div]:border-none [&>div>div]:shadow-none">
                    <MovieCard movie={data.movieData!} disableLink={true} />
                </div>
            )
          ) : isEditing ? (
            <textarea
              ref={textareaRef}
              value={label}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Type here..."
              className="w-full h-full border-none bg-transparent p-3 text-xs outline-none nodrag text-foreground"
              style={{ resize: 'none' }}
            />
          ) : (
            <div className={cn("prose-sm prose-p:my-1 prose-ul:my-1 prose-headings:my-1 w-full text-xs break-words p-3 text-foreground", zoom < ZOOM_THRESHOLD && 'prose-obfuscated')}>
              {label ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{label}</ReactMarkdown>
              ) : (
                  <span className="text-muted-foreground opacity-50">Double-click to edit...</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CustomNode);
