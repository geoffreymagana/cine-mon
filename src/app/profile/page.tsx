
'use client';

import * as React from 'react';
import Link from "next/link";
import { Moon, Sun, Upload, ArrowLeft } from "lucide-react";

import { ProfileHeader } from "@/components/profile-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

export default function ProfilePage() {
    const [isDarkMode, setIsDarkMode] = React.useState(true);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        // This is for demonstration. A real implementation would use a theme provider.
        document.documentElement.classList.toggle("dark", isDarkMode);
    }, [isDarkMode]);
    
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex min-h-screen w-full bg-muted/40">
            <aside className="hidden w-72 flex-col border-r bg-background sm:flex p-4">
                <div className="flex h-16 items-center mb-4">
                    <Link href="/" className="flex items-center gap-2 font-semibold text-lg hover:text-primary transition-colors">
                        <ArrowLeft className="w-5 h-5"/>
                        Back to Collection
                    </Link>
                </div>
                <nav className="flex flex-col gap-2">
                    <a href="#personal-info" className="font-semibold text-primary px-2 py-1 rounded-md">Profile</a>
                    <a href="#appearance" className="text-muted-foreground hover:text-foreground px-2 py-1 rounded-md">Appearance</a>
                    <a href="#settings" className="text-muted-foreground hover:text-foreground px-2 py-1 rounded-md">Settings</a>
                    <a href="#about" className="text-muted-foreground hover:text-foreground px-2 py-1 rounded-md">About</a>
                    <a href="#help" className="text-muted-foreground hover:text-foreground px-2 py-1 rounded-md">Help & Support</a>
                </nav>
            </aside>
            <div className="flex flex-1 flex-col overflow-auto">
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto grid max-w-5xl gap-8">
                        <ProfileHeader />

                        <Card id="personal-info">
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>Update your name and biography.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" defaultValue="Cine-Mon User" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea id="bio" placeholder="Tell us a little about yourself" rows={3} />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button>Save Changes</Button>
                            </CardFooter>
                        </Card>

                        <Card id="appearance">
                            <CardHeader>
                                <CardTitle>Appearance</CardTitle>
                                <CardDescription>Customize the look and feel of the app.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Accent Color</Label>
                                    <div className="flex gap-3">
                                        <Button aria-label="Purple" variant="outline" size="icon" className="h-8 w-8 rounded-full border-2 border-primary ring-2 ring-primary" style={{ backgroundColor: 'hsl(275, 76%, 58%)' }} />
                                        <Button aria-label="Red" variant="outline" size="icon" className="h-8 w-8 rounded-full" style={{ backgroundColor: 'hsl(347, 77%, 50%)' }} />
                                        <Button aria-label="Green" variant="outline" size="icon" className="h-8 w-8 rounded-full" style={{ backgroundColor: 'hsl(142, 71%, 45%)' }} />
                                        <Button aria-label="Orange" variant="outline" size="icon" className="h-8 w-8 rounded-full" style={{ backgroundColor: 'hsl(38, 92%, 50%)' }} />
                                        <Button aria-label="Blue" variant="outline" size="icon" className="h-8 w-8 rounded-full" style={{ backgroundColor: 'hsl(217, 91%, 60%)' }} />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="dark-mode" className="flex items-center gap-2">
                                        {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                                        <span>Dark Mode</span>
                                    </Label>
                                    <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={setIsDarkMode} />
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card id="settings">
                            <CardHeader>
                                <CardTitle>Settings</CardTitle>
                                <CardDescription>Manage your application preferences.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                      <Label htmlFor="notifications">Movie Night Recommendations</Label>
                                      <p className="text-sm text-muted-foreground">Receive notifications for movie suggestions.</p>
                                    </div>
                                    <Switch id="notifications" />
                                </div>
                                 <div className="flex items-center justify-between">
                                    <div>
                                      <Label>Import Library</Label>
                                      <p className="text-sm text-muted-foreground">Import your collection from a CSV file.</p>
                                    </div>
                                    <Button variant="outline" onClick={handleImportClick}>
                                        <Upload className="mr-2 h-4 w-4" /> Import CSV
                                    </Button>
                                    <input type="file" ref={fileInputRef} className="hidden" accept=".csv" />
                                </div>
                            </CardContent>
                        </Card>

                         <Card id="about">
                            <CardHeader>
                                <CardTitle>About Cine-Mon</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Cine-Mon is your personal movie and series tracker, designed to help you organize what you've watched, what you're watching, and what you want to watch next. Built with Next.js, ShadCN, and Genkit.</p>
                            </CardContent>
                        </Card>

                         <Card id="help">
                            <CardHeader>
                                <CardTitle>Help & Support</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Having trouble? Contact our support team at <a href="mailto:support@cinemon.app" className="text-primary hover:underline">support@cinemon.app</a>.</p>
                            </CardContent>
                        </Card>

                    </div>
                </main>
            </div>
        </div>
    );
}
