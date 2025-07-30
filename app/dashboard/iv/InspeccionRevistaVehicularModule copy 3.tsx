// This must be at the very top of the file
"use client"

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
    Wrench,
    ShieldCheck,
    CheckSquare,
    ArrowLeft,
    Upload,
    Save,
    Loader,
    BadgeCheck,
    TriangleAlert,
    Award,
    CircleHelp,
    ClipboardList,
    ThumbsUp,
    ThumbsDown
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

// --- Modificación Importante Aquí ---
// Opciones para campos que son select y tienen SI:BIEN, SI:MAL, NO
// Los 'value' ahora son numéricos para mapearse a TINYINT en el backend.
// Asumo: 1 para SI:BIEN, 2 para SI:MAL, 0 para NO. Ojo con el "invalid-selection" si no lo quieres enviar.
const generalSelectOptions = [
    { value: "invalid-selection", label: "Seleccione...", numericValue: -1 }, // Usar -1 o un valor que el backend pueda ignorar si no quieres enviarlo.
    { value: "SI:BIEN", label: "SI:BIEN", numericValue: 1 },
    { value: "SI:MAL", label: "SI:MAL", numericValue: 2 },
    { value: "NO", label: "NO", numericValue: 0 },
];

// Opciones específicas para los nuevos campos de "Características para el Tipo de Servicio" (PONDERACIÓN)
// **NOTA IMPORTANTE:** Los 'value' de estas opciones son los IDs que se enviarán a la API.
// Si tu backend espera enteros, asegúrate de que estos 'value' sean convertibles a enteros.
const modeloVehiculoOptions = [
    { value: "0", label: "Seleccione Modelo", score: 0 },
    { value: "1", label: "2011 - 2018", score: 1 },
    { value: "2", label: "2019 - 2022", score: 2 },
    { value: "3", label: "2022 - 2025", score: 3 }, // Ideal
];

const tipoVehiculoOptions = [
    { value: "0", label: "Seleccione Tipo", score: 0 },
    { value: "1", label: "SEDÁN", score: 1 },
    { value: "2", label: "BERLINA / MINIVAN", score: 2 },
    { value: "3", label: "SUV", score: 3 }, // Ideal
];

const capacidadPasajerosOptions = [
    { value: "0", label: "Seleccione Capacidad", score: 0 },
    { value: "1", label: "5 PASAJEROS", score: 1 },
    { value: "2", label: "DE 5 - 6 PASAJEROS", score: 2 },
    { value: "3", label: "DE 5 A 8 PASAJEROS", score: 3 }, // Ideal
];

const bolsasAireOptions = [
    { value: "0", label: "Seleccione Nivel", score: 0 },
    { value: "1", label: "NINGUNA", score: 1 },
    { value: "2", label: "FRONTALES", score: 2 },
    { value: "3", label: "FRONTALES Y LATERALES", score: 3 }, // Ideal
];

const aireAcondicionadoOptions = [
    { value: "0", label: "Seleccione", score: 0 },
    { value: "1", label: "No cuenta", score: 1 },
    { value: "2", label: "Cuenta con", score: 3 }, // Ideal (cambiado de 2 a 3 por tu puntuacion)
];

const tiposFrenoOptions = [
    { value: "0", label: "Seleccione", score: 0 },
    { value: "1", label: "Tambor", score: 1 },
    { value: "2", label: "Disco", score: 2 },
    { value: "3", label: "ABS", score: 3 }, // Ideal
];

const cinturonesSeguridadTipoOptions = [
    { value: "0", label: "Seleccione", score: 0 },
    { value: "1", label: "De 2 a 5", score: 1 },
    { value: "2", label: "De 2 a 6", score: 2 },
    { value: "3", label: "De 2 a 8", score: 3 }, // Ideal
];

const coberturaAsientosOptions = [
    { value: "0", label: "Seleccione", score: 0 },
    { value: "1", label: "Tela", score: 1 },
    { value: "2", label: "Tela/Piel", score: 2 },
    { value: "3", label: "Vinilo/Cuero", score: 3 }, // Ideal
];

// Mapeo de clasificación de texto a ID numérico
const classificationToIdMap: { [key: string]: number } = {
    "RECHAZADO": 1,
    "NO CLASIFICADO": 2, // Nuevo ID
    "PENDIENTE DE CLASIFICAR": 3, // Nuevo ID
    "ESENCIAL": 4,
    "SELECTO": 5,
    "PRIME": 6,
};

