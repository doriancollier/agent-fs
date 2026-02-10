'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()
  return (
    <div className="container-default flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-16">
      <div className="mx-auto max-w-md space-y-6 text-center">
        {/* 404 indicator */}
        <div className="space-y-2">
          <p className="text-7xl font-bold text-muted-foreground/30">404</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Page not found
          </h1>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button render={<Link href="/" />} nativeButton={false}>
            <Home className="mr-2 size-4" />
            Go home
          </Button>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="cursor-pointer"
          >
            <ArrowLeft className="mr-2 size-4" />
            Go back
          </Button>
        </div>
      </div>
    </div>
  )
}
