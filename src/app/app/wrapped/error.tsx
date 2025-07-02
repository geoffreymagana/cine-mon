
'use client' 

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect } from 'react';
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])
 
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 text-center">
      <h2 className="text-3xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-8">
        There was an issue loading your Cine-Mon Wrapped. Please try again.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()}>
          Try again
        </Button>
        <Link href="/app/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
