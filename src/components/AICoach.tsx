'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Send, Bot, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AICoachProps {
  isOpen: boolean
  onClose: () => void
}

interface Message {
  id: string
  text: string
  sender: 'coach' | 'user'
}

const DEFAULT_INSIGHT =
  "I'm your AttackMode coach. Ask about today's tasks, habits, journal mood, or problem patterns — I'll use your real activity data."

export function AICoach({ isOpen, onClose }: AICoachProps) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', text: DEFAULT_INSIGHT, sender: 'coach' },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const insightLoaded = useRef(false)

  useEffect(() => {
    if (!isOpen || insightLoaded.current) return

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/ai/chat', { credentials: 'include' })
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled && data.insight) {
          setMessages((prev) => {
            if (prev.length === 1 && prev[0].id === 'welcome') {
              return [{ id: 'welcome', text: data.insight, sender: 'coach' }]
            }
            return prev
          })
          insightLoaded.current = true
        }
      } catch {
        // keep default
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSendMessage = async () => {
    const text = message.trim()
    if (!text || isLoading) return

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      text,
      sender: 'user',
    }

    setMessages((prev) => [...prev, userMessage])
    setMessage('')
    setError(null)
    setIsLoading(true)

    try {
      const history = [...messages, userMessage]
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.text,
        }))

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history.slice(0, -1) }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)

      setMessages((prev) => [
        ...prev,
        {
          id: `c-${Date.now()}`,
          text: data.reply || 'I could not generate a response. Try again.',
          sender: 'coach',
        },
      ])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to reach AI Coach'
      setError(msg)
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, text: `Sorry — ${msg}`, sender: 'coach' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 bg-[oklch(0.2_0.02_255/0.45)] backdrop-blur-[2px] z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col',
          'bg-[var(--bg-elevated)] border-l border-[var(--border)] shadow-[var(--shadow-lg)]',
          'transform transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-[var(--fg)]">
                AI Coach
              </h3>
              <p className="text-[11px] text-[var(--fg-subtle)]">
                Grounded in your activity
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--fg-subtle)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors"
            aria-label="Close AI Coach"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex',
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[88%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
                  msg.sender === 'user'
                    ? 'bg-[var(--accent)] text-[var(--accent-fg)] rounded-br-md'
                    : 'bg-[var(--bg-muted)] text-[var(--fg)] rounded-bl-md border border-[var(--border)]'
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-[var(--bg-muted)] border border-[var(--border)] text-xs text-[var(--fg-muted)]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent)]" />
                Thinking with your data…
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-[var(--border)] space-y-2">
          {error && (
            <p className="text-xs text-[var(--danger)] px-1">{error}</p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              disabled={isLoading}
              placeholder="Ask your coach…"
              className="flex-1 px-3.5 py-2.5 rounded-[10px] border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
              className="p-2.5 rounded-[10px] bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
