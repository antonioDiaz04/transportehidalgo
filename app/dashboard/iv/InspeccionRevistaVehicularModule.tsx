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

interface ConcesionarioData {
  IdConcesion: number;
  Folio: string; // Este es el folio del concesionario/autorización
  TipoServicio: string;
  TipoPlaca: string;
  Mnemotecnia: string;
  Modalidad: string;
  MunicipioAutorizado: string;
  ClaseUnidad: string | null; // Puede ser null en tu ejemplo
  VigenciaAnios: number | null; // Puede ser null en tu ejemplo
  SeriePlacaActual: string; // La placa actual del vehículo
  FechaExpedicion: string;
  Observaciones: string;
  // ** Campos del vehículo, mapeados a las propiedades de la respuesta original **
  IdVehiculoActual: string; // Mapeado de IdVehiculoActual en la respuesta
  Placa: string; // Mapeado de SeriePlacaActual en la respuesta
  Propietario: string; // Mapeado de IdConcesionarioActual o IdPropietario en la respuesta
  FolioVehiculo: string; // Mapeado de NumeroExpediente en la respuesta
}

const initialInspectionData = {
  placaDelantera: true,
  placaTrasera: true,
  calcaVerificacion: true,
  calcaTenencia: true,
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
  estinguidor: true,
  herramientas: true,
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
  calcaVerificacion: 'Calcomanía de Verificación',
  calcaTenencia: 'Calcomanía de Tenencia',
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
  estinguidor: 'estinguidor',
  herramientas: 'herramientas Básica',
  sistemaFrenado: 'Sistema de Frenado',
  sistemaDireccion: 'Sistema de Dirección',
  sistemaSuspension: 'Sistema de Suspensión',
  interiores: 'Interiores',
  botiquin: 'Botiquín de Primeros Auxilios',
  cinturonSeguridad: 'Cinturones de Seguridad',
  imagenCromatica: 'Imagen Cromática',
};


export default function InspeccionRevistaVehicularForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idConcesionParam = searchParams.get("idC");
  const [inspectionData, setInspectionData] = useState(initialInspectionData);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [observaciones, setObservaciones] = useState('');
  const [aprobarRevistaVehicular, setAprobarRevistaVehicular] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fetchedImageTypes, setFetchedImageTypes] = useState<ImageType[]>([]);
  const { toast } = useToast();
  const [imageToDelete, setImageToDelete] = useState<{ id: string, idImagenRevistaVehicular?: number } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingImages, setIsSavingImages] = useState(false); // No se usa directamente para el botón de "Guardar nuevas imágenes" en esta versión, pero se mantiene si se planea una funcionalidad separada.
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [concesionarioData, setConcesionarioData] = useState<ConcesionarioData | null>(null);
  const [isLoadingConcesion, setIsLoadingConcesion] = useState(false);


  // Nuevo useEffect para cargar datos del concesionario automáticamente desde la URL
  useEffect(() => {
    const fetchConcesionarioData = async () => {
      if (idConcesionParam) {
        setIsLoadingConcesion(true);
        try {
          const { data } = await axios.get(`http://localhost:3000/api/concesion/autorizacion/${idConcesionParam}`, {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true
          });

          console.log("Respuesta de la API de concesionario/autorización:", data);

          if (data && data.data) { // Si la respuesta tiene una propiedad 'data'
            const apiData = data.data; // Accede a la propiedad 'data' dentro de la respuesta

            // Mapea los datos de la API a tu interfaz ConcesionarioData
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
              // Mapeo de los campos del vehículo desde la respuesta
              IdVehiculoActual: apiData.IdVehiculoActual,
              Placa: apiData.SeriePlacaActual, // La placa viene como SeriePlacaActual
              Propietario: apiData.IdConcesionarioActual || apiData.IdPropietario, // Usa IdConcesionarioActual o IdPropietario
              FolioVehiculo: apiData.Folio, // El folio del vehículo/expediente es NumeroExpediente
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


  // Efecto para cargar los tipos de imagen disponibles (Este sigue siendo necesario)
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

  // Limpieza de URLs de objetos cuando las imágenes seleccionadas cambian
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
          const customName = `inspeccion_${safeType}_${Date.now()}${extension ? '.' + extension : ''}`;
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
    console.log('Received IdImagen (local):', idImagen);
    console.log('Received idImagenRevistaVehicular (from DB):', idImagenRevistaVehicular);

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
        await axios.delete(`http://localhost:3000/api/revista/imagen/${imageToDelete.idImagenRevistaVehicular}`, {
          withCredentials: true,
        });
        toast({
          title: "Imagen eliminada",
          description: "Imagen eliminada del servidor y localmente.",
        });
      } else {
        toast({
          title: "Imagen eliminada",
          description: "Imagen eliminada localmente (no estaba en el servidor).",
        });
      }

      setSelectedImages(prev =>
        prev.filter(img =>
          imageToDelete.idImagenRevistaVehicular
            ? img.idImagenRevistaVehicular !== imageToDelete.idImagenRevistaVehicular
            : img.id !== imageToDelete.id
        )
      );

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
      description: "Las imágenes nuevas han sido eliminadas de la vista previa. Las imágenes ya guardadas en el servidor *no* se borran con este botón.",
      variant: "default",
    });
  };

  const handleGoBack = () => {
    router.back();
  };

  const uploadNewImages = async (targetIdRV: number) => {
    setIsUploading(true);
    const newImagesToUpload = selectedImages.filter(img => img.file && img.idImagenRevistaVehicular === undefined);

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

    toast({
      title: "Error",
      description: "Esta función solo se activa después de crear la inspección principal. Por favor, usa el botón 'Guardar Nueva Inspección'.",
      variant: "destructive",
    });
    setIsSavingImages(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!concesionarioData) {
      toast({
        title: "Error de datos",
        description: "Los datos del concesionario no se han cargado. Asegúrate de que el ID de concesión en la URL sea válido.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // ** Validar que los datos del vehículo estén presentes desde la respuesta del concesionario **
    // Ajustado para usar los nombres de propiedades correctos según tu API
    if (!concesionarioData.IdVehiculoActual || !concesionarioData.Placa || !concesionarioData.Propietario || !concesionarioData.FolioVehiculo) {
      toast({
        title: "Error de datos del vehículo",
        description: "Los datos del vehículo (ID, Placa, Propietario, Folio de Expediente) no se obtuvieron correctamente del concesionario. Por favor, verifica la respuesta del API.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const newImagesWithoutType = selectedImages.filter(img => img.file && img.idImagenRevistaVehicular === undefined && img.type === '');
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
        idConcesion: concesionarioData.IdConcesion,
        idPropietario: parseInt(concesionarioData.Propietario), // Convertir a número si es string
        idTramite: 1, // Este podría ser dinámico o fijo según tu lógica
        idVehiculo: parseInt(concesionarioData.IdVehiculoActual), // Convertir a número
        placa: concesionarioData.Placa,
        propietario: concesionarioData.Propietario,
        ...Object.keys(initialInspectionData).reduce((acc, key) => {
          const apiName = key + "Ver";
          acc[apiName] = inspectionData[key as keyof typeof initialInspectionData] ? 1 : 0;
          return acc;
        }, {} as Record<string, number | boolean>),
        observaciones: observaciones,
        aprobado: aprobarRevistaVehicular ? 1 : 0,
        folio: concesionarioData.FolioVehiculo, // Usar el FolioVehiculo que mapea a NumeroExpediente
      };

      console.log("Payload to send:", payload);

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
          description: `Inspección del vehículo ID ${concesionarioData.IdVehiculoActual} guardada con éxito. ID de Revista: ${savedIdRV}`,
        });

        const uploadResult = await uploadNewImages(savedIdRV);
        if (uploadResult.success) {
          toast({
            title: "Imágenes subidas",
            description: "Todas las imágenes nuevas se subieron correctamente.",
          });
          // Limpiar el formulario después de un guardado exitoso
          setInspectionData(initialInspectionData);
          setObservaciones('');
          setAprobarRevistaVehicular(false);
          setSelectedImages([]);
          setConcesionarioData(null);
          router.push(`/dashboard`); // Redirige al dashboard o a una página de éxito
        } else {
          toast({
            title: "Advertencia",
            description: `Inspección guardada, pero ${uploadResult.message}.`,
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
        <h1 className="text-2xl font-bold text-gray-800">Nueva Inspección de Revista Vehicular</h1>
        <div className="w-24"></div>
      </div>

      <Card className="mb-8">
        
        <CardContent>
          {isLoadingConcesion ? (
            <div className="flex items-center justify-center p-4">
              <Loader className="mr-2 h-6 w-6 animate-spin text-blue-500" />
              <p className="text-gray-600">Cargando datos del concesionario...</p>
            </div>
          ) : concesionarioData ? (
            <>

              <CardTitle className="flex items-center text-xl mt-6">
                <Car className="mr-2 h-5 w-5 text-blue-600" /> Datos del Vehículo Asociado
              </CardTitle>
              <CardDescription>
                Información del vehículo obtenida a través del ID de concesión.
              </CardDescription>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div>
                  <Label htmlFor="idVehiculo">ID del Vehículo</Label>
                  <Input id="idVehiculo" value={concesionarioData.IdVehiculoActual || 'N/A'} readOnly disabled />
                </div>
                <div>
                  <Label htmlFor="placaVehiculo">Placa del Vehículo</Label>
                  <Input id="placaVehiculo" value={concesionarioData.Placa || 'N/A'} readOnly disabled />
                </div>
                <div>
                  <Label htmlFor="propietarioVehiculo">Propietario del Vehículo</Label>
                  <Input id="propietarioVehiculo" value={concesionarioData.Propietario || 'N/A'} readOnly disabled />
                </div>
                <div>
                  <Label htmlFor="folioVehiculo">Folio del Expediente (Vehículo)</Label>
                  <Input id="folioVehiculo" value={concesionarioData.FolioVehiculo || 'N/A'} readOnly disabled />
                </div>
              </div>
              {(!concesionarioData.IdVehiculoActual || !concesionarioData.Placa || !concesionarioData.Propietario || !concesionarioData.FolioVehiculo) && (
                <p className="text-orange-500 text-sm mt-2">
                  Advertencia: Algunos datos clave del vehículo no se cargaron correctamente. Por favor, verifica la respuesta del API.
                </p>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-center p-4">
              Esperando un ID de Concesión válido en la URL para cargar la información.
            </p>
          )}
        </CardContent>
      </Card>

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
              Sube las imágenes requeridas para la inspección. Se guardarán junto con la inspección.
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
                disabled={isUploading || isSubmitting}
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
                <XCircle className="mr-2 h-4 w-4" /> Limpiar Imágenes Locales
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedImages.map((image) => (
                <Card key={image.id} className="relative group overflow-hidden">
                  <CardContent className="p-2">
                    <div className="w-full h-32 relative mb-2">
                      <Image
                        src={image.previewUrl}
                        alt={`Preview ${image.id}`}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                      />
                    </div>
                    <Label htmlFor={`select-${image.id}`} className="text-xs mb-1 block">Tipo de Imagen:</Label>
                    <Select
                      value={image.type}
                      onValueChange={(value) => handleTypeChange(image.id, value)}
                      disabled={isSubmitting || image.idImagenRevistaVehicular !== undefined}
                    >
                      <SelectTrigger id={`select-${image.id}`} className="w-full text-xs">
                        <SelectValue placeholder="Seleccionar Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {fetchedImageTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={() => handleRemoveImage(image.id, image.idImagenRevistaVehicular)}
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 rounded-full w-8 h-8 p-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isDeleting}
                    >
                      {isDeleting && imageToDelete?.id === image.id ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                    {image.idImagenRevistaVehicular && (
                      <span className="absolute bottom-2 left-2 text-xs text-white bg-blue-500 px-2 py-1 rounded-full">Guardada</span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            {selectedImages.filter(img => img.file && img.idImagenRevistaVehicular === undefined).length > 0 && (
              <p className="text-sm text-gray-500 mt-4">
                * Las imágenes nuevas se subirán cuando guardes la inspección principal.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <CheckSquare className="mr-2 h-5 w-5 text-purple-600" /> Resumen y Aprobación
            </CardTitle>
            <CardDescription>
              Revisa el progreso de la inspección y decide si aprobarla.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Label className="block text-sm font-medium mb-2">Progreso de la Inspección:</Label>
              <Progress value={percentage} className={`${progressBarColor} transition-all duration-500`} />
              <p className="text-right text-sm text-gray-600 mt-1">{percentage}% Completado</p>
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="aprobarRevista"
                checked={aprobarRevistaVehicular}
                onCheckedChange={() => setAprobarRevistaVehicular(prev => !prev)}
                className="h-5 w-5"
              />
              <Label htmlFor="aprobarRevista" className="text-base font-medium leading-none flex items-center">
                <ShieldCheck className="mr-2 h-5 w-5 text-green-500" /> Aprobar Revista Vehicular
              </Label>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Marca esta casilla si todos los criterios de inspección se cumplen y el vehículo es aprobado.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleGoBack} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || isUploading || isDeleting || !concesionarioData}>
            {isSubmitting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Guardando Inspección...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Nueva Inspección
              </>
            )}
          </Button>
        </div>
      </form>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la imagen.
              {imageToDelete?.idImagenRevistaVehicular && (
                <span className="font-bold text-red-600 block mt-2">Esta imagen ya está guardada en el servidor y será eliminada de forma permanente.</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteImage} disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteImage} disabled={isDeleting} className="bg-red-500 hover:bg-red-600">
              {isDeleting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}