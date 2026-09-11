import { NextRequest } from "next/server"
import { requireUser } from "@/lib/server/requireUser"
import { jsonError, jsonOk } from "@/lib/server/http"
import { prisma } from "@/lib/prisma"

// GET /api/journal - Get journal entries for the current user
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireUser()
    if (error || !user) return error!

    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const limit = searchParams.get("limit")

    const whereClause: any = { userId: user.id }

    if (date) {
      const targetDate = new Date(date)
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999))

      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      }
    }

    const journalEntries = await prisma.journalEntry.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
      take: limit ? parseInt(limit) : undefined,
    })

    return jsonOk({ journalEntries })
  } catch (err) {
    console.error("Get journal entries error:", err)
    return jsonError("Internal server error", 500)
  }
}

// POST /api/journal - Create a new journal entry
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireUser()
    if (error || !user) return error!

    const { date, notes, mood } = await request.json()

    const entryDate = date || new Date().toISOString().split("T")[0]

    // Check if journal entry already exists for this date
    const existingEntry = await prisma.journalEntry.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: new Date(new Date(entryDate).setHours(0, 0, 0, 0)),
          lt: new Date(new Date(entryDate).setHours(23, 59, 59, 999)),
        },
      },
    })

    if (existingEntry) {
      return jsonError("Journal entry already exists for this date", 409)
    }

    const journalEntry = await prisma.journalEntry.create({
      data: {
        date: new Date(entryDate),
        notes: notes || "",
        mood: mood || 5,
        userId: user.id,
      },
    })

    return jsonOk({ journalEntry }, 201)
  } catch (err) {
    console.error("Create journal entry error:", err)
    return jsonError("Internal server error", 500)
  }
}
