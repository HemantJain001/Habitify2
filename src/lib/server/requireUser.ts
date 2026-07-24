import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { jsonError } from "@/lib/server/http"

export async function requireUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { user: null, error: jsonError("Unauthorized", 401) }
  }

  return {
    user: {
      id: session.user.id,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
    },
    error: null,
  }
}