// Mapeo inverso de ID numérico a clasificación de texto (para mostrar en el frontend si es necesario)
const idToClassificationMap: { [key: number]: string } = {
    1: "RECHAZADO",
    2: "NO CLASIFICADO",
    3: "PENDIENTE DE CLASIFICAR",
    4: "ESENCIAL",
    5: "SELECTO",
    6: "PRIME",
};


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
    aprobarRevistaVehicular: false, // Este es el campo final de aprobación


    // Select (Listas Desplegables) - Ahora guardan el string del label, pero se mapearán a numérico para el API
    // Establecemos un valor inicial que exista en `generalSelectOptions` para evitar `undefined`.
    defensas: "invalid-selection",
    vidrios: "invalid-selection",
    limpiadores: "invalid-selection",
    espejos: "invalid-selection",
    llantaRefaccion: "invalid-selection",
    parabrisasMedallon: "invalid-selection",

    // Características para el tipo de servicio (mantengo las que ya estaban con puntuación)
    modeloVehiculo: "0", // Default a "0" para el ID
    tipoVehiculo: "0",
    capacidadPasajeros: "0",
    bolsasAire: "0",
    aireAcondicionado: "0",
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
        { key: "llantaRefaccion", label: "Llanta de Refacción", type: "select-essential" as const, options: generalSelectOptions },
        { key: "parabrisasMedallon", label: "Parabrisas y Medallón", type: "select-essential" as const, options: generalSelectOptions },
    ],
    // Campos Puntuables (Características para el tipo de servicio)
    scored: [
        { key: "modeloVehiculo", label: "Modelo del Vehículo", type: "select" as const, options: modeloVehiculoOptions },
        { key: "tipoVehiculo", label: "Tipo de Vehículo", type: "select" as const, options: tipoVehiculoOptions },
        { key: "capacidadPasajeros", label: "Capacidad de Pasajeros", type: "select" as const, options: capacidadPasajerosOptions },
        { key: "bolsasAire", label: "Bolsas de Aire (Nivel)", type: "select" as const, options: bolsasAireOptions },
        { key: "aireAcondicionado", label: "Aire Acondicionado", type: "select" as const, options: aireAcondicionadoOptions },
        { key: "tiposFreno", label: "Tipos de Freno", type: "select" as const, options: tiposFrenoOptions },
        { key: "cinturonesSeguridadTipo", label: "Tipo de Cinturones de Seguridad", type: "select" as const, options: cinturonesSeguridadTipoOptions },
        { key: "coberturaAsientos", label: "Cobertura de Asientos(tapiceria)", type: "select" as const, options: coberturaAsientosOptions },
    ],
};

