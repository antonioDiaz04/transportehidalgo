'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Camera, Trash2, XCircle, FileImage, ClipboardCheck, Lightbulb, Car, Wrench, ShieldCheck, CheckSquare, Sparkles, ArrowLeft } from 'lucide-react';

interface SelectedImage {
  id: string;
  file: File;
  type: string;
  previewUrl: string;
  customName?: string;
}

const imageTypes = [
  { value: 'numero_serie', label: 'Número de Serie' },
  { value: 'numero_motor', label: 'Número de Motor' },
  { value: 'fotografia_frontal', label: 'Fotografía Frontal' },
  { value: 'fotografia_trasera', label: 'Fotografía Trasera' },
  { value: 'fotografia_lateral_izquierda', label: 'Fotografía Lateral Izquierda' },
  { value: 'fotografia_lateral_derecha', label: 'Fotografía Lateral Derecha' },
  { value: 'interior_delantero', label: 'Interior Delantero' },
  { value: 'interior_trasero', label: 'Interior Trasero' },
  { value: 'tablero', label: 'Tablero' },
  { value: 'neumatico_delantero_izquierdo', label: 'Neumático Delantero Izquierdo' },
  { value: 'neumatico_delantero_derecho', label: 'Neumático Delantero Derecho' },
  { value: 'neumatico_trasero_izquierdo', label: 'Neumático Trasero Izquierdo' },
  { value: 'neumatico_trasero_derecho', label: 'Neumático Trasero Derecho' },
  { value: 'cajuela', label: 'Cajuela' },
  { value: 'otros', label: 'Otros (Especificar en observaciones)' },
];

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

