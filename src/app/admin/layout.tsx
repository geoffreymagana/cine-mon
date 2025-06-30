
'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Inbox, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import cineMonLogo from '@/app/assets/logo/cine-mon-logo.png';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);

    React.useEffect(() => {
        try {
            const isAdmin = sessionStorage.getItem('isAdminAuthenticated') === 'true';
            setIsAuthenticated(isAdmin);
            if (!isAdmin && pathname !== '/admin/login') {
                router.replace('/admin/login');
            }
        } catch (e) {
             if (pathname !== '/admin/login') {
                router.replace('/admin/login');
            }
        } finally {
            setIsCheckingAuth(false);
        }
    }, [pathname, router]);

    const handleLogout = () => {
        sessionStorage.removeItem('isAdminAuthenticated');
        router.push('/admin/login');
    };

    if (pathname === '/admin/login') {
        return <>{children}</>;
    }
    
    if (isCheckingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return null; // Redirect is happening
    }

    return (
        <div className="flex min-h-screen">
            <aside className="w-64 flex-shrink-0 border-r bg-muted/20 p-4 flex flex-col">
                <div className="flex items-center gap-2 p-2 mb-8">
                    <Image src={cineMonLogo} alt="Cine-Mon Logo" width={32} height={32} data-ai-hint="logo" />
                    <h1 className="text-xl font-headline font-bold">Admin Panel</h1>
                </div>
                <nav className="flex flex-col gap-2 flex-grow">
                    <Link href="/admin/feedback" passHref>
                        <Button variant={pathname === '/admin/feedback' ? 'secondary' : 'ghost'} className="justify-start">
                            <Inbox className="mr-2" />
                            Feedback
                        </Button>
                    </Link>
                </nav>
                 <div>
                    <Button variant="ghost" className="justify-start w-full mb-2" onClick={() => router.push('/app/dashboard')}>
                        Back to App
                    </Button>
                    <Button variant="destructive" className="justify-start w-full" onClick={handleLogout}>
                        <LogOut className="mr-2" />
                        Logout
                    </Button>
                 </div>
            </aside>
            <main className="flex-1 p-8 bg-background">
                {children}
            </main>
        </div>
    );
}
