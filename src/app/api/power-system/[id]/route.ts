import { NextRequest } from "next/server"
import { requireUser } from "@/lib/server/requireUser"
import { jsonError, jsonOk } from "@/lib/server/http"
import { isPowerCategory } from "@/lib/server/constants"
import { prisma } from "@/lib/prisma"

// PUT /api/power-system/[id] - Update a power system todo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireUser()
    if (error || !user) return error!

    const { id } = await params
    const { title, category, completed, date } = await request.json()

    if (category !== undefined && !isPowerCategory(category)) {
      return jsonError("Category must be brain, muscle, or money", 400)
    }

    const updateData: {
      title?: string
      category?: string
      date?: Date
      completed?: boolean
      updatedAt: Date
    } = { updatedAt: new Date() }
    if (title !== undefined) updateData.title = title
    if (category !== undefined) updateData.category = category
    if (date !== undefined) updateData.date = new Date(date)
    if (completed !== undefined) updateData.completed = completed

    const updated = await prisma.powerSystemTodo.updateMany({
      where: { id, userId: user.id },
      data: updateData,
    })

    if (updated.count === 0) {
      return jsonError("Power system todo not found", 404)
    }

    const powerSystemTodo = await prisma.powerSystemTodo.findFirst({
      where: { id, userId: user.id },
      select: {
        id: true,
        title: true,
        category: true,
        completed: true,
        date: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    })

    if (!powerSystemTodo) {
      return jsonError("Power system todo not found", 404)
    }

    return jsonOk({
      powerSystemTodo,
      updatedFields: Object.keys(updateData).filter((key) => key !== "updatedAt"),
    })
  } catch (err) {
    console.error("Update power system todo error:", err)
    return jsonError("Internal server error", 500)
  }
}

// DELETE /api/power-system/[id] - Delete a power system todo
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireUser()
    if (error || !user) return error!

    const { id } = await params

    // Verify todo belongs to user
    const existingTodo = await prisma.powerSystemTodo.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingTodo) {
      return jsonError("Power system todo not found", 404)
    }

    await prisma.powerSystemTodo.delete({
      where: { id },
    })

    return jsonOk({ message: "Power system todo deleted successfully" })
  } catch (err) {
    console.error("Delete power system todo error:", err)
    return jsonError("Internal server error", 500)
  }
}
