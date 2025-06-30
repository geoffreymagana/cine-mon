
'use client';

import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  type Connection,
  type Edge,
  type Node,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CustomNode from '@/components/canvas/custom-node';
import { CanvasToolbar } from '@/components/canvas/canvas-toolbar';
import { CanvasHelpDialog } from '@/components/canvas/canvas-help-dialog';
import { NodeCreator } from '@/components/canvas/node-creator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import 'reactflow/dist/style.css';


const nodeTypes = {
  custom: CustomNode,
};

function CanvasFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [canvasName, setCanvasName] = useState('My Cinematic Universe');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  
  const onLabelChange = useCallback((nodeId: string, label: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          node.data = { ...node.data, label };
        }
        return node;
      })
    );
  }, [setNodes]);
  
  const addNode = useCallback((type: string) => {
    if (!reactFlowWrapper.current) return;

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = project({
      x: reactFlowBounds.width / 2,
      y: reactFlowBounds.height / 2,
    });

    const newNode = {
      id: `node-${crypto.randomUUID()}`,
      type: type,
      position,
      data: { label: 'New Card', onLabelChange },
    };

    setNodes((nds) => nds.concat(newNode));
  }, [project, onLabelChange, setNodes]);


  // Dummy undo/redo state for now. A full implementation is a future step.
  const [canUndo] = useState(false);
  const [canRedo] = useState(false);

  return (
    <div ref={reactFlowWrapper} style={{ height: '100vh', width: '100vw' }} className="bg-background">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
        <Link href="/app/dashboard" passHref>
          <Button variant="outline" size="icon" aria-label="Back to Dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <Input 
          value={canvasName}
          onChange={(e) => setCanvasName(e.target.value)}
          className="text-lg font-bold w-96 bg-background/50"
          placeholder="Untitled Canvas"
        />
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background variant="dots" gap={16} size={1} color="hsl(var(--border) / 0.5)" />
      </ReactFlow>

      <CanvasToolbar 
        onUndo={() => {}}
        onRedo={() => {}}
        canUndo={canUndo}
        canRedo={canRedo}
        onShowHelp={() => setIsHelpOpen(true)}
      />

      <NodeCreator onAddNode={addNode} />

      <CanvasHelpDialog isOpen={isHelpOpen} setIsOpen={setIsHelpOpen} />
    </div>
  );
}


export default function CanvasPage() {
  return (
    <ReactFlowProvider>
      <CanvasFlow />
    </ReactFlowProvider>
  );
}
