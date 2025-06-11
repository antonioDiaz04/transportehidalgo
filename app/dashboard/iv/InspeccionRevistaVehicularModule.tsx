'use client';

import React, { useState, useRef } from 'react';
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

  const toggleField = (field: keyof typeof inspectionData) => {
    setInspectionData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: SelectedImage[] = Array.from(files).map(file => ({
        id: file.name + Date.now(),
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

  // const toggleField = (field: keyof typeof inspectionData) => {
  //   setInspectionData(prev => ({ ...prev, [field]: !prev[field] }));
  // };



  const handleRemoveImage = (id: string) => {
    setSelectedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleAddImages = () => {
    const allTypesSelected = selectedImages.every(img => img.type !== '');
    if (!allTypesSelected) {
      alert("Por favor, selecciona un tipo para cada imagen antes de agregar.");
      return;
    }
    setSelectedImages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderCheckboxField = (label: string, key: keyof typeof inspectionData) => (
    <div className="flex items-center space-x-2">
      <Checkbox id={key} checked={inspectionData[key]} onCheckedChange={() => toggleField(key)} />
      <label htmlFor={key} className="text-sm text-gray-700">{label}</label>
    </div>
  );

  return (
    <form className="container mx-auto p-4 bg-white border border-muted rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b">Inspección para Revista Vehicular</h2>
<h3 className="text-lg font-semibold text-gray-700 mb-2">Ponderación general de inspección</h3>
<div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
  <div
    className="h-full text-white text-[10px] font-semibold flex items-center justify-center"
    style={{
      width: `${calculatePercentage()}%`,
      backgroundColor:
        calculatePercentage() < 50
          ? "#dc2626" // rojo
          : calculatePercentage() < 80
          ? "#facc15" // amarillo
          : "#16a34a", // verde
      transition: "width 0.3s ease-in-out",
    }}
  >
    {calculatePercentage()}%
  </div>
</div>
<p className="text-sm font-medium text-black text-center">
  {
    calculatePercentage() < 50
      ? "Malo"
      : calculatePercentage() < 80
      ? "Regular"
      : "Bueno"
  }
</p>

      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Datos generales (editable)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(inspectionData).map(([key, _]) =>
            renderCheckboxField(key.replace(/([A-Z])/g, ' $1'), key as keyof typeof inspectionData)
          )}
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Imágenes</h3>
        <div className="flex items-center space-x-4 mb-4">
          <Input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="flex-grow" />
          <Select onValueChange={value => {
            if (selectedImages.length > 0) {
              handleTypeChange(selectedImages[selectedImages.length - 1].id, value);
            }
          }}>
            <SelectTrigger id="imageType" className="w-[200px]">
              <SelectValue placeholder="Tipo de imagen:" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="frontal">Frontal</SelectItem>
              <SelectItem value="trasera">Trasera</SelectItem>
              <SelectItem value="lateral">Lateral</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => fileInputRef.current?.click()}>Agregar</Button>
        </div>
        <div className="flex flex-wrap gap-4 mb-4">
          {selectedImages.map((img) => (
            <div key={img.id} className="flex flex-col items-center">
              <Image src={img.previewUrl} alt={img.file.name} width={80} height={80} className="rounded border" />
              <span className="text-xs">{img.customName || img.file.name}</span>
              <Button variant="destructive" size="sm" onClick={() => handleRemoveImage(img.id)}>Eliminar</Button>
            </div>
          ))}
        </div>
        <div className="flex justify-center mb-6">
          <Button onClick={handleAddImages} disabled={selectedImages.length === 0}>Cargar Imágenes</Button>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Confirmar Inspección Vehicular</h3>
        <div>
          <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">Observaciones:</label>
          <Textarea id="observaciones" className="min-h-[100px] bg-gray-100" value={observaciones} onChange={e => setObservaciones(e.target.value)} />
        </div>
        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center space-x-2">
            <Checkbox id="aprobarRevista" checked={aprobarRevistaVehicular} onCheckedChange={checked => setAprobarRevistaVehicular(!!checked)} />
            <label htmlFor="aprobarRevista" className="text-sm font-medium text-gray-900">Aprobar Revista Vehicular</label>
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
