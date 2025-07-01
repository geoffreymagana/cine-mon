
'use client';

import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
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
import { EdgeToolbar } from '@/components/canvas/edge-toolbar';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';


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
  const [selectedEdges, setSelectedEdges] = React.useState<Edge[]>([]);

  // New state for edge label editing
  const [editingEdge, setEditingEdge] = useState<Edge | null>(null);
  const [currentLabel, setCurrentLabel] = useState('');
  
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

  const onTitleChange = useCallback((nodeId: string, title: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          node.data = { ...node.data, title };
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
       const newEdge = { 
           ...params, 
           type: 'smoothstep',
           style: { stroke: 'hsl(var(--foreground))', strokeWidth: 0.5 },
           markerEnd: { type: MarkerType.ArrowClosed },
           label: '',
           labelStyle: { fill: 'hsl(var(--foreground))', fontWeight: 500 },
           labelBgPadding: [8, 4] as [number, number],
           labelBgBorderRadius: 4,
           labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.95 },
        };
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
      type: 'custom',
      position: targetPosition,
      data: { 
        label: '',
        title: '',
        color: 'hsl(var(--card))',
        onLabelChange,
        onTitleChange,
        onColorChange,
      },
      width: 200,
      height: 150,
    };

    setNodes((nds) => nds.concat(newNode));
  }, [onLabelChange, onTitleChange, onColorChange, project, setNodes]);


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
  
  const onEdgeDoubleClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setEditingEdge(edge);
      setCurrentLabel(edge.label as string || '');
    },
    []
  );

  const handleSaveEdgeLabel = () => {
    if (!editingEdge) return;
    setEdges((eds) =>
      eds.map((e) => {
        if (e.id === editingEdge.id) {
          return { ...e, label: currentLabel };
        }
        return e;
      })
    );
    setEditingEdge(null);
    setCurrentLabel('');
  };

  const onEdgeColorChange = useCallback((color: string) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (selectedEdges.some(selected => selected.id === edge.id)) {
          return { ...edge, style: { ...edge.style, stroke: color } };
        }
        return edge;
      })
    );
  }, [selectedEdges, setEdges]);

  const onEdgeTypeChange = useCallback((type: 'smoothstep' | 'straight' | 'bezier') => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (selectedEdges.some(selected => selected.id === edge.id)) {
          return { ...edge, type };
        }
        return edge;
      })
    );
  }, [selectedEdges, setEdges]);

  const onSelectionChange = useCallback(({ nodes, edges: selEdges }: { nodes: Node[], edges: Edge[] }) => {
    setSelectedNodes(nodes);
    setSelectedEdges(selEdges);
  }, []);

  const [canUndo] = useState(false);
  const [canRedo] = useState(false);

  const edgesWithHighlight = edges.map(edge => {
      const isSelected = selectedEdges.some(se => se.id === edge.id);
      if (isSelected) {
          return {
              ...edge,
              style: {
                  ...edge.style,
                  strokeWidth: 2,
                  stroke: 'hsl(var(--primary))'
              },
              zIndex: 10,
          };
      }
      return { ...edge };
  });

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
        edges={edgesWithHighlight}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        onPaneContextMenu={handlePaneContextMenu}
        onEdgeDoubleClick={onEdgeDoubleClick}
        snapToGrid={isSnapToGrid}
        snapGrid={[20, 20]}
        nodesDraggable={!isReadOnly}
        nodesConnectable={!isReadOnly}
        elementsSelectable={!isReadOnly}
        onSelectionChange={onSelectionChange}
      >
        <Background variant="dot" gap={20} size={1} color="hsl(var(--border) / 0.5)" />
        <MiniMap />
      </ReactFlow>

      {contextMenu && (
        <CanvasContextMenu
          {...contextMenu}
          onClose={() => setContextMenu(null)}
          onAddCard={() => addNode('custom', contextMenu.panePosition)}
          isSnapToGrid={isSnapToGrid}
          setIsSnapToGrid={setIsSnapToGrid}
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

      {selectedEdges.length > 0 && selectedNodes.length === 0 && (
          <EdgeToolbar
              selectedEdges={selectedEdges}
              onEdgeColorChange={onEdgeColorChange}
              onEdgeTypeChange={onEdgeTypeChange}
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
      
      {/* Dialog for Editing Edge Labels */}
      <Dialog open={!!editingEdge} onOpenChange={(isOpen) => !isOpen && setEditingEdge(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Edge Label</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={currentLabel}
              onChange={(e) => setCurrentLabel(e.target.value)}
              onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSaveEdgeLabel();
                  }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEdge(null)}>Cancel</Button>
            <Button onClick={handleSaveEdgeLabel}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
