import { NextRequest } from "next/server"
import { requireUser } from "@/lib/server/requireUser"
import { jsonError, jsonOk } from "@/lib/server/http"
import { prisma } from "@/lib/prisma"

// GET /api/behaviors - Get behavior entries for the current user
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireUser()
    if (error || !user) return error!

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit")
    const date = searchParams.get("date")

    const whereClause: any = { userId: user.id }

    if (date) {
      const targetDate = new Date(date)
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999))

      whereClause.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      }
    }

    const behaviorEntries = await prisma.behaviorEntry.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit ? parseInt(limit) : undefined,
    })

    return jsonOk({ behaviorEntries })
  } catch (err) {
    console.error("Get behavior entries error:", err)
    return jsonError("Internal server error", 500)
  }
}

// POST /api/behaviors - Create a new behavior entry
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireUser()
    if (error || !user) return error!

    const { title, value } = await request.json()

    if (!title || !value) {
      return jsonError("Title and value are required", 400)
    }

    const behaviorEntry = await prisma.behaviorEntry.create({
      data: {
        title,
        value,
        userId: user.id,
      },
    })

    return jsonOk({ behaviorEntry }, 201)
  } catch (err) {
    console.error("Create behavior entry error:", err)
    return jsonError("Internal server error", 500)
  }
}
