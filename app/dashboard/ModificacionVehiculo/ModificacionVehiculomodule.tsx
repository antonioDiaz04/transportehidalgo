"use client";
import apiClient from "@/lib/apiClient";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FiArrowLeft } from "react-icons/fi";

// --- Definición de Tipos y Interfaces ---

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

interface FieldProps {
  label: string;
  value: string | number;
  type?: string;
  onChange: (value: string | number) => void;
  readonly?: boolean;
  disabled?: boolean;
}

interface SelectOption {
  value: string;
  label: string;
  [key: string]: any;
}

interface SelectFieldProps {
  label: string;
  value: string | number;
  options: SelectOption[];
  onChange?: (value: string | number) => void;
  readonly?: boolean;
  disabled?: boolean;
}

interface VehiculoData {
  IdConcesion: string;
  IdVehiculo: string;
  NumeroSerie: string;
  NumeroPasajeros: string;
  NumeroToneladas: string;
  NumeroMotor: string;
  Capacidad: string;
  ClaveCategoria: string;
  Clase: string;
  Marca: string;
  Submarca: string;
  Version: string;
  Tipo: string;
  PlacaAnterior: string;
  PlacaAsignada: string;
  IdEstatus: string;
  IdClase: string;
  IdMarca: string;
  IdSubMarca: string;
  IdVersion: string;
  IdCategoria: string;
  IdTipo: string;
  Modelo: string;
}

interface SeguroData {
  nombre: string;
  numeroPoliza: string;
  folioPago: string;
  fechaExp: string;
  fechaVence: string;
  observaciones: string;
}

interface Catalogos {
  clases: SelectOption[];
  tipos: SelectOption[];
  categorias: SelectOption[];
  marcas: SelectOption[];
  submarcas: SelectOption[];
  versiones: SelectOption[];
  estatus: SelectOption[];
}

type InputFieldPropsDynamic = {
  key: keyof VehiculoData;
  label: string;
  type: "text" | "number" | "date";
  value: string | number;
  readonly?: boolean;
  disabled?: boolean;
};

type SelectFieldPropsDynamic = {
  key: keyof VehiculoData;
  label: string;
  type: "select";
  options: SelectOption[];
  value: string | number;
  readonly?: boolean;
  disabled?: boolean;
};

type SeguroInputFieldPropsDynamic = {
  key: keyof SeguroData;
  label: string;
  type: "text" | "number" | "date";
  value: string | number;
  readonly?: boolean;
};

interface ToastState {
  message: string;
  type: "success" | "error";
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [message, type, onClose]);

  if (!message) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg text-white text-sm z-50 ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {message}
    </div>
  );
};

