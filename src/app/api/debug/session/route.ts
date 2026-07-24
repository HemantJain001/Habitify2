import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 })
  }

  try {
    const session = await getServerSession(authOptions)

    return NextResponse.json({
      hasSession: !!session,
      hasUser: !!session?.user,
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id,
    })
  } catch (error) {
    console.error("Debug session error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
