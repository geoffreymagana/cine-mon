
'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileJson, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Movie } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function ExportPage() {
    const { toast } = useToast();
    const [movies, setMovies] = React.useState<Movie[]>([]);

    React.useEffect(() => {
        try {
            const storedMovies = localStorage.getItem('movies');
            if (storedMovies) {
                setMovies(JSON.parse(storedMovies));
            }
        } catch (error) {
            console.error("Failed to access localStorage:", error);
        }
    }, []);

    const handleExport = (format: 'json' | 'csv') => {
        if (movies.length === 0) {
            toast({
                title: "Collection is Empty",
                description: "There is no data to export.",
                variant: 'destructive'
            });
            return;
        }

        let dataStr: string;
        let fileName: string;

        if (format === 'json') {
            dataStr = JSON.stringify(movies, null, 2);
            fileName = 'cinemon-collection.json';
        } else {
            const header = Object.keys(movies[0]).join(',');
            const rows = movies.map(row => 
                Object.values(row).map(value => {
                    if (Array.isArray(value)) {
                        return `"${value.join(';')}"`; // Handle tags array
                    }
                    const strValue = String(value);
                    return `"${strValue.replace(/"/g, '""')}"`; // Escape double quotes
                }).join(',')
            );
            dataStr = [header, ...rows].join('\n');
            fileName = 'cinemon-collection.csv';
        }

        const blob = new Blob([dataStr], { type: `text/${format};charset=utf-8;` });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
            title: "Export Successful!",
            description: `Your collection has been exported as ${fileName}.`,
        });
    }

    return (
        <div className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8">
            <div className="w-full max-w-4xl">
                 <Link href="/dashboard" className="inline-flex items-center gap-2 mb-6 font-semibold text-lg hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5"/>
                    <span>Back to Collection</span>
                </Link>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline">Data Backup / Export</CardTitle>
                        <CardDescription>Export your entire collection. It's your data, after all.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-4">
                        <Button variant="outline" className="w-full" onClick={() => handleExport('json')}>
                            <FileJson className="mr-2"/>
                            Export as JSON
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => handleExport('csv')}>
                            <FileText className="mr-2"/>
                            Export as CSV
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
