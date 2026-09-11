'use client'

import { useMemo, useState } from 'react'
import {
  Calendar,
  ChevronDown,
  Clock,
  FileText,
  Filter,
  Search,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useBehaviors } from '@/lib/hooks'
import { format, isToday, isYesterday, startOfDay, subDays } from 'date-fns'
import { fieldControlClass } from '@/components/ui/ModalShell'

interface FilterOptions {
  search: string
  dateRange: 'all' | 'today' | 'week' | 'month'
  sortBy: 'newest' | 'oldest' | 'title'
}

export function BehaviorHistoryClient() {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    dateRange: 'all',
    sortBy: 'newest',
  })
  const [showFilters, setShowFilters] = useState(false)

  const dateFilter = useMemo(() => {
    const today = new Date()
    switch (filters.dateRange) {
      case 'today':
        return format(today, 'yyyy-MM-dd')
      case 'week':
        return format(subDays(today, 7), 'yyyy-MM-dd')
      case 'month':
        return format(subDays(today, 30), 'yyyy-MM-dd')
      default:
        return undefined
    }
  }, [filters.dateRange])

  const { data, isLoading, error } = useBehaviors({
    date: dateFilter,
    limit: 100,
  })

  const filteredEntries = useMemo(() => {
    if (!data?.behaviorEntries) return []
    let filtered = data.behaviorEntries

    if (filters.search) {
      const q = filters.search.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(q) || e.value.toLowerCase().includes(q)
      )
    }

    return [...filtered].sort((a, b) => {
      if (filters.sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      if (filters.sortBy === 'title') return a.title.localeCompare(b.title)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [data?.behaviorEntries, filters])

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isToday(d)) return 'Today'
    if (isYesterday(d)) return 'Yesterday'
    return format(d, 'MMM dd, yyyy')
  }

  const groupedEntries = useMemo(() => {
    const groups: Record<string, typeof filteredEntries> = {}
    filteredEntries.forEach((entry) => {
      const key = format(startOfDay(new Date(entry.createdAt)), 'yyyy-MM-dd')
      groups[key] = groups[key] || []
      groups[key].push(entry)
    })
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [filteredEntries])

  if (error) {
    return (
      <Card className="p-8 text-center">
        <FileText className="w-10 h-10 mx-auto mb-3 text-[var(--danger)]" />
        <h2 className="font-display text-lg font-semibold text-[var(--fg)] mb-1">
          Unable to load history
        </h2>
        <p className="text-sm text-[var(--fg-muted)]">
          {error instanceof Error ? error.message : 'Something went wrong'}
        </p>
      </Card>
    )
  }

  const entries = data?.behaviorEntries || []

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: entries.length },
          {
            label: 'Today',
            value: entries.filter((e) => isToday(new Date(e.createdAt))).length,
          },
          {
            label: 'This week',
            value: entries.filter(
              (e) => new Date(e.createdAt) >= subDays(new Date(), 7)
            ).length,
          },
          {
            label: 'Active days',
            value: new Set(
              entries.map((e) => format(new Date(e.createdAt), 'yyyy-MM-dd'))
            ).size,
          },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="text-2xl font-semibold tabular-nums text-[var(--fg)]">
              {stat.value}
            </p>
            <p className="text-xs text-[var(--fg-muted)] mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--fg-subtle)]" />
            <input
              type="text"
              placeholder="Search entries…"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className={`${fieldControlClass} pl-10`}
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowFilters((v) => !v)}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--fg-muted)] mb-1.5 block">
                Date range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: e.target.value as FilterOptions['dateRange'],
                  }))
                }
                className={fieldControlClass}
              >
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--fg-muted)] mb-1.5 block">
                Sort by
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortBy: e.target.value as FilterOptions['sortBy'],
                  }))
                }
                className={fieldControlClass}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="title">Title A–Z</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      {isLoading && (
        <Card className="p-8 text-center text-sm text-[var(--fg-muted)]">
          Loading history…
        </Card>
      )}

      {!isLoading && filteredEntries.length === 0 && (
        <Card className="p-10 text-center">
          <Sparkles className="w-10 h-10 text-[var(--fg-subtle)] mx-auto mb-3" />
          <h2 className="font-display text-lg font-semibold text-[var(--fg)] mb-1">
            No entries yet
          </h2>
          <p className="text-sm text-[var(--fg-muted)] mb-4">
            {filters.search || filters.dateRange !== 'all'
              ? 'Nothing matches these filters.'
              : 'Log a behavior from Today to start a trail.'}
          </p>
          {(filters.search || filters.dateRange !== 'all') && (
            <Button
              variant="secondary"
              onClick={() =>
                setFilters({ search: '', dateRange: 'all', sortBy: 'newest' })
              }
            >
              Clear filters
            </Button>
          )}
        </Card>
      )}

      {!isLoading &&
        groupedEntries.map(([dateKey, dayEntries]) => (
          <div key={dateKey} className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--fg-subtle)]" />
              <h3 className="text-sm font-semibold text-[var(--fg)]">
                {formatDate(dayEntries[0].createdAt)}
              </h3>
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span className="text-xs text-[var(--fg-subtle)]">
                {dayEntries.length}
              </span>
            </div>
            <div className="space-y-2">
              {dayEntries.map((entry) => (
                <Card key={entry.id} className="p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h4 className="font-medium text-[var(--fg)] truncate flex-1">
                      {entry.title}
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[11px] text-[var(--fg-subtle)]">
                      <Clock className="w-3 h-3" />
                      {format(new Date(entry.createdAt), 'h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
                    {entry.value}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}
