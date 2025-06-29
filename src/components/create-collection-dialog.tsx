
"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { UserCollection } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

const collectionSchema = z.object({
  name: z.string().min(1, "Collection name is required."),
  description: z.string().optional(),
  coverImageUrl: z.string().url("Must be a valid URL.").or(z.literal("")).optional(),
});

type CollectionFormValues = z.infer<typeof collectionSchema>;

type CreateCollectionDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  type: 'Vault' | 'Spotlight';
  onCollectionCreated: () => void;
};

export const CreateCollectionDialog = ({ isOpen, setIsOpen, type, onCollectionCreated }: CreateCollectionDialogProps) => {

  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: "",
      description: "",
      coverImageUrl: "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset();
    }
  }, [isOpen, form]);


  const onSubmit = (data: CollectionFormValues) => {
    try {
        const storedCollections = localStorage.getItem('collections');
        const collections: UserCollection[] = storedCollections ? JSON.parse(storedCollections) : [];

        const newCollection: UserCollection = {
            id: crypto.randomUUID(),
            name: data.name,
            description: data.description,
            coverImageUrl: data.coverImageUrl,
            type: type,
            movieIds: []
        };
        
        collections.push(newCollection);
        localStorage.setItem('collections', JSON.stringify(collections));
        
        onCollectionCreated();
        setIsOpen(false);
    } catch (error) {
        console.error("Failed to save collection:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
            <DialogTitle className="font-headline">Create New {type}</DialogTitle>
            <DialogDescription>
                Organize your titles into a new collection. {type === 'Vault' ? 'Vaults are for your personal favorites.' : 'Spotlights are for high-priority watches.'}
            </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder={type === 'Vault' ? "e.g., All-Time Favorites" : "e.g., Friend Recommendations"} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="A short description for your collection..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="coverImageUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cover Image URL (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button type="submit">Create {type}</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
