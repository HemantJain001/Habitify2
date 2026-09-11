import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"

const DOCS: Record<string, string> = {
  review: "INTERVIEW_ENGINEERING_REVIEW.md",
  design: "INTERVIEW_DESIGN_DOCUMENT.md",
  architecture: "ARCHITECTURE.md",
  juspay: "JUSPAY_FINAL_ROUND_PREP.md",
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const filename = DOCS[slug]

  if (!filename) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  try {
    const filePath = path.join(process.cwd(), "docs", filename)
    const markdown = await readFile(filePath, "utf8")

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "private, max-age=60",
      },
    })
  } catch {
    return NextResponse.json(
      { error: "Document could not be read" },
      { status: 500 }
    )
  }
}
