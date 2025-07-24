"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  Camera,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import jsQR from "jsqr"

interface ScannedData {
  id: string
  name: string
  paymentStatus: "paid" | "unpaid" | "partial"
  totalAmount: number
  paidAmount: number
}

export default function ScannerPage() {
  /* ──────────────── state y refs ──────────────── */
  const [scannedData, setScannedData] = useState<ScannedData | null>(null)
  const [isScanning, setIsScanning] = useState(true)
  const [error, setError] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  /* ──────────────── cámara on/off ──────────────── */
  useEffect(() => {
    if (isScanning) startCamera()
    else stopCamera()
    return stopCamera
  }, [isScanning])

  const startCamera = async () => {
    try {
      setError("")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (!videoRef.current) return
      videoRef.current.srcObject = stream
      streamRef.current = stream
      await videoRef.current.play()
      scanLoop()
    } catch (e) {
      console.error(e)
      setError("No se pudo acceder a la cámara. Verifica permisos.")
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  /* ──────────────── escaneo ──────────────── */
  const scanLoop = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    if (video.readyState < 2) {
      requestAnimationFrame(scanLoop)
      return
    }
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(img.data, img.width, img.height, {
      inversionAttempts: "dontInvert",
    })
    if (code?.data) handleQR(code.data)
    requestAnimationFrame(scanLoop)
  }

  const handleQR = async (text: string) => {
    if (!isScanning) return
    setIsScanning(false)

    try {
      // Intenta parsear JSON primero
      let id: string | undefined
      let name = ""
      let paymentStatus: ScannedData["paymentStatus"] = "unpaid"
      let totalAmount = 100
      let paidAmount = 0

      try {
        const obj = JSON.parse(text)
        id = obj.id
        name = obj.name
        paymentStatus = obj.paymentStatus ?? paymentStatus
        totalAmount = obj.totalAmount ?? totalAmount
        paidAmount = obj.paidAmount ?? paidAmount
      } catch {
        // Si no es JSON, intenta URL terminada en /qr-display/<id>
        const match = text.match(/\/qr-display\/([a-zA-Z0-9_-]+)/)
        if (match) id = match[1]
      }

      if (!id) throw new Error("Formato de QR no reconocido")

      // Consulta en la API para info actualizada
      const res = await fetch(`/api/participants/${id}`)
      if (res.ok) {
        const p = await res.json()
        name = p.fullName ?? name
        paymentStatus = p.paymentStatus ?? paymentStatus
        totalAmount = p.totalAmount ?? totalAmount
        paidAmount = p.paidAmount ?? paidAmount
      }

      setScannedData({ id, name: name || "Sin nombre", paymentStatus, totalAmount, paidAmount })
      setTimeout(resetScanner, 4000)
    } catch (e: any) {
      console.error(e)
      setError(e.message || "QR inválido")
      setTimeout(() => setError("") , 2500)
      setIsScanning(true)
    }
  }

  /* ──────────────── helpers UI ──────────────── */
  const resetScanner = () => {
    setScannedData(null)
    setIsScanning(true)
  }

  const color = (st: string) =>
    st === "paid"
      ? "text-green-400 bg-green-900/30 border-green-400"
      : st === "partial"
      ? "text-yellow-400 bg-yellow-900/30 border-yellow-400"
      : "text-red-400 bg-red-900/30 border-red-400"

  const icon = (st: string) =>
    st === "paid" ? (
      <CheckCircle className="h-8 w-8 text-green-400" />
    ) : st === "partial" ? (
      <AlertCircle className="h-8 w-8 text-yellow-400" />
    ) : (
      <XCircle className="h-8 w-8 text-red-400" />
    )

  const textStatus = (st: string) => (st === "paid" ? "PAGADO" : st === "partial" ? "ABONADO" : "NO PAGADO")

  /* ──────────────── render ──────────────── */
  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* header */}
        <div className="flex items-center gap-4 mb-8 pt-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">Escáner QR</h1>
        </div>

        {/* error */}
        {!!error && (
          <Card className="bg-red-900/30 border-red-400 mb-4">
            <CardContent className="p-4 text-center flex flex-col items-center">
              <AlertCircle className="h-6 w-6 text-red-400 mb-2" />
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* resultado */}
        {scannedData ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <div className="mb-6">{icon(scannedData.paymentStatus)}</div>
              <h2 className="text-2xl font-bold text-white mb-2">{scannedData.name}</h2>
              <p className="text-gray-400 mb-4">ID: {scannedData.id}</p>

              <div
                className={`inline-flex items-center px-6 py-3 rounded-lg border-2 mb-4 ${color(
                  scannedData.paymentStatus,
                )}`}
              >
                <span className="text-xl font-bold">{textStatus(scannedData.paymentStatus)}</span>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Pagado:</span>
                    <div className="text-green-400 font-bold text-lg">${scannedData.paidAmount}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Total:</span>
                    <div className="text-blue-400 font-bold text-lg">${scannedData.totalAmount}</div>
                  </div>
                </div>
                {scannedData.totalAmount - scannedData.paidAmount > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <span className="text-gray-400">Pendiente:</span>
                    <div className="text-red-400 font-bold text-lg">
                      ${scannedData.totalAmount - scannedData.paidAmount}
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={resetScanner} className="bg-blue-600 hover:bg-blue-700">
                <Camera className="h-4 w-4 mr-2" />
                Escanear Siguiente
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* vista cámara */
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <Camera className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Escáner Activo</h2>
                <p className="text-gray-400">Apunta la cámara al código QR</p>
              </div>

              <div className="relative">
                <video ref={videoRef} className="w-full rounded-lg bg-gray-800" playsInline muted />
                <canvas ref={canvasRef} className="hidden" />

                {/* marco */}
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                  {[
                    "top-4 left-4",
                    "top-4 right-4",
                    "bottom-4 left-4",
                    "bottom-4 right-4",
                  ].map((p) => (
                    <div
                      key={p}
                      className={`absolute ${p} w-8 h-8 border-blue-500 ${
                        p.includes("top") ? "border-t-4" : "border-b-4"
                      } ${p.includes("left") ? "border-l-4" : "border-r-4"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button
                  onClick={() => {
                    setIsScanning(false)
                    setTimeout(() => setIsScanning(true), 60)
                  }}
                  variant="outline"
                  className="border-gray-600 bg-transparent"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reiniciar Cámara
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
