import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

/**
 * Edge auth gate (defense in depth).
 *
 * - Unauthenticated pages → redirect `/auth/signin`
 * - Unauthenticated data APIs → 401 JSON
 * - Handlers still call getServerSession / requireUser + userId filters
 *   (middleware authenticates; handlers authorize).
 *
 * AuthGuard is client UX only (session hydration), not the security boundary.
 */
export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (token?.sub) {
    return NextResponse.next()
  }

  const { pathname } = req.nextUrl

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const signIn = new URL("/auth/signin", req.url)
  signIn.searchParams.set("callbackUrl", pathname)
  return NextResponse.redirect(signIn)
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/stats/:path*",
    "/behavior-history/:path*",
    "/solved-problems/:path*",
    "/api/tasks/:path*",
    "/api/power-system/:path*",
    "/api/journal/:path*",
    "/api/behaviors/:path*",
    "/api/problems/:path*",
    "/api/user/:path*",
    "/api/analytics/:path*",
    "/api/ai/:path*",
  ],
}
