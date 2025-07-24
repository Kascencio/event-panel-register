"use client"

import { useEffect, useState } from "react"
import { db, type PaymentUpdate } from "@/lib/database"

export function useRealTimeSync() {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "reconnecting">("connected")
  const [pendingUpdates, setPendingUpdates] = useState<PaymentUpdate[]>([])

  useEffect(() => {
    // Suscribirse a actualizaciones de pagos en tiempo real
    const unsubscribe = db.subscribeToPaymentUpdates((update) => {
      setLastUpdate(new Date())

      // Mostrar notificación de actualización
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Pago Actualizado", {
          body: `Pago actualizado para participante ${update.participantId}`,
          icon: "/favicon.ico",
        })
      }
    })

    // Solicitar permisos de notificación
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }

    return unsubscribe
  }, [])

  // Manejar reconexión automática
  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus("reconnecting")
      // Sincronizar actualizaciones pendientes
      syncPendingUpdates()
      setTimeout(() => setConnectionStatus("connected"), 1000)
    }

    const handleOffline = () => {
      setConnectionStatus("disconnected")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const syncPendingUpdates = async () => {
    // En producción, aquí sincronizarías las actualizaciones pendientes
    // con el servidor cuando se recupere la conexión
    setPendingUpdates([])
  }

  const addPendingUpdate = (update: PaymentUpdate) => {
    setPendingUpdates((prev) => [...prev, update])
  }

  return {
    lastUpdate,
    connectionStatus,
    pendingUpdates: pendingUpdates.length,
    addPendingUpdate,
  }
}
