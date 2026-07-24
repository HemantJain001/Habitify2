import { NextRequest } from "next/server"
import { POST as signupPost } from "../signup/route"

/** Alias for /api/auth/signup */
export async function POST(request: NextRequest) {
  return signupPost(request)
}
