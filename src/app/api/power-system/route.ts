import { NextRequest } from "next/server"
import { requireUser } from "@/lib/server/requireUser"
import { jsonError, jsonOk } from "@/lib/server/http"
import { isPowerCategory } from "@/lib/server/constants"
import { prisma } from "@/lib/prisma"

// GET /api/power-system - Get all power system todos for the current user
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireUser()
    if (error || !user) return error!

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") // "brain" | "muscle" | "money"
    const date = searchParams.get("date")

    const whereClause: any = { userId: user.id }

    if (category) {
      whereClause.category = category
    }

    if (date) {
      const targetDate = new Date(date)
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999))

      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      }
    }

    const powerSystemTodos = await prisma.powerSystemTodo.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    })

    return jsonOk({ powerSystemTodos })
  } catch (err) {
    console.error("Get power system todos error:", err)
    return jsonError("Internal server error", 500)
  }
}

// POST /api/power-system - Create a new power system todo
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireUser()
    if (error || !user) return error!

    const { title, category, date } = await request.json()

    if (!title || !category) {
      return jsonError("Title and category are required", 400)
    }

    if (!isPowerCategory(category)) {
      return jsonError("Category must be brain, muscle, or money", 400)
    }

    const powerSystemTodo = await prisma.powerSystemTodo.create({
      data: {
        title,
        category,
        date: date ? new Date(date) : new Date(),
        completed: false,
        userId: user.id,
      },
    })

    return jsonOk({ powerSystemTodo }, 201)
  } catch (err) {
    console.error("Create power system todo error:", err)
    return jsonError("Internal server error", 500)
  }
}
