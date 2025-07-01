
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
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
  type OnNodeDrag,
  type DefaultEdgeOptions,
  type XYPosition,
} from 'reactflow';
import Link from 'next/link';
import { ArrowLeft, MoreVertical, Save, Image as ImageIcon, FileText } from 'lucide-react';
import { toPng } from 'html-to-image';

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import type { CanvasBoard, Movie } from '@/lib/types';
import { useParams, useRouter } from 'next/navigation';
import { ImportMovieDialog } from '@/components/canvas/import-movie-dialog';

import 'reactflow/dist/style.css';

const nodeTypes = {
  custom: CustomNode,
};

function downloadImage(dataUrl: string, fileName: string) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

const defaultEdgeOptions: DefaultEdgeOptions = {
  interactionWidth: 100,
};

// Helper function to calculate if a point intersects with a line segment
function distanceToLineSegment(
  point: XYPosition,
  lineStart: XYPosition,
  lineEnd: XYPosition
): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) return Math.sqrt(A * A + B * B);
  
  let param = dot / lenSq;
  param = Math.max(0, Math.min(1, param));
  
  const xx = lineStart.x + param * C;
  const yy = lineStart.y + param * D;
  
  const dx = point.x - xx;
  const dy = point.y - yy;
  
  return Math.sqrt(dx * dx + dy * dy);
}

