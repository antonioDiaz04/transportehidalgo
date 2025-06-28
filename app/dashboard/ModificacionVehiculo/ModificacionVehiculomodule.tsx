'use client'

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type VehiculoData = {
  idConcesion: string;
  idVehiculo: string;
  clase: string;
  placaAnterior: string;
  placaAsignada: string;
  tipo: string;
  categoria: string;
  marca: string;
  subMarca: string;
  version: string;
  numeroPasajeros: string;
  modelo: string;
  numeroToneladas: string;
  numeroMotor: string;
  numeroSerie: string;
  capacidad: string;
  estatus: string;
};

type SeguroData = {
  aseguradora: string;
  numeroPoliza: string;
  folioPago: string;
  fechaExpedicion: string;
  fechaVencimiento: string;
  observaciones: string;
};

const Field = ({ label, value, readonly = false, onChange, type = "text", className = "" }: {
  label: string;
  value: string;
  readonly?: boolean;
  onChange?: (value: string) => void;
  type?: string;
  className?: string;
}) => (
  <div className="flex flex-col space-y-1">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <Input
      type={type}
      value={value}
      readOnly={readonly}
      className={`rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${readonly ? "bg-gray-100 cursor-not-allowed" : "bg-white"
        } ${className}`}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
    />
  </div>
);

