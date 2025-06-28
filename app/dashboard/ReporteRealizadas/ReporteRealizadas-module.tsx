import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface PdfSectionConfig {
  type: 'url' | 'file';
  url: string;
  file: File | null;
  previewUrl: string | null;
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
  }
];

export default function ReporteRealizadas() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredData, setFilteredData] = useState<VehicleData[]>(vehicleData);
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'preview'>('config');
  const [pdfConfig, setPdfConfig] = useState({
    header: {
      type: 'url' as 'url' | 'file',
      url: '',
      file: null as File | null,
      previewUrl: null as string | null
    },
    background: {
      type: 'url' as 'url' | 'file',
      url: '',
      file: null as File | null,
      previewUrl: null as string | null
    },
    footer: {
      type: 'url' as 'url' | 'file',
      url: '',
      file: null as File | null,
      previewUrl: null as string | null
    }
  });

  const fileInputRefs = {
    header: useRef<HTMLInputElement>(null),
    background: useRef<HTMLInputElement>(null),
    footer: useRef<HTMLInputElement>(null)
  };

  const DEFAULT_IMAGES = {
    header: 'https://res.cloudinary.com/dvvhnrvav/image/upload/v1750186833/transporte/pbrxq2fnaqhwptej1jsz.png',
    background: '',
    footer: ''
  };

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

  const handleFileChange = (section: 'header' | 'background' | 'footer', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);

      setPdfConfig(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          type: 'file',
          file,
          previewUrl
        }
      }));
    }
  };

  const handleUrlChange = (section: 'header' | 'background' | 'footer', value: string) => {
    setPdfConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        type: 'url',
        url: value,
        previewUrl: value || null
      }
    }));
  };

  const triggerFileInput = (section: 'header' | 'background' | 'footer') => {
    fileInputRefs[section].current?.click();
  };

  const resetSection = (section: 'header' | 'background' | 'footer') => {
    setPdfConfig(prev => ({
      ...prev,
      [section]: {
        type: 'url',
        url: '',
        file: null,
        previewUrl: null
      }
    }));
  };

  const handleGeneratePDF = () => {
    const config = {
      header: pdfConfig.header.previewUrl || DEFAULT_IMAGES.header,
      background: pdfConfig.background.previewUrl || '',
      footer: pdfConfig.footer.previewUrl || '',
      data: filteredData,
      title: "Reporte de Revistas Vehiculares",
      dateRange: startDate || endDate
        ? `Del ${startDate || 'inicio'} al ${endDate || 'actual'}`
        : 'Todos los registros'
    };

    const pdf = generarPDF(config);
    savePDF(pdf, 'reporte-vehiculos');
    setShowExportModal(false);
  };

  const renderSectionTab = (section: 'header' | 'background' | 'footer', title: string, recommendedSize: string) => {
    return (
      <TabsContent value={section}>
        <div className="space-y-4 mt-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={pdfConfig[section].type === 'url'}
                onChange={() => setPdfConfig(prev => ({
                  ...prev,
                  [section]: { ...prev[section], type: 'url' }
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Usar URL</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={pdfConfig[section].type === 'file'}
                onChange={() => setPdfConfig(prev => ({
                  ...prev,
                  [section]: { ...prev[section], type: 'file' }
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Subir imagen</span>
            </label>
          </div>

          {pdfConfig[section].type === 'url' ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">URL de la imagen</label>
              <Input
                type="text"
                value={pdfConfig[section].url}
                onChange={(e) => handleUrlChange(section, e.target.value)}
                placeholder={`Ingresa la URL para ${title.toLowerCase()}`}
                className="w-full"
              />
              {section === 'header' && (
                <p className="text-xs text-gray-500">
                  Deja vacío para usar la imagen por defecto
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Seleccionar imagen</label>
              <input
                type="file"
                ref={fileInputRefs[section]}
                onChange={(e) => handleFileChange(section, e)}
                accept="image/*"
                className="hidden"
              />
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => triggerFileInput(section)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {pdfConfig[section].file ? 'Cambiar archivo' : 'Seleccionar archivo'}
                </Button>
                {pdfConfig[section].file && (
                  <Button
                    variant="ghost"
                    onClick={() => resetSection(section)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Quitar
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {recommendedSize && `Tamaño recomendado: ${recommendedSize}`}
              </p>
            </div>
          )}

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Vista previa de {title.toLowerCase()}</h3>
            <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
              <div className={`w-full ${section === 'background' ? 'h-64' : 'h-32'} bg-white border border-gray-300 flex items-center justify-center overflow-hidden`}>
                {pdfConfig[section].previewUrl ? (
                  <img
                    src={pdfConfig[section].previewUrl}
                    alt={`${title} del PDF`}
                    className={`w-full h-full ${section === 'background' ? 'object-cover' : 'object-contain'}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_IMAGES[section] || '';
                    }}
                  />
                ) : (
                  <div className="text-center p-4">
                    <div className="text-gray-400 mb-2">
                      {section === 'header' ? 'Imagen por defecto' : 'Ninguna imagen seleccionada'}
                    </div>
                    {section === 'header' && (
                      <img
                        src={DEFAULT_IMAGES.header}
                        alt="Encabezado por defecto"
                        className="h-16 mx-auto"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Revistas Vehiculares</h1>
        <p className="text-sm text-gray-600 mt-1">Registro de inspecciones vehiculares realizadas</p>
      </div>

      {/* Filtros por fecha */}
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

      {/* Tabla de datos */}
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

      {/* Botones de exportación */}
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

      {/* Modal para configurar PDF */}
      {/* Modal con vista previa en pestaña separada */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="sm:max-w-[600px] bg-white border border-gray-200 rounded-lg shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-md font-semibold text-gray-800">
              Configuración del PDF
            </DialogTitle>
          </DialogHeader>

          {/* Controles de navegación */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'config' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('config')}
            >
              Configuración
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'preview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('preview')}
            >
              Vista Previa
            </button>
          </div>

          {/* Contenido de configuración */}
          {activeTab === 'config' && (
            <div className="space-y-4 py-4">
              <Tabs defaultValue="header" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-8 mb-3">
                  <TabsTrigger value="header" className="text-xs">Encabezado</TabsTrigger>
                  <TabsTrigger value="background" className="text-xs">Fondo</TabsTrigger>
                  <TabsTrigger value="footer" className="text-xs">Pie</TabsTrigger>
                </TabsList>

                {renderSectionTab('header', 'Encabezado', '800x200px')}
                {renderSectionTab('background', 'Fondo', 'Tamaño página')}
                {renderSectionTab('footer', 'Pie', '800x100px')}
              </Tabs>
            </div>
          )}

          {/* Contenido de vista previa */}
          {activeTab === 'preview' && (
            <div className="py-4 flex flex-col items-center">
              <div className="w-full max-w-xs border-2 border-gray-300 rounded-md shadow-sm">
                {/* Vista previa realista */}
                <div className="h-10 bg-gray-100 border-b border-gray-300 flex items-center justify-center">
                  {pdfConfig.header.previewUrl ? (
                    <img
                      src={pdfConfig.header.previewUrl}
                      className="h-full object-contain"
                      alt="Encabezado"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">Encabezado predeterminado</span>
                  )}
                </div>

                <div
                  className="h-48 relative"
                  style={{
                    backgroundImage: pdfConfig.background.previewUrl ? `url(${pdfConfig.background.previewUrl})` : 'none',
                    backgroundSize: 'cover'
                  }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <div className={`p-3 rounded-md ${pdfConfig.background.previewUrl ? 'bg-white/90' : 'bg-white'}`}>
                      <h4 className="text-sm font-semibold text-center">Reporte Vehicular</h4>
                      <p className="text-xs text-gray-600 text-center mt-1">
                        {startDate || endDate ? `Del ${startDate || 'inicio'} al ${endDate || 'actual'}` : 'Todos los registros'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-8 bg-gray-100 border-t border-gray-300 flex items-center justify-center">
                  {pdfConfig.footer.previewUrl ? (
                    <img
                      src={pdfConfig.footer.previewUrl}
                      className="h-full object-contain"
                      alt="Pie de página"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">Pie de página</span>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Vista previa del documento generado
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowExportModal(false)}
              className="text-sm h-9 px-4 border-gray-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGeneratePDF}
              className="text-sm h-9 px-4 bg-blue-600 hover:bg-blue-700"
            >
              Generar PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}