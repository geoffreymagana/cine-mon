
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeResizer, type NodeProps } from 'reactflow';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type CustomNodeData = {
  label: string;
  color?: string;
  onLabelChange: (id: string, label: string) => void;
  onColorChange: (id: string, color: string) => void;
};

const CustomNode = ({ id, data, selected }: NodeProps<CustomNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLabel(data.label);
  }, [data.label]);
  
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.focus();
      
      const length = textarea.value.length;
      textarea.setSelectionRange(length, length);
      
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [isEditing]);
  
  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    data.onLabelChange(id, label);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLabel(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${e.target.scrollHeight}px`;
    }
  };

  const getBorderColor = () => {
    if (selected) {
      return 'hsl(var(--primary))';
    }
    const color = data.color;
    if (!color || color === 'hsl(var(--card))' || color === 'hsl(var(--muted))') {
      return 'hsl(var(--border))';
    }
    if (color.includes('/')) {
        return color.replace(/(\/\s*)[\d.]+\)/, '$10.8)');
    }
    return color;
  };

  return (
    <div
      className="nopan nowheel rounded-lg p-3 shadow-md border-2 h-full flex flex-col"
      style={{ 
        borderColor: getBorderColor(),
        backgroundColor: data.color ? data.color.replace(/(\/\s*)[\d.]+\)/, '$10.5)') : 'hsl(var(--card))'
      }}
      onDoubleClick={handleDoubleClick}
    >
      <NodeResizer 
        isVisible={selected} 
        minWidth={150} 
        minHeight={40} 
        handleClassName="bg-primary rounded-sm w-2 h-2 hover:bg-primary/80"
        lineClassName="border-primary"
      />

      <Handle type="target" position={Position.Left} id="target-left" className="!bg-blue-500 !w-1.5 !h-1.5" />
      <Handle type="target" position={Position.Top} id="target-top" className="!bg-blue-500 !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Right} id="source-right" className="!bg-green-500 !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Bottom} id="source-bottom" className="!bg-green-500 !w-1.5 !h-1.5" />

      <div className="w-full h-full overflow-y-auto text-card-foreground p-1 pr-2 break-words">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={label}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Start typing..."
            className="w-full h-full min-h-[20px] border-none bg-transparent p-0 text-xs text-card-foreground outline-none nodrag"
            style={{ resize: 'none' }}
          />
        ) : (
          <div className="w-full h-full text-xs prose-sm prose-p:my-1 prose-ul:my-1 prose-headings:my-1 dark:prose-invert">
             {label ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{label}</ReactMarkdown>
             ) : (
                <span className="text-muted-foreground opacity-50">Double-click to edit...</span>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomNode;
