'use client'
import dynamic from "next/dynamic"
import { LoadingFallback } from "@/components/lazy-module"

const handleSearch = (
  concession: string,
  plate: string,
  status: string,
  inspectionDate: string,
  municipality: string
) => {
  // Implementa la lógica de búsqueda aquí
  console.log({ concession, plate, status, inspectionDate, municipality });
};

const ModificacionVehiculomodule = dynamic(() => import("./ModificacionVehiculomodule"), {
  loading: () => <LoadingFallback />,
  ssr: false,
})

export default function ModificacionVehiculoPage() {
  return <ModificacionVehiculomodule/>
}
