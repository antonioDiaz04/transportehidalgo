"use client" // This must be at the very top of the file

import apiClient from "@/lib/apiClient"
import type React from "react"
import { useState, useRef, useEffect, useMemo } from "react"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Trash2,
  XCircle,
  FileImage,
  ClipboardCheck,
  Lightbulb,
  Car,
  ShieldCheck,
  ArrowLeft,
  Upload,
  Save,
  Loader,
  BadgeCheck,
  TriangleAlert,
  Award,
  ClipboardList,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Opciones para campos que son select y tienen SI:BIEN, SI:MAL, NO
const generalSelectOptions = [
  { value: "0", label: "Seleccione..." },
  { value: "1", label: "SI:BIEN" },
  { value: "2", label: "SI:MAL" },
  { value: "3", label: "NO" },
]

// Opciones específicas para los nuevos campos de "Características para el Tipo de Servicio" (PONDERACIÓN)
// **NOTA IMPORTANTE:** Los 'value' de estas opciones son los IDs que se enviarán a la API.
// Si tu backend espera enteros, asegúrate de que estos 'value' sean convertibles a enteros.
const modeloVehiculoOptions = [
  { value: "0", label: "Seleccione Modelo", score: 0 },
  { value: "1", label: "2011 - 2018", score: 1 },
  { value: "2", label: "2019 - 2022", score: 2 },
  { value: "3", label: "2022 - 2025", score: 3 }, // Ideal
]

const tipoVehiculoOptions = [
  { value: "0", label: "Seleccione Tipo", score: 0 },
  { value: "1", label: "SEDÁN", score: 1 },
  { value: "2", label: "BERLINA / MINIVAN", score: 2 },
  { value: "3", label: "SUV", score: 3 }, // Ideal
]

const capacidadPasajerosOptions = [
  { value: "0", label: "Seleccione Capacidad", score: 0 },
  { value: "1", label: "5 PASAJEROS", score: 1 },
  { value: "2", label: "DE 5 - 6 PASAJEROS", score: 2 },
  { value: "3", label: "DE 5 A 8 PASAJEROS", score: 3 }, // Ideal
]

const bolsasAireOptions = [
  { value: "0", label: "Seleccione Nivel", score: 0 },
  { value: "1", label: "NINGUNA", score: 1 },
  { value: "2", label: "FRONTALES", score: 2 },
  { value: "3", label: "FRONTALES Y LATERALES", score: 3 }, // Ideal
]

const aireAcondicionadoOptions = [
  { value: "0", label: "Seleccione", score: 0 },
  { value: "1", label: "No cuenta", score: 1 },
  { value: "2", label: "Cuenta con", score: 3 }, // Ideal
]

const tiposFrenoOptions = [
  { value: "0", label: "Seleccione", score: 0 },
  { value: "1", label: "Tambor", score: 1 },
  { value: "2", label: "Disco", score: 2 },
  { value: "3", label: "ABS", score: 3 }, // Ideal
]

const cinturonesSeguridadTipoOptions = [
  { value: "0", label: "Seleccione", score: 0 },
  { value: "1", label: "De 2 a 5", score: 1 },
  { value: "2", label: "De 2 a 6", score: 2 },
  { value: "3", label: "De 2 a 8", score: 3 }, // Ideal
]

const coberturaAsientosOptions = [
  { value: "0", label: "Seleccione", score: 0 },
  { value: "1", label: "Tela", score: 1 },
  { value: "2", label: "Tela/Piel", score: 2 },
  { value: "3", label: "Vinilo/Cuero", score: 3 }, // Ideal
]

// Mapeo de clasificación de texto a ID numérico
const classificationToIdMap: { [key: string]: number } = {
  RECHAZADO: 1,
  "NO CLASIFICADO": 2, // Nuevo ID
  "PENDIENTE DE CLASIFICAR": 3, // Nuevo ID
  ESENCIAL: 4,
  SELECTO: 5,
  PRIME: 6,
}

// Mapeo inverso de ID numérico a clasificación de texto (para mostrar en el frontend si es necesario)
const idToClassificationMap: { [key: number]: string } = {
  1: "RECHAZADO",
  2: "NO CLASIFICADO",
  3: "PENDIENTE DE CLASIFICAR",
  4: "ESENCIAL",
  5: "SELECTO",
  6: "PRIME",
}

interface SelectedImage {
  id: string
  file?: File
  type: string
  previewUrl: string
  customName?: string
  idImagenRevistaVehicular?: number
}

interface ConcesionarioData {
  IdConcesion: number
  Folio: string
  TipoServicio: string
  TipoPlaca: string
  Mnemotecnia: string
  Modalidad: string
  MunicipioAutorizado: string
  ClaseUnidad: string | null
  VigenciaAnios: number | null
  SeriePlacaActual: string
  FechaExpedicion: string
  Observaciones: string
  IdVehiculoActual: string
  Placa: string
  Propietario: string
  FolioVehiculo: string
}

interface TramiteOption {
  value: string
  label: string
}

// DEFINICIÓN DE LOS CAMPOS DE INSPECCIÓN INICIALES - ACTUALIZADO PARA CHECKBOXES
const initialInspectionData = {
  // Checkbox (Casillas de Verificación)
  placaDelantera: false,
  placaTrasera: false,
  calcaVerificacion: false,
  calcaTenencia: false,
  pinturaCarroceria: false, // Ahora es Checkbox
  estadoLlantas: false, // Ahora es Checkbox
  claxon: false,
  luzBaja: false,
  luzAlta: false,
  cuartos: false,
  direccionales: false,
  intermitentes: false,
  stop: false,
  timbre: false,
  estinguidor: false,
  herramientas: false,
  sistemaFrenado: false, // Ahora es Checkbox
  sistemaDireccion: false, // Ahora es Checkbox
  sistemaSuspension: false, // Ahora es Checkbox
  interiores: false, // Ahora es Checkbox
  botiquin: false,
  cinturonSeguridad: false,
  imagenCromatica: false,
  aprobarRevistaVehicular: false, // Este es el campo final de aprobación

  // Select (Listas Desplegables) - SOLO los que quedan como Select
  defensas: "0", // Cambiado a string para select, default a "0" (Seleccione...)
  vidrios: "0", // Cambiado a string para select, default a "0" (Seleccione...)
  limpiadores: "0", // Cambiado a string para select, default a "0" (Seleccione...)
  espejos: "0", // Cambiado a string para select, default a "0" (Seleccione...)
  llantaRefaccion: "0", // Cambiado a string para select, default a "0" (Seleccione...)
  parabrisasMedallon: "0", // Cambiado a string para select, default a "0" (Seleccione...)

  // Características para el tipo de servicio (mantengo las que ya estaban con puntuación)
  modeloVehiculo: "0", // Default a "0" para el ID
  tipoVehiculo: "0", // Default a "0" para el ID
  capacidadPasajeros: "0", // Default a "0" para el ID
  bolsasAire: "0", // Default a "0" para el ID
  aireAcondicionado: "0", // Default a "0" para el ID
  tiposFreno: "0",
  cinturonesSeguridadTipo: "0",
  coberturaAsientos: "0",
}

