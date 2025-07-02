
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Lock, Projector, Share2, MoreVertical, X, Trash2, Check } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import type { UserCollection } from '@/lib/types';
import { CreateCollectionDialog } from '@/components/create-collection-dialog';
import { MovieService } from '@/lib/movie-service';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSwappingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useIsMobile } from '@/hooks/use-mobile';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


const CollectionCard = ({ 
    collection,
    isSelectionMode = false,
    isSelected = false,
    onSelect
}: { 
    collection: UserCollection,
    isSelectionMode?: boolean,
    isSelected?: boolean,
    onSelect?: () => void
}) => {
    
    const cardContent = (
        <div className={cn("relative aspect-video w-full overflow-hidden rounded-lg bg-muted shadow-md transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-lg group-hover:shadow-primary/20", isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background")}>
            {isSelectionMode && (
              <div className="absolute inset-0 z-30 bg-black/30 flex items-center justify-center">
                  <div className="absolute top-3 left-3 h-6 w-6 rounded-md bg-background/80 flex items-center justify-center border-2 border-primary">
                    {isSelected && <Check className="h-4 w-4 text-primary font-bold" />}
                  </div>
              </div>
            )}
            {collection.type === 'Spotlight' && !isSelectionMode && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-20 text-white bg-black/30 backdrop-blur-sm hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Future share logic here
                        console.log(`Sharing ${collection.name}`);
                    }}
                    aria-label={`Share ${collection.name}`}
                >
                    <Share2 className="h-4 w-4" />
                </Button>
            )}
            <Image
                src={collection.coverImageUrl || 'https://placehold.co/600x400.png'}
                alt={`Cover for ${collection.name}`}
                layout="fill"
                className="object-cover"
                data-ai-hint="movie collage abstract"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-xl font-bold font-headline text-white">{collection.name}</h3>
                <p className="text-sm text-gray-300 line-clamp-1">{collection.description || `${collection.movieIds.length} items`}</p>
            </div>
        </div>
    );

    if (isSelectionMode) {
        return (
            <div className="block group cursor-pointer" onClick={onSelect}>
                {cardContent}
            </div>
        )
    }

    return (
        <Link href={`/app/collections/${collection.id}`} className="block group">
            {cardContent}
        </Link>
    )
};


const SortableCollectionCard = ({ 
    collection,
    isSelectionMode,
    isSelected,
    onSelect
}: { 
    collection: UserCollection,
    isSelectionMode?: boolean,
    isSelected?: boolean,
    onSelect?: () => void
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: collection.id, disabled: isSelectionMode });

    const style: React.CSSProperties = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        zIndex: isDragging ? 100 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...(isSelectionMode ? {} : listeners)}>
            <CollectionCard 
                collection={collection} 
                isSelectionMode={isSelectionMode}
                isSelected={isSelected}
                onSelect={onSelect}
            />
        </div>
    );
};


