'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import axios from 'axios'; // Importa Axios
import { X, ImagePlus, Trash2, Check, XCircle, Printer, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Interfaz para la imagen seleccionada, incluyendo su archivo, tipo y URL de previsualización
interface SelectedImage {
  id: string; // Puede ser el IdImagenRevistaVehicular si ya existe en DB, o un ID temporal para nuevas imágenes
  file?: File; // Opcional para imágenes ya existentes que no tienen un objeto File
  type: string; // Tipo de imagen (ej., 'frontal', 'trasera')
  previewUrl: string; // URL para previsualizar la imagen (blob URL para nuevas, base64 para existentes)
  customName?: string; // Nombre personalizado opcional para la imagen
  isNew: boolean; // Indica si la imagen es nueva o ya existe en el servidor
}

// Interfaz para los datos del vehículo
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
  Estatus: string; // Este cambiará a 'Impreso' después de la impresión
}

export default function BandejaRevistaModule() {
  // --- Estados para la búsqueda y tabla ---
  const [concession, setConcession] = useState('');
  const [plate, setPlate] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [filteredData, setFilteredData] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Estados para la gestión de imágenes ---
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [apiImageTypes, setApiImageTypes] = useState<{ value: string; label: string }[]>([]);
  const [imageLoading, setImageLoading] = useState(false); // Nuevo estado para carga de imágenes

  // --- useEffect para cargar los tipos de imagen de la API usando Axios ---
  useEffect(() => {
    const fetchImageTypes = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/revista/tipos-imagen', {
          withCredentials: true, // Importante para manejar cookies de sesión
        });
        
        // Accede a response.data.data para obtener el array de tipos de imagen
        const rawTypes = response.data.data; 
        console.log(rawTypes)
        const formattedTypes = rawTypes.map((type: any) => ({
          value: type.IdTipoImagen.toString(), // Convertir IdTipoImagen a string
          label: type.TipoImagen,
        }));
        setApiImageTypes(formattedTypes);
      } catch (err) {
        console.error('Error al obtener tipos de imagen:', err);
        // Axios errors have a response property if it's an HTTP error
        if (axios.isAxiosError(err) && err.response) {
          toast.error(err.response.data.error || 'No se pudieron cargar los tipos de imagen.');
        } else {
          toast.error('No se pudieron cargar los tipos de imagen.');
        }
      }
    };
    fetchImageTypes();
  }, []);

  // Función para obtener los datos de la revista vehicular desde la API usando Axios
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

      // Axios automáticamente lanza un error para respuestas 4xx/5xx, así que no necesitamos if (!res.ok)
      // La data está en response.data
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
    }
  };

  // Manejador para el botón de búsqueda
  const handleSearch = () => {
    fetchRevistas();
  };

  // Manejador para limpiar los filtros de búsqueda
  const handleClearFilters = () => {
    setConcession('');
    setPlate('');
    setStatus(''); // Reinicia el estado del select a vacío para mostrar el placeholder
    setStartDate('');
    setEndDate('');
    setMunicipality('');
    setFilteredData([]);
    setError('');
    toast.info('Filtros de búsqueda limpiados.');
  };

  // --- Funciones para la gestión de imágenes ---

  // Carga las imágenes existentes para el vehículo seleccionado usando Axios
  const fetchExistingImages = useCallback(async (idRevistaVehicular: string) => {
    setImageLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/api/revista/${idRevistaVehicular}/imagenes`, {
        withCredentials: true,
      });
      
      const existingImages: SelectedImage[] = response.data.data.map((img: any) => ({
        id: img.IdImagenRevistaVehicular.toString(),
        type: img.IdTipoImagen.toString(), // Asegúrate de que el tipo coincida con los values de imageTypes
        previewUrl: `data:${img.MimeType};base64,${Buffer.from(img.DatosImagen).toString('base64')}`, // Convertir buffer a base64 URL
        customName: apiImageTypes.find(t => t.value === img.IdTipoImagen.toString())?.label || `Imagen #${img.IdImagenRevistaVehicular}`,
        isNew: false, // Estas imágenes ya existen en el servidor
      }));
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
  }, [apiImageTypes]); // Dependencia: apiImageTypes para obtener el label

  // Efecto para cargar imágenes existentes cuando se selecciona un vehículo
  useEffect(() => {
    if (selectedVehicle) {
      // Limpia las URLs de objetos existentes antes de cargar nuevas
      selectedImages.filter(img => img.isNew).forEach(img => URL.revokeObjectURL(img.previewUrl));
      setSelectedImages([]); // Limpia la selección actual antes de cargar

      fetchExistingImages(selectedVehicle.IdRevistaVehicular).then(images => {
        setSelectedImages(images);
      });
    } else {
      // Cuando se deselecciona el vehículo, limpia las URLs de objetos y las imágenes
      selectedImages.filter(img => img.isNew).forEach(img => URL.revokeObjectURL(img.previewUrl));
      setSelectedImages([]);
    }
  }, [selectedVehicle, fetchExistingImages]);

  // Maneja el cambio en la selección de archivos de imagen
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: SelectedImage[] = [];
      Array.from(files).forEach((file) => {
        // Validación simple para el tipo de archivo: debe ser una imagen
        if (!file.type.startsWith('image/')) {
          toast.error(`El archivo ${file.name} no es una imagen válida y no será agregado.`);
          return;
        }
        newImages.push({
          id: `${file.name}-${Date.now()}`, // ID único temporal para cada nueva imagen
          file,
          type: '', // Inicializa el tipo como vacío, el usuario lo seleccionará
          previewUrl: URL.createObjectURL(file), // Crea una URL para la previsualización
          isNew: true, // Marca esta imagen como nueva
        });
      });
      setSelectedImages(prev => [...prev, ...newImages]);
      toast.success(`${newImages.length} nueva(s) imagen(es) seleccionada(s).`);
    }
    // Limpia el valor del input para que el mismo archivo pueda ser seleccionado de nuevo si es necesario
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Elimina una imagen de la selección (y del servidor si ya existe) usando Axios
  const handleRemoveImage = async (id: string, isNew: boolean) => {
    const imageToRemove = selectedImages.find(img => img.id === id);
    if (!imageToRemove) return;

    if (!isNew && selectedVehicle) { // Si la imagen ya existe en el servidor
      const deleteToastId = toast.loading(`Eliminando imagen ${imageToRemove.customName || imageToRemove.id}...`);
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
        return; // No eliminar del estado local si falla el servidor
      }
    }

    // Si es una imagen nueva o la eliminación del servidor fue exitosa, la eliminamos del estado local
    setSelectedImages(prev => {
      if (imageToRemove.isNew && imageToRemove.previewUrl) {
        URL.revokeObjectURL(imageToRemove.previewUrl); // Libera la URL si es una imagen nueva
      }
      toast.warning(`Imagen "${imageToRemove.customName || imageToRemove.file?.name || imageToRemove.id}" eliminada de la selección.`);
      return prev.filter(img => img.id !== id);
    });
  };

  // Elimina todas las imágenes de la selección (solo las nuevas, las existentes requieren llamada a API individual)
  const handleClearAllImages = () => {
    const newImagesToClear = selectedImages.filter(img => img.isNew);
    const existingImagesCount = selectedImages.length - newImagesToClear.length;

    if (existingImagesCount > 0) {
      toast.info(`Solo se eliminarán las imágenes nuevas de la selección. Las ${existingImagesCount} imágenes existentes deben eliminarse individualmente.`);
    }

    newImagesToClear.forEach(img => URL.revokeObjectURL(img.previewUrl)); // Libera todas las URLs de objeto
    setSelectedImages(prev => prev.filter(img => !img.isNew)); // Mantiene solo las imágenes que ya existen
    toast.info('Las imágenes nuevas han sido eliminadas de la selección.');
  };

  // Actualiza el tipo de una imagen seleccionada
  const handleTypeChange = (id: string, newType: string) => {
    setSelectedImages(prev =>
      prev.map(img =>
        img.id === id ? { ...img, type: newType, customName: apiImageTypes.find(t => t.value === newType)?.label || img.file?.name || img.id } : img
      )
    );
  };

  // Guarda las imágenes seleccionadas (sube solo las nuevas a la API) usando Axios
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

    // Validación: Asegurarse de que todas las imágenes nuevas tengan un tipo asignado
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

        await axios.post('http://localhost:3000/api/revista/imagen', formData, { // Endpoint para subir imagen
          headers: {
            'Content-Type': 'multipart/form-data', // Axios maneja esto automáticamente con FormData
          },
          withCredentials: true,
        });
      });

      await Promise.all(uploadPromises);

      toast.success(`Se guardaron ${imagesToUpload.length} imagen(es) nueva(s) para el vehículo con placa ${selectedVehicle.Placa}.`, { id: saveToastId });

      // Volver a cargar las imágenes para reflejar los cambios y obtener los IDs reales del servidor
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

  // --- Función para manejar la impresión de la revista usando Axios ---
  const handlePrintRevista = async (idRevistaVehicular: string, currentFolio: string) => {
    toast.loading(`Registrando impresión para Folio: ${currentFolio}...`, { id: 'print-toast' });
    try {
      const response = await axios.post('http://localhost:3000/api/revista/imprimir', {
        idRV: parseInt(idRevistaVehicular, 10),
        folio: currentFolio
      }, {
        withCredentials: true,
      });

      toast.success(response.data.message || 'Registro de impresión exitoso.', { id: 'print-toast' });
      // Actualiza el estado local de la fila a 'Impreso'
      setFilteredData(prevData =>
        prevData.map(item =>
          item.IdRevistaVehicular === idRevistaVehicular
            ? { ...item, Estatus: 'Impreso' } // Asumiendo 'Impreso' es el estado después de imprimir
            : item
        )
      );
    } catch (error) {
      console.error('Error al intentar imprimir la revista:', error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.error || 'Error al registrar la impresión.', { id: 'print-toast' });
      } else {
        toast.error('Error de red o comunicación al intentar imprimir la revista.', { id: 'print-toast' });
      }
    }
  };

  // Si hay un vehículo seleccionado, muestra la interfaz de gestión de imágenes
  if (selectedVehicle) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <Button variant="outline" className="mb-6 flex items-center" onClick={() => setSelectedVehicle(null)}>
          <X className="h-4 w-4 mr-2" /> Volver a tabla
        </Button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Gestión de Imágenes para <span className="text-blue-600">{selectedVehicle.Placa}</span>
        </h2>
        {/* Aquí eliminamos el borde azul y agregamos una sombra al div */}
        <div className="mb-6 p-4 bg-blue-50 rounded-md shadow-sm"> {/* Aplicamos sombra aquí */}
          <ul className="text-sm text-gray-700">
            <li><strong>Folio:</strong> {selectedVehicle.Folio}</li>
            <li><strong>Propietario:</strong> {selectedVehicle.Propietario}</li>
            <li><strong>Modalidad:</strong> {selectedVehicle.Modalidad}</li>
            <li><strong>Municipio:</strong> {selectedVehicle.Municipio}</li>
            <li><strong>Fecha Inspección:</strong> {selectedVehicle.FechaInspeccion ? new Date(selectedVehicle.FechaInspeccion).toLocaleDateString('es-MX') : 'N/A'}</li>
          </ul>
        </div>

        {/* Área para seleccionar archivos */}
        <div className="mb-6 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}>
          <ImagePlus className="h-10 w-10 text-gray-500 mb-2" />
          <p className="text-gray-600 font-medium">Arrastra tus imágenes aquí o haz clic para seleccionar</p>
          <p className="text-xs text-gray-500 mt-1">Soporta múltiples archivos (JPG, PNG, GIF)</p>
          <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        </div>

        {/* Indicador de carga para imágenes */}
        {imageLoading && (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
            <p className="text-gray-600">Cargando imágenes...</p>
          </div>
        )}

        {/* Visualización de imágenes seleccionadas */}
        {!imageLoading && selectedImages.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Imágenes Seleccionadas ({selectedImages.length})</h3>
            {selectedImages.map((img) => (
              <div key={img.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="relative flex-shrink-0">
                  <Image
                    src={img.previewUrl}
                    alt={img.customName || img.file?.name || img.id}
                    width={120}
                    height={120}
                    className="rounded-md object-cover border border-gray-200"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveImage(img.id, img.isNew)} // Pasa isNew para decidir si llamar a la API
                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 shadow-sm transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    <span className="sr-only">Eliminar imagen</span>
                  </Button>
                </div>
                <div className="flex-1 w-full sm:min-w-0">
                  <p className="text-base font-medium text-gray-800 truncate mb-1">
                    {img.customName || img.file?.name || `Imagen ${img.id}`} {/* Muestra customName si existe */}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    {img.file ? `Tamaño: ${(img.file.size / (1024 * 1024)).toFixed(2)} MB` : 'Imagen existente'}
                  </p>
                  <Select value={img.type} onValueChange={(value) => handleTypeChange(img.id, value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {apiImageTypes.map(type => ( // Usa los tipos de imagen cargados de la API
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <Button variant="destructive" onClick={handleClearAllImages} className="w-full sm:w-auto">
                <Trash2 className="h-4 w-4 mr-2" /> Vaciar Nuevas
              </Button>
              <Button onClick={handleSaveImages} disabled={selectedImages.filter(img => img.isNew).length === 0 || imageLoading} className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700">
                {imageLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : <><Check className="h-4 w-4 mr-2" /> Guardar imágenes</>}
              </Button>
            </div>
          </div>
        )}
        {!imageLoading && selectedImages.length === 0 && (
          <p className="text-center text-gray-500 py-8">No hay imágenes seleccionadas. ¡Agregue algunas!</p>
        )}
      </div>
    );
  }

  // Interfaz principal de búsqueda y tabla
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Búsqueda de Revista Vehicular</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <Input placeholder="No. Concesión" value={concession} onChange={e => setConcession(e.target.value)} />
        <Input placeholder="Placa" value={plate} onChange={e => setPlate(e.target.value)} />
        {/* Corrección del Select de Estatus: "Todos" ahora tiene un valor "all" */}
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Estatus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Registrado">Registrado</SelectItem>
            <SelectItem value="Impreso">Impreso</SelectItem>
            <SelectItem value="all">Todos</SelectItem> {/* Valor no vacío para "Todos" */}
          </SelectContent>
        </Select>
        <Input type="date" placeholder="Fecha inicial" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <Input type="date" placeholder="Fecha final" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <Input placeholder="Municipio" value={municipality} onChange={e => setMunicipality(e.target.value)} />
      </div>

      <div className="flex gap-3 mb-6 justify-end">
        <Button onClick={handleSearch} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
          {loading ? 'Buscando...' : 'Buscar'}
        </Button>
        <Button variant="outline" onClick={handleClearFilters} disabled={loading}>
          Limpiar
        </Button>
      </div>

      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imprimir</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imágenes</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Id Revista</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Folio</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. de Concesión</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trámite</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concesionario</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modalidad</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Inspección</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Municipio</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length === 0 && !loading && (
              <tr>
                <td colSpan={12} className="px-4 py-4 text-center text-gray-500">
                  No hay datos disponibles. Realice una búsqueda.
                </td>
              </tr>
            )}
            {filteredData.map((item) => (
              <tr key={item.IdRevistaVehicular} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePrintRevista(item.IdRevistaVehicular, item.Folio)}
                    disabled={item.Estatus === 'Impreso'}
                    className={item.Estatus === 'Impreso' ? "opacity-60 cursor-not-allowed" : "text-blue-600 hover:text-blue-800"}
                    title={item.Estatus === 'Impreso' ? 'Ya impreso' : 'Imprimir'}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <Button size="sm" variant="outline" onClick={() => setSelectedVehicle(item)} className="text-purple-600 hover:text-purple-800">
                    <ImagePlus className="h-4 w-4 mr-1" /> Ver/Subir
                  </Button>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{item.IdRevistaVehicular}</td>
                <td className="px-4 py-3 whitespace-nowrap">{item.Folio}</td>
                <td className="px-4 py-3 whitespace-nowrap">{item.IdConsesion}</td>
                <td className="px-4 py-3 whitespace-nowrap">{item.IdTramite || 'N/A'}</td>
                <td className="px-4 py-3 whitespace-nowrap">{item.Placa}</td>
                <td className="px-4 py-3 whitespace-nowrap">{item.Propietario}</td>
                <td className="px-4 py-3 whitespace-nowrap">{item.Modalidad}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.Estatus === 'Impreso' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.Estatus}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{item.FechaInspeccion ? new Date(item.FechaInspeccion).toLocaleDateString('es-MX') : ''}</td>
                <td className="px-4 py-3 whitespace-nowrap">{item.Municipio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}