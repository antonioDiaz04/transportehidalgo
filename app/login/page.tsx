"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import axios from "axios";
import { saveUserSession } from "@/lib/indexedDb"
import apiClient from "@/lib/apiClient"


export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentPage, setCurrentPage] = useState(0) // 0 = contenido, 1 = formulario
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const data = await apiClient("/auth/login", {
        method: 'POST',
        withCredentials: true,
        data: {
          username,
          password,
        },
      })

      // ✅ Guardar usuario en sesión (IndexedDB)
      await saveUserSession(data.user)

      // ✅ Redirigir al dashboard
      router.push("/dashboard/autorizacion")
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
          error.message ||
          "Error al iniciar sesión"
        )
      } else {
        alert("Error desconocido")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentPage < 1) {
      setCurrentPage(currentPage + 1)
    } else if (direction === 'right' && currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-100 flex-col items-center justify-between text-[#b01639] overflow-hidden">
      {/* Header with brand colors */}
      <header className="w-full absolute top-0 py-2 px-2 flex justify-between items-center z-10">
        <Image
          src="https://res.cloudinary.com/dvvhnrvav/image/upload/v1749563496/transporte/afhhpxszzwtttnfyyg6r.jpg"
          alt="Logo"
          width={250}
          height={200}
          className="z-20"
        />

        {/* Paralelogramo pegado al borde derecho */}
        {/* Adjusted width to w-1/2 and removed translate-x for right alignment */}
        <div className="absolute right-0 top-0 w-1/2 h-[60px] bg-[#b01639]
          transform -skew-x-11  origin-bottom-right z-" />

        <nav className="relative z-10">
          <Link
            href="/"
            className="text-[#F5E6CC] text-lg font-semibold hover:text-[#FFD900] transition-colors duration-300"
          >
            Inicio
          </Link>
        </nav>
      </header>

      {/* Main Content with Pagination (Mobile/Tablet) */}
      <div className="lg:hidden w-full pt-28 flex-grow relative overflow-hidden">

        {/* Content Container */}
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentPage * 100}%)` }}
        >
          {/* Left Section: Large Image and Description (Page 0) */}
          <div
            className="w-full flex-shrink-0 px-4 flex flex-col items-center text-center animate-fadeInLeft"
            onTouchStart={(e) => {
              const touchStartX = e.touches[0].clientX
              const handleTouchEnd = (e: TouchEvent) => {
                const touchEndX = e.changedTouches[0].clientX
                if (touchStartX - touchEndX > 50) handleSwipe('left')
                if (touchEndX - touchStartX > 50) handleSwipe('right')
                document.removeEventListener('touchend', handleTouchEnd)
              }
              document.addEventListener('touchend', handleTouchEnd)
            }}
          >
            <Image
              src="https://res.cloudinary.com/dvvhnrvav/image/upload/v1749563496/transporte/oekxnggselolp5paxtev.jpg"
              alt="Gran Logo de Transporte Hidalgo"
              width={360}
              height={250}
              className="rounded-none mb-8"
            />
            <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-6 leading-tight drop-shadow-lg">
              Plataforma Integral de <span className="text-[#b01639]">Transporte Hidalgo</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 leading-relaxed max-w-xl">
              Conectando a nuestra comunidad con eficiencia y seguridad.
              Acceda a todas las herramientas y recursos para una gestión óptima de servicios y operaciones.
            </p>

            {/* Navigation Button (Mobile) */}
            <button
              onClick={() => setCurrentPage(1)}
              className="mt-8 bg-[#b01639] text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
            >
              Iniciar Sesión <ChevronRight size={20} />
            </button>
          </div>

          {/* Right Section: Login Card (Page 1) */}
          <div className="w-full flex-shrink-0 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white text-gray-900 shadow-3xl p-6 md:p-8 transform transition-all duration-500 ease-out hover:scale-[1.02] relative z-20 animate-fadeInRight">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <Image
                    src="http://apps.transportehidalgo.gob.mx:8081/Imagenes/stch.png"
                    alt="Logo"
                    width={70}
                    height={70}
                    className="rounded-none"
                  />
                </div>
                <CardTitle className="text-3xl md:text-4xl font-extrabold text-[#80142c] leading-tight">
                  Inicio sesión
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2 text-lg md:text-xl">
                  Ingrese sus credenciales para continuar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="username" className="block text-gray-700 text-sm md:text-base font-semibold mb-2">
                      Nombre de usuario
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Ej: JuanPerez2024"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full p-3 text-base md:text-lg border border-gray-400 rounded-lg
                       focus:border-gray-500 focus:ring-0
                       transition-all duration-200 text-gray-800
                       hover:border-gray-500 placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="block text-gray-700 text-sm md:text-base font-semibold mb-2">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 text-base md:text-lg border border-gray-400 rounded-lg
                       focus:border-gray-500 focus:ring-0
                       transition-all duration-200 pr-10 text-gray-800
                       hover:border-gray-500 placeholder-gray-400"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-all duration-200"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-3 text-lg bg-gradient-to-r from-[#bc1c44] to-[#80142c]
                     hover:from-[#80142c] hover:to-[#bc1c44] text-white font-bold rounded-lg
                     shadow-lg transition-all duration-300 transform hover:-translate-y-1
                     flex items-center justify-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5" />
                        Iniciando Sesión...
                      </>
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </Button>
                </form>
              </CardContent>

              {/* Back Button (Mobile) */}
              <button
                onClick={() => setCurrentPage(0)}
                className="mt-4 text-[#b01639] font-medium flex items-center justify-center gap-1"
              >
                <ChevronLeft size={18} /> Volver al inicio
              </button>
            </Card>
          </div>



        </div>
        {/* Pagination Indicators */}
        <div className="flex justify-center gap-2 mt-4 mb-6 z-20">
          {[0, 1].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-3 h-3 rounded-full ${currentPage === page ? 'bg-[#b01639]' : 'bg-gray-300'}`}
              aria-label={`Ir a página ${page + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop Layout (hidden on mobile) */}
      <div className="hidden lg:flex flex-col lg:flex-row items-center justify-center w-full max-w-5xl mx-auto gap-12 p-8 pt-28 lg:pt-8 flex-grow">
        {/* Left Section: Large Image and Description */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left lg:w-1/2 animate-fadeInLeft">
          <Image
            src="https://res.cloudinary.com/dvvhnrvav/image/upload/v1749563496/transporte/fkg3g8g8aofojin64fdn.jpg"
            alt="Gran Logo de Transporte Hidalgo"
            width={280}
            height={250}
            className="rounded-none mb-8"
          />
          <h1 className="text-6xl font-extrabold text-black mb-6 leading-tight drop-shadow-lg">
            Plataforma Integral de <span className="text-[#b01639]">Transporte Hidalgo</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed max-w-xl">
            Conectando a nuestra comunidad con eficiencia y seguridad.
            Acceda a todas las herramientas y recursos para una gestión óptima de servicios y operaciones.
          </p>
        </div>

        {/* Right Section: Login Card */}
        <Card className="w-full max-w-md bg-white text-gray-900 shadow-3xl p-8 transform transition-all duration-500 ease-out hover:scale-[1.02] relative z-20 animate-fadeInRight">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <Image src="http://apps.transportehidalgo.gob.mx:8081/Imagenes/stch.png" alt="Logo" width={70} height={70} className="rounded-none" />
            </div>
            <CardTitle className="text-4xl font-extrabold text-[#80142c] leading-tight">
              Inicio sesión
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2 text-lg">
              Ingrese sus credenciales para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="username" className="block text-gray-700 text-sm font-semibold mb-2">Nombre de usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ej: JuanPerez202"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)} // ✅ Esto es lo que faltaba
                  className="w-full p-3 border border-gray-300 rounded-lg
    focus:ring-2 focus:ring-[#bc1c44] focus:border-transparent
    transition-all duration-200 text-gray-800
    hover:border-gray-400 placeholder-gray-400"
                />

              </div>

              <div>
                <Label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} // ✅ Esto también
                    className="w-full p-3 border border-gray-300 rounded-lg
    focus:ring-2 focus:ring-[#bc1c44] focus:border-transparent
    transition-all duration-200 pr-10 text-gray-800"
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-all duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#bc1c44] to-[#80142c] hover:from-[#80142c] hover:to-[#bc1c44] text-white font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 text-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    Iniciando Sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Infinite Carousel Banner */}
      <div className="w-full overflow-hidden my-12 py-4">
        <div className="flex animate-scroll-logos whitespace-nowrap">
          {[...Array(5)].map((_, i) => (
            <Image
              key={i}
              src="https://res.cloudinary.com/dvvhnrvav/image/upload/v1749225391/ow0pfzer6dnnzgvtin5q.jpg"
              alt="Logos de Movilidad Hidalgo"
              width={1200}
              height={50}
              className="inline-block h-auto"
            />
          ))}
          {[...Array(5)].map((_, i) => (
            <Image
              key={`duplicate-${i}`}
              src="https://res.cloudinary.com/dvvhnrvav/image/upload/v1749225391/ow0pfzer6dnnzgvtin5q.jpg"
              alt="Logos de Movilidad Hidalgo"
              width={120}
              height={50}
              className="inline-block h-auto"
            />
          ))}
        </div>
      </div>


      {/* Footer */}
      <footer className="relative w-full">
        <div className="relative w-full h-10 overflow-hidden">
          <Image
            src="https://res.cloudinary.com/dvvhnrvav/image/upload/v1749563496/transporte/fjr7hbdptzspaa9bfcsa.jpg"
            alt="Imagen decorativa del footer"
            layout="fill"
            objectFit="cover"
            className="opacity-90"
          />
        </div>
      </footer>
    </div>
  )
}