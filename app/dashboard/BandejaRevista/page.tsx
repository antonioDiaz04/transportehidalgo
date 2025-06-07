'use client' // <-- Esto lo convierte en un Client Component
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
// Lazy load the module
const BandejaRevistaModule = dynamic(() => import("./bandejaRevista-module"), {
  loading: () => <LoadingFallback />,
  ssr: false,
})

export default function BandejaRevistaPage() {
  return <BandejaRevistaModule/>
}
