'use client' // <-- Esto lo convierte en un Client Component

import dynamic from "next/dynamic"
import { LoadingFallback } from "@/components/lazy-module"

// Lazy load the module
const UsersModule = dynamic(() => import("./users-module"), {
  loading: () => <LoadingFallback />,
  ssr: false,
})

export default function UsersPage() {
  return <UsersModule />
}
