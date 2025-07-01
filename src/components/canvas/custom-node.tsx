'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeResizer, type NodeProps } from 'reactflow';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';


type CustomNodeData = {
  label: string;
  title: string;
  color?: string;
  onLabelChange: (id: string, label: string) => void;
  onTitleChange: (id: string, title: string) => void;
  onColorChange: (id: string, color: string) => void;
};

const CustomNode = ({ id, data, selected }: NodeProps<CustomNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [title, setTitle] = useState(data.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLabel(data.label);
  }, [data.label]);
  
  useEffect(() => {
    setTitle(data.title);
  }, [data.title]);
  
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.focus();
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [isEditing]);
  
  useEffect(() => {
    if (isTitleEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isTitleEditing]);
  
  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    data.onLabelChange(id, label);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLabel(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleTitleDoubleClick = () => {
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
    // Make the border color a more solid version of the background
    return color.replace(/(\/\s*)[\d.]+\)/, '$10.8)');
  };

  return (
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
        minHeight={80} 
        handleClassName="bg-primary rounded-sm w-2 h-2 hover:bg-primary/80"
        lineClassName="border-primary"
      />

      <div
        className="px-3 py-1.5 border-b-[3px]"
        style={{ borderColor: getBorderColor() }}
        onDoubleClick={handleTitleDoubleClick}
      >
        {isTitleEditing ? (
          <input
            ref={titleInputRef}
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => { if (e.key === 'Enter') handleTitleBlur(); }}
            className="w-full bg-transparent p-0 text-xs font-semibold text-card-foreground outline-none nodrag"
          />
        ) : (
          <h3 className="text-xs font-semibold break-words nodrag">
            {title || 'Untitled Card'}
          </h3>
        )}
      </div>

      <Handle type="target" position={Position.Left} id="target-left" className="!bg-blue-500 !w-1.5 !h-1.5" />
      <Handle type="target" position={Position.Top} id="target-top" className="!bg-blue-500 !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Right} id="source-right" className="!bg-green-500 !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Bottom} id="source-bottom" className="!bg-green-500 !w-1.5 !h-1.5" />

      <div className="w-full h-full overflow-y-auto p-3 pr-4" onDoubleClick={handleDoubleClick}>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={label}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Type here..."
            className="w-full min-h-[5em] border-none bg-transparent p-0 text-xs text-card-foreground outline-none nodrag"
            style={{ resize: 'none' }}
          />
        ) : (
          <div className={cn("prose-sm dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-headings:my-1", "w-full text-xs break-words")}>
             {label ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{label}</ReactMarkdown>
             ) : (
                <span className="text-muted-foreground opacity-50">Type here...</span>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomNode;
