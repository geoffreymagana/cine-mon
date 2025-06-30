
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
    ArrowRight, 
    Film, 
    Disc, 
    Code, 
    Users, 
    LineChart, 
    Database, 
    Sun, 
    Bot, 
    Paintbrush, 
    Undo2, 
    Mail, 
    Github, 
    Type, 
    Shuffle, 
    Clapperboard, 
    WifiOff,
    Bell
} from 'lucide-react';
import cineMonLogo from '@/app/assets/logo/cine-mon-logo.png';

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mt-12">
        <h2 className="text-3xl font-bold font-headline text-white mb-6">{title}</h2>
        <div className="space-y-4 text-gray-300 max-w-prose prose prose-lg prose-invert text-gray-300">
            {children}
        </div>
    </div>
);

const FeatureItem = ({ icon: Icon, children }: { icon: React.ElementType, children: React.ReactNode }) => (
    <li className="!flex items-start gap-4 !p-0">
        <Icon className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
        <span>{children}</span>
    </li>
);

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
                    <a href="https://github.com/geoffreymagana/cine-mon" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-300 hover:text-primary transition-colors">GitHub</a>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/app/dashboard" target="_blank" rel="noopener noreferrer">
                        <Button>
                            Go to App <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
                </nav>
            </header>

            <main className="pt-24 pb-20">
                <div className="container mx-auto px-6 py-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h1 className="text-4xl md:text-6xl font-bold font-headline text-white text-glow">About Cine-Mon</h1>
                            <p className="mt-4 text-lg md:text-xl text-gray-300">Your Cinematic Companion. Your Personal Vault.</p>
                        </div>

                        <div className="max-w-prose mx-auto">
                            <Section title="What is Cine-Mon?">
                                <p>
                                    <strong>Cine-Mon</strong> is a personal movie, anime, K-drama, and series tracking app — built for viewers who don’t just watch, but <strong>live inside the story</strong>.
                                </p>
                                <p>
                                    It’s a beautifully designed, offline-first space where you can <strong>archive what you’ve watched</strong>, <strong>plan what’s next</strong>, and <strong>relive what you loved</strong> — on your own terms. Cine-Mon is your personal media journal, not just a watchlist.
                                </p>
                            </Section>

                            <Section title="Why I Built It">
                                <p>
                                    Most watchlist tools just check boxes. But I wanted something deeper — a system that could feel like a <strong>private cinematic museum</strong>. One that could house <strong>scripts, custom posters, rewatch history, analytics</strong>, and even help with decision fatigue through a <strong>smart suggestion wheel</strong>.
                                </p>
                                <p>
                                    And because privacy and ownership matter, <strong>Cine-Mon stores everything locally</strong> — no logins, no tracking, just you and your collection.
                                </p>
                            </Section>

                            <Section title="Made With Intention">
                                 <p>
                                    This project isn’t just software. It’s <strong>my personal love letter to film</strong> — and I’ve hidden small easter eggs throughout the experience for fellow movie lovers to discover.
                                </p>
                                <p>
                                    Every part of Cine-Mon is crafted to feel alive, ambient, and personal — like your own digital film library.
                                </p>
                            </Section>
                            
                            <Section title="About the Developer">
                                <p>
                                    Hi, I'm <strong>Geoffrey Magana</strong> — a developer, designer, and full-time lover of good stories. I built Cine-Mon as a solo project, combining my passion for clean user experience with the kind of tool I wish I had years ago.
                                </p>
                                <p>You can reach out at:</p>
                                 <a href="mailto:geoffreymagana21@gmail.com" className="flex items-center gap-2 text-primary hover:underline">
                                    <Mail className="w-5 h-5" /> <strong>geoffreymagana21@gmail.com</strong>
                                </a>
                                <p className="mt-4">Or fork the project and build your own twist on GitHub:</p>
                                 <a href="https://github.com/geoffreymagana/cine-mon" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                                    <Github className="w-5 h-5" /> <strong>github.com/geoffreymagana/cine-mon</strong>
                                </a>
                            </Section>

                            <Section title="Who Cine-Mon Is For">
                                <ul className="space-y-4 !pl-0 !list-none">
                                    <FeatureItem icon={Clapperboard}>Film buffs, critics, and collectors</FeatureItem>
                                    <FeatureItem icon={Type}>Writers and storytellers</FeatureItem>
                                    <FeatureItem icon={Users}>Series binge-watchers</FeatureItem>
                                    <FeatureItem icon={Disc}>Anime and K-drama enthusiasts</FeatureItem>
                                    <FeatureItem icon={WifiOff}>Digital minimalists who want a private, local-first experience</FeatureItem>
                                    <FeatureItem icon={Film}>Anyone who wants to <strong>archive their watch life with style</strong></FeatureItem>
                                </ul>
                            </Section>

                            <Section title="Core Features">
                                <ul className="space-y-4 !pl-0 !list-none">
                                    <FeatureItem icon={Film}>Personal Watchlist, Favorites, and Rewatch Logs</FeatureItem>
                                    <FeatureItem icon={Shuffle}>Spin-the-Wheel Surprise Picker</FeatureItem>
                                    <FeatureItem icon={Code}>Script Uploads & Notes</FeatureItem>
                                    <FeatureItem icon={LineChart}>Watch Analytics & Category Breakdown</FeatureItem>
                                    <FeatureItem icon={Clapperboard}>Custom Poster Uploads</FeatureItem>
                                    <FeatureItem icon={Database}>Offline-First and Self-Hostable</FeatureItem>
                                    <FeatureItem icon={Sun}>Ambient Dark UI (inspired by cinema lighting)</FeatureItem>
                                </ul>
                            </Section>

                            <Section title="Coming Soon">
                                <ul className="space-y-4 !pl-0 !list-none">
                                    <FeatureItem icon={Bell}>Smart Notifications (Optional)</FeatureItem>
                                    <FeatureItem icon={Bot}>AI-Powered Suggestions</FeatureItem>
                                    <FeatureItem icon={Paintbrush}>More Themes & Customization Options</FeatureItem>
                                    <FeatureItem icon={Undo2}>Backup & Restore Tools</FeatureItem>
                                </ul>
                            </Section>
                            
                            <Section title="Wanna Say Hi?">
                                 <p>
                                    I'd love to hear what you're building with Cine-Mon, how you’re using it, or what scene made you cry last night. Feedback, bug reports, or feature requests — I’m all ears.
                                </p>
                                 <div className="flex flex-col sm:flex-row gap-6 mt-6">
                                    <a href="mailto:geoffreymagana21@gmail.com" className="flex items-center gap-2 text-primary hover:underline font-semibold">
                                        <Mail className="w-5 h-5" /> <span>Email Me</span>
                                    </a>
                                    <a href="https://github.com/geoffreymagana/cine-mon" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline font-semibold">
                                        <Github className="w-5 h-5" /> <span>Fork on GitHub</span>
                                    </a>
                                </div>
                            </Section>
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
                    <Link href="/about" className="hover:text-primary transition-colors">About</Link>
                    <Link href="/legal?tab=terms" className="hover:text-primary transition-colors">Terms</Link>
                    <Link href="/legal?tab=privacy" className="hover:text-primary transition-colors">Privacy</Link>
                    <a href="https://github.com/geoffreymagana/cine-mon" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a>
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
