'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'UnknownError'

  const messages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'Access denied. You do not have permission to sign in.',
    Verification: 'The sign-in link is no longer valid.',
    CredentialsSignin: 'Invalid email or password. Please try again.',
    Default: 'Something went wrong during authentication.',
    UnknownError: 'Something went wrong during authentication.',
  }

  const message = messages[error] || messages.Default

  return (
    <div className="app-shell min-h-screen flex items-center justify-center p-6">
      <div className="auth-panel w-full max-w-[420px] p-8 text-center space-y-5 animate-fade-up">
        <div className="mx-auto w-10 h-10 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--fg)]">
            Sign-in error
          </h1>
          <p className="mt-2 text-sm text-[var(--fg-muted)]">{message}</p>
          <p className="mt-2 text-[11px] text-[var(--fg-subtle)]">Code: {error}</p>
        </div>
        <Link href="/auth/signin">
          <Button className="w-full">Back to sign in</Button>
        </Link>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="app-shell min-h-screen flex items-center justify-center text-[var(--fg-muted)] text-sm">
          Loading…
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  )
}
