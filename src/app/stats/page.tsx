'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { AppShell } from '@/components/layout/AppShell'
import { StatsDashboard } from '@/components/StatsDashboard'

export default function StatsPage() {
  return (
    <AuthGuard>
      <AppShell
        title="Statistics"
        subtitle="Patterns across tasks and identities"
      >
        <StatsDashboard />
      </AppShell>
    </AuthGuard>
  )
}
