"use client"

import { useSession } from "next-auth/react"
import { ReactNode } from "react"

interface AuthGuardProps {
  children: ReactNode
}

/**
 * Client UX layer after `src/middleware.ts` has already enforced auth.
 *
 * Middleware redirects unauthenticated page traffic and returns 401 on
 * protected APIs. This component only waits for session hydration so
 * child hooks (TanStack Query, useSession) do not flash empty UI.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { status } = useSession()

  if (status === "loading") {
    return (
      <div className="app-shell min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="mx-auto h-9 w-9 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
          <p className="text-sm text-[var(--fg-muted)]">Loading AttackMode…</p>
        </div>
      </div>
    )
  }

  // Middleware should have redirected; keep a safe empty render if session
  // is briefly missing during client navigation.
  if (status === "unauthenticated") {
    return null
  }

  return <>{children}</>
}
