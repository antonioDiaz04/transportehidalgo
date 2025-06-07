"use client"

import type React from "react"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

// Lazy loading component wrapper
export function LazyModule({
  modulePath,
  fallback = <LoadingFallback />,
}: {
  modulePath: string
  fallback?: React.ReactNode
}) {
  const DynamicComponent = dynamic(() => import(modulePath), {
    loading: () => fallback,
    ssr: false,
  })

  return (
    <Suspense fallback={fallback}>
      <DynamicComponent />
    </Suspense>
  )
}

// Default loading fallback
export function LoadingFallback() {
  return (
    <div className="flex h-[200px] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#bc1c44]" />
    </div>
  )
}
