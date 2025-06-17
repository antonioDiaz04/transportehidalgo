"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Car,
  Circle,
  Folder,
  LogOut,
  Menu,
  Search,
  User,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
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
import { useDevice } from "@/hooks/use-device"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Número de Autorización", href: "/dashboard/autorizacion", icon: Circle },
  { name: "Expediente", href: "/dashboard/expediente", icon: Folder },
  { name: "Titular", href: "/dashboard/titular", icon: User },
  { name: "Vehículo", href: "/dashboard/vehiculo", icon: Car },
  { name: "Búsqueda de Revista Vehicular", href: "/dashboard/BandejaRevista", icon: Search },
  { name: "Reporte de Inspecciones Realizadas", href: "/dashboard/ReporteRealizadas", icon: Search },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isMobile, isTablet } = useDevice()
  const shouldCollapseSidebar = isMobile || isTablet
  const [sidebarOpen, setSidebarOpen] = useState(!shouldCollapseSidebar)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Close sidebar on navigation in mobile/tablet
  useEffect(() => {
    if (shouldCollapseSidebar) {
      setSidebarOpen(false)
    }
  }, [pathname, shouldCollapseSidebar])

  const toggleSidebar = () => {
    if (shouldCollapseSidebar) {
      setSidebarOpen(!sidebarOpen)
    } else {
      setIsCollapsed(!isCollapsed)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar - Comportamiento diferente en móvil/desktop */}
      <aside
        className={cn(
          "z-40 inset-y-0 left-0 bg-white border-r shadow-md flex flex-col transition-all duration-300",
          // Desktop
          !shouldCollapseSidebar && [
            "h-screen sticky top-0",
            isCollapsed ? "w-20" : "w-64"
          ],
          // Mobile/Tablet
          shouldCollapseSidebar && [
            "fixed w-[calc(100%-3rem)] max-w-sm transform",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          ]
        )}
      >
        {/* Sidebar Header */}
        <div className={cn(
          "flex h-16 items-center justify-between border-b px-4 shrink-0",
          isCollapsed && "justify-center px-0"
        )}>
          {!isCollapsed ? (
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image
                src="https://res.cloudinary.com/dvvhnrvav/image/upload/v1750031388/transporte/lfnc4lotpxbwlvtbjadk.png"
                alt="Logo"
                width={200}
                height={120}
                className={cn(
                  "h-auto object-contain",
                  shouldCollapseSidebar ? "w-32" : "w-40"
                )}
              />
            </Link>
          ) : (
            <div className="w-10"></div> // Espacio para mantener altura
          )}
          
          {/* Botón de cerrar/colapsar */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className={cn(
              "md:flex",
              shouldCollapseSidebar ? "" : "hidden"
            )}
          >
            {shouldCollapseSidebar ? (
              <X className="h-5 w-5" />
            ) : isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
            <span className="sr-only">
              {shouldCollapseSidebar ? "Cerrar menú" : isCollapsed ? "Expandir menú" : "Colapsar menú"}
            </span>
          </Button>
        </div>

        {/* Scrollable Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          <div className={cn(
            "flex flex-col gap-1 p-4",
            isCollapsed && "items-center px-2"
          )}>
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
                      : "text-gray-600 hover:bg-[#404040]/5 hover:text-gray-900",
                    isCollapsed && "justify-center px-2"
                  )}
                  onClick={() => shouldCollapseSidebar && setSidebarOpen(false)}
                >
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-[#bc1c44]" : "text-gray-500"
                  )} />
                  <span className={cn(
                    "whitespace-normal overflow-hidden text-ellipsis",
                    isCollapsed ? "hidden" : "block"
                  )}>
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Overlay solo para móvil/tablet cuando sidebar está abierto */}
      {sidebarOpen && shouldCollapseSidebar && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Container */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        // Desktop
        !shouldCollapseSidebar && [
          isCollapsed ? "ml-0" : "ml-34"
        ],
        // Mobile
        shouldCollapseSidebar && "ml-0"
      )}>
        {/* Header - Diseño diferente para móvil/desktop */}
        <header className={cn(
          "sticky top-0 z-30 flex items-center justify-between border-b bg-white shadow-sm",
          // Desktop
          "h-16 px-4",
          // Mobile
          "h-14 px-2 sm:h-16 sm:px-4"
        )}>
          <div className="flex items-center">
            {/* Botón de menú - Siempre visible para poder expandir/colapsar */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="mr-1 h-9 w-9"
            >
              {shouldCollapseSidebar ? (
                <Menu className="h-5 w-5" />
              ) : isCollapsed ? (
                <Menu className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Menú</span>
            </Button>
            
            {/* Logo/Título */}
            <div className="flex items-center">
              <span className={cn(
                "font-bold text-[#bc1c44]",
                // Desktop
                "text-xl",
                // Mobile
                "text-lg sm:text-xl"
              )}>
                STCH
              </span>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-full">
                  <Avatar className={cn(
                    // Desktop
                    "h-8 w-8",
                    // Mobile
                    "h-7 w-7 sm:h-8 sm:w-8"
                  )}>
                    <AvatarImage src="/placeholder-user.jpg" alt="Usuario" />
                    <AvatarFallback className={cn(
                      "bg-[#bc1c44] text-white",
                      // Desktop
                      "text-sm",
                      // Mobile
                      "text-xs sm:text-sm"
                    )}>PA</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Usuario:</p>
                    <p className="text-xs leading-none text-muted-foreground">Pepe Alejandro Sanchez</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/" className="w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className={cn(
          "flex-1 overflow-x-hidden",
          // Desktop
          "p-6",
          // Mobile
          "p-3 sm:p-4"
        )}>
          <div className="mx-auto w-full max-w-[1800px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
