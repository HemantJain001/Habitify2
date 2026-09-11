'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default:
      'bg-[var(--bg-muted)] text-[var(--fg-muted)] border border-[var(--border)]',
    success:
      'bg-[var(--success)]/12 text-[var(--success)] border border-[var(--success)]/25',
    warning:
      'bg-[var(--accent-soft)] text-[var(--fg)] border border-[var(--accent)]/25',
    danger:
      'bg-[var(--danger)]/12 text-[var(--danger)] border border-[var(--danger)]/25',
    info:
      'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-tight',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
