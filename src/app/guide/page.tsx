
'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clapperboard, Film, Popcorn, Plus, Shuffle, Tv } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

export default function GuidePage() {
    return (
        <div className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8">
            <div className="w-full max-w-4xl">
                 <Link href="/dashboard" className="inline-flex items-center gap-2 mb-6 font-semibold text-lg hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5"/>
                    <span>Back to Collection</span>
                </Link>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline">Getting Started Guide</CardTitle>
                        <CardDescription>Learn how to get the most out of Cine-Mon.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="text-lg font-semibold">How do I add a new movie or show?</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground space-y-2">
                                    <p>It's easy! From the main collection page, just click the <Button size="sm" variant="outline" className="inline-flex pointer-events-none h-auto p-1"><Plus className="h-3 w-3 mr-1"/> Add Movie</Button> button at the top right.</p>
                                    <p>A dialog will appear where you can enter the title, a description, and other details. Our "Smart Tag" feature can even generate relevant tags for you based on the description!</p>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger className="text-lg font-semibold">What are the different filters for?</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground space-y-2">
                                    <p>The sidebar on the left lets you filter your collection to quickly find what you're looking for. You can view:</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><Clapperboard className="inline-block mr-2 h-4 w-4"/><strong>All:</strong> Shows every item in your collection.</li>
                                        <li><Film className="inline-block mr-2 h-4 w-4"/><strong>Movies:</strong> Only shows items you've marked as a movie.</li>
                                        <li><Tv className="inline-block mr-2 h-4 w-4"/><strong>TV Shows:</strong> Only shows TV series.</li>
                                        <li><Popcorn className="inline-block mr-2 h-4 w-4"/><strong>Anime:</strong> Filters for all your anime series and films.</li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger className="text-lg font-semibold">What does "Surprise Me" do?</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground space-y-2">
                                    <p>Can't decide what to watch? Click the <Button size="sm" variant="outline" className="inline-flex pointer-events-none h-auto p-1"><Shuffle className="h-3 w-3 mr-1"/> Surprise Me</Button> button in the sidebar.</p>
                                    <p>It opens a "spin the wheel" dialog that randomly selects an item from your entire collection, helping you discover something to watch when you're feeling indecisive.</p>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-4">
                                <AccordionTrigger className="text-lg font-semibold">How can I import my existing collection?</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground space-y-2">
                                    <p>You can import your library from a CSV file. Go to your Profile page, find the "Settings" card, and click the "Import CSV" button. This will open a file dialog for you to select your file.</p>
                                    <p>Please ensure your CSV has columns for `title`, `description`, `type`, `status`, and other relevant fields.</p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
