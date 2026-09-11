import { requireUser } from "@/lib/server/requireUser"
import { jsonError, jsonOk } from "@/lib/server/http"
import { prisma } from "@/lib/prisma"

function startOfDay(d = new Date()) {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  return date
}

function daysAgo(n: number) {
  const d = startOfDay()
  d.setDate(d.getDate() - n)
  return d
}

function categoryStats(
  todos: { category: string; completed: boolean }[],
  category: string,
  rangeTodos: { category: string; completed: boolean }[],
  monthTodos: { category: string; completed: boolean }[]
) {
  const todayList = todos.filter((t) => t.category === category)
  const weekList = rangeTodos.filter((t) => t.category === category)
  const monthList = monthTodos.filter((t) => t.category === category)
  const todayDone = todayList.filter((t) => t.completed).length
  const weekDone = weekList.filter((t) => t.completed).length
  const monthDone = monthList.filter((t) => t.completed).length
  const progress =
    weekList.length > 0
      ? Math.round((weekDone / weekList.length) * 100)
      : todayList.length > 0
        ? Math.round((todayDone / todayList.length) * 100)
        : 0

  return {
    today: todayDone,
    week: weekDone,
    month: monthDone,
    progress,
  }
}

export async function GET() {
  try {
    const { user, error } = await requireUser()
    if (error || !user) return error!

    const userId = user.id

    // Create defaults once if missing; never update streak/completionRate on GET
    let userStats = await prisma.userStats.findUnique({
      where: { userId },
    })

    if (!userStats) {
      userStats = await prisma.userStats.create({
        data: {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          completionRate: 0.0,
          totalTasksCompleted: 0,
          totalProblemsAnalyzed: 0,
        },
      })
    }

    const todayStart = startOfDay()
    const todayEnd = new Date(todayStart)
    todayEnd.setHours(23, 59, 59, 999)
    const weekStart = daysAgo(7)
    const monthStart = daysAgo(30)

    const [todayTodos, weekTodos, monthTodos] = await Promise.all([
      prisma.powerSystemTodo.findMany({
        where: {
          userId,
          date: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.powerSystemTodo.findMany({
        where: {
          userId,
          date: { gte: weekStart, lte: todayEnd },
        },
      }),
      prisma.powerSystemTodo.findMany({
        where: {
          userId,
          date: { gte: monthStart, lte: todayEnd },
        },
      }),
    ])

    // Compute streak in memory only (no persistence on GET)
    const lookback = daysAgo(60)
    const [recentTasks, recentPower] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId,
          completed: true,
          OR: [
            { completedAt: { gte: lookback } },
            { updatedAt: { gte: lookback } },
          ],
        },
        select: { completedAt: true, updatedAt: true },
      }),
      prisma.powerSystemTodo.findMany({
        where: {
          userId,
          completed: true,
          date: { gte: lookback },
        },
        select: { date: true },
      }),
    ])

    const activeDays = new Set<string>()
    for (const t of recentTasks) {
      const d = t.completedAt || t.updatedAt
      activeDays.add(d.toISOString().split("T")[0])
    }
    for (const t of recentPower) {
      activeDays.add(t.date.toISOString().split("T")[0])
    }

    let currentStreak = 0
    const cursor = startOfDay()
    // If today has no activity yet, start counting from yesterday
    if (!activeDays.has(cursor.toISOString().split("T")[0])) {
      cursor.setDate(cursor.getDate() - 1)
    }
    while (activeDays.has(cursor.toISOString().split("T")[0])) {
      currentStreak++
      cursor.setDate(cursor.getDate() - 1)
    }

    const transformedStats = {
      streak: currentStreak,
      brain: categoryStats(todayTodos, "brain", weekTodos, monthTodos),
      muscle: categoryStats(todayTodos, "muscle", weekTodos, monthTodos),
      money: categoryStats(todayTodos, "money", weekTodos, monthTodos),
    }

    return jsonOk(transformedStats)
  } catch (err) {
    console.error("Get user stats error:", err)
    return jsonError("Internal server error", 500)
  }
}
