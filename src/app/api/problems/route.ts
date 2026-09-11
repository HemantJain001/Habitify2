import { NextRequest } from "next/server"
import { requireUser } from "@/lib/server/requireUser"
import { jsonError, jsonOk } from "@/lib/server/http"
import { prisma } from "@/lib/prisma"

// GET /api/problems - Get problem solving entries for the current user
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireUser()
    if (error || !user) return error!

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit")
    const category = searchParams.get("category")

    const whereClause: any = { userId: user.id }

    if (category) {
      whereClause.problemCategory = category
    }

    const problemEntries = await prisma.problemSolvingEntry.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit ? parseInt(limit) : undefined,
    })

    return jsonOk({ problemEntries })
  } catch (err) {
    console.error("Get problem entries error:", err)
    return jsonError("Internal server error", 500)
  }
}

// POST /api/problems - Create a new problem solving entry
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireUser()
    if (error || !user) return error!

    const {
      problemBehavior,
      triggerPattern,
      isDaily,
      preventiveStrategy,
      wrongPathReaction,
      longTermConsequence,
      preferredBehavior,
      positiveOutcome,
      problemCategory,
      emotionalImpact,
      copingStrategy,
      controlSource,
      actionablePower,
      longTermSolution,
      isPinned,
    } = await request.json()

    if (!problemBehavior || !triggerPattern) {
      return jsonError("Problem behavior and trigger pattern are required", 400)
    }

    const problemEntry = await prisma.problemSolvingEntry.create({
      data: {
        problemBehavior,
        triggerPattern,
        isDaily: isDaily || false,
        preventiveStrategy,
        wrongPathReaction: wrongPathReaction || "",
        longTermConsequence: longTermConsequence || "",
        preferredBehavior: preferredBehavior || "",
        positiveOutcome: positiveOutcome || "",
        problemCategory: problemCategory || "general",
        emotionalImpact: emotionalImpact || 50,
        copingStrategy,
        controlSource: controlSource || "",
        actionablePower,
        longTermSolution,
        isPinned: isPinned || false,
        userId: user.id,
      },
    })

    await prisma.userStats.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        totalProblemsAnalyzed: 1,
      },
      update: {
        totalProblemsAnalyzed: { increment: 1 },
      },
    })

    return jsonOk({ problemEntry }, 201)
  } catch (err) {
    console.error("Create problem entry error:", err)
    return jsonError("Internal server error", 500)
  }
}
