"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Movie } from "@/lib/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { autoTagMovies } from "@/ai/flows/auto-tag-movies";


const movieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  posterUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  type: z.enum(["Movie", "TV Show", "Anime"]),
  status: z.enum(["Watching", "Completed", "On-Hold", "Dropped", "Plan to Watch"]),
  watchedEpisodes: z.coerce.number().min(0),
  totalEpisodes: z.coerce.number().min(1),
  rating: z.coerce.number().min(0).max(5),
  tags: z.array(z.string()),
});

type MovieFormValues = z.infer<typeof movieSchema>;

type AddMovieDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSave: (movie: Movie | Omit<Movie, "id">) => void;
  movieToEdit?: Movie;
};

export const AddMovieDialog = ({ isOpen, setIsOpen, onSave, movieToEdit }: AddMovieDialogProps) => {
  const [tagInput, setTagInput] = React.useState("");
  const [isTagging, setIsTagging] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<MovieFormValues>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      tags: [],
      watchedEpisodes: 0,
      totalEpisodes: 1,
      rating: 0,
      posterUrl: "",
    },
  });

  React.useEffect(() => {
    if (movieToEdit) {
      form.reset(movieToEdit);
    } else {
      form.reset({
        title: "",
        description: "",
        posterUrl: "https://placehold.co/500x750.png",
        type: "Movie",
        status: "Plan to Watch",
        watchedEpisodes: 0,
        totalEpisodes: 1,
        rating: 0,
        tags: [],
      });
    }
  }, [movieToEdit, isOpen, form]);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      const currentTags = form.getValues("tags");
      if (!currentTags.includes(tagInput.trim())) {
        form.setValue("tags", [...currentTags, tagInput.trim()]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };
  
  const handleGenerateTags = async () => {
    const description = form.getValues("description");
    if (!description) {
      toast({
        title: "No Description",
        description: "Please enter a description to generate tags.",
        variant: "destructive",
      });
      return;
    }
    setIsTagging(true);
    try {
      const result = await autoTagMovies({ description });
      const currentTags = form.getValues("tags");
      const newTags = [...new Set([...currentTags, ...result.tags])];
      form.setValue("tags", newTags);
      toast({
        title: "Tags Generated!",
        description: "Smart tags have been added.",
      });
    } catch (error) {
      console.error("Failed to generate tags:", error);
      toast({
        title: "Error",
        description: "Could not generate tags. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTagging(false);
    }
  };


  const onSubmit = (data: MovieFormValues) => {
    if (movieToEdit) {
      onSave({ ...data, id: movieToEdit.id });
    } else {
      onSave(data);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline">{movieToEdit ? "Edit Movie" : "Add Movie"}</DialogTitle>
          <DialogDescription>
            {movieToEdit ? "Update the details of your entry." : "Add a new movie, series, or anime to your collection."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Inception" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A thief who steals corporate secrets..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Movie">Movie</SelectItem>
                          <SelectItem value="TV Show">TV Shows</SelectItem>
                          <SelectItem value="Anime">Anime</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Watching">Watching</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="On-Hold">On-Hold</SelectItem>
                          <SelectItem value="Dropped">Dropped</SelectItem>
                          <SelectItem value="Plan to Watch">Plan to Watch</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            
            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Tags</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={handleGenerateTags} disabled={isTagging}>
                      {isTagging ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      Smart Tag
                    </Button>
                  </div>
                    <FormControl>
                        <Input 
                        placeholder="Add tags and press Enter"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        />
                    </FormControl>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.watch("tags").map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