export default function InspeccionRevistaVehicularForm() {
  const [inspectionData, setInspectionData] = useState(initialInspectionData);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [observaciones, setObservaciones] = useState('');
  const [aprobarRevistaVehicular, setAprobarRevistaVehicular] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      selectedImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
    };
  }, [selectedImages]);

  const toggleField = (field: keyof typeof inspectionData) => {
    setInspectionData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages: SelectedImage[] = Array.from(files).map(file => ({
        id: `${file.name}-${Date.now()}`,
        file: file,
        type: '',
        previewUrl: URL.createObjectURL(file),
      }));
      setSelectedImages(prev => [...prev, ...newImages]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTypeChange = (id: string, newTypeValue: string) => {
    setSelectedImages(prev =>
      prev.map(img => {
        if (img.id === id) {
          const selectedTypeLabel = imageTypes.find(t => t.value === newTypeValue)?.label || newTypeValue;
          const extension = img.file.name.split('.').pop();
          const safeType = selectedTypeLabel.replace(/\s+/g, '_').toLowerCase();
          const customName = `inspeccion_${safeType}.${extension}`;
          return { ...img, type: newTypeValue, customName };
        }
        return img;
      })
    );
  };

  const calculatePercentage = () => {
    const total = Object.keys(inspectionData).length;
    const checked = Object.values(inspectionData).filter(val => val).length;
    return Math.round((checked / total) * 100);
  };

  const handleRemoveImage = (id: string) => {
    const imageToRemove = selectedImages.find(img => img.id === id);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }
    setSelectedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleClearAllImages = () => {
    selectedImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setSelectedImages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGoBack = () => {
    console.log("Volver atrás...");
    alert("Acción de 'Volver Atrás' simulada.");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const allTypesSelected = selectedImages.every(img => img.type !== '');
    if (selectedImages.length > 0 && !allTypesSelected) {
      alert("Por favor, selecciona un tipo para CADA imagen antes de enviar el formulario.");
      return;
    }

    console.log("Datos de la inspección:", {
      inspectionData,
      selectedImages: selectedImages.map(({ file, type, customName }) => ({
        fileName: customName || file.name,
        type,
        size: file.size,
      })),
      observaciones,
      aprobarRevistaVehicular,
      percentageScore: calculatePercentage(),
    });

    alert("Formulario enviado con éxito (simulado)!");
  };

  const renderCheckboxField = (label: string, key: keyof typeof inspectionData) => (
    <div className="flex items-center space-x-3 py-1">
      <Checkbox
        id={key}
        checked={inspectionData[key]}
        onCheckedChange={(checked) => toggleField(key)}
        // Cambio de estilo para checkbox: azul más suave, borde más claro
        className="h-5 w-5 border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white focus-visible:ring-blue-300"
      />
      <Label htmlFor={key} className="text-base text-gray-700 cursor-pointer">{label}</Label>
    </div>
  );

  return (
    // Contenedor principal del formulario: Fondo blanco y sombra sutil
    <form onSubmit={handleSubmit} className="container mx-auto p-8 bg-white rounded-xl border shadow-sm shadow-[#e2e8f0] border-x-gray-300 max-w-full">
      {/* Encabezado del formulario con botón de Volver Atrás */}
      <div className="flex justify-between items-center mb-8">
        <Button
          type="button"
          onClick={handleGoBack}
          variant="ghost" // Cambiado a ghost para un look más light
          className="text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200 px-4 py-2 rounded-md"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver
        </Button>
        {/* Espacio para posibles acciones a la derecha */}
        <div></div>
      </div>

      {/* Título principal del formulario */}
      <h1 className="text-3xl font-extrabold text-gray-800 mb-2 text-star">
        <ClipboardCheck className="inline-block mr-3 h-8 w-8 text-gray-500" /> {/* Icono azul más suave */}
        Inspección Vehicular
      </h1>
      <p className="text-lg text-gray-600 mb-8 text-start">Completa la información detallada para la revista.</p>

      {/* Sección de Ponderación */}
      <Card className="mb-8 bg-[#f7fafc]  border border-gray-200 shadow-sm"> {/* Bordes más suaves, sombra más sutil */}
        <CardHeader>
          <CardTitle className="text-xl text-gray-700 flex items-center"> {/* Título gris más sutil */}
            Estado General
          </CardTitle>
          <CardDescription className="text-gray-500">Resumen del cumplimiento de la inspección.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden mb-3"> {/* Fondo de barra más claro */}
            <div
              className="h-full text-white text-xs font-bold flex items-center justify-center rounded-full"
              style={{
                width: `${calculatePercentage()}%`,
                backgroundColor:
                  calculatePercentage() < 50
                    ? "#ef6e6e" // Rojo más suave
                    : calculatePercentage() < 80
                      ? "#facc15" // Amarillo sin cambios notables
                      : "#4ade80", // Verde más suave
                transition: "width 0.4s ease-in-out",
              }}
            >
              {calculatePercentage()}%
            </div>
          </div>
          <p className={`text-base font-semibold text-center ${
            calculatePercentage() < 50 ? "text-red-500" : calculatePercentage() < 80 ? "text-yellow-600" : "text-green-500"
          }`}>
            Resultado: {calculatePercentage() < 50 ? "Requiere Atención" : calculatePercentage() < 80 ? "Regular" : "Óptimo"}
          </p>
        </CardContent>
      </Card>

      {/* Sección de Puntos de Inspección General */}
      <Card className="mb-8 border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-gray-700 flex items-center">
            <CheckSquare className="h-5 w-5 mr-2 text-gray-500" />
            Detalles de la Inspección
          </CardTitle>
          <CardDescription className="text-gray-500">Verifica cada componente del vehículo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
            {Object.entries(inspectionData).map(([key, _]) =>
              renderCheckboxField(fieldLabels[key as keyof typeof inspectionData], key as keyof typeof inspectionData)
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sección de Galería de Imágenes */}
      <Card className="mb-8 border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-gray-700 flex items-center">
            <Camera className="h-5 w-5 mr-2 text-gray-500" />
            Archivos Adjuntos
          </CardTitle>
          <CardDescription className="text-gray-500">Sube las fotografías y documentos relevantes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="flex bg-[#f7fafc]  flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
            onClick={() => fileInputRef.current?.click()}
          >
            <Input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <FileImage className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-lg text-gray-600 font-semibold mb-1">Carga imágenes o arrastra aquí</p>
            <p className="text-sm text-gray-500">Formatos: JPG, PNG, GIF, WebP. Max. 10 MB por archivo.</p>
          </div>

          {selectedImages.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Imágenes Subidas ({selectedImages.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedImages.map((img) => (
                  <div key={img.id} className="flex items-start gap-4 p-4 border border-blue-200 rounded-lg bg-white shadow-sm">
                    <div className="relative flex-shrink-0">
                      <Image
                        src={img.previewUrl}
                        alt={img.file.name}
                        width={100}
                        height={100}
                        className="rounded-md object-cover border border-gray-200"
                        onLoad={() => URL.revokeObjectURL(img.previewUrl)}
                      />
                       <Button
                         type="button"
                         variant="ghost"
                         size="icon"
                         onClick={() => handleRemoveImage(img.id)}
                         className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-white border border-gray-200 text-red-500 hover:bg-red-50 hover:text-red-600 shadow-sm"
                       >
                         <XCircle className="h-4 w-4" />
                         <span className="sr-only">Eliminar imagen</span>
                       </Button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate mb-1">
                        {img.customName || img.file.name}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        Tamaño: {(img.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <div className="relative z-10">
                        <Label htmlFor={`select-type-${img.id}`} className="sr-only">Tipo de imagen</Label>
                        <Select value={img.type} onValueChange={(value) => handleTypeChange(img.id, value)}>
                          <SelectTrigger
                            id={`select-type-${img.id}`}
                            className={`w-full bg-white text-gray-700 border-gray-300 ${!img.type ? 'text-gray-500' : ''} hover:border-gray-400 focus:border-blue-400 focus:ring-blue-400`}
                          >
                            <SelectValue placeholder="Seleccione un tipo..." />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-200 shadow-lg"> {/* Contenido del select más pulido */}
                            {imageTypes.map(type => (
                              <SelectItem key={type.value} value={type.value} className="hover:bg-blue-50 text-gray-700 focus:bg-blue-100 focus:text-blue-800">
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-6 border-t pt-4 border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearAllImages}
                  className="text-red-500 border-gray-300 hover:bg-red-50 hover:text-red-600 shadow-sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Vaciar Todas
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección de Comentarios Adicionales y Aprobación */}
      <Card className="mb-8 border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-gray-700 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-gray-500" />
            Comentarios y Confirmación
          </CardTitle>
          <CardDescription className="text-gray-500">Añada observaciones finales y apruebe la inspección.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="observaciones" className="block text-base font-medium text-gray-700 mb-2">
              Observaciones Adicionales:
            </Label>
            <Textarea
              id="observaciones"
              placeholder="Escribe aquí cualquier detalle, anomalía o nota importante sobre el vehículo..."
              className="min-h-[120px] bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-300"
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="aprobarRevista"
                checked={aprobarRevistaVehicular}
                onCheckedChange={checked => setAprobarRevistaVehicular(!!checked)}
                className="h-5 w-5 border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white focus-visible:ring-green-300"
              />
              <Label htmlFor="aprobarRevista" className="text-base font-semibold text-gray-700 cursor-pointer">
                Aprobar Inspección Vehicular
              </Label>
            </div>
            <Button
              type="submit"
              // Botón de guardar: azul claro con sombra y hover sutil
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-6 rounded-md shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Guardar
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}