'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import { X, ImagePlus, Trash2, Check, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SelectedImage {
  id: string;
  file: File;
  type: string;
  previewUrl: string;
  customName?: string;
}

interface VehicleData {
  id: number;
  folio: number;
  concession: number;
  transaction: string;
  plate: string;
  concessionaire: string;
  modality: string;
  status: string;
  inspectionDate: string;
  municipality: string;
}

const vehicleData: VehicleData[] = [
  {
    id: 81237,
    folio: 0,
    concession: 10818,
    transaction: 'Pago de Derechos',
    plate: 'A811FUT',
    concessionaire: 'LUCINO SALVADOR ORTIZ',
    modality: 'INDIVIDUAL',
    status: 'Impreso',
    inspectionDate: '05/06/2025 05:02 p. m.',
    municipality: 'TEZONTEPEC DE ALDAMA',
  },
  {
    id: 81236,
    folio: 0,
    concession: 25432,
    transaction: 'Cambio de Vehículo',
    plate: 'A51689K',
    concessionaire: 'IRMA SOLIS FLORES',
    modality: 'TRANSPORTE COLECTIVO',
    status: 'Registrado',
    inspectionDate: '05/06/2025 04:32 p. m.',
    municipality: 'TEPEAPULCO',
  },
];

const imageTypes = [
  'Número de Serie',
  'Número de Motor',
  'Fotografía Frontal',
  'Fotografía Trasera',
  'Fotografía Lateral Izquierda',
  'Fotografía Lateral Derecha'
];

export default function BandejaRevistaModule() {
  const [concession, setConcession] = useState('');
  const [plate, setPlate] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [filteredData, setFilteredData] = useState<VehicleData[]>(vehicleData);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Limpiar las URLs de objeto cuando el componente se desmonta
    return () => {
      selectedImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
    };
  }, [selectedImages]);

  const handleSearch = () => {
    const filtered = vehicleData.filter((item) => {
      const matchesConcession = concession === '' || item.concession.toString().includes(concession);
      const matchesPlate = plate === '' || item.plate.includes(plate);
      const matchesStatus = status === '' || item.status.includes(status);
      const matchesMunicipality = municipality === '' || item.municipality.includes(municipality);
      
      return matchesConcession && matchesPlate && matchesStatus && matchesMunicipality;
    });
    setFilteredData(filtered);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages: SelectedImage[] = Array.from(files).map(file => ({
        id: `${file.name}-${Date.now()}`,
        file,
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
          const customName = `${selectedVehicle?.plate || 'sinplaca'}_${safeType}.${extension}`;
          return { ...img, type: newType, customName };
        }
        return img;
      })
    );
  };

  const handleRemoveImage = (id: string) => {
    setSelectedImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const handleAddImages = () => {
    const allTypesSelected = selectedImages.every(img => img.type !== '');
    if (!allTypesSelected) {
      alert("Por favor, selecciona un tipo para cada imagen antes de agregar.");
      return;
    }
    
    // Aquí iría la lógica para guardar las imágenes
    console.log("Imágenes agregadas:", selectedImages);
    
    // Resetear el estado
    setSelectedImages([]);
    setIsModalOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenModal = (vehicle: VehicleData) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const resetFilters = () => {
    setConcession('');
    setPlate('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    setMunicipality('');
    setFilteredData(vehicleData);
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-muted">
      <h2 className="text-2xl font-bold mb-6">Búsqueda de Revista Vehicular</h2>

      {/* Filtros de búsqueda */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Input 
          placeholder="No. Concesión" 
          value={concession} 
          onChange={e => setConcession(e.target.value)} 
        />
        <Input 
          placeholder="Placa" 
          value={plate} 
          onChange={e => setPlate(e.target.value)} 
        />
        <select 
          className="border rounded-md p-2 text-sm"
          value={status} 
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">Todos los estatus</option>
          <option value="Impreso">Impreso</option>
          <option value="Registrado">Registrado</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input 
          type="date" 
          placeholder="Fecha inicial" 
          value={startDate} 
          onChange={e => setStartDate(e.target.value)} 
        />
        <Input 
          type="date" 
          placeholder="Fecha final" 
          value={endDate} 
          onChange={e => setEndDate(e.target.value)} 
        />
        <Input 
          placeholder="Municipio" 
          value={municipality} 
          onChange={e => setMunicipality(e.target.value)} 
        />
      </div>

      <div className="flex gap-3 mb-6">
        <Button onClick={handleSearch}>
          Buscar
        </Button>
        <Button variant="outline" onClick={resetFilters}>
          Limpiar filtros
        </Button>
      </div>

      {/* Tabla de resultados */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border border-gray-300 font-medium">ID</th>
              <th className="p-3 border border-gray-300 font-medium">Concesión</th>
              <th className="p-3 border border-gray-300 font-medium">Placa</th>
              <th className="p-3 border border-gray-300 font-medium">Concesionario</th>
              <th className="p-3 border border-gray-300 font-medium">Municipio</th>
              <th className="p-3 border border-gray-300 font-medium">Opciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 border border-gray-200">
                <td className="p-3 border border-gray-300">{item.id}</td>
                <td className="p-3 border border-gray-300">{item.concession}</td>
                <td className="p-3 border border-gray-300">{item.plate}</td>
                <td className="p-3 border border-gray-300">{item.concessionaire}</td>
                <td className="p-3 border border-gray-300">{item.municipality}</td>
                <td className="p-3 border border-gray-300">
                  <Button 
                    size="sm" 
                    onClick={() => handleOpenModal(item)}
                    className="flex items-center gap-2"
                  >
                    <ImagePlus className="w-4 h-4" />
                    Agregar imágenes
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para agregar imágenes */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/5  z-40" />
          <Dialog.Content className="fixed z-50 bg-white rounded-lg shadow-sm border border-gray-200 top-1/2 left-1/2 max-h-[90vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <Dialog.Title className="text-xl font-bold flex items-center gap-2">
                <ImagePlus className="w-5 h-5" />
                Agregar imágenes para {selectedVehicle?.plate}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-gray-500 hover:text-gray-700 rounded-full p-1">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="p-4 overflow-y-auto max-h-[70vh]">
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ImagePlus className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">No hay imágenes seleccionadas</p>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <ImagePlus className="w-4 h-4" />
                    Seleccionar imágenes
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedImages.map((img) => (
                    <div key={img.id} className="flex items-start gap-4 p-3 border rounded-lg">
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <Image 
                          src={img.previewUrl} 
                          alt={img.file.name} 
                          fill
                          className="rounded-md object-cover border"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate mb-2">
                          {img.customName || img.file.name}
                        </p>
                        <Select
                          value={img.type}
                          onValueChange={(value) => handleTypeChange(img.id, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccione tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {imageTypes.map(type => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveImage(img.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center p-4 border-t">
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <ImagePlus className="w-4 h-4" />
                  {selectedImages.length > 0 ? 'Agregar más' : 'Seleccionar imágenes'}
                </Button>
                {selectedImages.length > 0 && (
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedImages([])}
                    className="flex items-center gap-2 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                    Vaciar todo
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Dialog.Close asChild>
                  <Button variant="outline">Cancelar</Button>
                </Dialog.Close>
                <Button 
                  onClick={handleAddImages} 
                  disabled={selectedImages.length === 0}
                  className="flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Guardar imágenes
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}