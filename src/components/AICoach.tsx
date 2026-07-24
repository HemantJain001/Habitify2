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
        // Keep default welcome message
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

      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`)
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `c-${Date.now()}`,
          text: data.reply || 'I could not generate a response. Try again.',
          sender: 'coach',
        },
      ])
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to reach AI Coach'
      setError(msg)
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          text: `Sorry — ${msg}`,
          sender: 'coach',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-50 transform transition-transform duration-300 flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Coach
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Grounded in your AttackMode data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close AI Coach"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                  'max-w-[85%] p-3 rounded-lg',
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking with your activity data…
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-800 space-y-2">
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
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
              placeholder="Ask your AI coach..."
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
              className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
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
