"use client";

import * as React from "react";
import Image from "next/image";
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
import { Upload } from "lucide-react";
import { MovieService } from "@/lib/movie-service";

const collectionSchema = z.object({
  name: z.string().min(1, "Collection name is required."),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
});

type CollectionFormValues = z.infer<typeof collectionSchema>;

type CreateCollectionDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  type: 'Vault' | 'Spotlight';
  onCollectionCreated: (newCollection: UserCollection) => void;
  movieIdsToAdd?: string[];
};

export const CreateCollectionDialog = ({ isOpen, setIsOpen, type, onCollectionCreated, movieIdsToAdd }: CreateCollectionDialogProps) => {
  const coverImageInputRef = React.useRef<HTMLInputElement>(null);

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

  const onSubmit = async (data: CollectionFormValues) => {
    const newCollection: UserCollection = {
        id: crypto.randomUUID(),
        name: data.name,
        description: data.description,
        coverImageUrl: data.coverImageUrl,
        type: type,
        movieIds: movieIdsToAdd || []
    };
    
    await MovieService.addCollection(newCollection);
    onCollectionCreated(newCollection);
    setIsOpen(false);
  };
  
  const coverImageValue = form.watch('coverImageUrl');

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
                    render={() => (
                        <FormItem>
                            <FormLabel>Cover Image (Optional)</FormLabel>
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
                                    <input
                                        type="file"
                                        ref={coverImageInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleCoverImageChange}
                                    />
                                </div>
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
