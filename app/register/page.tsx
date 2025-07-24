"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, Send } from "lucide-react"
import Link from "next/link"
import { useParticipants } from "@/hooks/useParticipants"

export default function RegisterPage() {
  const router = useRouter()
  const { createParticipant } = useParticipants()
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    age: "",
    email: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createParticipant({
        fullName: formData.fullName,
        phone: formData.phone,
        age: formData.age,
        email: formData.email,
        paymentStatus: "unpaid",
        totalAmount: 100,
        paidAmount: 0,
        qrCode: null,
      })

      setShowSuccess(true)

      // Reset form
      setFormData({
        fullName: "",
        phone: "",
        age: "",
        email: "",
      })

      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error registering participant:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-4 flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800 max-w-md w-full">
          <CardContent className="text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">¡Registro Exitoso!</h2>
            <p className="text-gray-400 mb-6">El participante ha sido registrado exitosamente.</p>
            <Button onClick={() => setShowSuccess(false)} className="w-full bg-blue-600 hover:bg-blue-700">
              Registrar Otro Participante
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8 pt-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">Registro de Participante</h1>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-xl">Información del Participante</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white">
                  Nombre Completo *
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  placeholder="Ingrese el nombre completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">
                  Teléfono *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  placeholder="Ej: +1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="text-white">
                  Edad *
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  placeholder="Ingrese la edad"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Correo Electrónico (Opcional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <Send className="h-5 w-5 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Registrar Participante
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
