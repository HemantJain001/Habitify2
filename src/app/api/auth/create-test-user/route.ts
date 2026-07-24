import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

/**
 * Dev helper: create a test user.
 * Disabled in production.
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const email = body.email || "test@attackmode.local"
    const password = body.password || "test1234"
    const name = body.name || "Test User"

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({
        message: "Test user already exists",
        user: { id: existing.id, email: existing.email, name: existing.name },
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        userStats: {
          create: {
            currentStreak: 0,
            longestStreak: 0,
            completionRate: 0,
            totalTasksCompleted: 0,
            totalProblemsAnalyzed: 0,
          },
        },
      },
      select: { id: true, name: true, email: true },
    })

    return NextResponse.json(
      { message: "Test user created", user, password },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create test user error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
