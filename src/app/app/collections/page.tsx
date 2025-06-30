
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Lock, Projector, Folder } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import type { UserCollection } from '@/lib/types';
import { CreateCollectionDialog } from '@/components/create-collection-dialog';

const CollectionCard = ({ collection }: { collection: UserCollection }) => (
    <Link href={`/app/collections/${collection.id}`} className="block group">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted shadow-md transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-lg group-hover:shadow-primary/20">
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


export default function CollectionsPage() {
    const [collections, setCollections] = React.useState<UserCollection[]>([]);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [dialogType, setDialogType] = React.useState<'Vault' | 'Spotlight'>('Vault');

    const loadCollections = React.useCallback(() => {
        try {
            const storedCollections = localStorage.getItem('collections');
            if (storedCollections) {
                setCollections(JSON.parse(storedCollections));
            }
        } catch (error) {
            console.error("Failed to load collections from localStorage:", error);
        }
    }, []);

    React.useEffect(() => {
        loadCollections();
    }, [loadCollections]);
    
    const handleCreateClick = (type: 'Vault' | 'Spotlight') => {
        setDialogType(type);
        setIsDialogOpen(true);
    }

    const vaults = collections.filter(c => c.type === 'Vault');
    const spotlights = collections.filter(c => c.type === 'Spotlight');

    const CollectionList = ({ items, type }: { items: UserCollection[], type: 'Vault' | 'Spotlight'}) => {
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
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(collection => (
                           <CollectionCard key={collection.id} collection={collection} />
                        ))}
                    </div>
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
                    
                    <Tabs defaultValue="vaults" className="w-full">
                        <TabsList className="mb-8 grid w-full grid-cols-2">
                            <TabsTrigger value="vaults"><Lock className="mr-2"/> Vaults</TabsTrigger>
                            <TabsTrigger value="spotlights"><Projector className="mr-2"/> Spotlights</TabsTrigger>
                        </TabsList>
                        <TabsContent value="vaults">
                            <CollectionList items={vaults} type="Vault" />
                        </TabsContent>
                        <TabsContent value="spotlights">
                            <CollectionList items={spotlights} type="Spotlight" />
                        </TabsContent>
                    </Tabs>
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
