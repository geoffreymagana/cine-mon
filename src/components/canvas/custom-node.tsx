
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeResizer, type NodeProps } from 'reactflow';

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

  return (
    <div
      className="nodrag nopan nowheel rounded-sm p-3 shadow-md bg-card text-card-foreground border-2 h-full flex items-center justify-center"
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

      {/* Target handles (top, left) and Source handles (bottom, right) */}
      <Handle type="target" position={Position.Top} id="target-top" className="!bg-blue-500 !w-2 !h-2" />
      <Handle type="source" position={Position.Top} id="source-top" className="!bg-green-500 !w-2 !h-2" />
      
      <Handle type="target" position={Position.Right} id="target-right" className="!bg-blue-500 !w-2 !h-2" />
      <Handle type="source" position={Position.Right} id="source-right" className="!bg-green-500 !w-2 !h-2" />

      <Handle type="target" position={Position.Bottom} id="target-bottom" className="!bg-blue-500 !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} id="source-bottom" className="!bg-green-500 !w-2 !h-2" />

      <Handle type="target" position={Position.Left} id="target-left" className="!bg-blue-500 !w-2 !h-2" />
      <Handle type="source" position={Position.Left} id="source-left" className="!bg-green-500 !w-2 !h-2" />

      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={label}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="New Card"
          className="w-full border-none bg-transparent p-0 text-[10px] text-card-foreground outline-none text-center nodrag"
          style={{ resize: 'none' }}
        />
      ) : (
        <div className="text-[10px] text-card-foreground text-center break-all line-clamp-3">
            {label || <span className="text-muted-foreground">New Card</span>}
        </div>
      )}
    </div>
  );
};

export default CustomNode;
