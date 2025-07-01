
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Handle, Position, NodeResizer, type NodeProps } from 'reactflow';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Clock, CircleCheck, PauseCircle, CircleOff, Bookmark } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { Movie } from '@/lib/types';
import { RatingCircle } from '../rating-circle';

type MovieNodeData = {
    id: string;
    posterUrl: string;
    rating: number;
    status: Movie['status'];
    releaseDate: string;
}

type CustomNodeData = {
  label: string;
  title: string;
  color?: string;
  onLabelChange: (id: string, label: string) => void;
  onTitleChange: (id: string, title: string) => void;
  onColorChange: (id: string, color: string) => void;
  nodeType?: 'movie' | 'standard';
  movieData?: MovieNodeData;
};

const statusMap: Record<Movie['status'], { icon: React.ElementType, className: string, label: string }> = {
    'Watching': { icon: Clock, className: 'text-chart-1', label: 'Watching' },
    'Completed': { icon: CircleCheck, className: 'text-chart-2', label: 'Completed' },
    'On-Hold': { icon: PauseCircle, className: 'text-chart-3', label: 'On Hold' },
    'Dropped': { icon: CircleOff, className: 'text-destructive', label: 'Dropped' },
    'Plan to Watch': { icon: Bookmark, className: 'text-muted-foreground', label: 'Plan to Watch' },
};


const CustomNode = ({ id, data, selected }: NodeProps<CustomNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [title, setTitle] = useState(data.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const isMovieNode = data.nodeType === 'movie' && data.movieData;
  const statusInfo = isMovieNode ? statusMap[data.movieData.status] : null;

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
  
  const handleContentDoubleClick = () => {
    if (isMovieNode) return;
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    data.onLabelChange(id, label);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLabel(e.target.value);
  };

  const handleTitleClick = (e: React.MouseEvent) => {
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
    <div className="relative w-full h-full">
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
          isVisible={selected} 
          minWidth={150} 
          minHeight={isMovieNode ? 270 : 150}
          handleClassName="bg-primary rounded-sm w-3 h-3 hover:bg-primary/80"
          lineClassName="border-primary"
        />

        <Handle type="target" position={Position.Left} id="target-left" className="!bg-blue-500 !w-1.5 !h-8 !rounded-sm" />
        <Handle type="target" position={Position.Top} id="target-top" className="!bg-blue-500 !w-8 !h-1.5 !rounded-sm" />
        <Handle type="source" position={Position.Right} id="source-right" className="!bg-green-500 !w-1.5 !h-8 !rounded-sm" />
        <Handle type="source" position={Position.Bottom} id="source-bottom" className="!bg-green-500 !w-8 !h-1.5 !rounded-sm" />

        <div className="w-full h-full overflow-hidden" onDoubleClick={handleContentDoubleClick}>
          {isMovieNode ? (
             <Link href={`/app/movie/${data.movieData.id}`} className="block relative w-full h-full group/moviecard" target="_blank">
                <Image 
                    src={data.movieData.posterUrl} 
                    alt={`Poster for ${data.title}`} 
                    layout="fill" 
                    objectFit="cover" 
                    className="transition-transform duration-300 group-hover/moviecard:scale-105"
                    data-ai-hint="movie poster"
                />

                {statusInfo && (
                    <div className="absolute top-2 left-2 z-10 h-8 w-8 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center">
                        <statusInfo.icon className={cn("h-4 w-4", statusInfo.className)} />
                    </div>
                )}
                
                <div className="absolute -bottom-5 right-2 z-10">
                  <RatingCircle percentage={data.movieData.rating} />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-sm font-bold truncate">{data.movieData.releaseDate?.substring(0,4)}</p>
                </div>
             </Link>
          ) : isEditing ? (
            <textarea
              ref={textareaRef}
              value={label}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Type here..."
              className="w-full h-full border-none bg-transparent p-3 text-xs text-card-foreground outline-none nodrag"
              style={{ resize: 'none' }}
            />
          ) : (
            <div className={cn("prose-sm dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-headings:my-1", "w-full text-xs break-words p-3")}>
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
