
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Image as ImageIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { File, FileText, FileType2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
// import { createEmptyPDF, savePDF } from '@/lib/pdfExport';
import { generarPDF ,savePDF} from '@/lib/pdfGenerator';


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
  municipality: string;
  status: string;
  inspectionDate: string;
  inspector: string;
  notes: string;
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
    inspector: "asss",
    notes: "asss",
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
    inspector: "asss",
    notes: "asss",

  },

  {

    id: 81323,

    folio: 0,

    concession: 6595,

    transaction: 'Pago de Derechos',

    plate: 'A214FUV',

    concessionaire: 'ADRIANA TURRUBIARTE DELGADILLO',

    modality: 'INDIVIDUAL',

    status: 'Registrado',

    inspectionDate: '10/06/2025 10:56 a. m.',

    municipality: 'MINERAL DE LA REFORMA',
    inspector: "asss",
    notes: "asss",

  },

  {

    id: 81322,

    folio: 0,

    concession: 12271,

    transaction: 'Pago de Derechos',

    plate: 'A612FUW',

    concessionaire: 'SANDRA BAUTISTA MENDOZA',

    modality: 'INDIVIDUAL',

    status: 'Registrado',

    inspectionDate: '10/06/2025 10:34 a. m.',

    municipality: 'PACHUCA DE SOTO',
    inspector: "asss",
    notes: "asss",

  },

  {

    id: 81321,

    folio: 0,

    concession: 1806,

    transaction: 'Pago de Derechos',

    plate: 'A954FVB',

    concessionaire: 'PERLA ARACELY CANO FRAGOSO',

    modality: 'INDIVIDUAL',

    status: 'Registrado',

    inspectionDate: '10/06/2025 10:26 a. m.',

    municipality: 'PACHUCA DE SOTO',
    inspector: "asss",
    notes: "asss",
  }

];


export default function ReporteRealizadas() {
  const [concession, setConcession] = useState('');
  const [plate, setPlate] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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
      const inspectionDate = new Date(item.inspectionDate);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      return (
        item.concession.toString().includes(concession) &&
        item.plate.includes(plate) &&
        item.status.includes(status) &&
        (!start || inspectionDate >= start) &&
        (!end || inspectionDate <= end)
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
  // Puedes agregar lógica de exportar aquí
  const handleExportExcel = (id: number) => {
    alert(`Exportar a Excel el registro Id Revista: ${id}`);
  };



  const handleGenerateBlankPDF = () => {
    // const pdf = createEmptyPDF();
    const pdf = generarPDF();
    // savePDF(pdf, 'archivo-vacio');
    savePDF(pdf, 'archivopdfg');
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
    <div className="p-8 bg-white border border-muted rounded-lg overflow-x-auto">
      <h2 className="text-2xl font-bold mb-6">Revistas Vehiculares</h2>
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Rango de Fecha:</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
          <Input
            id="fechaInicio"
            type="date"
          />
        </div>
        <div>
          <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
          <Input
            id="fechaFin"
            type="date"
          />
        </div>
      </div>

      <table className="w-full table-auto text-left border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 border border-gray-300">Id Revista</th>
            <th className="p-3 border border-gray-300">Fecha de Inspección</th>
            <th className="p-3 border border-gray-300">No. de Concesión</th>
            <th className="p-3 border border-gray-300">Trámite</th>
            <th className="p-3 border border-gray-300">Concesionario</th>
            <th className="p-3 border border-gray-300">Modalidad</th>
            <th className="p-3 border border-gray-300">Municipio</th>
            <th className="p-3 border border-gray-300">Inspector</th>
            <th className="p-3 border border-gray-300">Observaciones</th>
            <th className="p-3 border border-gray-300">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {vehicleData.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 border border-gray-200">
              <td className="p-3 border border-gray-300">{item.id}</td>
              <td className="p-3 border border-gray-300">{item.inspectionDate}</td>
              <td className="p-3 border border-gray-300">{item.concession}</td>
              <td className="p-3 border border-gray-300">{item.transaction}</td>
              <td className="p-3 border border-gray-300">{item.concessionaire}</td>
              <td className="p-3 border border-gray-300">{item.modality}</td>
              <td className="p-3 border border-gray-300">{item.municipality}</td>
              <td className="p-3 border border-gray-300">{item.inspector}</td>
              <td className="p-3 border border-gray-300">{item.notes}</td>
              <td className="p-3  flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExportExcel(item.id)}
                  aria-label={`Exportar registro ${item.id} a Excel`}
                >
                  <FileType2 className="w-5 h-5 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleGenerateBlankPDF()}
                  aria-label={`Exportar registro ${item.id} a PDF`}
                >
                  <FileText className="w-5 h-5 text-red-600" />
                </Button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button
        variant="ghost"
        size="sm"

      >
        <FileType2 className="w-5 h-5 text-green-600" />
      </Button>
      <Button
        variant="ghost"
        size="sm"

      >
        <FileText className="w-5 h-5 text-red-600" />
      </Button>
    </div>
  );
} 