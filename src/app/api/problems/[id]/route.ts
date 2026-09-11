import { NextRequest } from "next/server"
import { requireUser } from "@/lib/server/requireUser"
import { jsonError, jsonOk } from "@/lib/server/http"
import { prisma } from "@/lib/prisma"

// GET /api/problems/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireUser()
    if (error || !user) return error!

    const { id } = await params

    const problemEntry = await prisma.problemSolvingEntry.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!problemEntry) {
      return jsonError("Problem entry not found", 404)
    }

    return jsonOk({ problemEntry })
  } catch (err) {
    console.error("Get problem entry error:", err)
    return jsonError("Internal server error", 500)
  }
}

// PUT /api/problems/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireUser()
    if (error || !user) return error!

    const { id } = await params
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

    const existingEntry = await prisma.problemSolvingEntry.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingEntry) {
      return jsonError("Problem entry not found", 404)
    }

    const problemEntry = await prisma.problemSolvingEntry.update({
      where: { id },
      data: {
        problemBehavior: problemBehavior || existingEntry.problemBehavior,
        triggerPattern: triggerPattern || existingEntry.triggerPattern,
        isDaily: isDaily !== undefined ? isDaily : existingEntry.isDaily,
        preventiveStrategy,
        wrongPathReaction:
          wrongPathReaction || existingEntry.wrongPathReaction,
        longTermConsequence:
          longTermConsequence || existingEntry.longTermConsequence,
        preferredBehavior:
          preferredBehavior || existingEntry.preferredBehavior,
        positiveOutcome: positiveOutcome || existingEntry.positiveOutcome,
        problemCategory: problemCategory || existingEntry.problemCategory,
        emotionalImpact:
          emotionalImpact !== undefined
            ? emotionalImpact
            : existingEntry.emotionalImpact,
        copingStrategy,
        controlSource: controlSource || existingEntry.controlSource,
        actionablePower,
        longTermSolution,
        isPinned: isPinned !== undefined ? isPinned : existingEntry.isPinned,
      },
    })

    return jsonOk({ problemEntry })
  } catch (err) {
    console.error("Update problem entry error:", err)
    return jsonError("Internal server error", 500)
  }
}

// DELETE /api/problems/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireUser()
    if (error || !user) return error!

    const { id } = await params

    const existingEntry = await prisma.problemSolvingEntry.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingEntry) {
      return jsonError("Problem entry not found", 404)
    }

    await prisma.problemSolvingEntry.delete({
      where: { id },
    })

    await prisma.userStats.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        totalProblemsAnalyzed: 0,
      },
      update: {
        totalProblemsAnalyzed: { decrement: 1 },
      },
    })

    return jsonOk({ success: true })
  } catch (err) {
    console.error("Delete problem entry error:", err)
    return jsonError("Internal server error", 500)
  }
}
