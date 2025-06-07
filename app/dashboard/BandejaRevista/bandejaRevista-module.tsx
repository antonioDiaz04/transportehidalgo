'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

export default function BandejaRevistaModule() {
  const [concession, setConcession] = useState('');
  const [plate, setPlate] = useState('');
  const [status, setStatus] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [filteredData, setFilteredData] = useState<VehicleData[]>(vehicleData);
  const [showModal, setShowModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);

  const imageTypes = [
    'Número de Serie',
    'Número de Motor',
    'Fotografía Frontal',
    'Fotografía Trasera',
    'Fotografía Lateral Izquierda',
    'Fotografía Lateral Derecha'
  ];

  const handleSearch = () => {
    const filtered = vehicleData.filter((item) => {
      return (
        item.concession.toString().includes(concession) &&
        item.plate.includes(plate) &&
        item.status.includes(status) &&
        item.inspectionDate.includes(inspectionDate) &&
        item.municipality.includes(municipality)
      );
    });
    setFilteredData(filtered);
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
    setSelectedImages((prev) =>
      prev.map((img) => {
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
    setSelectedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleAddImages = () => {
    const allTypesSelected = selectedImages.every(img => img.type !== '');
    if (!allTypesSelected) {
      alert("Por favor, selecciona un tipo para cada imagen antes de agregar.");
      return;
    }
    console.log("Imágenes agregadas:", selectedImages);
    setSelectedImages([]);
    setShowModal(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Búsqueda de Revista Vehicular</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Input placeholder="No. Concesión" value={concession} onChange={e => setConcession(e.target.value)} />
        <Input placeholder="Placa" value={plate} onChange={e => setPlate(e.target.value)} />
        <select className="border rounded p-2" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Estatus</option>
          <option value="Impreso">Impreso</option>
          <option value="Registrado">Registrado</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input placeholder="Municipio" value={municipality} onChange={e => setMunicipality(e.target.value)} />
        <Input type="date" value={inspectionDate} onChange={e => setInspectionDate(e.target.value)} />
      </div>

      <Button onClick={handleSearch} className="mb-6">Buscar</Button>

      <table className="w-full table-auto text-left border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Concesión</th>
            <th className="p-2">Placa</th>
            <th className="p-2">Concesionario</th>
            <th className="p-2">Municipio</th>
            <th className="p-2">Opciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="p-2">{item.id}</td>
              <td className="p-2">{item.concession}</td>
              <td className="p-2">{item.plate}</td>
              <td className="p-2">{item.concessionaire}</td>
              <td className="p-2">{item.municipality}</td>
              <td className="p-2">
                <Button onClick={() => {
                  setSelectedVehicle(item);
                  setShowModal(true);
                }}>Seleccionar Imágenes</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Radix UI */}
      <Dialog.Root open={showModal} onOpenChange={setShowModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30 z-40" />
          <Dialog.Content className="fixed z-50 bg-white rounded-xl shadow-lg top-1/2 left-1/2 max-h-[90vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 p-6 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <Dialog.Title className="text-xl font-bold">Agregar Imágenes</Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
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
                <Image src={img.previewUrl} alt={img.file.name} width={80} height={80} className="rounded border" />
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
                <Button variant="destructive" onClick={() => handleRemoveImage(img.id)}>Eliminar</Button>
              </div>
            ))}

            <div className="flex justify-between mt-4">
              <Button onClick={() => fileInputRef.current?.click()}>+ Más Imágenes</Button>
              <Button variant="destructive" onClick={() => setSelectedImages([])}>vaciar Imágenes</Button>
              <div className="flex gap-2">
                <Dialog.Close asChild>
                  <Button variant="secondary">Cancelar</Button>
                </Dialog.Close>
                <Button onClick={handleAddImages} disabled={selectedImages.length === 0}>Agregar</Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
