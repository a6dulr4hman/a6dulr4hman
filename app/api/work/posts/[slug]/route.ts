import { NextResponse } from "next/server"
import { getWorkBySlug } from "@/lib/notion"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const post = await getWorkBySlug(slug)

    if (!post) {
      return NextResponse.json(
        { error: "Case study not found" },
        { status: 404 },
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("Failed to fetch case study:", error)
    return NextResponse.json(
      { error: "Failed to fetch case study" },
      { status: 500 },
    )
  }
}