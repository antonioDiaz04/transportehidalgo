import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="http://apps.transportehidalgo.gob.mx:8081/Imagenes/stch.png" alt="Logo" width={80} height={80} />
            {/* <span className="text-xl font-bold text-[#bc1c44]"></span> */}
          </div>
          <nav className="hidden md:flex gap-6">
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
          </nav>
          <div>
            <Button asChild className="bg-[#bc1c44] hover:bg-[#80142c]">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          </div>
        </div>
      </header>
      <main>
        <section className="py-20 md:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-[#bc1c44]">
                    Sistema ERP Moderno y Minimalista
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl">
                    Una solución completa para la gestión de su empresa con una interfaz moderna y fácil de usar.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild className="bg-[#bc1c44] hover:bg-[#80142c]">
                    <Link href="/login">Comenzar Ahora</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="#features">Conocer Más</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="http://apps.transportehidalgo.gob.mx:8081/Imagenes/stch.png"
                  width={400}
                  height={400}
                  alt="Dashboard Preview"
                  className="rounded-lg object-cover"
                />
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="py-12 md:py-24 bg-[#DDC9A3]">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-[#bc1c44]">
                  Características Principales
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Nuestro sistema ERP ofrece todas las herramientas que necesita para gestionar su empresa de manera
                  eficiente.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              {[
                {
                  title: "Gestión de Expedientes",
                  description: "Administre todos sus expedientes de manera eficiente y segura.",
                },
                {
                  title: "Control de Usuarios",
                  description: "Gestione los permisos y accesos de todos los usuarios del sistema.",
                },
                {
                  title: "Reportes Detallados",
                  description: "Obtenga informes detallados sobre todas las operaciones realizadas.",
                },
                {
                  title: "Gestión de Vehículos",
                  description: "Control completo sobre la información de vehículos registrados.",
                },
                {
                  title: "Búsqueda Avanzada",
                  description: "Encuentre rápidamente la información que necesita con nuestro sistema de búsqueda.",
                },
                {
                  title: "Diseño Responsivo",
                  description: "Acceda al sistema desde cualquier dispositivo con una experiencia optimizada.",
                },
              ].map((feature, index) => (
                <Card key={index} className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-[#80142c] py-6 md:py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Image src="http://apps.transportehidalgo.gob.mx:8081/Imagenes/stch.png" alt="Logo" width={100} height={100} />
            <span className="text-lg font-semibold text-[#bc1c44]">ERP System</span>
          </div>
          <p className="text-sm text-gray-500">© 2025 ERP System. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-gray-500 hover:text-[#bc1c44]">
              Términos
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-[#bc1c44]">
              Privacidad
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-[#bc1c44]">
              Contacto
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
