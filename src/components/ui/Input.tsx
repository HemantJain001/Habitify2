'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'ghost'
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', error, ...props }, ref) => {
    const baseClasses =
      'w-full rounded-[10px] text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]'

    const variants = {
      default:
        'px-3.5 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg)] placeholder:text-[var(--fg-subtle)] hover:border-[var(--border-strong)]',
      ghost:
        'bg-transparent border-none text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus-visible:ring-0 px-0 py-1',
    }

    return (
      <div className="w-full">
        <input
          className={cn(
            baseClasses,
            variants[variant],
            error && 'border-[var(--danger)] focus-visible:ring-[var(--danger)]',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-[var(--danger)]">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
