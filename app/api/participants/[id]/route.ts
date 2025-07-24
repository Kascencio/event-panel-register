import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import QRCode from "qrcode"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const participant = await db.getParticipant(params.id)
    if (!participant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 })
    }
    return NextResponse.json(participant)
  } catch (error) {
    console.error("Error fetching participant:", error)
    return NextResponse.json({ error: "Error fetching participant" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()

    // Si se actualiza información crítica, regenerar QR
    if (updates.fullName || updates.paymentStatus) {
      const currentParticipant = await db.getParticipant(params.id)
      if (currentParticipant) {
        const qrData = JSON.stringify({
          id: params.id,
          name: updates.fullName || currentParticipant.fullName,
          paymentStatus: updates.paymentStatus || currentParticipant.paymentStatus,
        })
        updates.qrCode = await QRCode.toDataURL(qrData)
      }
    }

    const participant = await db.updateParticipant(params.id, updates)
    return NextResponse.json(participant)
  } catch (error) {
    console.error("Error updating participant:", error)
    return NextResponse.json({ error: "Error updating participant" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await db.deleteParticipant(params.id)
    if (!success) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting participant:", error)
    return NextResponse.json({ error: "Error deleting participant" }, { status: 500 })
  }
}
