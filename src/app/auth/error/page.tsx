'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm text-center space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Sign-in error
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
        <p className="text-xs text-gray-400">Code: {error}</p>
        <Link
          href="/auth/signin"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          Loading…
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  )
}
