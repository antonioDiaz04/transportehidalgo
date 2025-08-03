"use client";
import apiClient from "@/lib/apiClient";
import { useState, useEffect, useCallback, useRef } from "react";
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
    onChange: (value: string) => void;
    readonly?: boolean;
}

interface SelectOption {
    value: string;
    label: string;
    [key: string]: any; // Para campos adicionales como ClaveCategoria
}

interface SelectField {
    label: string;
    value: string | number;
    options: SelectOption[];
    onChange?: (value: string) => void;
    readonly?: boolean;
}

interface ToastState {
    message: string;
    type: "success" | "error";
}

interface VehiculoData {
    IdConcesion: string;
    IdVehiculo: string;
    NumeroSerie: string;
    Anio: string;
    NumeroPasajeros: string;
    Cilindros: string;
    NumeroPuertas: string;
    Capacidad: string;
    NumeroToneladas: string;
    NumeroMotor: string;
    ClaveCategoria: string;
    Clase: string;
    Color: string;
    Combustible: string;
    Marca: string;
    Origen: string;
    Submarca: string;
    Tipo: string;
    Uso: string;
    servicio: string;
    Version: string;
    ClaveVehicular: string;
    IdClase: string;
    IdColor: string;
    IdCombustible: string;
    IdMarca: string;
    IdSubMarca: string;
    IdTipo: string;
    IdUso: string;
    IdServicio: string;
    IdVersion: string;
    IdCategoria: string;
    IdTipoPlaca: string;
    PlacaAnterior: string;
    PlacaAsignada: string;
    RFV: string;
    NRPV: string;
    RegFedVeh?: string;
    Vigencia: string;
    EstadoProcedencia: string;
    FechaFactura: string;
    NumeroFactura: string;
    ImporteFactura: string;
    UltimoAnioPagado: string;
    ValorVenta: string;
    DiaHoyNoCircula: string;
    IdEstatus: string;
    IdPropietario: string;
    Modelo?: string;
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
    colores: SelectOption[];
    combustibles: SelectOption[];
    usos: SelectOption[];
    servicios: SelectOption[];
}

