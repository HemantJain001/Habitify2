'use client'

import React, { useState, useCallback, useEffect } from 'react'
import {
  Calendar,
  Save,
  ArrowLeft,
  ArrowRight,
  BookOpen,
} from 'lucide-react'
import {
  useJournalEntries,
  useCreateJournalEntry,
  useUpdateJournalEntry,
} from '@/lib/hooks'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { textareaClass } from '@/components/ui/ModalShell'

interface JournalProps {
  className?: string
}

const moodLabels: Record<number, string> = {
  1: 'Terrible',
  2: 'Very bad',
  3: 'Bad',
  4: 'Low',
  5: 'Neutral',
  6: 'Okay',
  7: 'Good',
  8: 'Very good',
  9: 'Great',
  10: 'Excellent',
}

export function Journal({ className }: JournalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [mood, setMood] = useState(5)
  const [notes, setNotes] = useState('')
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  const formatDate = (date: Date) => date.toISOString().split('T')[0]

  const { data: journalData, isLoading, error } = useJournalEntries({
    date: formatDate(selectedDate),
  })

  const createMutation = useCreateJournalEntry()
  const updateMutation = useUpdateJournalEntry()

  const currentEntry = journalData?.journalEntries?.[0]
  const hasEntry = Boolean(currentEntry)

  useEffect(() => {
    if (currentEntry) {
      setMood(currentEntry.mood || 5)
      setNotes(currentEntry.notes || '')
    } else {
      setMood(5)
      setNotes('')
    }
    setUnsavedChanges(false)
  }, [currentEntry, selectedDate])

  const handleMoodChange = useCallback((newMood: number) => {
    setMood(newMood)
    setUnsavedChanges(true)
  }, [])

  const handleNotesChange = useCallback((newNotes: string) => {
    setNotes(newNotes)
    setUnsavedChanges(true)
  }, [])

  const handleSave = useCallback(async () => {
    try {
      if (hasEntry && currentEntry) {
        await updateMutation.mutateAsync({
          id: currentEntry.id,
          data: { mood, notes },
        })
      } else {
        await createMutation.mutateAsync({
          date: formatDate(selectedDate),
          mood,
          notes,
        })
      }
      setUnsavedChanges(false)
    } catch (err) {
      console.error('Failed to save journal entry:', err)
    }
  }, [
    hasEntry,
    currentEntry,
    mood,
    notes,
    selectedDate,
    updateMutation,
    createMutation,
  ])

  const goToPreviousDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d)
  }

  const goToNextDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d)
  }

  const goToToday = () => setSelectedDate(new Date())

  const validMood = mood >= 1 && mood <= 10 ? mood : 5
  const isToday = formatDate(selectedDate) === formatDate(new Date())
  const isFuture = selectedDate > new Date()
  const busy = isLoading || createMutation.isPending || updateMutation.isPending

  return (
    <Card className={className}>
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
              Reflect
            </p>
            <h2 className="font-display text-lg font-semibold text-[var(--fg)]">
              Daily journal
            </h2>
          </div>
        </div>

        {unsavedChanges && (
          <Button onClick={handleSave} disabled={busy} size="sm">
            <Save className="w-3.5 h-3.5" />
            Save
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 mb-6 surface-muted px-2 py-2">
        <button
          type="button"
          onClick={goToPreviousDay}
          className="p-2 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-elevated)] transition-colors"
          aria-label="Previous day"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-sm font-medium text-[var(--fg)] truncate text-center">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </h3>
          {!isToday && (
            <button
              type="button"
              onClick={goToToday}
              className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] shrink-0"
            >
              Today
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={goToNextDay}
          disabled={isFuture}
          className="p-2 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-elevated)] transition-colors disabled:opacity-40"
          aria-label="Next day"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {error ? (
        <div className="text-center py-10">
          <p className="text-sm text-[var(--danger)] mb-3">
            Error loading entry: {error.message}
          </p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      ) : isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-3 bg-[var(--bg-muted)] rounded w-1/4" />
          <div className="h-28 bg-[var(--bg-muted)] rounded-xl" />
        </div>
      ) : isFuture ? (
        <div className="text-center py-12 text-[var(--fg-muted)]">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm mb-4">Future dates aren&apos;t available yet.</p>
          <Button onClick={goToToday}>Go to today</Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-medium text-[var(--fg-muted)]">
                Mood
              </label>
              <span className="text-sm font-medium text-[var(--fg)]">
                {validMood}/10 · {moodLabels[validMood]}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={validMood}
              onChange={(e) => handleMoodChange(parseInt(e.target.value))}
              disabled={busy}
              className="w-full accent-[var(--accent)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--fg-subtle)] mt-1.5">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--fg-muted)] mb-2">
              Reflection
            </label>
            <textarea
              value={notes || ''}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="What happened today? What did you learn?"
              rows={8}
              disabled={busy}
              className={`${textareaClass} disabled:opacity-50`}
            />
            <p className="text-right text-[11px] text-[var(--fg-subtle)] mt-1.5">
              {(notes || '').length} characters
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-[var(--border)]">
            <p className="text-[11px] text-[var(--fg-subtle)]">
              {hasEntry && currentEntry?.updatedAt
                ? `Updated ${new Date(currentEntry.updatedAt).toLocaleString()}`
                : 'New entry'}
            </p>
            <div className="flex items-center gap-2">
              {unsavedChanges && (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={busy}
                  onClick={() => {
                    if (currentEntry) {
                      setMood(currentEntry.mood || 5)
                      setNotes(currentEntry.notes || '')
                    } else {
                      setMood(5)
                      setNotes('')
                    }
                    setUnsavedChanges(false)
                  }}
                >
                  Discard
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={busy || (!unsavedChanges && hasEntry)}
                size="sm"
              >
                <Save className="w-3.5 h-3.5" />
                {hasEntry ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default Journal
