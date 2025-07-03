import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeInitializer } from '@/components/theme-initializer';
import { Inter, Space_Grotesk, Kalam } from 'next/font/google';
import { cn } from '@/lib/utils';

const fontInter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const fontSpaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

const fontKalam = Kalam({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-kalam',
});


export const metadata: Metadata = {
  title: 'Cine-Mon',
  description: 'Your personal movie and series tracker.',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#09091a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body 
        className={cn(
          "font-body antialiased",
          fontInter.variable,
          fontSpaceGrotesk.variable,
          fontKalam.variable
        )} 
        suppressHydrationWarning
      >
        <ThemeInitializer />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
