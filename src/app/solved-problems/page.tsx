'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { AppShell } from '@/components/layout/AppShell'
import { SolvedProblemsClient } from '@/components/SolvedProblemsClient'

export default function SolvedProblemsPage() {
  return (
    <AuthGuard>
      <AppShell
        title="Solved problems"
        subtitle="Your worksheets and preferred behaviors"
      >
        <SolvedProblemsClient />
      </AppShell>
    </AuthGuard>
  )
}
