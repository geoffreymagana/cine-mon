'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import cineMonLogo from '@/app/assets/logo/cine-mon-logo.png';

export default function AboutPage() {
    return (
        <div className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8">
            <div className="w-full max-w-4xl">
                 <Link href="/profile" className="inline-flex items-center gap-2 mb-6 font-semibold text-lg hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5"/>
                    <span>Back to Profile</span>
                </Link>
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4">
                            <Image src={cineMonLogo} alt="Cine-Mon Logo" width={64} height={64} data-ai-hint="logo" />
                        </div>
                        <CardTitle className="text-3xl font-headline">About Cine-Mon</CardTitle>
                        <CardDescription>Your personal movie and series tracker.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 text-center text-muted-foreground">
                        <p>
                            Cine-Mon is a beautifully designed application to help you keep track of every movie, TV show, and anime you watch. Organize your collection, discover new titles, and never forget what you wanted to watch next.
                        </p>
                        <p>
                            Built with passion by developers who love cinema, using Next.js, ShadCN UI, Tailwind CSS, and the generative AI power of Google's Genkit.
                        </p>
                        <p className="text-xs pt-4">
                            Data and posters provided by various public APIs. All trademarks and logos are the property of their respective owners.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
