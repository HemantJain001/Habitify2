'use client'

import { BookOpen, Brain, Rocket, Bot, CheckCircle2 } from 'lucide-react'
import { useAppChrome } from '@/components/layout/AppChrome'
import { cn } from '@/lib/utils'

interface QuickActionsProps {
  completedTasks: number
  totalTasks: number
  powerCompleted: number
  powerTotal: number
}

function ActionChip({
  icon: Icon,
  label,
  onClick,
  accent,
}: {
  icon: typeof BookOpen
  label: string
  onClick: () => void
  accent?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-all border',
        accent
          ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-transparent hover:bg-[var(--accent-hover)]'
          : 'bg-[var(--bg-elevated)] text-[var(--fg)] border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-muted)]'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}

export function QuickActions({
  completedTasks,
  totalTasks,
  powerCompleted,
  powerTotal,
}: QuickActionsProps) {
  const { openJournal, openTrack, openProblem, openCoach } = useAppChrome()
  const taskPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <section className="surface p-4 md:p-5 mb-6 animate-fade-up">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle
                cx="28"
                cy="28"
                r="22"
                fill="none"
                stroke="var(--bg-muted)"
                strokeWidth="5"
              />
              <circle
                cx="28"
                cy="28"
                r="22"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${(taskPct / 100) * 138} 138`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold tabular-nums text-[var(--fg)]">
                {taskPct}%
              </span>
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
              Today&apos;s pulse
            </p>
            <p className="font-display text-lg font-semibold text-[var(--fg)] mt-0.5">
              {totalTasks === 0
                ? 'Set your first action'
                : completedTasks === totalTasks
                  ? 'Day cleared'
                  : `${completedTasks} of ${totalTasks} actions done`}
            </p>
            <p className="text-xs text-[var(--fg-muted)] mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
              Identities {powerCompleted}/{powerTotal || 0} complete
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <ActionChip icon={BookOpen} label="Journal" onClick={openJournal} />
          <ActionChip icon={Rocket} label="Log" onClick={openTrack} />
          <ActionChip icon={Brain} label="Solve" onClick={openProblem} />
          <ActionChip icon={Bot} label="Coach" onClick={openCoach} accent />
        </div>
      </div>
    </section>
  )
}