// Campos para la sección "CARACTERISTICAS PARA EL TIPO DE SERVICIO" (Separada VISUALMENTE)
const serviceCharacteristicFields = scoringSchema.scored;

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
        isOpen: boolean;
        isRejected: boolean;
        classification: string; // Keep string for display
        classificationId: number; // New: for sending to API
        score: number;
        totalPossibleScore: number;
    } | null>(null);
    const [isScoringLogicModalOpen, setIsScoringLogicModalOpen] = useState(false); // Estado para el modal de lógica de puntuación
    const [checkAllEssential, setCheckAllEssential] = useState(false); // New state for "Marcar Todas" checkbox


    // Calcula el estado de la inspección y la puntuación utilizando useMemo para eficiencia
    const { isRejected, totalScore, classification, classificationId, totalPossibleScore } = useMemo(() => {
        let currentScore = 0;
        let vehicleRejected = false;
        let maxPossibleScore = 0; // Se calcula la puntuación máxima solo para los campos puntuables

        // 1. Verificar Campos Esenciales para el rechazo
        for (const field of scoringSchema.essential) {
            const value = inspectionData[field.key as keyof typeof initialInspectionData];

            if (field.type === "checkbox") {
                // Para checkboxes esenciales: si es 'false' (desmarcado), el vehículo es rechazado.
                if (value === false) {
                    vehicleRejected = true;
                    break;
                }
            } else if (field.type === "select-essential") {
                // Para selects esenciales: si es "invalid-selection", "SI:MAL", o "NO", el vehículo es rechazado.
                if (value === "invalid-selection" || value === "SI:MAL" || value === "NO") {
                    vehicleRejected = true;
                    break;
                }
            }
        }

        // 2. Calcular la Puntuación para los campos de "Tipo de Servicio" si no ha sido ya rechazado
        if (!vehicleRejected) {
            for (const field of scoringSchema.scored) {
                const selectedValue = inspectionData[field.key as keyof typeof initialInspectionData];
                // Encuentra la opción máxima posible para este campo y súmala al total posible
                const maxOptionScore = Math.max(...field.options.map(o => o.score || 0));
                maxPossibleScore += maxOptionScore;

                // **IMPORTANTE: Usa el valor actual de inspectionData (que ya es el ID) para buscar en las opciones**
                // y así obtener el score.
                const selectedOption = field.options.find(option => option.value === selectedValue);
                if (selectedOption) {
                    currentScore += selectedOption.score;
                }
            }
        }

        // 3. Determinar la Clasificación (TEXTO)
        let vehicleClassification = "N/A";
        if (vehicleRejected) {
            vehicleClassification = "RECHAZADO"; // Este estado es primario y excluye los demás
        } else if (currentScore === 0) { // Si no hay rechazo pero la puntuación es 0
            // Esta condición solo se aplica si se han llenado todos los campos y no hay rechazo directo
            // Si el totalScore es 0 pero no hay rechazo explícito y se espera una puntuación, podría ser "NO CLASIFICADO"
            const allScoredFieldsSelected = scoringSchema.scored.every(field =>
                inspectionData[field.key as keyof typeof initialInspectionData] !== "0"
            );
            if (allScoredFieldsSelected) {
                vehicleClassification = "NO CLASIFICADO";
            } else {
                vehicleClassification = "PENDIENTE DE CLASIFICAR"; // Si no se han llenado todos los puntuables
            }

        } else if (currentScore > 0 && currentScore < 12) { // 1 a 11 points
            vehicleClassification = "ESENCIAL";
        } else if (currentScore >= 12 && currentScore <= 18) { // 12 a 18 points
            vehicleClassification = "SELECTO";
        } else if (currentScore > 18) { // Más de 18 puntos (hasta 24 si todos son 3 puntos)
            vehicleClassification = "PRIME";
        }

        // 4. Obtener el ID de la Clasificación
        const classificationId = classificationToIdMap[vehicleClassification] || 0; // Default to 0 or an error ID if not found

        return {
            isRejected: vehicleRejected,
            totalScore: currentScore,
            classification: vehicleClassification,
            classificationId: classificationId, // Return the ID as well
            totalPossibleScore: maxPossibleScore
        };
    }, [inspectionData]);


    // Helper para obtener estilos de clasificación
    const getClassificationStyles = (classification: string) => {
        switch (classification) {
            case "RECHAZADO":
                return " text-red-800 border-red-300";
            case "NO CLASIFICADO":
            case "PENDIENTE DE CLASIFICAR":
                return " text-gray-800 border-gray-300";
            case "ESENCIAL":
                return " text-yellow-800 border-yellow-300";
            case "SELECTO":
            case "PRIME":
                return " text-green-800 border-green-300";
            default:
                return " text-gray-800 border-gray-300";
        }
    };


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
                        .filter((tramite: any) => tramite.IdTramite !== null && tramite.IdTramite !== undefined && String(tramite.IdTramite) !== '')
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
                    .filter((type: any) => type.IdTipoImagen !== null && type.IdTipoImagen !== undefined && String(type.IdTipoImagen) !== '')
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

    // --- Modificación Importante Aquí ---
    // Modificado para manejar booleanos (checkbox) y strings (select)
    const handleFieldChange = (field: keyof typeof initialInspectionData, value: boolean | string) => {
        setInspectionData((prev) => ({ ...prev, [field]: value }))
        // If an individual checkbox is unchecked, uncheck the "Marcar Todas" checkbox
        if (typeof value === 'boolean' && field !== 'aprobarRevistaVehicular' && value === false) {
            setCheckAllEssential(false);
        }
    }

    // Handler for "Marcar Todas" checkbox
    const handleCheckAllEssential = (checked: boolean) => {
        setCheckAllEssential(checked);
        const newInspectionData = { ...inspectionData };
        scoringSchema.essential.forEach(field => {
            if (field.type === "checkbox") {
                (newInspectionData as any)[field.key] = checked;
            } else if (field.type === "select-essential") {
                // For select-essential fields, set to "SI:BIEN" when "Marcar Todas" is checked
                // Y ahora el valor se guarda como "SI:BIEN" pero se mapea a numericValue para el API
                (newInspectionData as any)[field.key] = checked ? "SI:BIEN" : "invalid-selection";
            }
        });
        setInspectionData(newInspectionData);
    };

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
                // Si la imagen no tiene idImagenRevistaVehicular, solo se elimina localmente.
                setSelectedImages((prev) => prev.filter((img) => img.id !== imageToDelete.id));
                toast({
                    title: "Imagen eliminada localmente",
                    description: "La imagen se ha eliminado solo de esta sesión, no estaba guardada en el servidor.",
                });
            }
        } catch (error) {
            console.error("Error al eliminar imagen:", error);
            toast({
                title: "Error al eliminar imagen",
                description: `No se pudo eliminar la imagen: ${error instanceof Error ? error.message : String(error)}`,
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setImageToDelete(null); // Limpiar el estado de la imagen a eliminar
        }
    };

    // --- Modificación Importante Aquí ---
    // Función para manejar el envío de datos al backend
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!concesionarioData) {
            toast({
                title: "Error: Datos de concesión faltantes",
                description: "Por favor, carga los datos del concesionario primero.",
                variant: "destructive",
            });
            return;
        }
        if (selectedTramite === "invalid-selection") {
            toast({
                title: "Error: Trámite no seleccionado",
                description: "Por favor, selecciona un tipo de trámite.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // **Preparar los datos para enviar a la API**
            // Aquí es donde convertimos los valores de checkbox (true/false) a 1/0
            // y los valores de select ("SI:BIEN"/"SI:MAL"/"NO") a sus equivalentes numéricos (1/2/0).
            const dataToSend: any = {
                idConcesion: concesionarioData.IdConcesion,
                idPropietario: parseInt(concesionarioData.Propietario), // Asegúrate que el propietario sea int si lo requiere el backend
                idTramite: parseInt(selectedTramite),
                idVehiculo: parseInt(concesionarioData.IdVehiculoActual),
                idEstatus: 1, // Asumiendo que 1 es 'registrado' o 'activo'
                placa: concesionarioData.Placa,
                propietario: concesionarioData.Propietario, // Esto es string, si el SP espera nvarchar(150)
                observaciones: observaciones,
                aprobado: inspectionData.aprobarRevistaVehicular, // Este es el checkbox final de aprobación
                folio: concesionarioData.Folio,
                IdUser: 1265, // <-- Hardcodeado, idealmente vendría de un contexto de usuario
                Inspector: "Luis Andrés Yañez Pérez", // <-- Hardcodeado, idealmente vendría de un contexto de usuario

                // Campos Checkbox: Convertir booleanos a 1 (true) o 0 (false)
                placaDelanteraVer: inspectionData.placaDelantera ? 1 : 0,
                placaTraseraVer: inspectionData.placaTrasera ? 1 : 0,
                calcaVerificacionVer: inspectionData.calcaVerificacion ? 1 : 0,
                calcaTenenciaVer: inspectionData.calcaTenencia ? 1 : 0,
                pinturaCarroceriaVer: inspectionData.pinturaCarroceria ? 1 : 0,
                estadoLlantasVer: inspectionData.estadoLlantas ? 1 : 0,
                claxonVer: inspectionData.claxon ? 1 : 0,
                luzBajaVer: inspectionData.luzBaja ? 1 : 0,
                luzAltaVer: inspectionData.luzAlta ? 1 : 0,
                cuartosVer: inspectionData.cuartos ? 1 : 0,
                direccionalesVer: inspectionData.direccionales ? 1 : 0,
                intermitentesVer: inspectionData.intermitentes ? 1 : 0,
                stopVer: inspectionData.stop ? 1 : 0,
                timbreVer: inspectionData.timbre ? 1 : 0,
                estinguidorVer: inspectionData.estinguidor ? 1 : 0,
                herramientasVer: inspectionData.herramientas ? 1 : 0,
                sistemaFrenadoVer: inspectionData.sistemaFrenado ? 1 : 0,
                sistemaDireccionVer: inspectionData.sistemaDireccion ? 1 : 0,
                sistemaSuspensionVer: inspectionData.sistemaSuspension ? 1 : 0,
                interioresVer: inspectionData.interiores ? 1 : 0,
                botiquinVer: inspectionData.botiquin ? 1 : 0,
                cinturonSeguridadVer: inspectionData.cinturonSeguridad ? 1 : 0,
                imagenCromaticaVer: inspectionData.imagenCromatica ? 1 : 0,

                // Campos Select "SI:BIEN"/"SI:MAL"/"NO": Convertir a su valor numérico (1, 2, 0)
                defensasVer: generalSelectOptions.find(opt => opt.value === inspectionData.defensas)?.numericValue || 0,
                vidriosVer: generalSelectOptions.find(opt => opt.value === inspectionData.vidrios)?.numericValue || 0,
                limpiadoresVer: generalSelectOptions.find(opt => opt.value === inspectionData.limpiadores)?.numericValue || 0,
                espejosVer: generalSelectOptions.find(opt => opt.value === inspectionData.espejos)?.numericValue || 0,
                llantaRefaccionVer: generalSelectOptions.find(opt => opt.value === inspectionData.llantaRefaccion)?.numericValue || 0,
                parabrisasMedallonVer: generalSelectOptions.find(opt => opt.value === inspectionData.parabrisasMedallon)?.numericValue || 0,

                // Campos de Puntuación (ya deberían ser números/IDs si se usa parseInt en el backend)
                ModeloId: parseInt(inspectionData.modeloVehiculo),
                TipoId: parseInt(inspectionData.tipoVehiculo),
                CapacidadId: parseInt(inspectionData.capacidadPasajeros),
                TipoBolsa: parseInt(inspectionData.bolsasAire),
                TieneAire: parseInt(inspectionData.aireAcondicionado), // Asegúrate de que este también se mapee correctamente
                FrenoId: parseInt(inspectionData.tiposFreno),
                CinturonId: parseInt(inspectionData.cinturonesSeguridadTipo),
                TapiceriaId: parseInt(inspectionData.coberturaAsientos),
                Puntuacion: totalScore,
                ClasificacionId: classificationId,
            };

            console.log("Datos a enviar al backend:", dataToSend);

            const response = await apiClient("/revista/insertar-revista-puntuacion", {
                method: "POST",
                data: dataToSend,
                withCredentials: true,
            });

            console.log("Respuesta de la API de insertar revista:", response.data);

            if (response.data && response.data.IdRevistaVehicular) {
                toast({
                    title: "Inspección guardada exitosamente",
                    description: `ID de Revista: ${response.data.IdRevistaVehicular}. Clasificación: ${classification}.`,
                });

                // Mostrar el resultado de la inspección en un alert
                setInspectionResultAlert({
                    isOpen: true,
                    isRejected: isRejected,
                    classification: classification,
                    classificationId: classificationId,
                    score: totalScore,
                    totalPossibleScore: totalPossibleScore,
                });

                // --- Subir imágenes si la revista fue guardada ---
                if (selectedImages.length > 0) {
                    setIsUploading(true);
                    const formData = new FormData();
                    formData.append("IdRevistaVehicular", response.data.IdRevistaVehicular.toString());

                    selectedImages.forEach((img) => {
                        if (img.file) {
                            formData.append("files", img.file, img.customName || img.file.name);
                            formData.append("tipos", img.type); // Enviar el ID del tipo de imagen
                            formData.append("nombres", img.customName || img.file.name); // Enviar el nombre personalizado
                        }
                    });

                    try {
                        const uploadResponse = await apiClient("/revista/subir-imagenes", {
                            method: "POST",
                            data: formData,
                            headers: {
                                "Content-Type": "multipart/form-data",
                            },
                            withCredentials: true,
                        });
                        console.log("Respuesta de subida de imágenes:", uploadResponse.data);
                        toast({
                            title: "Imágenes subidas",
                            description: "Las imágenes se subieron exitosamente.",
                        });
                        // Opcional: limpiar las imágenes seleccionadas después de la subida
                        setSelectedImages([]);
                    } catch (uploadError) {
                        console.error("Error al subir imágenes:", uploadError);
                        toast({
                            title: "Error al subir imágenes",
                            description: `Algunas imágenes no se pudieron subir: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`,
                            variant: "destructive",
                        });
                    } finally {
                        setIsUploading(false);
                    }
                }
            } else {
                // Si la API responde OK pero sin el ID esperado (lo cual es un problema)
                toast({
                    title: "Error al guardar inspección",
                    description: "La API no devolvió el ID de la revista. Revisa la respuesta del servidor.",
                    variant: "destructive",
                });
            }

        } catch (error: any) {
            console.error("Error al insertar la inspección:", error);
            const errorMessage = error.response?.data?.error || error.message || "Error desconocido";
            toast({
                title: "Error al insertar la inspección",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="mb-6 text-3xl font-bold text-gray-800">
                <ClipboardList className="inline-block mr-3 h-8 w-8 text-blue-600" />
                Formulario de Inspección de Revista Vehicular
            </h1>

            {/* Breadcrumbs / Regresar */}
            <div className="mb-6">
                <Button variant="outline" onClick={() => router.back()} className="flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Regresar
                </Button>
            </div>

            {isLoadingConcesion ? (
                <div className="text-center py-10 flex flex-col items-center justify-center">
                    <Loader className="h-12 w-12 animate-spin text-blue-500" />
                    <p className="mt-4 text-lg text-gray-600">Cargando datos del concesionario...</p>
                </div>
            ) : concesionarioData ? (
                <Card className="mb-8 border border-blue-200 shadow-md">
                    <CardHeader className="bg-blue-50 p-4 border-b border-blue-200 rounded-t-lg">
                        <CardTitle className="text-xl font-semibold text-blue-700 flex items-center">
                            <Car className="mr-2 h-6 w-6" />
                            Datos del Concesionario y Vehículo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8 text-gray-700">
                        <div>
                            <p className="text-sm font-medium text-gray-500">ID Concesión:</p>
                            <p className="font-semibold text-blue-800">{concesionarioData.IdConcesion}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Folio:</p>
                            <p className="font-semibold">{concesionarioData.Folio}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Placa Actual:</p>
                            <p className="font-semibold text-xl text-green-700">{concesionarioData.Placa}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Propietario:</p>
                            <p className="font-semibold">{concesionarioData.Propietario}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Tipo de Servicio:</p>
                            <p className="font-semibold">{concesionarioData.TipoServicio}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Modalidad:</p>
                            <p className="font-semibold">{concesionarioData.Modalidad}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Municipio Autorizado:</p>
                            <p className="font-semibold">{concesionarioData.MunicipioAutorizado}</p>
                        </div>
                        {concesionarioData.ClaseUnidad && (
                            <div>
                                <p className="text-sm font-medium text-gray-500">Clase de Unidad:</p>
                                <p className="font-semibold">{concesionarioData.ClaseUnidad}</p>
                            </div>
                        )}
                        {concesionarioData.VigenciaAnios && (
                            <div>
                                <p className="text-sm font-medium text-gray-500">Vigencia Años:</p>
                                <p className="font-semibold">{concesionarioData.VigenciaAnios}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium text-gray-500">Fecha de Expedición:</p>
                            <p className="font-semibold">{new Date(concesionarioData.FechaExpedicion).toLocaleDateString()}</p>
                        </div>
                        {concesionarioData.Observaciones && (
                            <div className="col-span-1 md:col-span-2 lg:col-span-3">
                                <p className="text-sm font-medium text-gray-500">Observaciones (Concesión):</p>
                                <p className="font-semibold italic">{concesionarioData.Observaciones}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <p className="text-center text-red-500 text-lg py-10">
                    No se han cargado datos del concesionario. Por favor, asegúrate de que el `idC` esté en la URL.
                </p>
            )}


            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Sección de Tipo de Trámite */}
                <Card className="border border-purple-200 shadow-md">
                    <CardHeader className="bg-purple-50 p-4 border-b border-purple-200 rounded-t-lg">
                        <CardTitle className="text-xl font-semibold text-purple-700 flex items-center">
                            <ClipboardCheck className="mr-2 h-6 w-6" />
                            Tipo de Trámite
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Label htmlFor="tipoTramite" className="text-md font-medium text-gray-700 mb-2 block">
                            Seleccione el tipo de trámite asociado a esta revista:
                        </Label>
                        <Select
                            onValueChange={(value) => setSelectedTramite(value)}
                            value={selectedTramite}
                            disabled={isLoadingTramites || !concesionarioData}
                        >
                            <SelectTrigger className="w-full md:w-1/2 lg:w-1/3">
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
                        {isLoadingTramites && <p className="text-sm text-gray-500 mt-2">Cargando tipos de trámite...</p>}
                    </CardContent>
                </Card>

                {/* Sección de Puntos Esenciales para la Revisión */}
                <Card className="border border-green-200 shadow-md">
                    <CardHeader className="bg-green-50 p-4 border-b border-green-200 rounded-t-lg">
                        <CardTitle className="text-xl font-semibold text-green-700 flex items-center">
                            <CheckSquare className="mr-2 h-6 w-6" />
                            Puntos Esenciales de Revisión
                        </CardTitle>
                        <CardDescription className="text-green-600">
                            Todos los puntos marcados con <span className="font-bold text-red-600">"NO"</span>,{" "}
                            <span className="font-bold text-red-600">"SI:MAL"</span>, o un checkbox desmarcado resultarán
                            en un vehículo <span className="font-bold text-red-600">RECHAZADO</span>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="mb-6 flex items-center space-x-2">
                            <Checkbox
                                id="checkAllEssential"
                                checked={checkAllEssential}
                                onCheckedChange={handleCheckAllEssential}
                            />
                            <label htmlFor="checkAllEssential" className="text-lg font-semibold text-gray-800 cursor-pointer">
                                Marcar/Desmarcar Todos los Esenciales como "SI:BIEN" / Checado
                            </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {scoringSchema.essential.map((field) => (
                                <div key={field.key} className="flex flex-col space-y-2">
                                    <Label htmlFor={field.key} className="text-base font-medium text-gray-700">
                                        {field.label}:
                                    </Label>
                                    {field.type === "checkbox" ? (
                                        <Checkbox
                                            id={field.key}
                                            checked={inspectionData[field.key as keyof typeof initialInspectionData] as boolean}
                                            onCheckedChange={(checked) => handleFieldChange(field.key, checked)}
                                        />
                                    ) : (
                                        <Select
                                            onValueChange={(value) => handleFieldChange(field.key, value)}
                                            value={inspectionData[field.key as keyof typeof initialInspectionData] as string}
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
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Sección de Características para el Tipo de Servicio (Puntuación) */}
                <Card className="border border-orange-200 shadow-md">
                    <CardHeader className="bg-orange-50 p-4 border-b border-orange-200 rounded-t-lg">
                        <CardTitle className="text-xl font-semibold text-orange-700 flex items-center">
                            <Award className="mr-2 h-6 w-6" />
                            Características para el Tipo de Servicio (Puntuación)
                        </CardTitle>
                        <CardDescription className="text-orange-600">
                            Estas características contribuyen a la puntuación total del vehículo y determinan su clasificación.
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsScoringLogicModalOpen(true)}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                                <CircleHelp className="h-4 w-4 mr-1" /> Ver Lógica de Puntuación
                            </Button>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {serviceCharacteristicFields.map((field) => (
                                <div key={field.key} className="flex flex-col space-y-2">
                                    <Label htmlFor={field.key} className="text-base font-medium text-gray-700">
                                        {field.label}:
                                    </Label>
                                    <Select
                                        onValueChange={(value) => handleFieldChange(field.key, value)}
                                        value={inspectionData[field.key as keyof typeof initialInspectionData] as string}
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
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Sección de Observaciones */}
                <Card className="mb-8 border border-gray-200 shadow-md">
                    <CardHeader className="bg-gray-50 p-4 border-b border-gray-200 rounded-t-lg">
                        <CardTitle className="text-xl font-semibold text-gray-700 flex items-center">
                            <Lightbulb className="mr-2 h-6 w-6" />
                            Observaciones
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Textarea
                            placeholder="Añada cualquier observación relevante aquí..."
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            rows={4}
                        />
                    </CardContent>
                </Card>

                {/* Sección de Imágenes */}
                <Card className="mb-8 border border-blue-200 shadow-md">
                    <CardHeader className="bg-blue-50 p-4 border-b border-blue-200 rounded-t-lg">
                        <CardTitle className="text-xl font-semibold text-blue-700 flex items-center">
                            <FileImage className="mr-2 h-6 w-6" />
                            Imágenes de la Revista
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            className="mb-4"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedImages.map((img) => (
                                <div key={img.id} className="relative border rounded-lg overflow-hidden shadow-sm">
                                    <Image
                                        src={img.previewUrl}
                                        alt={`Preview ${img.id}`}
                                        width={300}
                                        height={200}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute top-2 right-2">
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="h-8 w-8 rounded-full"
                                            onClick={() => handleRemoveImage(img.id, img.idImagenRevistaVehicular)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="p-2">
                                        <Select
                                            onValueChange={(value) => handleTypeChange(img.id, value)}
                                            value={img.type}
                                        >
                                            <SelectTrigger className="w-full">
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Sección de Aprobación Final y Botón de Envío */}
                <Card className="border border-indigo-200 shadow-md">
                    <CardHeader className="bg-indigo-50 p-4 border-b border-indigo-200 rounded-t-lg">
                        <CardTitle className="text-xl font-semibold text-indigo-700 flex items-center">
                            <BadgeCheck className="mr-2 h-6 w-6" />
                            Resultado y Finalización
                        </CardTitle>
                        <CardDescription className="text-indigo-600">
                            La aprobación final se basará en los puntos esenciales. La clasificación es un indicador del nivel de servicio.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0 md:space-x-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="aprobarRevistaVehicular"
                                    checked={inspectionData.aprobarRevistaVehicular}
                                    onCheckedChange={(checked) =>
                                        handleFieldChange("aprobarRevistaVehicular", checked)
                                    }
                                    className="h-5 w-5"
                                />
                                <Label htmlFor="aprobarRevistaVehicular" className="text-lg font-semibold text-gray-800">
                                    Aprobar Revista Vehicular
                                </Label>
                            </div>
                            <div className={`p-3 rounded-lg border-2 ${getClassificationStyles(classification)} flex items-center`}>
                                {isRejected ? (
                                    <ThumbsDown className="h-6 w-6 mr-2 text-red-600" />
                                ) : (
                                    <ThumbsUp className="h-6 w-6 mr-2 text-green-600" />
                                )}
                                <span className="font-bold text-lg">
                                    Clasificación: {classification} ({totalScore} / {totalPossibleScore} pts)
                                </span>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-3 text-lg font-semibold flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                            disabled={isSubmitting || isUploading || isLoadingConcesion || isLoadingTramites || !concesionarioData || selectedTramite === "invalid-selection"}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader className="mr-2 h-5 w-5 animate-spin" />
                                    Guardando Inspección...
                                </>
                            ) : isUploading ? (
                                <>
                                    <Upload className="mr-2 h-5 w-5 animate-bounce" />
                                    Subiendo Imágenes...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-5 w-5" />
                                    Guardar Inspección
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </form>

            {/* Modales */}
            {/* Modal de confirmación de eliminación de imagen */}
            <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro de eliminar esta imagen?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. La imagen se eliminará {imageToDelete?.idImagenRevistaVehicular ? "del servidor y" : "solo"} localmente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteImage} disabled={isDeleting}>
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Modal de resultado de la inspección */}
            {inspectionResultAlert && (
                <AlertDialog open={inspectionResultAlert.isOpen} onOpenChange={(open) => setInspectionResultAlert(prev => prev ? { ...prev, isOpen: open } : null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center">
                                {inspectionResultAlert.isRejected ? (
                                    <TriangleAlert className="mr-2 h-6 w-6 text-red-500" />
                                ) : (
                                    <ThumbsUp className="mr-2 h-6 w-6 text-green-500" />
                                )}
                                Inspección Finalizada: {inspectionResultAlert.classification}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                <p className="mb-2">El vehículo ha sido **{inspectionResultAlert.classification}**.</p>
                                {!inspectionResultAlert.isRejected && (
                                    <p>Puntuación obtenida: **{inspectionResultAlert.score}** de **{inspectionResultAlert.totalPossibleScore}** puntos posibles.</p>
                                )}
                                <p className="mt-4">Puedes cerrar esta ventana para continuar.</p>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogAction onClick={() => {
                                setInspectionResultAlert(null); // Clear the alert
                                //router.push('/ruta-donde-listas-revistas'); // Optionally navigate
                            }}>
                                Aceptar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {/* Modal de Lógica de Puntuación */}
            <AlertDialog open={isScoringLogicModalOpen} onOpenChange={setIsScoringLogicModalOpen}>
                <AlertDialogContent className="max-w-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center">
                            <CircleHelp className="mr-2 h-6 w-6" /> Lógica de Puntuación
                        </AlertDialogTitle>
                        <AlertDialogDescription className="max-h-[60vh] overflow-y-auto">
                            <h3 className="font-bold text-gray-800 mt-2 mb-1">Clasificación por Puntuación:</h3>
                            <ul className="list-disc list-inside space-y-1 mb-4 text-gray-700">
                                <li>
                                    <span className="font-semibold text-red-600">RECHAZADO:</span> Si cualquier "Punto Esencial" no cumple la condición (checkbox desmarcado, select en "SI:MAL" o "NO").
                                </li>
                                <li>
                                    <span className="font-semibold text-gray-700">NO CLASIFICADO:</span> Si no es RECHAZADO, pero la puntuación de "Características para el Tipo de Servicio" es 0 y todos los campos puntuables fueron seleccionados con "0".
                                </li>
                                <li>
                                    <span className="font-semibold text-gray-700">PENDIENTE DE CLASIFICAR:</span> Si no es RECHAZADO, pero la puntuación de "Características para el Tipo de Servicio" es 0 y *NO* todos los campos puntuables fueron seleccionados (es decir, aún hay valores "0" por defecto).
                                </li>
                                <li>
                                    <span className="font-semibold text-yellow-700">ESENCIAL:</span> 1 a 11 puntos obtenidos.
                                </li>
                                <li>
                                    <span className="font-semibold text-blue-700">SELECTO:</span> 12 a 18 puntos obtenidos.
                                </li>
                                <li>
                                    <span className="font-semibold text-green-700">PRIME:</span> Más de 18 puntos obtenidos.
                                </li>
                            </ul>

                            <h3 className="font-bold text-gray-800 mt-4 mb-2">Puntuación por Característica:</h3>
                            {scoringSchema.scored.map((field) => (
                                <div key={field.key} className="mb-3 p-2 bg-gray-50 rounded-md border border-gray-200">
                                    <p className="font-semibold text-gray-800 mb-1">{field.label}:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-600">
                                        {field.options.map((option) => (
                                            <li key={option.value}>
                                                {option.label}: <span className="font-medium">{option.score} punto(s)</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setIsScoringLogicModalOpen(false)}>Cerrar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}