
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Lock, Projector, Folder, Share2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import type { UserCollection } from '@/lib/types';
import { CreateCollectionDialog } from '@/components/create-collection-dialog';
import { MovieService } from '@/lib/movie-service';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSwappingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useIsMobile } from '@/hooks/use-mobile';


const CollectionCard = ({ collection }: { collection: UserCollection }) => (
    <Link href={`/app/collections/${collection.id}`} className="block group">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted shadow-md transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-lg group-hover:shadow-primary/20">
            {collection.type === 'Spotlight' && (
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
    </Link>
);

const SortableCollectionCard = ({ collection }: { collection: UserCollection }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: collection.id });

    const style: React.CSSProperties = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        zIndex: isDragging ? 100 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <CollectionCard collection={collection} />
        </div>
    );
};


export default function CollectionsPage() {
    const [vaults, setVaults] = React.useState<UserCollection[]>([]);
    const [spotlights, setSpotlights] = React.useState<UserCollection[]>([]);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [dialogType, setDialogType] = React.useState<'Vault' | 'Spotlight'>('Vault');
    const isMobile = useIsMobile();
    
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

    const CollectionGrid = ({ items, type }: { items: UserCollection[], type: 'Vault' | 'Spotlight'}) => {
        const typeName = type === 'Vault' ? 'Vaults' : 'Spotlights';
        const typeIcon = type === 'Vault' ? <Lock className="mr-2"/> : <Projector className="mr-2"/>;
        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center">{typeIcon} {typeName}</h2>
                    <Button onClick={() => handleCreateClick(type)}>
                        <Plus className="mr-2"/> Create New {type}
                    </Button>
                </div>
                {items.length > 0 ? (
                     <SortableContext items={items.map(i => i.id)} strategy={rectSwappingStrategy}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map(collection => (
                               <SortableCollectionCard key={collection.id} collection={collection} />
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
            <div className="flex min-h-screen flex-col bg-background p-4 sm:p-8 dotted-background-permanent">
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
        </>
    );
}
