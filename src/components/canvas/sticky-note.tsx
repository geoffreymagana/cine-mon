'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NodeResizer, type NodeProps, Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';

type StickyNodeData = {
  text: string;
  onChange: (id: string, text: string) => void;
  onColorChange: (id: string, color: string) => void;
  color?: string;
  nodeType: 'sticky';
};

const StickyNode = ({ id, data, selected }: NodeProps<StickyNodeData>) => {
  const [text, setText] = useState(data.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(data.text || '');
  }, [data.text]);

  const handleBlur = () => {
    data.onChange(id, text);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };
  
  const [foldColor, setFoldColor] = useState('hsl(var(--card))');
  
  useEffect(() => {
      // This ensures we only access `document` on the client side.
      const isDark = document.documentElement.classList.contains('dark');
      setFoldColor(isDark ? 'hsl(var(--background))' : 'hsl(var(--card))');
  }, []);

  return (
    <div 
        className={cn("sticky-note w-full h-full rounded-sm", selected && "resizing", !data.color && 'text-black')} 
        style={{ backgroundColor: data.color }}
    >
        <NodeResizer
            isVisible={selected}
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
        <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Write something..."
            className="w-full h-full border-none bg-transparent outline-none nodrag p-4 text-lg leading-snug"
            style={{ resize: 'none', fontFamily: `'Kalam', cursive`, color: data.color ? '#333' : undefined }}
        />
    </div>
  );
};

export default React.memo(StickyNode);