// --- Componentes con Tipado ---

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
            className={`fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg text-white text-sm z-50 ${type === "success" ? "bg-green-600" : "bg-red-600"
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
}) => (
    <div className="flex flex-col space-y-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <Input
            type={type}
            value={value}
            readOnly={readonly}
            onChange={(event) => onChange(event.target.value)}
            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
        />
    </div>
);

const SelectField: React.FC<SelectField> = ({
    label,
    value,
    options,
    onChange,
    readonly = false,
}) => {
    const normalizedValue = String(value ?? "");

    return (
        <div className="flex flex-col space-y-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <select
                value={normalizedValue}
                disabled={readonly}
                className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white p-2 border"
                onChange={(e) => onChange?.(e.target.value)}
            >
                <option value="">Seleccione una opción</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

// --- Componente Principal ---

export default function ModificacionVehiculo() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const idConcesion = searchParams.get("idC");
    const idVehiculo = searchParams.get("idV");

    const [activeTab, setActiveTab] = useState<"vehiculo" | "seguro">("vehiculo");
    const [loading, setLoading] = useState<boolean>(true);
    const [toast, setToast] = useState<ToastState | null>(null);

    const [vehiculoData, setVehiculoData] = useState<VehiculoData>({
        IdConcesion: "",
        IdVehiculo: "",
        NumeroSerie: "",
        Anio: "",
        NumeroPasajeros: "",
        Cilindros: "",
        NumeroPuertas: "",
        Capacidad: "",
        NumeroToneladas: "",
        NumeroMotor: "",
        ClaveCategoria: "",
        Clase: "",
        Color: "",
        Combustible: "",
        Marca: "",
        Origen: "",
        Submarca: "",
        Tipo: "",
        Uso: "",
        servicio: "",
        Version: "",
        ClaveVehicular: "",
        IdClase: "",
        IdColor: "",
        IdCombustible: "",
        IdMarca: "",
        IdSubMarca: "",
        IdTipo: "",
        IdUso: "",
        IdServicio: "",
        IdVersion: "",
        IdCategoria: "",
        IdTipoPlaca: "",
        PlacaAnterior: "",
        PlacaAsignada: "",
        RFV: "",
        NRPV: "",
        Vigencia: "",
        EstadoProcedencia: "",
        FechaFactura: "",
        NumeroFactura: "",
        ImporteFactura: "",
        UltimoAnioPagado: "",
        ValorVenta: "",
        DiaHoyNoCircula: "",
        IdEstatus: "",
        IdPropietario: "",
    });

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
        colores: [],
        combustibles: [],
        usos: [],
        servicios: [],
    });

    const initialLoad = useRef(true);

    const formatOptions = useCallback(
        (
            arr: any[],
            idKey: string,
            labelKey: string,
            dataKey: string | null = null
        ): SelectOption[] => {
            if (!Array.isArray(arr)) return [];
            return arr.map((item) => {
                const option: SelectOption = {
                    value: String(item[idKey] ?? ""),
                    label: String(item[labelKey] ?? ""),
                };
                if (dataKey && item[dataKey] !== undefined) {
                    option[dataKey] = String(item[dataKey] ?? "");
                }
                return option;
            });
        },
        []
    );

    useEffect(() => {
        if (!idConcesion || !idVehiculo) {
            setToast({
                message: "No se encontraron identificadores de concesión o vehículo.",
                type: "error",
            });
            setLoading(false);
            return;
        }

        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const response = await apiClient(
                    `/concesion/${idConcesion}/vehiculo/${idVehiculo}`,

                    { method: 'GET', withCredentials: true }
                );

                const { vehiculo, aseguradora } = response.data || {};
                console.log("Vehículo recibido:", vehiculo);
                console.log("Aseguradora recibida:", aseguradora);

                if (vehiculo) {
                    const nuevosDatosVehiculo = {
                        // Identificadores
                        IdConcesion: String(aseguradora.IdConcesion ?? ""), // Si vehiculo trae su propia IdConcesion
                        IdVehiculo: String(vehiculo.IdVehiculo ?? ""),
                        NumeroSerie: String(vehiculo.SerieNIV ?? ""), // API SerieNIV -> State NumeroSerie (usado en WHERE del backend)
                        ClaveCategoria: String(vehiculo.ClaveCategoria ?? ""), // API ClaveCategoria -> State ClaveCategoria (para obtener IdCategoria)
                        // Atributos Básicos del Vehículo
                        Anio: String(vehiculo.Modelo ?? ""), // API Modelo (año) -> State Anio (para payload)
                        NumeroPasajeros: String(vehiculo.NumeroPasajeros ?? ""),
                        Cilindros: String(vehiculo.NumeroCilindros ?? ""), // API NumeroCilindros -> State Cilindros (para payload)
                        NumeroPuertas: String(vehiculo.NumeroPuertas ?? ""),
                        Capacidad: String(vehiculo.Capacidad ?? ""),
                        NumeroToneladas: String(vehiculo.NumeroToneladas ?? ""),
                        NumeroMotor: String(vehiculo.Motor ?? ""), // API Motor -> State NumeroMotor (para payload)

                        // Nombres de Catálogo (strings)
                        Clase: String(vehiculo.ClaseVehiculo ?? ""), // API ClaseVehiculo -> State Clase
                        Color: String(vehiculo.Color ?? ""),
                        Combustible: String(vehiculo.Combustible ?? ""),
                        Marca: String(vehiculo.Marca ?? ""),
                        Submarca: String(vehiculo.SubMarca ?? ""),
                        Tipo: String(vehiculo.TipoVehiculo ?? ""), // API TipoVehiculo -> State Tipo
                        Uso: String(vehiculo.UsoVehiculo ?? ""), // API UsoVehiculo -> State Uso
                        servicio: String(vehiculo.TipoServicio ?? ""), // API TipoServicio -> State servicio
                        Version: String(vehiculo.Version ?? ""),
                        ClaveVehicular: String(vehiculo.ClaveVehicular ?? ""),
                        Origen: String(vehiculo.VehiculoOrigen ?? ""), // API VehiculoOrigen -> State Origen (para payload)

                        // IDs de Catálogo (para selects y update final)
                        IdClase: String(vehiculo.IdClaseVehiculo ?? ""),
                        IdColor: String(vehiculo.IdColor ?? ""),
                        IdCombustible: String(vehiculo.IdCombustible ?? ""),
                        IdMarca: String(vehiculo.IdMarca ?? ""),
                        IdSubMarca: String(vehiculo.IdSubMarca ?? ""),
                        IdTipo: String(vehiculo.IdTipoVehiculo ?? ""),
                        IdUso: String(vehiculo.IdUsoVehiculo ?? ""),
                        IdServicio: String(vehiculo.IdTipoServicio ?? ""),
                        IdVersion: String(vehiculo.IdVersion ?? ""),
                        IdCategoria: String(vehiculo.IdCategoria ?? ""),
                        IdTipoPlaca: String(vehiculo.IdTipoPlaca ?? ""),

                        // Información de Registro y Legal
                        PlacaAnterior: String(vehiculo.PlacaAnterior ?? ""),
                        PlacaAsignada: String(vehiculo.PlacaAsignada ?? ""),
                        RFV: String(vehiculo.RegFedVeh ?? ""),
                        NRPV: String(vehiculo.NRPV ?? ""),
                        RegFedVeh: String(vehiculo.RegFedVeh ?? ""), // Mantener si es necesario para UI
                        Vigencia: vehiculo.Vigencia?.substring(0, 10) ?? "",
                        EstadoProcedencia: String(vehiculo.EstadoProcedencia ?? ""),
                        FechaFactura: vehiculo.FechaFactura?.substring(0, 10) ?? "",
                        NumeroFactura: String(vehiculo.NumeroFactura ?? ""),
                        ImporteFactura: String(vehiculo.ImporteFactura ?? ""),
                        UltimoAnioPagado: String(vehiculo.UltimoAnioPagado ?? ""),
                        ValorVenta: String(vehiculo.ValorVenta ?? ""),
                        DiaHoyNoCircula: String(vehiculo.DiaHoyNoCircula ?? ""),

                        // Estatus y Propietario
                        IdEstatus: String(vehiculo.IdEstatus ?? ""),
                        IdPropietario: String(vehiculo.IdPropietario ?? ""),

                        // Campos adicionales si se usan para display pero no en payload directo
                        Modelo: String(vehiculo.Modelo ?? ""), // Mantener para display si es diferente de Anio
                        // ClaveCategoria: String(vehiculo.ClaveCategoria ?? ""), // Si existe en 'vehiculo'
                        // UsoVehiculo: String(vehiculo.UsoVehiculo ?? ""), // Si es lo mismo que 'Uso'
                        // VehiculoOrigen: String(vehiculo.VehiculoOrigen ?? ""), // Si es lo mismo que 'Origen'
                        // TipoServicio: String(vehiculo.TipoServicio ?? ""), // Si es lo mismo que 'servicio'
                    };
                    setVehiculoData(nuevosDatosVehiculo);
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

                // Segunda llamada para obtener detalles adicionales de la concesión (si es necesario)
                // Esta parte del código parece intentar obtener datos de aseguradora de nuevo.
                // Si los datos de aseguradora ya vienen en la primera llamada, esta segunda llamada
                // para 'detalle.data?.data?.seguro?.data' podría ser redundante o para información complementaria.
                // Si es complementaria, asegúrate de fusionar los datos, no sobrescribirlos.
                if (idConcesion) {
                    try {
                        const detalle = await apiClient(`/concesion/${idConcesion}`, {
                            method: 'GET',
                            withCredentials: true
                        });
                        const detalleData = detalle.data;
                        if (detalleData?.seguro?.data) {
                            setSeguroData(prev => ({
                                ...prev, // Mantener los datos ya cargados
                                nombre: detalleData.seguro.data.NombreAseguradora || prev.nombre,
                                folioPago: detalleData.seguro.data.FolioPago || prev.folioPago,
                                fechaVence: detalleData.seguro.data.FechaVencimiento?.substring(0, 10) || prev.fechaVence,
                                numeroPoliza: detalleData.seguro.data.NumeroPoliza || prev.numeroPoliza,
                                fechaExp: detalleData.seguro.data.FechaExpedicion?.substring(0, 10) || prev.fechaExp,
                                observaciones: detalleData.seguro.data.Observaciones || prev.observaciones,
                            }));
                        }
                    } catch (detalleErr) {
                        console.error("Error fetching concession details:", detalleErr);
                        setToast({
                            message: "No se pudo obtener información adicional de la concesión",
                            type: "error",
                        });
                    }
                }
            } catch (err) {
                setToast({
                    message: "Error al cargar los datos iniciales del vehículo.",
                    type: "error",
                }); console.error("Error en fetchInitialData:", err);

            } finally {
                setLoading(false);
                // initialLoad.current = false; // Descomentar si usas useRef para controlar la carga inicial
            }
        };

        fetchInitialData();
    }, [idConcesion, idVehiculo]); // Dependencias del useEffect

    useEffect(() => {
        const fetchClases = async () => {
            try {
                const response = await apiClient(
                    "/vehiculo/clases",
                    { withCredentials: true }
                );

                const formatted = formatOptions(response.data || [], "IdClase", "Clase");
                setCatalogos(prev => ({
                    ...prev,
                    clases: formatted,
                }));
            } catch (err) {
                console.error("Error cargando clases:", err);
                setToast({
                    message: "Error cargando clases de vehículo",
                    type: "error",
                });
            }
        };
        fetchClases();
    }, [formatOptions]); // Se eliminó 'initialLoad.current' de las dependencias.

    useEffect(() => {
        const fetchTipos = async () => {
            try {
                const response = await apiClient(
                    "/vehiculo/tipos",

                    { method: 'GET', withCredentials: true }
                );

                console.log(response.data);
                const formatted = formatOptions(response.data || [], "IdTipoVehiculo", "TipoVehiculo");
                setCatalogos(prev => ({
                    ...prev,
                    tipos: formatted,
                }));
            } catch (err) {
                console.error("Error cargando tipos:", err);
                setToast({
                    message: "Error cargando tipos de vehículo",
                    type: "error",
                });
            }
        };
        fetchTipos();
    }, [formatOptions]);

    useEffect(() => {
        const fetchEstatus = async () => {
            try {
                const response = await apiClient(
                    "/vehiculo/estatus",
                    { method: 'GET', withCredentials: true }
                );
                const formatted = formatOptions(response.data || [], "IdEstatus", "Estatus");
                setCatalogos(prev => ({
                    ...prev,
                    estatus: formatted,
                }));
            } catch (err) {
                console.error("Error cargando estatus:", err);
                setToast({
                    message: "Error cargando estatus de vehículo",
                    type: "error",
                });
            }
        };
        fetchEstatus();
    }, [formatOptions]);

    useEffect(() => {
        // La lógica para limpiar y resetear campos se activa si el ID de clase cambia
        // o si no estamos en la carga inicial y el ID de clase está vacío.
        if (!vehiculoData.IdClase && !initialLoad.current) { // Usar IdClase del estado
            setCatalogos(prev => ({ ...prev, categorias: [], marcas: [], submarcas: [], versiones: [] }));
            setVehiculoData(prev => ({
                ...prev,
                // IdCategoria: "",
                // ClaveCategoria: "",
                // IdMarca: "",
                // Marca: "", // Limpiar también el nombre de la marca
                // IdSubMarca: "",
                // Submarca: "", // Limpiar también el nombre de la submarca
                // IdVersion: "",
                // Version: "" // Limpiar también el nombre de la versión
            }));
            return;
        }
        // Si estamos en la carga inicial y no hay IdClase, no hacer nada (esperar datos)
        if (!vehiculoData.IdClase && initialLoad.current) return;

        const fetchCategorias = async () => {
            try {
                const response = await apiClient(
                    `/vehiculo/categorias?idClase=${vehiculoData.IdClase}`, // Usar IdClase
                    { method: 'GET', withCredentials: true }
                );
                const formatted = formatOptions(
                    response.data || [],
                    "IdCategoria",
                    "Categoria",
                    "ClaveCategoria"
                );

                setCatalogos(prev => ({
                    ...prev,
                    categorias: formatted,
                }));
            } catch (err) {
                console.error("Error cargando categorías:", err);
                setToast({
                    message: "Error cargando categorías",
                    type: "error",
                });
            }
        };

        fetchCategorias();
    }, [vehiculoData.IdClase, formatOptions]); // Depende de IdClase

    useEffect(() => {

        const fetchMarcas = async () => {
            try {
                const response = await apiClient(
                    `/vehiculo/marcas?claveCategoria=${vehiculoData.IdCategoria}`,
                    { method: 'GET', withCredentials: true }
                );
                console.log(response)
                const formatted = formatOptions(response.data || [], "IdMarca", "Marca");
                setCatalogos(prev => ({
                    ...prev,
                    marcas: formatted,
                }));
            } catch (err) {
                console.error("Error cargando marcas:", err);
                setToast({
                    message: "Error cargando marcas",
                    type: "error",
                });
            }
        };

        fetchMarcas();
    }, [vehiculoData.ClaveCategoria, formatOptions]); // Depende de ClaveCategoria

    useEffect(() => {
        // La lógica para limpiar y resetear campos se activa si IdMarca o IdCategoria cambian
        // o si no estamos en la carga inicial y alguno está vacío.
        if ((!vehiculoData.IdMarca || !vehiculoData.IdCategoria) && !initialLoad.current) {
            setCatalogos(prev => ({ ...prev, submarcas: [], versiones: [] }));
            setVehiculoData(prev => ({ ...prev, IdSubMarca: "", Submarca: "", IdVersion: "", Version: "" }));
            return;
        }
        // Si estamos en la carga inicial y faltan IDs, no hacer nada
        if ((!vehiculoData.IdMarca || !vehiculoData.IdCategoria) && initialLoad.current) return;


        const fetchSubmarcas = async () => {
            try {
                const response = await apiClient(
                    `/vehiculo/submarcas?idMarca=${vehiculoData.IdMarca}&idCategoria=${vehiculoData.IdCategoria}`,
                    { method: 'GET', withCredentials: true }
                );

                const formatted = formatOptions(response.data || [], "IdSubMarca", "SubMarca");
                setCatalogos(prev => ({
                    ...prev,
                    submarcas: formatted,
                }));
            } catch (err) {
                console.error("Error cargando submarcas:", err);
                setToast({
                    message: "Error cargando submarcas",
                    type: "error",
                });
            }
        };

        fetchSubmarcas();
    }, [vehiculoData.IdMarca, vehiculoData.IdCategoria, formatOptions]); // Depende de IdMarca y IdCategoria

    useEffect(() => {
        // La lógica para limpiar y resetear campos se activa si IdSubMarca o IdClase cambian
        // o si no estamos en la carga inicial y alguno está vacío.
        if ((!vehiculoData.IdSubMarca || !vehiculoData.IdClase) && !initialLoad.current) {
            setCatalogos(prev => ({ ...prev, versiones: [] }));
            setVehiculoData(prev => ({ ...prev, IdVersion: "", Version: "" }));
            return;
        }
        // Si estamos en la carga inicial y faltan IDs, no hacer nada
        if ((!vehiculoData.IdSubMarca || !vehiculoData.IdClase) && initialLoad.current) return;

        const fetchVersiones = async () => {
            try {
                const response = await apiClient(
                    `/vehiculo/versiones?idClase=${vehiculoData.IdClase}&idSubMarca=${vehiculoData.IdSubMarca}`,
                    { method: 'GET', withCredentials: true }
                );

                const formatted = formatOptions(response.data || [], "IdVersion", "Version");
                setCatalogos(prev => ({
                    ...prev,
                    versiones: formatted,
                }));
            } catch (err) {
                console.error("Error cargando versiones:", err);
                setToast({
                    message: "Error cargando versiones",
                    type: "error",
                });
            }
        };

        fetchVersiones();
    }, [vehiculoData.IdSubMarca, vehiculoData.IdClase, formatOptions]); // Depende de IdSubMarca y IdClase


    const handleVehiculoChange = useCallback((field: keyof VehiculoData, value: string) => {
        setVehiculoData((prev) => {
            const newData = { ...prev, [field]: value };

            // Lógica para actualizar también los nombres de los catálogos cuando se selecciona un ID
            // Esto es crucial para que el payload envíe los strings correctos al backend
            if (field === "IdClase") { // Cuando cambia el ID de Clase
                const selectedOption = catalogos.clases.find(opt => opt.value === value);
                newData.Clase = selectedOption?.label || ""; // Actualiza el nombre de la Clase
                // Resetea dependientes
                newData.IdCategoria = "";
                newData.ClaveCategoria = "";
                newData.IdMarca = "";
                newData.Marca = "";
                newData.IdSubMarca = "";
                newData.Submarca = "";
                newData.IdVersion = "";
                newData.Version = "";
            } else if (field === "IdCategoria") { // Cuando cambia el ID de Categoría
                const selectedOption = catalogos.categorias.find(opt => opt.value === value);
                newData.ClaveCategoria = selectedOption?.ClaveCategoria || ""; // Actualiza la ClaveCategoria
                // Resetea dependientes
                newData.IdMarca = "";
                newData.Marca = "";
                newData.IdSubMarca = "";
                newData.Submarca = "";
                newData.IdVersion = "";
                newData.Version = "";
            } else if (field === "IdMarca") { // Cuando cambia el ID de Marca
                const selectedOption = catalogos.marcas.find(opt => opt.value === value);
                newData.Marca = selectedOption?.label || ""; // Actualiza el nombre de la Marca
                // Resetea dependientes
                newData.IdSubMarca = "";
                newData.Submarca = "";
                newData.IdVersion = "";
                newData.Version = "";
            } else if (field === "IdSubMarca") { // Cuando cambia el ID de SubMarca
                const selectedOption = catalogos.submarcas.find(opt => opt.value === value);
                newData.Submarca = selectedOption?.label || ""; // Actualiza el nombre de la SubMarca
                // Resetea dependientes
                newData.IdVersion = "";
                newData.Version = "";
            } else if (field === "IdVersion") { // Cuando cambia el ID de Versión
                const selectedOption = catalogos.versiones.find(opt => opt.value === value);
                newData.Version = selectedOption?.label || ""; // Actualiza el nombre de la Versión
            } else if (field === "IdTipo") { // Cuando cambia el ID de Tipo
                const selectedOption = catalogos.tipos.find(opt => opt.value === value);
                newData.Tipo = selectedOption?.label || ""; // Actualiza el nombre del Tipo
            } else if (field === "IdUso") { // Cuando cambia el ID de Uso
                const selectedOption = catalogos.usos.find(opt => opt.value === value); // Asumiendo que tienes un catálogo de usos
                newData.Uso = selectedOption?.label || ""; // Actualiza el nombre del Uso
            } else if (field === "IdCombustible") { // Cuando cambia el ID de Combustible
                const selectedOption = catalogos.combustibles.find(opt => opt.value === value); // Asumiendo que tienes un catálogo de combustibles
                newData.Combustible = selectedOption?.label || ""; // Actualiza el nombre del Combustible
            } else if (field === "IdServicio") { // Cuando cambia el ID de Servicio
                const selectedOption = catalogos.servicios.find(opt => opt.value === value); // Asumiendo que tienes un catálogo de servicios
                newData.servicio = selectedOption?.label || ""; // Actualiza el nombre del Servicio
            }


            return newData;
        });
    }, [catalogos.clases, catalogos.categorias, catalogos.marcas, catalogos.submarcas, catalogos.versiones, catalogos.tipos /*, catalogos.usos, catalogos.combustibles, catalogos.servicios */]); // Añadir más catálogos si se usan


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
                vehiculoData: {
                    // Campos numéricos que se parsean a entero/flotante
                    Anio: parseInt(vehiculoData.Anio) || 0, // Usar Anio del estado
                    NumeroPasajeros: parseInt(vehiculoData.NumeroPasajeros) || 0,
                    Cilindros: parseInt(vehiculoData.Cilindros) || 0,
                    NumeroPuertas: parseInt(vehiculoData.NumeroPuertas) || 0,
                    ImporteFactura: parseFloat(vehiculoData.ImporteFactura) || 0,
                    UltimoAnioPagado: parseInt(vehiculoData.UltimoAnioPagado) || 0,
                    ValorVenta: parseFloat(vehiculoData.ValorVenta) || 0,
                    DiaHoyNoCircula: parseInt(vehiculoData.DiaHoyNoCircula) || 0,

                    // Campos de texto que se envían directamente
                    NumeroMotor: vehiculoData.NumeroMotor || '',
                    RFV: vehiculoData.RFV || '',
                    NRPV: vehiculoData.NRPV || '',
                    NumeroToneladas: vehiculoData.NumeroToneladas || '',
                    Capacidad: vehiculoData.Capacidad || '',
                    NumeroSerie: vehiculoData.NumeroSerie || '', // CRÍTICO: Usado en el WHERE de la actualización

                    // Nombres de Catálogo (strings) - ESTOS SON LOS QUE EL BACKEND ESPERA PARA OBTENER IDS
                    Clase: vehiculoData.Clase || '',
                    Color: vehiculoData.Color || '',
                    Combustible: vehiculoData.Combustible || '',
                    Marca: vehiculoData.Marca || '',
                    Origen: vehiculoData.Origen || '',
                    Submarca: vehiculoData.Submarca || '',
                    Tipo: vehiculoData.Tipo || '',
                    Uso: vehiculoData.Uso || '',
                    servicio: vehiculoData.servicio || '',
                    Version: vehiculoData.Version || '',
                    ClaveVehicular: vehiculoData.ClaveVehicular || '',

                    // IDs de Catálogo (para la actualización final en la tabla Vehiculo)
                    IdClase: parseInt(vehiculoData.IdClase) || 0,
                    IdTipo: parseInt(vehiculoData.IdTipo) || 0,
                    IdMarca: parseInt(vehiculoData.IdMarca) || 0,
                    IdSubMarca: parseInt(vehiculoData.IdSubMarca) || 0,
                    IdVersion: parseInt(vehiculoData.IdVersion) || 0,
                    IdUso: parseInt(vehiculoData.IdUso) || 0,
                    IdCombustible: parseInt(vehiculoData.IdCombustible) || 0,
                    IdColor: parseInt(vehiculoData.IdColor) || 0,
                    IdServicio: parseInt(vehiculoData.IdServicio) || 0,
                    IdTipoPlacaWP: parseInt(vehiculoData.IdTipoPlaca) || 0, // El backend usa IdTipoPlacaWP
                    IdCategoria: parseInt(vehiculoData.IdCategoria) || 0,

                    // Otros campos que se envían
                    PlacaAnterior: vehiculoData.PlacaAnterior || '',
                    PlacaAsignada: vehiculoData.PlacaAsignada || '',
                    RegFedVeh: vehiculoData.RegFedVeh || '', // Mantener si el backend lo espera
                    Vigencia: vehiculoData.Vigencia || '',
                    EstadoProcedencia: vehiculoData.EstadoProcedencia || '',
                    FechaFactura: vehiculoData.FechaFactura || '',
                    NumeroFactura: vehiculoData.NumeroFactura || '',
                    IdEstatus: parseInt(vehiculoData.IdEstatus) || 0,
                    IdPropietario: parseInt(vehiculoData.IdPropietario) || 0,
                },
                seguroData: {
                    nombre: seguroData.nombre || '',
                    numeroPoliza: seguroData.numeroPoliza || '',
                    fechaExp: seguroData.fechaExp, // Asumiendo formato YYYY-MM-DD
                    fechaVence: seguroData.fechaVence, // Asumiendo formato YYYY-MM-DD
                    folioPago: seguroData.folioPago || '',
                    observaciones: seguroData.observaciones || ''
                }
            };

            const response = await apiClient(
                `/concesion/${idConcesion}/vehiculo/${idVehiculo}`,
                { method: 'PUT', data: payload, withCredentials: true }
            );

            setToast({ message: "Cambios guardados exitosamente", type: "success" });
        } catch (err) {
            console.error("Error guardando cambios:", err);
            setToast({ message: "Error al guardar los cambios.", type: "error" });

        } finally {
            setLoading(false);
        }
    };


    // const vehiculoFields = [
    //     { key: "IdConcesion", label: "ID Concesión", readonly: true, type: "text", value: vehiculoData.IdConcesion },
    //     { key: "IdVehiculo", label: "ID Vehículo", readonly: true, type: "text", value: vehiculoData.IdVehiculo },
    //     { key: "IdClase", label: "Clase", type: "select", options: catalogos.clases, value: vehiculoData.IdClase },
    //     { key: "PlacaAnterior", label: "Placa Anterior", type: "text", value: vehiculoData.PlacaAnterior },
    //     { key: "PlacaAsignada", label: "Placa Asignada", type: "text", value: vehiculoData.PlacaAsignada },
    //     { key: "IdTipo", label: "Tipo de Vehículo", type: "select", options: catalogos.tipos, value: vehiculoData.IdTipo },

    //     {
    //         key: "IdCategoria",
    //         label: "Categoría",
    //         type: "select",
    //         options: catalogos.categorias,
    //         readonly: !vehiculoData.IdClase || catalogos.categorias.length === 0,
    //         value: vehiculoData.IdCategoria
    //     },
    //     {
    //         key: "IdMarca",
    //         label: "Marca",
    //         type: "select",
    //         options: catalogos.marcas,
    //         readonly: !vehiculoData.ClaveCategoria || catalogos.marcas.length === 0,
    //         value: vehiculoData.IdMarca
    //     },
    //     {
    //         key: "IdSubMarca",
    //         label: "SubMarca",
    //         type: "select",
    //         options: catalogos.submarcas,
    //         readonly: !vehiculoData.IdMarca || catalogos.submarcas.length === 0,
    //         value: vehiculoData.IdSubMarca
    //     },
    //     {
    //         key: "IdVersion",
    //         label: "Versión",
    //         type: "select",
    //         options: catalogos.versiones,
    //         readonly: !vehiculoData.IdSubMarca || catalogos.versiones.length === 0,
    //         value: vehiculoData.IdVersion
    //     },
    //     { key: "NumeroPasajeros", label: "Número de Pasajeros", type: "number", value: vehiculoData.NumeroPasajeros },
    //     { key: "Anio", label: "Año (Modelo)", type: "text", value: vehiculoData.Anio }, // Usar Anio para el año
    //     { key: "NumeroToneladas", label: "Número de Toneladas", type: "number", value: vehiculoData.NumeroToneladas },
    //     { key: "NumeroMotor", label: "Número de Motor", type: "text", value: vehiculoData.NumeroMotor }, // Usar NumeroMotor
    //     { key: "NumeroSerie", label: "Número de Serie", type: "text", value: vehiculoData.NumeroSerie }, // Usar NumeroSerie (SerieNIV)
    //     { key: "Capacidad", label: "Capacidad", type: "text", value: vehiculoData.Capacidad },
    //     { key: "IdEstatus", label: "Estatus", type: "select", options: catalogos.estatus, value: vehiculoData.IdEstatus }
    // ];
 const vehiculoFields: Array<SelectFieldPropsDynamic | InputFieldPropsDynamic> = [
        { key: "IdClase", label: "Clase", type: "select", value: vehiculoData.IdClase, options: catalogos.clases },
        { key: "IdCategoria", label: "Categoría", type: "select", value: vehiculoData.IdCategoria, options: catalogos.categorias, readonly: !vehiculoData.IdClase },
        { key: "IdMarca", label: "Marca", type: "select", value: vehiculoData.IdMarca, options: catalogos.marcas, readonly: !vehiculoData.IdCategoria },
        { key: "IdSubMarca", label: "Submarca", type: "select", value: vehiculoData.IdSubMarca, options: catalogos.submarcas, readonly: !vehiculoData.IdMarca },
        { key: "IdVersion", label: "Versión", type: "select", value: vehiculoData.IdVersion, options: catalogos.versiones, readonly: !vehiculoData.IdSubMarca },
        { key: "ClaveCategoria", label: "Clave Categoría", type: "text", value: vehiculoData.ClaveCategoria, readonly: true },
        { key: "IdTipo", label: "Tipo", type: "select", value: vehiculoData.IdTipo, options: catalogos.tipos },
        { key: "IdEstatus", label: "Estatus", type: "select", value: vehiculoData.IdEstatus, options: catalogos.estatus },
        { key: "NumeroSerie", label: "Número de Serie (NIV)", type: "text", value: vehiculoData.NumeroSerie },
        { key: "NumeroMotor", label: "Número de Motor", type: "text", value: vehiculoData.NumeroMotor },
        { key: "PlacaAsignada", label: "Placa Asignada", type: "text", value: vehiculoData.PlacaAsignada },
        { key: "PlacaAnterior", label: "Placa Anterior", type: "text", value: vehiculoData.PlacaAnterior },
        { key: "Anio", label: "Año", type: "text", value: vehiculoData.Anio },
        { key: "NumeroPasajeros", label: "Número de Pasajeros", type: "number", value: vehiculoData.NumeroPasajeros },
        { key: "Cilindros", label: "Cilindros", type: "number", value: vehiculoData.Cilindros },
        { key: "NumeroPuertas", label: "Número de Puertas", type: "number", value: vehiculoData.NumeroPuertas },
        { key: "Capacidad", label: "Capacidad", type: "text", value: vehiculoData.Capacidad },
        { key: "NumeroToneladas", label: "Número de Toneladas", type: "number", value: vehiculoData.NumeroToneladas },
        { key: "ValorVenta", label: "Valor Venta", type: "number", value: vehiculoData.ValorVenta },
        { key: "ImporteFactura", label: "Importe Factura", type: "number", value: vehiculoData.ImporteFactura },
        { key: "NumeroFactura", label: "Número de Factura", type: "text", value: vehiculoData.NumeroFactura },
        { key: "FechaFactura", label: "Fecha Factura", type: "date", value: vehiculoData.FechaFactura },
        { key: "IdColor", label: "Color", type: "select", value: vehiculoData.IdColor, options: catalogos.colores },
        { key: "IdCombustible", label: "Combustible", type: "select", value: vehiculoData.IdCombustible, options: catalogos.combustibles },
        { key: "IdUso", label: "Uso", type: "select", value: vehiculoData.IdUso, options: catalogos.usos },
        { key: "IdServicio", label: "Servicio", type: "select", value: vehiculoData.IdServicio, options: catalogos.servicios },
    ];

    const seguroFields = [
        { key: "nombre", label: "Nombre Aseguradora", type: "text", value: seguroData.nombre },
        { key: "numeroPoliza", label: "Número de Póliza", type: "text", value: seguroData.numeroPoliza },
        { key: "folioPago", label: "Folio de Pago", type: "text", value: seguroData.folioPago },
        { key: "fechaExp", label: "Fecha de Expedición", type: "date", value: seguroData.fechaExp },
        { key: "fechaVence", label: "Fecha de Vencimiento", type: "date", value: seguroData.fechaVence },
        { key: "observaciones", label: "Observaciones", type: "text", value: seguroData.observaciones },
    ];


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                Cargando...
            </div>
        );
    }

    // if (error) {
    //     return (
    //         <div className="flex items-center justify-center min-h-screen text-red-600">
    //             Error: {error}
    //         </div>
    //     );
    // }

    return (
        <div className="">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className=" bg-white p-6 rounded-lg shadow-md">
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
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === "vehiculo"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            Datos del Vehículo
                        </button>
                        <button
                            onClick={() => setActiveTab("seguro")}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === "aseguradora"
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
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {vehiculoFields.map((field) => {
                                if (field.type === "select") {
                                    return (
                                       <SelectField
                                            key={field.key}
                                            label={field.label}
                                            value={field.value}
                                            options={field.options}
                                            onChange={(val) => handleVehiculoChange(field.key, val)}
                                            readonly={field.readonly}
                                        />
                                    );
                                }
                                return (
                                    <Field
                                        key={field.key}
                                        label={field.label}
                                        type={field.type}
                                        value={field.value}
                                        onChange={(val) => handleVehiculoChange(field.key, val)}
                                        readonly={field.readonly}
                                    />
                                );
                            })}
                        </CardContent>
                    </Card>
                )}

                {activeTab === "seguro" && (
                    <Card className="mb-6">
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {seguroFields.map((field) => (
                                <Field
                                    key={field.key}
                                    label={field.label}
                                    type={field.type}
                                    value={field.value}
                                    onChange={(val) => handleSeguroChange(field.key, val)}
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
