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
import { Loader2, PlusCircle, X } from "lucide-react"

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
    type: string // This will be the string representation of the numeric ID
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
                return " text-black-800 border-black-300"
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
                        value: String(type.IdTipoImagen), // Ensure value is a string, e.g., "1", "2"
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
                ; (newInspectionData as any)[field.key] = checked
            } else if (field.type === "select-essential") {
                // For select-essential fields, set to "SI:BIEN" when "Marcar Todas" is checked
                ; (newInspectionData as any)[field.key] = checked ? "1" : "0" // "1" for SI:BIEN, "0" for Seleccione...
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
                type: "", // Initialize type as empty, will be set by the user via dropdown
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
                    return { ...img, type: newTypeValue, customName } // Ensure 'type' is the numeric ID as a string
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
        // Set the image to delete and open the modal
        setImageToDelete({
            id: idImagen,
            idImagenRevistaVehicular: idImagenRevistaVehicular || imageToRemove?.idImagenRevistaVehicular,
        })
        setIsDeleteModalOpen(true) // <--- This line opens the modal
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
            setIsDeleteModalOpen(false) // Close modal on error
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
                description: `No se pudo eliminar la imagen: ${error.response?.data?.error || error.message}`,
                variant: "destructive",
            })
        } finally {
            setIsDeleting(false)
            setIsDeleteModalOpen(false) // Always close modal after attempt
            setImageToDelete(null) // Clear the image to delete state
        }
    }

    const handleUploadImages = async () => {
        if (!idConcesionParam) {
            toast({
                title: "Error de concesión",
                description: "No se ha encontrado un ID de concesión válido para asociar las imágenes.",
                variant: "destructive",
            })
            return
        }

        const imagesToUpload = selectedImages.filter((img) => img.file && !img.idImagenRevistaVehicular)

        if (imagesToUpload.length === 0) {
            toast({
                title: "No hay imágenes nuevas",
                description: "No hay imágenes nuevas para subir o ya están todas en el servidor.",
                variant: "default",
            })
            return
        }

        // Basic validation for image type
        const imagesWithoutType = imagesToUpload.filter(img => img.type === "");
        if (imagesWithoutType.length > 0) {
            toast({
                title: "Tipos de imagen incompletos",
                description: "Por favor, selecciona un tipo para todas las imágenes antes de subir.",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true)
        try {
            const uploadPromises = imagesToUpload.map(async (img) => {
                if (img.file) {
                    const formData = new FormData()
                    formData.append("imagen", img.file, img.customName)
                    formData.append("idRV", idConcesionParam)
                    formData.append("tipoImagen", img.type) // Ensure this is the numeric ID string

                    const response = await apiClient("/revista/imagen", {
                        data: formData,
                        method: "POST",
                        headers: { "Content-Type": "multipart/form-data" },
                        withCredentials: true,
                    })
                    // Assuming the response includes the new idImagenRevistaVehicular
                    return { ...img, idImagenRevistaVehicular: response.data.IdImagenRevistaVehicular }
                }
                return img
            })

            const uploadedImagesResults = await Promise.all(uploadPromises)

            // Update selectedImages with new IDs for those that were uploaded
            setSelectedImages((prev) =>
                prev.map((prevImg) => {
                    const uploaded = uploadedImagesResults.find((resImg) => resImg.id === prevImg.id)
                    return uploaded || prevImg
                }),
            )

            toast({
                title: "Imágenes subidas",
                description: "Todas las imágenes nuevas se han subido correctamente.",
            })
        } catch (error: any) {
            console.error("Error al subir imágenes:", error)
            toast({
                title: "Error al subir imágenes",
                description: `Ocurrió un error al subir una o más imágenes: ${error.response?.data?.error || error.message}`,
                variant: "destructive",
            })
        } finally {
            setIsUploading(false)
        }
    }

    const handleSaveInspection = async () => {
        setConfirmSave(true)
    }

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

    const goBack = () => {
        router.back()
    }

    if (isLoadingConcesion || isLoadingTramites) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-2">Cargando datos del concesionario y trámites...</p>
            </div>
        )
    }

    if (!concesionarioData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4">
                <TriangleAlert className="h-20 w-20 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Concesión No Encontrada</h2>
                <p className="text-gray-600 mb-6 text-center">
                    No se pudieron cargar los datos de la concesión con el ID proporcionado. <br />
                    Por favor, verifica el ID e inténtalo de nuevo.
                </p>
                <Button onClick={goBack} className="flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <Button onClick={goBack} className="mb-6 flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
            </Button>
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Inspección de Revista Vehicular</h1>
            <Card className="mb-6 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                        <Car className="mr-2 h-6 w-6" />
                        Datos del Vehículo y Concesión
                    </CardTitle>
                    <CardDescription>Información obtenida automáticamente.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                        <Label className="text-sm font-medium text-gray-600">ID Concesión:</Label>
                        <Input type="text" value={concesionarioData.IdConcesion || "N/A"} readOnly disabled className="font-semibold" />
                    </div>
                    <div className="flex flex-col">
                        <Label className="text-sm font-medium text-gray-600">Folio:</Label>
                        <Input type="text" value={concesionarioData.Folio || "N/A"} readOnly disabled className="font-semibold" />
                    </div>
                    <div className="flex flex-col">
                        <Label className="text-sm font-medium text-gray-600">Tipo de Servicio:</Label>
                        <Input type="text" value={concesionarioData.TipoServicio || "N/A"} readOnly disabled />
                    </div>
                    <div className="flex flex-col">
                        <Label className="text-sm font-medium text-gray-600">Tipo de Placa:</Label>
                        <Input type="text" value={concesionarioData.TipoPlaca || "N/A"} readOnly disabled />
                    </div>
                    <div className="flex flex-col">
                        <Label className="text-sm font-medium text-gray-600">Placa Actual:</Label>
                        <Input type="text" value={concesionarioData.Placa || "N/A"} readOnly disabled className="font-semibold" />
                    </div>
                    <div className="flex flex-col">
                        <Label className="text-sm font-medium text-gray-600">Propietario:</Label>
                        <Input type="text" value={concesionarioData.Propietario || "N/A"} readOnly disabled />
                    </div>
                    <div className="flex flex-col">
                        <Label className="text-sm font-medium text-gray-600">Modalidad:</Label>
                        <Input type="text" value={concesionarioData.Modalidad || "N/A"} readOnly disabled />
                    </div>
                    <div className="flex flex-col">
                        <Label className="text-sm font-medium text-gray-600">Municipio Autorizado:</Label>
                        <Input type="text" value={concesionarioData.MunicipioAutorizado || "N/A"} readOnly disabled />
                    </div>
                    <div className="flex flex-col">
                        <Label className="text-sm font-medium text-gray-600">Clase de Unidad:</Label>
                        <Input type="text" value={concesionarioData.ClaseUnidad || "N/A"} readOnly disabled />
                    </div>
                    <div className="flex flex-col">
                        <Label className="text-sm font-medium text-gray-600">Vigencia (Años):</Label>
                        <Input type="text" value={concesionarioData.VigenciaAnios || "N/A"} readOnly disabled />
                    </div>
                    <div className="flex flex-col">
                        <Label className="text-sm font-medium text-gray-600">Fecha de Expedición:</Label>
                        <Input type="text" value={concesionarioData.FechaExpedicion || "N/A"} readOnly disabled />
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-6 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                        <ClipboardList className="mr-2 h-6 w-6" />
                        Datos Generales de la Inspección
                    </CardTitle>
                    <CardDescription>Completa la información requerida para la inspección.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex flex-col">
                            <Label htmlFor="tramiteSelect" className="mb-1">
                                Tipo de Trámite
                            </Label>
                            <Select value={selectedTramite} onValueChange={setSelectedTramite} disabled={isSubmitting}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccione un tipo de trámite" />
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
                        <div className="flex flex-col">
                            <Label htmlFor="observaciones" className="mb-1">
                                Observaciones Adicionales
                            </Label>
                            <Textarea
                                id="observaciones"
                                placeholder="Añade cualquier observación relevante aquí..."
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                rows={3}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                        <Checkbox
                            id="checkAllEssential"
                            checked={checkAllEssential}
                            onCheckedChange={handleCheckAllEssential}
                            disabled={isSubmitting}
                        />
                        <Label htmlFor="checkAllEssential" className="text-base font-medium">
                            Marcar Todas las Características Esenciales como SI:BIEN / Cumple
                        </Label>
                    </div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">
                        <ShieldCheck className="inline-block mr-2 h-5 w-5 text-green-600" />
                        Características Esenciales (Cumplimiento Obligatorio)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
                        {scoringSchema.essential.map((field) => (
                            <div key={field.key} className="flex flex-col gap-1">
                                <Label htmlFor={field.key} className="text-sm font-medium cursor-pointer">
                                    {field.label}
                                </Label>
                                {field.type === "checkbox" ? (
                                    <Checkbox
                                        id={field.key}
                                        checked={inspectionData[field.key as keyof typeof initialInspectionData] as boolean}
                                        onCheckedChange={(checked) => handleFieldChange(field.key as keyof typeof initialInspectionData, checked)}
                                        disabled={isSubmitting}
                                    />
                                ) : (
                                    <Select
                                        value={inspectionData[field.key as keyof typeof initialInspectionData] as string}
                                        onValueChange={(value) => handleFieldChange(field.key as keyof typeof initialInspectionData, value)}
                                        disabled={isSubmitting}
                                    >
                                        <SelectTrigger className="w-full">
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
                                )}
                            </div>
                        ))}
                    </div>

                    <h3 className="text-lg font-semibold mt-8 mb-4 text-gray-700">
                        <Lightbulb className="inline-block mr-2 h-5 w-5 text-blue-600" />
                        Características para el Tipo de Servicio (Puntaje)
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsScoringLogicModalOpen(true)}
                            className="ml-2 text-blue-500 hover:text-blue-700"
                        >
                            <Lightbulb className="h-4 w-4 mr-1" /> Ver Lógica
                        </Button>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
                        {serviceCharacteristicFields.map((field) => (
                            <div key={field.key} className="flex flex-col gap-1">
                                <Label htmlFor={field.key} className="text-sm font-medium">
                                    {field.label}
                                </Label>
                                <Select
                                    value={inspectionData[field.key as keyof typeof initialInspectionData] as string}
                                    onValueChange={(value) => handleFieldChange(field.key as keyof typeof initialInspectionData, value)}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger className="w-full">
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
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-6 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                        <FileImage className="mr-2 h-6 w-6" />
                        Carga de Imágenes de la Revista Vehicular
                    </CardTitle>
                    <CardDescription>Sube las imágenes requeridas para la inspección.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
                        <Input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            className="flex-grow max-w-lg"
                            disabled={isUploading || isSubmitting}
                            accept="image/*"
                        />
                        <Button
                            onClick={handleUploadImages}
                            disabled={isUploading || isSubmitting || selectedImages.filter(img => img.file && !img.idImagenRevistaVehicular).length === 0}
                            className="flex items-center min-w-[150px]"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Subiendo...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" /> Subir Imágenes
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {selectedImages.map((img) => (
                            <Card key={img.id} className="relative group overflow-hidden">
                                <CardContent className="p-2">
                                    {img.previewUrl && (
                                        <div className="relative w-full h-32 bg-gray-100 flex items-center justify-center rounded-md overflow-hidden">
                                            <Image
                                                src={img.previewUrl}
                                                alt="Preview"
                                                layout="fill"
                                                objectFit="cover"
                                                className="rounded-md"
                                            />
                                        </div>
                                    )}
                                    <div className="mt-2">
                                        <p className="text-sm font-medium truncate mb-1">{img.customName || img.file?.name || "Imagen"}</p>
                                        <Select
                                            value={img.type}
                                            onValueChange={(value) => handleTypeChange(img.id, value)}
                                            disabled={isUploading || isSubmitting}
                                        >
                                            <SelectTrigger className="w-full text-xs h-8">
                                                <SelectValue placeholder="Tipo de imagen..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fetchedImageTypes.length > 0 ? (
                                                    fetchedImageTypes.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="no-types" disabled>
                                                        Cargando tipos...
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {img.idImagenRevistaVehicular && (
                                            <div className="text-xs text-green-600 flex items-center mt-1">
                                                <BadgeCheck className="h-3 w-3 mr-1" /> Subida
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleRemoveImage(img.id, img.idImagenRevistaVehicular)}
                                        disabled={isUploading || isSubmitting || isDeleting}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                        {selectedImages.length === 0 && (
                            <div className="col-span-full text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                <FileImage className="h-12 w-12 mx-auto mb-2" />
                                <p>No hay imágenes seleccionadas. Haz clic en "Seleccionar archivo" para comenzar.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-6 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                        <Award className="mr-2 h-6 w-6" />
                        Resultado de la Clasificación
                    </CardTitle>
                    <CardDescription>Cálculo automático basado en las características seleccionadas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <Label className="text-sm font-medium text-gray-600">Puntaje Total:</Label>
                            <Input
                                type="text"
                                value={`${totalScore} / ${totalPossibleScore}`}
                                readOnly
                                disabled
                                className="font-bold text-lg"
                            />
                        </div>
                        <div className="flex flex-col">
                            <Label className="text-sm font-medium text-gray-600">Clasificación:</Label>
                            <Input
                                type="text"
                                value={classification}
                                readOnly
                                disabled
                                className={`font-bold text-lg ${getClassificationStyles(classification)}`}
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-6">
                        <Checkbox
                            id="aprobarRevistaVehicular"
                            checked={inspectionData.aprobarRevistaVehicular}
                            onCheckedChange={(checked) => handleFieldChange("aprobarRevistaVehicular", checked)}
                            disabled={isSubmitting}
                        />
                        <Label htmlFor="aprobarRevistaVehicular" className="text-base font-medium">
                            Aprobar Revista Vehicular
                        </Label>
                    </div>
                    {isRejected && (
                        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
                            <TriangleAlert className="h-5 w-5 mr-2" />
                            <p className="font-semibold">Vehículo RECHAZADO: Algunos campos esenciales no cumplen con la condición "SI:BIEN".</p>
                        </div>
                    )}
                    {classification === "PENDIENTE DE CLASIFICAR" && !isRejected && (
                        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md flex items-center">
                            <TriangleAlert className="h-5 w-5 mr-2" />
                            <p className="font-semibold">Pendiente de Clasificar: Debes seleccionar todos los campos de "Características para el Tipo de Servicio" para una clasificación final.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end mt-8">
                <Button onClick={handleSaveInspection} disabled={isSubmitting || isUploading || isDeleting} className="px-8 py-3">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Guardando...
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5 mr-2" /> Guardar Inspección
                        </>
                    )}
                </Button>
            </div>

            {/* Delete Confirmation Modal */}
            <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro de eliminar esta imagen?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Si la imagen ya fue subida al servidor, se eliminará permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteImage} disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Save Confirmation Modal */}
            <AlertDialog open={confirmSave} onOpenChange={setConfirmSave}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Guardar Inspección</AlertDialogTitle>
                        <AlertDialogDescription>
                            Estás a punto de guardar la inspección vehicular. Una vez guardada, no podrás modificarla fácilmente.
                            <br /><br />
                            <span className="font-semibold">Clasificación Final:</span>{" "}
                            <span className={`${getClassificationStyles(classification)} font-bold`}>{classification}</span>
                            <br />
                            <span className="font-semibold">Puntaje Obtenido:</span> {totalScore}
                            <br />
                            ¿Deseas continuar?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setConfirmSave(false)} disabled={isSubmitting}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmSave} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Guardar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Inspection Result Alert (after successful save) */}
            {inspectionResultAlert && (
                <AlertDialog open={inspectionResultAlert.isOpen} onOpenChange={(open) => setInspectionResultAlert(prev => prev ? { ...prev, isOpen: open } : null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center">
                                {inspectionResultAlert.isRejected ? (
                                    <XCircle className="h-6 w-6 text-red-500 mr-2" />
                                ) : (
                                    <BadgeCheck className="h-6 w-6 text-green-500 mr-2" />
                                )}
                                Inspección Finalizada
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                La inspección se ha guardado exitosamente con la siguiente clasificación:
                                <br /><br />
                                <span className="font-semibold">Clasificación:</span>{" "}
                                <span className={`${getClassificationStyles(inspectionResultAlert.classification)} font-bold`}>
                                    {inspectionResultAlert.classification}
                                </span>
                                <br />
                                <span className="font-semibold">Puntaje Obtenido:</span> {inspectionResultAlert.score} de{" "}
                                {inspectionResultAlert.totalPossibleScore} posibles
                                {inspectionResultAlert.isRejected && (
                                    <p className="mt-2 text-red-600 font-bold">El vehículo ha sido RECHAZADO debido a fallos en campos esenciales.</p>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogAction onClick={() => {
                                setInspectionResultAlert(null); // Close the alert
                                router.push("/some-dashboard-or-list"); // Redirect to another page after acknowledging
                            }}>
                                Aceptar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {/* Scoring Logic Modal */}
            <AlertDialog open={isScoringLogicModalOpen} onOpenChange={setIsScoringLogicModalOpen}>
                <AlertDialogContent className="max-w-3xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center">
                            <Lightbulb className="mr-2 h-6 w-6" />
                            Lógica de Clasificación de Puntuación
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            <p className="mb-4">
                                La clasificación del vehículo se determina automáticamente en función de los puntajes obtenidos en las
                                "Características para el Tipo de Servicio".
                            </p>
                            <h4 className="font-bold text-lg mb-2">Puntajes por Opción:</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm mb-4">
                                {serviceCharacteristicFields.map((field) => (
                                    <div key={field.key} className="bg-gray-50 p-2 rounded-md">
                                        <p className="font-semibold">{field.label}:</p>
                                        <ul className="list-disc list-inside">
                                            {field.options.map((option) => (
                                                <li key={option.value}>
                                                    {option.label}: {option.score} puntos
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            <h4 className="font-bold text-lg mb-2">Clasificaciones por Puntaje Total:</h4>
                            <ul className="list-disc list-inside text-base">
                                <li className="mb-1">
                                    <span className="font-semibold text-red-700">RECHAZADO:</span> Si cualquier campo en "Características Esenciales" no cumple (checkbox desmarcado, o select "SI:MAL" / "NO" / "Seleccione...").
                                </li>
                                <li className="mb-1">
                                    <span className="font-semibold text-gray-700">PENDIENTE DE CLASIFICAR:</span> Si no se ha seleccionado un valor (diferente de "Seleccione...") para todos los campos de "Características para el Tipo de Servicio" y no está RECHAZADO.
                                </li>
                                <li className="mb-1">
                                    <span className="font-semibold text-gray-700">NO CLASIFICADO:</span> Si el puntaje total es 0, y no está RECHAZADO, y todos los campos de "Características para el Tipo de Servicio" han sido seleccionados.
                                </li>
                                <li className="mb-1">
                                    <span className="font-semibold text-yellow-700">ESENCIAL:</span> 1 a 11 puntos.
                                </li>
                                <li className="mb-1">
                                    <span className="font-semibold text-black">SELECTO:</span> 12 a 18 puntos.
                                </li>
                                <li className="mb-1">
                                    <span className="font-semibold text-green-700">PRIME:</span> Más de 18 puntos.
                                </li>
                            </ul>
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