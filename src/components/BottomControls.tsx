'use client'

import { Moon, Sun, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomControlsProps {
  darkMode: boolean
  onToggleDarkMode: () => void
  onOpenAICoach: () => void
}

export function BottomControls({
  darkMode,
  onToggleDarkMode,
  onOpenAICoach,
}: BottomControlsProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-1 glass rounded-2xl p-1.5 shadow-[var(--shadow-lg)]">
      <button
        type="button"
        onClick={onToggleDarkMode}
        className="p-2.5 rounded-xl text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors"
        title="Toggle theme"
        aria-label="Toggle theme"
      >
        {darkMode ? (
          <Sun className="w-[18px] h-[18px] text-[var(--accent)]" />
        ) : (
          <Moon className="w-[18px] h-[18px]" />
        )}
      </button>

      <div className="w-px h-6 bg-[var(--border)]" />

      <button
        type="button"
        onClick={onOpenAICoach}
        className={cn(
          'inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all',
          'bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] shadow-sm'
        )}
        title="AI Coach"
      >
        <Bot className="w-4 h-4" />
        <span className="hidden sm:inline">Coach</span>
      </button>
    </div>
  )
}
