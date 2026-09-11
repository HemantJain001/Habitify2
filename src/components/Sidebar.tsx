'use client'

import { useState, type ComponentType } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Brain,
  Puzzle,
  Rocket,
  History,
  BarChart3,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAppChrome } from '@/components/layout/AppChrome'

interface NavItem {
  key: string
  label: string
  icon: ComponentType<{ className?: string }>
  href?: string
  onClick?: () => void
  active?: boolean
}

function NavButton({
  item,
  collapsed,
}: {
  item: NavItem
  collapsed: boolean
}) {
  const Icon = item.icon
  const className = cn(
    'w-full flex items-center rounded-xl text-left transition-colors group',
    collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
    item.active
      ? 'bg-[var(--accent-soft)] text-[var(--fg)]'
      : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)]'
  )

  const content = (
    <>
      <Icon
        className={cn(
          'w-[18px] h-[18px] shrink-0',
          item.active ? 'text-[var(--accent)]' : 'text-[var(--fg-subtle)] group-hover:text-[var(--fg)]'
        )}
      />
      <span
        className={cn(
          'text-[13px] font-medium tracking-tight whitespace-nowrap transition-opacity',
          collapsed ? 'sr-only' : 'opacity-100'
        )}
      >
        {item.label}
      </span>
    </>
  )

  if (item.href) {
    return (
      <Link href={item.href} className={className} title={item.label}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={item.onClick} className={className} title={item.label}>
      {content}
    </button>
  )
}

export function Sidebar({
  onCollapseChange,
}: {
  onCollapseChange?: (collapsed: boolean) => void
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const journalOpen = searchParams.get('journal') === 'true'
  const {
    openCalendar,
    openJournal,
    openProblem,
    openTrack,
    goHome,
    setSidebarCollapsed,
  } = useAppChrome()

  const [collapsed, setCollapsed] = useState(false)

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    setSidebarCollapsed(next)
    onCollapseChange?.(next)
  }

  const todayItems: NavItem[] = [
    {
      key: 'today',
      label: 'Today',
      icon: LayoutDashboard,
      onClick: goHome,
      active: pathname === '/' && !journalOpen,
    },
    {
      key: 'journal',
      label: 'Journal',
      icon: BookOpen,
      onClick: openJournal,
      active: pathname === '/' && journalOpen,
    },
    {
      key: 'calendar',
      label: 'Calendar',
      icon: CalendarDays,
      onClick: openCalendar,
    },
  ]

  const captureItems: NavItem[] = [
    {
      key: 'track',
      label: 'Log behavior',
      icon: Rocket,
      onClick: openTrack,
    },
    {
      key: 'problem',
      label: 'Solve a problem',
      icon: Brain,
      onClick: openProblem,
    },
  ]

  const reviewItems: NavItem[] = [
    {
      key: 'solved',
      label: 'Solved problems',
      icon: Puzzle,
      href: '/solved-problems',
      active: pathname === '/solved-problems',
    },
    {
      key: 'history',
      label: 'Behavior history',
      icon: History,
      href: '/behavior-history',
      active: pathname === '/behavior-history',
    },
    {
      key: 'stats',
      label: 'Statistics',
      icon: BarChart3,
      href: '/stats',
      active: pathname === '/stats',
    },
  ]

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 hidden lg:flex flex-col glass border-r border-[var(--border)] sidebar-transition',
        collapsed ? 'w-[72px]' : 'w-[240px]'
      )}
    >
      <div
        className={cn(
          'h-14 border-b border-[var(--border)] flex items-center',
          collapsed ? 'justify-center px-2' : 'justify-between px-3'
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center">
              <Zap className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-[var(--fg)] leading-none">
                AttackMode
              </p>
              <p className="text-[10px] text-[var(--fg-subtle)] mt-1 tracking-wide">
                Daily system
              </p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={toggle}
          className="p-2 rounded-lg text-[var(--fg-subtle)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)]"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2.5 space-y-5">
        <div className="space-y-0.5">
          {!collapsed && (
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
              Focus
            </p>
          )}
          {todayItems.map((item) => (
            <NavButton key={item.key} item={item} collapsed={collapsed} />
          ))}
        </div>

        <div className="space-y-0.5">
          {!collapsed && (
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
              Capture
            </p>
          )}
          {captureItems.map((item) => (
            <NavButton key={item.key} item={item} collapsed={collapsed} />
          ))}
        </div>

        <div className="space-y-0.5">
          {!collapsed && (
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
              Review
            </p>
          )}
          {reviewItems.map((item) => (
            <NavButton key={item.key} item={item} collapsed={collapsed} />
          ))}
        </div>
      </nav>
    </aside>
  )
}
