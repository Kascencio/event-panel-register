"use client"

import { useState, useEffect, useCallback } from "react"
import type { Participant, PaymentUpdate } from "@/lib/database"

interface ExtendedStats {
  total: number
  paid: number
  unpaid: number
  partial: number
  totalRevenue: number
  expectedRevenue: number
  pendingRevenue: number
  averagePayment: number
  averageTotal: number
  paidPercentage: number
  collectionRate: number
  paymentBreakdown: {
    paid: { count: number; amount: number }
    partial: { count: number; amount: number; pending: number }
    unpaid: { count: number; amount: number }
  }
  lastUpdate: string
  registrationTrend: {
    today: number
    thisWeek: number
  }
}

export function useParticipants() {
  /* ──────────────── State ──────────────── */
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<ExtendedStats | null>(null)

  /* ──────────────── Loaders ──────────────── */
  useEffect(() => {
    loadParticipants()
    loadStats()
  }, [])

  const loadParticipants = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/participants")
      if (!res.ok) throw new Error("Error loading participants")
      setParticipants(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading participants")
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const res = await fetch("/api/stats")
      if (!res.ok) throw new Error("Error loading stats")
      setStats(await res.json())
    } catch (err) {
      console.error("Error loading stats:", err)
    }
  }

  /* ──────────────── CRUD ──────────────── */
  const createParticipant = useCallback(
    async (data: Omit<Participant, "id" | "registeredAt" | "updatedAt" | "version">) => {
      const res = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Error creating participant")
      const newP = await res.json()
      setParticipants((prev) => [newP, ...prev])
      loadStats()
      return newP
    },
    [],
  )

  const updateParticipant = useCallback(async (id: string, updates: Partial<Participant>) => {
    const res = await fetch(`/api/participants/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    if (!res.ok) throw new Error("Error updating participant")
    const upd = await res.json()
    setParticipants((prev) => prev.map((p) => (p.id === id ? upd : p)))
    loadStats()
    return upd
  }, [])

  const deleteParticipant = useCallback(async (id: string) => {
    const res = await fetch(`/api/participants/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Error deleting participant")
    setParticipants((prev) => prev.filter((p) => p.id !== id))
    loadStats()
  }, [])

  /* ──────────────── Pagos ──────────────── */
  const updatePayment = useCallback(
    async (participantId: string, paidAmount: number, totalAmount: number, updatedBy = "admin") => {
      const paymentStatus =
        paidAmount >= totalAmount ? "paid" : paidAmount > 0 ? "partial" : "unpaid"

      const body: PaymentUpdate = {
        participantId,
        paidAmount,
        totalAmount,
        paymentStatus,
        updatedBy,
        timestamp: new Date().toISOString(),
      }

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("Error updating payment")
      const upd = await res.json()
      setParticipants((prev) => prev.map((p) => (p.id === participantId ? upd : p)))
      loadStats()
      return upd
    },
    [],
  )

  /* ──────────────── Regenerar / enviar QR ──────────────── */
  const regenerateQR = useCallback(
    async (participantId: string) => {
      const p = participants.find((x) => x.id === participantId)
      if (!p) throw new Error("Participante no encontrado")

      const res = await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: p.id,
          fullName: p.fullName,
          phone: p.phone,
          age: p.age,
        }),
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Error enviando QR: ${txt}`)
      }

      await refreshData() // recarga datos para obtener qrCode actualizado
      return await res.json()
    },
    [participants],
  )

  /* ──────────────── Utilidades ──────────────── */
  const refreshData = useCallback(() => {
    loadParticipants()
    loadStats()
  }, [])

  const basicStats = {
    total: participants.length,
    paid: participants.filter((p) => p.paymentStatus === "paid").length,
    unpaid: participants.filter((p) => p.paymentStatus === "unpaid").length,
    partial: participants.filter((p) => p.paymentStatus === "partial").length,
    totalRevenue: participants.reduce((s, p) => s + (p.paidAmount || 0), 0),
    expectedRevenue: participants.reduce((s, p) => s + (p.totalAmount || 0), 0),
  }

  /* ──────────────── Exports ──────────────── */
  return {
    participants,
    loading,
    error,
    stats: stats || basicStats,
    createParticipant,
    updateParticipant,
    deleteParticipant,
    updatePayment,
    regenerateQR,
    refreshData,
  }
}
