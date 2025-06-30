
'use client';

import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Connection,
  type Edge,
  type Node,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
} from 'reactflow';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CustomNode from '@/components/canvas/custom-node';
import { CanvasToolbar } from '@/components/canvas/canvas-toolbar';
import { CanvasHelpDialog } from '@/components/canvas/canvas-help-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CanvasContextMenu } from '@/components/canvas/canvas-context-menu';
import { NodeCreator } from '@/components/canvas/node-creator';
import { ColorPickerToolbar } from '@/components/canvas/color-picker-toolbar';


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

  const [contextMenu, setContextMenu] = useState<{
    top: number;
    left: number;
    panePosition: { x: number; y: number };
  } | null>(null);
  
  const [isSnapToGrid, setIsSnapToGrid] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [selectedNodes, setSelectedNodes] = React.useState<Node[]>([]);
  
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

  const onColorChange = useCallback((nodeId: string, color: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          // Create a new data object to ensure React detects the change
          node.data = { ...node.data, color };
        }
        return node;
      })
    );
  }, [setNodes]);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
       const newEdge = { ...params, markerEnd: { type: MarkerType.ArrowClosed } };
       setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );
  
  const addNode = useCallback((type: string, position?: {x: number, y: number}) => {
    const targetPosition = position ?? project({
        x: reactFlowWrapper.current!.clientWidth / 2,
        y: reactFlowWrapper.current!.clientHeight / 2,
    });

    const newNode: Node = {
      id: `node-${crypto.randomUUID()}`,
      type: type,
      position: targetPosition,
      data: { 
        label: '', 
        color: 'hsl(var(--card))',
        onLabelChange,
        onColorChange,
      },
      width: 200,
      height: 80,
    };

    setNodes((nds) => nds.concat(newNode));
  }, [onLabelChange, onColorChange, project, setNodes]);


  const handlePaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current) return;
      
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const panePosition = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      setContextMenu({
        top: event.clientY,
        left: event.clientX,
        panePosition,
      });
    },
    [project]
  );

  const onSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
    setSelectedNodes(nodes);
  }, []);

  const [canUndo] = useState(false);
  const [canRedo] = useState(false);

  return (
    <div 
      ref={reactFlowWrapper} 
      style={{ height: '100vh', width: '100vw' }} 
      className="bg-background"
      onClick={() => setContextMenu(null)}
    >
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
        onPaneContextMenu={handlePaneContextMenu}
        snapToGrid={isSnapToGrid}
        snapToGrid={[20, 20]}
        nodesDraggable={!isReadOnly}
        nodesConnectable={!isReadOnly}
        elementsSelectable={!isReadOnly}
        onSelectionChange={onSelectionChange}
      >
        <Background variant="dot" gap={20} size={1} color="hsl(var(--border) / 0.5)" />
        <MiniMap />
        <Controls />
      </ReactFlow>

      {contextMenu && (
        <CanvasContextMenu
          {...contextMenu}
          onClose={() => setContextMenu(null)}
          onAddCard={() => addNode('custom', contextMenu.panePosition)}
          isSnapToGrid={isSnapToGrid}
          setIsSnapToGrid={setIsSnapToGrid}
          isSnapToObjects={false}
          setIsSnapToObjects={() => {}}
          isReadOnly={isReadOnly}
          setIsReadOnly={setIsReadOnly}
          canUndo={canUndo}
        />
      )}

      {selectedNodes.length > 0 && (
        <ColorPickerToolbar
          node={selectedNodes[0]}
          onColorChange={(color) => {
            selectedNodes.forEach(node => onColorChange(node.id, color));
          }}
        />
      )}

      <CanvasToolbar 
        onUndo={() => {}}
        onRedo={() => {}}
        canUndo={canUndo}
        canRedo={canRedo}
        onShowHelp={() => setIsHelpOpen(true)}
      />

      <NodeCreator onAddNode={() => addNode('custom')} />
      
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
