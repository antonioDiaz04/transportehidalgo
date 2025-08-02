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
    PlusCircle,
    X,
    Loader2,
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

// Se elimina los campos que no existen en la API
const initialInspectionData = {
    // Checkbox (Casillas de Verificación)
    placaDelantera: false,
    placaTrasera: false,
    calcaVerificacion: false,
    calcaTenencia: false,
    pinturaCarroceria: false,
    estadoLlantas: false,
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
    sistemaFrenado: false,
    sistemaDireccion: false,
    sistemaSuspension: false,
    interiores: false,
    botiquin: false,
    cinturonSeguridad: false,
    imagenCromatica: false,
    aprobarRevistaVehicular: false,

    // Select (Listas Desplegables)
    defensas: "0",
    vidrios: "0",
    limpiadores: "0",
    espejos: "0",
    llantaRefaccion: "0",
    parabrisasMedallon: "0",

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

// Define las interfaces para tipar los datos y evitar errores
interface Option {
    value: string
    label: string
    score?: number
}

// Se eliminan los campos que no existen en la API
interface SelectOptions {
    capacidadPasajerosOptions: Option[]
    modeloVehiculoOptions: Option[]
    tipoVehiculoOptions: Option[]
    tiposFrenoOptions: Option[]
    cinturonesSeguridadTipoOptions: Option[]
    tapiceriaAsientosOptions: Option[]
    clasificacionOptions: Option[]
}

const defaultSelects: SelectOptions = {
    capacidadPasajerosOptions: [],
    modeloVehiculoOptions: [],
    tipoVehiculoOptions: [],
    tiposFrenoOptions: [],
    cinturonesSeguridadTipoOptions: [],
    tapiceriaAsientosOptions: [],
    clasificacionOptions: [],
}

export default function InspeccionRevistaVehicularForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const idConcesionParam = searchParams.get("idC")
    const [inspectionData, setInspectionData] = useState(initialInspectionData)
    const [dynamicSelectOptions, setDynamicSelectOptions] = useState<SelectOptions>(defaultSelects)
    const { toast } = useToast()
    const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([])
    const [observaciones, setObservaciones] = useState("")
    const [selectedTramite, setSelectedTramite] = useState("invalid-selection")
    const [tramiteOptions, setTramiteOptions] = useState<TramiteOption[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [fetchedImageTypes, setFetchedImageTypes] = useState<any[]>([])
    const [imageToDelete, setImageToDelete] = useState<{ id: string; idImagenRevistaVehicular?: number } | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [concesionarioData, setConcesionarioData] = useState<ConcesionarioData | null>(null)
    const [isLoadingConcesion, setIsLoadingConcesion] = useState(false)
    const [isLoadingTramites, setIsLoadingTramites] = useState(false)
    const [isLoadingDynamicOptions, setIsLoadingDynamicOptions] = useState(false)

    // Estado para los diálogos de confirmación y resultados
    const [confirmSave, setConfirmSave] = useState(false)
    const [inspectionResultAlert, setInspectionResultAlert] = useState<{
        isOpen: boolean
        isRejected: boolean
        classification: string
        classificationId: number
        score: number
        totalPossibleScore: number
    } | null>(null)
    const [isScoringLogicModalOpen, setIsScoringLogicModalOpen] = useState(false)
    const [checkAllEssential, setCheckAllEssential] = useState(false)

    // Define el esquema de puntuación dinámicamente con las opciones cargadas
    const scoringSchema = useMemo(() => {
        return {
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
                { key: "defensas", label: "Defensas", type: "select-essential" as const, options: generalSelectOptions },
                { key: "vidrios", label: "Vidrios", type: "select-essential" as const, options: generalSelectOptions },
                { key: "limpiadores", label: "Limpiaparabrisas", type: "select-essential" as const, options: generalSelectOptions },
                { key: "espejos", label: "Espejos Laterales", type: "select-essential" as const, options: generalSelectOptions },
                { key: "llantaRefaccion", label: "Llanta de Refacción", type: "select-essential" as const, options: generalSelectOptions },
                { key: "parabrisasMedallon", label: "Parabrisas y Medallón", type: "select-essential" as const, options: generalSelectOptions },
            ],
            // Los campos puntuados coinciden ahora con la API
            scored: [
                { key: "modeloVehiculo", label: "Modelo del Vehículo", type: "select" as const, options: dynamicSelectOptions.modeloVehiculoOptions },
                { key: "tipoVehiculo", label: "Tipo de Vehículo", type: "select" as const, options: dynamicSelectOptions.tipoVehiculoOptions },
                { key: "capacidadPasajeros", label: "Capacidad de Pasajeros", type: "select" as const, options: dynamicSelectOptions.capacidadPasajerosOptions },
                { key: "tiposFreno", label: "Tipos de Freno", type: "select" as const, options: dynamicSelectOptions.tiposFrenoOptions },
                { key: "cinturonesSeguridadTipo", label: "Cinturones de Seguridad (Tipo)", type: "select" as const, options: dynamicSelectOptions.cinturonesSeguridadTipoOptions },
                { key: "tapiceriaAsientos", label: "Tapicería de Asientos", type: "select" as const, options: dynamicSelectOptions.tapiceriaAsientosOptions },
                { key: "bolsasAire", label: "Bolsas de Aire (Nivel)", type: "select" as const, options: bolsasAireOptions }, // Descomentado
                {
                    key: "aireAcondicionado",
                    label: "Aire Acondicionado",
                    type: "select" as const,
                    options: aireAcondicionadoOptions,
                }, // Descomentado
            ],
        }
    }, [dynamicSelectOptions])

    // Lógica de cálculo de puntuación y clasificación con useMemo
    const { isRejected, totalScore,classification, classificationId, score, totalPossibleScore } = useMemo(() => {
        let currentScore = 0
        let vehicleRejected = false
        // La puntuación máxima posible es 6 campos * 3 puntos/campo = 18
        const maxPossibleScore = 18

        // Función para normalizar los IDs de la API a valores de 1, 2 o 3
        const getNormalizedScore = (id: number) => {
            // Asumiendo que los IDs 1, 2, 3 son puntajes "malos", y 4, 5, 6 son puntajes "buenos"
            if (id <= 3) {
                // Aquí podrías definir otra lógica si los IDs bajos tienen puntos
                return id;
            } else if (id >= 4) {
                return id - 3;
            }
            return 0; // Por defecto
        };


        // 1. Verificar Campos Esenciales para el rechazo
        for (const field of scoringSchema.essential) {
            const value = inspectionData[field.key as keyof typeof initialInspectionData]
            if (field.type === "checkbox") {
                if (value === false) {
                    vehicleRejected = true
                    break
                }
            } else if (field.type === "select-essential") {
                if (value === "0" || value === "2" || value === "3") {
                    vehicleRejected = true
                    break
                }
            }
        }

        // 2. Calcular la Puntuación para los campos de "Tipo de Servicio"
        if (!vehicleRejected) {
            for (const field of scoringSchema.scored) {
                const value = inspectionData[field.key as keyof typeof initialInspectionData];
                if (field.type === "select" && typeof value === "string" && value !== "0") {
                    const idAsNumber = parseInt(value, 10);
                    // Usa la función de normalización para obtener el puntaje
                    const scoreValue = getNormalizedScore(idAsNumber);
                    currentScore += scoreValue;
                }
            }
        }

        // 3. Determinar la Clasificación (TEXTO y ID)
        let vehicleClassification = "N/A"
        let vehicleClassificationId = 0
        if (vehicleRejected) {
            vehicleClassification = "RECHAZADO"
        } else {
            const allScoredFieldsSelected = scoringSchema.scored.every(
                (field) => inspectionData[field.key as keyof typeof initialInspectionData] !== "0",
            )
            if (!allScoredFieldsSelected) {
                vehicleClassification = "PENDIENTE DE CLASIFICAR"
            } else {
                // Lógica de clasificación usando el puntaje total
                if (currentScore < 9) {
                    vehicleClassification = "ESCENCIAL"
                    vehicleClassificationId = 1
                } else if (currentScore > 9 && currentScore < 18) {
                    vehicleClassification = "SELECTO"
                    vehicleClassificationId = 2
                } else if (currentScore >= 18) { // Regla ajustada para PRIME
                    vehicleClassification = "PRIME"
                    vehicleClassificationId = 3
                } else {
                    vehicleClassification = "NO CLASIFICADO"
                    vehicleClassificationId = 0
                }
            }
        }
        return {
            isRejected: vehicleRejected,
            totalScore: currentScore,
            classification: vehicleClassification,
            classificationId: vehicleClassificationId,
            score: currentScore,
            totalPossibleScore: maxPossibleScore,
        }
    }, [inspectionData, scoringSchema])

    // --- Efectos de Carga de Datos ---
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
                    console.error("Error: La respuesta de trámites no es un array válido.", response.data)
                    setTramiteOptions([{ value: "invalid-selection", label: "Seleccione aquí" }])
                }
            }
            catch (error: any) {
                console.error("Error al cargar trámites:", error)
                setTramiteOptions([{ value: "invalid-selection", label: "Seleccione aquí" }])
                toast({
                    title: "Error al cargar trámites",
                    description: `Ocurrió un error al cargar los trámites: ${error.response?.data?.error || error.message}`,
                    variant: "destructive",
                })
            } finally {
                setIsLoadingTramites(false)
            }
        }
        fetchTramites()
    }, [toast])


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

    // CORRECCIÓN: Este es el useEffect que carga las opciones. Se ajustó para coincidir con la API.
    useEffect(() => {
        const fetchCamposSeleccionPuntuacion = async () => {
            setIsLoadingDynamicOptions(true);
            try {
                const { data } = await apiClient(`/vehiculo/datos/puntuacion`, {
                    method: "GET",
                    withCredentials: true,
                });
                console.log("Respuesta de la API de puntuación:", data);

                if (data) {
                    const mappedOptions: SelectOptions = {
                        capacidadPasajerosOptions: data.CapacidadPasajeros.map((item: any) => ({
                            value: String(item.CapacidadId),
                            label: item.Capacidad,
                        })),
                        cinturonesSeguridadTipoOptions: data.CinturonesSeguridad.map((item: any) => ({
                            value: String(item.CinturonId),
                            label: item.Cantidad,
                        })),
                        modeloVehiculoOptions: data.ModeloVehiculo.map((item: any) => ({
                            value: String(item.ModeloId),
                            label: item.RangoAnio,
                        })),
                        tapiceriaAsientosOptions: data.TapiceriaAsientos.map((item: any) => ({
                            value: String(item.TapiceriaId),
                            label: item.Material,
                        })),
                        tiposFrenoOptions: data.TiposFreno.map((item: any) => ({
                            value: String(item.FrenoId),
                            label: item.TipoFreno,
                        })),
                        tipoVehiculoOptions: data.TipoVehiculo.map((item: any) => ({
                            value: String(item.TipoId),
                            label: item.Tipo,
                        })),
                        clasificacionOptions: data.Clasificacion.map((item: any) => ({
                            value: String(item.ClasificacionId),
                            label: item.Clasificacion,
                        })),
                    };
                    setDynamicSelectOptions(mappedOptions);

                    toast({
                        title: "Campos de puntuación cargados",
                        description: "Los campos de puntuación se han cargado correctamente.",
                    });
                } else {
                    setDynamicSelectOptions(defaultSelects);
                    toast({
                        title: "Error al cargar campos de puntuación",
                        description: "No se pudieron cargar los campos de puntuación. Se usarán las opciones por defecto.",
                        variant: "destructive",
                    });
                }
            } catch (err: any) {
                console.error("Error al cargar campos de puntuación:", err);
                setDynamicSelectOptions(defaultSelects);
                toast({
                    title: "Error al cargar campos de puntuación",
                    description: "Ocurrió un error al cargar los campos de puntuación. Se usarán las opciones por defecto.",
                    variant: "destructive",
                });
            } finally {
                setIsLoadingDynamicOptions(false);
            }
        };
        fetchCamposSeleccionPuntuacion();
    }, [toast]);

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


    // Limpieza de URLs de objetos
    useEffect(() => {
        return () => {
            selectedImages.forEach((img) => {
                if (img.file && img.previewUrl) {
                    URL.revokeObjectURL(img.previewUrl)
                }
            })
        }
    }, [selectedImages])

    // --- Handlers de Eventos ---
    const handleFieldChange = (field: keyof typeof initialInspectionData, value: boolean | string) => {
        setInspectionData((prev) => ({ ...prev, [field]: value }))
        if (typeof value === "boolean" && field !== "aprobarRevistaVehicular" && value === false) {
            setCheckAllEssential(false)
        }
    }

    const handleCheckAllEssential = (checked: boolean) => {
        setCheckAllEssential(checked)
        const newInspectionData = { ...inspectionData }
        scoringSchema.essential.forEach((field) => {
            if (field.type === "checkbox") {
                (newInspectionData as any)[field.key] = checked
            } else if (field.type === "select-essential") {
                (newInspectionData as any)[field.key] = checked ? "1" : "0"
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

    const handleDeleteImage = (id: string, idImagenRevistaVehicular?: number) => {
        setImageToDelete({ id, idImagenRevistaVehicular })
        setIsDeleteModalOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!imageToDelete) return

        setIsDeleting(true)
        try {
            if (imageToDelete.idImagenRevistaVehicular) {
                // Lógica para eliminar de la API
                await apiClient(`/revista/imagen/${imageToDelete.idImagenRevistaVehicular}`, {
                    method: "DELETE",
                    withCredentials: true,
                })
                toast({ title: "Imagen eliminada", description: "La imagen se ha eliminado correctamente del servidor." })
            } else {
                toast({ title: "Imagen eliminada", description: "La imagen local se ha eliminado correctamente." })
            }
            setSelectedImages((prev) => prev.filter((img) => img.id !== imageToDelete.id))
            setIsDeleteModalOpen(false)
        } catch (error) {
            console.error("Error al eliminar la imagen:", error)
            toast({ title: "Error al eliminar la imagen", description: "No se pudo eliminar la imagen. Inténtalo de nuevo.", variant: "destructive" })
        } finally {
            setIsDeleting(false)
        }
    }

    const handleSaveInspection = async () => {
        // Validación de campos
        if (!idConcesionParam || !concesionarioData) {
            toast({ title: "Error de validación", description: "No se encontraron datos de la concesión.", variant: "destructive" })
            return
        }
        if (selectedTramite === "invalid-selection") {
            toast({ title: "Error de validación", description: "Por favor, seleccione un tipo de trámite.", variant: "destructive" })
            return
        }

        // Determinar si hay imágenes sin tipo asignado
        const imagesWithoutType = selectedImages.some(img => img.type === "" || img.type === "0");
        if (imagesWithoutType) {
            toast({
                title: "Error de validación",
                description: "Por favor, asigna un tipo a todas las imágenes seleccionadas.",
                variant: "destructive"
            });
            return;
        }

        // Mostrar el modal de confirmación
        setConfirmSave(true)
    }

    // const handleFinalSave = async () => {
    //     setIsSubmitting(true)
    //     setConfirmSave(false)
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

    const isAllEssentialChecked = useMemo(() => {
        return scoringSchema.essential.every((field) => {
            const value = inspectionData[field.key as keyof typeof initialInspectionData]
            if (field.type === "checkbox") {
                return value === true
            } else if (field.type === "select-essential") {
                return value === "1"
            }
            return false
        })
    }, [inspectionData, scoringSchema.essential])

    // Actualiza el estado del checkbox "Seleccionar Todo"
    useEffect(() => {
        setCheckAllEssential(isAllEssentialChecked)
    }, [isAllEssentialChecked])

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="container mx-auto">
                <Button variant="outline" className="mb-6" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Regresar
                </Button>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Inspección de Revista Vehicular</h1>
                    <div className="flex items-center space-x-2">
                        {isSubmitting && <Loader2 className="animate-spin" />}
                        <Button
                            onClick={handleSaveInspection}
                            disabled={isSubmitting || isLoadingConcesion || isLoadingTramites || isLoadingDynamicOptions}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Inspección
                        </Button>
                    </div>
                </div>
                {isLoadingConcesion ? (
                    <Card className="flex justify-center items-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-2 text-lg">Cargando datos del concesionario...</span>
                    </Card>
                ) : (
                    concesionarioData && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Car className="mr-2 text-blue-600" />
                                    Datos del Vehículo y Concesionario
                                </CardTitle>
                                <CardDescription>
                                    Información de la concesión y del vehículo para la inspección.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <p>
                                        <strong>ID Concesión:</strong> {concesionarioData.IdConcesion}
                                    </p>
                                    <p>
                                        <strong>Placa:</strong> {concesionarioData.Placa}
                                    </p>
                                    <p>
                                        <strong>Folio:</strong> {concesionarioData.Folio}
                                    </p>
                                    <p>
                                        <strong>Tipo de Servicio:</strong> {concesionarioData.TipoServicio}
                                    </p>
                                    <p>
                                        <strong>Modalidad:</strong> {concesionarioData.Modalidad}
                                    </p>
                                    <p>
                                        <strong>Propietario:</strong> {concesionarioData.Propietario}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                )}

                {/* Sección de Selección de Trámite y Observaciones */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <ClipboardList className="mr-2 text-blue-600" />
                            Detalles del Trámite
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="tramite">Tipo de Trámite</Label>
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
                            <div className="col-span-1 md:col-span-2">
                                <Label htmlFor="observaciones">Observaciones Adicionales</Label>
                                <Textarea
                                    id="observaciones"
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                    placeholder="Ingrese cualquier observación relevante..."
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sección de Inspección de Componentes Esenciales */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <ShieldCheck className="mr-2 text-green-600" />
                            Inspección de Componentes Esenciales
                        </CardTitle>
                        <CardDescription>
                            Estos puntos son obligatorios para la aprobación de la revista vehicular.
                        </CardDescription>
                        <div className="flex items-center space-x-2 mt-2">
                            <Checkbox
                                id="checkAllEssential"
                                checked={checkAllEssential}
                                onCheckedChange={(checked: boolean) => handleCheckAllEssential(checked)}
                                disabled={isSubmitting}
                            />
                            <Label htmlFor="checkAllEssential" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Seleccionar Todo (Marcar como SI:BIEN / Válido)
                            </Label>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {scoringSchema.essential.map((field) => (
                                <div key={field.key} className="flex items-center space-x-2">
                                    {field.type === "checkbox" ? (
                                        <>
                                            <Checkbox
                                                id={field.key}
                                                checked={inspectionData[field.key as keyof typeof initialInspectionData] as boolean}
                                                onCheckedChange={(checked: boolean) => handleFieldChange(field.key as keyof typeof initialInspectionData, checked)}
                                                disabled={isSubmitting}
                                            />
                                            <Label htmlFor={field.key}>{field.label}</Label>
                                        </>
                                    ) : (
                                        <div className="flex flex-col w-full">
                                            <Label htmlFor={field.key}>{field.label}</Label>
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
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Sección de Puntuación (Características del Tipo de Servicio) */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Award className="mr-2 text-yellow-600" />
                            Puntuación y Clasificación del Vehículo
                        </CardTitle>
                        <CardDescription className="flex justify-between items-center">
                            <span>
                                Estos campos determinan la puntuación y clasificación final del vehículo.
                            </span>
                            <Button variant="link" onClick={() => setIsScoringLogicModalOpen(true)} className="text-blue-600">
                                Ver lógica de puntuación
                                <Lightbulb className="ml-2 h-4 w-4" />
                            </Button>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingDynamicOptions ? (
                            <div className="flex justify-center items-center h-24">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                <span className="ml-2">Cargando opciones de puntuación...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {scoringSchema.scored.map((field) => (
                                    <div key={field.key} className="flex flex-col w-full">
                                        <Label htmlFor={field.key}>{field.label}</Label>
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
                        )}
                        <div className="mt-8 p-4 bg-gray-50 border rounded-lg flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {isRejected ? (
                                    <TriangleAlert className="h-6 w-6 text-red-500" />
                                ) : (
                                    <Award className="h-6 w-6 text-yellow-600" />
                                )}
                                <div>
                                    <h3 className="text-lg font-semibold">Resultado de la Inspección</h3>
                                    <p className="text-sm text-gray-600">
                                        Puntuación: <span className="font-bold">{score}</span> de {totalPossibleScore}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold">Clasificación:</p>
                                <p className="text-xl font-extrabold" style={{ color: isRejected ? '#dc2626' : '#22c55e' }}>
                                    {classification}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sección de Carga y Gestión de Imágenes */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <FileImage className="mr-2 text-purple-600" />
                            Imágenes de Evidencia
                        </CardTitle>
                        <CardDescription>
                            Adjunte y clasifique las imágenes necesarias para el trámite.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2 mb-4">
                            <Input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                className="hidden"
                                id="file-upload"
                                disabled={isUploading || isSubmitting}
                            />
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading || isSubmitting}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Subir Imágenes
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {selectedImages.map((image) => (
                                <div key={image.id} className="relative group">
                                    <Image
                                        src={image.previewUrl}
                                        alt={`Preview de la imagen ${image.id}`}
                                        width={150}
                                        height={150}
                                        className="object-cover w-full h-32 rounded-lg border"
                                    />
                                    <div className="absolute top-1 right-1">
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="w-6 h-6 rounded-full"
                                            onClick={() => handleDeleteImage(image.id, image.idImagenRevistaVehicular)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-1 bg-black bg-opacity-50 text-white text-xs rounded-b-lg">
                                        <Select value={image.type} onValueChange={(value) => handleTypeChange(image.id, value)}>
                                            <SelectTrigger className="w-full text-xs">
                                                <SelectValue placeholder="Tipo..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fetchedImageTypes.map((type: any) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Diálogo de Confirmación de Guardado */}
                <AlertDialog open={confirmSave} onOpenChange={setConfirmSave}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Guardado de Inspección</AlertDialogTitle>
                            <AlertDialogDescription>
                                ¿Estás seguro de que deseas guardar esta inspección?
                                <br />
                                <br />
                                <strong>Resultado:</strong> <span className="font-bold">{classification}</span>
                                <br />
                                <strong>Puntuación:</strong> <span className="font-bold">{score}</span> de {totalPossibleScore}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmSave} disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Guardar Inspección
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Diálogo para la Lógica de Puntuación */}
                <AlertDialog open={isScoringLogicModalOpen} onOpenChange={setIsScoringLogicModalOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center">
                                <Lightbulb className="mr-2 text-blue-600" />
                                Lógica de Puntuación
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                <p>La puntuación se calcula sumando los puntos de cada uno de los 6 campos del vehículo.</p>
                                <ul className="list-disc list-inside mt-4 space-y-1">
                                    <li>Las opciones `1, 2, 3` suman 1, 2, y 3 puntos respectivamente.</li>
                                </ul>
                                <h4 className="font-semibold mt-4">Clasificación por Puntaje Total:</h4>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Puntaje &lt; 9: **ESCENCIAL**</li>
                                    <li>Puntaje entre 9 y 17: **SELECTO**</li>
                                    <li>Puntaje &gt;= 18: **PRIME**</li>
                                </ul>
                                <h4 className="font-semibold mt-4">Rechazo:</h4>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Si algún campo de la sección "Componentes Esenciales" no es "SI:BIEN" o "Válido".</li>
                                </ul>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogAction onClick={() => setIsScoringLogicModalOpen(false)}>Cerrar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </main>
    )
}