
'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, DownloadCloud, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MovieService } from '@/lib/movie-service';
import { format } from 'date-fns';

export default function ExportPage() {
    const { toast } = useToast();
    const [isExporting, setIsExporting] = React.useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        toast({
            title: "Preparing Backup...",
            description: "Gathering all your data. This may take a moment.",
        });

        try {
            const allData = await MovieService.exportAllData();
            
            if (allData.movies.length === 0 && allData.collections.length === 0 && allData.canvases.length === 0) {
                 toast({
                    title: "Library is Empty",
                    description: "There is no data to create a backup from.",
                    variant: 'destructive'
                });
                setIsExporting(false);
                return;
            }
            
            const backupObject = {
                format: 'CineMon-Backup',
                version: '2.0',
                exportedAt: new Date().toISOString(),
                data: allData,
            };

            const dataStr = JSON.stringify(backupObject, null, 2);
            const fileName = `cinemon-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
            
            const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                title: "Backup Successful!",
                description: `Your full backup file '${fileName}' has been downloaded.`,
            });
        } catch (error) {
            console.error("Failed to export data:", error);
            toast({
                title: "Export Failed",
                description: "Could not generate your backup file.",
                variant: "destructive"
            });
        } finally {
            setIsExporting(false);
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8">
            <div className="w-full max-w-4xl">
                 <Link href="/app/dashboard" className="inline-flex items-center gap-2 mb-6 font-semibold text-lg hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5"/>
                    <span>Back to Dashboard</span>
                </Link>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline">Full Data Backup</CardTitle>
                        <CardDescription>
                            Create a complete backup of your entire Cine-Mon library. This includes all your titles, collections, canvases, and settings. Keep this file in a safe place.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" onClick={handleExport} disabled={isExporting}>
                            {isExporting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <DownloadCloud className="mr-2"/>
                            )}
                            {isExporting ? 'Generating Backup...' : 'Download Full Backup (JSON)'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
