'use client' // <-- Esto lo convierte en un Client Component

import dynamic from "next/dynamic"
import { LoadingFallback } from "@/components/lazy-module"

// Lazy load the module
const VehiculoModule = dynamic(() => import("./vehiculo-module"), {
  loading: () => <LoadingFallback />,
  ssr: false,
})

export default function ExpedientePage() {
  return <VehiculoModule />
}
