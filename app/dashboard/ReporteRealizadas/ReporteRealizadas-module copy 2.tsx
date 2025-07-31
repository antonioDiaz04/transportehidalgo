'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { FileDown, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Label } from "@/components/ui/label";

// Definimos la URL base de tu API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

interface VehicleData {
  IdRevistaVehicular: number;
  FechaInspeccion: string;
  IdConsesion: number;
  Tramite: string;
  Concesionario: string;
  Modalidad: string;
  Municipio: string;
  Inspector: string;
  Observaciones: string;
}

export default function ReporteRealizadas() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredData, setFilteredData] = useState<VehicleData[]>([]);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingC, setIsLoadingC] = useState(false);

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 15; // Tamaño de página por defecto

  const [exportFormat, setExportFormat] = useState({
    pdf: true,
    excel: false
  });

  // Nuevo estado para la opción de PDF: página actual o todas las páginas
  const [pdfExportScope, setPdfExportScope] = useState<'current' | 'all'>('all');

  /**
   * Función para obtener los datos del reporte para mostrar en la tabla con paginación.
   */
  const fetchReporte = async (page: number) => {
    if (!startDate || !endDate) {
      setError("Selecciona ambas fechas para consultar.");
      return;
    }
    setIsLoadingC(true);
    setError('');
    setDownloadMessage('');

    try {
      const params = new URLSearchParams({
        fechaInicio: startDate,
        fechaFin: endDate,
        page: page.toString(),
        pageSize: pageSize.toString(), // Agregamos pageSize al request
        format: 'json'
      }).toString();

      const response = await fetch(`${API_BASE_URL}/reporte/inspecciones?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log("Respuesta del servidor:", response);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener el reporte');
      }

      const data = await response.json();
      console.log("Datos de la consulta:", data);

      setFilteredData(data.data || []);
      setTotalRecords(data.totalRecords || 0);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.page || 1); // Asegúrate de que la página actual se actualice desde la respuesta del backend
      setError('');
    } catch (error: any) {
      console.error("Error al obtener el reporte para la tabla:", error);
      setError(error.message || "Error al obtener el reporte. Intenta de nuevo.");
      setFilteredData([]);
      setTotalRecords(0);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setIsLoadingC(false);
      setHasSearched(true);
    }
  };

  // Efecto para cargar la primera página cuando las fechas cambian o se monta el componente
  useEffect(() => {
    if (startDate && endDate) {
      fetchReporte(1); // Carga la primera página automáticamente al tener fechas
    }
  }, [startDate, endDate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  /**
   * Función para generar y descargar el reporte en formato Excel o PDF.
   */
  const generateReport = async (format: 'excel' | 'pdf', scope: 'current' | 'all') => {
    if (!startDate || !endDate) {
      setError("Selecciona ambas fechas para generar el reporte.");
      return;
    }

    setIsLoading(true);
    setError('');
    setDownloadMessage('');

    try {
      const file = fileInputRef.current?.files?.[0];
      let response;

      // Construye los parámetros comunes de la URL
      const commonParams = new URLSearchParams({
        fechaInicio: startDate,
        fechaFin: endDate,
        format,
        page: scope === 'current' ? currentPage.toString() : '1', // Si es current, usa la página actual
        pageSize: scope === 'current' ? pageSize.toString() : totalRecords.toString(), // Si es current, usa el tamaño de página actual, si es all, usa todos los registros
        allPages: scope === 'all' ? 'true' : 'false' // Indica al backend si queremos todas las páginas
      }).toString();

      if (file) {
        const formData = new FormData();
        formData.append('logo', file);

        response = await fetch(`${API_BASE_URL}/reporte/inspecciones?${commonParams}`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
      } else {
        response = await fetch(`${API_BASE_URL}/reporte/inspecciones?${commonParams}`, {
          method: 'GET',
          credentials: 'include',
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_inspecciones.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setDownloadMessage(`Su reporte en formato ${format.toUpperCase()} se ha generado y está descargándose. Por favor, revise la barra de descargas de su navegador o su carpeta de descargas.`);

    } catch (error: any) {
      console.error("Error al generar el reporte:", error);
      setError(error.message || "Error al generar el reporte. Asegúrate de que las fechas sean válidas y el servidor esté disponible.");
      setDownloadMessage('');
    } finally {
      setIsLoading(false);
      setShowExportModal(false);
    }
  };

  const handleGenerate = () => {
    if (exportFormat.pdf) {
      generateReport('pdf', pdfExportScope); // Pasa el scope seleccionado
    } else if (exportFormat.excel) {
      generateReport('excel', 'all'); // Para Excel, siempre generamos todas las páginas
    }
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      fetchReporte(page);
    }
  };

  return (
    <div className="p-6 font-inter">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Reporte de Inspecciones Vehiculares</h1>

      {/* Sección de Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Filtros de Consulta</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <Label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha inicial</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
            />
          </div>
          <div>
            <Label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha final</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>
        <Button
          onClick={() => fetchReporte(1)} // Siempre consulta la primera página al cambiar filtros
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out shadow-md hover:shadow-lg"
          disabled={isLoadingC}
        >
          {isLoadingC ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Consultando...
            </>
          ) : (
            "Consultar Reporte"
          )}
        </Button>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>

      {/* Sección de Resultados o Mensajes */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Resultados de Inspecciones</h2>
          {filteredData.length > 0 && (
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition duration-200 ease-in-out rounded-md shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4" />
                  Generar Reporte
                </>
              )}
            </Button>
          )}
        </div>

        {/* Mensajes de estado */}
        {downloadMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{downloadMessage}</span>
          </div>
        )}
        {filteredData.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-inner">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Id Revista</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Inspección</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. de Concesión</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trámite</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concesionario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modalidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Municipio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspector</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Observaciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item, i) => (
                  <tr key={item.IdRevistaVehicular || i} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.IdRevistaVehicular}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(item.FechaInspeccion).toLocaleString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.IdConsesion}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Tramite}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Concesionario}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Modalidad}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Municipio}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Inspector}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{item.Observaciones}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Componente de Paginación */}
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
              <span className="text-sm text-gray-700">
                Mostrando {filteredData.length} de {totalRecords} registros. Página {currentPage} de {totalPages}.
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1 || isLoadingC}
                  className="p-2 h-auto"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoadingC}
                  className="p-2 h-auto"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoadingC}
                  className="p-2 h-auto"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages || isLoadingC}
                  className="p-2 h-auto"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : hasSearched ? (
          <div className="text-center text-gray-500 py-10">
            <p>No se encontraron inspecciones en el rango seleccionado.</p>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10">
            <p>Ingresa un rango de fechas y haz clic en "Consultar" para ver las inspecciones.</p>
          </div>
        )}
      </div>

      {/* Modal de exportación */}
      <Dialog
        open={showExportModal}
        onOpenChange={setShowExportModal}
      >
        <DialogContent className="sm:max-w-[480px] bg-white border border-gray-300 rounded-lg shadow-lg text-black font-inter">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">Configurar Reporte</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Formato de exportación */}
            <div className="flex flex-col space-y-3">
              <Label className="text-base font-semibold text-gray-700">Formato de exportación</Label>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="pdf-format"
                  checked={exportFormat.pdf}
                  onCheckedChange={(checked) => {
                    setExportFormat({ pdf: Boolean(checked), excel: !Boolean(checked) });
                    if (!Boolean(checked)) setPdfExportScope('all'); // Si desmarcas PDF, restablece a "todas las páginas"
                  }}
                  className="w-5 h-5 rounded-sm border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                />
                <Label htmlFor="pdf-format" className="text-base text-gray-800 cursor-pointer">PDF</Label>
              </div>
              {exportFormat.pdf && ( // Opciones de scope solo si PDF está seleccionado
                <div className="ml-6 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pdf-current-page"
                      checked={pdfExportScope === 'current'}
                      onCheckedChange={(checked) => setPdfExportScope(Boolean(checked) ? 'current' : 'all')}
                      className="w-4 h-4 rounded-sm border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                    />
                    <Label htmlFor="pdf-current-page" className="text-sm text-gray-700 cursor-pointer">Solo página actual ({currentPage})</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pdf-all-pages"
                      checked={pdfExportScope === 'all'}
                      onCheckedChange={(checked) => setPdfExportScope(Boolean(checked) ? 'all' : 'current')}
                      className="w-4 h-4 rounded-sm border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                    />
                    <Label htmlFor="pdf-all-pages" className="text-sm text-gray-700 cursor-pointer">Todas las páginas ({totalPages})</Label>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="excel-format"
                  checked={exportFormat.excel}
                  onCheckedChange={(checked) => setExportFormat({ excel: Boolean(checked), pdf: !Boolean(checked) })}
                  className="w-5 h-5 rounded-sm border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                />
                <Label htmlFor="excel-format" className="text-base text-gray-800 cursor-pointer">Excel</Label>
              </div>
            </div>

            {/* Subida de Logo */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">Logo (opcional)</Label>
              <Input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-2 hover:file:bg-blue-100"
              />
              {previewUrl && (
                <div className="border border-gray-200 p-3 bg-gray-50 text-center rounded-md shadow-sm">
                  <p className="text-sm text-gray-600 mb-2">Previsualización del logo:</p>
                  <img src={previewUrl} alt="Preview" className="max-h-32 mx-auto rounded-md shadow-inner" />
                </div>
              )}
            </div>

            {/* Botones de acción del modal */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowExportModal(false)}
                className="border-gray-400 text-gray-700 hover:bg-gray-100 hover:text-gray-800 rounded-md shadow-sm"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGenerate}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out shadow-md hover:shadow-lg"
                disabled={!exportFormat.pdf && !exportFormat.excel || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  "Generar Reporte"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}