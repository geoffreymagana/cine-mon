
'use client';

import React, { useCallback, useMemo } from 'react';
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
import CustomNode from '@/components/canvas/custom-node';

import 'reactflow/dist/style.css';


const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', label: 'Inspired by' },
  { id: 'e1-3', source: '1', target: '3', label: 'Inspired by' },
  { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: 'hsl(var(--primary))' } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: 'hsl(var(--primary))' } },
];

const nodeTypes = {
  custom: CustomNode,
};

export default function CanvasPage() {
  const onNodeLabelChange = useCallback((nodeId: string, label: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          // It's important to create a new object here to trigger a re-render
          node.data = { ...node.data, label };
        }
        return node;
      })
    );
  }, []);

  const initialNodes = useMemo<Node<any>[]>(() => [
    {
      id: '1',
      type: 'custom',
      data: { label: 'The Matrix (1999)', onLabelChange: onNodeLabelChange },
      position: { x: 0, y: 50 },
    },
    {
      id: '2',
      type: 'custom',
      data: { label: 'Ghost in the Shell (1995)', onLabelChange: onNodeLabelChange },
      position: { x: -250, y: 250 },
    },
    {
      id: '3',
      type: 'custom',
      data: { label: 'Neuromancer (1984)', onLabelChange: onNodeLabelChange },
      position: { x: 250, y: 250 },
    },
    {
        id: '4',
        type: 'custom',
        data: { label: 'A text note about cyberpunk themes, philosophy, and the nature of reality.', onLabelChange: onNodeLabelChange },
        position: { x: 0, y: 450 },
        style: { width: 300, height: 120 },
    }
  ], [onNodeLabelChange]);
  
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
        nodeTypes={nodeTypes}
        fitView
      >
        <Background variant="dots" gap={16} size={1} color="hsl(var(--border) / 0.5)" />
        <Controls />
      </ReactFlow>
    </div>
  );
}
