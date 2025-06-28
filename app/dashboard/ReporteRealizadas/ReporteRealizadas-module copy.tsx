import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generarPDF, savePDF } from '@/lib/pdfGenerator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
    inspectionDate: '2025-06-05 17:02:00',
    municipality: 'TEZONTEPEC DE ALDAMA',
    inspector: "Inspector 1",
    notes: "Sin observaciones",
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
    inspectionDate: '2025-06-05 16:32:00',
    municipality: 'TEPEAPULCO',
    inspector: "Inspector 2",
    notes: "Requiere revisión",
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
    inspectionDate: '2025-06-10 10:56:00',
    municipality: 'MINERAL DE LA REFORMA',
    inspector: "Inspector 3",
    notes: "Documentación completa",
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
    inspectionDate: '2025-06-10 10:34:00',
    municipality: 'PACHUCA DE SOTO',
    inspector: "Inspector 1",
    notes: "Pendiente de pago",
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
    inspectionDate: '2025-06-10 10:26:00',
    municipality: 'PACHUCA DE SOTO',
    inspector: "Inspector 2",
    notes: "Aprobado",
  }
];

export default function ReporteRealizadas() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredData, setFilteredData] = useState<VehicleData[]>(vehicleData);
  const [showExportModal, setShowExportModal] = useState(false);
  const [imageType, setImageType] = useState<'url' | 'file'>('url');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const DEFAULT_IMAGE_URL = 'https://res.cloudinary.com/dvvhnrvav/image/upload/v1750186833/transporte/pbrxq2fnaqhwptej1jsz.png';

  const handleSearch = () => {
    if (!startDate && !endDate) {
      setFilteredData(vehicleData);
      return;
    }

    const filtered = vehicleData.filter((item) => {
      const inspectionDate = new Date(item.inspectionDate).getTime();
      const start = startDate ? new Date(startDate).getTime() : 0;
      const end = endDate ? new Date(endDate).getTime() : Date.now();

      return (
        (!startDate || inspectionDate >= start) &&
        (!endDate || inspectionDate <= end)
      );
    });
    setFilteredData(filtered);
  };

  const handleExportExcel = (id: number) => {
    alert(`Exportar a Excel el registro Id Revista: ${id}`);
  };

  const handleGeneratePDF = () => {
    let imageToUse = DEFAULT_IMAGE_URL;
    
    if (imageType === 'url' && imageUrl) {
      imageToUse = imageUrl;
    } else if (imageType === 'file' && selectedFile) {
      imageToUse = URL.createObjectURL(selectedFile);
    }

    const pdf = generarPDF(imageToUse);
    savePDF(pdf, 'reporte-vehiculos');
    setShowExportModal(false);
    
    // Limpiar campos después de exportar
    setImageUrl('');
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Crear URL de vista previa
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    if (e.target.value) {
      setPreviewUrl(e.target.value);
    } else {
      setPreviewUrl(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const resetImageSelection = () => {
    setImageUrl('');
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Revistas Vehiculares</h1>
        <p className="text-sm text-gray-600 mt-1">Registro de inspecciones vehiculares realizadas</p>
      </div>

      {/* Filtros solo por fecha */}
      <div className="p-4 rounded-lg mb-6">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Filtrar por fecha de inspección</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicial</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha final</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button 
            variant="outline"
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setFilteredData(vehicleData);
            }}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Limpiar
          </Button>
          <Button 
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Filtrar
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID Revista</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Fecha Inspección</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Concesión</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Trámite</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Placa</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.id}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {new Date(item.inspectionDate).toLocaleDateString('es-MX', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.concession}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.transaction}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.plate}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleExportExcel(item.id)}
                      className="p-1.5 rounded-md hover:bg-gray-100"
                      title="Exportar a Excel"
                    >
                      <img
                        src="https://res.cloudinary.com/dvvhnrvav/image/upload/v1750248639/transporte/m504jkirjpfqwnf1hnxh.png"
                        alt="Excel"
                        className="w-6 h-6"
                      />
                    </button>
                    <button 
                      onClick={() => setShowExportModal(true)}
                      className="p-1.5 rounded-md hover:bg-gray-100"
                      title="Exportar a PDF"
                    >
                      <img
                        src="https://res.cloudinary.com/dvvhnrvav/image/upload/v1750186833/transporte/pbrxq2fnaqhwptej1jsz.png"
                        alt="PDF"
                        className="w-6 h-6"
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Exportar todo */}
      <div className="mt-6 flex justify-end space-x-3">
        <Button 
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <img
            src="https://res.cloudinary.com/dvvhnrvav/image/upload/v1750248639/transporte/m504jkirjpfqwnf1hnxh.png"
            alt="Excel"
            className="w-5 h-5 mr-2"
          />
          Exportar todo a Excel
        </Button>
        <Button 
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
          onClick={() => setShowExportModal(true)}
        >
          <img
            src="https://res.cloudinary.com/dvvhnrvav/image/upload/v1750186833/transporte/pbrxq2fnaqhwptej1jsz.png"
            alt="PDF"
            className="w-5 h-5 mr-2"
          />
          Exportar todo a PDF
        </Button>
      </div>

      {/* Modal para exportar PDF */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="sm:max-w-[500px] bg-white border border-gray-200 rounded-lg shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-800">Configuración de exportación</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={imageType === 'url'}
                  onChange={() => setImageType('url')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Usar URL de imagen</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={imageType === 'file'}
                  onChange={() => setImageType('file')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Subir imagen</span>
              </label>
            </div>

            {imageType === 'url' ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">URL de la imagen</label>
                <Input
                  type="text"
                  value={imageUrl}
                  onChange={handleUrlChange}
                  placeholder="Ingresa la URL de la imagen"
                  className="w-full"
                />
                <p className="text-xs text-gray-500">Deja vacío para usar la imagen por defecto</p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Seleccionar imagen</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={triggerFileInput}
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {selectedFile ? selectedFile.name : 'Seleccionar archivo'}
                </Button>
                <p className="text-xs text-gray-500">Deja vacío para usar la imagen por defecto</p>
              </div>
            )}

            {/* Vista previa de la imagen */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Vista previa</label>
              <div className="border border-gray-200 rounded-md p-4 flex justify-center items-center h-40 bg-gray-50">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Vista previa" 
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_IMAGE_URL;
                    }}
                  />
                ) : (
                  <div className="text-gray-400 text-sm">Se usará la imagen por defecto</div>
                )}
              </div>
              {(previewUrl || imageUrl || selectedFile) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetImageSelection}
                  className="mt-2 text-red-500 hover:text-red-600"
                >
                  Quitar imagen
                </Button>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowExportModal(false);
                  resetImageSelection();
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGeneratePDF}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Generar PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}