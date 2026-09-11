'use client'

import { useState } from 'react'
import { Rocket, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ModalShell, Field, textareaClass } from '@/components/ui/ModalShell'
import { useCreateBehavior } from '@/lib/hooks'

interface SimpleBehaviorModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SimpleBehaviorModal({ isOpen, onClose }: SimpleBehaviorModalProps) {
  const [title, setTitle] = useState('')
  const [value, setValue] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const createBehaviorMutation = useCreateBehavior()

  const handleSubmit = async () => {
    if (!title.trim() || !value.trim()) return
    setError(null)

    try {
      await createBehaviorMutation.mutateAsync({
        title: title.trim(),
        value: value.trim(),
      })
      setShowSuccess(true)
      setTitle('')
      setValue('')
      setTimeout(() => {
        setShowSuccess(false)
        onClose()
      }, 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry')
    }
  }

  if (showSuccess) {
    return (
      <ModalShell
        isOpen
        onClose={onClose}
        title="Entry saved"
        subtitle="Your progress was tracked successfully"
        icon={CheckCircle}
        size="sm"
      >
        <div className="py-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-[var(--success)]/12 text-[var(--success)] flex items-center justify-center mb-3">
            <CheckCircle className="w-6 h-6" />
          </div>
          <p className="text-sm text-[var(--fg-muted)]">Closing shortly…</p>
        </div>
      </ModalShell>
    )
  }

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Track yourself"
      subtitle="Log a moment of progress or behavior"
      icon={Rocket}
      size="sm"
      footer={
        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || !value.trim() || createBehaviorMutation.isPending}
          isLoading={createBehaviorMutation.isPending}
          className="w-full"
        >
          Save entry
        </Button>
      }
    >
      <div className="space-y-4">
        <Field label="Heading" hint={`${title.length}/100`}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are you tracking?"
            maxLength={100}
          />
        </Field>

        <Field label="Description" hint={`${value.length}/500`}>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Describe what happened…"
            className={textareaClass}
            rows={4}
            maxLength={500}
          />
        </Field>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-[var(--danger)]/25 bg-[var(--danger)]/8 px-3 py-2.5">
            <AlertCircle className="w-4 h-4 text-[var(--danger)] shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--danger)]">{error}</p>
          </div>
        )}
      </div>
    </ModalShell>
  )
}
