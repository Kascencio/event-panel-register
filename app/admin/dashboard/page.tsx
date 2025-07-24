"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useParticipants } from "@/hooks/useParticipants"
import {
  ArrowLeft,
  Users,
  Edit,
  Trash2,
  LogOut,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  RefreshCw,
  DollarSign,
  QrCode,
  Send,
  TrendingUp,
  Percent,
} from "lucide-react"
import Link from "next/link"
import type { Participant } from "@/lib/database"

export default function AdminDashboard() {
  const router = useRouter()
  const {
    participants,
    loading,
    error,
    stats,
    createParticipant,
    updateParticipant,
    deleteParticipant,
    updatePayment,
    regenerateQR,
    refreshData,
  } = useParticipants()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Participant>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [regeneratingQR, setRegeneratingQR] = useState<string | null>(null)
  const [newParticipant, setNewParticipant] = useState({
    fullName: "",
    phone: "",
    age: "",
    email: "",
    totalAmount: 100,
    paidAmount: 0,
  })

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn")
    if (!isLoggedIn) {
      router.push("/admin/login")
      return
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn")
    router.push("/")
  }

  const handleEdit = (participant: Participant) => {
    setEditingId(participant.id)
    setEditForm(participant)
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editForm) return

    try {
      await updateParticipant(editingId, editForm)
      setEditingId(null)
      setEditForm({})
    } catch (err) {
      console.error("Error saving edit:", err)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro de que desea eliminar este registro?")) {
      try {
        await deleteParticipant(id)
      } catch (err) {
        console.error("Error deleting participant:", err)
      }
    }
  }

  const handleRegenerateQR = async (participantId: string, participantName: string) => {
    try {
      setRegeneratingQR(participantId)
      const result = await regenerateQR(participantId)
      alert(`QR regenerado exitosamente para ${participantName}`)
    } catch (err) {
      console.error("Error regenerating QR:", err)
      alert("Error al regenerar el QR")
    } finally {
      setRegeneratingQR(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Pagado
          </Badge>
        )
      case "unpaid":
        return (
          <Badge className="bg-red-600 hover:bg-red-700">
            <XCircle className="h-3 w-3 mr-1" />
            No Pagado
          </Badge>
        )
      case "partial":
        return (
          <Badge className="bg-yellow-600 hover:bg-yellow-700">
            <AlertCircle className="h-3 w-3 mr-1" />
            Abonado
          </Badge>
        )
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  const handleAddParticipant = async () => {
    try {
      await createParticipant({
        fullName: newParticipant.fullName,
        phone: newParticipant.phone,
        age: newParticipant.age,
        email: newParticipant.email,
        paymentStatus:
          newParticipant.paidAmount >= newParticipant.totalAmount
            ? "paid"
            : newParticipant.paidAmount > 0
              ? "partial"
              : "unpaid",
        totalAmount: newParticipant.totalAmount,
        paidAmount: newParticipant.paidAmount,
        qrCode: null,
      })

      setNewParticipant({
        fullName: "",
        phone: "",
        age: "",
        email: "",
        totalAmount: 300,
        paidAmount: 0,
      })
      setShowAddForm(false)

      alert(`Participante agregado exitosamente`)
    } catch (error) {
      console.error("Error adding participant:", error)
    }
  }

  const handlePaymentUpdate = async (id: string, paidAmount: number, totalAmount: number) => {
    try {
      await updatePayment(id, paidAmount, totalAmount)
    } catch (err) {
      console.error("Error updating payment:", err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-400">Cargando participantes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 pt-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">Panel de Administrador</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={refreshData} variant="outline" className="border-gray-700 bg-transparent">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Agregar Participante
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:text-white bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {error && (
          <Card className="bg-red-900/30 border-red-400 mb-8">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-400">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulario para agregar participante */}
        {showAddForm && (
          <Card className="bg-gray-900 border-gray-800 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Agregar Nuevo Participante</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-white">Nombre Completo</Label>
                  <Input
                    value={newParticipant.fullName}
                    onChange={(e) => setNewParticipant({ ...newParticipant, fullName: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <Label className="text-white">Teléfono</Label>
                  <Input
                    value={newParticipant.phone}
                    onChange={(e) => setNewParticipant({ ...newParticipant, phone: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="+1234567890"
                  />
                </div>
                <div>
                  <Label className="text-white">Edad</Label>
                  <Input
                    type="number"
                    value={newParticipant.age}
                    onChange={(e) => setNewParticipant({ ...newParticipant, age: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="25"
                  />
                </div>
                <div>
                  <Label className="text-white">Email (Opcional)</Label>
                  <Input
                    type="email"
                    value={newParticipant.email}
                    onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div>
                  <Label className="text-white">Monto Total ($)</Label>
                  <Input
                    type="number"
                    value={newParticipant.totalAmount}
                    onChange={(e) => setNewParticipant({ ...newParticipant, totalAmount: Number(e.target.value) })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label className="text-white">Monto Pagado ($)</Label>
                  <Input
                    type="number"
                    value={newParticipant.paidAmount}
                    onChange={(e) => setNewParticipant({ ...newParticipant, paidAmount: Number(e.target.value) })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddParticipant} className="bg-green-600 hover:bg-green-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Agregar Participante
                </Button>
                <Button
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                  className="border-gray-600 bg-transparent"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estadísticas Mejoradas */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {/* Estadísticas básicas */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-gray-400">Total Registrados</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.paid}</div>
              <div className="text-sm text-gray-400">Pagados</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.partial}</div>
              <div className="text-sm text-gray-400">Abonados</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.unpaid}</div>
              <div className="text-sm text-gray-400">No Pagados</div>
            </CardContent>
          </Card>

          {/* Estadísticas financieras */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">${stats.totalRevenue}</div>
              <div className="text-sm text-gray-400">Recaudado</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">${stats.expectedRevenue}</div>
              <div className="text-sm text-gray-400">Esperado</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                ${stats.pendingRevenue || stats.expectedRevenue - stats.totalRevenue}
              </div>
              <div className="text-sm text-gray-400">Pendiente</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <Percent className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {stats.collectionRate?.toFixed(1) || ((stats.totalRevenue / stats.expectedRevenue) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400">Cobranza</div>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas adicionales */}
        {stats.paymentBreakdown && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-green-900/20 border-green-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-400 text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Pagados Completos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-1">${stats.paymentBreakdown.paid.amount}</div>
                <div className="text-sm text-green-300">{stats.paymentBreakdown.paid.count} personas</div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-900/20 border-yellow-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-yellow-400 text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Pagos Parciales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-1">${stats.paymentBreakdown.partial.amount}</div>
                <div className="text-sm text-yellow-300">{stats.paymentBreakdown.partial.count} personas</div>
                <div className="text-xs text-yellow-200 mt-1">Falta: ${stats.paymentBreakdown.partial.pending}</div>
              </CardContent>
            </Card>

            <Card className="bg-red-900/20 border-red-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-400 text-lg flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  Sin Pagar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-1">${stats.paymentBreakdown.unpaid.amount}</div>
                <div className="text-sm text-red-300">{stats.paymentBreakdown.unpaid.count} personas</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de Participantes */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Participantes Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No hay participantes registrados</div>
            ) : (
              <div className="space-y-4">
                {participants.map((participant) => (
                  <div key={participant.id} className="bg-gray-800 rounded-lg p-4">
                    {editingId === participant.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-white">Nombre Completo</Label>
                            <Input
                              value={editForm.fullName || ""}
                              onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Teléfono</Label>
                            <Input
                              value={editForm.phone || ""}
                              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Edad</Label>
                            <Input
                              value={editForm.age || ""}
                              onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Email</Label>
                            <Input
                              value={editForm.email || ""}
                              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Monto Total</Label>
                            <Input
                              type="number"
                              value={editForm.totalAmount || 0}
                              onChange={(e) => setEditForm({ ...editForm, totalAmount: Number(e.target.value) })}
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Monto Pagado</Label>
                            <Input
                              type="number"
                              value={editForm.paidAmount || 0}
                              onChange={(e) => setEditForm({ ...editForm, paidAmount: Number(e.target.value) })}
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSaveEdit} size="sm" className="bg-green-600 hover:bg-green-700">
                            Guardar Cambios
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            size="sm"
                            variant="outline"
                            className="border-gray-600 bg-transparent"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-lg font-semibold text-white">{participant.fullName}</h3>
                            {getStatusBadge(participant.paymentStatus)}
                            <Badge variant="outline" className="text-xs">
                              v{participant.version}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-400 space-y-1">
                            <div>ID: {participant.id}</div>
                            <div>Teléfono: {participant.phone}</div>
                            <div>Edad: {participant.age}</div>
                            {participant.email && <div>Email: {participant.email}</div>}
                            <div className="flex items-center gap-4 mt-2">
                              <div className="text-green-400">Pagado: ${participant.paidAmount || 0}</div>
                              <div className="text-blue-400">Total: ${participant.totalAmount || 100}</div>
                              {(participant.totalAmount || 100) - (participant.paidAmount || 0) > 0 && (
                                <div className="text-red-400">
                                  Falta: ${(participant.totalAmount || 100) - (participant.paidAmount || 0)}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Actualizado: {new Date(participant.updatedAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={participant.paidAmount || 0}
                              onChange={(e) =>
                                handlePaymentUpdate(
                                  participant.id,
                                  Number(e.target.value),
                                  participant.totalAmount || 100,
                                )
                              }
                              className="w-20 bg-gray-700 border-gray-600 text-white text-sm"
                              placeholder="0"
                            />
                            <span className="text-gray-400 text-sm">/${participant.totalAmount || 100}</span>
                          </div>

                          <Button
                            onClick={() =>
                              handlePaymentUpdate(
                                participant.id,
                                participant.totalAmount || 100,
                                participant.totalAmount || 100,
                              )
                            }
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-xs"
                          >
                            Pagado
                          </Button>

                          <Button
                            onClick={() => handlePaymentUpdate(participant.id, 0, participant.totalAmount || 100)}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-xs"
                          >
                            No Pagado
                          </Button>

                          <Button
                            onClick={() => handleRegenerateQR(participant.id, participant.fullName)}
                            disabled={regeneratingQR === participant.id}
                            size="sm"
                            variant="outline"
                            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                            title="Regenerar y Reenviar QR"
                          >
                            {regeneratingQR === participant.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>

                          <Button
                            onClick={() => window.open(`/qr-display/${participant.id}`, "_blank")}
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-900 hover:text-slate-900"
                            title="Ver QR"
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>

                          <Button
                            onClick={() => handleEdit(participant)}
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-950 hover:text-white"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            onClick={() => handleDelete(participant.id)}
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
