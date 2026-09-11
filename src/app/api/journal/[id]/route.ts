import { NextRequest } from "next/server"
import { requireUser } from "@/lib/server/requireUser"
import { jsonError, jsonOk } from "@/lib/server/http"
import { prisma } from "@/lib/prisma"

// GET /api/journal/[id] - Get a specific journal entry
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireUser()
    if (error || !user) return error!

    const { id } = await params

    const journalEntry = await prisma.journalEntry.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!journalEntry) {
      return jsonError("Journal entry not found", 404)
    }

    return jsonOk({ journalEntry })
  } catch (err) {
    console.error("Get journal entry error:", err)
    return jsonError("Internal server error", 500)
  }
}

// PUT /api/journal/[id] - Update a journal entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireUser()
    if (error || !user) return error!

    const { id } = await params
    const { notes, mood } = await request.json()

    // Verify journal entry belongs to user
    const existingEntry = await prisma.journalEntry.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingEntry) {
      return jsonError("Journal entry not found", 404)
    }

    const updateData: any = {}
    if (notes !== undefined) updateData.notes = notes
    if (mood !== undefined) updateData.mood = mood

    const journalEntry = await prisma.journalEntry.update({
      where: { id },
      data: updateData,
    })

    return jsonOk({ journalEntry })
  } catch (err) {
    console.error("Update journal entry error:", err)
    return jsonError("Internal server error", 500)
  }
}

// DELETE /api/journal/[id] - Delete a journal entry
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireUser()
    if (error || !user) return error!

    const { id } = await params

    // Verify journal entry belongs to user
    const existingEntry = await prisma.journalEntry.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingEntry) {
      return jsonError("Journal entry not found", 404)
    }

    await prisma.journalEntry.delete({
      where: { id },
    })

    return jsonOk({ message: "Journal entry deleted successfully" })
  } catch (err) {
    console.error("Delete journal entry error:", err)
    return jsonError("Internal server error", 500)
  }
}
