"use client"; // This must be at the very top of the file

import apiClient from "@/lib/apiClient";
import type React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Opciones para campos que son select y tienen SI:BIEN, SI:MAL, NO
const generalSelectOptions = [
  { value: "0", label: "Seleccione..." },
  { value: "1", label: "SI:BIEN" },
  { value: "2", label: "SI:MAL" },
  { value: "3", label: "NO" },
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
  { value: "2", label: "Cuenta con", score: 3 }, // Ideal
];

interface SelectedImage {
  id: string;
  file?: File;
  type: string; // This will be the string representation of the numeric ID
  previewUrl: string;
  customName?: string;
  idImagenRevistaVehicular?: number;
}

interface ConcesionarioData {
  IdConcesion: number;
  Folio: string;
  TipoServicio: string;
  TipoPlaca: string;
  Mnemotecnia: string;
  Modalidad: string;
  MunicipioAutorizado: string;
  ClaseUnidad: string | null;
  VigenciaAnios: number | null;
  SeriePlacaActual: string;
  FechaExpedicion: string;
  Observaciones: string;
  IdVehiculoActual: string;
  Placa: string;
  Propietario: string;
  FolioVehiculo: string;
}

interface TramiteOption {
  value: string;
  label: string;
}

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
};

interface Option {
  value: string;
  label: string;
  score?: number;
}

interface SelectOptions {
  capacidadPasajerosOptions: Option[];
  modeloVehiculoOptions: Option[];
  tipoVehiculoOptions: Option[];
  tiposFrenoOptions: Option[];
  cinturonesSeguridadTipoOptions: Option[];
  tapiceriaAsientosOptions: Option[];
  clasificacionOptions: Option[];
}

const defaultSelects: SelectOptions = {
  capacidadPasajerosOptions: [],
  modeloVehiculoOptions: [],
  tipoVehiculoOptions: [],
  tiposFrenoOptions: [],
  cinturonesSeguridadTipoOptions: [],
  tapiceriaAsientosOptions: [],
  clasificacionOptions: [],
};

export default function InspeccionRevistaVehicularForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idConcesionParam = searchParams.get("idC");
  const [inspectionData, setInspectionData] = useState(initialInspectionData);
  const [dynamicSelectOptions, setDynamicSelectOptions] =
    useState<SelectOptions>(defaultSelects);
  const { toast } = useToast();
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [observaciones, setObservaciones] = useState("");
  const [selectedTramite, setSelectedTramite] = useState("invalid-selection");
  const [tramiteOptions, setTramiteOptions] = useState<TramiteOption[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fetchedImageTypes, setFetchedImageTypes] = useState<any[]>([]);
  const [imageToDelete, setImageToDelete] = useState<{
    id: string;
    idImagenRevistaVehicular?: number;
  } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [concesionarioData, setConcesionarioData] =
    useState<ConcesionarioData | null>(null);
  const [isLoadingConcesion, setIsLoadingConcesion] = useState(false);
  const [isLoadingTramites, setIsLoadingTramites] = useState(false);
  const [isLoadingDynamicOptions, setIsLoadingDynamicOptions] = useState(false);

  // Estado para los diálogos de confirmación y resultados
  const [confirmSave, setConfirmSave] = useState(false);
  const [inspectionResultAlert, setInspectionResultAlert] = useState<{
    isOpen: boolean;
    isRejected: boolean;
    classification: string;
    classificationId: number;
    score: number;
    totalPossibleScore: number;
  } | null>(null);
  const [isScoringLogicModalOpen, setIsScoringLogicModalOpen] = useState(false);
  const [checkAllEssential, setCheckAllEssential] = useState(false);

  // Estado para mostrar mensajes de éxito o error en un span
  const [submissionStatus, setSubmissionStatus] = useState({
    message: "",
    type: "",
    isVisible: false,
  });

  const showStatusMessage = (message: string, type: "success" | "error") => {
    setSubmissionStatus({ message, type, isVisible: true });
    setTimeout(() => {
      setSubmissionStatus({ message: "", type: "", isVisible: false });
    }, 5000);
  };

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
        { key: "bolsasAire", label: "Bolsas de Aire (Nivel)", type: "select" as const, options: bolsasAireOptions },
        {
          key: "aireAcondicionado",
          label: "Aire Acondicionado",
          type: "select" as const,
          options: aireAcondicionadoOptions,
        },
      ],
    };
  }, [dynamicSelectOptions]);

  // Función para normalizar el puntaje, si aplica
  const getNormalizedScore = (id: number) => {
    if (id <= 3) {
      return id;
    } else if (id >= 4) {
      return id - 3;
    }
    return 0;
  };

  // Lógica de cálculo de puntuación y clasificación
  const { isRejected, totalScore, classification, classificationId } = useMemo(() => {
    let currentScore = 0;
    let vehicleRejected = false;

    // Primero, verifica las condiciones esenciales para el estado de "RECHAZADO" (solo UI)
    for (const field of scoringSchema.essential) {
      const value = inspectionData[field.key as keyof typeof initialInspectionData];
      if (field.type === "checkbox") {
        if (value === false) {
          vehicleRejected = true;
          break;
        }
      } else if (field.type === "select-essential") {
        if (value === "0" || value === "2" || value === "3") {
          vehicleRejected = true;
          break;
        }
      }
    }

    // Luego, calcula el puntaje y la clasificación,
    // que se basan ÚNICAMENTE en los campos de puntuación
    for (const field of scoringSchema.scored) {
      const value = inspectionData[field.key as keyof typeof initialInspectionData];
      if (field.type === "select" && typeof value === "string" && value !== "0") {
        const idAsNumber = parseInt(value, 10);
        const scoreValue = getNormalizedScore(idAsNumber);
        currentScore += scoreValue;
      }
    }
    
    // Asigna la clasificación basada en el puntaje
    let vehicleClassification = "NO CLASIFICADO";
    let vehicleClassificationId = 0;
    
    if (currentScore < 9) {
      vehicleClassification = "ESCENCIAL";
      vehicleClassificationId = 1;
    } else if (currentScore >= 9 && currentScore < 18) {
      vehicleClassification = "SELECTO";
      vehicleClassificationId = 2;
    } else if (currentScore >= 18) {
      vehicleClassification = "PRIME";
      vehicleClassificationId = 3;
    }

    // `isRejected` es solo para la UI, no afecta el `classificationId`
    const allScoredFieldsSelected = scoringSchema.scored.every(
      (field) => inspectionData[field.key as keyof typeof initialInspectionData] !== "0",
    );
    if (!allScoredFieldsSelected) {
      vehicleClassification = "PENDIENTE DE CLASIFICAR";
    }

    return {
      isRejected: vehicleRejected,
      totalScore: currentScore,
      classification: vehicleClassification,
      classificationId: allScoredFieldsSelected ? vehicleClassificationId : 0,
    };
  }, [inspectionData, scoringSchema]);

  useEffect(() => {
    const fetchTramites = async () => {
      setIsLoadingTramites(true);
      try {
        const response = await apiClient("/revista/tipos-tramite", {
          method: "GET",
          withCredentials: true,
        });
        if (response.data && Array.isArray(response.data)) {
          const tramites = response.data
            .filter(
              (tramite: any) =>
                tramite.IdTramite !== null &&
                tramite.IdTramite !== undefined &&
                String(tramite.IdTramite) !== "",
            )
            .map((tramite: any) => ({
              value: String(tramite.IdTramite),
              label: tramite.Tramite,
            }));
          setTramiteOptions([{ value: "invalid-selection", label: "Seleccione aquí" }, ...tramites]);
        } else {
          setTramiteOptions([{ value: "invalid-selection", label: "Seleccione aquí" }]);
        }
      } catch (error: any) {
        setTramiteOptions([{ value: "invalid-selection", label: "Seleccione aquí" }]);
        toast({
          title: "Error al cargar trámites",
          description: `Ocurrió un error al cargar los trámites: ${error.response?.data?.error || error.message}`,
          variant: "destructive",
        });
      } finally {
        setIsLoadingTramites(false);
      }
    };
    fetchTramites();
  }, [toast]);

  useEffect(() => {
    const fetchConcesionarioData = async () => {
      if (idConcesionParam) {
        setIsLoadingConcesion(true);
        try {
          const { data } = await apiClient(`/concesion/autorizacion/${idConcesionParam}`, {
            method: "GET",
            withCredentials: true,
          });
          if (data) {
            const apiData = data;
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
            toast({
              title: "No encontrado",
              description: `No se encontraron datos para el ID de Concesión ${idConcesionParam}.`,
              variant: "default",
            });
          }
        } catch (err: any) {
          setConcesionarioData(null);
          toast({
            title: "Error de carga",
            description: `Ocurrió un error al cargar los datos: ${err.response?.data?.error || err.message}`,
            variant: "destructive",
          });
        } finally {
          setIsLoadingConcesion(false);
        }
      } else {
        setConcesionarioData(null);
        toast({
          title: "Advertencia",
          description: "No se ha proporcionado un ID de Concesión en la URL. Ejemplo: `/tu-ruta?idC=123`",
          variant: "default",
        });
      }
    };
    fetchConcesionarioData();
  }, [idConcesionParam, toast]);

  useEffect(() => {
    const fetchCamposSeleccionPuntuacion = async () => {
      setIsLoadingDynamicOptions(true);
      try {
        const { data } = await apiClient(`/vehiculo/datos/puntuacion`, {
          method: "GET",
          withCredentials: true,
        });
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

  useEffect(() => {
    const fetchImageTypes = async () => {
      try {
        const response = await apiClient("/revista/tipos-imagen", {
          method: "GET",
          withCredentials: true,
        });
        const typesArray = response.data;
        if (!Array.isArray(typesArray)) {
          setFetchedImageTypes([]);
          toast({
            title: "Error al cargar tipos de imagen",
            description: "Ocurrió un error al cargar los tipos de imagen. La lista estará vacía.",
            variant: "destructive",
          });
          return;
        }
        const types = typesArray
          .filter(
            (type: any) =>
              type.IdTipoImagen !== null &&
              type.IdTipoImagen !== undefined &&
              String(type.IdTipoImagen) !== "",
          )
          .map((type: any) => ({
            value: String(type.IdTipoImagen),
            label: type.TipoImagen,
          }));
        setFetchedImageTypes(types);
      } catch (error) {
        toast({
          title: "Error al cargar tipos de imagen",
          description: "Ocurrió un error al cargar los tipos de imagen. La lista estará vacía.",
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
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, [selectedImages]);

  const handleFieldChange = (field: keyof typeof initialInspectionData, value: boolean | string) => {
    setInspectionData((prev) => ({ ...prev, [field]: value }));
    if (typeof value === "boolean" && field !== "aprobarRevistaVehicular" && value === false) {
      setCheckAllEssential(false);
    }
  };

  const handleCheckAllEssential = (checked: boolean) => {
    setCheckAllEssential(checked);
    const newInspectionData = { ...inspectionData };
    scoringSchema.essential.forEach((field) => {
      if (field.type === "checkbox") {
        (newInspectionData as any)[field.key] = checked;
      } else if (field.type === "select-essential") {
        (newInspectionData as any)[field.key] = checked ? "1" : "0";
      }
    });
    setInspectionData(newInspectionData);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages: SelectedImage[] = Array.from(files).map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        file: file,
        type: "",
        previewUrl: URL.createObjectURL(file),
      }));
      setSelectedImages((prev) => [...prev, ...newImages]);
      toast({
        title: "Imágenes seleccionadas",
        description: `${newImages.length} imagen(es) seleccionada(s).`,
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTypeChange = (id: string, newTypeValue: string) => {
    setSelectedImages((prev) =>
      prev.map((img) => {
        if (img.id === id) {
          const selectedTypeLabel =
            fetchedImageTypes.find((t: any) => t.value === newTypeValue)?.label || newTypeValue;
          let extension = "";
          if (img.file?.name) {
            extension = img.file.name.split(".").pop() || "";
          } else if (img.previewUrl.startsWith("data:image/jpeg")) {
            extension = "jpg";
          } else if (img.previewUrl.startsWith("data:image/png")) {
            extension = "png";
          }
          const safeType = selectedTypeLabel.replace(/\s+/g, "_").toLowerCase();
          const customName = `inspeccion_${safeType}_${Date.now()}${extension ? "." + extension : ""}`;
          return { ...img, type: newTypeValue, customName };
        }
        return img;
      }),
    );
  };

  const handleDeleteImage = (id: string, idImagenRevistaVehicular?: number) => {
    setImageToDelete({ id, idImagenRevistaVehicular });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!imageToDelete) return;

    setIsDeleting(true);
    try {
      if (imageToDelete.idImagenRevistaVehicular) {
        await apiClient(`/revista/imagen/${imageToDelete.idImagenRevistaVehicular}`, {
          method: "DELETE",
          withCredentials: true,
        });
        toast({
          title: "Imagen eliminada",
          description: "La imagen se ha eliminado correctamente del servidor.",
        });
      } else {
        toast({
          title: "Imagen eliminada",
          description: "La imagen local se ha eliminado correctamente.",
        });
      }
      setSelectedImages((prev) => prev.filter((img) => img.id !== imageToDelete.id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast({
        title: "Error al eliminar la imagen",
        description: "No se pudo eliminar la imagen. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveInspection = async () => {
    if (!idConcesionParam || !concesionarioData) {
      showStatusMessage("No se encontraron datos de la concesión.", "error");
      return;
    }
    if (selectedTramite === "invalid-selection") {
      showStatusMessage("Por favor, seleccione un tipo de trámite.", "error");
      return;
    }

    const imagesWithoutType = selectedImages.some((img) => img.type === "" || img.type === "0");
    if (imagesWithoutType) {
      showStatusMessage("Por favor, asigna un tipo a todas las imágenes seleccionadas.", "error");
      return;
    }
    if (!inspectionData.aprobarRevistaVehicular) {
      showStatusMessage("Debes aprobar la revista vehicular para finalizar.", "error");
      return;
    }

    setConfirmSave(true);
  };

  const handleConfirmSave = async () => {
    setIsSubmitting(true);
    setConfirmSave(false);
    try {
      if (!idConcesionParam || !concesionarioData || selectedTramite === "invalid-selection") {
        toast({
          title: "Error de Validación",
          description: "Faltan datos esenciales para guardar la inspección. Intente de nuevo.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const revistaData = {
        idConcesion: concesionarioData.IdConcesion,
        idPropietario: concesionarioData.Propietario,
        idTramite: Number.parseInt(selectedTramite),
        idVehiculo: Number.parseInt(concesionarioData.IdVehiculoActual),
        placa: concesionarioData.Placa,
        propietario: concesionarioData.Propietario,
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
        aprobado: !isRejected,
        imagenCromaticaVer: inspectionData.imagenCromatica,
        folio: concesionarioData.Folio,
        modeloId: inspectionData.modeloVehiculo,
        tipoId: inspectionData.tipoVehiculo,
        capacidadId: inspectionData.capacidadPasajeros,
        tipoBolsa: inspectionData.bolsasAire,
        tieneAire: inspectionData.aireAcondicionado,
        frenoId: inspectionData.tiposFreno,
        cinturonId: inspectionData.cinturonesSeguridadTipo,
        tapiceriaId: inspectionData.coberturaAsientos,
        puntuacion: totalScore,
        clasificacionId: classificationId,
      };

      const response = await apiClient("/revista", {
        method: "POST",
        data: revistaData,
        withCredentials: true,
      });
      const idRV = response.data?.idRV || response.idRV;
      if (!idRV) {
        throw new Error("ID de Revista Vehicular no recibido del servidor.");
      }

      toast({
        title: "Inspección Guardada",
        description: `Inspección #${idRV} guardada exitosamente.`,
        
      });

      const imagesToUpload = selectedImages.filter((img) => img.file && img.type && !img.idImagenRevistaVehicular);
      if (imagesToUpload.length > 0) {
        setIsUploading(true);
        for (const img of imagesToUpload) {
          const formData = new FormData();
          formData.append("imagen", img.file as Blob);
          formData.append("idRV", String(idRV));
          formData.append("tipoImagen", img.type);
          if (img.customName) {
            formData.append("customName", img.customName);
          }
          try {
            await apiClient("/revista/imagen", {
              method: "POST",
              data: formData,
              headers: {
                "Content-Type": "multipart/form-data",
              },
              withCredentials: true,
            });
            toast({
              title: "Imagen Subida",
              description: `Imagen de tipo ${img.type} subida.`,
            });
          } catch (uploadError) {
            toast({
              title: "Error al subir imagen",
              description: `No se pudo subir la imagen de tipo ${img.type}.`,
              variant: "destructive",
            });
          }
        }
        setIsUploading(false);
      }

      setInspectionResultAlert({
        isOpen: true,
        isRejected: isRejected,
        classification: isRejected ? "RECHAZADO" : classification,
        classificationId: classificationId,
        score: totalScore,
        totalPossibleScore: 18,
      });
      router.push(`/dashboard/BandejaRevista`) // Example: navigate back to concession list

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Error desconocido al guardar la inspección.";
      toast({
        title: "Error al Guardar",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <Button onClick={handleGoBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Regresar
        </Button>
        <h1 className="text-3xl font-bold">Inspección de Revista Vehicular</h1>
        <Button onClick={() => setIsScoringLogicModalOpen(true)} variant="outline">
          <Lightbulb className="mr-2 h-4 w-4" /> Lógica de Puntuación
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Car className="mr-2" /> Datos del Concesionario y Vehículo
          </CardTitle>
          <CardDescription>
            Información cargada automáticamente para la inspección.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingConcesion ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="animate-spin" />
              <span>Cargando datos del concesionario...</span>
            </div>
          ) : concesionarioData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col">
                <span className="font-semibold">Folio:</span>
                <span>{concesionarioData.Folio}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">Propietario:</span>
                <span>{concesionarioData.Propietario}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">Placa:</span>
                <span>{concesionarioData.Placa}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">Tipo de Servicio:</span>
                <span>{concesionarioData.TipoServicio}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">Modalidad:</span>
                <span>{concesionarioData.Modalidad}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">Municipio:</span>
                <span>{concesionarioData.MunicipioAutorizado}</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No hay datos para mostrar.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="mr-2" /> Inspección y Puntuación
          </CardTitle>
          <CardDescription>
            Revise y marque los campos esenciales y califique los de puntuación.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Label htmlFor="tramite-select" className="min-w-[150px]">
              Tipo de Trámite:
            </Label>
            {isLoadingTramites ? (
              <span className="text-gray-500">Cargando trámites...</span>
            ) : (
              <Select
                value={selectedTramite}
                onValueChange={setSelectedTramite}
                disabled={isSubmitting}
              >
                <SelectTrigger id="tramite-select" className="flex-grow">
                  <SelectValue placeholder="Seleccione el tipo de trámite" />
                </SelectTrigger>
                <SelectContent>
                  {tramiteOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sección de Campos Esenciales */}
            <div className="col-span-full">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <ShieldCheck className="mr-2 text-green-600" />
                Campos Esenciales (Aprobar o Rechazar)
              </h3>
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="check-all"
                  checked={checkAllEssential}
                  onCheckedChange={(checked) => handleCheckAllEssential(checked as boolean)}
                />
                <Label htmlFor="check-all" className="font-bold">
                  Marcar todos los campos esenciales como "Aprobado"
                </Label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border p-4 rounded-md">
                {scoringSchema.essential.map((field) => (
                  <div key={field.key} className="flex items-center space-x-2">
                    {field.type === "checkbox" ? (
                      <>
                        <Checkbox
                          id={field.key}
                          checked={inspectionData[field.key as keyof typeof initialInspectionData] as boolean}
                          onCheckedChange={(checked) =>
                            handleFieldChange(field.key as keyof typeof initialInspectionData, checked as boolean)
                          }
                          disabled={isSubmitting}
                        />
                        <Label htmlFor={field.key}>{field.label}</Label>
                      </>
                    ) : (
                      <div className="flex items-center w-full">
                        <Label htmlFor={field.key} className="mr-2 whitespace-nowrap">
                          {field.label}:
                        </Label>
                        <Select
                          value={inspectionData[field.key as keyof typeof initialInspectionData] as string}
                          onValueChange={(value) =>
                            handleFieldChange(field.key as keyof typeof initialInspectionData, value)
                          }
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
            </div>

            {/* Sección de Campos de Puntuación */}
            <div className="col-span-full">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Award className="mr-2 text-yellow-500" />
                Campos de Puntuación
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border p-4 rounded-md">
                {isLoadingDynamicOptions ? (
                  <div className="col-span-full flex justify-center items-center h-24">
                    <Loader2 className="animate-spin" />
                    <span className="ml-2 text-gray-500">Cargando opciones...</span>
                  </div>
                ) : (
                  scoringSchema.scored.map((field) => (
                    <div key={field.key} className="flex flex-col space-y-1">
                      <Label htmlFor={field.key}>{field.label}</Label>
                      <Select
                        value={inspectionData[field.key as keyof typeof initialInspectionData] as string}
                        onValueChange={(value) =>
                          handleFieldChange(field.key as keyof typeof initialInspectionData, value)
                        }
                        disabled={isSubmitting}
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
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="aprobar-revista"
              checked={inspectionData.aprobarRevistaVehicular}
              onCheckedChange={(checked) =>
                handleFieldChange("aprobarRevistaVehicular", checked as boolean)
              }
              disabled={isSubmitting}
            />
            <Label htmlFor="aprobar-revista">Aprobar Revista Vehicular</Label>
          </div>
          <div className="mt-4">
            <Label htmlFor="observaciones">Observaciones Adicionales</Label>
            <Textarea
              id="observaciones"
              placeholder="Escriba aquí las observaciones..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              disabled={isSubmitting}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileImage className="mr-2" /> Subir Imágenes
          </CardTitle>
          <CardDescription>
            Adjunte las imágenes necesarias para la inspección.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              variant="outline"
              disabled={isSubmitting}
            >
              <Upload className="mr-2 h-4 w-4" /> Subir Imágenes
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              multiple
              accept="image/*"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {selectedImages.map((img) => (
              <div key={img.id} className="relative group">
                <Image
                  src={img.previewUrl}
                  alt="Vista previa"
                  width={300}
                  height={200}
                  className="rounded-md object-cover h-48 w-full"
                />
                <Button
                  className="absolute top-2 right-2 text-white bg-red-600 hover:bg-red-700 rounded-full h-8 w-8 p-0"
                  onClick={() => handleDeleteImage(img.id, img.idImagenRevistaVehicular)}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-2 right-2 p-2 bg-black/50 rounded-md">
                  <Select
                    value={img.type}
                    onValueChange={(newType) => handleTypeChange(img.id, newType)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full text-white">
                      <SelectValue placeholder="Seleccione tipo de imagen" />
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

      {/* Sección de Resumen y Guardado */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardCheck className="mr-2" /> Resumen de Inspección
          </CardTitle>
          <CardDescription>
            Puntuación y clasificación final del vehículo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            <p className="flex items-center text-lg font-medium">
              <span className="font-bold mr-2">Estado de Puntos Esenciales:</span>
              {isRejected ? (
                <span className="text-red-600 font-bold flex items-center">
                  <XCircle className="h-5 w-5 mr-1" /> RECHAZADO
                </span>
              ) : (
                <span className="text-green-600 font-bold flex items-center">
                  <BadgeCheck className="h-5 w-5 mr-1" /> APROBADO
                </span>
              )}
            </p>
            <p className="text-lg font-medium">
              <span className="font-bold mr-2">Puntaje Final:</span>
              <span className="text-blue-600">{totalScore}</span>
            </p>
            <p className="text-lg font-medium">
              <span className="font-bold mr-2">Clasificación:</span>
              <span className={`font-bold ${classification === "ESCENCIAL" ? "text-yellow-600" : classification === "SELECTO" ? "text-orange-600" : classification === "PRIME" ? "text-green-600" : "text-gray-600"}`}>
                {classification}
              </span>
            </p>
          </div>
          {submissionStatus.isVisible && (
            <div
              className={`mt-4 p-3 rounded-md ${
                submissionStatus.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              <p>{submissionStatus.message}</p>
            </div>
          )}
          <Button
            onClick={handleSaveInspection}
            className="mt-6 w-full"
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting || isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? "Guardando..." : isUploading ? "Subiendo imágenes..." : "Guardar Inspección"}
          </Button>
        </CardContent>
      </Card>

      {/* Modales de Alerta y Confirmación */}
      {/* Modal de Confirmación de Guardado */}
      <AlertDialog open={confirmSave} onOpenChange={setConfirmSave}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de guardar esta inspección?</AlertDialogTitle>
            <AlertDialogDescription>
              Una vez guardada, no podrá modificarla. El vehículo será clasificado
              como **{classification}** con un puntaje de **{totalScore}**.
              Estado de puntos esenciales: **{isRejected ? "RECHAZADO" : "APROBADO"}**.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <Button
              onClick={handleConfirmSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? "Guardando..." : "Confirmar y Guardar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Lógica de Puntuación */}
      <AlertDialog open={isScoringLogicModalOpen} onOpenChange={setIsScoringLogicModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lógica de Puntuación y Clasificación</AlertDialogTitle>
            <AlertDialogDescription>
              La clasificación se basa en la suma de los puntajes de los campos seleccionados en la sección de "Puntuación".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="p-4 bg-gray-50 rounded-md">
            <ul className="list-disc list-inside space-y-2">
              <li>
                <span className="font-bold text-yellow-600">ESCENCIAL:</span> Puntaje total menor a 9.
              </li>
              <li>
                <span className="font-bold text-orange-600">SELECTO:</span> Puntaje total entre 9 y 17 (ambos inclusive).
              </li>
              <li>
                <span className="font-bold text-green-600">PRIME:</span> Puntaje total de 18 o más.
              </li>
            </ul>
            <p className="mt-4 font-semibold text-sm text-gray-700">
              El estado de "RECHAZADO" (si los puntos esenciales no se cumplen) no afecta el cálculo del puntaje ni la clasificación que se guardan, pero impide que la revista sea aprobada.
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction>Entendido</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Confirmación de Eliminación de Imagen */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de eliminar esta imagen?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La imagen se eliminará del listado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Sí, eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Resultado de Inspección */}
      {inspectionResultAlert && (
        <AlertDialog open={inspectionResultAlert.isOpen} onOpenChange={(open) => setInspectionResultAlert({ ...inspectionResultAlert, isOpen: open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                {inspectionResultAlert.isRejected ? (
                  <XCircle className="h-6 w-6 text-red-500 mr-2" />
                ) : (
                  <BadgeCheck className="h-6 w-6 text-green-500 mr-2" />
                )}
                Inspección de Revista Vehicular
              </AlertDialogTitle>
              <AlertDialogDescription>
                La inspección ha sido procesada. Aquí está el resultado final.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Puntaje Final:</span>{" "}
                <span className="font-bold text-lg">{inspectionResultAlert.score}</span> / 18
              </p>
              <p>
                <span className="font-semibold">Clasificación:</span>{" "}
                <span className="font-bold text-lg">{inspectionResultAlert.classification}</span>
              </p>
              <p>
                <span className="font-semibold">Estado de Puntos Esenciales:</span>{" "}
                {inspectionResultAlert.isRejected ? (
                  <span className="font-bold text-red-500">RECHAZADO</span>
                ) : (
                  <span className="font-bold text-green-500">APROBADO</span>
                )}
              </p>
            </div>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => router.push("/")}>Finalizar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </main>
  );
}