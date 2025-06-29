
"use client";

import * as React from "react";
import Image from "next/image";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Movie, UserCollection } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload } from "lucide-react";

// Schema for the details tab
const collectionDetailsSchema = z.object({
  name: z.string().min(1, "Collection name is required."),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
});

type CollectionDetailsFormValues = z.infer<typeof collectionDetailsSchema>;

type EditCollectionDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  collection: UserCollection | null;
  onCollectionUpdated: () => void;
};

export const EditCollectionDialog = ({ isOpen, setIsOpen, collection, onCollectionUpdated }: EditCollectionDialogProps) => {
  const [allMovies, setAllMovies] = React.useState<Movie[]>([]);
  const [selectedMovieIds, setSelectedMovieIds] = React.useState<Set<string>>(new Set());
  const { toast } = useToast();
  const coverImageInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<CollectionDetailsFormValues>({
    resolver: zodResolver(collectionDetailsSchema),
    defaultValues: {
      name: "",
      description: "",
      coverImageUrl: "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      try {
        const storedMovies = localStorage.getItem('movies');
        setAllMovies(storedMovies ? JSON.parse(storedMovies) : []);
        if (collection) {
          setSelectedMovieIds(new Set(collection.movieIds));
          form.reset({
              name: collection.name,
              description: collection.description,
              coverImageUrl: collection.coverImageUrl
          });
        }
      } catch (error) {
        console.error("Failed to load movies from localStorage:", error);
      }
    }
  }, [isOpen, collection, form]);

  const handleCheckboxChange = (movieId: string, checked: boolean) => {
    setSelectedMovieIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(movieId);
      } else {
        newSet.delete(movieId);
      }
      return newSet;
    });
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("coverImageUrl", reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    form.handleSubmit((data) => {
        if (!collection) return;

        const updatedCollection: UserCollection = {
            ...collection,
            name: data.name,
            description: data.description,
            coverImageUrl: data.coverImageUrl,
            movieIds: Array.from(selectedMovieIds),
        };

        try {
            const storedCollections = localStorage.getItem('collections');
            let allCollections: UserCollection[] = storedCollections ? JSON.parse(storedCollections) : [];
            allCollections = allCollections.map(c => c.id === collection.id ? updatedCollection : c);
            localStorage.setItem('collections', JSON.stringify(allCollections));

            onCollectionUpdated();
            setIsOpen(false);
            toast({
                title: "Collection Updated",
                description: `"${collection.name}" has been updated.`,
            });
        } catch (error) {
            console.error("Failed to save collection:", error);
            toast({
                title: "Error",
                description: "Could not save collection changes.",
                variant: "destructive",
            });
        }
    })();
  };

  if (!collection) return null;
  const coverImageValue = form.watch('coverImageUrl');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit: {collection.name}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="movies" className="flex-grow flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="movies">Manage Titles</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <TabsContent value="movies" className="flex-grow overflow-hidden mt-4">
                <ScrollArea className="h-full pr-4">
                    <p className="text-sm text-muted-foreground mb-4">Select titles from your library to include in this collection.</p>
                    <div className="space-y-2">
                        {allMovies.length > 0 ? allMovies.map(movie => (
                            <div key={movie.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
                                <Checkbox
                                    id={`movie-${movie.id}`}
                                    checked={selectedMovieIds.has(movie.id)}
                                    onCheckedChange={(checked) => handleCheckboxChange(movie.id, !!checked)}
                                />
                                <label htmlFor={`movie-${movie.id}`} className="flex items-center gap-4 cursor-pointer flex-grow">
                                    <Image
                                        src={movie.posterUrl}
                                        alt={movie.title}
                                        width={40}
                                        height={60}
                                        className="w-10 h-[60px] object-cover rounded-md"
                                        data-ai-hint="movie poster"
                                    />
                                    <div className="flex-grow">
                                        <p className="font-semibold">{movie.title}</p>
                                        <p className="text-sm text-muted-foreground">{movie.releaseDate?.substring(0,4)}</p>
                                    </div>
                                </label>
                            </div>
                        )) : <p className="text-muted-foreground text-center py-8">Your library is empty. Add some titles first!</p>}
                    </div>
                </ScrollArea>
            </TabsContent>
            <TabsContent value="details" className="flex-grow overflow-hidden mt-4">
                <ScrollArea className="h-full pr-4">
                    <Form {...form}>
                        <form className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl><Textarea {...field} value={field.value || ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                             <FormField control={form.control} name="coverImageUrl" render={() => (
                                <FormItem>
                                    <FormLabel>Cover Image</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center gap-4">
                                            <div className="w-40 aspect-video rounded-md overflow-hidden relative border-2 border-dashed border-muted/50 flex items-center justify-center bg-muted/20">
                                                {coverImageValue ? (
                                                    <Image src={coverImageValue} alt="Cover preview" layout="fill" className="object-cover" data-ai-hint="custom collection cover" />
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Preview</span>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Button type="button" variant="outline" onClick={() => coverImageInputRef.current?.click()}>
                                                    <Upload className="mr-2 h-4 w-4" /> Upload
                                                </Button>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => form.setValue("coverImageUrl", "")} className={!coverImageValue ? 'hidden' : ''}>
                                                    Remove
                                                </Button>
                                            </div>
                                            <input type="file" ref={coverImageInputRef} className="hidden" accept="image/*" onChange={handleCoverImageChange} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </form>
                    </Form>
                </ScrollArea>
            </TabsContent>
        </Tabs>
        <DialogFooter className="mt-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="button" onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
