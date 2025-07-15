'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Camera, Trash2, XCircle, FileImage, ClipboardCheck, Lightbulb, Car, Wrench, ShieldCheck, CheckSquare, Sparkles, ArrowLeft, Upload, Save, Loader2 as Loader } from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from "@/components/ui/progress";
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

interface SelectedImage {
  id: string;
  file?: File;
  type: string;
  previewUrl: string;
  customName?: string;
  idImagenRevistaVehicular?: number;
}

interface ImageType {
  value: string;
  label: string;
}

const initialInspectionData = {
  placaDelantera: true,
  placaTrasera: true,
  calcomaniaVerificacion: true,
  calcomaniaTenencia: true,
  pinturaCarroceria: true,
  estadoLlantas: true,
  defensas: true,
  vidrios: true,
  limpiadores: true,
  espejos: true,
  llantaRefaccion: true,
  parabrisasMedallon: true,
  claxon: true,
  luzBaja: true,
  luzAlta: true,
  cuartos: true,
  direccionales: true,
  intermitentes: true,
  stop: true,
  timbre: true,
  extinguidor: true,
  herramienta: true,
  sistemaFrenado: true,
  sistemaDireccion: true,
  sistemaSuspension: true,
  interiores: true,
  botiquin: true,
  cinturonSeguridad: true,
  imagenCromatica: true,
};

const fieldLabels: Record<keyof typeof initialInspectionData, string> = {
  placaDelantera: 'Placa Delantera',
  placaTrasera: 'Placa Trasera',
  calcomaniaVerificacion: 'Calcomanía de Verificación',
  calcomaniaTenencia: 'Calcomanía de Tenencia',
  pinturaCarroceria: 'Pintura y Carrocería',
  estadoLlantas: 'Estado de Llantas',
  defensas: 'Defensas',
  vidrios: 'Vidrios',
  limpiadores: 'Limpiaparabrisas',
  espejos: 'Espejos Laterales',
  llantaRefaccion: 'Llanta de Refacción',
  parabrisasMedallon: 'Parabrisas y Medallón',
  claxon: 'Claxon',
  luzBaja: 'Luz Baja',
  luzAlta: 'Luz Alta',
  cuartos: 'Luces de Cuartos',
  direccionales: 'Direccionales',
  intermitentes: 'Luces Intermitentes',
  stop: 'Luces de Stop',
  timbre: 'Timbre (si aplica)',
  extinguidor: 'Extinguidor',
  herramienta: 'Herramienta Básica',
  sistemaFrenado: 'Sistema de Frenado',
  sistemaDireccion: 'Sistema de Dirección',
  sistemaSuspension: 'Sistema de Suspensión',
  interiores: 'Interiores',
  botiquin: 'Botiquín de Primeros Auxilios',
  cinturonSeguridad: 'Cinturones de Seguridad',
  imagenCromatica: 'Imagen Cromática',
};

const apiToStateMap: Record<string, keyof typeof initialInspectionData> = {
  PlacaDelanteraVer: "placaDelantera",
  PlacaTraseraVer: "placaTrasera",
  CalcaVerificacionVer: "calcomaniaVerificacion",
  CalcaTenenciaVer: "calcomaniaTenencia",
  PinturaCarroceriaVer: "pinturaCarroceria",
  EstadoLlantasVer: "estadoLlantas",
  DefensasVer: "defensas",
  VidriosVer: "vidrios",
  LimpiadoresVer: "limpiadores",
  EspejosVer: "espejos",
  LlantaRefaccionVer: "llantaRefaccion",
  ParabrisasMedallonVer: "parabrisasMedallon",
  ClaxonVer: "claxon",
  LuzBajaVer: "luzBaja",
  LuzAltaVer: "luzAlta",
  CuartosVer: "cuartos",
  DireccionalesVer: "direccionales",
  IntermitentesVer: "intermitentes",
  StopVer: "stop",
  TimbreVer: "timbre",
  EstinguidorVer: "extinguidor",
  HerramientasVer: "herramienta",
  SistemaFrenadoVer: "sistemaFrenado",
  SistemaDireccionVer: "sistemaDireccion",
  SistemaSuspensionVer: "sistemaSuspension",
  InterioresVer: "interiores",
  BotiquinVer: "botiquin",
  CinturonSeguridadVer: "cinturonSeguridad",
  ImagenCromaticaVer: "imagenCromatica",
};

export default function InspeccionRevistaVehicularForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idRVParam = searchParams.get("idV");
  const [inspectionData, setInspectionData] = useState(initialInspectionData);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [observaciones, setObservaciones] = useState('');
  const [aprobarRevistaVehicular, setAprobarRevistaVehicular] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fetchedImageTypes, setFetchedImageTypes] = useState<ImageType[]>([]);
  const { toast } = useToast();
  const [imageToDelete, setImageToDelete] = useState<{ id: string, idImagenRevistaVehicular?: number } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Estados para animaciones de carga
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingImages, setIsSavingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchImageTypes = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/revista/tipos-imagen', {
          withCredentials: true,
        });

        const typesArray = response.data?.data;

        if (!Array.isArray(typesArray)) {
          console.error("Error: Image types response is not an array or does not contain a 'data' property that is an array.", response.data);
          setFetchedImageTypes([]);
          toast({
            title: "Error al cargar tipos de imagen",
            description: "Ocurrió un error al cargar los tipos de imagen. La lista estará vacía.",
            variant: "destructive",
          });
          return;
        }

        const types = typesArray.map((type: any) => ({
          value: String(type.IdTipoImagen),
          label: type.TipoImagen,
        }));
        setFetchedImageTypes(types);

      } catch (error) {
        console.error("Error fetching image types:", error);
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
    if (!idRVParam) return;

    const fetchInspeccionData = async () => {
      try {
        const inspectionRes = await axios.get(`http://localhost:3000/api/revista/${idRVParam}`, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });

        console.log("Fetched inspection data:", inspectionRes.data);
        if (inspectionRes.data?.data) {
          const apiData = inspectionRes.data.data;
          const newInspectionData = { ...initialInspectionData };
          Object.entries(apiToStateMap).forEach(([apiKey, stateKey]) => {
            const value = apiData[apiKey];
            newInspectionData[stateKey] = value === true || value === 1;
          });
          setInspectionData(newInspectionData);
          if (typeof apiData.Observaciones === "string") setObservaciones(apiData.Observaciones);
          setAprobarRevistaVehicular(apiData.Aprobado === true || apiData.Aprobado === 1);
        }

        const imagesRes = await axios.get(`http://localhost:3000/api/revista/${idRVParam}/imagenes`, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });
        console.log("Fetched images:", imagesRes.data);

        if (imagesRes.data?.data && Array.isArray(imagesRes.data.data)) {
          const existingImages = imagesRes.data.data.map((img: any) => ({
            id: String(img.IdImagen),
            idImagenRevistaVehicular: img.IdRevistaVehicular,
            type: String(img.TipoImagen),
            previewUrl: `data:${img.MimeType};base64,${img.ImagenBase64}`,
            customName: img.NombreArchivo,
            file: undefined
          }));
          setSelectedImages(existingImages);
        }

      } catch (error: any) {
        console.error("Error fetching inspection or images:", error);
        toast({
          title: "Error al cargar detalles de la inspección",
          description: `Ocurrió un error: ${error.response?.data?.error || error.message}`,
          variant: "destructive",
        });
      }
    };

    fetchInspeccionData();
  }, [idRVParam, toast]);

  useEffect(() => {
    return () => {
      selectedImages.forEach(img => {
        if (img.file && img.previewUrl) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, [selectedImages]);

  const toggleField = (field: keyof typeof initialInspectionData) => {
    setInspectionData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages: SelectedImage[] = Array.from(files).map(file => ({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        file: file,
        type: '',
        previewUrl: URL.createObjectURL(file),
      }));
      setSelectedImages(prev => [...prev, ...newImages]);
      toast({
        title: "Imágenes seleccionadas",
        description: `${newImages.length} imagen(es) seleccionada(s).`,
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTypeChange = (id: string, newTypeValue: string) => {
    setSelectedImages(prev =>
      prev.map(img => {
        if (img.id === id) {
          const selectedTypeLabel = fetchedImageTypes.find(t => t.value === newTypeValue)?.label || newTypeValue;
          let extension = '';
          if (img.file?.name) {
            extension = img.file.name.split('.').pop() || '';
          } else if (img.previewUrl.startsWith('data:image/jpeg')) {
            extension = 'jpg';
          } else if (img.previewUrl.startsWith('data:image/png')) {
            extension = 'png';
          }
          const safeType = selectedTypeLabel.replace(/\s+/g, '_').toLowerCase();
          const customName = `inspeccion_${safeType}${extension ? '.' + extension : ''}`;
          return { ...img, type: newTypeValue, customName };
        }
        return img;
      })
    );
  };

  const calculatePercentage = () => {
    const total = Object.keys(initialInspectionData).length;
    const checked = Object.values(inspectionData).filter(val => val).length;
    return Math.round((checked / total) * 100);
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage < 30) return "bg-red-500";
    if (percentage < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleRemoveImage = async (idImagen: string, idImagenRevistaVehicular?: number) => {
    console.log('--- Starting handleRemoveImage Process ---');
    console.log('Received IdImagen:', idImagen);
    console.log('Received idImagenRevistaVehicular:', idImagenRevistaVehicular);

    const imageToRemove = selectedImages.find(img =>
      img.idImagenRevistaVehicular
        ? img.idImagenRevistaVehicular === idImagenRevistaVehicular
        : img.id === idImagen
    );

    if (imageToRemove?.file && imageToRemove.previewUrl) {
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }

    setImageToDelete({
      id: idImagen,
      idImagenRevistaVehicular: idImagenRevistaVehicular || imageToRemove?.idImagenRevistaVehicular
    });
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteImage = async () => {
    setIsDeleting(true);
    console.log('--- Starting confirmDeleteImage Process ---');
    console.log('Current imageToDelete state:', imageToDelete);

    if (!imageToDelete) {
      toast({
        title: "Error al eliminar",
        description: "No se ha seleccionado ninguna imagen para eliminar",
        variant: "destructive",
      });
      setIsDeleting(false);
      return;
    }

    try {
      if (imageToDelete.idImagenRevistaVehicular) {
        await axios.delete(`http://localhost:3000/api/revista/imagen/${imageToDelete.id}`, {
          withCredentials: true,
        });
      }

      setSelectedImages(prev =>
        prev.filter(img =>
          imageToDelete.idImagenRevistaVehicular
            ? img.idImagenRevistaVehicular !== imageToDelete.idImagenRevistaVehicular
            : img.id !== imageToDelete.id
        )
      );

      toast({
        title: "Imagen eliminada",
        description: imageToDelete.idImagenRevistaVehicular
          ? "Imagen eliminada del servidor y localmente."
          : "Imagen eliminada localmente.",
      });

    } catch (error: any) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error al eliminar imagen",
        description: `Error: ${error.response?.data?.error || error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleteModalOpen(false);
      setImageToDelete(null);
      setIsDeleting(false);
    }
  };

  const cancelDeleteImage = () => {
    setIsDeleteModalOpen(false);
    setImageToDelete(null);
  };

  const handleClearAllLocalImages = () => {
    selectedImages.forEach(img => {
      if (img.file) URL.revokeObjectURL(img.previewUrl);
    });
    setSelectedImages(prev => prev.filter(img => img.idImagenRevistaVehicular !== undefined));
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({
      title: "Imágenes vaciadas localmente",
      description: "Todas las imágenes han sido eliminadas de la vista previa. Las imágenes ya guardadas en el servidor *no* se borran con este botón.",
      variant: "default",
    });
  };

  const handleGoBack = () => {
    router.back();
  };

  const uploadNewImages = async (targetIdRV: number) => {
    setIsUploading(true);
    const newImagesToUpload = selectedImages.filter(img => img.file && !img.idImagenRevistaVehicular);

    if (newImagesToUpload.length === 0) {
      setIsUploading(false);
      return { success: true, message: "No hay imágenes nuevas para subir." };
    }

    const uploadPromises = newImagesToUpload.map(async (img) => {
      if (!img.file || !img.type) {
        console.warn(`Skipping image upload: missing file or type for ID ${img.id}`);
        toast({
          title: "Imagen no subida",
          description: `Falta tipo o archivo para ${img.customName || img.file?.name || 'una imagen'}.`,
          variant: "destructive",
        });
        return { success: false, id: img.id, message: `Missing data for image ${img.id}` };
      }

      const formData = new FormData();
      formData.append('imagen', img.file, img.customName || img.file.name);
      formData.append('idRV', String(targetIdRV));
      formData.append('tipoImagen', img.type);

      try {
        const uploadResponse = await axios.post('http://localhost:3000/api/revista/imagen', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });
        return { success: true, id: img.id, backendId: uploadResponse.data.idImagen };
      } catch (uploadError: any) {
        console.error(`Error uploading image ${img.customName || img.file.name}:`, uploadError);
        toast({
          title: "Error al subir imagen",
          description: `No se pudo subir ${img.customName || img.file?.name}: ${uploadError.response?.data?.error || uploadError.message}`,
          variant: "destructive",
        });
        return { success: false, id: img.id, message: `Upload failed for ${img.customName || img.file.name}: ${uploadError.response?.data?.error || uploadError.message}` };
      }
    });

    const results = await Promise.all(uploadPromises);
    const allSucceeded = results.every(r => r.success);

    if (allSucceeded) {
      setSelectedImages(prev => prev.map(img => {
        const result = results.find(r => r.id === img.id && r.success);
        return result && result.backendId ? { ...img, idImagenRevistaVehicular: result.backendId } : img;
      }));
      setIsUploading(false);
      return { success: true, message: "Todas las imágenes nuevas subidas correctamente." };
    } else {
      const failedCount = results.filter(r => !r.success).length;
      setIsUploading(false);
      return { success: false, message: `${failedCount} imagen(es) fallaron al subir.` };
    }
  };

  const handleSaveNewImages = async () => {
    setIsSavingImages(true);
    if (!idRVParam) {
      toast({
        title: "Error",
        description: "Primero debes guardar la inspección general para poder guardar imágenes.",
        variant: "destructive",
      });
      setIsSavingImages(false);
      return;
    }

    const newImagesToUploadCount = selectedImages.filter(img => img.file && !img.idImagenRevistaVehicular).length;
    if (newImagesToUploadCount === 0) {
      toast({
        title: "Información",
        description: "No hay imágenes nuevas para guardar.",
      });
      setIsSavingImages(false);
      return;
    }

    const allTypesSelected = selectedImages
      .filter(img => img.file && !img.idImagenRevistaVehicular)
      .every(img => img.type !== '');
    if (!allTypesSelected) {
      toast({
        title: "Error de validación",
        description: "Por favor, selecciona un tipo para CADA imagen nueva antes de guardar.",
        variant: "destructive",
      });
      setIsSavingImages(false);
      return;
    }

    toast({
      title: "Guardando imágenes...",
      description: "Subiendo las nuevas imágenes al servidor.",
    });

    const uploadResult = await uploadNewImages(parseInt(idRVParam, 10));
    if (uploadResult.success) {
      toast({
        title: "Imágenes guardadas",
        description: "Todas las imágenes nuevas se subieron correctamente.",
      });
    } else {
      toast({
        title: "Advertencia",
        description: `Algunas imágenes no se pudieron guardar: ${uploadResult.message}`,
        variant: "destructive",
      });
    }
    setIsSavingImages(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newImagesWithoutType = selectedImages.filter(img => img.file && !img.idImagenRevistaVehicular && img.type === '');
    if (newImagesWithoutType.length > 0) {
      toast({
        title: "Error de validación",
        description: "Por favor, selecciona un tipo para CADA imagen nueva antes de enviar el formulario.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        idConcesion: 1,
        idPropietario: 1,
        idTramite: 1,
        idVehiculo: idRVParam ? parseInt(idRVParam, 10) : 0,
        placa: "ABC-123",
        propietario: "Nombre del Propietario",
        placaDelanteraVer: inspectionData.placaDelantera,
        placaTraseraVer: inspectionData.placaTrasera,
        calcaVerificacionVer: inspectionData.calcomaniaVerificacion,
        calcaTenenciaVer: inspectionData.calcomaniaTenencia,
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
        estinguidorVer: inspectionData.extinguidor,
        herramientasVer: inspectionData.herramienta,
        sistemaFrenadoVer: inspectionData.sistemaFrenado,
        sistemaDireccionVer: inspectionData.sistemaDireccion,
        sistemaSuspensionVer: inspectionData.sistemaSuspension,
        interioresVer: inspectionData.interiores,
        botiquinVer: inspectionData.botiquin,
        cinturonSeguridadVer: inspectionData.cinturonSeguridad,
        observaciones: observaciones,
        aprobado: aprobarRevistaVehicular,
        imagenCromaticaVer: inspectionData.imagenCromatica,
        folio: "REV-" + Date.now(),
      };

      const response = await axios.post('http://localhost:3000/api/revista', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      if (response.data.success) {
        const savedIdRV = response.data.idRV;
        toast({
          title: "Inspección guardada",
          description: `Inspección guardada con éxito. ID de Revista: ${savedIdRV}`,
        });

        if (!idRVParam) {
          router.push(`/ruta-de-tu-formulario?idV=${savedIdRV}`);
        }

        const uploadResult = await uploadNewImages(savedIdRV);
        if (uploadResult.success) {
          toast({
            title: "Imágenes subidas",
            description: "Todas las imágenes nuevas se subieron correctamente.",
          });
        } else {
          toast({
            title: "Advertencia",
            description: `Inspección guardada, pero ${uploadResult.message}`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error al guardar inspección",
          description: `Ocurrió un error: ${response.data.error || 'Error desconocido'}`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error submitting inspection:", error);
      toast({
        title: "Error al enviar inspección",
        description: `Ocurrió un error: ${error.response?.data?.error || error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const percentage = calculatePercentage();
  const progressBarColor = getProgressBarColor(percentage);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <Button onClick={handleGoBack} variant="outline" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Inspección de Revista Vehicular</h1>
        <div className="w-24"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <ClipboardCheck className="mr-2 h-5 w-5 text-blue-600" /> Detalles de la Inspección
            </CardTitle>
            <CardDescription>
              Verifica cada aspecto del vehículo y marca su estado.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(fieldLabels).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={inspectionData[key as keyof typeof initialInspectionData]}
                  onCheckedChange={() => toggleField(key as keyof typeof initialInspectionData)}
                />
                <Label htmlFor={key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {label}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Lightbulb className="mr-2 h-5 w-5 text-yellow-600" /> Observaciones
            </CardTitle>
            <CardDescription>
              Añade cualquier comentario o nota adicional sobre la inspección.
            </CardDescription>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FileImage className="mr-2 h-5 w-5 text-green-600" /> Imágenes
            </CardTitle>
            <CardDescription>
              Sube las imágenes requeridas para la inspección. Puedes guardar las imágenes nuevas por separado si ya existe la inspección, o eliminarlas individualmente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept="image/jpeg,image/png"
                className="flex-grow"
              />
              <Button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="flex-shrink-0"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Seleccionar Imágenes
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                onClick={handleClearAllLocalImages} 
                variant="outline" 
                className="flex-shrink-0"
              >
                <XCircle className="mr-2 h-4 w-4" /> 
                Limpiar Todo (Solo Local)
              </Button>
              <Button
                type="button"
                onClick={handleSaveNewImages}
                className="flex-shrink-0"
                disabled={!idRVParam || selectedImages.filter(img => img.file && !img.idImagenRevistaVehicular).length === 0 || isSavingImages}
              >
                {isSavingImages ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Imágenes (Nuevas)
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedImages.map((image) => {
                const handleClick = () => {
                  console.group('Objeto imagen seleccionado para eliminar');
                  console.log('Imagen completa:', image);
                  console.log('ID:', image.id);
                  console.log('ID Revista Vehicular:', image.idImagenRevistaVehicular);
                  console.log('Tipo:', image.type);
                  console.log('Nombre:', image.customName || image.file?.name);
                  console.log('¿Es imagen local?:', !!image.file);
                  console.groupEnd();

                  handleRemoveImage(image.id, image.idImagenRevistaVehicular);
                };

                return (
                  <Card key={image.id || `img-${Math.random().toString(36).substr(2, 9)}`} className="relative group">
                    <CardContent className="p-2">
                      <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                        <Image
                          src={image.previewUrl}
                          alt={image.customName || image.file?.name || 'Imagen seleccionada'}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={handleClick}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2 text-center text-sm text-gray-600 truncate">
                        {image.customName || image.file?.name || 'Sin nombre'}
                      </div>
                      <Select value={image.type} onValueChange={(value) => handleTypeChange(image.id, value)}>
                        <SelectTrigger className="w-full mt-2">
                          <SelectValue placeholder="Selecciona tipo de imagen" />
                        </SelectTrigger>
                        <SelectContent>
                          {fetchedImageTypes.length > 0 ? (
                            fetchedImageTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>Cargando tipos de imagen...</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <CheckSquare className="mr-2 h-5 w-5 text-purple-600" /> Resultado Final
            </CardTitle>
            <CardDescription>
              Determina si la revista vehicular es aprobada o no.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <Checkbox
                id="aprobarRevista"
                checked={aprobarRevistaVehicular}
                onCheckedChange={(checked) => setAprobarRevistaVehicular(Boolean(checked))}
              />
              <Label htmlFor="aprobarRevista" className="text-base font-medium">
                Aprobar Revista Vehicular
              </Label>
              <Separator orientation="vertical" className="h-6 mx-4 hidden sm:block" />
              <div className="flex items-center text-sm text-gray-700">
                <Sparkles className="mr-1 h-4 w-4 text-blue-500" />
                Progreso de Verificación: <span className="font-semibold ml-1">{percentage}%</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <Progress value={percentage} className={`h-2.5 ${progressBarColor}`} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleGoBack}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Inspección'
            )}
          </Button>
        </div>
      </form>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar esta imagen?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción {imageToDelete?.idImagenRevistaVehicular ? "eliminará la imagen permanentemente del servidor" : "eliminará la imagen localmente"} y no podrá recuperarse.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteImage}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteImage}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}