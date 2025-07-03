
"use client";

import * as React from "react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, SidebarFooter, SidebarInset, SidebarGroup, SidebarSeparator } from "@/components/ui/sidebar";
import { LayoutDashboard, LibraryBig, TrendingUp, DownloadCloud } from "lucide-react";
import { usePathname } from "next/navigation";
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
import { migrateFromLocalStorage } from "@/lib/migrate-storage";
import { MovieService } from "@/lib/movie-service";
import { version } from '../../../package.json';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isMobile = useIsMobile();
    
    const [isSpinWheelOpen, setIsSpinWheelOpen] = React.useState(false);
    const [allMovies, setAllMovies] = React.useState<Movie[]>([]);

    const [avatarUrl, setAvatarUrl] = React.useState("https://placehold.co/100x100.png");
    const [name, setName] = React.useState("Cine-Mon User");
    const [username, setUsername] = React.useState("cinemon_user");
    
    // This will check if the current page is a movie detail or edit page
    const isImmersivePage = pathname.startsWith('/app/movie') || pathname.startsWith('/app/canvas') || pathname.startsWith('/app/wrapped');
    
    const loadData = React.useCallback(async () => {
        const movies = await MovieService.getMovies();
        setAllMovies(movies);

        const [profileName, profileUsername, profileAvatar] = await Promise.all([
            MovieService.getSetting('profileName'),
            MovieService.getSetting('profileUsername'),
            MovieService.getSetting('profileAvatar')
        ]);
        
        if (profileName) setName(profileName);
        if (profileUsername) setUsername(profileUsername);
        if (profileAvatar) setAvatarUrl(profileAvatar);
    }, []);

    React.useEffect(() => {
        const runMigration = async () => {
            await migrateFromLocalStorage();
            loadData(); // Load data after migration
        };
        runMigration();

        // Listen for custom event to reload profile data
        const handleProfileUpdate = () => loadData();
        window.addEventListener('profileUpdated', handleProfileUpdate);
        return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
    }, [loadData]);

    if (isImmersivePage) {
        // Render immersive pages without the main sidebar for a full-screen experience.
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
                    <SidebarGroup>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton href="/app/dashboard" tooltip="Dashboard" isActive={pathname.startsWith('/app/dashboard')}>
                                    <LayoutDashboard />
                                    <span>Dashboard</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton href="/app/collections" tooltip="Collections" isActive={pathname.startsWith('/app/collections')}>
                                    <LibraryBig />
                                    <span>Collections</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <SidebarMenuButton href="/app/canvas" tooltip="Canvas" isActive={pathname.startsWith('/app/canvas')}>
                                    <LayoutDashboard />
                                    <span>Canvas</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton href="/app/analytics" tooltip="Analytics" isActive={pathname.startsWith('/app/analytics')}>
                                    <TrendingUp />
                                    <span>Analytics</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <SidebarMenuButton href="/app/export" tooltip="Backup & Export" isActive={pathname.startsWith('/app/export')}>
                                    <DownloadCloud />
                                    <span>Backup & Export</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>
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
                    <p className="px-4 py-2 text-center text-xs text-muted-foreground">v{version}</p>
                </SidebarFooter>
            </Sidebar>

            <TooltipProvider>
              <SidebarInset>
                {children}
              </SidebarInset>
            </TooltipProvider>

            {isMobile && <BottomNav onSurpriseMeClick={() => setIsSpinWheelOpen(true)} />}

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
