"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Car, Circle, Folder, LogOut, Menu, Search, Settings, User, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDevice } from "@/hooks/use-device" // Cambiamos a useDevice
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Número de Autorización", href: "/dashboard/autorizacion", icon: Circle },
  { name: "Expediente", href: "/dashboard/expediente", icon: Folder },
  { name: "Titular", href: "/dashboard/titular", icon: User },
  { name: "Vehículo", href: "/dashboard/vehiculo", icon: Car },
  { name: "Búsqueda de Revista Vehicular", href: "/dashboard/BandejaRevista", icon: Search },
  { name: "Reporte de Inspecciones Realizadas", href: "/dashboard/inspecciones", icon: Search },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { isMobile, isTablet } = useDevice() // Usamos el nuevo hook
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Determinar si el sidebar debe estar colapsado por defecto
  const shouldCollapseSidebar = isMobile || isTablet

  // Close sidebar when route changes on mobile or tablet
  useEffect(() => {
    if (shouldCollapseSidebar) {
      setSidebarOpen(false)
    }
  }, [pathname, shouldCollapseSidebar])

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile/Tablet sidebar overlay */}
      {sidebarOpen && shouldCollapseSidebar && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-64 transform bg-gray-100 border-r transition-transform duration-200 ease-in-out z-50",
          shouldCollapseSidebar 
            ? (sidebarOpen ? "translate-x-0" : "-translate-x-full") 
            : "translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="https://res.cloudinary.com/dvvhnrvav/image/upload/v1749563496/transporte/afhhpxszzwtttnfyyg6r.jpg" alt="Logo" width={150} height={120} />
           
          </Link>

          {shouldCollapseSidebar && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Cerrar menú</span>
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#bc1c44]/10 text-[#bc1c44]"
                    : "text-gray-600 hover:bg-[#bc1c44]/5 hover:text-[#bc1c44]",
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-[#bc1c44]" : "text-gray-500")} />
                {item.name}
              </Link>
            )
          })}
        </div>
      </aside>

      {/* Main content */}
      <div className={cn("flex flex-col", shouldCollapseSidebar ? "ml-0" : "ml-64")}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-gray-100 px-4">
          {shouldCollapseSidebar && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          )}
          <div className={cn("flex-1", shouldCollapseSidebar ? "ml-4" : "ml-0")}>
            {/* <h1 className="text-lg font-semibold">Dashboard</h1> */}
             <span className="text-xl font-bold text-[#bc1c44]">STCH</span>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" alt="Usuario" />
                    <AvatarFallback className="bg-[#bc1c44] text-white">PA</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Usuario: </p>
                    <p className="text-xs leading-none text-muted-foreground">Pepe Alejandro Sanchez</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">
          {/* Añadimos un margen superior solo en móvil/tablet para evitar que el contenido quede pegado al header */}
          <div className={cn(shouldCollapseSidebar ? "mt-4" : "")}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}