import { requireUser } from "@/lib/server/requireUser"
import { jsonError, jsonOk } from "@/lib/server/http"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const { user: sessionUser, error } = await requireUser()
    if (error || !sessionUser) return error!

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        userStats: true,
      },
    })

    if (!user) {
      return jsonError("User not found", 404)
    }

    return jsonOk({ user })
  } catch (err) {
    console.error("Get user profile error:", err)
    return jsonError("Internal server error", 500)
  }
}
