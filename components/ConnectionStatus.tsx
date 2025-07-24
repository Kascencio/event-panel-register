"use client"

import { useRealTimeSync } from "@/hooks/useRealTimeSync"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"

export function ConnectionStatus() {
  const { connectionStatus, lastUpdate, pendingUpdates } = useRealTimeSync()

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-600"
      case "disconnected":
        return "bg-red-600"
      case "reconnecting":
        return "bg-yellow-600"
      default:
        return "bg-gray-600"
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="h-3 w-3" />
      case "disconnected":
        return <WifiOff className="h-3 w-3" />
      case "reconnecting":
        return <RefreshCw className="h-3 w-3 animate-spin" />
      default:
        return <Wifi className="h-3 w-3" />
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${getStatusColor()} hover:${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="ml-1 capitalize">{connectionStatus}</span>
      </Badge>

      {pendingUpdates > 0 && (
        <Badge variant="outline" className="border-yellow-600 text-yellow-400">
          {pendingUpdates} pendientes
        </Badge>
      )}

      {lastUpdate && (
        <span className="text-xs text-gray-500">Última actualización: {lastUpdate.toLocaleTimeString()}</span>
      )}
    </div>
  )
}
