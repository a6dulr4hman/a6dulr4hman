import { NextResponse } from "next/server"
import { getPublishedPosts } from "@/lib/notion"

export async function GET() {
  try {
    const posts = await getPublishedPosts()
    return NextResponse.json(posts)
  } catch (error) {
    console.error("Failed to fetch blog posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    )
  }
}
