import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, QrCode, Shield, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl font-bold mb-4 text-white">Sistema de Gestión de Eventos</h1>
          <p className="text-gray-400 text-lg">Registro, verificación y control de acceso</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/register">
            <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer h-full">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center">
                  <UserPlus className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl">Registrar Participante</CardTitle>
                <CardDescription className="text-gray-400">Registrar nueva persona y generar QR</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/scanner">
            <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer h-full">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-green-600 rounded-full w-16 h-16 flex items-center justify-center">
                  <QrCode className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl">Escáner QR</CardTitle>
                <CardDescription className="text-gray-400">Verificar acceso y estado de pago</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/login">
            <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer h-full">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl">Panel Admin</CardTitle>
                <CardDescription className="text-gray-400">Gestionar registros y configuración</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
            <Users className="h-4 w-4" />
            <span>Sistema de gestión profesional</span>
          </div>
        </div>
      </div>
    </div>
  )
}
