
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
                            <TabsContent value="terms" className="mt-4 prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-4">
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
                            <TabsContent value="privacy" className="mt-4 prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-4">
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
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
