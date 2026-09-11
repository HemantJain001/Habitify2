'use client'

import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'outline'
}

function Card({ className, variant = 'default', ...props }: CardProps) {
  const variants = {
    default: 'surface',
    glass: 'glass shadow-[var(--shadow)]',
    outline: 'border border-[var(--border)] bg-transparent',
  }

  return (
    <div
      className={cn('rounded-[var(--radius-lg)] p-6', variants[variant], className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1 pb-4', className)} {...props} />
}

function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'font-display text-lg font-semibold text-[var(--fg)] tracking-tight',
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardContent }
