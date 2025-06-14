import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className=" top-0 z-40 w-full">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="https://res.cloudinary.com/dvvhnrvav/image/upload/v1749563496/transporte/afhhpxszzwtttnfyyg6r.jpg" alt="Logo" width={220} height={150} />
            {/* <span className="text-xl font-bold text-[#bc1c44]"></span> */}
          </div>
          {/* <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium hover:text-[#bc1c44] transition-colors">
              Inicio
            </Link>
            <Link href="#features" className="text-sm font-medium hover:text-[#bc1c44] transition-colors">
              Características
            </Link>
            <Link href="#about" className="text-sm font-medium hover:text-[#bc1c44] transition-colors">
              Acerca de
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:text-[#bc1c44] transition-colors">
              Contacto
            </Link>
          </nav> */}
          <div>
            <Button asChild className="bg-[#bc1c44] hover:bg-[#80142c]">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          </div>
        </div>
      </header>
      <main>
        <section className="py-10 md:py-32 bg-gray-100">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex items-center justify-center">
                <Image
                  src="http://apps.transportehidalgo.gob.mx:8081/Imagenes/stch.png"
                  width={400}
                  height={400}
                  alt="Dashboard Preview"
                  className="rounded-lg object-cover"
                />
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-[4rem] md:text-6xl font-extrabold text-black mb-6 leading-tight drop-shadow-lg">
                    Plataforma Integral de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b01639] to-[#dd0a3b]">
                      Transporte Hidalgo
                    </span>
                  </h1>


                  <p className="max-w-[600px] text-gray-500 md:text-xl">
                    Una solución completa para la gestión de su empresa con una interfaz moderna y fácil de usar.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild className="bg-[#bc1c44] hover:bg-[#80142c]">
                    <Link href="/login">Comenzar Ahora</Link>
                  </Button>
                  {/* <Button variant="outline" asChild>
                    <Link href="#features">Conocer Más</Link>
                  </Button> */}
                </div>
              </div>

            </div>
          </div>
        </section>
        {/* Infinite Carousel Banner */}
        <div className="w-full overflow-hidden text-center my-12 py-4">
          <h1 className="text-5xl text-black mb-6 leading-tight drop-shadow-lg">
            Entidades oficiales del Transporte en Hidalgo
          </h1>
          {/* Entidades oficiales del Transporte en Hidalgo */}
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


      </main>
      {/* Footer */}
      <footer className="relative w-full">
        {/* Div morado encima */}
        <div className="w-full h-5 bg-[#7b1e3b]" />

        {/* Imagen decorativa */}
        <div className="relative w-full h-5 overflow-hidden">
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
