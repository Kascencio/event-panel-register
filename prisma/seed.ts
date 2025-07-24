import { PrismaClient, PaymentStatus } from "@prisma/client"
import QRCode from "qrcode"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...")

  // Crear algunos participantes de ejemplo
  const participants = [
    {
      fullName: "Juan Pérez",
      phone: "+1234567890",
      age: "25",
      email: "juan@example.com",
      paymentStatus: PaymentStatus.PAID,
      totalAmount: 100,
      paidAmount: 100,
    },
    {
      fullName: "María García",
      phone: "+1234567891",
      age: "30",
      email: "maria@example.com",
      paymentStatus: PaymentStatus.PARTIAL,
      totalAmount: 100,
      paidAmount: 50,
    },
    {
      fullName: "Carlos López",
      phone: "+1234567892",
      age: "28",
      email: null,
      paymentStatus: PaymentStatus.UNPAID,
      totalAmount: 100,
      paidAmount: 0,
    },
  ]

  for (const participantData of participants) {
    // Generar QR para cada participante
    const qrData = JSON.stringify({
      id: "temp",
      name: participantData.fullName,
      paymentStatus: participantData.paymentStatus.toLowerCase(),
    })
    const qrCode = await QRCode.toDataURL(qrData)

    const participant = await prisma.participant.create({
      data: {
        ...participantData,
        qrCode,
        createdBy: "seed",
        updatedBy: "seed",
      },
    })

    // Actualizar QR con ID real
    const realQrData = JSON.stringify({
      id: participant.id,
      name: participant.fullName,
      paymentStatus: participantData.paymentStatus.toLowerCase(),
    })
    const realQrCode = await QRCode.toDataURL(realQrData)

    await prisma.participant.update({
      where: { id: participant.id },
      data: { qrCode: realQrCode },
    })

    console.log("✅ Participante creado:", participant.fullName)
  }

  console.log("🎉 Seed completado exitosamente!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Error en seed:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
