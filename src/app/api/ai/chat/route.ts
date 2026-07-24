import { NextRequest } from "next/server"
import { requireUser } from "@/lib/server/requireUser"
import { jsonError, jsonOk } from "@/lib/server/http"
import { chatWithDeepSeek } from "@/lib/deepseek"
import {
  buildCoachMessages,
  buildUserActivityContext,
  formatUserContextForPrompt,
} from "@/lib/ai/userContext"

type HistoryMessage = {
  role: "user" | "assistant"
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireUser()
    if (error || !user) return error!

    const body = await request.json().catch(() => null)
    const message = typeof body?.message === "string" ? body.message.trim() : ""
    const history: HistoryMessage[] = Array.isArray(body?.history)
      ? body.history
          .filter(
            (m: HistoryMessage) =>
              m &&
              (m.role === "user" || m.role === "assistant") &&
              typeof m.content === "string" &&
              m.content.trim()
          )
          .map((m: HistoryMessage) => ({
            role: m.role,
            content: m.content.trim().slice(0, 4000),
          }))
      : []

    if (!message) {
      return jsonError("Message is required", 400)
    }

    if (message.length > 4000) {
      return jsonError("Message is too long (max 4000 characters)", 400)
    }

    const context = await buildUserActivityContext(user.id)
    const contextText = formatUserContextForPrompt(context)
    const messages = buildCoachMessages(contextText, history, message)

    const reply = await chatWithDeepSeek(messages, {
      temperature: 0.65,
      maxTokens: 900,
    })

    return jsonOk({
      reply,
      meta: {
        streak: context.stats.currentStreak,
        todayTasksCompleted: context.today.tasks.completed,
        todayTasksTotal: context.today.tasks.total,
        averageMood: context.journal.averageMood,
      },
    })
  } catch (err) {
    console.error("AI chat error:", err)
    const message =
      err instanceof Error ? err.message : "Failed to generate coach response"
    const status = message.includes("DEEPSEEK_API_KEY") ? 503 : 500
    return jsonError(message, status)
  }
}

export async function GET() {
  const { user, error } = await requireUser()
  if (error || !user) return error!

  try {
    const context = await buildUserActivityContext(user.id)
    const insightParts: string[] = []

    if (context.stats.currentStreak > 0) {
      insightParts.push(
        `You're on a ${context.stats.currentStreak}-day streak — keep the chain going.`
      )
    }

    const pending =
      context.today.powerSystem.brain.pending +
      context.today.powerSystem.muscle.pending +
      context.today.powerSystem.money.pending

    if (pending > 0) {
      insightParts.push(
        `You still have ${pending} Power System item(s) open today across brain/muscle/money.`
      )
    }

    const rates = [
      { name: "Brain", rate: context.weekPowerSystem.brain.rate },
      { name: "Muscle", rate: context.weekPowerSystem.muscle.rate },
      { name: "Money", rate: context.weekPowerSystem.money.rate },
    ].sort((a, b) => a.rate - b.rate)

    if (rates[0] && rates.some((r) => r.rate > 0 || r.rate === 0)) {
      const weakest = rates[0]
      if (weakest.rate < 50) {
        insightParts.push(
          `Your ${weakest.name} identity is the weakest this week (${weakest.rate}% completion). Want a plan to rebalance?`
        )
      }
    }

    if (context.journal.averageMood !== null && context.journal.averageMood < 5) {
      insightParts.push(
        `Recent journal mood averages ${context.journal.averageMood}/10 — we can dig into what's draining energy.`
      )
    }

    if (context.problems.pinned.length > 0) {
      insightParts.push(
        `You have ${context.problems.pinned.length} pinned problem pattern(s). Ask me how to apply your preferred behavior today.`
      )
    }

    const insight =
      insightParts.slice(0, 2).join(" ") ||
      "I'm your AttackMode coach. Ask about today's tasks, habits, journal mood, or problem patterns — I'll use your real activity data."

    return jsonOk({ insight, meta: { streak: context.stats.currentStreak } })
  } catch (err) {
    console.error("AI insight error:", err)
    return jsonOk({
      insight:
        "I'm your AttackMode coach. Ask me anything about your habits, tasks, or growth.",
    })
  }
}
