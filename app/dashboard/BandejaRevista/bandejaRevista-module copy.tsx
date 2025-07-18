'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { X, ImagePlus, Trash2, Check, XCircle, Printer, Loader2, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
// import generarPdf 
import { generarPDF, savePDF } from "@/lib/pdfGenerator"

interface SelectedImage {
  id: string;
  file?: File;
  type: string;
  previewUrl: string;
  customName?: string;
  isNew: boolean;
}

interface VehicleData {
  IdRevistaVehicular: string;
  Folio: string;
  IdConsesion: number;
  Placa: string;
  Propietario: string;
  IdTramite?: number;
  Modalidad: string;
  Municipio: string;
  FechaInspeccion: string;
  Estatus: string;
}

export default function BandejaRevistaModule() {
  const [concession, setConcession] = useState('');
  const [plate, setPlate] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [filteredData, setFilteredData] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [apiImageTypes, setApiImageTypes] = useState<{ value: string; label: string }[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // PDF generation state
  const [pdfLoading, setPdfLoading] = useState<string | null>(null)

  useEffect(() => {
    const fetchImageTypes = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/revista/tipos-imagen', {
          withCredentials: true,
        });

        const rawTypes = response.data.data;
        const formattedTypes = rawTypes.map((type: any) => ({
          value: type.IdTipoImagen.toString(),
          label: type.TipoImagen,
        }));
        setApiImageTypes(formattedTypes);
      } catch (err) {
        console.error('Error al obtener tipos de imagen:', err);
        if (axios.isAxiosError(err) && err.response) {
          toast.error(err.response.data.error || 'No se pudieron cargar los tipos de imagen.');
        } else {
          toast.error('No se pudieron cargar los tipos de imagen.');
        }
      }
    };
    fetchImageTypes();
  }, []);

  const fetchRevistas = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (concession) params.append('noConcesion', concession);
      if (plate) params.append('placa', plate);
      if (status && status !== 'all') params.append('estatus', status);
      if (startDate) params.append('fechaInicio', startDate);
      if (endDate) params.append('fechaFin', endDate);
      if (municipality) params.append('municipio', municipality);

      const response = await axios.get(`http://localhost:3000/api/revista/buscar?${params.toString()}`, {
        withCredentials: true,
      });

      setFilteredData(response.data.data || []);
      if (response.data.data && response.data.data.length > 0) {
        toast.success(`Se encontraron ${response.data.data.length} registros.`);
      } else {
        toast.info('No se encontraron registros.');
      }
    } catch (err) {
      console.error('Error en búsqueda:', err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'Error al buscar revistas vehiculares. Intente de nuevo.');
        if (err.response.status === 404) {
          setFilteredData([]);
          toast.info('No se encontraron revistas vehiculares con los criterios de búsqueda.');
        } else {
          toast.error(err.response.data.error || 'Error al buscar revistas vehiculares.');
        }
      } else {
        setError('Error al buscar revistas vehiculares. Intente de nuevo.');
        toast.error('Error al buscar revistas vehiculares.');
      }
      setFilteredData([]);
    } finally {
      setLoading(false);
      setSelectedRowId(null);
      setSelectedVehicle(null);
      setSelectedImages([]);
    }
  };

  const handleSearch = () => {
    fetchRevistas();
  };

  const handleClearFilters = () => {
    setConcession('');
    setPlate('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    setMunicipality('');
    setFilteredData([]);
    setError('');
    setSelectedRowId(null);
    setSelectedVehicle(null);
    setSelectedImages([]);
    toast.info('Filtros de búsqueda limpiados.');
  };

  const fetchExistingImages = useCallback(async (idRevistaVehicular: string) => {
    setImageLoading(true);
    try {
      console.log('Fetching images for ID:', idRevistaVehicular);
      const response = await axios.get(`http://localhost:3000/api/revista/${idRevistaVehicular}/imagenes`, {
        withCredentials: true,
      });

      const rawImages = response.data.data;
      console.log('Fetched images:', rawImages);

      if (!Array.isArray(rawImages)) {
        console.error('API response data is not an array:', rawImages);
        toast.error('Formato de respuesta de imágenes inesperado del servidor.');
        return [];
      }

      const existingImages: SelectedImage[] = rawImages.map((img: any) => {
        const imageId = img.IdImagen?.toString() ?? `temp-existing-${img.TipoImagen}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const mimeType = 'image/jpeg'; // Asumiendo JPEG por defecto si no se especifica

        if (!img.ImagenBase64) {
          console.warn(`Image with ID ${imageId} is missing ImagenBase64 and will be skipped.`);
          return null;
        }

        return {
          id: imageId,
          type: img.TipoImagen?.toString() ?? '',
          previewUrl: `data:${mimeType};base64,${img.ImagenBase64}`,
          customName: apiImageTypes.find(t => t.value === img.TipoImagen?.toString())?.label || `Imagen existente (${imageId.slice(0, 8)}...)`,
          isNew: false,
        };
      }).filter(Boolean) as SelectedImage[];

      toast.success(`Se cargaron ${existingImages.length} imágenes existentes.`);
      return existingImages;
    } catch (err) {
      console.error('Error al cargar imágenes existentes:', err);
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 404) {
          toast.info('No se encontraron imágenes existentes para este vehículo.');
          return [];
        }
        toast.error(err.response.data.error || 'Error al cargar las imágenes existentes.');
      } else {
        toast.error('Error al cargar las imágenes existentes.');
      }
      return [];
    } finally {
      setImageLoading(false);
    }
  }, [apiImageTypes]);

  useEffect(() => {
    if (selectedVehicle) {
      // Revocar URLs de imágenes nuevas previas si se selecciona otro vehículo
      selectedImages.filter(img => img.isNew).forEach(img => URL.revokeObjectURL(img.previewUrl));
      setSelectedImages([]);

      fetchExistingImages(selectedVehicle.IdRevistaVehicular).then(images => {
        setSelectedImages(images);
      });
    } else {
      // Limpiar imágenes y revocar URLs cuando no hay vehículo seleccionado
      selectedImages.filter(img => img.isNew).forEach(img => URL.revokeObjectURL(img.previewUrl));
      setSelectedImages([]);
    }
  }, [selectedVehicle, fetchExistingImages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: SelectedImage[] = [];
      Array.from(files).forEach((file) => {
        if (!file.type.startsWith('image/')) {
          toast.error(`El archivo ${file.name} no es una imagen válida y no será agregado.`);
          return;
        }
        newImages.push({
          id: `${file.name}-${Date.now()}`, // ID único para nuevas imágenes
          file,
          type: '', // El tipo se asignará después
          previewUrl: URL.createObjectURL(file),
          isNew: true,
        });
      });
      setSelectedImages(prev => [...prev, ...newImages]);
      toast.success(`${newImages.length} nueva(s) imagen(es) seleccionada(s).`);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset the input to allow selecting the same file again
    }
  };

  const handleRemoveImage = async (id: string, isNew: boolean) => {
    const imageToRemove = selectedImages.find(img => img.id === id);
    if (!imageToRemove) return;

    if (!isNew && selectedVehicle) {
      const deleteToastId = toast.loading(`Eliminando imagen "${imageToRemove.customName || imageToRemove.id}"...`);
      try {
        await axios.delete(`http://localhost:3000/api/revista/imagen/${id}`, {
          withCredentials: true,
        });

        toast.success(`Imagen "${imageToRemove.customName || imageToRemove.id}" eliminada del servidor.`, { id: deleteToastId });
      } catch (err) {
        console.error('Error al eliminar imagen del servidor:', err);
        if (axios.isAxiosError(err) && err.response) {
          toast.error(err.response.data.error || 'Error al eliminar la imagen del servidor.', { id: deleteToastId });
        } else {
          toast.error('Error al eliminar la imagen del servidor.', { id: deleteToastId });
        }
        return; // Detener la eliminación local si falla la eliminación del servidor
      }
    }

    setSelectedImages(prev => {
      if (imageToRemove.isNew && imageToRemove.previewUrl) {
        URL.revokeObjectURL(imageToRemove.previewUrl); // Liberar URL de objeto para nuevas imágenes
      }
      toast.warning(`Imagen "${imageToRemove.customName || imageToRemove.file?.name || imageToRemove.id}" eliminada de la selección.`);
      return prev.filter(img => img.id !== id);
    });
  };

  const handleClearAllImages = () => {
    const newImagesToClear = selectedImages.filter(img => img.isNew);
    const existingImagesCount = selectedImages.length - newImagesToClear.length;

    if (existingImagesCount > 0) {
      toast.info(`Solo se eliminarán las imágenes nuevas de la selección. Las ${existingImagesCount} imágenes existentes deben eliminarse individualmente.`);
    }

    newImagesToClear.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setSelectedImages(prev => prev.filter(img => !img.isNew)); // Solo mantiene las imágenes existentes (no nuevas)
    toast.info('Las imágenes nuevas han sido eliminadas de la selección.');
  };

  const handleTypeChange = (id: string, newType: string) => {
    setSelectedImages(prev =>
      prev.map(img =>
        img.id === id ? { ...img, type: newType, customName: apiImageTypes.find(t => t.value === newType)?.label || img.file?.name || img.id } : img
      )
    );
  };

  const handleSaveImages = async () => {
    if (!selectedVehicle) {
      toast.error('No hay un vehículo seleccionado para guardar imágenes.');
      return;
    }

    const imagesToUpload = selectedImages.filter(img => img.isNew);

    if (imagesToUpload.length === 0) {
      toast.info('No hay imágenes nuevas para guardar.');
      return;
    }

    const imagesWithoutType = imagesToUpload.filter(img => !img.type);
    if (imagesWithoutType.length > 0) {
      toast.error('Por favor, asigne un tipo a todas las nuevas imágenes antes de guardar.');
      return;
    }

    setImageLoading(true);
    const saveToastId = toast.loading(`Guardando ${imagesToUpload.length} imagen(es) nueva(s)...`);

    try {
      const uploadPromises = imagesToUpload.map(async (img) => {
        const formData = new FormData();
        formData.append('idRV', selectedVehicle.IdRevistaVehicular);
        formData.append('tipoImagen', img.type);
        if (img.file) {
          formData.append('imagen', img.file, img.customName || img.file.name);
        } else {
          throw new Error('No se encontró el archivo para una imagen nueva.');
        }

        await axios.post('http://localhost:3000/api/revista/imagen', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });
      });

      await Promise.all(uploadPromises);

      toast.success(`Se guardaron ${imagesToUpload.length} imagen(es) nueva(s) para el vehículo con placa ${selectedVehicle.Placa}.`, { id: saveToastId });

      // Volver a cargar las imágenes para actualizar la vista y marcar las subidas como no nuevas
      await fetchExistingImages(selectedVehicle.IdRevistaVehicular);

    } catch (err) {
      console.error('Error al guardar imágenes:', err);
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.error || 'Error al guardar las imágenes. Intente de nuevo.', { id: saveToastId });
      } else {
        toast.error('Error al guardar las imágenes. Intente de nuevo.', { id: saveToastId });
      }
    } finally {
      setImageLoading(false);
    }
  };
  const handlePrintRevista = async (idRevistaVehicular: string, folio: string) => {
    setPdfLoading(idRevistaVehicular)

    try {
      console.log(`Generando PDF para revista ${idRevistaVehicular}...`)

      // Generate PDF using the imported function
      const pdfDoc = await generarPDF(idRevistaVehicular)

      // Save PDF with folio as filename
      const filename = `Revista_Vehicular_${folio || idRevistaVehicular}`
      savePDF(pdfDoc, filename)

      // Update status to 'Impreso' in the local state
      setFilteredData((prevData) =>
        prevData.map((item) =>
          item.IdRevistaVehicular === idRevistaVehicular ? { ...item, Estatus: "Impreso" } : item,
        ),
      )

      console.log("PDF generado y descargado exitosamente")
    } catch (error) {
      console.error("Error al generar PDF:", error)
      setError("Error al generar el PDF. Intente nuevamente.")
    } finally {
      setPdfLoading(null)
    }
  }
  // const handlePrintRevista = async (idRevistaVehicular: string, currentFolio: string) => {
  //   toast.loading(`Registrando impresión para Folio: ${currentFolio}...`, { id: 'print-toast' });
  //   try {
  //     const response = await axios.post('http://localhost:3000/api/revista/imprimir', {
  //       idRV: parseInt(idRevistaVehicular, 10),
  //       folio: currentFolio
  //     }, {
  //       withCredentials: true,
  //     });

  //     toast.success(response.data.message || 'Registro de impresión exitoso.', { id: 'print-toast' });
  //     setFilteredData(prevData =>
  //       prevData.map(item =>
  //         item.IdRevistaVehicular === idRevistaVehicular
  //           ? { ...item, Estatus: 'Impreso' }
  //           : item
  //       )
  //     );
  //   } catch (error) {
  //     console.error('Error al intentar imprimir la revista:', error);
  //     if (axios.isAxiosError(error) && error.response) {
  //       toast.error(error.response.data.error || 'Error al registrar la impresión.', { id: 'print-toast' });
  //     } else {
  //       toast.error('Error de red o comunicación al intentar imprimir la revista.', { id: 'print-toast' });
  //     }
  //   }
  // };

  const handleRowSelect = (vehicle: VehicleData) => {
    if (selectedRowId === vehicle.IdRevistaVehicular) {
      setSelectedRowId(null);
      setSelectedVehicle(null);
      setSelectedImages([]);
      toast.info('Fila deseleccionada.');
    } else {
      setSelectedRowId(vehicle.IdRevistaVehicular);
      setSelectedVehicle(vehicle);
      toast.success(`Fila ${vehicle.Placa} seleccionada.`);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 rounded-lg shadow-xl flex flex-col lg:flex-row gap-4 md:gap-6 h-[calc(100vh-2rem)]">
      {/* Main search and table section */}
      <div className="flex-1 overflow-hidden flex flex-col bg-white p-4 rounded-lg shadow-md">
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800">Búsqueda de Revista Vehicular</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4">
          <Input placeholder="No. Concesión" value={concession} onChange={e => setConcession(e.target.value)} className="h-10 border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
          <Input placeholder="Placa" value={plate} onChange={e => setPlate(e.target.value)} className="h-10 border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-10 border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500">
              <SelectValue placeholder="Estatus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Registrado">Registrado</SelectItem>
              <SelectItem value="Impreso">Impreso</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" placeholder="Fecha inicial" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-10 border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
          <Input type="date" placeholder="Fecha final" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-10 border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
          <Input placeholder="Municipio" value={municipality} onChange={e => setMunicipality(e.target.value)} className="h-10 border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
        </div>

        <div className="flex gap-2 md:gap-3 mb-4 md:mb-6 justify-end">
          <Button onClick={handleSearch} disabled={loading} className="h-9 md:h-10 bg-purple-600 hover:bg-purple-700 text-white shadow-md">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
          <Button variant="outline" onClick={handleClearFilters} disabled={loading} className="h-9 md:h-10 border-gray-300 hover:bg-gray-100 text-gray-700 shadow-sm">
            Limpiar
          </Button>
        </div>

        {error && <p className="text-red-600 bg-red-50 p-3 rounded-md mb-4 text-center text-sm md:text-base border border-red-200">{error}</p>}

        <div className="flex-1 overflow-auto border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sel.</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Impr.</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Id Revista</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Folio</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Concesión</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider max-w-[100px] sm:max-w-[120px] overflow-hidden">Trámite</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Placa</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider max-w-[120px] sm:max-w-[150px] overflow-hidden">Concesionario</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Modalidad</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estatus</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[100px] sm:w-[120px] overflow-hidden">Fecha</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider max-w-[100px] sm:max-w-[120px] overflow-hidden">Municipio</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length === 0 && !loading ? (
                <tr>
                  <td colSpan={12} className="px-4 py-4 text-center text-gray-500 text-sm">
                    No hay datos disponibles. Realice una búsqueda.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={item.IdRevistaVehicular}
                    className={`cursor-pointer transition-colors ${selectedRowId === item.IdRevistaVehicular ? 'bg-purple-50 hover:bg-purple-100' : 'hover:bg-gray-50'}`}
                    onClick={() => handleRowSelect(item)}
                  >
                    <td className="px-3 py-2 text-center">
                      {selectedRowId === item.IdRevistaVehicular ? (
                        <Check className="h-4 w-4 text-purple-600 mx-auto" />
                      ) : (
                        <span className="text-gray-400"></span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); handlePrintRevista(item.IdRevistaVehicular, item.Folio); }}
                        disabled={item.Estatus === 'Impreso'}
                        className={`h-7 w-7 p-0 ${item.Estatus === 'Impreso' ? "opacity-50 cursor-not-allowed text-gray-400" : "text-green-600 hover:bg-green-50 hover:text-green-800"}`}
                        title={item.Estatus === 'Impreso' ? 'Ya impreso' : 'Imprimir'}
                      >
                        <Printer className="h-3 w-3" />
                      </Button>
                    </td>
                      <td className="px-3 py-2 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePrintRevista(item.IdRevistaVehicular, item.Folio)
                        }}
                        disabled={item.Estatus === "Impreso" || pdfLoading === item.IdRevistaVehicular}
                        className={`h-7 w-7 p-0 ${
                          item.Estatus === "Impreso"
                            ? "opacity-50 cursor-not-allowed text-gray-400"
                            : "text-green-600 hover:bg-green-50 hover:text-green-800"
                        }`}
                        title={item.Estatus === "Impreso" ? "Ya impreso" : "Imprimir"}
                      >
                        {pdfLoading === item.IdRevistaVehicular ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Printer className="h-3 w-3" />
                        )}
                      </Button>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800">{item.IdRevistaVehicular}</td>
                    <td className="px-3 py-2 text-sm text-gray-800">{item.Folio || 0}</td>
                    <td className="px-3 py-2 text-sm text-gray-800">{item.IdConsesion}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 max-w-[100px] sm:max-w-[120px] overflow-hidden text-ellipsis">{item.IdTramite || 'N/A'}</td>
                    <td className="px-3 py-2 text-sm text-gray-800">{item.Placa}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 max-w-[120px] sm:max-w-[150px] overflow-hidden text-ellipsis">{item.Propietario}</td>
                    <td className="px-3 py-2 text-sm text-gray-800">{item.Modalidad}</td>
                    <td className="px-3 py-2 text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.Estatus === 'Impreso' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                        {item.Estatus}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 w-[100px] sm:w-[120px] overflow-hidden text-ellipsis">
                      {item.FechaInspeccion ? new Date(item.FechaInspeccion).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 max-w-[100px] sm:max-w-[120px] overflow-hidden text-ellipsis">{item.Municipio}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image management section */}
      {selectedVehicle && (
        <div className="w-full lg:w-2/5 p-4 md:p-6 bg-white rounded-lg shadow-xl border border-gray-100 flex flex-col h-[calc(100vh-6rem)] lg:h-auto">
          <div className="flex justify-between items-center mb-3 border-b pb-3 border-gray-100">
            <h2 className="text-lg md:text-xl font-bold text-gray-800">
              Imágenes: <span className="text-purple-600">{selectedVehicle.Placa}</span>
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedRowId(null);
                setSelectedVehicle(null);
              }}
              className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0"
              title="Cerrar panel de imágenes"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-3 p-2 md:p-3 bg-purple-50 rounded-md shadow-sm text-xs md:text-sm text-purple-800">
            <ul className="space-y-1">
              <li><strong>Folio:</strong> {selectedVehicle.Folio}</li>
              <li><strong>Propietario:</strong> {selectedVehicle.Propietario}</li>
              <li><strong>Municipio:</strong> {selectedVehicle.Municipio}</li>
            </ul>
          </div>

          <div
            className="mb-3 border-2 border-dashed border-purple-300 rounded-lg p-3 md:p-4 text-center flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors bg-purple-50/50"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="h-6 w-6 md:h-8 md:w-8 text-purple-600 mb-1 md:mb-2" />
            <p className="text-xs md:text-sm text-gray-700 font-semibold">Haz clic o arrastra para añadir imágenes</p>
            <p className="text-[0.65rem] md:text-xs text-gray-500 mt-1">Soporta: JPG, PNG, GIF</p>
            <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          </div>

          {imageLoading && (
            <div className="flex justify-center items-center py-3 md:py-4">
              <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin text-purple-500 mr-2" />
              <p className="text-xs md:text-sm text-gray-600">Cargando imágenes...</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2"> {/* Added custom-scrollbar for better aesthetics */}
            {!imageLoading && selectedImages.length > 0 ? (
              <div className="space-y-2 md:space-y-3">
                <div className="flex justify-between items-center sticky top-0 bg-white z-10 py-1">
                  <h3 className="text-sm md:text-base font-semibold text-gray-800">
                    Imágenes ({selectedImages.length})
                    {selectedImages.some(img => img.isNew) && <span className="ml-2 text-xs text-orange-500">(Hay imágenes nuevas sin guardar)</span>}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAllImages}
                    className="text-orange-600 hover:bg-orange-50 hover:text-orange-800 text-xs md:text-sm h-7 md:h-8"
                    title="Eliminar todas las imágenes nuevas de la selección"
                  >
                    <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1" /> Vaciar Nuevas
                  </Button>
                </div>

                <div className="space-y-2 md:space-y-3 pb-2">
                  {selectedImages.map((img) => (
                    <div key={img.id} className={`flex items-start gap-2 md:gap-3 p-2 md:p-3 rounded-lg shadow-sm ${img.isNew ? 'bg-lime-50 border border-lime-200' : 'bg-gray-50 border border-gray-200'}`}>
                      <div className="relative flex-shrink-0">
                        <Image
                          src={img.previewUrl}
                          alt={img.customName || img.file?.name || img.id}
                          width={70}
                          height={70}
                          className="rounded-md object-cover border border-gray-200 w-[70px] h-[70px] aspect-square"
                          priority // Consider adding priority for initial images
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveImage(img.id, img.isNew)}
                          className="absolute -top-1 -right-1 h-5 w-5 md:h-6 md:w-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 shadow-sm transition-transform transform hover:scale-110"
                          title={img.isNew ? 'Quitar de la selección' : 'Eliminar del servidor'}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-medium text-gray-800 truncate mb-1">
                          {img.customName || img.file?.name || `Imagen ${img.id}`}
                        </p>
                        <Select value={img.type} onValueChange={(value) => handleTypeChange(img.id, value)} disabled={!img.isNew}>
                          <SelectTrigger className={`h-8 text-xs md:text-sm ${!img.isNew ? 'opacity-70 cursor-not-allowed bg-gray-100' : 'border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'}`}>
                            <SelectValue placeholder="Tipo de imagen" />
                          </SelectTrigger>
                          <SelectContent>
                            {apiImageTypes.map(type => (
                              <SelectItem key={type.value} value={type.value} className="text-xs md:text-sm">
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {img.isNew && !img.type && (
                          <p className="text-red-500 text-[0.6rem] mt-1 flex items-center">
                            <XCircle className="h-3 w-3 mr-1" /> Requiere tipo
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              !imageLoading && <p className="text-center text-gray-500 text-sm py-4">No hay imágenes seleccionadas. Añade una.</p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
            <Button
              onClick={handleSaveImages}
              disabled={imageLoading || !selectedImages.some(img => img.isNew)}
              className="h-9 md:h-10 bg-green-600 hover:bg-green-700 text-white shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {imageLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {imageLoading ? 'Guardando...' : 'Guardar Imágenes'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}