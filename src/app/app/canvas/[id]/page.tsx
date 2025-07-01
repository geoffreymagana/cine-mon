'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  type OnNodeDrag,
  type DefaultEdgeOptions,
  type XYPosition,
} from 'reactflow';
import Link from 'next/link';
import { ArrowLeft, MoreVertical, Save, Image as ImageIcon, Command } from 'lucide-react';
import { toPng } from 'html-to-image';

import CustomNode from '@/components/canvas/custom-node';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import type { Movie } from '@/lib/types';
import { useParams, useRouter } from 'next/navigation';
import { ImportMovieDialog } from '@/components/canvas/import-movie-dialog';
import { CommandPalette } from '@/components/canvas/command-palette';
import { MovieService } from '@/lib/movie-service';
import { CanvasToolbar } from '@/components/canvas/canvas-toolbar';
import { NodeCreator } from '@/components/canvas/node-creator';
import { CanvasContextMenu } from '@/components/canvas/canvas-context-menu';
import { CanvasHelpDialog } from '@/components/canvas/canvas-help-dialog';


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
  style: { strokeWidth: 2 }
};

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
  const dy = point.y - dy;
  
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
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, getNodes, getEdges, setViewport } = useReactFlow();

  const [intersectedEdgeId, setIntersectedEdgeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [selectedNodes, setSelectedNodes] = React.useState<Node[]>([]);
  const [selectedEdges, setSelectedEdges] = React.useState<Edge[]>([]);

  const [editingEdge, setEditingEdge] = useState<Edge | null>(null);
  const [currentLabel, setCurrentLabel] = useState('');
  
  const [isImportMovieOpen, setIsImportMovieOpen] = React.useState(false);
  const [allMovies, setAllMovies] = React.useState<Movie[]>([]);

  const [menu, setMenu] = useState<{ x: number, y: number, id: string} | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

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

    const loadCanvasData = async () => {
        try {
            const currentCanvas = await MovieService.getCanvas(canvasId);

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
            
            const storedMovies = await MovieService.getMovies();
            setAllMovies(storedMovies);
        } catch (error) {
            console.error("Failed to load canvas:", error);
            toast({ title: "Error loading canvas", variant: "destructive" });
            router.push('/app/canvas');
        }
    };
    
    loadCanvasData();

  }, [canvasId, router, setNodes, setEdges, toast, onLabelChange, onTitleChange, onColorChange]);
  
  const handleSave = useCallback(async () => {
    if (!canvasId) return;

    try {
        await MovieService.updateCanvas(canvasId, {
            name: canvasName,
            nodes,
            edges,
            lastModified: new Date().toISOString(),
        });
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
           style: { stroke: 'hsl(var(--foreground))', strokeWidth: 2 },
           markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
           label: '',
           labelStyle: { fill: 'hsl(var(--foreground))', fontWeight: 600 },
           labelBgPadding: [8, 4] as [number, number],
           labelBgBorderRadius: 4,
           labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.8 },
        };
       setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );
  
  const addNode = useCallback((type: 'custom' | 'movie', position?: XYPosition) => {
    if (type === 'movie') {
        setIsImportMovieOpen(true);
        return;
    }

    const targetPosition = position || screenToFlowPosition({
        x: reactFlowWrapper.current!.clientWidth / 2,
        y: reactFlowWrapper.current!.clientHeight / 2,
    });

    const newNode: Node = {
      id: `node-${crypto.randomUUID()}`,
      type: 'custom',
      position: targetPosition,
      data: { 
        label: '',
        title: 'New Card',
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
    const position = screenToFlowPosition({
        x: reactFlowWrapper.current!.clientWidth / 2,
        y: reactFlowWrapper.current!.clientHeight / 2,
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
          return { ...edge, style: { ...edge.style, stroke: color, strokeWidth: edge.style?.strokeWidth || 2 } };
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

  const findIntersectedEdge = useCallback((nodeId: string, nodePosition: XYPosition): string | null => {
    const allNodes = getNodes();
    const allEdges = getEdges();
    
    const draggingNode = allNodes.find(n => n.id === nodeId);
    if (!draggingNode) return null;
    
    const nodeCenter = {
      x: nodePosition.x + (draggingNode.width || 200) / 2,
      y: nodePosition.y + (draggingNode.height || 150) / 2
    };
    
    let closestEdge: { id: string, distance: number } | null = null;
    
    for (const edge of allEdges) {
      if (edge.source === nodeId || edge.target === nodeId) continue;
      
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
      
      const distance = distanceToLineSegment(nodeCenter, sourceCenter, targetCenter);
      
      if (distance < 30) {
        if (!closestEdge || distance < closestEdge.distance) {
          closestEdge = { id: edge.id, distance };
        }
      }
    }
    
    return closestEdge?.id || null;
  }, [getNodes, getEdges]);

  const edgesWithHighlight = edges.map(edge => {
    const isSelected = selectedEdges.some(se => se.id === edge.id);
    const isIntersected = intersectedEdgeId === edge.id;
    
    let strokeWidth = edge.style?.strokeWidth || 2;
    let stroke = edge.style?.stroke || 'hsl(var(--foreground))';
    let zIndex = 1;
    let animated = false;
    
    if (isIntersected) {
      strokeWidth = 4;
      stroke = 'hsl(var(--primary))';
      zIndex = 10;
      animated = true;
    } else if (isSelected) {
      strokeWidth = 3;
      zIndex = 5;
    }
    
    return {
      ...edge,
      style: { ...edge.style, strokeWidth, stroke },
      zIndex,
      animated,
    };
  });

  const onNodeDrag: OnNodeDrag = useCallback(
    (event, node) => {
      if (!isDragging) setIsDragging(true);
      const intersectedEdge = findIntersectedEdge(node.id, node.position);
      setIntersectedEdgeId(intersectedEdge);
    },
    [isDragging, findIntersectedEdge]
  );

  const onNodeDragStop: OnNodeDrag = useCallback(
    (event, node) => {
      setIsDragging(false);
      
      if (intersectedEdgeId) {
        const originalEdge = edges.find(e => e.id === intersectedEdgeId);
        
        if (originalEdge) {
          const newEdgeToTarget = {
            ...originalEdge,
            id: `${node.id}->${originalEdge.target}`,
            source: node.id,
            target: originalEdge.target,
          };
          
          setEdges((eds) => 
            eds.filter(e => e.id !== intersectedEdgeId)
               .concat([{ ...originalEdge, target: node.id }, newEdgeToTarget])
          );
        }
      }
      
      setIntersectedEdgeId(null);
    },
    [intersectedEdgeId, edges, setEdges]
  );
  
  const onContextMenu = useCallback(
    (event: React.MouseEvent) => {
        event.preventDefault();

        const pane = reactFlowWrapper.current?.getBoundingClientRect();
        if(!pane) return;
        
        setMenu({
            id: `context-menu-${Math.random()}`,
            x: event.clientX - pane.left,
            y: event.clientY - pane.top,
        });
    },
    [setMenu]
  );

  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === 'Backspace') {
        e.preventDefault();
      }

      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        setIsCommandPaletteOpen(open => !open);
      }
      
      if (e.key === 'Backspace' && !isEditingInNode()) {
        const nodeIdsToDelete = selectedNodes.map(n => n.id);
        const edgeIdsToDelete = selectedEdges.map(e => e.id);
        
        setNodes(nds => nds.filter(n => !nodeIdsToDelete.includes(n.id)));
        setEdges(eds => eds.filter(e => !edgeIdsToDelete.includes(e.id)));
      }
    };
    
    const isEditingInNode = () => {
        const activeElement = document.activeElement;
        return (
            activeElement?.tagName === 'INPUT' ||
            activeElement?.tagName === 'TEXTAREA'
        );
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [selectedNodes, selectedEdges, setNodes, setEdges]);
  
  const reactFlowInstance = useReactFlow();

  return (
    <div 
      ref={reactFlowWrapper} 
      style={{ height: '100vh', width: '100vw' }} 
      className="bg-background"
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
                <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsCommandPaletteOpen(true)}>
                    <Command className="mr-2 h-4 w-4"/> Command Palette
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSaveAsImage}>
                    <ImageIcon className="mr-2 h-4 w-4"/> Export as Image
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
        onEdgeDoubleClick={onEdgeDoubleClick}
        onSelectionChange={onSelectionChange}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        defaultEdgeOptions={defaultEdgeOptions}
        onPaneClick={onPaneClick}
        onContextMenu={onContextMenu}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant="dots" gap={20} size={1} color="hsl(var(--border) / 0.5)" />
        <MiniMap />
      </ReactFlow>

      <CanvasToolbar 
        onUndo={() => {}} 
        onRedo={() => {}} 
        canUndo={false} 
        canRedo={false} 
        onShowHelp={() => setIsHelpOpen(true)}
      />

      <NodeCreator onAddNode={() => addNode('custom')} onAddMovieClick={() => addNode('movie')} />

      {menu && (
        <CanvasContextMenu
          top={menu.y}
          left={menu.x}
          onClose={() => setMenu(null)}
          onAddCard={() => addNode('custom', screenToFlowPosition({x: menu.x, y: menu.y}))}
          isSnapToGrid={snapToGrid}
          setIsSnapToGrid={setSnapToGrid}
          isReadOnly={isReadOnly}
          setIsReadOnly={setIsReadOnly}
          canUndo={false}
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

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        setIsOpen={setIsCommandPaletteOpen}
        onAddNode={() => addNode('custom')}
        onAddMovieNode={() => addNode('movie')}
        onSave={handleSave}
        onZoomToFit={() => reactFlowInstance.fitView({ duration: 300 })}
      />
      
      <ImportMovieDialog
        isOpen={isImportMovieOpen}
        setIsOpen={setIsImportMovieOpen}
        movies={allMovies}
        onImport={addMovieNode}
      />
      
      <CanvasHelpDialog isOpen={isHelpOpen} setIsOpen={setIsHelpOpen} />

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
