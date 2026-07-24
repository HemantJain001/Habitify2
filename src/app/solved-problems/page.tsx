'use client'

import { useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { SolvedProblemsClient } from '@/components/SolvedProblemsClient'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { ProblemSolvingModal } from '@/components/ProblemSolvingModal'
import { SimpleBehaviorModal } from '@/components/SimpleBehaviorModal'
import { useUserStats } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

export default function SolvedProblemsPage() {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [problemSolvingOpen, setProblemSolvingOpen] = useState(false)
  const [trackYourselfOpen, setTrackYourselfOpen] = useState(false)
  const { data: statsData } = useUserStats()

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-500">
        <Sidebar
          onOpenDashboard={() => router.push('/')}
          onOpenProblemSolving={() => setProblemSolvingOpen(true)}
          onOpenTrackYourself={() => setTrackYourselfOpen(true)}
          onOpenJournal={() => router.push('/?journal=true')}
          onOpenSolvedProblems={() => router.push('/solved-problems')}
          onCollapseChange={setSidebarCollapsed}
        />

        <div
          className={`layout-transition ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}
        >
          <TopBar
            streak={statsData?.streak ?? 0}
            onOpenJournal={() => router.push('/?journal=true')}
          />

          <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SolvedProblemsClient />
          </main>
        </div>

        <ProblemSolvingModal
          isOpen={problemSolvingOpen}
          onClose={() => setProblemSolvingOpen(false)}
        />
        <SimpleBehaviorModal
          isOpen={trackYourselfOpen}
          onClose={() => setTrackYourselfOpen(false)}
        />
      </div>
    </AuthGuard>
  )
}
