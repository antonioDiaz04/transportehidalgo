'use client';

import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { FileDown, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

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
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingC, setIsLoadingC] = useState(false);

  const [exportFormat, setExportFormat] = useState({
    pdf: true,
    excel: false
  });
  const DEFAULT_IMAGE = "https://res.cloudinary.com/dvvhnrvav/image/upload/v1750186833/transporte/pbrxq2fnaqhwptej1jsz.png";

  const fetchReporte = async () => {
    if (!startDate || !endDate) {
      setError("Selecciona ambas fechas");
      return;
    }
    setIsLoadingC(true);


    try {
      const response = await axios.get('http://localhost:3000/api/reporte/inspecciones', {
      params: { fechaInicio: startDate, fechaFin: endDate, page: 1, format: 'json' },
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
      });
      
      console.log(response)

      setFilteredData(response.data.data || []);
      setError('');
    } catch (error) {
      setIsLoadingC(false)
      setError("Error al obtener el reporte");
    } finally {
      setIsLoadingC(false)
      setHasSearched(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };
  const generateReport = async (format: 'excel' | 'pdf') => {
    if (!startDate || !endDate) {
      setError("Selecciona ambas fechas");
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      let response;

      // Si hay un logo seleccionado, usar FormData y POST (los demás parámetros normales, solo el archivo en formData)
      if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files[0]) {
        const formData = new FormData();
        formData.append('logo', fileInputRef.current.files[0]);

        // Los demás parámetros van en la URL (query params)
        const params = new URLSearchParams({
          fechaInicio: startDate,
          fechaFin: endDate,
          format,
          allPages: 'true'
        }).toString();

        response = await axios.post(
          `http://localhost:3000/api/reporte/inspecciones?${params}`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true,
            responseType: 'blob'
          }
        );
      } else {
        // Si no hay logo, usar GET normal
        response = await axios.get(
          'http://localhost:3000/api/reporte/inspecciones',
          {
            params: {
              fechaInicio: startDate,
              fechaFin: endDate,
              format,
              allPages: 'true'
            },
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
            responseType: 'blob'
          }
        );
      }

      // Manejar descarga de archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_inspecciones.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {
      setError("Error al generar el reporte");
      console.error("Error generating report:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleGenerate = () => {
    if (exportFormat.pdf) {
      generateReport('pdf');
    } else if (exportFormat.excel) {
      generateReport('excel');
    }
    setShowExportModal(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Reporte de Inspecciones Vehiculares</h1>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicial</label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha final</label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>
      <Button
        onClick={fetchReporte}
        className="bg-blue-600 text-white mb-4"
        disabled={isLoadingC}
      >
        {isLoadingC ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Consultando...
          </>
        ) : (
          "Consultar"
        )}
      </Button>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Tabla o mensaje */}
      <div className="mt-4">
        {filteredData.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Resultados de Inspecciones Vehiculares</h2>
              <Button variant="outline"
                disabled={isLoading}
                onClick={() => setShowExportModal(true)} className="flex items-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4" />
                    Generar Reporte
                  </>
                )}
                {/* Fondo oscuro detrás del modal */}
                {showExportModal && (
                  <div className="fixed inset-0 bg-stone-400 bg-opacity-10 z-40"></div>
                )}
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-700 text-sm shadow-gray-400 shadow-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="border px-4 py-2">Id Revista</th>
                    <th className="border px-4 py-2">Fecha de Inspección</th>
                    <th className="border px-4 py-2">No. de Concesión</th>
                    <th className="border px-4 py-2">Trámite</th>
                    <th className="border px-4 py-2">Concesionario</th>
                    <th className="border px-4 py-2">Modalidad</th>
                    <th className="border px-4 py-2">Municipio</th>
                    <th className="border px-4 py-2">Inspector</th>
                    <th className="border px-4 py-2">Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{item.IdRevistaVehicular}</td>
                      <td className="border px-4 py-2">{new Date(item.FechaInspeccion).toLocaleString('es-MX')}</td>
                      <td className="border px-4 py-2">{item.IdConsesion}</td>
                      <td className="border px-4 py-2">{item.Tramite}</td>
                      <td className="border px-4 py-2">{item.Concesionario}</td>
                      <td className="border px-4 py-2">{item.Modalidad}</td>
                      <td className="border px-4 py-2">{item.Municipio}</td>
                      <td className="border px-4 py-2">{item.Inspector}</td>
                      <td className="border px-4 py-2">{item.Observaciones}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : hasSearched ? (
          <div className="text-center text-gray-500 py-10">
            <p>No se encontraron inspecciones en el rango seleccionado.</p>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10">
            <p>Ingresa un rango de fechas para consultar inspecciones.</p>
          </div>
        )}
      </div>

      {/* Modal de exportación */}
      <Dialog
        open={showExportModal}
        onOpenChange={setShowExportModal}
      >
        <DialogContent className="sm:max-w-[480px] bg-white border text-black">
          <DialogHeader>
            <DialogTitle>Configurar Reporte</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label className="text-sm font-medium">Formato de exportación</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pdf-format"
                  checked={exportFormat.pdf}
                  onCheckedChange={(checked) => setExportFormat({ ...exportFormat, pdf: Boolean(checked) })}
                />
                <Label htmlFor="pdf-format">PDF</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="excel-format"
                  checked={exportFormat.excel}
                  onCheckedChange={(checked) => setExportFormat({ ...exportFormat, excel: Boolean(checked) })}
                />
                <Label htmlFor="excel-format">Excel</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Logo (opcional)</Label>
              <Input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              {previewUrl && (
                <div className="border p-2 bg-gray-50 text-center">
                  <img src={previewUrl} alt="Preview" className="max-h-32 mx-auto" />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowExportModal(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGenerate}
                className="bg-blue-600 text-white"
                disabled={!exportFormat.pdf && !exportFormat.excel}
              >
                Generar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
