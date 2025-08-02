// This must be at the very top of the file
"use client";

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

  // Características para el tipo de servicio (puntuación)
  modeloVehiculo: "0",
  tipoVehiculo: "0",
  capacidadPasajeros: "0",
  tiposFreno: "0",
  cinturonesSeguridadTipo: "0",
  tapiceriaAsientos: "0",
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
  const [inspectionData, setInspectionData] =
    useState(initialInspectionData);
  const [dynamicSelectOptions, setDynamicSelectOptions] =
    useState<SelectOptions>(defaultSelects);
  const { toast } = useToast();
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>(
    [],
  );
  const [observaciones, setObservaciones] = useState("");
  const [selectedTramite, setSelectedTramite] =
    useState("invalid-selection");
  const [tramiteOptions, setTramiteOptions] = useState<TramiteOption[]>(
    [],
  );
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
  const [isLoadingDynamicOptions, setIsLoadingDynamicOptions] =
    useState(false);

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
  const [isScoringLogicModalOpen, setIsScoringLogicModalOpen] =
    useState(false);
  const [checkAllEssential, setCheckAllEssential] = useState(false);

  const scoringSchema = useMemo(() => {
    return {
      essential: [
        {
          key: "placaDelantera",
          label: "Placa Delantera",
          type: "checkbox" as const,
        },
        {
          key: "placaTrasera",
          label: "Placa Trasera",
          type: "checkbox" as const,
        },
        {
          key: "calcaVerificacion",
          label: "Calcomanía de Verificación",
          type: "checkbox" as const,
        },
        {
          key: "calcaTenencia",
          label: "Calcomanía de Tenencia",
          type: "checkbox" as const,
        },
        {
          key: "pinturaCarroceria",
          label: "Pintura y Carrocería",
          type: "checkbox" as const,
        },
        {
          key: "estadoLlantas",
          label: "Estado de Llantas",
          type: "checkbox" as const,
        },
        { key: "claxon", label: "Claxon", type: "checkbox" as const },
        {
          key: "luzBaja",
          label: "Luz Baja",
          type: "checkbox" as const,
        },
        {
          key: "luzAlta",
          label: "Luz Alta",
          type: "checkbox" as const,
        },
        {
          key: "cuartos",
          label: "Luces de Cuartos",
          type: "checkbox" as const,
        },
        {
          key: "direccionales",
          label: "Direccionales",
          type: "checkbox" as const,
        },
        {
          key: "intermitentes",
          label: "Luces Intermitentes",
          type: "checkbox" as const,
        },
        {
          key: "stop",
          label: "Luces de Stop",
          type: "checkbox" as const,
        },
        {
          key: "timbre",
          label: "Timbre (si aplica)",
          type: "checkbox" as const,
        },
        {
          key: "estinguidor",
          label: "Extinguidor",
          type: "checkbox" as const,
        },
        {
          key: "herramientas",
          label: "Herramientas Básicas",
          type: "checkbox" as const,
        },
        {
          key: "sistemaFrenado",
          label: "Sistema de Frenado",
          type: "checkbox" as const,
        },
        {
          key: "sistemaDireccion",
          label: "Sistema de Dirección",
          type: "checkbox" as const,
        },
        {
          key: "sistemaSuspension",
          label: "Sistema de Suspensión",
          type: "checkbox" as const,
        },
        {
          key: "interiores",
          label: "Interiores",
          type: "checkbox" as const,
        },
        {
          key: "botiquin",
          label: "Botiquín de Primeros Auxilios",
          type: "checkbox" as const,
        },
        {
          key: "cinturonSeguridad",
          label: "Cinturones de Seguridad",
          type: "checkbox" as const,
        },
        {
          key: "imagenCromatica",
          label: "Imagen Cromática",
          type: "checkbox" as const,
        },
        {
          key: "defensas",
          label: "Defensas",
          type: "select-essential" as const,
          options: generalSelectOptions,
        },
        {
          key: "vidrios",
          label: "Vidrios",
          type: "select-essential" as const,
          options: generalSelectOptions,
        },
        {
          key: "limpiadores",
          label: "Limpiaparabrisas",
          type: "select-essential" as const,
          options: generalSelectOptions,
        },
        {
          key: "espejos",
          label: "Espejos Laterales",
          type: "select-essential" as const,
          options: generalSelectOptions,
        },
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
      // Los campos puntuados coinciden ahora con la API
      scored: [
        {
          key: "modeloVehiculo",
          label: "Modelo del Vehículo",
          type: "select" as const,
          options: dynamicSelectOptions.modeloVehiculoOptions,
        },
        {
          key: "tipoVehiculo",
          label: "Tipo de Vehículo",
          type: "select" as const,
          options: dynamicSelectOptions.tipoVehiculoOptions,
        },
        {
          key: "capacidadPasajeros",
          label: "Capacidad de Pasajeros",
          type: "select" as const,
          options: dynamicSelectOptions.capacidadPasajerosOptions,
        },
        {
          key: "tiposFreno",
          label: "Tipos de Freno",
          type: "select" as const,
          options: dynamicSelectOptions.tiposFrenoOptions,
        },
        {
          key: "cinturonesSeguridadTipo",
          label: "Cinturones de Seguridad (Tipo)",
          type: "select" as const,
          options: dynamicSelectOptions.cinturonesSeguridadTipoOptions,
        },
        {
          key: "tapiceriaAsientos",
          label: "Tapicería de Asientos",
          type: "select" as const,
          options: dynamicSelectOptions.tapiceriaAsientosOptions,
        },
      ],
    };
  }, [dynamicSelectOptions]);

  // Lógica de cálculo de puntuación y clasificación con useMemo
  const { isRejected, classification, classificationId, score, totalPossibleScore } = useMemo(() => {
    let currentScore = 0;
    let vehicleRejected = false;
    // La puntuación máxima posible es 6 campos * 3 puntos/campo = 18
    const maxPossibleScore = 18;

    // Función para normalizar los IDs de la API a valores de 1, 2 o 3
    const getNormalizedScore = (id: number) => {
      // Asumiendo que los IDs 1, 2, 3 son puntajes "malos", y 4, 5, 6 son puntajes "buenos"
      // Se corrigió la lógica para que tome un puntaje de 3 si el valor es 'bueno'
      const option = dynamicSelectOptions.modeloVehiculoOptions.find(o => parseInt(o.value) === id);
      if (option && option.score) {
          return option.score;
      }
      return 0;
    };


    // 1. Verificar Campos Esenciales para el rechazo
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

    // 2. Calcular la Puntuación para los campos de "Tipo de Servicio"
    if (!vehicleRejected) {
      for (const field of scoringSchema.scored) {
        const value = inspectionData[field.key as keyof typeof initialInspectionData];
        if (field.type === "select" && typeof value === "string" && value !== "0") {
          const idAsNumber = parseInt(value, 10);
          // Busca la opción correspondiente en las opciones dinámicas
          const selectedOption = field.options.find(
            (option) => parseInt(option.value) === idAsNumber,
          );
          if (selectedOption?.score !== undefined) {
            currentScore += selectedOption.score;
          }
        }
      }
    }

    // 3. Determinar la Clasificación (TEXTO y ID)
    let vehicleClassification = "N/A";
    let vehicleClassificationId = 0;
    if (vehicleRejected) {
      vehicleClassification = "RECHAZADO";
    } else {
      const allScoredFieldsSelected = scoringSchema.scored.every(
        (field) => inspectionData[field.key as keyof typeof initialInspectionData] !== "0",
      );
      if (!allScoredFieldsSelected) {
        vehicleClassification = "PENDIENTE DE CLASIFICAR";
      } else {
        // Lógica de clasificación usando el puntaje total
        if (currentScore < 9) {
          vehicleClassification = "ESCENCIAL";
          vehicleClassificationId = 1;
        } else if (currentScore >= 9 && currentScore < 18) {
          vehicleClassification = "SELECTO";
          vehicleClassificationId = 2;
        } else if (currentScore >= 18) { // Regla ajustada para PRIME
          vehicleClassification = "PRIME";
          vehicleClassificationId = 3;
        } else {
          vehicleClassification = "NO CLASIFICADO";
          vehicleClassificationId = 0;
        }
      }
    }
    return {
      isRejected: vehicleRejected,
      classification: vehicleClassification,
      classificationId: vehicleClassificationId,
      score: currentScore,
      totalPossibleScore: maxPossibleScore,
    };
  }, [inspectionData, scoringSchema, dynamicSelectOptions]);

  // --- Efectos de Carga de Datos ---
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
                tramite.IdTramite !== null && tramite.IdTramite !== undefined && String(tramite.IdTramite) !== "",
            )
            .map((tramite: any) => ({
              value: String(tramite.IdTramite),
              label: tramite.Tramite,
            }));
          setTramiteOptions([
            { value: "invalid-selection", label: "Seleccione aquí" },
            ...tramites,
          ]);
        } else {
          console.error("Error: La respuesta de trámites no es un array válido.", response.data);
          setTramiteOptions([{ value: "invalid-selection", label: "Seleccione aquí" }]);
        }
      } catch (error: any) {
        console.error("Error al cargar trámites:", error);
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

  // CORRECCIÓN: El useEffect para cargar datos del concesionario depende de idConcesionParam
  // y toast.
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
          console.error("Error al cargar concesionario/autorización:", err);
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

  // CORRECCIÓN: Este es el useEffect que carga las opciones. Se ajustó para coincidir con la API.
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
              score: item.Puntuacion,
            })),
            cinturonesSeguridadTipoOptions: data.CinturonesSeguridad.map((item: any) => ({
              value: String(item.CinturonId),
              label: item.Cantidad,
              score: item.Puntuacion,
            })),
            modeloVehiculoOptions: data.ModeloVehiculo.map((item: any) => ({
              value: String(item.ModeloId),
              label: item.RangoAnio,
              score: item.Puntuacion,
            })),
            tapiceriaAsientosOptions: data.TapiceriaAsientos.map((item: any) => ({
              value: String(item.TapiceriaId),
              label: item.Material,
              score: item.Puntuacion,
            })),
            tiposFrenoOptions: data.TiposFreno.map((item: any) => ({
              value: String(item.FrenoId),
              label: item.TipoFreno,
              score: item.Puntuacion,
            })),
            tipoVehiculoOptions: data.TipoVehiculo.map((item: any) => ({
              value: String(item.TipoId),
              label: item.Tipo,
              score: item.Puntuacion,
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
        });
        const typesArray = response.data;
        if (!Array.isArray(typesArray)) {
          console.error(
            "Error: La respuesta de tipos de imagen no es un array o no contiene una propiedad 'data' que sea un array.",
            response.data,
          );
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
              type.IdTipoImagen !== null && type.IdTipoImagen !== undefined && String(type.IdTipoImagen) !== "",
          )
          .map((type: any) => ({
            value: String(type.IdTipoImagen), // Ensure value is a string, e.g., "1", "2"
            label: type.TipoImagen,
          }));
        setFetchedImageTypes(types);
      } catch (error) {
        console.error("Error al obtener tipos de imagen:", error);
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

  // Limpieza de URLs de objetos
  useEffect(() => {
    return () => {
      selectedImages.forEach((img) => {
        if (img.file && img.previewUrl) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, [selectedImages]);

  // --- Handlers de Eventos ---
  const handleFieldChange = (
    field: keyof typeof initialInspectionData,
    value: boolean | string,
  ) => {
    setInspectionData((prev) => ({ ...prev, [field]: value }));
    if (
      typeof value === "boolean" &&
      field !== "aprobarRevistaVehicular" &&
      value === false
    ) {
      setCheckAllEssential(false);
    }
  };

  const handleCheckAllEssential = (checked: boolean) => {
    setCheckAllEssential(checked);
    const newInspectionData = { ...initialInspectionData };
    scoringSchema.essential.forEach((field) => {
      if (field.type === "checkbox") {
        (newInspectionData as any)[field.key] = checked;
      } else if (field.type === "select-essential") {
        (newInspectionData as any)[field.key] = checked ? "1" : "0";
      }
    });
    setInspectionData(newInspectionData);
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
            fetchedImageTypes.find((t: any) => t.value === newTypeValue)
              ?.label || newTypeValue;
          let extension = "";
          if (img.file?.name) {
            extension = img.file.name.split(".").pop() || "";
          } else if (img.previewUrl.startsWith("data:image/jpeg")) {
            extension = "jpg";
          } else if (img.previewUrl.startsWith("data:image/png")) {
            extension = "png";
          }
          const safeType = selectedTypeLabel
            .replace(/\s+/g, "_")
            .toLowerCase();
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
        // Lógica para eliminar de la API
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
      console.error("Error al eliminar la imagen:", error);
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
    // Validación de campos
    if (!idConcesionParam || !concesionarioData) {
      toast({
        title: "Error de validación",
        description: "No se encontraron datos de la concesión.",
        variant: "destructive",
      });
      return;
    }
    if (selectedTramite === "invalid-selection") {
      toast({
        title: "Error de validación",
        description: "Por favor, seleccione un tipo de trámite.",
        variant: "destructive",
      });
      return;
    }

    // Determinar si hay imágenes sin tipo asignado
    const imagesWithoutType = selectedImages.some(
      (img) => img.type === "" || img.type === "0",
    );
    if (imagesWithoutType) {
      toast({
        title: "Error de validación",
        description: "Por favor, asigna un tipo a todas las imágenes seleccionadas.",
        variant: "destructive",
      });
      return;
    }

    // Mostrar el modal de confirmación
    setConfirmSave(true);
  };

  const handleFinalSave = async () => {
    setIsSubmitting(true);
    setConfirmSave(false);
    try {
      const formData = new FormData();

      const inspectionPayload = {
        IdConcesion: concesionarioData?.IdConcesion,
        Observaciones: observaciones,
        Aprobado: !isRejected, // La aprobación se basa en la lógica del useMemo
        IdTramite: selectedTramite,
        IdClasificacion: classificationId,
        Puntuacion: score,
      };

      formData.append("revistavehicular", JSON.stringify(inspectionPayload));

      // Adjuntar los campos de la inspección
      const inspectionDetails = {
        ...inspectionData,
        aprobarRevistaVehicular: !isRejected,
      };
      formData.append("revistadetalles", JSON.stringify(inspectionDetails));

      // Adjuntar las imágenes
      selectedImages.forEach((img) => {
        if (img.file) {
          formData.append(
            "imagenes",
            img.file,
            JSON.stringify({
              customName: img.customName,
              type: img.type,
              originalName: img.file.name,
            }),
          );
        }
      });

      const response = await apiClient("/revista", {
        method: "POST",
        data: formData,
        withCredentials: true,
      });

      if (response) {
        toast({
          title: "Inspección guardada",
          description: "La revista vehicular se ha guardado correctamente.",
        });
        setInspectionResultAlert({
          isOpen: true,
          isRejected: isRejected,
          classification: classification,
          classificationId: classificationId,
          score: score,
          totalPossibleScore: totalPossibleScore,
        });
        // Limpiar el formulario
        setInspectionData(initialInspectionData);
        setObservaciones("");
        setSelectedTramite("invalid-selection");
        setSelectedImages([]);
      }
    } catch (err: any) {
      console.error("Error al guardar la inspección:", err);
      toast({
        title: "Error al guardar",
        description: `Ocurrió un error al guardar la inspección: ${err.response?.data?.error || err.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // El resto del componente...

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Regresar
        </Button>
        <h1 className="text-2xl font-bold">
          Inspección de Revista Vehicular
        </h1>
        <div className="w-24" />
      </div>

      <div className="mb-6 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
        <div className="flex items-start">
          <TriangleAlert className="mr-2 mt-1 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-bold">Información Importante:</p>
            <p>
              Todos los campos marcados como{" "}
              <span className="font-bold text-red-500">Esenciales</span> deben
              ser aprobados (Check o SI:BIEN) para que la inspección no sea
              rechazada. El vehículo será calificado en base a los campos de{" "}
              <span className="font-bold text-blue-500">
                Puntuación por Características.
              </span>
            </p>
          </div>
        </div>
      </div>

      {isLoadingConcesion ? (
        <Card className="flex h-64 items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        </Card>
      ) : concesionarioData ? (
        <>
          <Card className="mb-6 border-blue-500">
            <CardHeader>
              <CardTitle className="text-blue-600">
                <Car className="mr-2 inline-block h-6 w-6" />
                Datos del Vehículo y Concesión
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm font-semibold">Folio de Concesión:</p>
                <p className="text-lg font-bold">
                  {concesionarioData.Folio}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold">Tipo de Servicio:</p>
                <p>{concesionarioData.TipoServicio}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Propietario (ID):</p>
                <p>{concesionarioData.Propietario}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Placa Actual:</p>
                <p>{concesionarioData.Placa}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Municipio Autorizado:</p>
                <p>{concesionarioData.MunicipioAutorizado}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Modalidad:</p>
                <p>{concesionarioData.Modalidad}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShieldCheck className="mr-2 h-6 w-6 text-green-600" />
                  Inspección Detallada
                </CardTitle>
                <CardDescription>
                  Verifique cada uno de los elementos del vehículo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-red-500">
                    Campos Esenciales para Aprobación
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="check-all"
                      checked={checkAllEssential}
                      onCheckedChange={handleCheckAllEssential}
                    />
                    <Label htmlFor="check-all" className="font-semibold">
                      Marcar todos
                    </Label>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {scoringSchema.essential.map((field) => (
                    <div
                      key={field.key}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <Label htmlFor={field.key} className="text-sm">
                        {field.label}
                      </Label>
                      {field.type === "checkbox" ? (
                        <Checkbox
                          id={field.key}
                          checked={
                            inspectionData[
                            field.key as keyof typeof initialInspectionData
                            ] as boolean
                          }
                          onCheckedChange={(checked) =>
                            handleFieldChange(
                              field.key as keyof typeof initialInspectionData,
                              !!checked,
                            )
                          }
                        />
                      ) : (
                        <Select
                          value={
                            inspectionData[
                            field.key as keyof typeof initialInspectionData
                            ] as string
                          }
                          onValueChange={(value) =>
                            handleFieldChange(
                              field.key as keyof typeof initialInspectionData,
                              value,
                            )
                          }
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Seleccione" />
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

                <div className="my-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-blue-500">
                      Puntuación por Características
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsScoringLogicModalOpen(true)}
                    >
                      <Lightbulb className="mr-2 h-4 w-4" /> Lógica
                    </Button>
                  </div>

                  {isLoadingDynamicOptions ? (
                    <div className="flex h-32 items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {scoringSchema.scored.map((field) => (
                        <div
                          key={field.key}
                          className="flex items-center justify-between rounded-md border p-3"
                        >
                          <Label htmlFor={field.key} className="text-sm">
                            {field.label}
                          </Label>
                          <Select
                            value={
                              inspectionData[
                              field.key as keyof typeof initialInspectionData
                              ] as string
                            }
                            onValueChange={(value) =>
                              handleFieldChange(
                                field.key as keyof typeof initialInspectionData,
                                value,
                              )
                            }
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Seleccione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Seleccione...</SelectItem>
                              {field.options.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="mb-2 font-semibold">Observaciones</h3>
                  <Textarea
                    placeholder="Escriba aquí las observaciones sobre la inspección..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Columna Derecha */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="mr-2 h-6 w-6" />
                    Resultado de Clasificación
                  </CardTitle>
                  <CardDescription>
                    La calificación se actualiza automáticamente.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-xl font-bold">
                      Puntaje:{" "}
                      <span className="text-blue-600">
                        {score}
                      </span>
                      {" / "}
                      {totalPossibleScore}
                    </p>
                    <p
                      className={`mt-2 text-3xl font-extrabold ${isRejected ? "text-red-600" : "text-green-600"
                        }`}
                    >
                      {classification}
                    </p>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="aprobacion-final" className="font-semibold">
                      Aprobar Revista Vehicular
                    </Label>
                    <div className="mt-2 flex items-center space-x-2">
                      <Checkbox
                        id="aprobacion-final"
                        checked={!isRejected}
                        disabled
                      />
                      <span className="text-sm">
                        La aprobación se basa en los campos esenciales.
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="tramite-select" className="font-semibold">
                      Tipo de Trámite a realizar
                    </Label>
                    <Select
                      value={selectedTramite}
                      onValueChange={setSelectedTramite}
                      disabled={isLoadingTramites}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Seleccione el trámite..." />
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileImage className="mr-2 h-6 w-6" />
                    Imágenes de la Inspección
                  </CardTitle>
                  <CardDescription>
                    Adjunte al menos una imagen de la revista.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                      variant="outline"
                    >
                      <Upload className="mr-2 h-4 w-4" /> Subir Imágenes
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {selectedImages.map((img) => (
                      <div
                        key={img.id}
                        className="relative overflow-hidden rounded-md border p-2"
                      >
                        <Image
                          src={img.previewUrl}
                          alt="Previsualización"
                          width={200}
                          height={200}
                          className="h-32 w-full object-cover"
                        />
                        <div className="mt-2">
                          <Label className="text-xs">
                            Tipo de Imagen:
                          </Label>
                          <Select
                            value={img.type}
                            onValueChange={(newType) =>
                              handleTypeChange(img.id, newType)
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Seleccione tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              {fetchedImageTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute right-1 top-1 h-6 w-6"
                          onClick={() =>
                            handleDeleteImage(
                              img.id,
                              img.idImagenRevistaVehicular,
                            )
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/panel/concesiones")}
              disabled={isSubmitting}
            >
              <XCircle className="mr-2 h-4 w-4" /> Cancelar
            </Button>
            <Button
              onClick={handleSaveInspection}
              disabled={isSubmitting || isRejected}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" /> Guardar Inspección
            </Button>
          </div>
        </>
      ) : (
        <Card className="flex h-64 items-center justify-center">
          <p className="text-center text-lg text-gray-500">
            No hay datos de concesión para mostrar.
          </p>
        </Card>
      )}

      {/* Alerta de confirmación antes de guardar */}
      <AlertDialog open={confirmSave} onOpenChange={setConfirmSave}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <ClipboardCheck className="mr-2 h-6 w-6" /> ¿Confirmar y Guardar
              Inspección?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Una vez guardada, la inspección no podrá ser modificada. El
              resultado final es:
            </AlertDialogDescription>
            <div className="my-4 rounded-md bg-gray-100 p-4 text-center dark:bg-gray-800">
              <p className="text-lg font-bold">
                Clasificación:{" "}
                <span
                  className={
                    isRejected ? "text-red-500" : "text-green-500"
                  }
                >
                  {classification}
                </span>
              </p>
              {!isRejected && (
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Puntaje: {score} de {totalPossibleScore}
                </p>
              )}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleFinalSave} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Guardar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de lógica de puntuación */}
      <AlertDialog
        open={isScoringLogicModalOpen}
        onOpenChange={setIsScoringLogicModalOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <Lightbulb className="mr-2 h-6 w-6" /> Lógica de Puntuación
            </AlertDialogTitle>
            <AlertDialogDescription>
              La puntuación del vehículo se calcula sumando los puntos de cada
              característica en los campos de "Puntuación por Características".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {dynamicSelectOptions.clasificacionOptions.map((clasif) => {
              const scoreRange =
                clasif.label === "ESCENCIAL"
                  ? "0-8 puntos"
                  : clasif.label === "SELECTO"
                    ? "9-17 puntos"
                    : clasif.label === "PRIME"
                      ? "18+ puntos"
                      : "N/A";
              return (
                <Card key={clasif.value} className="p-4">
                  <CardTitle className="mb-2 text-base">
                    {clasif.label}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Rango de Puntuación: {scoreRange}
                  </CardDescription>
                </Card>
              );
            })}
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsScoringLogicModalOpen(false)}>
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alerta de resultado final */}
      {inspectionResultAlert?.isOpen && (
        <AlertDialog
          open={inspectionResultAlert.isOpen}
          onOpenChange={(open) =>
            setInspectionResultAlert(open ? inspectionResultAlert : null)
          }
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                {inspectionResultAlert.isRejected ? (
                  <XCircle className="mr-2 h-6 w-6 text-red-500" />
                ) : (
                  <BadgeCheck className="mr-2 h-6 w-6 text-green-500" />
                )}
                Inspección Finalizada
              </AlertDialogTitle>
              <AlertDialogDescription>
                La inspección ha sido guardada con el siguiente resultado:
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4 rounded-md bg-gray-100 p-4 text-center dark:bg-gray-800">
              <p className="text-xl font-bold">
                Clasificación:{" "}
                <span
                  className={
                    inspectionResultAlert.isRejected
                      ? "text-red-500"
                      : "text-green-500"
                  }
                >
                  {inspectionResultAlert.classification}
                </span>
              </p>
              {!inspectionResultAlert.isRejected && (
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Puntaje: {inspectionResultAlert.score} de{" "}
                  {inspectionResultAlert.totalPossibleScore}
                </p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => setInspectionResultAlert(null)}
              >
                Cerrar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Diálogo de confirmación de eliminación de imagen */}
      <AlertDialog
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <Trash2 className="mr-2 h-6 w-6 text-red-500" /> ¿Eliminar imagen?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible. ¿Estás seguro de que quieres eliminar
              esta imagen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}{" "}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}