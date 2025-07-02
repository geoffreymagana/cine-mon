'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, PlusCircle, Trash2, Upload, Sparkles, Loader2, X, ChevronDown } from 'lucide-react';
import type { Movie } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { autoTagMovies } from '@/ai/flows/auto-tag-movies';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { MovieService } from '@/lib/movie-service';
import { getDominantColor } from '@/lib/tmdb';


const castMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  character: z.string().min(1, 'Character is required'),
  avatarUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

const movieEditSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  posterUrl: z.string().url('Must be a valid URL'),
  backdropUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  type: z.enum(['Movie', 'TV Show', 'Anime']),
  status: z.enum(['Watching', 'Completed', 'On-Hold', 'Dropped', 'Plan to Watch']),
  rating: z.coerce.number().min(0).max(100),
  tags: z.array(z.string()),
  releaseDate: z.string().optional(),
  director: z.string().optional(),
  cast: z.array(castMemberSchema).optional(),
  alternatePosters: z.array(z.string().url('Must be a valid URL')).optional(),
  rewatchCount: z.coerce.number().min(0).optional(),
  scriptUrl: z.string().optional().or(z.literal('')),
  collection: z.string().optional(),
  budget: z.coerce.number().min(0).optional(),
  revenue: z.coerce.number().min(0).optional(),
  runtime: z.coerce.number().min(0).optional(),
  productionCountries: z.string().optional(),
  trailerUrl: z.string().optional(),
  dominantColor: z.string().optional(),
});

type MovieEditFormValues = z.infer<typeof movieEditSchema>;

