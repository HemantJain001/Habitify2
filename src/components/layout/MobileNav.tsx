'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Rocket, Bot, Brain } from 'lucide-react'
import { useAppChrome } from '@/components/layout/AppChrome'
import { cn } from '@/lib/utils'

export function MobileNav() {
  const pathname = usePathname()
  const { openJournal, openTrack, openCoach, openProblem } = useAppChrome()

  const items = [
    {
      key: 'today',
      label: 'Today',
      icon: LayoutDashboard,
      href: '/',
      active: pathname === '/' && !pathname.includes('journal'),
    },
    {
      key: 'journal',
      label: 'Journal',
      icon: BookOpen,
      onClick: openJournal,
    },
    {
      key: 'track',
      label: 'Track',
      icon: Rocket,
      onClick: openTrack,
    },
    {
      key: 'coach',
      label: 'Coach',
      icon: Bot,
      onClick: openCoach,
    },
    {
      key: 'solve',
      label: 'Solve',
      icon: Brain,
      onClick: openProblem,
    },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--border)] glass px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 gap-1 py-2">
        {items.map((item) => {
          const Icon = item.icon
          const className = cn(
            'flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl text-[10px] font-medium transition-colors',
            item.active
              ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
              : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
          )

          if (item.href) {
            return (
              <Link key={item.key} href={item.href} className={className}>
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          }

          return (
            <button
              key={item.key}
              type="button"
              onClick={item.onClick}
              className={className}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