const Field: React.FC<FieldProps> = ({
  label,
  value,
  type = "text",
  onChange,
  readonly = false,
  disabled = false,
}) => (
  <div className="flex flex-col space-y-1">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <Input
      type={type}
      value={value ?? ""}
      readOnly={readonly}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className={`rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
    />
  </div>
);

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  options,
  onChange,
  readonly = false,
  disabled = false,
}) => {
  const normalizedValue = String(value ?? "");
  const formattedOptions = options || [];

  return (
    <div className="flex flex-col space-y-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={normalizedValue}
        disabled={disabled || readonly}
        className={`rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white p-2 border ${disabled || readonly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
        onChange={(e) => onChange?.(e.target.value)}
      >
        <option value="">Seleccione una opción</option>
        {formattedOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default function ModificacionVehiculo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idConcesion = searchParams.get("idC");
  const idVehiculo = searchParams.get("idV");

  const [activeTab, setActiveTab] = useState<"vehiculo" | "seguro">("vehiculo");
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [vehiculoData, setVehiculoData] = useState<VehiculoData>({} as VehiculoData);
  const [seguroData, setSeguroData] = useState<SeguroData>({
    nombre: "",
    numeroPoliza: "",
    folioPago: "",
    fechaExp: "",
    fechaVence: "",
    observaciones: "",
  });

  const [catalogos, setCatalogos] = useState<Catalogos>({
    clases: [],
    tipos: [],
    categorias: [],
    marcas: [],
    submarcas: [],
    versiones: [],
    estatus: [],
  });

  const formatOptions = useCallback(
    (arr: any[], idKey: string, labelKey: string): SelectOption[] => {
      if (!Array.isArray(arr)) return [];
      const uniqueOptionsMap = new Map();
      arr.forEach(item => {
        const idValue = String(item[idKey] ?? "");
        if (idValue !== "" && !uniqueOptionsMap.has(idValue)) {
          uniqueOptionsMap.set(idValue, {
            value: idValue,
            label: String(item[labelKey] ?? ""),
          });
        }
      });
      return Array.from(uniqueOptionsMap.values());
    },
    []
  );

  // useEffect para cargar los datos iniciales del vehículo y del seguro
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!idConcesion || !idVehiculo) {
        setToast({ message: "No se encontraron identificadores.", type: "error" });
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await apiClient(
          `/concesion/${idConcesion}/vehiculo/${idVehiculo}`,
          { method: 'GET', withCredentials: true }
        );
        const { vehiculo, aseguradora } = response.data || {};

        if (vehiculo) {
          const formattedVehiculoData = {
            IdConcesion: String(vehiculo.IdConcesion ?? idConcesion),
            IdVehiculo: String(vehiculo.IdVehiculo ?? idVehiculo),
            NumeroSerie: String(vehiculo.SerieNIV ?? ""),
            NumeroPasajeros: String(vehiculo.NumeroPasajeros ?? ""),
            NumeroToneladas: String(vehiculo.NumeroToneladas ?? ""),
            NumeroMotor: String(vehiculo.Motor ?? ""),
            Capacidad: String(vehiculo.Capacidad ?? ""),
            ClaveCategoria: String(vehiculo.ClaveCategoria ?? ""),
            Clase: String(vehiculo.ClaseVehiculo ?? ""),
            Marca: String(vehiculo.Marca ?? ""),
            Submarca: String(vehiculo.SubMarca ?? ""),
            Version: String(vehiculo.Version ?? ""),
            Tipo: String(vehiculo.TipoVehiculo ?? ""),
            PlacaAnterior: String(vehiculo.PlacaAnterior ?? ""),
            PlacaAsignada: String(vehiculo.PlacaAsignada ?? ""),
            IdEstatus: String(vehiculo.IdEstatus ?? ""),
            IdClase: String(vehiculo.IdClaseVehiculo ?? ""),
            IdMarca: String(vehiculo.IdMarca ?? ""),
            IdSubMarca: String(vehiculo.IdSubMarca ?? ""),
            IdVersion: String(vehiculo.IdVersion ?? ""),
            IdCategoria: String(vehiculo.IdCategoria ?? ""),
            IdTipo: String(vehiculo.IdTipoVehiculo ?? ""),
            Modelo: String(vehiculo.Modelo ?? ""),
          };
          
          setVehiculoData(formattedVehiculoData);
        }
        
        if (aseguradora) {
          setSeguroData({
            nombre: String(aseguradora.NombreAseguradora || ""),
            numeroPoliza: String(aseguradora.NumeroPoliza || ""),
            folioPago: String(aseguradora.FolioPago || ""),
            fechaExp: aseguradora.FechaExpedicion?.substring(0, 10) || "",
            fechaVence: aseguradora.FechaVencimiento?.substring(0, 10) || "",
            observaciones: String(aseguradora.Observaciones || ""),
          });
        }
      } catch (err) {
        console.error("Error al cargar datos iniciales:", err);
        setToast({ message: "Error al cargar los datos del vehículo.", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [idConcesion, idVehiculo]);

  // useEffect para cargar catálogos de clases, tipos y estatus (independientes)
  useEffect(() => {
    const fetchIndependentCatalogs = async () => {
      try {
        const [clasesRes, tiposRes] = await Promise.all([
          apiClient("/vehiculo/clases", { withCredentials: true }),
          apiClient("/vehiculo/tipos", { method: 'GET', withCredentials: true }),
        ]);

        const estatusOptions = [
          { value: "0", label: "No especificado" },
          { value: "1", label: "Activo/Asignado" },
          { value: "2", label: "Baja" },
          { value: "3", label: "Temporal" },
          { value: "4", label: "En trámite" },
          { value: "5", label: "Baja temporal" },
        ];

        setCatalogos(prev => ({
          ...prev,
          clases: formatOptions(clasesRes.data || [], "IdClase", "Clase"),
          tipos: formatOptions(tiposRes.data || [], "IdTipoVehiculo", "TipoVehiculo"),
          estatus: estatusOptions,
        }));
      } catch (err) {
        console.error("Error al cargar catálogos iniciales:", err);
        setToast({ message: "Error al cargar catálogos iniciales", type: "error" });
      }
    };
    fetchIndependentCatalogs();
  }, [formatOptions]);

  // useEffect para cargar categorías cuando IdClase cambie
  useEffect(() => {
    // El endpoint de categorías espera el parámetro 'idClase'
    if (vehiculoData.IdClase) {
      apiClient(`/vehiculo/categorias?idClase=${vehiculoData.IdClase}`, { method: 'GET', withCredentials: true })
        .then(res => {
          setCatalogos(prev => ({ ...prev, categorias: formatOptions(res.data, "IdCategoria", "Categoria") }));
        })
        .catch(err => {
          console.error("Error cargando categorías:", err);
          setToast({ message: "Error al cargar categorías", type: "error" });
        });
    } else {
      setCatalogos(prev => ({ ...prev, categorias: [] }));
    }
  }, [vehiculoData.IdClase, formatOptions]);

  // useEffect para cargar marcas cuando ClaveCategoria cambie
  useEffect(() => {
    // El endpoint de marcas espera el parámetro 'claveCategoria'
    if (vehiculoData.ClaveCategoria) {
      apiClient(`/vehiculo/marcas?claveCategoria=${vehiculoData.ClaveCategoria}`, { method: 'GET', withCredentials: true })
        .then(res => {
          setCatalogos(prev => ({ ...prev, marcas: formatOptions(res.data, "IdMarca", "Marca") }));
        })
        .catch(err => {
          console.error("Error cargando marcas:", err);
          setToast({ message: "Error al cargar marcas", type: "error" });
        });
    } else {
      setCatalogos(prev => ({ ...prev, marcas: [] }));
    }
  }, [vehiculoData.ClaveCategoria, formatOptions]);

  // useEffect para cargar submarcas cuando IdMarca y IdCategoria cambien
  useEffect(() => {
    // El endpoint de submarcas espera 'idMarca' e 'idCategoria'
    if (vehiculoData.IdMarca && vehiculoData.IdCategoria) {
      apiClient(`/vehiculo/submarcas?idMarca=${vehiculoData.IdMarca}&idCategoria=${vehiculoData.IdCategoria}`, { method: 'GET', withCredentials: true })
        .then(res => {
          setCatalogos(prev => ({ ...prev, submarcas: formatOptions(res.data, "IdSubMarca", "SubMarca") }));
        })
        .catch(err => {
          console.error("Error cargando submarcas:", err);
          setToast({ message: "Error al cargar submarcas", type: "error" });
        });
    } else {
      setCatalogos(prev => ({ ...prev, submarcas: [] }));
    }
  }, [vehiculoData.IdMarca, vehiculoData.IdCategoria, formatOptions]);

  // useEffect para cargar versiones cuando IdClase y IdSubMarca cambien
  useEffect(() => {
    // El endpoint de versiones espera 'idClase' e 'idSubMarca'
    if (vehiculoData.IdClase && vehiculoData.IdSubMarca) {
      apiClient(`/vehiculo/versiones?idClase=${vehiculoData.IdClase}&idSubMarca=${vehiculoData.IdSubMarca}`, { method: 'GET', withCredentials: true })
        .then(res => {
          setCatalogos(prev => ({ ...prev, versiones: formatOptions(res.data, "IdVersion", "Version") }));
        })
        .catch(err => {
          console.error("Error cargando versiones:", err);
          setToast({ message: "Error al cargar versiones", type: "error" });
        });
    } else {
      setCatalogos(prev => ({ ...prev, versiones: [] }));
    }
  }, [vehiculoData.IdClase, vehiculoData.IdSubMarca, formatOptions]);

  const handleVehiculoChange = useCallback((field: keyof VehiculoData, value: string) => {
    setVehiculoData(prev => {
      const newData = { ...prev, [field]: value };
      
      const nameMap: Record<keyof VehiculoData, keyof VehiculoData> = {
          IdClase: 'Clase',
          IdCategoria: 'ClaveCategoria',
          IdMarca: 'Marca',
          IdSubMarca: 'Submarca',
          IdVersion: 'Version',
          IdTipo: 'Tipo',
          IdEstatus: 'IdEstatus'
      } as any;

      const selectedOption = (() => {
        switch (field) {
            case "IdClase": return catalogos.clases.find(opt => opt.value === value);
            case "IdCategoria": return catalogos.categorias.find(opt => opt.value === value);
            case "IdMarca": return catalogos.marcas.find(opt => opt.value === value);
            case "IdSubMarca": return catalogos.submarcas.find(opt => opt.value === value);
            case "IdVersion": return catalogos.versiones.find(opt => opt.value === value);
            case "IdTipo": return catalogos.tipos.find(opt => opt.value === value);
            case "IdEstatus": return catalogos.estatus.find(opt => opt.value === value);
            default: return null;
        }
      })();

      if (selectedOption && nameMap[field]) {
          // Si el campo modificado es 'IdCategoria', actualizamos 'ClaveCategoria'
          if (field === 'IdCategoria') {
            (newData.ClaveCategoria as any) = selectedOption.label;
          } else {
            (newData[nameMap[field]] as any) = selectedOption.label;
          }
      }

      // Reinicia los campos dependientes cuando se cambia un campo padre
      if (field === "IdClase") {
          newData.IdCategoria = '';
          newData.ClaveCategoria = ''; // También reiniciamos ClaveCategoria
          newData.IdMarca = '';
          newData.IdSubMarca = '';
          newData.IdVersion = '';
          setCatalogos(prev => ({ ...prev, categorias: [], marcas: [], submarcas: [], versiones: [] }));
      } else if (field === "IdCategoria") {
          // El ID de categoría ya está en newData, lo usamos para el siguiente
          newData.IdMarca = '';
          newData.IdSubMarca = '';
          newData.IdVersion = '';
          setCatalogos(prev => ({ ...prev, marcas: [], submarcas: [], versiones: [] }));
      } else if (field === "IdMarca") {
          newData.IdSubMarca = '';
          newData.IdVersion = '';
          setCatalogos(prev => ({ ...prev, submarcas: [], versiones: [] }));
      } else if (field === "IdSubMarca") {
          newData.IdVersion = '';
          setCatalogos(prev => ({ ...prev, versiones: [] }));
      }
      
      return newData;
    });
  }, [catalogos]);

  const handleSeguroChange = useCallback(
    (field: keyof SeguroData, value: string) => {
        setSeguroData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const payload = {
        vehiculo: vehiculoData,
        seguro: seguroData
      };
      
      await apiClient(`/concesion/${idConcesion}/vehiculo/${idVehiculo}`, {
        method: 'PUT',
        data: payload,
        withCredentials: true,
      });
      setToast({ message: "Cambios guardados con éxito.", type: "success" });
    } catch (err) {
      console.error("Error al guardar:", err);
      setToast({ message: "Error al guardar los cambios.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const vehiculoFields: Array<SelectFieldPropsDynamic | InputFieldPropsDynamic> = [
    { key: "IdConcesion", label: "Id Concesión", type: "text", value: vehiculoData.IdConcesion, readonly: true, disabled: true },
    { key: "IdVehiculo", label: "Id Vehículo", type: "text", value: vehiculoData.IdVehiculo, readonly: true, disabled: true },
    { key: "IdClase", label: "Clase", type: "select", value: vehiculoData.IdClase, options: catalogos.clases, disabled: false },
    { key: "PlacaAnterior", label: "Placa Anterior", type: "text", value: vehiculoData.PlacaAnterior },
    { key: "PlacaAsignada", label: "Placa Asignada", type: "text", value: vehiculoData.PlacaAsignada },
    { key: "IdTipo", label: "Tipo", type: "select", value: vehiculoData.IdTipo, options: catalogos.tipos },
    { key: "IdCategoria", label: "Categoría", type: "select", value: vehiculoData.IdCategoria, options: catalogos.categorias },
    { key: "IdMarca", label: "Marca", type: "select", value: vehiculoData.IdMarca, options: catalogos.marcas },
    { key: "IdSubMarca", label: "SubMarca", type: "select", value: vehiculoData.IdSubMarca, options: catalogos.submarcas },
    { key: "IdVersion", label: "Versión", type: "select", value: vehiculoData.IdVersion, options: catalogos.versiones },
    { key: "NumeroPasajeros", label: "Número de Pasajeros", type: "number", value: vehiculoData.NumeroPasajeros },
    { key: "Modelo", label: "Modelo", type: "text", value: vehiculoData.Modelo },
    { key: "NumeroToneladas", label: "Número de Toneladas", type: "number", value: vehiculoData.NumeroToneladas },
    { key: "NumeroMotor", label: "Número de Motor", type: "text", value: vehiculoData.NumeroMotor },
    { key: "NumeroSerie", label: "Número de Serie", type: "text", value: vehiculoData.NumeroSerie },
    { key: "Capacidad", label: "Capacidad", type: "text", value: vehiculoData.Capacidad },
    { key: "IdEstatus", label: "Estatus", type: "select", value: vehiculoData.IdEstatus, options: catalogos.estatus,readonly: true, disabled: true },
  ];

  const seguroFields: Array<SeguroInputFieldPropsDynamic> = [
    { key: "nombre", label: "Nombre Aseguradora", type: "text", value: seguroData.nombre },
    { key: "numeroPoliza", label: "Número de Póliza", type: "text", value: seguroData.numeroPoliza },
    { key: "folioPago", label: "Folio de Pago", type: "text", value: seguroData.folioPago },
    { key: "fechaExp", label: "Fecha de Expedición", type: "date", value: seguroData.fechaExp },
    { key: "fechaVence", label: "Fecha de Vencimiento", type: "date", value: seguroData.fechaVence },
    { key: "observaciones", label: "Observaciones", type: "text", value: seguroData.observaciones },
  ];

  return (
    <div className="p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-6">
          <Button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full hover:bg-gray-200"
            variant="ghost"
          >
            <FiArrowLeft className="h-6 w-6 text-gray-700" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">
            Modificación de Vehículo
          </h1>
        </div>

        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("vehiculo")}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "vehiculo"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Datos del Vehículo
            </button>
            <button
              onClick={() => setActiveTab("seguro")}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "seguro"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Datos de Aseguradora
            </button>
          </nav>
        </div>

        {activeTab === "vehiculo" && (
          <Card className="mb-6">
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehiculoFields.map((field) => {
                if (field.type === "select") {
                  const selectField = field as SelectFieldPropsDynamic;
                  return (
                    <SelectField
                      key={selectField.key}
                      label={selectField.label}
                      value={selectField.value}
                      options={selectField.options || []}
                      onChange={(val) => handleVehiculoChange(selectField.key, String(val))}
                      readonly={selectField.readonly}
                      disabled={selectField.disabled}
                    />
                  );
                }
                return (
                  <Field
                    key={field.key}
                    label={field.label}
                    type={field.type}
                    value={field.value}
                    onChange={(val) => handleVehiculoChange(field.key, String(val))}
                    readonly={field.readonly}
                    disabled={field.disabled}
                  />
                );
              })}
            </CardContent>
          </Card>
        )}

        {activeTab === "seguro" && (
          <Card className="mb-6">
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {seguroFields.map((field) => (
                <Field
                  key={field.key}
                  label={field.label}
                  type={field.type}
                  value={field.value}
                  onChange={(val) => handleSeguroChange(field.key, String(val))}
                  readonly={field.readonly}
                />
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleSaveChanges}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>
    </div>
  );
}