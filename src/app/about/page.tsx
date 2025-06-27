'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import cineMonLogo from '@/app/assets/logo/cine-mon-logo.png';

export default function AboutPage() {
    return (
        <div className="bg-black text-gray-100 font-body antialiased">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2">
                    <Image src={cineMonLogo} alt="Cine-Mon Logo" width={32} height={32} data-ai-hint="logo" />
                    <span className="text-xl font-bold font-headline">Cine-Mon</span>
                </Link>
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/#features" className="text-sm font-medium text-gray-300 hover:text-primary transition-colors">Features</Link>
                    <Link href="/#testimonials" className="text-sm font-medium text-gray-300 hover:text-primary transition-colors">Testimonials</Link>
                    <Link href="/about" className="text-sm font-medium text-primary transition-colors">About</Link>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-300 hover:text-primary transition-colors">GitHub</a>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" target="_blank" rel="noopener noreferrer">
                        <Button>
                            Go to App <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
                </nav>
            </header>

            <main className="pt-24 pb-20">
                <div className="container mx-auto px-6 py-12">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="mx-auto mb-8">
                            <Image src={cineMonLogo} alt="Cine-Mon Logo" width={80} height={80} data-ai-hint="logo" className="mx-auto" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold font-headline text-white text-glow">About Cine-Mon</h1>
                        <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">Your personal movie and series tracker.</p>
                        
                        <div className="mt-12 space-y-6 text-left text-gray-300 max-w-prose mx-auto prose prose-lg prose-invert">
                            <p>
                                Cine-Mon is a beautifully designed application to help you keep track of every movie, TV show, and anime you watch. Organize your collection, discover new titles, and never forget what you wanted to watch next.
                            </p>
                            <p>
                                Built with passion by developers who love cinema, using Next.js, ShadCN UI, Tailwind CSS, and the generative AI power of Google's Genkit.
                            </p>
                            <p className="text-sm pt-4">
                                Data and posters provided by various public APIs. All trademarks and logos are the property of their respective owners.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-black border-t border-gray-800">
                <div className="container mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <Image src={cineMonLogo} alt="Cine-Mon Logo" width={24} height={24} data-ai-hint="logo" />
                        <span className="text-lg font-bold">Cine-Mon</span>
                    </div>
                    <div className="flex gap-6 text-gray-400">
                    <Link href="/legal?tab=terms" className="hover:text-primary transition-colors">Terms</Link>
                    <Link href="/legal?tab=privacy" className="hover:text-primary transition-colors">Privacy</Link>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a>
                    <a href="mailto:geoffreymagana21@gmail.com" className="hover:text-primary transition-colors">Contact</a>
                    </div>
                </div>
                <div className="text-center text-gray-500 text-sm mt-8">
                    &copy; {new Date().getFullYear()} Cine-Mon. All Rights Reserved.
                </div>
                </div>
            </footer>
        </div>
    );
}