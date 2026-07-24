import { prisma } from "@/lib/prisma"

function startOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function daysAgo(n: number) {
  const d = startOfDay()
  d.setDate(d.getDate() - n)
  return d
}

function endOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export async function buildUserActivityContext(userId: string) {
  const todayStart = startOfDay()
  const todayEnd = endOfDay()
  const weekStart = daysAgo(7)
  const twoWeeksStart = daysAgo(14)

  const [
    user,
    stats,
    todayTasks,
    incompleteTasks,
    todayPowerTodos,
    recentJournal,
    recentBehaviors,
    pinnedProblems,
    recentProblems,
    weekPowerTodos,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    }),
    prisma.userStats.findUnique({ where: { userId } }),
    prisma.task.findMany({
      where: {
        userId,
        createdAt: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.task.findMany({
      where: { userId, completed: false },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.powerSystemTodo.findMany({
      where: {
        userId,
        date: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.journalEntry.findMany({
      where: { userId, date: { gte: twoWeeksStart } },
      orderBy: { date: "desc" },
      take: 10,
    }),
    prisma.behaviorEntry.findMany({
      where: { userId, createdAt: { gte: twoWeeksStart } },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    prisma.problemSolvingEntry.findMany({
      where: { userId, isPinned: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.problemSolvingEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.powerSystemTodo.findMany({
      where: {
        userId,
        date: { gte: weekStart, lte: todayEnd },
      },
    }),
  ])

  const byCategory = (category: string) => {
    const list = todayPowerTodos.filter((t) => t.category === category)
    const completed = list.filter((t) => t.completed).length
    return { total: list.length, completed, pending: list.length - completed }
  }

  const weekByCategory = (category: string) => {
    const list = weekPowerTodos.filter((t) => t.category === category)
    const completed = list.filter((t) => t.completed).length
    return {
      total: list.length,
      completed,
      rate: list.length ? Math.round((completed / list.length) * 100) : 0,
    }
  }

  const avgMood =
    recentJournal.length > 0
      ? Math.round(
          (recentJournal.reduce((sum, e) => sum + e.mood, 0) /
            recentJournal.length) *
            10
        ) / 10
      : null

  return {
    profile: {
      name: user?.name || "User",
      email: user?.email,
    },
    stats: {
      currentStreak: stats?.currentStreak ?? 0,
      longestStreak: stats?.longestStreak ?? 0,
      completionRate: stats?.completionRate ?? 0,
      totalTasksCompleted: stats?.totalTasksCompleted ?? 0,
      totalProblemsAnalyzed: stats?.totalProblemsAnalyzed ?? 0,
    },
    today: {
      tasks: {
        total: todayTasks.length,
        completed: todayTasks.filter((t) => t.completed).length,
        items: todayTasks.map((t) => ({
          title: t.title,
          completed: t.completed,
        })),
      },
      powerSystem: {
        brain: byCategory("brain"),
        muscle: byCategory("muscle"),
        money: byCategory("money"),
        items: todayPowerTodos.map((t) => ({
          title: t.title,
          category: t.category,
          completed: t.completed,
        })),
      },
    },
    openTasks: incompleteTasks.map((t) => t.title),
    weekPowerSystem: {
      brain: weekByCategory("brain"),
      muscle: weekByCategory("muscle"),
      money: weekByCategory("money"),
    },
    journal: {
      averageMood: avgMood,
      entries: recentJournal.map((e) => ({
        date: e.date.toISOString().split("T")[0],
        mood: e.mood,
        notes: e.notes.slice(0, 400),
      })),
    },
    behaviors: recentBehaviors.map((b) => ({
      title: b.title,
      value: b.value.slice(0, 300),
      date: b.createdAt.toISOString().split("T")[0],
    })),
    problems: {
      pinned: pinnedProblems.map((p) => ({
        behavior: p.problemBehavior.slice(0, 200),
        preferred: p.preferredBehavior.slice(0, 200),
        category: p.problemCategory,
        trigger: p.triggerPattern.slice(0, 150),
      })),
      recent: recentProblems.map((p) => ({
        behavior: p.problemBehavior.slice(0, 200),
        preferred: p.preferredBehavior.slice(0, 200),
        category: p.problemCategory,
        pinned: p.isPinned,
      })),
    },
  }
}

export function formatUserContextForPrompt(
  context: Awaited<ReturnType<typeof buildUserActivityContext>>
) {
  return `USER ACTIVITY CONTEXT (use this to personalize coaching; do not invent data that is not here):

Profile: ${context.profile.name}
Streak: ${context.stats.currentStreak} days (longest ${context.stats.longestStreak})
Lifetime tasks completed: ${context.stats.totalTasksCompleted}
Problems analyzed: ${context.stats.totalProblemsAnalyzed}
Completion rate: ${Math.round(context.stats.completionRate * 100)}%

TODAY — Tasks: ${context.today.tasks.completed}/${context.today.tasks.total} done
${
  context.today.tasks.items.length
    ? context.today.tasks.items
        .map((t) => `- [${t.completed ? "x" : " "}] ${t.title}`)
        .join("\n")
    : "- No tasks logged today"
}

TODAY — Power System (brain / muscle / money):
- Brain: ${context.today.powerSystem.brain.completed}/${context.today.powerSystem.brain.total}
- Muscle: ${context.today.powerSystem.muscle.completed}/${context.today.powerSystem.muscle.total}
- Money: ${context.today.powerSystem.money.completed}/${context.today.powerSystem.money.total}
${
  context.today.powerSystem.items.length
    ? context.today.powerSystem.items
        .map(
          (t) =>
            `- [${t.completed ? "x" : " "}] (${t.category}) ${t.title}`
        )
        .join("\n")
    : "- No power-system todos today"
}

Open / incomplete tasks (all time, recent):
${
  context.openTasks.length
    ? context.openTasks.map((t) => `- ${t}`).join("\n")
    : "- None"
}

Last 7 days power-system completion rates:
- Brain: ${context.weekPowerSystem.brain.rate}% (${context.weekPowerSystem.brain.completed}/${context.weekPowerSystem.brain.total})
- Muscle: ${context.weekPowerSystem.muscle.rate}% (${context.weekPowerSystem.muscle.completed}/${context.weekPowerSystem.muscle.total})
- Money: ${context.weekPowerSystem.money.rate}% (${context.weekPowerSystem.money.completed}/${context.weekPowerSystem.money.total})

Journal (avg mood ${context.journal.averageMood ?? "n/a"} / 10):
${
  context.journal.entries.length
    ? context.journal.entries
        .map((e) => `- ${e.date} (mood ${e.mood}): ${e.notes}`)
        .join("\n")
    : "- No recent journal entries"
}

Recent behaviors tracked:
${
  context.behaviors.length
    ? context.behaviors
        .map((b) => `- ${b.date} [${b.title}]: ${b.value}`)
        .join("\n")
    : "- None"
}

Pinned problems:
${
  context.problems.pinned.length
    ? context.problems.pinned
        .map(
          (p) =>
            `- (${p.category}) Problem: ${p.behavior} | Prefer: ${p.preferred} | Trigger: ${p.trigger}`
        )
        .join("\n")
    : "- None pinned"
}

Recent problem worksheets:
${
  context.problems.recent.length
    ? context.problems.recent
        .map(
          (p) =>
            `- (${p.category}${p.pinned ? ", pinned" : ""}) ${p.behavior} → ${p.preferred}`
        )
        .join("\n")
    : "- None"
}`
}

const COACH_SYSTEM_PROMPT = `You are AttackMode AI Coach — a practical, encouraging productivity and habit coach inside the AttackMode app.

Rules:
1. Base advice on the USER ACTIVITY CONTEXT provided. Reference specific tasks, moods, streaks, behaviors, and problems when relevant.
2. If data is missing for a topic, say so briefly and ask a clarifying question — do not invent history.
3. Be concise (usually 2–6 short paragraphs or bullets). Prefer actionable next steps.
4. Tone: direct, supportive, no fluff. Avoid emojis unless the user uses them.
5. Help with prioritization, habit design, emotional patterns from journal/behaviors, and balancing brain / muscle / money identities.
6. Never claim you can change app data yourself; guide the user on what to do in the app.`

export function buildCoachMessages(
  contextText: string,
  history: { role: "user" | "assistant"; content: string }[],
  userMessage: string
) {
  return [
    { role: "system" as const, content: COACH_SYSTEM_PROMPT },
    {
      role: "system" as const,
      content: contextText,
    },
    ...history.slice(-12).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: userMessage },
  ]
}