// Estructura de clasificación y puntuación de los campos (para la LÓGICA de cálculo) - ACTUALIZADO
const scoringSchema = {
  // Campos Esenciales (RECHAZADO si alguno no cumple las condiciones)
  essential: [
    { key: "placaDelantera", label: "Placa Delantera", type: "checkbox" as const },
    { key: "placaTrasera", label: "Placa Trasera", type: "checkbox" as const },
    { key: "calcaVerificacion", label: "Calcomanía de Verificación", type: "checkbox" as const },
    { key: "calcaTenencia", label: "Calcomanía de Tenencia", type: "checkbox" as const },
    { key: "pinturaCarroceria", label: "Pintura y Carrocería", type: "checkbox" as const },
    { key: "estadoLlantas", label: "Estado de Llantas", type: "checkbox" as const },
    { key: "claxon", label: "Claxon", type: "checkbox" as const },
    { key: "luzBaja", label: "Luz Baja", type: "checkbox" as const },
    { key: "luzAlta", label: "Luz Alta", type: "checkbox" as const },
    { key: "cuartos", label: "Luces de Cuartos", type: "checkbox" as const },
    { key: "direccionales", label: "Direccionales", type: "checkbox" as const },
    { key: "intermitentes", label: "Luces Intermitentes", type: "checkbox" as const },
    { key: "stop", label: "Luces de Stop", type: "checkbox" as const },
    { key: "timbre", label: "Timbre (si aplica)", type: "checkbox" as const },
    { key: "estinguidor", label: "Extinguidor", type: "checkbox" as const },
    { key: "herramientas", label: "Herramientas Básicas", type: "checkbox" as const },
    { key: "sistemaFrenado", label: "Sistema de Frenado", type: "checkbox" as const },
    { key: "sistemaDireccion", label: "Sistema de Dirección", type: "checkbox" as const },
    { key: "sistemaSuspension", label: "Sistema de Suspensión", type: "checkbox" as const },
    { key: "interiores", label: "Interiores", type: "checkbox" as const },
    { key: "botiquin", label: "Botiquín de Primeros Auxilios", type: "checkbox" as const },
    { key: "cinturonSeguridad", label: "Cinturones de Seguridad", type: "checkbox" as const },
    { key: "imagenCromatica", label: "Imagen Cromática", type: "checkbox" as const },
    // Campos SELECT que son esenciales y su fallo causa rechazo
    { key: "defensas", label: "Defensas", type: "select-essential" as const, options: generalSelectOptions },
    { key: "vidrios", label: "Vidrios", type: "select-essential" as const, options: generalSelectOptions },
    { key: "limpiadores", label: "Limpiaparabrisas", type: "select-essential" as const, options: generalSelectOptions },
    { key: "espejos", label: "Espejos Laterales", type: "select-essential" as const, options: generalSelectOptions },
    {
      key: "llantaRefaccion",
      label: "Llanta de Refacción",
      type: "select-essential" as const,
      options: generalSelectOptions,
    },
    {
      key: "parabrisasMedallon",
      label: "Parabrisas y Medallón",
      type: "select-essential" as const,
      options: generalSelectOptions,
    },
  ],
  // Campos Puntuables (Características para el tipo de servicio)
  scored: [
    { key: "modeloVehiculo", label: "Modelo del Vehículo", type: "select" as const, options: modeloVehiculoOptions },
    { key: "tipoVehiculo", label: "Tipo de Vehículo", type: "select" as const, options: tipoVehiculoOptions },
    {
      key: "capacidadPasajeros",
      label: "Capacidad de Pasajeros",
      type: "select" as const,
      options: capacidadPasajerosOptions,
    },
    { key: "bolsasAire", label: "Bolsas de Aire (Nivel)", type: "select" as const, options: bolsasAireOptions }, // Descomentado
    {
      key: "aireAcondicionado",
      label: "Aire Acondicionado",
      type: "select" as const,
      options: aireAcondicionadoOptions,
    }, // Descomentado
    { key: "tiposFreno", label: "Tipos de Freno", type: "select" as const, options: tiposFrenoOptions },
    {
      key: "cinturonesSeguridadTipo",
      label: "Tipo de Cinturones de Seguridad",
      type: "select" as const,
      options: cinturonesSeguridadTipoOptions,
    },
    {
      key: "coberturaAsientos",
      label: "Cobertura de Asientos(tapiceria)",
      type: "select" as const,
      options: coberturaAsientosOptions,
    },
  ],
}

// Campos para la sección "CARACTERISTICAS PARA EL TIPO DE SERVICIO" (Separada VISUALMENTE)
const serviceCharacteristicFields = scoringSchema.scored

const defaultTramiteOptions: TramiteOption[] = [
  { value: "invalid-selection", label: "Seleccione aquí" },
  { value: "3", label: "Cambio de Vehículo" },
  { value: "12", label: "Emplacamiento" },
  { value: "26", label: "Cambio de Motor de Vehículo" },
  { value: "39", label: "Pago de Derechos" },
]

export default function InspeccionRevistaVehicularForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const idConcesionParam = searchParams.get("idC")
  const [inspectionData, setInspectionData] = useState(initialInspectionData)
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([])
  const [observaciones, setObservaciones] = useState("")
  const [selectedTramite, setSelectedTramite] = useState("invalid-selection")
  const [tramiteOptions, setTramiteOptions] = useState<TramiteOption[]>(defaultTramiteOptions)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fetchedImageTypes, setFetchedImageTypes] = useState<any[]>([])
  const { toast } = useToast()
  const [imageToDelete, setImageToDelete] = useState<{ id: string; idImagenRevistaVehicular?: number } | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [concesionarioData, setConcesionarioData] = useState<ConcesionarioData | null>(null)
  const [isLoadingConcesion, setIsLoadingConcesion] = useState(false)
  const [isLoadingTramites, setIsLoadingTramites] = useState(false)

  // Estado para los diálogos de confirmación y resultados
  const [confirmSave, setConfirmSave] = useState(false)
  const [inspectionResultAlert, setInspectionResultAlert] = useState<{
    isOpen: boolean
    isRejected: boolean
    classification: string // Keep string for display
    classificationId: number // New: for sending to API
    score: number
    totalPossibleScore: number
  } | null>(null)
  const [isScoringLogicModalOpen, setIsScoringLogicModalOpen] = useState(false) // Estado para el modal de lógica de puntuación
  const [checkAllEssential, setCheckAllEssential] = useState(false) // New state for "Marcar Todas" checkbox

  // Calcula el estado de la inspección y la puntuación utilizando useMemo para eficiencia
  const { isRejected, totalScore, classification, classificationId, totalPossibleScore } = useMemo(() => {
    let currentScore = 0
    let vehicleRejected = false
    let maxPossibleScore = 0 // Se calcula la puntuación máxima solo para los campos puntuables

    // 1. Verificar Campos Esenciales para el rechazo
    for (const field of scoringSchema.essential) {
      const value = inspectionData[field.key as keyof typeof initialInspectionData]
      if (field.type === "checkbox") {
        // Para checkboxes esenciales: si es 'false' (desmarcado), el vehículo es rechazado.
        if (value === false) {
          vehicleRejected = true
          break
        }
      } else if (field.type === "select-essential") {
        // Para selects esenciales: si es "0" (Seleccione...), "2" (SI:MAL), o "3" (NO), el vehículo es rechazado.
        if (value === "0" || value === "2" || value === "3") {
          vehicleRejected = true
          break
        }
      }
    }

    // 2. Calcular la Puntuación para los campos de "Tipo de Servicio" si no ha sido ya rechazado
    if (!vehicleRejected) {
      for (const field of scoringSchema.scored) {
        const selectedValue = inspectionData[field.key as keyof typeof initialInspectionData]
        // Encuentra la opción máxima posible para este campo y súmala al total posible
        const maxOptionScore = Math.max(...field.options.map((o) => o.score || 0))
        maxPossibleScore += maxOptionScore

        // **IMPORTANTE: Usa el valor actual de inspectionData (que ya es el ID) para buscar en las opciones**
        // y así obtener el score.
        const selectedOption = field.options.find((option) => option.value === selectedValue)
        if (selectedOption) {
          currentScore += selectedOption.score
        }
      }
    }

    // 3. Determinar la Clasificación (TEXTO)
    let vehicleClassification = "N/A"
    if (vehicleRejected) {
      vehicleClassification = "RECHAZADO" // Este estado es primario y excluye los demás
    } else {
      const allScoredFieldsSelected = scoringSchema.scored.every(
        (field) => inspectionData[field.key as keyof typeof initialInspectionData] !== "0",
      )

      if (!allScoredFieldsSelected) {
        vehicleClassification = "PENDIENTE DE CLASIFICAR" // Si no se han llenado todos los puntuables
      } else if (currentScore === 0) {
        // Si no hay rechazo pero la puntuación es 0 y todos los puntuables están seleccionados
        vehicleClassification = "NO CLASIFICADO"
      } else if (currentScore > 0 && currentScore < 12) {
        // 1 a 11 points
        vehicleClassification = "ESENCIAL"
      } else if (currentScore >= 12 && currentScore <= 18) {
        // 12 a 18 points
        vehicleClassification = "SELECTO"
      } else if (currentScore > 18) {
        // Más de 18 puntos (hasta 24 si todos son 3 puntos)
        vehicleClassification = "PRIME"
      }
    }

    // 4. Obtener el ID de la Clasificación
    const classificationId = classificationToIdMap[vehicleClassification] || 0 // Default to 0 or an error ID if not found

    return {
      isRejected: vehicleRejected,
      totalScore: currentScore,
      classification: vehicleClassification,
      classificationId: classificationId, // Return the ID as well
      totalPossibleScore: maxPossibleScore,
    }
  }, [inspectionData])

  // Helper para obtener estilos de clasificación
  const getClassificationStyles = (classification: string) => {
    switch (classification) {
      case "RECHAZADO":
        return " text-red-800 border-red-300"
      case "NO CLASIFICADO":
      case "PENDIENTE DE CLASIFICAR":
        return " text-gray-800 border-gray-300"
      case "ESENCIAL":
        return " text-yellow-800 border-yellow-300"
      case "SELECTO":
        return " text-blue-800 border-blue-300"
      case "PRIME":
        return " text-green-800 border-green-300"
      default:
        return " text-gray-800 border-gray-300"
    }
  }

  // Cargar trámites disponibles
  useEffect(() => {
    const fetchTramites = async () => {
      setIsLoadingTramites(true)
      try {
        const response = await apiClient("/revista/tipos-tramite", {
          method: "GET",
          withCredentials: true,
        })
        console.log("Respuesta de la API de trámites:", response.data)
        if (response.data && Array.isArray(response.data)) {
          const tramites = response.data
            .filter(
              (tramite: any) =>
                tramite.IdTramite !== null && tramite.IdTramite !== undefined && String(tramite.IdTramite) !== "",
            )
            .map((tramite: any) => ({
              value: String(tramite.IdTramite),
              label: tramite.Tramite,
            }))
          setTramiteOptions([{ value: "invalid-selection", label: "Seleccione aquí" }, ...tramites])
        } else {
          setTramiteOptions(defaultTramiteOptions)
          toast({
            title: "Trámites cargados por defecto",
            description: "No se pudieron cargar los trámites desde el servidor. Se usarán las opciones por defecto.",
            variant: "default",
          })
        }
      } catch (error) {
        console.error("Error al obtener trámites:", error)
        setTramiteOptions(defaultTramiteOptions)
        toast({
          title: "Trámites cargados por defecto",
          description: "No se pudieron cargar los trámites desde el servidor. Se usarán las opciones por defecto.",
          variant: "default",
        })
      } finally {
        setIsLoadingTramites(false)
      }
    }
    fetchTramites()
  }, [toast])

  // Efecto para cargar datos del concesionario automáticamente desde la URL
  useEffect(() => {
    const fetchConcesionarioData = async () => {
      if (idConcesionParam) {
        setIsLoadingConcesion(true)
        try {
          const { data } = await apiClient(`/concesion/autorizacion/${idConcesionParam}`, {
            method: "GET",
            withCredentials: true,
          })
          console.log("Respuesta de la API de concesionario/autorización:", data)
          if (data) {
            const apiData = data
            setConcesionarioData({
              IdConcesion: apiData.IdConcesion,
              Folio: apiData.Folio,
              TipoServicio: apiData.TipoServicio,
              TipoPlaca: apiData.TipoPlaca,
              Mnemotecnia: apiData.Mnemotecnia,
              Modalidad: apiData.Modalidad,
              MunicipioAutorizado: apiData.MunicipioAutorizado,
              ClaseUnidad: apiData.ClaseUnidad,
              VigenciaAnios: apiData.VigenciaAnios,
              SeriePlacaActual: apiData.SeriePlacaActual,
              FechaExpedicion: apiData.FechaExpedicion,
              Observaciones: apiData.Observaciones,
              IdVehiculoActual: apiData.IdVehiculoActual,
              Placa: apiData.SeriePlacaActual,
              Propietario: apiData.IdConcesionarioActual || apiData.IdPropietario,
              FolioVehiculo: apiData.Folio,
            })
            toast({
              title: "Concesionario y Vehículo encontrados",
              description: `Datos cargados para el ID de Concesión: ${idConcesionParam}`,
            })
          } else {
            setConcesionarioData(null)
            toast({
              title: "No encontrado",
              description: `No se encontraron datos para el ID de Concesión ${idConcesionParam}.`,
              variant: "default",
            })
          }
        } catch (err: any) {
          console.error("Error al cargar concesionario/autorización:", err)
          setConcesionarioData(null)
          toast({
            title: "Error de carga",
            description: `Ocurrió un error al cargar los datos: ${err.response?.data?.error || err.message}`,
            variant: "destructive",
          })
        } finally {
          setIsLoadingConcesion(false)
        }
      } else {
        setConcesionarioData(null)
        toast({
          title: "Advertencia",
          description: "No se ha proporcionado un ID de Concesión en la URL. Ejemplo: `/tu-ruta?idC=123`",
          variant: "default",
        })
      }
    }
    fetchConcesionarioData()
  }, [idConcesionParam, toast])

  // Efecto para cargar los tipos de imagen disponibles
  useEffect(() => {
    const fetchImageTypes = async () => {
      try {
        const response = await apiClient("/revista/tipos-imagen", {
          method: "GET",
          withCredentials: true,
        })
        const typesArray = response.data
        if (!Array.isArray(typesArray)) {
          console.error(
            "Error: La respuesta de tipos de imagen no es un array o no contiene una propiedad 'data' que sea un array.",
            response.data,
          )
          setFetchedImageTypes([])
          toast({
            title: "Error al cargar tipos de imagen",
            description: "Ocurrió un error al cargar los tipos de imagen. La lista estará vacía.",
            variant: "destructive",
          })
          return
        }
        const types = typesArray
          .filter(
            (type: any) =>
              type.IdTipoImagen !== null && type.IdTipoImagen !== undefined && String(type.IdTipoImagen) !== "",
          )
          .map((type: any) => ({
            value: String(type.IdTipoImagen),
            label: type.TipoImagen,
          }))
        setFetchedImageTypes(types)
      } catch (error) {
        console.error("Error al obtener tipos de imagen:", error)
        toast({
          title: "Error al cargar tipos de imagen",
          description: "Ocurrió un error al cargar los tipos de imagen. La lista estará vacía.",
          variant: "destructive",
        })
        setFetchedImageTypes([])
      }
    }
    fetchImageTypes()
  }, [toast])

  // Limpieza de URLs de objetos cuando las imágenes seleccionadas cambian
  useEffect(() => {
    return () => {
      selectedImages.forEach((img) => {
        if (img.file && img.previewUrl) {
          URL.revokeObjectURL(img.previewUrl)
        }
      })
    }
  }, [selectedImages])

  // Modificado para manejar booleanos (checkbox) y strings (select)
  const handleFieldChange = (field: keyof typeof initialInspectionData, value: boolean | string) => {
    setInspectionData((prev) => ({ ...prev, [field]: value }))
    // If an individual checkbox is unchecked, uncheck the "Marcar Todas" checkbox
    if (typeof value === "boolean" && field !== "aprobarRevistaVehicular" && value === false) {
      setCheckAllEssential(false)
    }
  }

  // Handler for "Marcar Todas" checkbox
  const handleCheckAllEssential = (checked: boolean) => {
    setCheckAllEssential(checked)
    const newInspectionData = { ...inspectionData }
    scoringSchema.essential.forEach((field) => {
      if (field.type === "checkbox") {
        ;(newInspectionData as any)[field.key] = checked
      } else if (field.type === "select-essential") {
        // For select-essential fields, set to "SI:BIEN" when "Marcar Todas" is checked
        ;(newInspectionData as any)[field.key] = checked ? "1" : "0" // "1" for SI:BIEN, "0" for Seleccione...
      }
    })
    setInspectionData(newInspectionData)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const newImages: SelectedImage[] = Array.from(files).map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        file: file,
        type: "",
        previewUrl: URL.createObjectURL(file),
      }))
      setSelectedImages((prev) => [...prev, ...newImages])
      toast({
        title: "Imágenes seleccionadas",
        description: `${newImages.length} imagen(es) seleccionada(s).`,
      })
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleTypeChange = (id: string, newTypeValue: string) => {
    setSelectedImages((prev) =>
      prev.map((img) => {
        if (img.id === id) {
          const selectedTypeLabel = fetchedImageTypes.find((t: any) => t.value === newTypeValue)?.label || newTypeValue
          let extension = ""
          if (img.file?.name) {
            extension = img.file.name.split(".").pop() || ""
          } else if (img.previewUrl.startsWith("data:image/jpeg")) {
            extension = "jpg"
          } else if (img.previewUrl.startsWith("data:image/png")) {
            extension = "png"
          }
          const safeType = selectedTypeLabel.replace(/\s+/g, "_").toLowerCase()
          const customName = `inspeccion_${safeType}_${Date.now()}${extension ? "." + extension : ""}`
          return { ...img, type: newTypeValue, customName }
        }
        return img
      }),
    )
  }

  const handleRemoveImage = async (idImagen: string, idImagenRevistaVehicular?: number) => {
    console.log("--- Iniciando proceso de handleRemoveImage ---")
    console.log("IdImagen (local) recibido:", idImagen)
    console.log("idImagenRevistaVehicular (de la BD) recibido:", idImagenRevistaVehicular)
    const imageToRemove = selectedImages.find((img) =>
      img.idImagenRevistaVehicular ? img.idImagenRevistaVehicular === idImagenRevistaVehicular : img.id === idImagen,
    )
    if (imageToRemove?.file && imageToRemove.previewUrl) {
      URL.revokeObjectURL(imageToRemove.previewUrl)
    }
    setImageToDelete({
      id: idImagen,
      idImagenRevistaVehicular: idImagenRevistaVehicular || imageToRemove?.idImagenRevistaVehicular,
    })
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteImage = async () => {
    setIsDeleting(true)
    console.log("--- Iniciando proceso de confirmDeleteImage ---")
    console.log("Estado actual de imageToDelete:", imageToDelete)
    if (!imageToDelete) {
      toast({
        title: "Error al eliminar",
        description: "No se ha seleccionado ninguna imagen para eliminar",
        variant: "destructive",
      })
      setIsDeleting(false)
      return
    }
    try {
      if (imageToDelete.idImagenRevistaVehicular) {
        await apiClient(`/revista/imagen/${imageToDelete.idImagenRevistaVehicular}`, {
          method: "DELETE",
          withCredentials: true,
        })
        toast({
          title: "Imagen eliminada",
          description: "Imagen eliminada del servidor y localmente.",
        })
      } else {
        toast({
          title: "Imagen eliminada",
          description: "Imagen eliminada localmente (no estaba en el servidor).",
        })
      }
      setSelectedImages((prev) =>
        prev.filter((img) =>
          imageToDelete.idImagenRevistaVehicular
            ? img.idImagenRevistaVehicular !== imageToDelete.idImagenRevistaVehicular
            : img.id !== imageToDelete.id,
        ),
      )
    } catch (error: any) {
      console.error("Error al eliminar imagen:", error)
      toast({
        title: "Error al eliminar imagen",
        description: `Error: ${error.response?.data?.error || error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsDeleteModalOpen(false)
      setImageToDelete(null)
      setIsDeleting(false)
    }
  }

  const cancelDeleteImage = () => {
    setIsDeleteModalOpen(false)
    setImageToDelete(null)
  }

  const handleClearAllLocalImages = () => {
    selectedImages.forEach((img) => {
      if (img.file) URL.revokeObjectURL(img.previewUrl)
    })
    setSelectedImages((prev) => prev.filter((img) => img.idImagenRevistaVehicular)) // Solo mantiene las que vienen del servidor
    toast({
      title: "Imágenes locales borradas",
      description: "Todas las imágenes no subidas han sido eliminadas de la vista previa.",
    })
  }

  /**
   * Handles the initial form submission.
   * Performs validations and, if successful, opens the confirmation modal.
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    // Do NOT set setIsSubmitting(true) here, as it's for the actual API call after confirmation.
    // It will be set in handleConfirmSave.

    // Validations
    if (!idConcesionParam || !concesionarioData) {
      toast({
        title: "Error de Validación",
        description: "No se han cargado los datos del concesionario. Verifique el ID en la URL.",
        variant: "destructive",
      })
      return // Stop here if basic data is missing
    }

    if (selectedTramite === "invalid-selection") {
      toast({
        title: "Error de Validación",
        description: "Debe seleccionar un tipo de trámite.",
        variant: "destructive",
      })
      return // Stop here if tramite is not selected
    }

    // Check if all essential fields are checked or "SI:BIEN"
    const allEssentialFieldsAreGood = scoringSchema.essential.every((field) => {
      const value = inspectionData[field.key as keyof typeof initialInspectionData]
      if (field.type === "checkbox") {
        return value === true // Checkbox must be true
      } else if (field.type === "select-essential") {
        return value === "1" // Select must be "SI:BIEN" (value "1")
      }
      return false // Should ideally not be reached for defined essential fields
    })

    if (!allEssentialFieldsAreGood && inspectionData.aprobarRevistaVehicular) {
      toast({
        title: "Error de Validación",
        description: "No se puede aprobar la revista si no todos los campos esenciales están 'SI:BIEN' o marcados.",
        variant: "destructive",
      })
      return // Stop if approval is attempted with failing essential checks
    }

    // If all pre-submission validations pass, show the confirmation modal
    console.log("Todas las validaciones previas pasaron. Intentando abrir modal de confirmación.") // Added for debugging
    setConfirmSave(true) // <--- This will now correctly open the modal
  }

  // Lógica para guardar después de la confirmación del modal
  const handleConfirmSave = async () => {
    setIsSubmitting(true) // Activa el estado de carga y deshabilita el botón del modal
    setConfirmSave(false) // Cierra el modal de confirmación inmediatamente para UX
    try {
      // Re-validar por si acaso (aunque ya se hizo en handleSubmit, es buena práctica)
      // Se puede omitir algunas de estas validaciones si se confía en que handleSubmit las cubrió.
      // Pero mantenerlas aquí agrega una capa de seguridad.
      if (!idConcesionParam || !concesionarioData || selectedTramite === "invalid-selection") {
        toast({
          title: "Error de Validación",
          description: "Faltan datos esenciales para guardar la inspección. Intente de nuevo.",
          variant: "destructive",
        })
        return
      }

      // Prepare data for API
      const revistaData = {
        idConcesion: concesionarioData.IdConcesion,
        idPropietario: concesionarioData.Propietario, // Asegúrate de que este es el ID del propietario correcto
        idTramite: Number.parseInt(selectedTramite),
        idVehiculo: Number.parseInt(concesionarioData.IdVehiculoActual),
        placa: concesionarioData.Placa,
        propietario: concesionarioData.Propietario, // Nombre del propietario o identificador
        // Campos de verificación (checkboxes y selects)
        placaDelanteraVer: inspectionData.placaDelantera,
        placaTraseraVer: inspectionData.placaTrasera,
        calcaVerificacionVer: inspectionData.calcaVerificacion,
        calcaTenenciaVer: inspectionData.calcaTenencia,
        pinturaCarroceriaVer: inspectionData.pinturaCarroceria,
        estadoLlantasVer: inspectionData.estadoLlantas,
        defensasVer: inspectionData.defensas,
        vidriosVer: inspectionData.vidrios,
        limpiadoresVer: inspectionData.limpiadores,
        espejosVer: inspectionData.espejos,
        llantaRefaccionVer: inspectionData.llantaRefaccion,
        parabrisasMedallonVer: inspectionData.parabrisasMedallon,
        claxonVer: inspectionData.claxon,
        luzBajaVer: inspectionData.luzBaja,
        luzAltaVer: inspectionData.luzAlta,
        cuartosVer: inspectionData.cuartos,
        direccionalesVer: inspectionData.direccionales,
        intermitentesVer: inspectionData.intermitentes,
        stopVer: inspectionData.stop,
        timbreVer: inspectionData.timbre,
        estinguidorVer: inspectionData.estinguidor,
        herramientasVer: inspectionData.herramientas,
        sistemaFrenadoVer: inspectionData.sistemaFrenado,
        sistemaDireccionVer: inspectionData.sistemaDireccion,
        sistemaSuspensionVer: inspectionData.sistemaSuspension,
        interioresVer: inspectionData.interiores,
        botiquinVer: inspectionData.botiquin,
        cinturonSeguridadVer: inspectionData.cinturonSeguridad,
        observaciones: observaciones,
        aprobado: inspectionData.aprobarRevistaVehicular,
        imagenCromaticaVer: inspectionData.imagenCromatica,
        folio: concesionarioData.Folio,
        // Nuevos campos de puntuación - ¡AQUÍ ES DONDE ENVIAMOS LOS IDS!
        // Usamos directamente el valor de inspectionData, que ya es el ID.
        modeloId: inspectionData.modeloVehiculo,
        tipoId: inspectionData.tipoVehiculo,
        capacidadId: inspectionData.capacidadPasajeros,
        tipoBolsa: inspectionData.bolsasAire,
        tieneAire: inspectionData.aireAcondicionado,
        frenoId: inspectionData.tiposFreno,
        cinturonId: inspectionData.cinturonesSeguridadTipo,
        tapiceriaId: inspectionData.coberturaAsientos,
        puntuacion: totalScore,
        clasificacionId: classificationId, // <--- AHORA ENVIAMOS EL ID NUMÉRICO DE LA CLASIFICACIÓN
      }

      const response = await apiClient("/revista", {
        method: "POST",
        data: revistaData,
        withCredentials: true,
      })
      console.log(response.idRV)

      const idRV = response.idRV
      if (!idRV) {
        throw new Error("ID de Revista Vehicular no recibido del servidor.")
      }

      // toast({
      //   title: "Inspección Guardada",
      //   description: `Inspección #${idRV} guardada exitosamente.`,
      //   variant: "success",
      // })
      alert({
        title: "Inspección Guardada", 
        description: `Inspección #${idRV} guardada exitosamente.`,
        variant: "success",
      })

      // Subir imágenes
      const imagesToUpload = selectedImages.filter((img) => img.file && img.type && !img.idImagenRevistaVehicular)
      if (imagesToUpload.length > 0) {
        setIsUploading(true)
        for (const img of imagesToUpload) {
          const formData = new FormData()
          formData.append("imagen", img.file as Blob)
          formData.append("idRV", String(idRV))
          formData.append("tipoImagen", img.type)
          if (img.customName) {
            formData.append("customName", img.customName) // Add custom name if exists
          }
          try {
            await apiClient("/revista/imagen", {
              method: "POST",
              data: formData,
              headers: {
                "Content-Type": "multipart/form-data",
              },
              withCredentials: true,
            })
            toast({
              title: "Imagen Subida",
              description: `Imagen de tipo ${img.type} subida para inspección #${idRV}.`,
            })
            // Update the image in selectedImages to mark it as uploaded
            // NOTE: A more robust solution would be to get the actual idImagenRevistaVehicular from the backend response
            setSelectedImages((prev) =>
              prev.map((sImg) =>
                sImg.id === img.id ? { ...sImg, idImagenRevistaVehicular: idRV /* Placeholder */ } : sImg,
              ),
            )
          } catch (uploadError: any) {
            console.error(`Error al subir imagen ${img.id}:`, uploadError)
            toast({
              title: "Error al subir imagen",
              description: `No se pudo subir la imagen de tipo ${img.type}. Error: ${uploadError.response?.data?.error || uploadError.message}`,
              variant: "destructive",
            })
          }
        }
        setIsUploading(false)
      }

      // Show the result alert after all operations are complete
      setInspectionResultAlert({
        isOpen: true,
        isRejected: isRejected,
        classification: classification,
        classificationId: classificationId, // Pass the ID here too
        score: totalScore,
        totalPossibleScore: totalPossibleScore,
      })

      // Reset form or navigate - Consider where you want the user to go next
      // resetForm(); // You might want a function to reset the form states
      // router.push(`/some-success-page?idRV=${idRV}`); // Or navigate
      router.push(`/dashboard/BandejaRevista`) // Example: navigate back to concession list
    } catch (error: any) {
      console.error("Error al guardar la inspección:", error)
      toast({
        title: "Error al Guardar",
        description: `Ocurrió un error al guardar la inspección: ${error.response?.data?.error || error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false) // Re-enable button
    }
  }

  return (
    <div className="flex flex-col max-w-full min-h-screen">
      <header className="sticky top-0 max-w-full border bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="container h-16 flex items-center justify-between px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-50"
          >
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Revisión y Revista Vehicular</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsScoringLogicModalOpen(true)}
              className="text-gray-700 dark:text-gray-200"
            >
              <Lightbulb className="mr-2 h-4 w-4" /> Lógica Puntuación
            </Button>
            <Button
              type="submit"
              form="inspection-form" // Link to the form ID
              disabled={isLoadingConcesion || isLoadingTramites || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> Procesando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Guardar Inspección
                </>
              )}
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto md:p-6">
        <div className="mx-auto max-w-full grid gap-6">
          {/* Sección de Datos de Concesionario */}
          <Card className="shadow-lg border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <ClipboardList className="mr-2 h-6 w-6 text-blue-500" />
                Datos de Concesión y Vehículo
              </CardTitle>
              {isLoadingConcesion && <Loader className="h-6 w-6 animate-spin text-blue-500" />}
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
              {concesionarioData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Folio de Concesión:</Label>
                    <Input
                      value={concesionarioData.Folio}
                      readOnly
                      className="font-semibold text-blue-700 dark:text-blue-300 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Propietario:</Label>
                    <Input
                      value={concesionarioData.Propietario}
                      readOnly
                      className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Placa Actual:</Label>
                    <Input
                      value={concesionarioData.Placa}
                      readOnly
                      className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tipo de Servicio:</Label>
                    <Input
                      value={concesionarioData.TipoServicio}
                      readOnly
                      className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Modalidad:</Label>
                    <Input
                      value={concesionarioData.Modalidad}
                      readOnly
                      className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Municipio Autorizado:</Label>
                    <Input
                      value={concesionarioData.MunicipioAutorizado}
                      readOnly
                      className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tramite-select" className="text-sm font-medium">
                      Tipo de Trámite
                    </Label>
                    <Select value={selectedTramite} onValueChange={setSelectedTramite} disabled={isLoadingTramites}>
                      <SelectTrigger id="tramite-select" className="w-full">
                        <SelectValue placeholder="Seleccione un trámite" />
                      </SelectTrigger>
                      <SelectContent>
                        {tramiteOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  No se han cargado datos de concesión. Verifique el ID en la URL.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Sección de Clasificación del Vehículo */}
          <Card className="shadow-lg border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Award className="mr-2 h-6 w-6 text-purple-500" />
                Clasificación y Puntuación del Vehículo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-semibold">Estado General:</Label>
                  <div
                    className={`font-bold text-lg px-3 py-1 rounded-md border-2 ${getClassificationStyles(classification)}`}
                  >
                    {classification}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-base font-semibold">Puntuación Total:</Label>
                  <div className="font-bold text-lg px-3 py-1 rounded-md border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                    {totalScore} / {totalPossibleScore}
                  </div>
                </div>
                {isRejected && (
                  <div className="col-span-full text-center p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md flex items-center justify-center gap-2">
                    <TriangleAlert className="h-5 w-5" />
                    <span>Este vehículo ha sido **RECHAZADO** debido a fallas en campos esenciales.</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Formulario de Inspección */}
          <form id="inspection-form" onSubmit={handleSubmit} className="grid gap-6">
            {/* Sección de Documentación y Visibilidad */}
            <Card className="shadow-lg border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <ClipboardCheck className="mr-2 h-6 w-6 text-green-500" />
                  Documentación y Visibilidad
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Verifique el estado de la documentación y elementos visibles del vehículo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="marcar-todas-esenciales"
                    checked={checkAllEssential}
                    onCheckedChange={handleCheckAllEssential}
                    className="h-5 w-5"
                  />
                  <Label
                    htmlFor="marcar-todas-esenciales"
                    className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-blue-600 dark:text-blue-400"
                  >
                    Marcar todas las verificaciones esenciales como "BIEN"
                  </Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scoringSchema.essential.map((field) => {
                    if (field.type === "checkbox") {
                      return (
                        <div key={field.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={field.key}
                            checked={inspectionData[field.key as keyof typeof initialInspectionData] as boolean}
                            onCheckedChange={(checked: boolean) =>
                              handleFieldChange(field.key as keyof typeof initialInspectionData, checked)
                            }
                            className="h-5 w-5"
                          />
                          <Label htmlFor={field.key} className="text-sm">
                            {field.label}
                          </Label>
                        </div>
                      )
                    } else if (field.type === "select-essential") {
                      return (
                        <div key={field.key} className="grid gap-1.5">
                          <Label htmlFor={field.key} className="text-sm">
                            {field.label}
                          </Label>
                          <Select
                            value={inspectionData[field.key as keyof typeof initialInspectionData] as string}
                            onValueChange={(value) =>
                              handleFieldChange(field.key as keyof typeof initialInspectionData, value)
                            }
                          >
                            <SelectTrigger id={field.key}>
                              <SelectValue placeholder="Seleccione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )
                    }
                    return null // Should not happen
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Sección de Características para el Tipo de Servicio (Puntuación) */}
            <Card className="shadow-lg border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Car className="mr-2 h-6 w-6 text-orange-500" />
                  Características para el Tipo de Servicio (Ponderación)
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Evalúe las características del vehículo para determinar su clasificación de servicio.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviceCharacteristicFields.map((field) => (
                    <div key={field.key} className="grid gap-1.5">
                      <Label htmlFor={field.key} className="text-sm">
                        {field.label}
                      </Label>
                      <Select
                        value={inspectionData[field.key as keyof typeof initialInspectionData] as string}
                        onValueChange={(value) =>
                          handleFieldChange(field.key as keyof typeof initialInspectionData, value)
                        }
                      >
                        <SelectTrigger id={field.key}>
                          <SelectValue placeholder="Seleccione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((option) => (
                            // Aquí el valor es el ID (e.g., "1", "2", "3")
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sección de Observaciones */}
            <Card className="shadow-lg border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <ClipboardList className="mr-2 h-6 w-6 text-purple-500" />
                  Observaciones
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Añada cualquier observación relevante sobre la inspección.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Escribe tus observaciones aquí..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={4}
                  className="min-h-[100px] bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                />
              </CardContent>
            </Card>

            {/* Sección de Imágenes */}
            <Card className="shadow-lg border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <FileImage className="mr-2 h-6 w-6 text-indigo-500" />
                  Imágenes
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Adjunte imágenes del vehículo y seleccione su tipo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-blue-50 file:text-blue-700
                                                hover:file:bg-blue-100
                                                dark:file:bg-blue-900 dark:file:text-blue-200 dark:hover:file:bg-blue-800"
                  />
                  {selectedImages.filter((img) => img.file).length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClearAllLocalImages}
                      className="whitespace-nowrap flex-shrink-0 bg-transparent"
                    >
                      <XCircle className="mr-2 h-4 w-4" /> Borrar imágenes locales
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedImages.map((image) => (
                    <Card
                      key={image.id}
                      className="relative group overflow-hidden border-gray-300 dark:border-gray-600"
                    >
                      <Image
                        src={image.previewUrl || "/placeholder.svg"}
                        alt={`Preview ${image.id}`}
                        width={200}
                        height={200}
                        className="w-full h-32 object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(image.id, image.idImagenRevistaVehicular)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <CardContent className="p-3">
                        <Label htmlFor={`type-${image.id}`} className="sr-only">
                          Tipo de imagen
                        </Label>
                        <Select
                          value={image.type}
                          onValueChange={(value) => handleTypeChange(image.id, value)}
                          disabled={fetchedImageTypes.length === 0}
                        >
                          <SelectTrigger id={`type-${image.id}`}>
                            <SelectValue placeholder="Seleccione Tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {fetchedImageTypes.map((type: any) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {image.customName && <p className="text-xs text-gray-500 mt-1 truncate">{image.customName}</p>}
                        {image.idImagenRevistaVehicular && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center">
                            <Upload className="h-3 w-3 mr-1" /> Subida (ID: {image.idImagenRevistaVehicular})
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {isUploading && (
                  <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                    <Loader className="h-5 w-5 animate-spin" /> Subiendo imágenes...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sección de Aprobación Final */}
            <Card className="shadow-lg border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <ShieldCheck className="mr-2 h-6 w-6 text-teal-500" />
                  Estado Final de la Revista
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Marque para aprobar o desaprobar la revista vehicular.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="aprobarRevistaVehicular"
                    checked={inspectionData.aprobarRevistaVehicular}
                    onCheckedChange={(checked: boolean) => handleFieldChange("aprobarRevistaVehicular", checked)}
                    className="h-5 w-5"
                    disabled={isRejected} // Disable if already rejected by essential checks
                  />
                  <Label htmlFor="aprobarRevistaVehicular" className="text-base font-medium">
                    Aprobar Revista Vehicular
                  </Label>
                </div>
                {isRejected && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <TriangleAlert className="h-4 w-4" /> La aprobación está deshabilitada ya que el vehículo fue
                    RECHAZADO.
                  </p>
                )}
              </CardContent>
            </Card>
          </form>
        </div>
      </main>

      {/* AlertDialog for confirmation */}
      <AlertDialog open={confirmSave} onOpenChange={setConfirmSave}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Guardar Inspección</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea guardar esta inspección vehicular?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmSave(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog for inspection result */}
      <AlertDialog
        open={inspectionResultAlert?.isOpen || false}
        onOpenChange={(open) => setInspectionResultAlert((prev) => (prev ? { ...prev, isOpen: open } : null))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              {inspectionResultAlert?.isRejected ? (
                <TriangleAlert className="mr-2 h-6 w-6 text-red-500" />
              ) : (
                <BadgeCheck className="mr-2 h-6 w-6 text-green-500" />
              )}
              Resultado de la Inspección
            </AlertDialogTitle>
            <AlertDialogDescription>
              La inspección ha sido procesada.
              <br />
              **Clasificación:**{" "}
              <span className={`font-semibold ${getClassificationStyles(inspectionResultAlert?.classification || "")}`}>
                {inspectionResultAlert?.classification}
              </span>
              <br />
              **ID de Clasificación:** {inspectionResultAlert?.classificationId} {/* Mostrar el ID también */}
              <br />
              **Puntuación:** {inspectionResultAlert?.score} / {inspectionResultAlert?.totalPossibleScore}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setInspectionResultAlert(null)
                router.push("/revista") // Navigate back to list or another relevant page
              }}
            >
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog for Scoring Logic Explanation */}
      <AlertDialog open={isScoringLogicModalOpen} onOpenChange={setIsScoringLogicModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <Lightbulb className="mr-2 h-6 w-6 text-yellow-500" /> Lógica de Puntuación y Clasificación
            </AlertDialogTitle>
            <AlertDialogDescription>
              <h3 className="font-bold text-gray-900 dark:text-white mt-4 mb-2">Campos Esenciales:</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Estos campos son **críticos**. Si cualquiera de ellos (checkbox o select) no cumple con la condición de
                "BIEN" (marcado para checkboxes, "SI:BIEN" para selects), el vehículo es automáticamente **RECHAZADO**.
                La puntuación no se calcula si el vehículo es rechazado.
              </p>
              <h3 className="font-bold text-gray-900 dark:text-white mt-4 mb-2">
                Campos Puntuables ("Características para el Tipo de Servicio"):
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Estos campos suman puntos basados en la opción seleccionada. La puntuación total determina la
                clasificación final del vehículo si no ha sido rechazado por los campos esenciales.
              </p>
              <h3 className="font-bold text-gray-900 dark:text-white mt-4 mb-2">Clasificaciones y sus IDs:</h3>
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
                <li>**RECHAZADO (ID: {classificationToIdMap["RECHAZADO"]}):** Si algún campo esencial no cumple.</li>
                <li>
                  **NO CLASIFICADO (ID: {classificationToIdMap["NO CLASIFICADO"]}):** Si no hay rechazo pero la
                  puntuación de los campos puntuables es 0, y todos los campos puntuables han sido seleccionados.
                </li>
                <li>
                  **PENDIENTE DE CLASIFICAR (ID: {classificationToIdMap["PENDIENTE DE CLASIFICAR"]}):** Si no hay
                  rechazo pero no todos los campos puntuables han sido seleccionados (mantienen "0" o
                  "invalid-selection").
                </li>
                <li>**ESENCIAL (ID: {classificationToIdMap["ESENCIAL"]}):** Puntuación total entre 1 y 11 puntos.</li>
                <li>**SELECTO (ID: {classificationToIdMap["SELECTO"]}):** Puntuación total entre 12 y 18 puntos.</li>
                <li>**PRIME (ID: {classificationToIdMap["PRIME"]}):** Puntuación total mayor a 18 puntos.</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                La puntuación máxima posible es {totalPossibleScore}.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsScoringLogicModalOpen(false)}>Entendido</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
