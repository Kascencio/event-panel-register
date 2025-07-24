"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Shield, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AdminLoginPage() {
  const router = useRouter()
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Credenciales hardcodeadas para el admin
    if (credentials.username === "admin" && credentials.password === "admin123") {
      localStorage.setItem("adminLoggedIn", "true")
      router.push("/admin/dashboard")
    } else {
      setError("Credenciales incorrectas")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-white text-2xl">Panel de Administrador</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-400 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Usuario
                </Label>
                <Input
                  id="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  placeholder="Ingrese su usuario"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  placeholder="Ingrese su contraseña"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="mt-6 p-3 bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-400 text-center">
                <strong>Demo:</strong> Usuario: admin | Contraseña: admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
