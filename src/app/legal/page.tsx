
'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LegalPage() {
    return (
        <div className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8">
            <div className="w-full max-w-4xl">
                 <Link href="/profile" className="inline-flex items-center gap-2 mb-6 font-semibold text-lg hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5"/>
                    <span>Back to Profile</span>
                </Link>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline">Terms & Privacy</CardTitle>
                        <CardDescription>Legal information about using Cine-Mon.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="terms" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="terms">Terms of Service</TabsTrigger>
                                <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
                            </TabsList>
                            <TabsContent value="terms" className="mt-4 prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                                <h3>1. Acceptance of Terms</h3>
                                <p>By accessing and using Cine-Mon, you accept and agree to be bound by the terms and provision of this agreement. This is a demo application and should be used for educational purposes only.</p>
                                <h3>2. Description of Service</h3>
                                <p>Cine-Mon is a personal media tracker. The service is provided "as-is" without warranties of any kind.</p>
                                <h3>3. User Conduct</h3>
                                <p>You are responsible for all the content you add to your collection. Do not upload or add any illegal or infringing content.</p>
                            </TabsContent>
                            <TabsContent value="privacy" className="mt-4 prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                                <h3>1. Information Collection</h3>
                                <p>Cine-Mon is a local-first application. All data you enter (movie titles, tags, etc.) is stored in your browser's local state and is not transmitted to our servers unless you use a feature that requires it (e.g., AI-tagging).</p>
                                <h3>2. AI Features</h3>
                                <p>When using features like "Smart Tag," the description you provide is sent to a third-party AI service (Google Gemini) to generate tags. No other personal data is sent.</p>
                                <h3>3. Data Security</h3>
                                <p>We do not store your personal collection data. For backup purposes, you can use the export feature to save your data locally.</p>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
