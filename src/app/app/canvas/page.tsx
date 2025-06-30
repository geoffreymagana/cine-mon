
'use client';

import React, { useCallback } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  type Connection,
  type Edge,
  type Node,
} from 'reactflow';

import 'reactflow/dist/style.css';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'The Matrix (1999)' },
    position: { x: 0, y: 50 },
    style: { background: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', border: '1px solid hsl(var(--primary))' },
  },
  {
    id: '2',
    data: { label: 'Ghost in the Shell (1995)' },
    position: { x: -250, y: 250 },
    style: { background: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', border: '1px solid hsl(var(--border))' },
  },
  {
    id: '3',
    data: { label: 'Neuromancer (1984)' },
    position: { x: 250, y: 250 },
     style: { background: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', border: '1px solid hsl(var(--border))' },
  },
  {
      id: '4',
      type: 'default',
      data: { label: 'A text note about cyberpunk themes, philosophy, and the nature of reality.' },
      position: { x: 0, y: 450 },
      style: { background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))', border: '1px dashed hsl(var(--border))', width: 300 },
  }
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', label: 'Inspired by' },
  { id: 'e1-3', source: '1', target: '3', label: 'Inspired by' },
  { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: 'hsl(var(--primary))' } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: 'hsl(var(--primary))' } },
];

export default function CanvasPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background variant="dots" gap={16} size={1} color="hsl(var(--border) / 0.5)" />
        <Controls />
      </ReactFlow>
    </div>
  );
}
