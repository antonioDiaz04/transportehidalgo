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
  Search,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
    <div className="min-h-screen bg-[#fafbfb] flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "z-40 inset-y-0 left-0 bg-[#fafbfb]   border-r border-x-gray-200 flex flex-col",
          !shouldCollapseSidebar && [
            "h-screen sticky top-0",
            isCollapsed ? "w-20" : "w-full md:w-44 lg:w-72 xl:w-80 2xl:w-72",
          ],
          shouldCollapseSidebar && [
            "fixed w-[calc(100%-3rem)] max-w-sm",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          ]
        )}
      >
        {/* Sidebar Header */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-x-gray-200 px-4 shrink-0",
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
                className={cn("h-auto object-contain", shouldCollapseSidebar ? "w-32" : "w-40")}
                unoptimized
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
        <div className="flex-1 overflow-y-auto flex flex-col justify-between">
          <div className={cn("flex flex-col gap-4 p-4", isCollapsed && "items-center px-2")}>
            <span className={cn("px-3 py-2  font-bold text-black text-lg", isCollapsed ? "hidden" : "block")}>
              Realiza reportes y búsquedas
            </span>
            {["autorizacion", "expediente", "titular", "vehiculo", "BandejaRevista", "ReporteRealizadas"].map((route, i) => {
              const icons = [Circle, Folder, User, Car, Search, Search]
              const labels = [
                "Número de Autorización",
                "Expediente",
                "Titular",
                "Vehículo",
                "Búsqueda de Revista Vehicular",
                "Reporte de Inspecciones Realizadas"
              ]
              const Icon = icons[i]
              return (
                <Link
                  key={route}
                  href={`/dashboard/${route}`}
                  prefetch={false}
                  className={cn(
                    "flex items-start gap-3 rounded-md px-3 py-2 text-sm font-normal transition-transform duration-100 active:scale-95",
                    pathname === `/dashboard/${route}`
                      ? "bg-[#e3e7e8] text-zinc-950 font-bold"
                      : "text-gray-800 hover:bg-[#eceff0] hover:text-gray-900",
                    isCollapsed && "justify-center px-2"
                  )}
                  onClick={() => shouldCollapseSidebar && setSidebarOpen(false)}
                >
                  <Icon className={cn("h-6 w-6 mt-0.5", pathname === `/dashboard/${route}` ? "text-zinc-950" : "text-gray-500")} />
                  <span className={cn("min-w-0 flex-1 text-sm", isCollapsed ? "hidden" : "block")}>{labels[i]}</span>
                </Link>
              )
            })}
          </div>
          {/* Botón de cerrar sesión al fondo con icono y texto al lado (row) */}
          <div className={cn("p-4", isCollapsed && "flex flex-row items-center px-2")}>
            <Button
              variant="outline"
              className="bg-white border border-[#D0D7D9] text-black rounded-md h-10 w-full flex items-center justify-center gap-2 hover:bg-gray-100"
              asChild
            >
              <Link href="/" className="flex flex-row items-center w-full justify-center gap-2">
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Cerrar sesión</span>
              </Link>
            </Button>
            <div className={cn("mt-2 text-xs text-gray-500 text-center w-full", isCollapsed ? "hidden" : "block")}>
              Información adicional o mensaje aquí
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && shouldCollapseSidebar && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col bg-gray-50 min-w-0",
        !shouldCollapseSidebar && [isCollapsed ? "ml-0" : "ml-34"],
        shouldCollapseSidebar && "ml-0"
      )}>
        <header className={cn(
          "sticky top-0 z-30 flex items-center justify-between border-b border-x-gray-200 bg-[#fafbfb]",
          "h-16 px-4"
        )}>
          <div className="flex items-center">

            <div className="flex items-center">
              {shouldCollapseSidebar && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  className="mr-3"
                >
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="sr-only">Abrir menú</span>
                </Button>
              )}
              <span className="font-bold text-[#bc1c44] text-xl">STCH</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 rounded-md text-black font-medium hover:bg-gray-100 focus:outline-none border-none px-2 py-1"
                >
                  <User className="h-5 w-5 text-[#bc1c44]" />
                  <span className="text-sm">Pepe Alejandro Sanchez</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Usuario:</p>
                    <p className="text-xs text-muted-foreground">Pepe Alejandro Sanchez</p>
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

        <main className="flex-1 overflow-x-hidden p-3 sm:p-4">
          <div className="mx-auto w-full max-w-[1800px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