function CanvasFlow() {
  const params = useParams();
  const canvasId = params.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [canvasName, setCanvasName] = useState('Untitled Canvas');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, getNodes, getEdges, flowToScreenPosition } = useReactFlow();

  // Edge intersection state
  const [intersectedEdgeId, setIntersectedEdgeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [contextMenu, setContextMenu] = useState<{
    top: number;
    left: number;
    panePosition: { x: number; y: number };
  } | null>(null);
  
  const [isSnapToGrid, setIsSnapToGrid] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [selectedNodes, setSelectedNodes] = React.useState<Node[]>([]);
  const [selectedEdges, setSelectedEdges] = React.useState<Edge[]>([]);

  const [editingEdge, setEditingEdge] = useState<Edge | null>(null);
  const [currentLabel, setCurrentLabel] = useState('');
  
  const [isImportMovieOpen, setIsImportMovieOpen] = React.useState(false);
  const [allMovies, setAllMovies] = React.useState<Movie[]>([]);

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
          node.data = { ...node.data, color };
        }
        return node;
      })
    );
  }, [setNodes]);

  useEffect(() => {
    if (!canvasId) return;
    try {
        const storedCanvases = localStorage.getItem('canvases');
        const canvases: CanvasBoard[] = storedCanvases ? JSON.parse(storedCanvases) : [];
        const currentCanvas = canvases.find(c => c.id === canvasId);

        if (currentCanvas) {
            setCanvasName(currentCanvas.name);
            const loadedNodes = (currentCanvas.nodes || []).map(node => ({
                ...node,
                data: {
                    ...node.data,
                    onLabelChange,
                    onTitleChange,
                    onColorChange,
                },
            }));
            setNodes(loadedNodes);
            setEdges(currentCanvas.edges || []);
        } else {
            toast({ title: "Canvas not found", variant: "destructive" });
            router.push('/app/canvas');
        }
        
        const storedMovies = localStorage.getItem('movies');
        if (storedMovies) {
            setAllMovies(JSON.parse(storedMovies));
        }
    } catch (error) {
        console.error("Failed to load canvas:", error);
        toast({ title: "Error loading canvas", variant: "destructive" });
        router.push('/app/canvas');
    }
  }, [canvasId, router, setNodes, setEdges, toast, onLabelChange, onTitleChange, onColorChange]);
  
  const handleSave = useCallback(() => {
    if (!canvasId) return;

    try {
        const storedCanvases = localStorage.getItem('canvases');
        const canvases: CanvasBoard[] = storedCanvases ? JSON.parse(storedCanvases) : [];
        const updatedCanvases = canvases.map(c => 
            c.id === canvasId 
            ? { ...c, name: canvasName, nodes, edges, lastModified: new Date().toISOString() } 
            : c
        );
        localStorage.setItem('canvases', JSON.stringify(updatedCanvases));
        toast({ title: "Canvas Saved!", description: `"${canvasName}" has been saved.` });
    } catch (error) {
        console.error("Failed to save canvas:", error);
        toast({ title: "Error saving canvas", variant: "destructive" });
    }
  }, [canvasId, canvasName, nodes, edges, toast]);

  const handleSaveAsImage = useCallback(() => {
    if (reactFlowWrapper.current) {
        toPng(reactFlowWrapper.current, { cacheBust: true, pixelRatio: 2 })
            .then((dataUrl) => {
                downloadImage(dataUrl, `${canvasName.replace(/\s+/g, '-').toLowerCase()}.png`);
            })
            .catch((err) => {
                console.error(err);
                toast({ title: "Error exporting image", description: "Could not save canvas as an image.", variant: "destructive" });
            });
    }
  }, [canvasName, toast]);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
       const newEdge = { 
           ...params, 
           type: 'smoothstep',
           style: { stroke: 'hsl(var(--foreground))', strokeWidth: 0.5 },
           markerEnd: { type: MarkerType.ArrowClosed },
           label: '',
           labelStyle: { fill: 'hsl(var(--foreground))', fontWeight: 500, fontSize: '0.5rem' },
           labelBgPadding: [8, 4] as [number, number],
           labelBgBorderRadius: 4,
           labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.95 },
        };
       setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );
  
  const addNode = useCallback((type: string, position?: {x: number, y: number}) => {
    const targetPosition = position ?? screenToFlowPosition({
        x: reactFlowWrapper.current!.getBoundingClientRect().left + reactFlowWrapper.current!.clientWidth / 2,
        y: reactFlowWrapper.current!.getBoundingClientRect().top + reactFlowWrapper.current!.clientHeight / 2,
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
        nodeType: 'standard',
      },
      width: 200,
      height: 150,
    };

    setNodes((nds) => nds.concat(newNode));
  }, [onLabelChange, onTitleChange, onColorChange, screenToFlowPosition, setNodes]);

  const addMovieNode = useCallback((movie: Movie) => {
    const reactFlowBounds = reactFlowWrapper.current!.getBoundingClientRect();
    const position = screenToFlowPosition({
        x: reactFlowBounds.left + reactFlowWrapper.current!.clientWidth / 2,
        y: reactFlowBounds.top + reactFlowWrapper.current!.clientHeight / 2,
    });

    const newNode: Node = {
      id: `node-${crypto.randomUUID()}`,
      type: 'custom',
      position,
      data: { 
        title: movie.title,
        label: '',
        color: 'hsl(var(--card))',
        onLabelChange,
        onTitleChange,
        onColorChange,
        nodeType: 'movie',
        movieData: movie
      },
      width: 180,
      height: 320,
    };
    setNodes((nds) => nds.concat(newNode));
  }, [screenToFlowPosition, setNodes, onLabelChange, onTitleChange, onColorChange]);

  const handlePaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current) return;
      
      const panePosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setContextMenu({
        top: event.clientY,
        left: event.clientX,
        panePosition,
      });
    },
    [screenToFlowPosition]
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

  const onEdgeTypeChange = useCallback((type: 'default' | 'smoothstep' | 'straight') => {
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

  // Function to find intersected edge based on node position
  const findIntersectedEdge = useCallback((nodeId: string, nodePosition: XYPosition): string | null => {
    const allNodes = getNodes();
    const allEdges = getEdges();
    
    // Get the dragging node
    const draggingNode = allNodes.find(n => n.id === nodeId);
    if (!draggingNode) return null;
    
    const nodeCenter = {
      x: nodePosition.x + (draggingNode.width || 200) / 2,
      y: nodePosition.y + (draggingNode.height || 150) / 2
    };
    
    // Check each edge for intersection
    for (const edge of allEdges) {
      if (edge.source === nodeId || edge.target === nodeId) continue; // Skip edges connected to this node
      
      const sourceNode = allNodes.find(n => n.id === edge.source);
      const targetNode = allNodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) continue;
      
      const sourceCenter = {
        x: sourceNode.position.x + (sourceNode.width || 200) / 2,
        y: sourceNode.position.y + (sourceNode.height || 150) / 2
      };
      
      const targetCenter = {
        x: targetNode.position.x + (targetNode.width || 200) / 2,
        y: targetNode.position.y + (targetNode.height || 150) / 2
      };
      
      // Check if node center is close to the edge line
      const distance = distanceToLineSegment(nodeCenter, sourceCenter, targetCenter);
      
      // If distance is small enough, consider it an intersection
      if (distance < 30) { // 30px threshold
        return edge.id;
      }
    }
    
    return null;
  }, [getNodes, getEdges]);

  // Enhanced edges with intersection highlighting
  const edgesWithHighlight = edges.map(edge => {
    const isSelected = selectedEdges.some(se => se.id === edge.id);
    const isIntersected = intersectedEdgeId === edge.id;
    
    let strokeWidth = 0.5;
    let stroke = edge.style?.stroke || 'hsl(var(--foreground))';
    let zIndex = 1;
    
    if (isIntersected) {
      strokeWidth = 3;
      stroke = 'hsl(var(--primary))';
      zIndex = 10;
    } else if (isSelected) {
      strokeWidth = 2;
      zIndex = 5;
    }
    
    return {
      ...edge,
      style: {
        ...edge.style,
        strokeWidth,
        stroke,
      },
      zIndex,
    };
  });

  const onNodeDrag: OnNodeDrag = useCallback(
    (event, node) => {
      if (!isDragging) {
        setIsDragging(true);
      }
      
      const intersectedEdge = findIntersectedEdge(node.id, node.position);
      setIntersectedEdgeId(intersectedEdge);
    },
    [isDragging, findIntersectedEdge]
  );

  const onNodeDragStop: OnNodeDrag = useCallback(
    (event, node) => {
      setIsDragging(false);
      
      if (intersectedEdgeId) {
        const intersectedEdge = edges.find(e => e.id === intersectedEdgeId);
        
        if (intersectedEdge) {
          // Create two new edges: source -> node and node -> target
          const firstEdgeId = `${intersectedEdge.source}->${node.id}`;
          const secondEdgeId = `${node.id}->${intersectedEdge.target}`;
          
          // Remove the original edge and add two new ones
          setEdges((eds) => {
            const newEdges = eds.filter(e => e.id !== intersectedEdgeId);
            
            const firstEdge: Edge = {
              ...intersectedEdge,
              id: firstEdgeId,
              source: intersectedEdge.source,
              target: node.id,
            };
            
            const secondEdge: Edge = {
              ...intersectedEdge,
              id: secondEdgeId,
              source: node.id,
              target: intersectedEdge.target,
            };
            
            return [...newEdges, firstEdge, secondEdge];
          });
        }
      }
      
      // Clear intersection state
      setIntersectedEdgeId(null);
    },
    [intersectedEdgeId, edges, setEdges]
  );

  return (
    <div 
      ref={reactFlowWrapper} 
      style={{ height: '100vh', width: '100vw' }} 
      className="bg-background"
      onClick={() => setContextMenu(null)}
    >
      <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
        <Link href="/app/canvas" passHref>
          <Button variant="outline" size="icon" aria-label="Back to Canvases">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <Input 
          value={canvasName}
          onChange={(e) => setCanvasName(e.target.value)}
          className="text-lg font-bold w-96 bg-background/50 capitalize"
          placeholder="Untitled Canvas"
        />
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/>Save</Button>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon"><MoreVertical className="h-4 w-4"/></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSaveAsImage}>
                    <ImageIcon className="mr-2 h-4 w-4"/>
                    Save as Image
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                    <FileText className="mr-2 h-4 w-4"/>
                    Save as PDF (soon)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
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
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        defaultEdgeOptions={defaultEdgeOptions}
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

      <NodeCreator onAddNode={() => addNode('custom')} onAddMovieClick={() => setIsImportMovieOpen(true)} />
      
      <CanvasHelpDialog isOpen={isHelpOpen} setIsOpen={setIsHelpOpen} />
      
      <ImportMovieDialog
        isOpen={isImportMovieOpen}
        setIsOpen={setIsImportMovieOpen}
        movies={allMovies}
        onImport={addMovieNode}
      />

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
              className="capitalize"
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

export default function CanvasEditorPage() {
  return (
    <ReactFlowProvider>
      <CanvasFlow />
    </ReactFlowProvider>
  );
}