export default function CollectionsPage() {
    const [vaults, setVaults] = React.useState<UserCollection[]>([]);
    const [spotlights, setSpotlights] = React.useState<UserCollection[]>([]);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [dialogType, setDialogType] = React.useState<'Vault' | 'Spotlight'>('Vault');
    const isMobile = useIsMobile();
    const { toast } = useToast();
    
    // State for selection
    const [selectionModeFor, setSelectionModeFor] = React.useState<'Vault' | 'Spotlight' | null>(null);
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: isMobile ? 250 : 0,
                tolerance: isMobile ? 5 : 2,
            },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const loadCollections = React.useCallback(async () => {
        const [collectionsFromDb, vaultsOrder, spotlightsOrder] = await Promise.all([
            MovieService.getCollections(),
            MovieService.getSetting('vaultsOrder'),
            MovieService.getSetting('spotlightsOrder')
        ]);

        const allVaults = collectionsFromDb.filter(c => c.type === 'Vault');
        const allSpotlights = collectionsFromDb.filter(c => c.type === 'Spotlight');

        const sortItems = (items: UserCollection[], order: string[] | undefined) => {
            if (!order || !Array.isArray(order)) return items;
            const itemMap = new Map(items.map(item => [item.id, item]));
            const sorted = order.map(id => itemMap.get(id)).filter(Boolean) as UserCollection[];
            const unsorted = items.filter(item => !order.includes(item.id));
            return [...sorted, ...unsorted];
        }

        setVaults(sortItems(allVaults, vaultsOrder));
        setSpotlights(sortItems(allSpotlights, spotlightsOrder));
    }, []);

    React.useEffect(() => {
        loadCollections();
    }, [loadCollections]);
    
    const handleCreateClick = (type: 'Vault' | 'Spotlight') => {
        setDialogType(type);
        setIsDialogOpen(true);
    }
    
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const isVaultDrag = vaults.some(v => v.id === active.id);
            const isSpotlightDrag = spotlights.some(s => s.id === active.id);

            if (isVaultDrag && vaults.some(v => v.id === over.id)) {
                setVaults((items) => {
                    const oldIndex = items.findIndex((item) => item.id === active.id);
                    const newIndex = items.findIndex((item) => item.id === over.id);
                    const newOrder = arrayMove(items, oldIndex, newIndex);
                    MovieService.setSetting('vaultsOrder', newOrder.map(i => i.id));
                    return newOrder;
                });
            } else if (isSpotlightDrag && spotlights.some(s => s.id === over.id)) {
                setSpotlights((items) => {
                    const oldIndex = items.findIndex((item) => item.id === active.id);
                    const newIndex = items.findIndex((item) => item.id === over.id);
                    const newOrder = arrayMove(items, oldIndex, newIndex);
                    MovieService.setSetting('spotlightsOrder', newOrder.map(i => i.id));
                    return newOrder;
                });
            }
        }
    };

    const handleToggleSelectionMode = (type: 'Vault' | 'Spotlight') => {
        if (selectionModeFor === type) {
            setSelectionModeFor(null);
            setSelectedIds(new Set());
        } else {
            setSelectionModeFor(type);
            setSelectedIds(new Set());
        }
    };
    
    const handleClearSelection = () => {
        setSelectionModeFor(null);
        setSelectedIds(new Set());
    };

    const handleSelectCollection = (collectionId: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(collectionId)) {
                newSet.delete(collectionId);
            } else {
                newSet.add(collectionId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        const currentList = selectionModeFor === 'Vault' ? vaults : spotlights;
        if (selectedIds.size === currentList.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(currentList.map(c => c.id)));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        await MovieService.deleteCollections(Array.from(selectedIds));
        toast({
            title: `${selectedIds.size} Collection(s) Deleted`,
            description: "The selected collections have been removed.",
            variant: 'destructive'
        });
        loadCollections();
        handleClearSelection();
    };


    const CollectionGrid = ({ items, type }: { items: UserCollection[], type: 'Vault' | 'Spotlight'}) => {
        const isSelectionMode = selectionModeFor === type;
        const typeName = type === 'Vault' ? 'Vaults' : 'Spotlights';
        const typeIcon = type === 'Vault' ? <Lock className="mr-2"/> : <Projector className="mr-2"/>;
        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center">{typeIcon} {typeName}</h2>
                    <div className="flex items-center gap-2">
                        <Button onClick={() => handleCreateClick(type)}>
                            <Plus className="mr-2"/> Create New {type}
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreVertical/></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => handleToggleSelectionMode(type)}>
                                    {isSelectionMode ? "Cancel Selection" : "Select Items"}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                {items.length > 0 ? (
                     <SortableContext items={items.map(i => i.id)} strategy={rectSwappingStrategy} disabled={isSelectionMode}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map(collection => (
                               <SortableCollectionCard
                                    key={collection.id}
                                    collection={collection}
                                    isSelectionMode={isSelectionMode}
                                    isSelected={selectedIds.has(collection.id)}
                                    onSelect={() => handleSelectCollection(collection.id)}
                                />
                            ))}
                        </div>
                     </SortableContext>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed rounded-lg">
                        <Folder className="w-16 h-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold">No {typeName} Yet</h3>
                        <p className="text-muted-foreground mt-1">Create your first {type.toLowerCase()} to get started.</p>
                    </div>
                )}
            </div>
        )
    };

    return (
        <>
            {selectionModeFor && (
                <div className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-secondary px-4 md:px-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={handleClearSelection}><X className="h-5 w-5"/></Button>
                        <span className="font-semibold text-lg">{selectedIds.size} Selected</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="select-all"
                                checked={
                                    selectedIds.size > 0 &&
                                    selectedIds.size === (selectionModeFor === 'Vault' ? vaults.length : spotlights.length)
                                }
                                onCheckedChange={handleSelectAll}
                            />
                            <label htmlFor="select-all" className="text-sm font-medium leading-none cursor-pointer">Select all</label>
                        </div>
                        <Button variant="destructive" onClick={() => setIsDeleteAlertOpen(true)} disabled={selectedIds.size === 0}>
                            <Trash2 className="mr-2"/> Delete ({selectedIds.size})
                        </Button>
                    </div>
                </div>
            )}
            <div className={cn("flex min-h-screen flex-col bg-background p-4 sm:p-8", !selectionModeFor && "dotted-background-permanent")}>
                <div className="w-full max-w-7xl mx-auto">
                    <Link href="/app/dashboard" className="inline-flex items-center gap-2 mb-8 font-semibold text-lg hover:text-primary transition-colors">
                        <ArrowLeft className="w-5 h-5"/>
                        <span>Back to Collection</span>
                    </Link>

                    <div className="text-left mb-8">
                        <h1 className="text-5xl font-bold font-headline">My Vaults & Spotlights</h1>
                        <p className="text-muted-foreground mt-2">Curate personal collections of your favorite and must-watch titles.</p>
                    </div>
                    
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <Tabs defaultValue="vaults" className="w-full">
                            <TabsList className="mb-8 grid w-full grid-cols-2">
                                <TabsTrigger value="vaults"><Lock className="mr-2"/> Vaults</TabsTrigger>
                                <TabsTrigger value="spotlights"><Projector className="mr-2"/> Spotlights</TabsTrigger>
                            </TabsList>
                            <TabsContent value="vaults">
                                <CollectionGrid items={vaults} type="Vault" />
                            </TabsContent>
                            <TabsContent value="spotlights">
                                <CollectionGrid items={spotlights} type="Spotlight" />
                            </TabsContent>
                        </Tabs>
                    </DndContext>
                </div>
            </div>
            <CreateCollectionDialog
                isOpen={isDialogOpen}
                setIsOpen={setIsDialogOpen}
                type={dialogType}
                onCollectionCreated={loadCollections}
            />
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {selectedIds.size} collection(s). This action cannot be undone. The movies inside will NOT be deleted from your main library.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete}>Delete Collections</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

