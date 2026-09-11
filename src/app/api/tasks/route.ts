import { NextRequest } from "next/server"
import { requireUser } from "@/lib/server/requireUser"
import { jsonError, jsonOk } from "@/lib/server/http"
import { prisma } from "@/lib/prisma"

// GET /api/tasks - Get all tasks for the current user
export async function GET() {
  try {
    const { user, error } = await requireUser()
    if (error || !user) return error!

    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })

    return jsonOk({ tasks })
  } catch (err) {
    console.error("Get tasks error:", err)
    return jsonError("Internal server error", 500)
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireUser()
    if (error || !user) return error!

    // Verify user exists in database
    const userExists = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true },
    })

    if (!userExists) {
      console.error("User not found in database:", user.id)
      return jsonError("User not found. Please log in again.", 404)
    }

    const { title } = await request.json()

    if (!title) {
      return jsonError("Title is required", 400)
    }

    const task = await prisma.task.create({
      data: {
        title,
        completed: false,
        userId: user.id,
      },
    })

    return jsonOk({ task }, 201)
  } catch (err) {
    console.error("Create task error:", err)
    return jsonError("Internal server error", 500)
  }
}
