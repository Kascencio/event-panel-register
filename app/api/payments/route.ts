import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const paymentUpdate = await request.json()
    const participant = await db.updatePayment(paymentUpdate)
    return NextResponse.json(participant)
  } catch (error) {
    console.error("Error updating payment:", error)
    return NextResponse.json({ error: "Error updating payment" }, { status: 500 })
  }
}
