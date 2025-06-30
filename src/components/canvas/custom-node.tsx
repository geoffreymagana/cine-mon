
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeResizer, NodeProps } from 'reactflow';

type CustomNodeData = {
  label: string;
  onLabelChange: (id: string, label: string) => void;
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
      
      // Move cursor to the end of the text
      const length = textarea.value.length;
      textarea.setSelectionRange(length, length);
      
      // Auto-resize textarea to fit content
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
      // Auto-resize textarea while typing
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${e.target.scrollHeight}px`;
    }
  };

  return (
    <div
      className="nodrag nopan nowheel rounded-md p-3 shadow-md bg-card text-card-foreground border-2 h-full flex items-center justify-center"
      onDoubleClick={handleDoubleClick}
      style={{ 
        borderColor: selected ? 'hsl(var(--primary))' : 'hsl(var(--border))',
      }}
    >
      <NodeResizer 
        isVisible={selected} 
        minWidth={150} 
        minHeight={40} 
        handleClassName="bg-primary rounded-sm w-2 h-2 hover:bg-primary/80"
        lineClassName="border-primary"
      />

      {/* Connection handles on all four sides */}
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <Handle type="source" position={Position.Right} className="!bg-primary" />
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
      <Handle type="target" position={Position.Left} className="!bg-primary" />

      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={label}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full border-none bg-transparent p-0 text-base text-card-foreground outline-none text-center"
          style={{ resize: 'none' }}
        />
      ) : (
        <div className="text-base text-card-foreground break-words whitespace-pre-wrap text-center">{label}</div>
      )}
    </div>
  );
};

export default CustomNode;
