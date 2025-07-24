"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Share } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Participant {
  id: string
  fullName: string
  phone: string
  age: string
  email: string
  paymentStatus: "paid" | "unpaid" | "partial"
  totalAmount: number
  paidAmount: number
  qrCode: string
  registeredAt: string
}

export default function QRDisplayPage({ params }: { params: { id: string } }) {
  const [participant, setParticipant] = useState<Participant | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("participants")
    if (stored) {
      const participants: Participant[] = JSON.parse(stored)
      const found = participants.find((p) => p.id === params.id)
      setParticipant(found || null)
    }
  }, [params.id])

  const downloadQR = () => {
    if (participant?.qrCode) {
      const link = document.createElement("a")
      link.download = `QR_${participant.fullName.replace(/\s+/g, "_")}.png`
      link.href = participant.qrCode
      link.click()
    }
  }

  const shareQR = async () => {
    if (participant && navigator.share) {
      try {
        await navigator.share({
          title: `QR Code - ${participant.fullName}`,
          text: `Código QR para ${participant.fullName}`,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    }
  }

  if (!participant) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-4 flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-8 text-center">
            <p className="text-gray-400">Participante no encontrado</p>
            <Link href="/admin/dashboard">
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">Volver al Panel</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8 pt-4">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">Código QR</h1>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-center">{participant.fullName}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-white p-8 rounded-lg inline-block mb-6">
              {participant.qrCode && (
                <Image
                  src={participant.qrCode || "/placeholder.svg"}
                  alt={`QR Code for ${participant.fullName}`}
                  width={256}
                  height={256}
                  className="mx-auto"
                />
              )}
            </div>

            <div className="bg-gray-800 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-white font-semibold mb-2">Información del Participante:</h3>
              <div className="space-y-1 text-sm text-gray-300">
                <div>
                  <strong>ID:</strong> {participant.id}
                </div>
                <div>
                  <strong>Teléfono:</strong> {participant.phone}
                </div>
                <div>
                  <strong>Edad:</strong> {participant.age}
                </div>
                {participant.email && (
                  <div>
                    <strong>Email:</strong> {participant.email}
                  </div>
                )}
                <div>
                  <strong>Estado:</strong>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-xs ${
                      participant.paymentStatus === "paid"
                        ? "bg-green-600"
                        : participant.paymentStatus === "partial"
                          ? "bg-yellow-600"
                          : "bg-red-600"
                    }`}
                  >
                    {participant.paymentStatus === "paid"
                      ? "Pagado"
                      : participant.paymentStatus === "partial"
                        ? "Abonado"
                        : "No Pagado"}
                  </span>
                </div>
                <div>
                  <strong>Pagado:</strong> ${participant.paidAmount} / ${participant.totalAmount}
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={downloadQR} className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Descargar QR
              </Button>
              {navigator.share && (
                <Button onClick={shareQR} variant="outline" className="border-gray-600 bg-transparent">
                  <Share className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
              )}
            </div>

            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-400">
                Este código QR contiene la información del participante y puede ser escaneado en el evento para
                verificar el acceso y estado de pago.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
