'use client' // <-- Esto lo convierte en un Client Component

import dynamic from "next/dynamic"
import { LoadingFallback } from "@/components/lazy-module"

// Lazy load the module
const TitularModule = dynamic(() => import("./titular-module"), {
  loading: () => <LoadingFallback />,
  ssr: false,
})

export default function TitularPage() {
  return <TitularModule />
}
