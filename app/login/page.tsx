"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 1500)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-[#620a20] to-[#b01639] text-white p-4 overflow-hidden">
      {/* Header with brand colors */}
      <header className="w-full max-w-7xl absolute top-0 py-4 px-6 flex justify-between items-center z-10">
        <Image src="http://apps.transportehidalgo.gob.mx:8081/Imagenes/stch.png" alt="Logo" width={70} height={70} className="filter drop-shadow-md" />
        <nav>
          <Link href="/" className="text-[#F5E6CC] text-lg font-semibold hover:text-[#FFD700] transition-colors duration-300">
            Inicio
          </Link>
        </nav>
      </header>

      {/* Main Content Area: Large Image/Description on Left, Login on Right */}
      <div className="flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl gap-12 p-8 pt-24 lg:pt-8 flex-grow">
        {/* Left Section: Large Image and Description */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left lg:w-1/2 animate-fadeInLeft">
          <Image
            src="http://apps.transportehidalgo.gob.mx:8081/Imagenes/stch.png" // Using the same logo, but larger for impact
            alt="Gran Logo de Transporte Hidalgo"
            width={250} // Make it significantly larger
            height={250}
            className="rounded-none mb-8 "
          />
          <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
            Plataforma Integral de <span className="text-[#FFD700]">Transporte Hidalgo</span>
          </h1>
          <p className="text-xl text-gray-200 leading-relaxed max-w-xl">
            Conectando a nuestra comunidad con eficiencia y seguridad.
            Acceda a todas las herramientas y recursos para una gestión óptima de servicios y operaciones.
          </p>
        </div>

        {/* Right Section: Login Card */}
        <Card className="w-full max-w-md bg-white text-gray-900 rounded-2xl shadow-3xl p-8 transform transition-all duration-500 ease-out hover:scale-[1.02] relative z-20 animate-fadeInRight">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <Image src="http://apps.transportehidalgo.gob.mx:8081/Imagenes/stch.png" alt="Logo" width={70} height={70} className="rounded-none" />
            </div>
            <CardTitle className="text-4xl font-extrabold text-[#80142c] leading-tight">
              Bienvenido
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2 text-lg">
              Ingrese sus credenciales para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bc1c44] focus:border-transparent transition-all duration-200 text-gray-800"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bc1c44] focus:border-transparent transition-all duration-200 pr-10 text-gray-800"
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
          <CardFooter className="flex flex-col items-center gap-3 mt-4">
            <Link href="#" className="text-[#bc1c44] hover:underline text-sm font-medium transition-colors duration-200">
              ¿Olvidaste tu contraseña?
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Infinite Carousel Banner */}
      <div className="w-full overflow-hidden my-12 py-4">
        <div className="flex animate-scroll-logos whitespace-nowrap">
          {/* Repeat the image multiple times to create the infinite effect */}
          {[...Array(5)].map((_, i) => ( // Repeat 5 times, adjust as needed for smoothness
            <Image
              key={i}
              src="https://res.cloudinary.com/dvvhnrvav/image/upload/v1749225391/ow0pfzer6dnnzgvtin5q.jpg" // IMPORTANT: You need to save your image here!
              alt="Logos de Movilidad Hidalgo"
              width={1200} // Adjust width based on your image's actual width to prevent stretching
              height={100} // Adjust height to keep proportion, or set fixed height
              className="inline-block h-auto " // Use inline-block to keep them on one line
            />
          ))}
          {/* Duplicate again for seamless loop */}
          {[...Array(5)].map((_, i) => (
            <Image
              key={`duplicate-${i}`}
              src="https://res.cloudinary.com/dvvhnrvav/image/upload/v1749225391/ow0pfzer6dnnzgvtin5q.jpg" // IMPORTANT: You need to save your image here!
              alt="Logos de Movilidad Hidalgo"
              width={1200}
              height={100}
              className="inline-block h-auto "
            />
          ))}
        </div>
      </div>

      {/* Minimalist Footer with logo and Inicio link */}
      <footer className="p-4 text-center text-sm text-gray-300 relative z-10">
        <div className="flex items-center justify-center gap-4">
          <Image src="http://apps.transportehidalgo.gob.mx:8081/Imagenes/stch.png" alt="Logo" width={40} height={40} className="rounded-full opacity-80" />
          <Link href="/" className="text-gray-300 hover:text-[#F5E6CC] transition-colors duration-300 text-base font-medium">
            Inicio
          </Link>
        </div>
      </footer>
    </div>
  )
}