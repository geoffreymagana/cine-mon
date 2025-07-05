
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NodeResizer, type NodeProps, Handle, Position, useViewport } from 'reactflow';
import { cn } from '@/lib/utils';

type StickyNodeData = {
  text: string;
  onChange: (id: string, text: string) => void;
  onColorChange: (id: string, color: string) => void;
  color?: string;
  nodeType: 'sticky';
  isReadOnly?: boolean;
};

const StickyNode = ({ id, data, selected }: NodeProps<StickyNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [foldColor, setFoldColor] = useState('hsl(var(--card))');
  
  const { zoom } = useViewport();
  const ZOOM_THRESHOLD = 0.5;

  useEffect(() => {
    setText(data.text || '');
  }, [data.text]);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setFoldColor(isDark ? 'hsl(var(--background))' : 'hsl(var(--card))');
  }, []);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (data.isReadOnly) return;
    setIsEditing(true)
  };

  const handleBlur = () => {
    setIsEditing(false);
    data.onChange(id, text);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  return (
    <div 
        className={cn("sticky-note w-full h-full rounded-sm text-foreground", selected && "resizing")} 
        style={{ backgroundColor: data.color }}
        onDoubleClick={handleDoubleClick}
    >
        <NodeResizer
            isVisible={selected && !data.isReadOnly}
            minWidth={100}
            minHeight={100}
            lineClassName="resize-handle-line"
            handleClassName="bg-primary rounded-full w-2 h-2 opacity-75"
        />
        <div className="sticky-note-fold" style={{borderColor: `transparent ${foldColor} transparent transparent`}}/>
        <Handle type="target" position={Position.Left} id="target-left" className="!bg-primary/50 !w-1.5 !h-8 !rounded-sm !border-0" />
        <Handle type="target" position={Position.Top} id="target-top" className="!bg-primary/50 !w-8 !h-1.5 !rounded-sm !border-0" />
        <Handle type="source" position={Position.Right} id="source-right" className="!bg-primary/50 !w-1.5 !h-8 !rounded-sm !border-0" />
        <Handle type="source" position={Position.Bottom} id="source-bottom" className="!bg-primary/50 !w-8 !h-1.5 !rounded-sm !border-0" />
        
        {isEditing ? (
            <textarea
                ref={textareaRef}
                value={text}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Write something..."
                className="font-handwriting w-full h-full border-none bg-transparent outline-none nodrag p-4 text-lg leading-snug"
                style={{ resize: 'none' }}
            />
        ) : (
            <div className={cn("font-handwriting w-full h-full p-4 text-lg leading-snug break-words", zoom < ZOOM_THRESHOLD && 'sticky-note-text-obfuscated')}>
                {text || <span className="opacity-50">Write something...</span>}
            </div>
        )}
    </div>
  );
};

export default React.memo(StickyNode);
