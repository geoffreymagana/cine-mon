"use client";

import * as React from "react";
import Image from "next/image";
import type { UserCollection } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Projector, PlusCircle } from "lucide-react";
import { MovieService } from "@/lib/movie-service";
import { useToast } from "@/hooks/use-toast";
import { CreateCollectionDialog } from "./create-collection-dialog";

type AddToCollectionDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  movieIds: string[];
  onActionComplete: () => void;
};

export const AddToCollectionDialog = ({ isOpen, setIsOpen, movieIds, onActionComplete }: AddToCollectionDialogProps) => {
  const [collections, setCollections] = React.useState<UserCollection[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [createDialogType, setCreateDialogType] = React.useState<'Vault' | 'Spotlight'>('Vault');
  const { toast } = useToast();

  const loadCollections = React.useCallback(async () => {
    const collectionsFromDb = await MovieService.getCollections();
    setCollections(collectionsFromDb);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      loadCollections();
    }
  }, [isOpen, loadCollections]);
  
  const handleAddToCollection = async (collection: UserCollection) => {
    const newMoviesCount = movieIds.filter(id => !collection.movieIds.includes(id)).length;
    
    if (newMoviesCount === 0) {
        toast({ title: "No new titles to add", description: `All selected titles are already in "${collection.name}".` });
        return;
    }

    const updatedMovieIds = Array.from(new Set([...collection.movieIds, ...movieIds]));
    await MovieService.updateCollection(collection.id, { movieIds: updatedMovieIds });

    toast({
      title: "Success!",
      description: `${newMoviesCount} title(s) added to "${collection.name}".`,
    });

    onActionComplete();
    setIsOpen(false);
  };
  
  const handleCreateCollectionClick = (type: 'Vault' | 'Spotlight') => {
    setCreateDialogType(type);
    setIsCreateDialogOpen(true);
  };
  
  const handleCollectionCreated = (newCollection: UserCollection) => {
    loadCollections(); // Refresh the list
    toast({
      title: "Collection Created",
      description: `${movieIds.length} title(s) added to your new ${newCollection.type.toLowerCase()} "${newCollection.name}".`,
    });
    onActionComplete();
    setIsOpen(false);
  };

  const vaults = collections.filter(c => c.type === 'Vault');
  const spotlights = collections.filter(c => c.type === 'Spotlight');

  const CollectionList = ({ items, onSelect }: { items: UserCollection[]; onSelect: (item: UserCollection) => void }) => (
    <div className="space-y-2">
      {items.length > 0 ? (
        items.map(item => (
          <Button key={item.id} variant="ghost" className="w-full justify-start h-auto p-3" onClick={() => onSelect(item)}>
            <div className="w-16 h-10 rounded-md bg-muted mr-3 overflow-hidden flex-shrink-0">
              {item.coverImageUrl && <Image src={item.coverImageUrl} alt={item.name} width={64} height={40} className="object-cover h-full w-full" data-ai-hint="collection cover abstract" />}
            </div>
            <div className="flex-grow text-left">
              <p className="font-semibold">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.movieIds.length} items</p>
            </div>
          </Button>
        ))
      ) : (
        <p className="text-center text-sm text-muted-foreground py-8">No collections of this type yet.</p>
      )}
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md h-[70vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add to Collection</DialogTitle>
            <DialogDescription>
              Add {movieIds.length} selected item(s) to a Vault or Spotlight.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="vaults" className="flex-grow flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2 shrink-0">
              <TabsTrigger value="vaults"><Lock className="mr-2"/> Vaults</TabsTrigger>
              <TabsTrigger value="spotlights"><Projector className="mr-2"/> Spotlights</TabsTrigger>
            </TabsList>
            <TabsContent value="vaults" className="flex-grow overflow-hidden mt-2">
              <ScrollArea className="h-full pr-4">
                <CollectionList items={vaults} onSelect={handleAddToCollection} />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="spotlights" className="flex-grow overflow-hidden mt-2">
              <ScrollArea className="h-full pr-4">
                <CollectionList items={spotlights} onSelect={handleAddToCollection} />
              </ScrollArea>
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-4 pt-4 border-t flex-col sm:flex-col sm:space-x-0 gap-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => handleCreateCollectionClick('Vault')}>
                <PlusCircle className="mr-2"/> Create New Vault
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => handleCreateCollectionClick('Spotlight')}>
                <PlusCircle className="mr-2"/> Create New Spotlight
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <CreateCollectionDialog
        isOpen={isCreateDialogOpen}
        setIsOpen={setIsCreateDialogOpen}
        type={createDialogType}
        onCollectionCreated={handleCollectionCreated}
        movieIdsToAdd={movieIds}
      />
    </>
  );
};
