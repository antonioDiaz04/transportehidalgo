'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SelectedImage {
  id: string;
  file: File;
  type: string;
  previewUrl: string;
  customName?: string;
}

const imageTypes = [
  'Número de Serie',
  'Número de Motor',
  'Fotografía Frontal',
  'Fotografía Trasera',
  'Fotografía Lateral Izquierda',
  'Fotografía Lateral Derecha'
];

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

  // Limpiar object URLs cuando el componente se desmonte o las imágenes cambien
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
  };

  const handleTypeChange = (id: string, newType: string) => {
    setSelectedImages(prev =>
      prev.map(img => {
        if (img.id === id) {
          const extension = img.file.name.split('.').pop();
          const safeType = newType.replace(/\s+/g, '_');
          const customName = `sinplaca_${safeType}.${extension}`;
          return { ...img, type: newType, customName };
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

  const handleAddImages = (e: React.MouseEvent) => {
    e.preventDefault();
    const allTypesSelected = selectedImages.every(img => img.type !== '');
    if (!allTypesSelected) {
      alert("Por favor, selecciona un tipo para cada imagen antes de agregar.");
      return;
    }
    setSelectedImages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí puedes agregar la lógica para enviar el formulario
    console.log({
      inspectionData,
      selectedImages,
      observaciones,
      aprobarRevistaVehicular
    });
  };

  const renderCheckboxField = (label: string, key: keyof typeof inspectionData) => (
    <div className="flex items-center space-x-2">
      <Checkbox id={key} checked={inspectionData[key]} onCheckedChange={() => toggleField(key)} />
      <label htmlFor={key} className="text-sm text-gray-700">{label}</label>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="container mx-auto p-4 bg-white border border-muted rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b">Inspección para Revista Vehicular</h2>
      
      {/* Sección de Ponderación */}
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Ponderación general de inspección</h3>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
        <div
          className="h-full text-white text-[10px] font-semibold flex items-center justify-center"
          style={{
            width: `${calculatePercentage()}%`,
            backgroundColor:
              calculatePercentage() < 50
                ? "#dc2626"
                : calculatePercentage() < 80
                  ? "#facc15"
                  : "#16a34a",
            transition: "width 0.3s ease-in-out",
          }}
        >
          {calculatePercentage()}%
        </div>
      </div>
      <p className="text-sm font-medium text-black text-center">
        {calculatePercentage() < 50 ? "Malo" : calculatePercentage() < 80 ? "Regular" : "Bueno"}
      </p>

      {/* Sección de Datos Generales */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Datos generales (editable)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(inspectionData).map(([key, _]) =>
            renderCheckboxField(key.replace(/([A-Z])/g, ' $1'), key as keyof typeof inspectionData)
          )}
        </div>
      </section>

      {/* Sección de Imágenes */}
      <section className="mb-8 p-6 bg-white rounded-xl">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">Agregar Imágenes</h2>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {selectedImages.map((img) => (
          <div key={img.id} className="flex items-center gap-4 mb-4">
            <Image 
              src={img.previewUrl} 
              alt={img.file.name} 
              width={80} 
              height={80} 
              className="rounded border"
              onLoad={() => URL.revokeObjectURL(img.previewUrl)} // Liberar memoria después de cargar
            />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">
                {img.customName || img.file.name}
              </p>
              <select
                value={img.type}
                onChange={(e) => handleTypeChange(img.id, e.target.value)}
                className="border p-2 rounded w-full"
              >
                <option value="">Seleccione tipo</option>
                {imageTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <Button 
              type="button"
              variant="destructive" 
              onClick={() => handleRemoveImage(img.id)}
            >
              Eliminar
            </Button>
          </div>
        ))}

        <div className="flex justify-between mt-4">
          <Button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            + Más Imágenes
          </Button>
          <Button 
            type="button"
            variant="destructive" 
            onClick={() => setSelectedImages([])}
          >
            Vaciar Imágenes
          </Button>
          <div className="flex gap-2">
            <Button 
              type="button"
              variant="secondary" 
              onClick={() => setSelectedImages([])}
            >
              Cancelar
            </Button>
            <Button 
              type="button"
              onClick={handleAddImages} 
              disabled={selectedImages.length === 0}
            >
              Agregar
            </Button>
          </div>
        </div>
      </section>

      {/* Sección de Confirmación */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Confirmar Inspección Vehicular</h3>
        <div>
          <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">Observaciones:</label>
          <Textarea 
            id="observaciones" 
            className="min-h-[100px] bg-gray-100" 
            value={observaciones} 
            onChange={e => setObservaciones(e.target.value)} 
          />
        </div>
        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="aprobarRevista" 
              checked={aprobarRevistaVehicular} 
              onCheckedChange={checked => setAprobarRevistaVehicular(!!checked)} 
            />
            <label htmlFor="aprobarRevista" className="text-sm font-medium text-gray-900">
              Aprobar Revista Vehicular
            </label>
          </div>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-md shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Guardar
          </Button>
        </div>
      </section>
    </form>
  );
}