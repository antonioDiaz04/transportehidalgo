"use client" // Necesario si mantienes cualquier estado o interactividad mínima como el menú móvil

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import {
  Menu, // Icono para el menú hamburguesa (si se mantiene, aunque para login es menos común)
  X,    // Icono para cerrar el menú
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils" // Asume que tienes un archivo utils.ts para 'cn'

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen text-gray-800 bg-gray-100 font-sans flex flex-col">
      {/* Header (Navbar) - Simplificado */}
      <header className="sticky top-0 z-50 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2" aria-label="Inicio">
              <Image
                src="https://res.cloudinary.com/dvvhnrvav/image/upload/v1749563496/transporte/afhhpxszzwtttnfyyg6r.jpg"
                alt="Logo Gobierno de Hidalgo"
                width={160} // Ajustado para un tamaño más elegante
                height={60} // Altura auto
                priority // Carga más rápido el logo principal
                className="w-auto h-12 md:h-16 object-contain"
              />
              <span className="sr-only">Plataforma Integral de Transporte Hidalgo</span>
            </Link>
          </div>

          {/* Botón Iniciar Sesión (visible en todas las pantallas) */}
          <div>
            <Button asChild className="bg-[#bc1c44] hover:bg-[#80142c] text-white px-6 py-2 rounded-lg shadow-md transition-all duration-300">
              <Link href="/login">Acceder</Link>
            </Button>
          </div>

          {/* Si quieres un menú móvil con un enlace a login también, puedes mantener esto: */}
          {/* <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Abrir menú"
              className="text-gray-700 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div> */}
        </div>

        {/* Menú Móvil (simplificado, si se mantiene) */}
        {/* <div
          className={cn(
            "md:hidden absolute w-full bg-white shadow-lg transition-all duration-300 ease-in-out overflow-hidden",
            isMobileMenuOpen ? "max-h-screen opacity-100 py-4" : "max-h-0 opacity-0"
          )}
        >
          <nav className="flex flex-col items-center gap-4 py-4">
            <Button asChild className="bg-[#bc1c44] hover:bg-[#80142c] text-white px-6 py-2 rounded-lg shadow-md w-3/4">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Acceder a la Plataforma</Link>
            </Button>
          </nav>
        </div> */}
      </header>

      {/* Main Content - Hero Section enfocado en login */}
      <main className="flex-grow flex items-center justify-center py-16 md:py-24">
        <section id="inicio" className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="relative z-10 grid gap-8 lg:grid-cols-2 lg:gap-12 items-center  p-8 md:p-12">
            {/* Contenido de texto */}
            <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                  Bienvenido al Sistema de Gestión de <br className="hidden md:block"/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b01639] to-[#dd0a3b] animation-gradient">
                    Transporte Hidalgo
                  </span>
                </h1>
                <p className="max-w-[700px] mx-auto lg:mx-0 text-lg md:text-xl text-gray-600 leading-relaxed">
                  Acceso exclusivo para personal autorizado de la Secretaría de Movilidad y Transporte.
                  Gestione eficientemente las operaciones, registros y trámites del sector en el estado de Hidalgo.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild className="bg-[#bc1c44] hover:bg-[#80142c] text-white px-8 py-3 rounded-lg text-lg shadow-lg transition-all duration-300 transform hover:scale-105">
                  <Link href="/login">Acceder al Sistema</Link>
                </Button>
              </div>
            </div>
            {/* Imagen */}
            <div className="flex items-center justify-center p-6 lg:p-0">
              <Image
                src="http://apps.transportehidalgo.gob.mx:8081/Imagenes/stch.png" // Esta imagen parece un diagrama/dashboard
                width={500}
                height={500}
                alt="Interfaz de la plataforma"
                className="rounded-xl object-cover w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-none transform transition-transform duration-500 hover:scale-100"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative w-full bg-[#7b1e3b] text-gray-200 py-6 md:py-8 mt-auto">
        {/* Div decorativo superior */}
        <div className="w-full h-3 bg-[#7b1e3b] absolute top-0 left-0" />

        <div className=" mx-auto px-4 sm:px-6 lg:px-8 text-center pt-4">
          <div className="flex flex-col items-center space-y-4">
          
            <p className="text-sm text-gray-400 max-w-prose">
              Plataforma interna para la gestión del transporte en el estado de Hidalgo. <br className="hidden sm:inline" />
              Desarrollada para el personal de la Secretaría de Movilidad y Transporte.
            </p>
          </div>

          {/* Copyright */}
          <div className="border-t border-stone-400 mt-6 pt-4 text-center text-gray-400 text-xs">
            © {new Date().getFullYear()} Secretaría de Movilidad y Transporte de Hidalgo. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}