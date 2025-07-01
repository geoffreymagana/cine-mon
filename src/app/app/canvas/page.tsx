
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { CanvasBoard, Node } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ReactFlow, Background } from 'reactflow';
import 'reactflow/dist/style.css';


const CanvasPreview = ({ nodes }: { nodes: Node[] }) => (
    <div className="h-full w-full pointer-events-none bg-muted/20">
        <ReactFlow
            nodes={nodes}
            edges={[]}
            fitView
            proOptions={{ hideAttribution: true }}
            nodesDraggable={false}
            nodesConnectable={false}
            zoomOnScroll={false}
            panOnScroll={false}
            zoomOnDoubleClick={false}
            panOnDrag={false}
        >
            <Background variant="dots" gap={20} size={1} />
        </ReactFlow>
    </div>
);

export default function CanvasesPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [canvases, setCanvases] = React.useState<CanvasBoard[]>([]);

    const loadCanvases = React.useCallback(() => {
        try {
            const storedCanvases = localStorage.getItem('canvases');
            const parsedCanvases: CanvasBoard[] = storedCanvases ? JSON.parse(storedCanvases) : [];
            parsedCanvases.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
            setCanvases(parsedCanvases);
        } catch (error) {
            console.error("Failed to load canvases:", error);
            toast({ title: "Error", description: "Could not load your canvases.", variant: "destructive" });
        }
    }, [toast]);

    React.useEffect(() => {
        loadCanvases();
    }, [loadCanvases]);

    const handleNewCanvas = () => {
        const newCanvas: CanvasBoard = {
            id: crypto.randomUUID(),
            name: 'Untitled Canvas',
            nodes: [],
            edges: [],
            lastModified: new Date().toISOString(),
        };
        const updatedCanvases = [...canvases, newCanvas];
        localStorage.setItem('canvases', JSON.stringify(updatedCanvases));
        router.push(`/app/canvas/${newCanvas.id}`);
    };

    const handleDeleteCanvas = (id: string, name: string) => {
        const updatedCanvases = canvases.filter(c => c.id !== id);
        setCanvases(updatedCanvases);
        localStorage.setItem('canvases', JSON.stringify(updatedCanvases));
        toast({ title: "Canvas Deleted", description: `"${name}" has been deleted.` });
    };

    return (
        <div className="flex min-h-screen flex-col bg-background p-4 sm:p-8">
            <div className="w-full max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <Link href="/app/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
                            <ArrowLeft className="w-4 h-4"/>
                            Back to Dashboard
                        </Link>
                        <h1 className="text-5xl font-bold font-headline">My Canvases</h1>
                    </div>
                    <Button onClick={handleNewCanvas}>
                        <Plus className="mr-2"/> New Canvas
                    </Button>
                </div>

                {canvases.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {canvases.map(canvas => (
                            <Card key={canvas.id} className="flex flex-col group">
                                <Link href={`/app/canvas/${canvas.id}`} className="block h-48 overflow-hidden rounded-t-lg">
                                    <CanvasPreview nodes={canvas.nodes} />
                                </Link>
                                <CardHeader className="flex-row items-center justify-between">
                                    <Link href={`/app/canvas/${canvas.id}`} className="flex-grow min-w-0">
                                        <CardTitle className="truncate group-hover:text-primary transition-colors capitalize">{canvas.name}</CardTitle>
                                    </Link>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive flex-shrink-0 -mr-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete "{canvas.name}". This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteCanvas(canvas.id, canvas.name)}>
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardHeader>
                                <CardFooter className="mt-auto pt-0">
                                    <CardDescription>
                                        Last modified {formatDistanceToNow(new Date(canvas.lastModified), { addSuffix: true })}
                                    </CardDescription>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed rounded-lg flex flex-col items-center">
                        <LayoutGrid className="w-16 h-16 text-muted-foreground mb-4"/>
                        <h3 className="text-2xl font-bold font-headline">No Canvases Yet</h3>
                        <p className="text-muted-foreground mt-2">Click "New Canvas" to start your first visual board.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
