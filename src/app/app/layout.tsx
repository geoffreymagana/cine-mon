
"use client";

import * as React from "react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, SidebarFooter, SidebarInset, SidebarGroup, SidebarSeparator } from "@/components/ui/sidebar";
import { Film, Tv, Clapperboard, Shuffle, Popcorn, Sparkles } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { BottomNav } from "@/components/bottom-nav";
import Image from "next/image";
import cineMonLogo from '@/app/assets/logo/cine-mon-logo.png';
import { TooltipProvider } from "@/components/ui/tooltip";
import { SpinWheelDialog } from "@/components/spin-wheel-dialog";
import type { Movie } from "@/lib/types";
import { Suspense } from "react";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const isMobile = useIsMobile();
    
    const [isSpinWheelOpen, setIsSpinWheelOpen] = React.useState(false);
    const [allMovies, setAllMovies] = React.useState<Movie[]>([]);

    const [avatarUrl, setAvatarUrl] = React.useState("https://placehold.co/100x100.png");
    const [name, setName] = React.useState("Cine-Mon User");
    const [username, setUsername] = React.useState("cinemon_user");
    
    const filter = searchParams.get('filter') || 'All';

    // This will check if the current page is a movie detail or edit page
    const isMoviePage = pathname.startsWith('/app/movie');
    
    React.useEffect(() => {
        try {
            const storedMovies = localStorage.getItem('movies');
            if (storedMovies) setAllMovies(JSON.parse(storedMovies));

            const storedAvatar = localStorage.getItem('profileAvatar');
            if (storedAvatar) setAvatarUrl(storedAvatar);

            const storedName = localStorage.getItem('profileName');
            if (storedName) setName(storedName);

            const storedUsername = localStorage.getItem('profileUsername');
            if (storedUsername) setUsername(storedUsername);

        } catch (error) {
            console.error("Failed to access localStorage:", error);
        }
        
        const handleProfileUpdate = () => {
             const storedName = localStorage.getItem('profileName');
             if (storedName) setName(storedName);
             const storedUsername = localStorage.getItem('profileUsername');
             if (storedUsername) setUsername(storedUsername);
             const storedAvatar = localStorage.getItem('profileAvatar');
             if (storedAvatar) setAvatarUrl(storedAvatar);
        }
        window.addEventListener('profileUpdated', handleProfileUpdate);
        return () => window.removeEventListener('profileUpdated', handleProfileUpdate);

    }, []);

    const setFilter = (newFilter: string) => {
        router.push(`/app/dashboard?filter=${newFilter}`);
    };
    
    if (isMoviePage) {
        // Render movie pages without the main sidebar for a full-screen experience.
        // We still need the TooltipProvider for components on this page.
        return (
            <TooltipProvider>
              {children}
            </TooltipProvider>
        );
    }

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                <div className="flex items-center gap-2 p-2">
                    <Image src={cineMonLogo} alt="Cine-Mon Logo" width={32} height={32} data-ai-hint="logo" />
                    <h1 className="text-2xl font-headline font-bold">Cine-Mon</h1>
                </div>
                </SidebarHeader>
                <SidebarContent>
                {!isMobile && (
                    <>
                        <SidebarGroup>
                        <SidebarMenu>
                            <SidebarMenuItem>
                            <SidebarMenuButton onClick={() => setIsSpinWheelOpen(true)} tooltip="Suggest something to watch">
                                <Shuffle />
                                <span>Surprise Me</span>
                            </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                        </SidebarGroup>
                        <SidebarSeparator />
                        <SidebarGroup>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton onClick={() => router.push('/app/collections')} tooltip="My Vaults & Spotlights" isActive={pathname.startsWith('/app/collections')}>
                                        <Sparkles />
                                        <span>Collections</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroup>
                        <SidebarSeparator />
                        <SidebarGroup>
                        <SidebarMenu>
                            <SidebarMenuItem>
                            <SidebarMenuButton isActive={filter === 'All' && pathname.startsWith('/app/dashboard')} onClick={() => setFilter('All')}>
                                <Clapperboard />
                                <span>All</span>
                            </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                            <SidebarMenuButton isActive={filter === 'Movie'} onClick={() => setFilter('Movie')}>
                                <Film />
                                <span>Movies</span>
                            </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                            <SidebarMenuButton isActive={filter === 'TV Show'} onClick={() => setFilter('TV Show')}>
                                <Tv />
                                <span>TV Shows</span>
                            </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                            <SidebarMenuButton isActive={filter === 'Anime'} onClick={() => setFilter('Anime')}>
                                <Popcorn />
                                <span>Anime</span>
                            </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                        </SidebarGroup>
                        <SidebarSeparator />
                    </>
                    )}
                </SidebarContent>
                {!isMobile && (
                    <SidebarFooter>
                        <div className="p-2">
                            <Link href="/app/profile">
                                <Button variant="ghost" className="w-full justify-start h-auto p-2">
                                    <Avatar className="h-10 w-10 mr-3">
                                        <AvatarImage src={avatarUrl} alt="User Avatar" data-ai-hint="person portrait"/>
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col items-start">
                                        <span className="font-semibold">{name}</span>
                                        <span className="text-xs text-muted-foreground">@{username}</span>
                                    </div>
                                </Button>
                            </Link>
                        </div>
                    </SidebarFooter>
                )}
            </Sidebar>

            <TooltipProvider>
              <SidebarInset>
                {children}
              </SidebarInset>
            </TooltipProvider>

            {isMobile && pathname === '/app/dashboard' && <BottomNav filter={filter as any} setFilter={setFilter} onSurpriseMeClick={() => setIsSpinWheelOpen(true)} />}

            <SpinWheelDialog
                isOpen={isSpinWheelOpen}
                setIsOpen={setIsSpinWheelOpen}
                movies={allMovies}
            />
        </SidebarProvider>
    );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <AppLayoutContent>{children}</AppLayoutContent>
    </Suspense>
  )
}
