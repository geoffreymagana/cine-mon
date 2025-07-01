
import { type Node, type Edge, Position } from 'reactflow';
import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 180;
const nodeHeight = 320; // A reasonable default, especially for movie cards

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: node.width || nodeWidth, height: node.height || nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    // Dagre positions nodes from their center, while React Flow positions from the top-left.
    // We need to adjust for this.
    const newPosition = {
      x: nodeWithPosition.x - (node.width || nodeWidth) / 2,
      y: nodeWithPosition.y - (node.height || nodeHeight) / 2,
    };

    return {
      ...node,
      position: newPosition,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
    };
  });

  // Explicitly map over the edges to create new objects.
  // This ensures all properties, including the 'type', are preserved and passed to React Flow correctly,
  // preventing it from falling back to its own default edge type ('smoothstep') after the layout change.
  const layoutedEdges = edges.map(edge => ({ ...edge }));

  return { nodes: layoutedNodes, edges: layoutedEdges };
};
