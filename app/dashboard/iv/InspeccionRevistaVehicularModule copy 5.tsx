"use client"

import apiClient from "@/lib/apiClient"
import type React from "react"
import { useState, useRef, useEffect, useMemo, useCallback } from "react"
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
    { value: "0", label: "Seleccione...", required: true },
    { value: "1", label: "SI:BIEN" },
    { value: "2", label: "SI:MAL" },
    { value: "3", label: "NO" },
]

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

// Mapeo de keys del estado a IDs de la API para los campos de la inspección
const inspectionFieldMapping: { [key: string]: number } = {
    placaDelantera: 1,
    placaTrasera: 2,
    calcaVerificacion: 3,
    calcaTenencia: 4,
    pinturaCarroceria: 5,
    estadoLlantas: 6,
    claxon: 7,
    luzBaja: 8,
    luzAlta: 9,
    cuartos: 10,
    direccionales: 11,
    intermitentes: 12,
    stop: 13,
    timbre: 14,
    estinguidor: 15,
    herramientas: 16,
    sistemaFrenado: 17,
    sistemaDireccion: 18,
    sistemaSuspension: 19,
    interiores: 20,
    botiquin: 21,
    cinturonSeguridad: 22,
    imagenCromatica: 23,
    defensas: 24,
    vidrios: 25,
    limpiadores: 26,
    espejos: 27,
    llantaRefaccion: 28,
    parabrisasMedallon: 29,
    modeloVehiculo: 30,
    tipoVehiculo: 31,
    capacidadPasajeros: 32,
    tiposFreno: 33,
    cinturonesSeguridadTipo: 34,
    tapiceriaAsientos: 35,
};

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
    // Características para el tipo de servicio (puntuación)
    modeloVehiculo: "0",
    tipoVehiculo: "0",
    capacidadPasajeros: "0",
    tiposFreno: "0",
    cinturonesSeguridadTipo: "0",
    tapiceriaAsientos: "0",
};

