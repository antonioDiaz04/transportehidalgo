"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUserSession } from "@/lib/indexedDb"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getUserSession()

        if (session.length > 0) {
          setIsAuthenticated(true)
          // Establecer cookie para el middleware
          document.cookie = `user-session=${session[0].id || "authenticated"}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 días
        } else {
          // No hay sesión, redirigir al login
          router.push("/")
          return
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        router.push("/")
        return
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Mostrar loading mientras verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafbfb]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#bc1c44]" />
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Solo renderizar children si está autenticado
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
