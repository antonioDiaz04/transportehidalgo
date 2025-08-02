"use client"

import apiClient from "@/lib/apiClient"
import type React from "react"
import { useState, useRef, useEffect, useMemo, useCallback } from "react"
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

    const handleRemoveImage = (idImagen: string, idImagenRevistaVehicular?: number) => {
        const imageToRemove = selectedImages.find((img) =>
            img.idImagenRevistaVehicular ? img.idImagenRevistaVehicular === idImagenRevistaVehicular : img.id === idImagen,
        );

        if (imageToRemove) {
            setDeleteModalState({
                isOpen: true,
                isDeleting: false,
                imageToDelete: {
                    id: idImagen,
                    idImagenRevistaVehicular: imageToRemove.idImagenRevistaVehicular,
                },
            });
        }
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
            <div className="flex flex-col items-center justify-center min-h-screen">
                <TriangleAlert className="w-16 h-16 text-yellow-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">ID de Concesión no proporcionado</h1>
                <p className="text-gray-600">Por favor, navegue a esta página con un `idC` en la URL.</p>
                <Button onClick={() => router.back()} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                </Button>
            </div>
        )
    }

    const isDataLoading = Object.values(isLoading).some(Boolean);

    if (isDataLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <h1 className="text-2xl font-bold mt-4">Cargando datos...</h1>
            </div>
        )
    }

    if (!concesionarioData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Error de Carga</h1>
                <p className="text-gray-600">No se pudieron obtener los datos de la concesión o no existe.</p>
                <Button onClick={() => router.back()} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <header className="flex items-center justify-between border-b pb-4">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                </Button>
                <h1 className="text-3xl font-bold flex items-center">
                    <Car className="mr-3 h-8 w-8 text-primary" />
                    Inspección y Revista Vehicular
                </h1>
                <div className="flex space-x-2">
                    <Button onClick={() => setIsScoringLogicModalOpen(true)} variant="outline" className="flex items-center">
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Lógica de Puntuación
                    </Button>
                    <Button onClick={handleSaveInspection} disabled={isSubmitting || isUploading}>
                        {(isSubmitting || isUploading) ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Guardar Inspección
                    </Button>
                </div>
            </header>

            <section className="grid md:grid-cols-2 gap-8">
                {/* Detalles de la Concesión */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <ClipboardList className="mr-2 h-5 w-5" />
                            Datos del Vehículo y Concesionario
                        </CardTitle>
                        <CardDescription>Información cargada automáticamente para la concesión {idConcesionParam}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div><strong className="text-sm">Propietario:</strong> {concesionarioData.Propietario}</div>
                        <div><strong className="text-sm">Placa:</strong> {concesionarioData.Placa}</div>
                        <div><strong className="text-sm">Folio de Concesión:</strong> {concesionarioData.Folio}</div>
                        <div><strong className="text-sm">Tipo de Servicio:</strong> {concesionarioData.TipoServicio} ({concesionarioData.Modalidad})</div>
                        <div><strong className="text-sm">Municipio:</strong> {concesionarioData.MunicipioAutorizado}</div>
                        <div className="pt-2">
                            <Label htmlFor="tramite-select" className="text-sm">Trámite de Revista:</Label>
                            <Select
                                onValueChange={setSelectedTramite}
                                value={selectedTramite}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccione un trámite..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {tramiteOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Resumen de la Puntuación */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <Award className="mr-2 h-5 w-5" />
                            Resultado de la Inspección
                        </CardTitle>
                        <CardDescription>Clasificación y puntaje en tiempo real</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-center items-center h-full">
                        <div className="text-6xl font-bold text-primary">{score} / {totalPossibleScore}</div>
                        <div className="text-xl font-semibold mt-2">{classification}</div>
                        {isRejected && (
                            <div className="text-red-500 font-bold flex items-center mt-2">
                                <XCircle className="h-4 w-4 mr-1" />
                                Vehículo Rechazado
                            </div>
                        )}
                        {!isRejected && isFormIncomplete && (
                            <div className="text-yellow-500 font-bold flex items-center mt-2">
                                <TriangleAlert className="h-4 w-4 mr-1" />
                                Formulario Incompleto
                            </div>
                        )}
                        <div className="flex items-center mt-4 space-x-2">
                            <Checkbox
                                id="aprobar"
                                checked={inspectionData.aprobarRevistaVehicular}
                                onCheckedChange={(checked) => handleFieldChange("aprobarRevistaVehicular", Boolean(checked))}
                                disabled={isRejected || isFormIncomplete}
                            />
                            <Label htmlFor="aprobar" className="text-sm font-medium">Aprobar Revista Vehicular</Label>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Campos de Inspección */}
            <section className="grid lg:grid-cols-2 gap-8">
                {/* Requisitos Esenciales */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <ShieldCheck className="mr-2 h-5 w-5" />
                            Requisitos Esenciales
                        </CardTitle>
                        <CardDescription>Verifica los elementos obligatorios para la aprobación.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2 mb-4">
                            <Checkbox
                                id="check-all-essential"
                                checked={checkAllEssential}
                                onCheckedChange={(checked) => handleCheckAllEssential(Boolean(checked))}
                            />
                            <Label htmlFor="check-all-essential" className="font-bold">Marcar/Desmarcar todos los esenciales</Label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {scoringSchema.essential.map(field => (
                                <div key={field.key} className="flex flex-col space-y-1">
                                    <Label className="text-sm">{field.label}</Label>
                                    {field.type === "checkbox" ? (
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={field.key}
                                                checked={(inspectionData as any)[field.key]}
                                                onCheckedChange={(checked) => handleFieldChange(field.key as keyof typeof initialInspectionData, Boolean(checked))}
                                            />
                                            <Label htmlFor={field.key}>{field.label}</Label>
                                        </div>
                                    ) : (
                                        <Select
                                            onValueChange={(value) => handleFieldChange(field.key as keyof typeof initialInspectionData, value)}
                                            value={(inspectionData as any)[field.key]}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {field.options.map(option => (
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

                {/* Campos Puntuables */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <Award className="mr-2 h-5 w-5" />
                            Características para Puntuación
                        </CardTitle>
                        <CardDescription>Selecciona las características del vehículo para la clasificación final.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {scoringSchema.scored.map(field => (
                                <div key={field.key} className="flex flex-col space-y-1">
                                    <Label className="text-sm">{field.label}</Label>
                                    <Select
                                        onValueChange={(value) => handleFieldChange(field.key as keyof typeof initialInspectionData, value)}
                                        value={(inspectionData as any)[field.key]}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {field.options.map(option => (
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
            </section>

            {/* Subida de Imágenes */}
            <section>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <FileImage className="mr-2 h-5 w-5" />
                            Evidencia Fotográfica
                        </CardTitle>
                        <CardDescription>Adjunte imágenes del vehículo para la inspección.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                            />
                            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex items-center">
                                <Upload className="mr-2 h-4 w-4" />
                                Seleccionar Imágenes
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {selectedImages.map((img) => (
                                <Card key={img.id} className="relative group">
                                    <div className="relative aspect-video w-full">
                                        <Image
                                            src={img.previewUrl}
                                            alt={`Preview ${img.id}`}
                                            layout="fill"
                                            objectFit="cover"
                                            className="rounded-t-lg"
                                        />
                                    </div>
                                    <CardContent className="p-2 space-y-2">
                                        <Select
                                            onValueChange={(value) => handleTypeChange(img.id, value)}
                                            value={img.type}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Tipo de imagen..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">Seleccione un tipo...</SelectItem>
                                                {fetchedImageTypes.map((type: any) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleRemoveImage(img.id, img.idImagenRevistaVehicular)}
                                            className="w-full flex items-center"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Eliminar
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Observaciones */}
            <section>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <ClipboardCheck className="mr-2 h-5 w-5" />
                            Observaciones
                        </CardTitle>
                        <CardDescription>Añade comentarios adicionales sobre la inspección.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="Escribe tus observaciones aquí..."
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            rows={4}
                        />
                    </CardContent>
                </Card>
            </section>

            <footer className="flex justify-end pt-8">
                <Button onClick={handleSaveInspection} disabled={isSubmitting || isUploading}>
                    {(isSubmitting || isUploading) ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    Guardar Inspección
                </Button>
            </footer>

            {/* Modales */}
            {/* Modal de Lógica de Puntuación */}
            <AlertDialog open={isScoringLogicModalOpen} onOpenChange={setIsScoringLogicModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center">
                            <Lightbulb className="mr-2" /> Lógica de Puntuación
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            <p className="font-semibold text-lg">Rechazo:</p>
                            <ul className="list-disc list-inside space-y-1 mt-2">
                                <li>El vehículo es **RECHAZADO** si cualquier requisito esencial no es "SI:BIEN" o su checkbox no está marcado.</li>
                            </ul>
                            <p className="font-semibold text-lg mt-4">Clasificación por Puntaje:</p>
                            <ul className="list-disc list-inside space-y-1 mt-2">
                                <li>**PRIME** (Clasificación 3): Puntaje de 18 puntos.</li>
                                <li>**SELECTO** (Clasificación 2): Puntaje entre 9 y 17 puntos.</li>
                                <li>**ESCENCIAL** (Clasificación 1): Puntaje entre 0 y 8 puntos.</li>
                            </ul>
                            <p className="mt-4 text-sm text-gray-500">
                                La puntuación se basa en la suma de los puntos de los campos de "Características para Puntuación".
                                Cada opción de select suma 1, 2 o 3 puntos.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cerrar</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


            {/* Modal de Confirmación de Guardado */}
            <AlertDialog open={confirmSave} onOpenChange={setConfirmSave}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center">
                            <BadgeCheck className="mr-2 text-primary" /> Confirmar Inspección
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            <p>Está a punto de guardar la inspección con los siguientes resultados:</p>
                            <div className="mt-4 space-y-1">
                                <p><strong>Clasificación:</strong> <span className={`font-bold ${isRejected ? 'text-red-500' : 'text-primary'}`}>{classification}</span></p>
                                <p><strong>Puntaje Total:</strong> {score} de {totalPossibleScore}</p>
                                <p><strong>Resultado Final:</strong> {inspectionData.aprobarRevistaVehicular ? <span className="font-bold text-green-500">Aprobado</span> : <span className="font-bold text-red-500">No Aprobado</span>}</p>
                            </div>
                            <p className="mt-4">¿Desea continuar?</p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setConfirmSave(false)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmSaveAction}>Confirmar y Guardar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


            {/* Modal de Confirmación de Eliminación de Imagen */}
            <AlertDialog open={deleteModalState.isOpen} onOpenChange={() => setDeleteModalState(prev => ({ ...prev, isOpen: false }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro de eliminar esta imagen?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción es irreversible. Si la imagen ya fue guardada en el servidor, será eliminada permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteModalState.isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteImage} disabled={deleteModalState.isDeleting}>
                            {deleteModalState.isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


            {/* Modal de Resultado de la Inspección */}
            <AlertDialog open={inspectionResultAlert?.isOpen ?? false} onOpenChange={() => setInspectionResultAlert(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className={`flex items-center ${inspectionResultAlert?.isRejected ? 'text-red-500' : 'text-green-500'}`}>
                            {inspectionResultAlert?.isRejected ? <TriangleAlert className="mr-2" /> : <BadgeCheck className="mr-2" />}
                            Inspección Finalizada
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            <p className="font-semibold text-lg">Resultado:</p>
                            <div className="mt-2 space-y-1">
                                <p><strong>Clasificación:</strong> <span className={`font-bold ${inspectionResultAlert?.isRejected ? 'text-red-500' : 'text-primary'}`}>{inspectionResultAlert?.classification}</span></p>
                                <p><strong>Puntaje:</strong> {inspectionResultAlert?.score} de {inspectionResultAlert?.totalPossibleScore}</p>
                                {inspectionResultAlert?.isRejected && <p className="text-red-500 mt-2 font-bold">El vehículo ha sido rechazado.</p>}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => router.push("/")}>Finalizar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}