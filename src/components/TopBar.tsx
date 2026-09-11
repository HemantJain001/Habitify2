'use client'

import { Bot, Flame, LogOut, Moon, Sun, User } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { useAppChrome } from '@/components/layout/AppChrome'

interface TopBarProps {
  title?: string
  subtitle?: string
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const { data: session } = useSession()
  const { streak, darkMode, toggleDarkMode, openCoach } = useAppChrome()

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <header className="sticky top-0 z-30 glass border-b border-[var(--border)]">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 md:px-8 h-14 md:h-16">
        <div className="min-w-0">
          {title ? (
            <>
              <h1 className="font-display text-base md:text-lg font-semibold text-[var(--fg)] truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-[var(--fg-muted)] truncate">{subtitle}</p>
              )}
            </>
          ) : (
            <>
              <p className="text-[11px] text-[var(--fg-subtle)] uppercase tracking-[0.12em]">
                {dateLabel}
              </p>
              <h1 className="font-display text-base md:text-lg font-semibold text-[var(--fg)] truncate">
                {greeting}
                {session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}
              </h1>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1 text-xs font-medium text-[var(--fg)]">
            <Flame className="w-3.5 h-3.5 text-[var(--accent)]" />
            {streak} day streak
          </span>

          <Button
            variant="ghost"
            size="sm"
            className="px-2"
            onClick={toggleDarkMode}
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-[var(--accent)]" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          <Button variant="primary" size="sm" onClick={openCoach} className="hidden sm:inline-flex">
            <Bot className="w-3.5 h-3.5" />
            Coach
          </Button>

          {session?.user ? (
            <div className="flex items-center gap-1">
              <div className="hidden md:flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] pl-1 pr-2.5 py-1">
                {session.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-[var(--bg-muted)] flex items-center justify-center">
                    <User className="w-3 h-3 text-[var(--fg-muted)]" />
                  </span>
                )}
                <span className="text-xs font-medium text-[var(--fg)] max-w-[90px] truncate">
                  {session.user.name?.split(' ')[0]}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="px-2"
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Link href="/auth/signin">
              <Button variant="secondary" size="sm">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
