import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/problems/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const problemEntry = await prisma.problemSolvingEntry.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!problemEntry) {
      return NextResponse.json(
        { error: "Problem entry not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ problemEntry })
  } catch (error) {
    console.error("Get problem entry error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/problems/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
        userId: session.user.id,
      },
    })

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Problem entry not found" },
        { status: 404 }
      )
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

    return NextResponse.json({ problemEntry })
  } catch (error) {
    console.error("Update problem entry error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/problems/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existingEntry = await prisma.problemSolvingEntry.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Problem entry not found" },
        { status: 404 }
      )
    }

    await prisma.problemSolvingEntry.delete({
      where: { id },
    })

    await prisma.userStats.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        totalProblemsAnalyzed: 0,
      },
      update: {
        totalProblemsAnalyzed: { decrement: 1 },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete problem entry error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
