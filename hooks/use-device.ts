// hooks/use-device.ts
"use client"

import { useState, useEffect } from "react"

export function useDevice() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)       // Mobile: < 768px
      setIsTablet(width >= 768 && width < 1024) // Tablet: 768px - 1024px
    }

    checkDevice()
    window.addEventListener("resize", checkDevice)
    return () => window.removeEventListener("resize", checkDevice)
  }, [])

  return { isMobile, isTablet }
}