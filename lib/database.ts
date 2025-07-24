import { prisma } from "./prisma"
import { PaymentStatus } from "@prisma/client"
import QRCode from "qrcode"

export interface Participant {
  id: string
  fullName: string
  phone: string
  age: string
  email: string | null
  paymentStatus: "paid" | "unpaid" | "partial"
  totalAmount: number
  paidAmount: number
  qrCode: string | null
  registeredAt: string
  updatedAt: string
  version: number
}

export interface PaymentUpdate {
  participantId: string
  paidAmount: number
  totalAmount: number
  paymentStatus: "paid" | "unpaid" | "partial"
  updatedBy: string
  timestamp: string
}

// Convertir enum de Prisma a string
const convertPaymentStatus = (status: PaymentStatus): "paid" | "unpaid" | "partial" => {
  switch (status) {
    case PaymentStatus.PAID:
      return "paid"
    case PaymentStatus.UNPAID:
      return "unpaid"
    case PaymentStatus.PARTIAL:
      return "partial"
    default:
      return "unpaid"
  }
}

// Convertir string a enum de Prisma
const convertToPaymentStatusEnum = (status: "paid" | "unpaid" | "partial"): PaymentStatus => {
  switch (status) {
    case "paid":
      return PaymentStatus.PAID
    case "unpaid":
      return PaymentStatus.UNPAID
    case "partial":
      return PaymentStatus.PARTIAL
    default:
      return PaymentStatus.UNPAID
  }
}

// Convertir participante de Prisma a nuestro formato
const convertParticipant = (participant: any): Participant => ({
  id: participant.id,
  fullName: participant.fullName,
  phone: participant.phone,
  age: participant.age,
  email: participant.email,
  paymentStatus: convertPaymentStatus(participant.paymentStatus),
  totalAmount: participant.totalAmount,
  paidAmount: participant.paidAmount,
  qrCode: participant.qrCode,
  registeredAt: participant.registeredAt.toISOString(),
  updatedAt: participant.updatedAt.toISOString(),
  version: participant.version,
})

export class DatabaseService {
  async getParticipants(): Promise<Participant[]> {
    const participants = await prisma.participant.findMany({
      orderBy: { registeredAt: "desc" },
    })
    return participants.map(convertParticipant)
  }

  async getParticipant(id: string): Promise<Participant | null> {
    const participant = await prisma.participant.findUnique({
      where: { id },
    })
    return participant ? convertParticipant(participant) : null
  }

  async createParticipant(
    participantData: Omit<Participant, "id" | "registeredAt" | "updatedAt" | "version">,
  ): Promise<Participant> {
    // Generar QR automáticamente
    const qrData = JSON.stringify({
      id: "temp", // Se actualizará después
      name: participantData.fullName,
      paymentStatus: participantData.paymentStatus,
    })
    const qrCode = await QRCode.toDataURL(qrData)

    const participant = await prisma.participant.create({
      data: {
        fullName: participantData.fullName,
        phone: participantData.phone,
        age: participantData.age,
        email: participantData.email,
        paymentStatus: convertToPaymentStatusEnum(participantData.paymentStatus),
        totalAmount: participantData.totalAmount,
        paidAmount: participantData.paidAmount,
        qrCode: qrCode,
        createdBy: "system",
        updatedBy: "system",
      },
    })

    // Actualizar QR con el ID real
    const realQrData = JSON.stringify({
      id: participant.id,
      name: participant.fullName,
      paymentStatus: participantData.paymentStatus,
    })
    const realQrCode = await QRCode.toDataURL(realQrData)

    const updatedParticipant = await prisma.participant.update({
      where: { id: participant.id },
      data: { qrCode: realQrCode },
    })

    return convertParticipant(updatedParticipant)
  }

  async updateParticipant(id: string, updates: Partial<Participant>): Promise<Participant> {
    const updateData: any = {}

    if (updates.fullName) updateData.fullName = updates.fullName
    if (updates.phone) updateData.phone = updates.phone
    if (updates.age) updateData.age = updates.age
    if (updates.email !== undefined) updateData.email = updates.email
    if (updates.paymentStatus) updateData.paymentStatus = convertToPaymentStatusEnum(updates.paymentStatus)
    if (updates.totalAmount !== undefined) updateData.totalAmount = updates.totalAmount
    if (updates.paidAmount !== undefined) updateData.paidAmount = updates.paidAmount
    if (updates.qrCode !== undefined) updateData.qrCode = updates.qrCode

    updateData.updatedBy = "admin"

    const participant = await prisma.participant.update({
      where: { id },
      data: updateData,
    })

    return convertParticipant(participant)
  }

  async deleteParticipant(id: string): Promise<boolean> {
    try {
      await prisma.participant.delete({
        where: { id },
      })
      return true
    } catch (error) {
      return false
    }
  }

  async updatePayment(update: PaymentUpdate): Promise<Participant> {
    // Obtener datos actuales para el historial
    const currentParticipant = await prisma.participant.findUnique({
      where: { id: update.participantId },
    })

    if (!currentParticipant) {
      throw new Error("Participant not found")
    }

    // Actualizar participante
    const updatedParticipant = await prisma.participant.update({
      where: { id: update.participantId },
      data: {
        paidAmount: update.paidAmount,
        totalAmount: update.totalAmount,
        paymentStatus: convertToPaymentStatusEnum(update.paymentStatus),
        updatedBy: update.updatedBy,
      },
    })

    // Crear registro en historial
    await prisma.paymentHistory.create({
      data: {
        participantId: update.participantId,
        previousPaidAmount: currentParticipant.paidAmount,
        newPaidAmount: update.paidAmount,
        previousTotalAmount: currentParticipant.totalAmount,
        newTotalAmount: update.totalAmount,
        previousStatus: currentParticipant.paymentStatus,
        newStatus: convertToPaymentStatusEnum(update.paymentStatus),
        updatedBy: update.updatedBy,
      },
    })

    return convertParticipant(updatedParticipant)
  }

  async getPaymentHistory(participantId: string): Promise<PaymentUpdate[]> {
    const history = await prisma.paymentHistory.findMany({
      where: { participantId },
      orderBy: { updatedAt: "desc" },
    })

    return history.map((h) => ({
      participantId: h.participantId,
      paidAmount: h.newPaidAmount,
      totalAmount: h.newTotalAmount,
      paymentStatus: convertPaymentStatus(h.newStatus),
      updatedBy: h.updatedBy,
      timestamp: h.updatedAt.toISOString(),
    }))
  }

  async createScanSession(participantId: string, scannedBy?: string, deviceInfo?: string): Promise<void> {
    await prisma.scanSession.create({
      data: {
        participantId,
        scannedBy,
        deviceInfo,
      },
    })
  }
}

export const db = new DatabaseService()
