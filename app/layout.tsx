import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({
  subsets: ["latin"], display: 'swap', // Esto ayuda si la fuente tarda en cargarse
  // Agrega una fuente de sistema de respaldo
  fallback: ['system-ui', 'arial', 'sans-serif'],
})

export const metadata: Metadata = {
  title: "STCH - Sistema de Transporte y Control de Gestión",
  description: "A modern and minimalist ERP system",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
