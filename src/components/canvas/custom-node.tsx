
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeResizer, type NodeProps } from 'reactflow';

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
    // Assumes color is an HSL string with an opacity value we can replace
    if (color.includes('/')) {
        return color.replace(/(\/\s*)[\d.]+\)/, '$10.6)');
    }
    return color; // Fallback for solid colors
  };

  return (
    <div
      className="nopan nowheel rounded-lg p-3 shadow-md border-2 h-full flex flex-col justify-center overflow-hidden"
      style={{ 
        borderColor: getBorderColor(),
        backgroundColor: data.color || 'hsl(var(--card))'
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

      {/* Target handles - for incoming connections */}
      <Handle 
        type="target" 
        position={Position.Left} 
        id="target-left" 
        className="!bg-blue-500 !w-1.5 !h-1.5" 
      />
      <Handle 
        type="target" 
        position={Position.Top} 
        id="target-top" 
        className="!bg-blue-500 !w-1.5 !h-1.5" 
      />
      
      {/* Source handles - for outgoing connections */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="source-right" 
        className="!bg-green-500 !w-1.5 !h-1.5" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="source-bottom" 
        className="!bg-green-500 !w-1.5 !h-1.5" 
      />

      <div className="w-full h-full overflow-y-auto text-card-foreground text-center break-all p-1 pr-2">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={label}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="New Card"
            className="w-full h-full min-h-[20px] border-none bg-transparent p-0 text-[10px] text-card-foreground outline-none text-center nodrag"
            style={{ resize: 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px]">
            <span>{label || <span className="text-muted-foreground opacity-50">New Card</span>}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomNode;