export default function MovieEditPage() {
  const params = useParams();
  const movieId = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const [tagInput, setTagInput] = React.useState('');
  const [isTagging, setIsTagging] = React.useState(false);
  const posterFileInputRef = React.useRef<HTMLInputElement>(null);
  const backdropFileInputRef = React.useRef<HTMLInputElement>(null);
  const alternatePosterFileInputRef = React.useRef<HTMLInputElement>(null);
  const scriptFileInputRef = React.useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [scriptFileName, setScriptFileName] = React.useState<string | null>(null);
  const [isCastOpen, setIsCastOpen] = React.useState(false);


  const form = useForm<MovieEditFormValues>({
    resolver: zodResolver(movieEditSchema),
    defaultValues: {
      title: '',
      description: '',
      posterUrl: '',
      backdropUrl: '',
      type: 'Movie',
      status: 'Plan to Watch',
      releaseDate: '',
      director: '',
      cast: [],
      alternatePosters: [],
      rewatchCount: 0,
      scriptUrl: '',
      collection: '',
      tags: [],
      budget: 0,
      revenue: 0,
      runtime: 0,
      productionCountries: '',
      dominantColor: '',
    }
  });

  const { fields: castFields, append: appendCast, remove: removeCast } = useFieldArray({
    control: form.control,
    name: 'cast',
  });

  const { fields: posterFields, append: appendPoster, remove: removePoster } = useFieldArray({
    control: form.control,
    name: 'alternatePosters',
  });

  React.useEffect(() => {
    if (!movieId) return;
    
    const loadMovie = async () => {
        try {
            const movieToEdit = await MovieService.getMovie(movieId);
            if (movieToEdit) {
                form.reset(movieToEdit);
                if (movieToEdit.scriptUrl?.startsWith('data:')) {
                    setScriptFileName("Uploaded file");
                }
            } else {
                toast({ title: 'Error', description: 'Movie not found.', variant: 'destructive' });
                router.push('/app/dashboard');
            }
        } catch (error) {
            console.error('Failed to load movie from DB:', error);
            toast({ title: 'Error', description: 'Could not load movie data.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };
    
    loadMovie();
  }, [movieId, form, router, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'posterUrl' | 'backdropUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        form.setValue(fieldName, result, { shouldValidate: true });
        if (fieldName === 'posterUrl') {
          const dominantColor = await getDominantColor(result);
          form.setValue('dominantColor', dominantColor);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScriptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedMimeTypes = [
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      const allowedExtensions = ['.pdf', '.docx', '.txt'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!allowedExtensions.includes(fileExtension) || !allowedMimeTypes.includes(file.type)) {
        toast({
            title: "Invalid File Type",
            description: "Please upload a PDF, DOCX, or TXT file.",
            variant: "destructive"
        });
        if (scriptFileInputRef.current) scriptFileInputRef.current.value = "";
        return;
      }
      
      setScriptFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('scriptUrl', reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateTags = async () => {
    const description = form.getValues('description');
    if (!description) {
      toast({ title: 'No Synopsis', description: 'Please enter a synopsis to generate tags.', variant: 'destructive' });
      return;
    }
    setIsTagging(true);
    try {
      const result = await autoTagMovies({ description });
      const currentTags = form.getValues('tags');
      const newTags = [...new Set([...currentTags, ...result.tags])];
      form.setValue('tags', newTags);
      toast({ title: 'Tags Generated!', description: 'Smart tags have been added.' });
    } catch (error) {
      console.error('Failed to generate tags:', error);
      toast({ title: 'Error', description: 'Could not generate tags.', variant: 'destructive' });
    } finally {
      setIsTagging(false);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag) {
        const currentTags = form.getValues("tags");
        if (!currentTags.includes(trimmedTag)) {
            form.setValue("tags", [...currentTags, trimmedTag]);
        }
        setTagInput("");
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags');
    form.setValue('tags', currentTags.filter((tag) => tag !== tagToRemove));
  };


  const onSubmit = async (data: MovieEditFormValues) => {
    if (!movieId) return;

    try {
      const originalMovie = await MovieService.getMovie(movieId);
      if (!originalMovie) {
        throw new Error("Original movie not found");
      }
      
      const updatedMovieData = { 
          ...originalMovie,
          ...data,
      };

      await MovieService.updateMovie(movieId, updatedMovieData);
      toast({ title: 'Success!', description: `${data.title} has been updated.` });
      router.push(`/app/movie/${movieId}`);
    } catch (error) {
      console.error('Failed to save movie:', error);
      toast({ title: 'Error', description: 'Could not save changes.', variant: 'destructive' });
    }
  };
  
  if (isLoading || !movieId) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-background p-4 sm:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <Link href={`/app/movie/${movieId}`} className="inline-flex items-center gap-2 mb-6 font-semibold text-lg hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Details</span>
        </Link>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Main Details</CardTitle>
                <CardDescription>Update the core information for this entry.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <FormField
                        control={form.control}
                        name="posterUrl"
                        render={({ field }) => (
                        <FormItem className="flex flex-col items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                            <FormLabel>Poster</FormLabel>
                            <FormControl>
                            <div className="w-40 h-60 rounded-md overflow-hidden relative border-2 border-dashed border-muted/50 flex items-center justify-center">
                                {field.value && <Image src={field.value} alt="Poster Preview" layout="fill" className="object-cover" data-ai-hint="movie poster"/>}
                            </div>
                            </FormControl>
                            <Button type="button" size="sm" variant="outline" onClick={() => posterFileInputRef.current?.click()}>
                              <Upload className="mr-2 h-4 w-4" /> Change Poster
                            </Button>
                            <input type="file" ref={posterFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'posterUrl')} />
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div className="space-y-4 flex-grow w-full">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl><Input placeholder="Inception" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Synopsis</FormLabel>
                                <FormControl><Textarea placeholder="A thief who steals corporate secrets..." {...field} rows={8} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="type" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                  <SelectItem value="Movie">Movie</SelectItem>
                                  <SelectItem value="TV Show">TV Show</SelectItem>
                                  <SelectItem value="Anime">Anime</SelectItem>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                      </FormItem>
                  )} />
                   <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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
                  )} />
                  <FormField control={form.control} name="releaseDate" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Release Date</FormLabel>
                          <FormControl><Input placeholder="Jul 16, 2010" {...field} value={field.value ?? ''} /></FormControl>
                          <FormMessage />
                      </FormItem>
                  )} />
                  <FormField control={form.control} name="rating" render={({ field }) => (
                      <FormItem className="flex h-full flex-col justify-center gap-2">
                          <FormLabel>Rating: {field.value}%</FormLabel>
                          <FormControl>
                            <Slider defaultValue={[field.value]} onValueChange={(value) => field.onChange(value[0])} max={100} step={1} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )} />
                </div>
                 <FormField
                    control={form.control}
                    name="tags"
                    render={() => (
                        <FormItem>
                        <div className="flex justify-between items-center">
                            <FormLabel>Tags</FormLabel>
                            <Button type="button" variant="outline" size="sm" onClick={handleGenerateTags} disabled={isTagging}>
                            {isTagging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />} Smart Tag
                            </Button>
                        </div>
                            <FormControl>
                                <div className="flex items-center gap-2">
                                    <Input placeholder="Add a tag..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown}/>
                                    <Button type="button" variant="secondary" onClick={handleAddTag}>Add</Button>
                                </div>
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
              </CardContent>
            </Card>

            <Card>
              <Collapsible open={isCastOpen} onOpenChange={setIsCastOpen}>
                <CollapsibleTrigger asChild>
                  <div className="flex w-full cursor-pointer items-center justify-between p-6">
                    <div>
                      <CardTitle>Cast</CardTitle>
                      <CardDescription>Add director and cast members.</CardDescription>
                    </div>
                    <ChevronDown className={cn("h-5 w-5 transition-transform", isCastOpen && "rotate-180")} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-6">
                      <FormField control={form.control} name="director" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Director</FormLabel>
                            <FormControl><Input placeholder="Christopher Nolan" {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                      )} />
                      <div>
                        <FormLabel>Cast</FormLabel>
                        <div className="space-y-4 mt-2">
                          {castFields.map((field, index) => (
                            <div key={field.id} className="flex flex-col md:flex-row gap-2 items-start p-3 border rounded-lg">
                              <FormField control={form.control} name={`cast.${index}.name`} render={({ field }) => (
                                  <FormItem className="flex-1"><FormLabel className="text-xs">Name</FormLabel><FormControl><Input placeholder="Leonardo DiCaprio" {...field} /></FormControl><FormMessage /></FormItem>
                              )}/>
                              <FormField control={form.control} name={`cast.${index}.character`} render={({ field }) => (
                                  <FormItem className="flex-1"><FormLabel className="text-xs">Character</FormLabel><FormControl><Input placeholder="Cobb" {...field} /></FormControl><FormMessage /></FormItem>
                              )}/>
                              <FormField control={form.control} name={`cast.${index}.avatarUrl`} render={({ field }) => (
                                  <FormItem className="flex-1"><FormLabel className="text-xs">Avatar URL</FormLabel><FormControl><Input placeholder="https://..." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                              )}/>
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeCast(index)} className="mt-4"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                            </div>
                          ))}
                          <Button type="button" variant="outline" size="sm" onClick={() => appendCast({ name: '', character: '', avatarUrl: '' })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Cast Member
                          </Button>
                        </div>
                      </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Additional Metrics</CardTitle>
                    <CardDescription>Add financial, runtime, and country details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="budget" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Budget</FormLabel>
                                <FormControl><Input type="number" placeholder="160000000" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="revenue" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Revenue</FormLabel>
                                <FormControl><Input type="number" placeholder="829895144" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="runtime" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Runtime (minutes)</FormLabel>
                                <FormControl><Input type="number" placeholder="148" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                    <FormField control={form.control} name="productionCountries" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Production Countries</FormLabel>
                            <FormControl><Input placeholder="USA, UK" {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Additional Content</CardTitle>
                <CardDescription>Add metadata like collections, scripts, and alternative media.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="collection" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Collection</FormLabel>
                          <FormControl><Input placeholder="The Dark Knight Trilogy" {...field} value={field.value ?? ''} /></FormControl>
                          <FormMessage />
                      </FormItem>
                  )} />
                   <FormField control={form.control} name="rewatchCount" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Rewatch Count</FormLabel>
                          <FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl>
                          <FormMessage />
                      </FormItem>
                  )} />
                </div>
                
                <div className="space-y-2">
                    <FormLabel>Script</FormLabel>
                    <Tabs defaultValue={form.getValues('scriptUrl')?.startsWith('data:') ? 'upload' : 'url'} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="url">Link via URL</TabsTrigger>
                            <TabsTrigger value="upload">Upload File</TabsTrigger>
                        </TabsList>
                        <TabsContent value="url" className="pt-2">
                             <FormField
                                control={form.control}
                                name="scriptUrl"
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            placeholder="https://..."
                                            value={field.value?.startsWith('data:') ? '' : field.value || ''}
                                            onChange={(e) => {
                                                field.onChange(e.target.value);
                                                setScriptFileName(null);
                                                if (scriptFileInputRef.current) scriptFileInputRef.current.value = "";
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </TabsContent>
                        <TabsContent value="upload" className="pt-2">
                             <div className="flex items-center gap-4 rounded-lg border p-3">
                                <Button type="button" variant="outline" onClick={() => scriptFileInputRef.current?.click()}>
                                    <Upload className="mr-2 h-4 w-4" /> Upload
                                </Button>
                                <input
                                    type="file"
                                    ref={scriptFileInputRef}
                                    className="hidden"
                                    accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                                    onChange={handleScriptFileChange}
                                />
                                <div className="flex-grow">
                                    {scriptFileName ? (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="truncate text-muted-foreground">{scriptFileName}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 shrink-0"
                                                onClick={() => {
                                                    form.setValue('scriptUrl', '');
                                                    setScriptFileName(null);
                                                    if (scriptFileInputRef.current) scriptFileInputRef.current.value = "";
                                                }}
                                            >
                                                <X className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Select a PDF, DOCX or TXT file.</p>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
                
                 <FormField control={form.control} name="backdropUrl" render={({ field }) => (
                  <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Backdrop Image</FormLabel>
                        <Button type="button" size="sm" variant="outline" onClick={() => backdropFileInputRef.current?.click()}>
                          <Upload className="mr-2 h-4 w-4" /> Change Backdrop
                        </Button>
                        <input type="file" ref={backdropFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'backdropUrl')} />
                      </div>
                      <FormControl>
                          <div className="w-full aspect-video rounded-md overflow-hidden relative border-2 border-dashed border-muted/50 flex items-center justify-center bg-muted/20">
                              {form.watch('backdropUrl') && <Image src={form.watch('backdropUrl')!} alt="Backdrop Preview" layout="fill" className="object-cover" data-ai-hint="movie background"/>}
                          </div>
                      </FormControl>
                      <FormMessage />
                  </FormItem>
                )} />
                 <div>
                  <FormLabel>Alternate Posters</FormLabel>
                  <div className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {(form.watch('alternatePosters') || []).map((poster, index) => (
                            <div key={poster} className="relative group aspect-[2/3]">
                                <Image
                                    src={poster}
                                    alt={`Alternate Poster ${index + 1}`}
                                    layout="fill"
                                    className="object-cover rounded-md border"
                                    data-ai-hint="movie poster"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => removePoster(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <Button type="button" variant="outline" size="sm" onClick={() => alternatePosterFileInputRef.current?.click()}>
                          <Upload className="mr-2 h-4 w-4" /> Add Poster
                        </Button>
                        <input
                            type="file"
                            ref={alternatePosterFileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    appendPoster(reader.result as string);
                                    if(e.target) e.target.value = "";
                                  };
                                  reader.readAsDataURL(file);
                                }
                            }}
                        />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Link href={`/app/movie/${movieId}`} passHref>
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
