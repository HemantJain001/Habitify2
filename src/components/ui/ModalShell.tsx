'use client'

import { X, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface ModalShellProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  icon?: LucideIcon
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function ModalShell({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
  size = 'md',
  className,
}: ModalShellProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[oklch(0.2_0.02_255/0.5)] backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full surface shadow-[var(--shadow-lg)] animate-fade-up flex flex-col max-h-[90vh]',
          sizes[size],
          className
        )}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="font-display text-lg font-semibold text-[var(--fg)] truncate">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-[var(--fg-muted)] mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="px-2 shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="px-5 py-4 border-t border-[var(--border)] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

interface FieldProps {
  label: string
  hint?: string
  children: React.ReactNode
  className?: string
}

export function Field({ label, hint, children, className }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-xs font-medium text-[var(--fg-muted)]">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-[var(--fg-subtle)]">{hint}</p>}
    </div>
  )
}

export const fieldControlClass =
  'w-full px-3.5 py-2.5 rounded-[10px] border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] transition-colors'

export const textareaClass = `${fieldControlClass} resize-none`
