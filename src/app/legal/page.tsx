'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import cineMonLogo from '@/app/assets/logo/cine-mon-logo.png';

function LegalPageContent() {
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || 'terms';

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
                        <Link href="/about" className="text-sm font-medium text-gray-300 hover:text-primary transition-colors">About</Link>
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
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl md:text-6xl font-bold font-headline text-white text-glow">Terms & Privacy</h1>
                            <p className="mt-4 text-lg md:text-xl text-gray-300">Legal information about using Cine-Mon.</p>
                        </div>
                        
                        <Tabs defaultValue={tab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 border border-primary/20">
                                <TabsTrigger value="terms">Terms of Service</TabsTrigger>
                                <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
                            </TabsList>
                            <TabsContent value="terms" className="mt-8 prose prose-lg dark:prose-invert max-w-none text-gray-400 space-y-4">
                                <p className="text-sm italic">Last updated: June 27, 2025</p>
                                
                                <div>
                                    <h3>1. Acceptance of Terms</h3>
                                    <p>By installing or using Cine-Mon, you agree to be bound by these Terms of Service. If you do not agree, you should not use or deploy the app.</p>
                                </div>
                                
                                <div>
                                    <h3>2. Intended Use</h3>
                                    <p>Cine-Mon is a personal media tracking tool, not a streaming service. It is designed to help you catalog and manage content you’ve watched or plan to watch.</p>
                                    <p>The app supports movies, TV series, anime, K-dramas, short films, and other screen media.</p>
                                    <p>Cine-Mon is self-hosted and/or offline-first by design. You are fully responsible for managing your own installation and data.</p>
                                </div>
                                
                                <div>
                                    <h3>3. User Responsibilities</h3>
                                    <p>You agree not to use Cine-Mon to:</p>
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        <li>Violate any laws or copyright regulations (e.g., uploading pirated scripts or copyrighted media).</li>
                                        <li>Distribute or publicly host copyrighted content through your installation.</li>
                                        <li>Abuse any integrated third-party services such as TMDB, Trakt, or AniList in ways that violate their terms.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3>4. Third-Party Services</h3>
                                    <p>Cine-Mon may optionally integrate with external APIs such as:</p>
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        <li>The Movie Database (TMDB)</li>
                                        <li>AniList or Jikan (for anime)</li>
                                        <li>Trakt (for trending content and suggestions)</li>
                                    </ul>
                                    <p className="mt-2">Use of these services is subject to their own terms. Cine-Mon does not control how these services process data or handle usage limits.</p>
                                </div>

                                <div>
                                    <h3>5. Modifications and Updates</h3>
                                    <p>This app is under continuous improvement. Features, functionality, or design may change without notice. You will be informed of major updates in the Changelog section.</p>
                                </div>

                                <div>
                                    <h3>6. Warranty Disclaimer</h3>
                                    <p>Cine-Mon is provided "as is," without warranty of any kind. Use it at your own risk. The developers are not responsible for data loss, misuse, or third-party service outages.</p>
                                </div>

                                <div>
                                    <h3>7. Termination</h3>
                                    <p>You may stop using Cine-Mon at any time by uninstalling it or deleting your hosted instance. Since this is a self-managed tool, no formal account termination process is required.</p>
                                </div>

                                <div>
                                    <h3>8. Contact</h3>
                                    <p>For feedback, feature requests, or legal questions: geoffreymagana21@gmail.com</p>
                                </div>
                            </TabsContent>
                            <TabsContent value="privacy" className="mt-8 prose prose-lg dark:prose-invert max-w-none text-gray-400 space-y-4">
                                <p className="text-sm italic">Last updated: June 27, 2025</p>
                                
                                <div>
                                    <h3>1. Your Privacy Matters</h3>
                                    <p>Cine-Mon is built with privacy in mind. We do not collect, track, or store any personal information on any remote server unless explicitly configured by you.</p>
                                </div>
                                
                                <div>
                                    <h3>2. Local-First Design</h3>
                                    <p>All user data — including movies, watch history, notes, tags, favorites, and uploads — is stored locally in your browser (via IndexedDB) or on your own server.</p>
                                    <p>The app works entirely offline by default. No automatic syncing or cloud backup occurs unless you explicitly enable and configure it.</p>
                                </div>

                                <div>
                                    <h3>3. Data We Do Not Collect</h3>
                                    <ul className="list-none pl-0 mt-2 space-y-1">
                                        <li>❌ No account creation</li>
                                        <li>❌ No analytics or telemetry</li>
                                        <li>❌ No IP logging or tracking</li>
                                        <li>❌ No cookie-based advertising</li>
                                    </ul>
                                </div>
                                
                                <div>
                                    <h3>4. Optional API Usage</h3>
                                    <p>If you choose to enable external APIs (e.g., TMDB, Trakt, AniList), some information (e.g., your IP, search queries, device info) may be processed by those services according to their own privacy policies.</p>
                                    <p className="mt-2">We encourage you to review them:</p>
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        <li>TMDB Privacy Policy</li>
                                        <li>Trakt Privacy Policy</li>
                                        <li>AniList Terms & Privacy</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3>5. Your Data, Your Control</h3>
                                    <p>You own your data and can export, back up, or delete it at any time.</p>
                                    <p>If you self-host Cine-Mon or use cloud sync options, you are responsible for securing your environment.</p>
                                </div>
                                
                                <div>
                                    <h3>6. Security Notice</h3>
                                    <p>Cine-Mon does not include encryption or authentication out of the box.</p>
                                    <p>If deploying in a shared or public environment, we recommend setting up security layers (SSL, encryption, access control).</p>
                                </div>

                                <div>
                                    <h3>7. Policy Updates</h3>
                                    <p>This privacy policy may change as the app evolves. You will be notified of significant changes via the app’s changelog or notification system (if enabled).</p>
                                </div>
                                
                                <div>
                                    <h3>8. Contact</h3>
                                    <p>Questions about this privacy policy? geoffreymagana21@gmail.com</p>
                                </div>
                            </TabsContent>
                        </Tabs>
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

export default function LegalPage() {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <LegalPageContent />
        </React.Suspense>
    )
}