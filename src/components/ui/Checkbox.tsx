'use client'

import { ButtonHTMLAttributes } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckboxProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'checked'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  size?: 'sm' | 'md' | 'lg'
}

function Checkbox({
  className,
  checked = false,
  onCheckedChange,
  size = 'md',
  disabled,
  ...props
}: CheckboxProps) {
  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-[5px] border transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        checked
          ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--accent-fg)]'
          : 'border-[var(--border-strong)] bg-[var(--bg-elevated)] hover:border-[var(--accent)]',
        disabled && 'opacity-45 cursor-not-allowed',
        sizes[size],
        className
      )}
      onClick={(e) => {
        e.stopPropagation()
        if (!disabled && onCheckedChange) onCheckedChange(!checked)
      }}
      disabled={disabled}
      aria-checked={checked}
      role="checkbox"
      {...props}
    >
      {checked && <Check className="w-full h-full p-[2px]" strokeWidth={3} />}
    </button>
  )
}

export { Checkbox }
