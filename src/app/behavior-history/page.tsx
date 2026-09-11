'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { AppShell } from '@/components/layout/AppShell'
import { BehaviorHistoryClient } from '@/components/BehaviorHistoryClient'

export default function BehaviorHistoryPage() {
  return (
    <AuthGuard>
      <AppShell
        title="Behavior history"
        subtitle="Review what you logged and when"
      >
        <BehaviorHistoryClient />
      </AppShell>
    </AuthGuard>
  )
}
