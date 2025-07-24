import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { id, fullName, phone, age } = await req.json()

    const formData = new FormData()
    formData.append("id_participant", id)
    formData.append("full_name", fullName)
    formData.append("phone_number", phone)
    formData.append("age", age)

    const response = await fetch("https://simple-koi-charmed.ngrok-free.app/generate_qr_and_send", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Error desde el backend Python:", errorText)
      return NextResponse.json({ success: false, message: "Error enviando QR", error: errorText }, { status: 500 })
    }

    const result = await response.json()
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error("❌ Error interno:", err)
    return NextResponse.json(
      { success: false, message: "Error interno del servidor", error: err instanceof Error ? err.message : err },
      { status: 500 },
    )
  }
}
