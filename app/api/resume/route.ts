import { NextResponse } from "next/server"
import { getResumePage } from "@/lib/notion"

export async function GET() {
  try {
    const resume = await getResumePage()
    return NextResponse.json(resume)
  } catch (error) {
    console.error("Failed to fetch resume:", error)
    return NextResponse.json({ error: "Failed to fetch resume" }, { status: 500 })
  }
}
