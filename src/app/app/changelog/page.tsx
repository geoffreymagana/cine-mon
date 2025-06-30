
import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ChangelogDisplay } from '@/components/changelog-display';
import { parseChangelog } from '@/lib/changelog';

export default async function ChangelogPage() {
  const versions = await parseChangelog();
  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8">
        <div className="w-full max-w-4xl">
            <Link href="/app/dashboard" className="inline-flex items-center gap-2 mb-8 font-semibold text-lg hover:text-primary transition-colors">
                <ArrowLeft className="w-5 h-5"/>
                <span>Back to Collection</span>
            </Link>
            <ChangelogDisplay versions={versions} />
        </div>
    </div>
  );
}
