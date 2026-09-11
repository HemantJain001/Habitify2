'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AICoach } from '@/components/AICoach'
import { CalendarModal } from '@/components/CalendarModal'
import { ProblemSolvingModal } from '@/components/ProblemSolvingModal'
import { SimpleBehaviorModal } from '@/components/SimpleBehaviorModal'
import { useJournalEntries, usePowerSystemTodos, useUserStats } from '@/lib/hooks'

type AppChromeContextValue = {
  darkMode: boolean
  toggleDarkMode: () => void
  streak: number
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
  openCoach: () => void
  openCalendar: () => void
  openTrack: () => void
  openProblem: () => void
  openJournal: () => void
  goHome: () => void
}

const AppChromeContext = createContext<AppChromeContextValue | null>(null)

export function useAppChrome() {
  const ctx = useContext(AppChromeContext)
  if (!ctx) {
    throw new Error('useAppChrome must be used within AppChromeProvider')
  }
  return ctx
}

export function AppChromeProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: statsData } = useUserStats()

  const [darkMode, setDarkMode] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [coachOpen, setCoachOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [trackOpen, setTrackOpen] = useState(false)
  const [problemOpen, setProblemOpen] = useState(false)

  // Calendar-only data — do not eager-fetch on every shell page
  const { data: powerSystemData } = usePowerSystemTodos({
    enabled: calendarOpen,
  })
  const { data: journalData } = useJournalEntries({
    limit: 60,
    enabled: calendarOpen,
  })

  useEffect(() => {
    const stored = localStorage.getItem('am-theme')
    if (stored === 'dark') setDarkMode(true)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('am-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const openJournal = useCallback(() => {
    if (pathname === '/') {
      router.push('/?journal=true')
    } else {
      router.push('/?journal=true')
    }
  }, [pathname, router])

  const value = useMemo<AppChromeContextValue>(
    () => ({
      darkMode,
      toggleDarkMode: () => setDarkMode((v) => !v),
      streak: statsData?.streak ?? 0,
      sidebarCollapsed,
      setSidebarCollapsed,
      openCoach: () => setCoachOpen(true),
      openCalendar: () => setCalendarOpen(true),
      openTrack: () => setTrackOpen(true),
      openProblem: () => setProblemOpen(true),
      openJournal,
      goHome: () => router.push('/'),
    }),
    [
      darkMode,
      sidebarCollapsed,
      statsData?.streak,
      openJournal,
      router,
    ]
  )

  return (
    <AppChromeContext.Provider value={value}>
      {children}

      <AICoach isOpen={coachOpen} onClose={() => setCoachOpen(false)} />
      <CalendarModal
        isOpen={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        onOpenJournal={openJournal}
        journalEntries={journalData?.journalEntries || []}
        powerSystemTodos={powerSystemData?.powerSystemTodos || []}
      />
      <ProblemSolvingModal
        isOpen={problemOpen}
        onClose={() => setProblemOpen(false)}
      />
      <SimpleBehaviorModal
        isOpen={trackOpen}
        onClose={() => setTrackOpen(false)}
      />
    </AppChromeContext.Provider>
  )
}
