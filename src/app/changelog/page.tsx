
import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import cineMonLogo from '@/app/assets/logo/cine-mon-logo.png';
import { ChangelogDisplay } from '@/components/changelog-display';
import { parseChangelog } from '@/lib/changelog';

export const dynamic = 'force-dynamic';

export default async function PublicChangelogPage() {
  const versions = await parseChangelog();
  
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
            <a href="/#features" className="text-sm font-medium text-gray-300 hover:text-primary transition-colors">Features</a>
            <a href="/#testimonials" className="text-sm font-medium text-gray-300 hover:text-primary transition-colors">Testimonials</a>
            <Link href="/about" className="text-sm font-medium text-gray-300 hover:text-primary transition-colors">About</Link>
            <Link href="/changelog" className="text-sm font-medium text-primary transition-colors">Changelog</Link>
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
            <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
                <ChangelogDisplay versions={versions} />
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
              <Link href="/changelog" className="hover:text-primary transition-colors">Changelog</Link>
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
