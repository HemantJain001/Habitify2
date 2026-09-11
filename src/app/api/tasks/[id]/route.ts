import { NextRequest } from "next/server"
import { requireUser } from "@/lib/server/requireUser"
import { jsonError, jsonOk } from "@/lib/server/http"
import { prisma } from "@/lib/prisma"

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireUser()
    if (error || !user) return error!

    const { id } = await params

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!task) {
      return jsonError("Task not found", 404)
    }

    return jsonOk({ task })
  } catch (err) {
    console.error("Get task error:", err)
    return jsonError("Internal server error", 500)
  }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireUser()
    if (error || !user) return error!

    const { id } = await params

    const { title, completed } = await request.json()

    const updateData: {
      title?: string
      completed?: boolean
      completedAt?: Date | null
    } = {}
    if (title !== undefined) updateData.title = title
    if (completed !== undefined) {
      updateData.completed = completed
      updateData.completedAt = completed ? new Date() : null
    }

    let flippedCompletion = false

    if (completed !== undefined) {
      // Ownership-scoped flip: only matches when completion actually changes
      const flipped = await prisma.task.updateMany({
        where: { id, userId: user.id, completed: !completed },
        data: updateData,
      })

      if (flipped.count === 1) {
        flippedCompletion = true
      } else {
        const updated = await prisma.task.updateMany({
          where: { id, userId: user.id },
          data: updateData,
        })
        if (updated.count === 0) {
          return jsonError("Task not found", 404)
        }
      }
    } else {
      const updated = await prisma.task.updateMany({
        where: { id, userId: user.id },
        data: updateData,
      })
      if (updated.count === 0) {
        return jsonError("Task not found", 404)
      }
    }

    const task = await prisma.task.findFirst({
      where: { id, userId: user.id },
    })

    if (!task) {
      return jsonError("Task not found", 404)
    }

    if (flippedCompletion) {
      await prisma.userStats.update({
        where: { userId: user.id },
        data: {
          totalTasksCompleted: completed
            ? { increment: 1 }
            : { decrement: 1 },
        },
      })
    }

    return jsonOk({ task })
  } catch (err) {
    console.error("Update task error:", err)
    return jsonError("Internal server error", 500)
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireUser()
    if (error || !user) return error!

    const { id } = await params

    // Verify task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingTask) {
      return jsonError("Task not found", 404)
    }

    await prisma.task.delete({
      where: { id },
    })

    // Update user stats if completed task was deleted
    if (existingTask.completed) {
      await prisma.userStats.update({
        where: { userId: user.id },
        data: {
          totalTasksCompleted: {
            decrement: 1,
          },
        },
      })
    }

    return jsonOk({ message: "Task deleted successfully" })
  } catch (err) {
    console.error("Delete task error:", err)
    return jsonError("Internal server error", 500)
  }
}
