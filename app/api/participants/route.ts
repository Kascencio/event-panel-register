import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET() {
  try {
    const participants = await db.getParticipants()
    return NextResponse.json(participants)
  } catch (error) {
    console.error("Error fetching participants:", error)
    return NextResponse.json({ error: "Error fetching participants" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const participantData = await request.json()
    const participant = await db.createParticipant(participantData)
    return NextResponse.json(participant)
  } catch (error) {
    console.error("Error creating participant:", error)
    return NextResponse.json({ error: "Error creating participant" }, { status: 500 })
  }
}