interface Option {
    value: string
    label: string
    score?: number
}

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
    const [deleteModalState, setDeleteModalState] = useState<{
        isOpen: boolean;
        isDeleting: boolean;
        imageToDelete: { id: string; idImagenRevistaVehicular?: number } | null;
    }>({
        isOpen: false,
        isDeleting: false,
        imageToDelete: null,
    });
    const [isUploading, setIsUploading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [concesionarioData, setConcesionarioData] = useState<ConcesionarioData | null>(null)
    const [isLoading, setIsLoading] = useState({
        concesion: false,
        tramites: false,
        dynamicOptions: false,
    });
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
            scored: [
                { key: "modeloVehiculo", label: "Modelo del Vehículo", type: "select" as const, options: dynamicSelectOptions.modeloVehiculoOptions },
                { key: "tipoVehiculo", label: "Tipo de Vehículo", type: "select" as const, options: dynamicSelectOptions.tipoVehiculoOptions },
                { key: "capacidadPasajeros", label: "Capacidad de Pasajeros", type: "select" as const, options: dynamicSelectOptions.capacidadPasajerosOptions },
                { key: "tiposFreno", label: "Tipos de Freno", type: "select" as const, options: dynamicSelectOptions.tiposFrenoOptions },
                { key: "cinturonesSeguridadTipo", label: "Cinturones de Seguridad (Tipo)", type: "select" as const, options: dynamicSelectOptions.cinturonesSeguridadTipoOptions },
                { key: "tapiceriaAsientos", label: "Tapicería de Asientos", type: "select" as const, options: dynamicSelectOptions.tapiceriaAsientosOptions },
            ],
        }
    }, [dynamicSelectOptions])

    const getNormalizedScore = useCallback((id: number) => {
        if (id >= 1 && id <= 3) {
            return id;
        }
        return 0;
    }, []);

    const { isRejected, classification, classificationId, score, totalPossibleScore } = useMemo(() => {
        let currentScore = 0
        let vehicleRejected = false
        const maxPossibleScore = 18

        const isEssentialIncomplete = scoringSchema.essential.some(field => {
            const value = inspectionData[field.key as keyof typeof initialInspectionData]
            if (field.type === "checkbox") {
                return value === false
            } else if (field.type === "select-essential") {
                return value === "0" || value === "2" || value === "3"
            }
            return false;
        });

        if (isEssentialIncomplete) {
            vehicleRejected = true;
        }

        if (!vehicleRejected) {
            const allScoredFieldsSelected = scoringSchema.scored.every(
                (field) => inspectionData[field.key as keyof typeof initialInspectionData] !== "0",
            )

            if (allScoredFieldsSelected) {
                for (const field of scoringSchema.scored) {
                    const value = inspectionData[field.key as keyof typeof initialInspectionData]
                    if (typeof value === "string") {
                        const idAsNumber = parseInt(value, 10)
                        const scoreValue = getNormalizedScore(idAsNumber)
                        currentScore += scoreValue
                    }
                }
            }
        }

        let vehicleClassification = "N/A"
        let vehicleClassificationId = 0
        if (vehicleRejected) {
            vehicleClassification = "RECHAZADO"
            vehicleClassificationId = 4
        } else {
            const allScoredFieldsSelected = scoringSchema.scored.every(
                (field) => inspectionData[field.key as keyof typeof initialInspectionData] !== "0",
            )
            if (!allScoredFieldsSelected) {
                vehicleClassification = "PENDIENTE DE CLASIFICAR"
                vehicleClassificationId = 0
            } else {
                if (currentScore >= 18) {
                    vehicleClassification = "PRIME"
                    vehicleClassificationId = 3
                } else if (currentScore >= 9 && currentScore < 18) {
                    vehicleClassification = "SELECTO"
                    vehicleClassificationId = 2
                } else {
                    vehicleClassification = "ESCENCIAL"
                    vehicleClassificationId = 1
                }
            }
        }

        return {
            isRejected: vehicleRejected,
            classification: vehicleClassification,
            classificationId: vehicleClassificationId,
            score: currentScore,
            totalPossibleScore: maxPossibleScore,
        }
    }, [inspectionData, scoringSchema, getNormalizedScore])

    const fetchData = useCallback(async () => {
        if (!idConcesionParam) {
            toast({
                title: "Advertencia",
                description: "No se ha proporcionado un ID de Concesión en la URL. Ejemplo: `/tu-ruta?idC=123`",
                variant: "default",
            });
            return;
        }

        setIsLoading(prev => ({ ...prev, concesion: true, tramites: true, dynamicOptions: true }));

        try {
            const [tramitesResponse, dynamicOptionsResponse, concesionDataResponse] = await Promise.allSettled([
                apiClient("/revista/tipos-tramite", { method: "GET", withCredentials: true }),
                apiClient("/vehiculo/datos/puntuacion", { method: "GET", withCredentials: true }),
                apiClient(`/concesion/autorizacion/${idConcesionParam}`, { method: "GET", withCredentials: true }),
            ]);

            if (tramitesResponse.status === "fulfilled") {
                const tramites = tramitesResponse.value.data?.map((t: any) => ({
                    value: String(t.IdTramite),
                    label: t.Tramite,
                })) || [];
                setTramiteOptions([{ value: "invalid-selection", label: "Seleccione aquí" }, ...tramites]);
            } else {
                throw new Error("Error al cargar los trámites.");
            }


            if (dynamicOptionsResponse.status === "fulfilled") {
                const data = dynamicOptionsResponse.value.data;
                console.log("Datos de opciones dinámicas:", data);
                if (data) {
                    const mappedOptions: SelectOptions = {
                        capacidadPasajerosOptions: data.CapacidadPasajeros.map((item: any) => ({ value: String(item.CapacidadId), label: item.Capacidad })),
                        cinturonesSeguridadTipoOptions: data.CinturonesSeguridad.map((item: any) => ({ value: String(item.CinturonId), label: item.Cantidad })),
                        modeloVehiculoOptions: data.ModeloVehiculo.map((item: any) => ({ value: String(item.ModeloId), label: item.RangoAnio })),
                        tapiceriaAsientosOptions: data.TapiceriaAsientos.map((item: any) => ({ value: String(item.TapiceriaId), label: item.Material })),
                        tiposFrenoOptions: data.TiposFreno.map((item: any) => ({ value: String(item.FrenoId), label: item.TipoFreno })),
                        tipoVehiculoOptions: data.TipoVehiculo.map((item: any) => ({ value: String(item.TipoId), label: item.Tipo })),
                        clasificacionOptions: data.Clasificacion.map((item: any) => ({ value: String(item.ClasificacionId), label: item.Clasificacion })),
                    };
                    setDynamicSelectOptions(mappedOptions);
                } else {
                    throw new Error("Respuesta de opciones dinámicas no válida.");
                }
            } else {
                throw new Error("Error al cargar los campos de puntuación.");
            }

            if (concesionDataResponse.status === "fulfilled" && concesionDataResponse.value.data) {
                const apiData = concesionDataResponse.value.data;
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
                });
                toast({
                    title: "Concesionario y Vehículo encontrados",
                    description: `Datos cargados para el ID de Concesión: ${idConcesionParam}`,
                });
            } else {
                setConcesionarioData(null);
                throw new Error(`No se encontraron datos para el ID de Concesión ${idConcesionParam}.`);
            }
        } catch (error: any) {
            console.error("Error al cargar datos:", error);
            toast({
                title: "Error de carga",
                description: `Ocurrió un error al cargar los datos: ${error.message}`,
                variant: "destructive",
            });
        } finally {
            setIsLoading({ concesion: false, tramites: false, dynamicOptions: false });
        }
    }, [idConcesionParam, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const fetchImageTypes = async () => {
            try {
                const response = await apiClient("/revista/tipos-imagen", { method: "GET", withCredentials: true });
                const typesArray = response.data;
                if (!Array.isArray(typesArray)) {
                    throw new Error("La respuesta de tipos de imagen no es un array válido.");
                }
                const types = typesArray
                    .filter((type: any) => type.IdTipoImagen !== null && type.IdTipoImagen !== undefined && String(type.IdTipoImagen) !== "")
                    .map((type: any) => ({ value: String(type.IdTipoImagen), label: type.TipoImagen }));
                setFetchedImageTypes(types);
            } catch (error: any) {
                console.error("Error al obtener tipos de imagen:", error);
                toast({
                    title: "Error al cargar tipos de imagen",
                    description: `Ocurrió un error al cargar los tipos de imagen: ${error.message}`,
                    variant: "destructive",
                });
                setFetchedImageTypes([]);
            }
        };
        fetchImageTypes();
    }, [toast]);

    useEffect(() => {
        return () => {
            selectedImages.forEach((img) => {
                if (img.file && img.previewUrl) {
                    URL.revokeObjectURL(img.previewUrl)
                }
            })
        }
    }, [selectedImages])

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

    const handleRemoveImage = (image: SelectedImage) => {
        setDeleteModalState({
            isOpen: true,
            isDeleting: false,
            imageToDelete: {
                id: image.id,
                idImagenRevistaVehicular: image.idImagenRevistaVehicular,
            },
        });
    };

    const confirmDeleteImage = async () => {
        if (!deleteModalState.imageToDelete) {
            toast({ title: "Error", description: "No hay imagen para eliminar.", variant: "destructive" });
            return;
        }

        setDeleteModalState(prev => ({ ...prev, isDeleting: true }));

        try {
            const { idImagenRevistaVehicular, id } = deleteModalState.imageToDelete;

            if (idImagenRevistaVehicular) {
                await apiClient(`/revista/imagen/${idImagenRevistaVehicular}`, {
                    withCredentials: true,
                    method: "DELETE",
                });
            }

            setSelectedImages((prev) =>
                prev.filter((img) =>
                    idImagenRevistaVehicular ? img.idImagenRevistaVehicular !== idImagenRevistaVehicular : img.id !== id,
                ),
            );

            toast({
                title: "Imagen eliminada",
                description: idImagenRevistaVehicular ? "Imagen eliminada del servidor y localmente." : "Imagen eliminada localmente.",
            });
        } catch (error: any) {
            console.error("Error al eliminar imagen:", error);
            toast({
                title: "Error al eliminar imagen",
                description: `No se pudo eliminar la imagen: ${error.response?.data?.error || error.message}`,
                variant: "destructive",
            });
        } finally {
            setDeleteModalState({ isOpen: false, isDeleting: false, imageToDelete: null });
        }
    };


    const handleSaveInspection = async () => {
        if (!idConcesionParam || !concesionarioData) {
            toast({ title: "Error de validación", description: "No se encontraron datos de la concesión.", variant: "destructive" })
            return
        }
        if (selectedTramite === "invalid-selection") {
            toast({ title: "Error de validación", description: "Por favor, seleccione un tipo de trámite.", variant: "destructive" })
            return
        }

        const imagesWithoutType = selectedImages.some(img => img.type === "" || img.type === "0");
        if (imagesWithoutType) {
            toast({
                title: "Error de validación",
                description: "Por favor, asigna un tipo a todas las imágenes seleccionadas.",
                variant: "destructive"
            });
            return;
        }

        setConfirmSave(true)
    };


    const uploadImages = async (inspectionId: number) => {
        setIsUploading(true);
        const imagesToUpload = selectedImages.filter((img) => img.file);
        if (imagesToUpload.length === 0) {
            setIsUploading(false);
            return;
        }

        const formData = new FormData();
        imagesToUpload.forEach((img, index) => {
            if (img.file) {
                formData.append(`file[${index}]`, img.file, img.customName || `imagen_${img.type}_${index}`);
                formData.append(`IdTipoImagen[${index}]`, img.type);
            }
        });

        formData.append("IdRevistaVehicular", String(inspectionId));
        formData.append("observaciones", observaciones);

        try {
            await apiClient("/revista/imagen/upload", {
                method: "POST",
                data: formData,
                withCredentials: true,
            });
            toast({ title: "Éxito", description: "Imágenes subidas correctamente." });
        } catch (error: any) {
            console.error("Error al subir imágenes:", error);
            toast({
                title: "Error de subida de imágenes",
                description: `Ocurrió un error al subir las imágenes: ${error.response?.data?.error || error.message}`,
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const confirmSaveAction = async () => {
        setConfirmSave(false)
        setIsSubmitting(true)

        const detalleRevistaVehicular = Object.entries(inspectionData)
            .filter(([key]) => inspectionFieldMapping.hasOwnProperty(key))
            .map(([key, value]) => {
                const idCampoInspeccion = inspectionFieldMapping[key];
                let resultado = value;
                if (typeof value === "boolean") {
                    resultado = value ? "1" : "0";
                }
                return {
                    idCampoInspeccion,
                    resultado: String(resultado),
                };
            });

        const payload = {
            idConcesion: concesionarioData?.IdConcesion,
            idVehiculo: concesionarioData?.IdVehiculoActual,
            idTramite: parseInt(selectedTramite, 10),
            observaciones: observaciones,
            aprobarRevistaVehicular: inspectionData.aprobarRevistaVehicular,
            isRejected: isRejected,
            idClasificacionVehiculo: classificationId,
            puntajeTotal: score,
            detalleRevistaVehicular,
        }

        try {
            const response = await apiClient("/revista/inspeccion", {
                method: "POST",
                data: payload,
                withCredentials: true,
            });
            const inspectionId = response.data.IdRevistaVehicular;

            await uploadImages(inspectionId);

            toast({
                title: "Inspección guardada",
                description: "La inspección se ha registrado con éxito.",
            });
            setInspectionResultAlert({
                isOpen: true,
                isRejected,
                classification,
                classificationId,
                score,
                totalPossibleScore,
            });
            // router.push("/ruta-de-confirmacion"); // Opcional: redireccionar
        } catch (error: any) {
            console.error("Error al guardar la inspección:", error);
            toast({
                title: "Error al guardar",
                description: `Ocurrió un error al guardar la inspección: ${error.response?.data?.error || error.message}`,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false)
        }
    };

    const isFormIncomplete = scoringSchema.scored.some(
        (field) => inspectionData[field.key as keyof typeof initialInspectionData] === "0",
    ) || selectedTramite === "invalid-selection";

    const isEssentialIncomplete = scoringSchema.essential.some(field => {
        const value = inspectionData[field.key as keyof typeof initialInspectionData]
        return (field.type === "checkbox" && !value) || (field.type === "select-essential" && value === "0");
    });

    if (!idConcesionParam) {
        return (
            <div className="bg-white p-8 max-w-4xl mx-auto my-10 border rounded-lg shadow-md">
                <div className="text-center py-10">
                    <TriangleAlert className="w-16 h-16 text-blue-800 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">ID de Concesión no proporcionado</h1>
                    <p className="text-gray-600">Por favor, navegue a esta página con un `idC` en la URL.</p>
                    <Button onClick={() => router.back()} className="mt-6 bg-blue-600 hover:bg-blue-700">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                    </Button>
                </div>
            </div>
        )
    }

    const isDataLoading = Object.values(isLoading).some(Boolean);

    if (isDataLoading) {
        return (
            <div className="bg-white p-8 max-w-4xl mx-auto my-10 border rounded-lg shadow-md">
                <div className="text-center py-10">
                    <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto" />
                    <h1 className="text-2xl font-bold text-gray-800 mt-4">Cargando datos...</h1>
                </div>
            </div>
        )
    }

    if (!concesionarioData) {
        return (
            <div className="bg-white p-8 max-w-4xl mx-auto my-10 border rounded-lg shadow-md">
                <div className="text-center py-10">
                    <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar datos</h1>
                    <p className="text-gray-600">No se pudo encontrar la concesión con el ID proporcionado o no existe.</p>
                    <Button onClick={() => router.back()} className="mt-6 bg-blue-600 hover:bg-blue-700">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <main className="container mx-auto p-4 md:p-8 space-y-8">
            <header className="flex justify-between items-center mb-6">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                </Button>
                <div className="text-center flex-grow">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Inspección de Revista Vehicular
                    </h1>
                    <p className="text-gray-500">
                        Folio de Concesión: {concesionarioData.Folio}
                    </p>
                </div>
                <div></div> {/* Spacer for alignment */}
            </header>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl text-blue-800">
                        <ClipboardList className="mr-2 h-6 w-6" />
                        Datos de la Concesión
                    </CardTitle>
                    <CardDescription>Información del vehículo y el concesionario.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-gray-600">Propietario</p>
                        <p className="text-base font-semibold">{concesionarioData.Propietario}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-gray-600">Placa Actual</p>
                        <p className="text-base font-semibold">{concesionarioData.Placa}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-gray-600">Tipo de Servicio</p>
                        <p className="text-base font-semibold">{concesionarioData.TipoServicio}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-gray-600">Tipo de Placa</p>
                        <p className="text-base font-semibold">{concesionarioData.TipoPlaca}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-gray-600">Municipio</p>
                        <p className="text-base font-semibold">{concesionarioData.MunicipioAutorizado}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-gray-600">Modalidad</p>
                        <p className="text-base font-semibold">{concesionarioData.Modalidad}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-gray-600">Observaciones de Concesión</p>
                        <p className="text-base font-semibold text-gray-700">{concesionarioData.Observaciones || "N/A"}</p>
                    </div>
                </CardContent>
            </Card>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveInspection(); }} className="space-y-6">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl text-blue-800">
                            <Car className="mr-2 h-6 w-6" />
                            Inspección del Vehículo
                        </CardTitle>
                        <CardDescription>
                            Complete los campos de inspección para determinar el estado del vehículo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Tipo de Trámite */}
                        <div className="space-y-2">
                            <Label htmlFor="tramite-select">Tipo de Trámite</Label>
                            <Select
                                onValueChange={setSelectedTramite}
                                value={selectedTramite}
                            >
                                <SelectTrigger id="tramite-select" className="w-full">
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

                        {/* Campos de Verificación Esencial */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-700">Verificación de Elementos Esenciales</h3>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="check-all-essential"
                                        checked={checkAllEssential}
                                        onCheckedChange={(checked: boolean) => handleCheckAllEssential(checked)}
                                    />
                                    <Label htmlFor="check-all-essential">Marcar todos como correctos</Label>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {scoringSchema.essential.map((field) => {
                                    if (field.type === "checkbox") {
                                        return (
                                            <div key={field.key} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={field.key}
                                                    checked={inspectionData[field.key as keyof typeof initialInspectionData] as boolean}
                                                    onCheckedChange={(checked: boolean) => handleFieldChange(field.key as keyof typeof initialInspectionData, checked)}
                                                />
                                                <Label htmlFor={field.key}>{field.label}</Label>
                                            </div>
                                        )
                                    } else if (field.type === "select-essential") {
                                        return (
                                            <div key={field.key} className="space-y-2">
                                                <Label htmlFor={field.key}>{field.label}</Label>
                                                <Select
                                                    value={inspectionData[field.key as keyof typeof initialInspectionData] as string}
                                                    onValueChange={(value) => handleFieldChange(field.key as keyof typeof initialInspectionData, value)}
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
                                    return null;
                                })}
                            </div>
                        </div>

                        {/* Campos de Puntuación */}
                        <div className="pt-4 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Puntuación del Vehículo</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {scoringSchema.scored.map((field) => (
                                    <div key={field.key} className="space-y-2">
                                        <Label htmlFor={field.key}>{field.label}</Label>
                                        <Select
                                            value={inspectionData[field.key as keyof typeof initialInspectionData] as string}
                                            onValueChange={(value) => handleFieldChange(field.key as keyof typeof initialInspectionData, value)}
                                        >
                                            <SelectTrigger id={field.key}>
                                                <SelectValue placeholder="Seleccione una opción" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0" disabled>Seleccione una opción</SelectItem>
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
                        </div>

                        {/* Observaciones */}
                        <div className="space-y-2 pt-4 border-t border-gray-200">
                            <Label htmlFor="observaciones">Observaciones</Label>
                            <Textarea
                                id="observaciones"
                                placeholder="Escriba aquí las observaciones relevantes de la inspección..."
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Subida de Imágenes */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl text-blue-800">
                            <FileImage className="mr-2 h-6 w-6" />
                            Imágenes de la Inspección
                        </CardTitle>
                        <CardDescription>
                            Suba imágenes relacionadas con la inspección y asigne un tipo a cada una.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full"
                                variant="outline"
                            >
                                <Upload className="mr-2 h-4 w-4" /> Seleccionar Imágenes
                            </Button>
                            <Input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {selectedImages.map((img) => (
                                    <div key={img.id} className="relative group overflow-hidden rounded-md border p-2 shadow-sm">
                                        <img src={img.previewUrl} alt="Preview" className="w-full h-32 object-cover rounded-md mb-2" />
                                        <Select value={img.type} onValueChange={(value) => handleTypeChange(img.id, value)}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Seleccione tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fetchedImageTypes.map((type: any) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-4 right-4 h-6 w-6"
                                            onClick={() => handleRemoveImage(img)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end items-center space-x-4">
                    <div className={`flex items-center space-x-2 ${isRejected ? 'text-red-500' : 'text-green-600'}`}>
                        {isRejected ? <TriangleAlert className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                        <span className="font-semibold">
                            Clasificación: {classification}
                        </span>
                    </div>
                    
                    {/* Sección de puntuación agregada aquí */}
                    <div className={`flex items-center space-x-2 text-gray-700`}>
                        <span className="font-semibold">
                            Puntaje: {score} / {totalPossibleScore}
                        </span>
                    </div>

                    <Button
                        type="submit"
                        className="px-6"
                        disabled={isSubmitting || isUploading || isFormIncomplete}
                    >
                        {isSubmitting || isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Guardar Inspección
                            </>
                        )}
                    </Button>
                </div>

                {/* Modal de confirmación de guardado */}
                <AlertDialog open={confirmSave} onOpenChange={setConfirmSave}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Guardado de Inspección</AlertDialogTitle>
                            <AlertDialogDescription>
                                ¿Está seguro de que desea guardar la inspección con los datos actuales? Una vez guardada, no podrá editarla.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmSaveAction} disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    "Confirmar"
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Modal de confirmación para eliminar imágenes */}
                <AlertDialog open={deleteModalState.isOpen} onOpenChange={(isOpen) => setDeleteModalState(prev => ({ ...prev, isOpen }))}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
                            <AlertDialogDescription>
                                ¿Estás seguro de que quieres eliminar esta imagen? Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleteModalState.isDeleting}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDeleteImage} disabled={deleteModalState.isDeleting}>
                                {deleteModalState.isDeleting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Eliminando...
                                    </>
                                ) : (
                                    "Eliminar"
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Modal de resultado de la inspección */}
                {inspectionResultAlert && (
                    <AlertDialog open={inspectionResultAlert.isOpen} onOpenChange={() => setInspectionResultAlert(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center space-x-2">
                                    {inspectionResultAlert.isRejected ? (
                                        <XCircle className="h-6 w-6 text-red-500" />
                                    ) : (
                                        <BadgeCheck className="h-6 w-6 text-green-500" />
                                    )}
                                    <span>Resultado de la Inspección</span>
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    La inspección ha sido guardada. El vehículo ha sido clasificado.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-2 mt-4">
                                <p className="text-lg font-bold">Clasificación: <span className={`${inspectionResultAlert.isRejected ? 'text-red-500' : 'text-green-600'}`}>{inspectionResultAlert.classification}</span></p>
                                {!inspectionResultAlert.isRejected && (
                                    <p>Puntaje obtenido: {inspectionResultAlert.score} de {inspectionResultAlert.totalPossibleScore}</p>
                                )}
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogAction onClick={() => {
                                    setInspectionResultAlert(null)
                                    // Opcionalmente, redirige al usuario a la página de inicio o a un listado
                                    router.push("/dashboard")
                                }}>
                                    Aceptar y Finalizar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </form>
        </main>
    )
}