export default function VehiculoSeguroModule() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idConcesion = searchParams.get('idC');
  const idVehiculo = searchParams.get('idV');

  const [activeTab, setActiveTab] = useState("vehiculo");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [vehiculoData, setVehiculoData] = useState<VehiculoData>({
    idConcesion: "",
    idVehiculo: "",
    clase: "",
    placaAnterior: "",
    placaAsignada: "",
    tipo: "",
    categoria: "",
    marca: "",
    subMarca: "",
    version: "",
    numeroPasajeros: "",
    modelo: "",
    numeroToneladas: "",
    numeroMotor: "",
    numeroSerie: "",
    capacidad: "",
    estatus: ""
  });

  const [seguroData, setSeguroData] = useState<SeguroData>({
    aseguradora: "",
    numeroPoliza: "",
    folioPago: "",
    fechaExpedicion: "",
    fechaVencimiento: "",
    observaciones: ""
  });

  useEffect(() => {
    if (idConcesion && idVehiculo) {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `http://localhost:3000/api/concesion/${idConcesion}/vehiculo/${idVehiculo}`,
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          );
          console.log("Respuesta de la API:", response.data);

          const data = response.data?.data;

          // Datos del vehículo
          if (data?.vehiculo) {
            setVehiculoData({
              idConcesion: data.aseguradora?.IdConcesion?.toString() || "",
              idVehiculo: data.vehiculo.IdVehiculo?.toString() || "",
              clase: data.vehiculo.ClaseVehiculo || "",
              placaAnterior: data.vehiculo.PlacaAnterior || "",
              placaAsignada: data.vehiculo.PlacaAsignada || "",
              tipo: data.vehiculo.TipoVehiculo || "",
              categoria: data.vehiculo.Categoria || "",
              marca: data.vehiculo.Marca || "",
              subMarca: data.vehiculo.SubMarca || "",
              version: data.vehiculo.Version || "",
              numeroPasajeros: data.vehiculo.NumeroPasajeros?.toString() || "",
              modelo: data.vehiculo.Modelo?.toString() || "",
              numeroToneladas: data.vehiculo.NumeroToneladas?.toString() || "",
              numeroMotor: data.vehiculo.Motor || "",
              numeroSerie: data.vehiculo.SerieNIV || "",
              capacidad: data.vehiculo.Capacidad || "",
              estatus: data.vehiculo.IdEstatus?.toString() || "",
            });
          }

          // Datos del seguro
          if (data?.aseguradora) {
            setSeguroData({
              aseguradora: data.aseguradora.NombreAseguradora || "",
              numeroPoliza: data.aseguradora.NumeroPoliza || "",
              folioPago: data.aseguradora.FolioPago || "",
              fechaExpedicion: data.aseguradora.FechaExpedicion?.substring(0, 10) || "",
              fechaVencimiento: data.aseguradora.FechaVencimiento?.substring(0, 10) || "",
              observaciones: data.aseguradora.Observaciones || "",
            });
          }

          setLoading(false);
        } catch (err) {
          setError("Error al cargar los datos");
          setLoading(false);
          console.error("Error fetching data:", err);
        }
      };

      fetchData();
    }
  }, [idConcesion]);

  const handleVehiculoChange = (field: keyof VehiculoData, value: string) => {
    setVehiculoData(prev => ({ ...prev, [field]: value }));
  };

  const handleSeguroChange = (field: keyof SeguroData, value: string) => {
    setSeguroData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    if (!vehiculoData.numeroSerie || !seguroData.numeroPoliza) {
      alert("Complete los campos obligatorios");
      return;
    }

    try {
      // Aquí iría tu llamada API para guardar los cambios
      await axios.put(`http://localhost:3000/api/concesion/${idConcesion}`, {
        vehiculo: vehiculoData,
        seguro: seguroData
      }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      });

      alert("Cambios guardados con éxito!");
      router.back();
    } catch (err) {
      alert("Error al guardar los cambios");
      console.error("Error saving data:", err);
    }
  };

  const vehiculoFields = [
    { key: 'idConcesion', label: 'ID Concesión', readonly: true },
    { key: 'idVehiculo', label: 'ID Vehículo', readonly: true },
    { key: 'clase', label: 'Clase' },
    { key: 'placaAnterior', label: 'Placa Anterior' },
    { key: 'placaAsignada', label: 'Placa Asignada' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'marca', label: 'Marca' },
    { key: 'subMarca', label: 'SubMarca' },
    { key: 'version', label: 'Versión' },
    { key: 'numeroPasajeros', label: 'Número de Pasajeros', type: 'number' },
    { key: 'modelo', label: 'Modelo' },
    { key: 'numeroToneladas', label: 'Número de Toneladas' },
    { key: 'numeroMotor', label: 'Número de Motor' },
    { key: 'numeroSerie', label: 'Número de Serie' },
    { key: 'capacidad', label: 'Capacidad' },
    { key: 'estatus', label: 'Estatus' }
  ];

  const seguroFields = [
    { key: 'aseguradora', label: 'Aseguradora' },
    { key: 'numeroPoliza', label: 'Número de Póliza' },
    { key: 'folioPago', label: 'Folio de Pago' },
    { key: 'fechaExpedicion', label: 'Fecha de Expedición', type: 'date' },
    { key: 'fechaVencimiento', label: 'Fecha de Vencimiento', type: 'date' },
    { key: 'observaciones', label: 'Observaciones', className: 'md:col-span-2 lg:col-span-3' }
  ];

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-full mx-auto p-4 md:p-6">
      <Card className="shadow-sm shadow-[#e2e8f0] border border-gray-300 rounded-xl overflow-hidden">
        <CardHeader className="border-b bg-[#f7fafc] p-6">
          <div className="flex flex-col space-y-1.5">
            <h1 className="text-2xl font-extrabold text-gray-800">Detalle de Vehículo y Seguro</h1>
            <p className="text-sm text-gray-600">Administra la información de vehículos y sus pólizas asociadas</p>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Nuevo estilo de tabs con solo Vehículo y Seguro */}
          <div className="flex border-b border-gray-200">
            <button
              className={`px-5 py-3 font-medium text-sm relative transition-colors duration-200
                ${activeTab === "vehiculo"
                  ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-800'
                }
                focus:outline-none
              `}
              onClick={() => setActiveTab("vehiculo")}
            >
              Vehículo
            </button>
            <button
              className={`px-5 py-3 font-medium text-sm relative transition-colors duration-200
                ${activeTab === "seguro"
                  ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-800'
                }
                focus:outline-none
              `}
              onClick={() => setActiveTab("seguro")}
            >
              Seguro
            </button>
          </div>

          {/* Contenido del tab Vehículo */}
          {activeTab === "vehiculo" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 pt-6">
              {vehiculoFields.map((field) => (
                <Field
                  key={field.key}
                  label={field.label}
                  value={vehiculoData[field.key as keyof VehiculoData]}
                  readonly={field.readonly}
                  type={field.type}
                  onChange={(value) => handleVehiculoChange(field.key as keyof VehiculoData, value)}
                />
              ))}
            </div>
          )}

          {/* Contenido del tab Seguro */}
          {activeTab === "seguro" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 pt-6">
              {seguroFields.map((field) => (
                <Field
                  key={field.key}
                  label={field.label}
                  value={seguroData[field.key as keyof SeguroData]}
                  type={field.type}
                  className={field.className}
                  onChange={(value) => handleSeguroChange(field.key as keyof SeguroData, value)}
                />
              ))}
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-4 py-2 rounded-md text-sm"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm shadow-sm"
              onClick={handleSaveChanges}
            >
              Guardar cambios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}