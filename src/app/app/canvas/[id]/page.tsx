
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
  getRectOfNodes,
  getTransformForBounds,
  Position,
} from 'reactflow';
import Link from 'next/link';
import { ArrowLeft, MoreVertical, Save, Image as ImageIcon, Command, StickyNote, Link2, Lock } from 'lucide-react';
import { toPng } from 'html-to-image';

import CustomNode from '@/components/canvas/custom-node';
import StickyNodeComponent from '@/components/canvas/sticky-note';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { getLayoutedElements } from '@/lib/canvas-layout';


import 'reactflow/dist/style.css';
import { cn } from '@/lib/utils';

const nodeTypes = {
  custom: CustomNode,
  sticky: StickyNodeComponent,
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
  interactionWidth: 20,
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
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, getNodes, getEdges, setViewport, fitView } = useReactFlow();

  const [intersectedEdgeId, setIntersectedEdgeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [selectedNodes, setSelectedNodes] = React.useState<Node[]>([]);
  const [selectedEdges, setSelectedEdges] = React.useState<Edge[]>([]);
  const [clipboard, setClipboard] = React.useState<{ nodes: Node[], edges: Edge[] } | null>(null);

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
        if (node.id === nodeId && node.data.nodeType === 'standard') {
          node.data = { ...node.data, label };
        }
        return node;
      })
    );
  }, [setNodes]);

  const onNodeTextChange = useCallback((nodeId: string, text: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId && node.data.nodeType === 'sticky') {
          node.data = { ...node.data, text };
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
  
  const getContrastColor = (hexcolor: string) => {
    if (!hexcolor) return 'hsl(var(--foreground))';
    const r = parseInt(hexcolor.substring(1, 3), 16);
    const g = parseInt(hexcolor.substring(3, 5), 16);
    const b = parseInt(hexcolor.substring(5, 7), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'hsl(var(--foreground))' : 'hsl(var(--primary-foreground))';
  }

  const onColorChange = useCallback((nodeId: string, color: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const textColor = getContrastColor(color);
          node.data = { ...node.data, color, textColor };
        }
        return node;
      })
    );
  }, [setNodes]);

  const onUrlChange = useCallback((nodeId: string, url: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          // You could add logic here to fetch metadata in the future
          const title = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
          node.data = { ...node.data, url, title: title || 'Web Page' };
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
                        onChange: onNodeTextChange,
                        onUrlChange,
                        isReadOnly: false,
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

  }, [canvasId, router, setNodes, setEdges, toast, onLabelChange, onTitleChange, onColorChange, onNodeTextChange, onUrlChange]);
  
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { ...node.data, isReadOnly: isReadOnly },
      }))
    );
  }, [isReadOnly, setNodes]);

  const handleSave = useCallback(async () => {
    if (!canvasId) return;

    const nodesToSave = getNodes().map(n => {
      const { onLabelChange, onTitleChange, onColorChange, onChange, onUrlChange, isReadOnly, ...restData } = n.data;
      return { ...n, data: restData };
    });

    try {
        await MovieService.updateCanvas(canvasId, {
            name: canvasName,
            nodes: nodesToSave,
            edges: getEdges(),
            lastModified: new Date().toISOString(),
        });
        toast({ title: "Canvas Saved!", description: `"${canvasName}" has been saved.` });
    } catch (error) {
        console.error("Failed to save canvas:", error);
        toast({ title: "Error saving canvas", variant: "destructive" });
    }
  }, [canvasId, canvasName, getNodes, getEdges, toast]);

  const handleSaveAsImage = useCallback(() => {
    if (!reactFlowWrapper.current) return;
    const allNodes = getNodes();

    if (allNodes.length === 0) {
        toast({ title: "Canvas is empty", description: "Add some nodes to export an image.", variant: "destructive" });
        return;
    }
    
    const imagePadding = 40;
    const nodesBounds = getRectOfNodes(allNodes);
    const imageWidth = nodesBounds.width + imagePadding * 2;
    const imageHeight = nodesBounds.height + imagePadding * 2;
    
    const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);

    toPng(reactFlowWrapper.current.querySelector('.react-flow__viewport') as HTMLElement, {
        backgroundColor: 'hsl(var(--background))',
        width: imageWidth,
        height: imageHeight,
        cacheBust: true,
        style: {
            width: `${imageWidth}px`,
            height: `${imageHeight}px`,
            transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
        },
    }).then((dataUrl) => downloadImage(dataUrl, `${canvasName.replace(/\s+/g, '-')}.png`))
      .catch((err) => {
            console.error(err);
            toast({ title: "Error exporting image", description: "Could not save canvas as an image.", variant: "destructive" });
      });

  }, [canvasName, getNodes, toast]);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
       if (isReadOnly) return;
       const newEdge = { 
           ...params, 
           type: 'default',
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
    [setEdges, isReadOnly]
  );
  
  const addNode = useCallback((type: 'custom' | 'movie' | 'sticky' | 'web', position?: XYPosition) => {
    if (isReadOnly) return;

    if (type === 'movie') {
        setIsImportMovieOpen(true);
        return;
    }

    const targetPosition = position || screenToFlowPosition({
        x: reactFlowWrapper.current!.clientWidth / 2,
        y: reactFlowWrapper.current!.clientHeight / 2,
    });
    
    let newNode: Node;

    if (type === 'web') {
      newNode = {
        id: `node-${crypto.randomUUID()}`,
        type: 'custom', // Still uses custom node component
        position: targetPosition,
        data: {
          label: '',
          title: 'Web Page',
          color: 'hsl(var(--card))',
          textColor: 'hsl(var(--card-foreground))',
          onLabelChange,
          onTitleChange,
          onColorChange,
          onUrlChange,
          nodeType: 'web',
          url: '',
          isReadOnly,
        },
        width: 250,
        height: 200,
      };
    } else if (type === 'sticky') {
      newNode = {
        id: `node-${crypto.randomUUID()}`,
        type: 'sticky',
        position: targetPosition,
        data: { 
          text: '',
          onChange: onNodeTextChange,
          onColorChange: onColorChange,
          nodeType: 'sticky',
          color: 'hsla(54, 85%, 51%, 0.7)',
          isReadOnly,
        },
        width: 200,
        height: 200,
      };
    } else {
      newNode = {
        id: `node-${crypto.randomUUID()}`,
        type: 'custom',
        position: targetPosition,
        data: { 
          label: '',
          title: 'New Card',
          color: 'hsl(var(--card))',
          textColor: 'hsl(var(--card-foreground))',
          onLabelChange,
          onTitleChange,
          onColorChange,
          nodeType: 'standard',
          isReadOnly,
        },
        width: 200,
        height: 150,
      };
    }

    setNodes((nds) => nds.concat(newNode));
  }, [onLabelChange, onTitleChange, onColorChange, onUrlChange, screenToFlowPosition, setNodes, onNodeTextChange, isReadOnly]);

  const addMovieNode = useCallback((movie: Movie) => {
    if (isReadOnly) return;

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
        textColor: 'hsl(var(--card-foreground))',
        onLabelChange,
        onTitleChange,
        onColorChange,
        nodeType: 'movie',
        movieData: movie,
        isReadOnly,
      },
      width: 150,
      height: 267,
    };
    setNodes((nds) => nds.concat(newNode));
  }, [screenToFlowPosition, setNodes, onLabelChange, onTitleChange, onColorChange, isReadOnly]);
  
  const onEdgeDoubleClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      if (isReadOnly) return;
      setEditingEdge(edge);
      setCurrentLabel(edge.label as string || '');
    },
    [isReadOnly]
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
    let animated = false;
    
    if (isIntersected) {
      strokeWidth = 4;
      stroke = 'hsl(var(--primary))';
      animated = true;
    } else if (isSelected) {
      strokeWidth = 3;
    }
    
    return {
      ...edge,
      style: { ...edge.style, strokeWidth, stroke },
      animated,
    };
  });

  const onNodeDrag: OnNodeDrag = useCallback(
    (event, node) => {
      if (!isDragging) setIsDragging(true);
      if (!node) return;
      const intersectedEdge = findIntersectedEdge(node.id, node.position);
      setIntersectedEdgeId(intersectedEdge);
    },
    [isDragging, findIntersectedEdge]
  );

  const onNodeDragStop: OnNodeDrag = useCallback(
    (event, node) => {
      if (isReadOnly) return;
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
    [intersectedEdgeId, edges, setEdges, isReadOnly]
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
  
  const handlePaste = useCallback(() => {
    if (!clipboard || isReadOnly) return;
    const { nodes: copiedNodes, edges: copiedEdges } = clipboard;
    if (copiedNodes.length === 0) return;

    const pasteOffset = { x: 20, y: 20 };

    const newNodes = copiedNodes.map(node => ({
      ...node,
      id: `node-${crypto.randomUUID()}`,
      position: { x: node.position.x + pasteOffset.x, y: node.position.y + pasteOffset.y },
      selected: true,
    }));

    const idMap = new Map(copiedNodes.map((node, index) => [node.id, newNodes[index].id]));

    const newEdges = copiedEdges.map(edge => {
      const sourceId = idMap.get(edge.source);
      const targetId = idMap.get(edge.target);
      if (sourceId && targetId) {
        return {
          ...edge,
          id: `edge-${crypto.randomUUID()}`,
          source: sourceId,
          target: targetId,
          selected: true,
        };
      }
      return null;
    }).filter((e): e is Edge => !!e);

    setNodes(nds => [...nds.map(n => ({ ...n, selected: false })), ...newNodes]);
    setEdges(eds => [...eds.map(e => ({ ...e, selected: false })), ...newEdges]);

    setClipboard({ nodes: newNodes, edges: newEdges });
  }, [clipboard, setNodes, setEdges, setClipboard, isReadOnly]);


  useEffect(() => {
    const isEditingInNode = () => {
        const activeElement = document.activeElement;
        const isInput = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
        const isContentEditable = (activeElement as HTMLElement)?.isContentEditable;
        const isInDialog = activeElement?.closest('[role="dialog"]');

        return isInput || isContentEditable || isInDialog;
    };

    const down = (e: KeyboardEvent) => {
      if (isEditingInNode()) return;

      const isModKey = e.metaKey || e.ctrlKey;
      
      if (isModKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(open => !open);
        return;
      }
      
      if (isReadOnly) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        setNodes(nds => nds.filter(n => !selectedNodes.some(sn => sn.id === n.id)));
        setEdges(eds => eds.filter(e => !selectedEdges.some(se => se.id === e.id)));
        return;
      }

      // Clipboard and creation shortcuts
      if (isModKey) {
        switch (e.key.toLowerCase()) {
          case 'c':
            e.preventDefault();
            setClipboard({ nodes: selectedNodes, edges: selectedEdges });
            toast({ title: 'Copied!', description: `${selectedNodes.length} nodes and ${selectedEdges.length} edges copied.` });
            break;
          case 'x':
            e.preventDefault();
            setClipboard({ nodes: selectedNodes, edges: selectedEdges });
            setNodes(nds => nds.filter(n => !selectedNodes.some(sn => sn.id === n.id)));
            setEdges(eds => eds.filter(e => !selectedEdges.some(se => se.id === e.id)));
            toast({ title: 'Cut!', description: `${selectedNodes.length} nodes and ${selectedEdges.length} edges cut.` });
            break;
          case 'v':
            e.preventDefault();
            handlePaste();
            break;
          case 'a':
            e.preventDefault();
            setNodes(nds => nds.map(n => ({ ...n, selected: true })));
            setEdges(eds => eds.map(e => ({ ...e, selected: true })));
            break;
          case 'n':
            e.preventDefault();
            if (e.shiftKey) {
              addNode('sticky');
            } else {
              addNode('custom');
            }
            break;
          case 'm':
            if (e.shiftKey) {
              e.preventDefault();
              addNode('movie');
            }
            break;
        }
      }
    };
    
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [selectedNodes, selectedEdges, setNodes, setEdges, handlePaste, addNode, isReadOnly, toast]);
  
  const reactFlowInstance = useReactFlow();

  const runCommand = React.useCallback((command: () => unknown) => {
    setIsCommandPaletteOpen(false);
    command();
  }, []);

  const onLayout = useCallback((direction: 'TB' | 'LR') => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      getNodes(),
      getEdges(),
      direction
    );

    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);

    window.requestAnimationFrame(() => {
        fitView({ duration: 300 });
    });
  }, [getNodes, getEdges, setNodes, setEdges, fitView]);

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
          disabled={isReadOnly}
        />
        {isReadOnly && <Badge variant="secondary" className="flex items-center gap-2"><Lock className="h-3 w-3" /> Read-Only</Badge>}
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <Button onClick={handleSave} disabled={isReadOnly}><Save className="mr-2 h-4 w-4"/>Save</Button>
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
        nodesDraggable={!isReadOnly}
        nodesConnectable={!isReadOnly}
        nodesFocusable={!isReadOnly}
        edgesFocusable={!isReadOnly}
        selectNodesOnDrag={!isReadOnly}
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
        onLayout={onLayout}
        isReadOnly={isReadOnly}
        setIsReadOnly={setIsReadOnly}
      />

      {!isReadOnly && <NodeCreator onAddNode={(type) => addNode(type)} onAddMovieClick={() => addNode('movie')} />}

      {menu && (
        <CanvasContextMenu
          top={menu.y}
          left={menu.x}
          onClose={() => setMenu(null)}
          onAddNode={(type) => addNode(type, screenToFlowPosition({x: menu.x, y: menu.y}))}
          isSnapToGrid={snapToGrid}
          setIsSnapToGrid={setSnapToGrid}
          isReadOnly={isReadOnly}
          setIsReadOnly={setIsReadOnly}
          canUndo={false}
        />
      )}

      {selectedNodes.length > 0 && !isReadOnly && (selectedNodes[0].type === 'custom' || selectedNodes[0].type === 'sticky') && (
        <ColorPickerToolbar
          node={selectedNodes[0]}
          onColorChange={(color) => {
            selectedNodes.forEach(node => onColorChange(node.id, color));
          }}
        />
      )}

      {selectedEdges.length > 0 && selectedNodes.length === 0 && !isReadOnly && (
          <EdgeToolbar
              selectedEdges={selectedEdges}
              onEdgeColorChange={onEdgeColorChange}
              onEdgeTypeChange={onEdgeTypeChange}
          />
      )}

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        setIsOpen={setIsCommandPaletteOpen}
        onAddNode={() => runCommand(() => addNode('custom'))}
        onAddMovieNode={() => runCommand(() => addNode('movie'))}
        onAddWebPageNode={() => runCommand(() => addNode('web'))}
        onSave={() => runCommand(handleSave)}
        onZoomToFit={() => runCommand(() => reactFlowInstance.fitView({ duration: 300 }))}
        onAutoLayoutTB={() => runCommand(() => onLayout('TB'))}
        onAutoLayoutLR={() => runCommand(() => onLayout('LR'))}
        isReadOnly={isReadOnly}
        setIsReadOnly={setIsReadOnly}
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
