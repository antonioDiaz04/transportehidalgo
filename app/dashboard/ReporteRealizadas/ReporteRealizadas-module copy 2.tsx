'use client';

import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileDown, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ReportResponse {
  data: any[];
  message: string;
}

export default function ReporteRealizadas() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState({
    pdf: true,
    excel: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add missing state for filtered data and search status
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };
  const fetchReporte = async () => {
    if (!startDate || !endDate) {
      setError("Selecciona ambas fechas");
      return;
    }

    try {
      const response = await axios.get('http://localhost:3000/api/reporte/inspecciones', {
        params: { fechaInicio: startDate, fechaFin: endDate, page: 1 },
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      setFilteredData(response.data.data || []);
      setError('');
    } catch (error) {
      setError("Error al obtener el reporte");
    } finally {
      setHasSearched(true);
    }
  };
  const generateReport = async (format: 'json' | 'excel' | 'pdf' = 'json') => {
    if (!startDate || !endDate) {
      setError("Selecciona ambas fechas");
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('fechaInicio', startDate);
      formData.append('fechaFin', endDate);
      formData.append('format', format);
      formData.append('allPages', 'true');

      if (previewUrl && fileInputRef.current?.files?.[0]) {
        formData.append('logo', fileInputRef.current.files[0]);
      }

      const response = await axios.post(
        'http://localhost:3000/api/reporte/inspecciones',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
          responseType: format === 'json' ? 'json' : 'blob'
        }
      );

      if (format === 'json') {
        // Manejar respuesta JSON (previsualización)
        console.log(response.data);
      } else {
        // Manejar descarga de archivo
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `reporte_inspecciones.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

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
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha final</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
     
     <div className="flex gap-4 justify-end mb-4">

        <Button onClick={fetchReporte} className="bg-blue-600 text-white mb-4">Consultar</Button>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <Button
        onClick={() => setShowExportModal(true)}
        className="bg-blue-600 text-white mb-4"
        disabled={isLoading}
      >
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