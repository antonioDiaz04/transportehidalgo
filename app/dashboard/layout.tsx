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
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "z-40 inset-y-0 left-0 bg-white shadow-sm border-r border-x-gray-300 flex flex-col transition-all duration-300",
          !shouldCollapseSidebar && [
            "h-screen sticky top-0",
            isCollapsed ? "w-20" : "w-full md:w-44 lg:w-64"
          ],
          shouldCollapseSidebar && [
            "fixed w-[calc(100%-3rem)] max-w-sm transform",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          ]
        )}
      >
        {/* Sidebar Header */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-x-gray-300 px-4 shrink-0",
            isCollapsed ? "justify-center px-0" : "justify-between"
          )}
        >
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
            <div className="w-10" />
          )}

          <div className={cn(isCollapsed ? "absolute right-5" : "")}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className={cn("md:flex", shouldCollapseSidebar ? "" : "hidden")}
            >
              {shouldCollapseSidebar ? (
                <X className="h-5 w-5" />
              ) : isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
              <span className="sr-only">
                {shouldCollapseSidebar
                  ? "Cerrar menú"
                  : isCollapsed
                    ? "Expandir menú"
                    : "Colapsar menú"}
              </span>
            </Button>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className={cn(
            "flex flex-col gap-1 p-4",
            isCollapsed && "items-center px-2"
          )}>
            {/* Número de Autorización */}
            <Link
              href="/dashboard/autorizacion"
              className={cn(
                "flex items-start gap-3 rounded-xl px-3 py-2 text-sm font-normal transition-colors",
                pathname === "/dashboard/autorizacion"
                  ? "bg-[#ebf2f7] text-slate-600"
                  : "text-gray-800 hover:bg-[#f7fafc] hover:text-gray-900",
                isCollapsed && "justify-center px-2"
              )}
              onClick={() => shouldCollapseSidebar && setSidebarOpen(false)}
            >
              <Circle className={cn(
                "h-5 w-5 flex-shrink-0 mt-0.5 md:h-4 md:w-4",
                pathname === "/dashboard/autorizacion" ? "text-gray-700" : "text-gray-500"
              )} />
              <span className={cn(
                "whitespace-pre-line break-words min-w-0 flex-1 leading-tight",
                isCollapsed ? "hidden" : "block"
              )}>
                Número de Autorización
              </span>
            </Link>

            {/* Expediente */}
            <Link
              href="/dashboard/expediente"
              className={cn(
                "flex items-start gap-3 rounded-xl px-3 py-2 text-sm font-normal transition-colors",
                pathname === "/dashboard/expediente"
                  ? "bg-[#ebf2f7] text-slate-600"
                  : "text-gray-800 hover:bg-[#f7fafc] hover:text-gray-900",
                isCollapsed && "justify-center px-2"
              )}
              onClick={() => shouldCollapseSidebar && setSidebarOpen(false)}
            >
              <Folder className={cn(
                "h-5 w-5 flex-shrink-0 mt-0.5 md:h-4 md:w-4",
                pathname === "/dashboard/expediente" ? "text-gray-700" : "text-gray-500"
              )} />
              <span className={cn(
                "whitespace-pre-line break-words min-w-0 flex-1 leading-tight",
                isCollapsed ? "hidden" : "block"
              )}>
                Expediente
              </span>
            </Link>

            {/* Titular */}
            <Link
              href="/dashboard/titular"
              className={cn(
                "flex items-start gap-3 rounded-xl px-3 py-2 text-sm font-normal transition-colors",
                pathname === "/dashboard/titular"
                  ? "bg-[#ebf2f7] text-slate-600"
                  : "text-gray-800 hover:bg-[#f7fafc] hover:text-gray-900",
                isCollapsed && "justify-center px-2"
              )}
              onClick={() => shouldCollapseSidebar && setSidebarOpen(false)}
            >
              <User className={cn(
                "h-5 w-5 flex-shrink-0 mt-0.5 md:h-4 md:w-4",
                pathname === "/dashboard/titular" ? "text-gray-700" : "text-gray-500"
              )} />
              <span className={cn(
                "whitespace-pre-line break-words min-w-0 flex-1 leading-tight",
                isCollapsed ? "hidden" : "block"
              )}>
                Titular
              </span>
            </Link>

            {/* Vehículo */}
            <Link
              href="/dashboard/vehiculo"
              className={cn(
                "flex items-start gap-3 rounded-xl px-3 py-2 text-sm font-normal transition-colors",
                pathname === "/dashboard/vehiculo"
                  ? "bg-[#ebf2f7] text-slate-600"
                  : "text-gray-800 hover:bg-[#f7fafc] hover:text-gray-900",
                isCollapsed && "justify-center px-2"
              )}
              onClick={() => shouldCollapseSidebar && setSidebarOpen(false)}
            >
              <Car className={cn(
                "h-5 w-5 flex-shrink-0 mt-0.5 md:h-4 md:w-4",
                pathname === "/dashboard/vehiculo" ? "text-gray-700" : "text-gray-500"
              )} />
              <span className={cn(
                "whitespace-pre-line break-words min-w-0 flex-1 leading-tight",
                isCollapsed ? "hidden" : "block"
              )}>
                Vehículo
              </span>
            </Link>

            {/* Búsqueda de Revista Vehicular */}
            <Link
              href="/dashboard/BandejaRevista"
              className={cn(
                "flex items-start gap-3 rounded-xl px-3 py-2 text-sm font-normal transition-colors",
                pathname === "/dashboard/BandejaRevista"
                  ? "bg-[#ebf2f7] text-slate-600"
                  : "text-gray-800 hover:bg-[#f7fafc] hover:text-gray-900",
                isCollapsed && "justify-center px-2"
              )}
              onClick={() => shouldCollapseSidebar && setSidebarOpen(false)}
            >
              <Search className={cn(
                "h-5 w-5 flex-shrink-0 mt-0.5 md:h-4 md:w-4",
                pathname === "/dashboard/BandejaRevista" ? "text-gray-700" : "text-gray-500"
              )} />
              <span className={cn(
                "whitespace-pre-line break-words min-w-0 flex-1 leading-tight",
                isCollapsed ? "hidden" : "block"
              )}>
                Búsqueda de Revista Vehicular
              </span>
            </Link>

            {/* Reporte de Inspecciones Realizadas */}
            <Link
              href="/dashboard/ReporteRealizadas"
              className={cn(
                "flex items-start gap-3 rounded-xl px-3 py-2 text-sm font-normal transition-colors",
                pathname === "/dashboard/ReporteRealizadas"
                  ? "bg-[#ebf2f7] text-slate-600"
                  : "text-gray-800 hover:bg-[#f7fafc] hover:text-gray-900",
                isCollapsed && "justify-center px-2"
              )}
              onClick={() => shouldCollapseSidebar && setSidebarOpen(false)}
            >
              <Search className={cn(
                "h-5 w-5 flex-shrink-0 mt-0.5 md:h-4 md:w-4",
                pathname === "/dashboard/ReporteRealizadas" ? "text-gray-700" : "text-gray-500"
              )} />
              <span className={cn(
                "whitespace-pre-line break-words min-w-0 flex-1 leading-tight",
                isCollapsed ? "hidden" : "block"
              )}>
                Reporte de Inspecciones Realizadas
              </span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Overlay para móvil/tablet */}
      {sidebarOpen && shouldCollapseSidebar && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col bg-gray-100 min-w-0 transition-all duration-300",
        !shouldCollapseSidebar && [
          isCollapsed ? "ml-0" : "ml-34"
        ],
        shouldCollapseSidebar && "ml-0"
      )}>
        {/* Header */}
        <header className={cn(
          "sticky top-0 z-30 flex items-center shadow-sm justify-between border-b border-x-gray-300 bg-white",
          "h-16 px-4",
          "h-14 px-2 sm:h-16 sm:px-4"
        )}>
          <div className="flex items-center">
            <div className="flex items-center">
              <span className={cn(
                "font-bold text-[#bc1c44]",
                "text-xl",
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
                    "h-8 w-8",
                    "h-7 w-7 sm:h-8 sm:w-8"
                  )}>
                    <AvatarImage src="/placeholder-user.jpg" alt="Usuario" />
                    <AvatarFallback className={cn(
                      "bg-[#bc1c44] text-white",
                      "text-sm",
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

        {/* Page Content */}
        <main className={cn(
          "flex-1 overflow-x-hidden",
          "p-6",
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