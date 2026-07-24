'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { TopBar } from '@/components/TopBar'
import { StatsDashboard } from '@/components/StatsDashboard'
import { Sidebar } from '@/components/Sidebar'
import { useUserStats } from '@/lib/hooks'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function StatsPage() {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { data: statsData } = useUserStats()
  const streak = statsData?.streak ?? 0

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar
          onOpenDashboard={() => router.push('/')}
          onOpenJournal={() => router.push('/?journal=true')}
          onOpenSolvedProblems={() => router.push('/solved-problems')}
          onCollapseChange={(collapsed: boolean) => setSidebarCollapsed(collapsed)}
        />

        <div
          className={`transition-all duration-300 ${
            sidebarCollapsed ? 'ml-0 lg:ml-16' : 'ml-0 lg:ml-64'
          }`}
        >
          <TopBar
            streak={streak}
            onOpenJournal={() => router.push('/?journal=true')}
          />

          <main className="p-6">
            <StatsDashboard />
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
