'use client' // <-- Esto lo convierte en un Client Component

import dynamic from "next/dynamic"
import { LoadingFallback } from "@/components/lazy-module"

// Lazy load the module
const ExpedienteModule = dynamic(() => import("./expediente-module"), {
  loading: () => <LoadingFallback />,
  ssr: false,
})

export default function ExpedientePage() {
  return <ExpedienteModule />
}
