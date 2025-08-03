"use client"
import axios from "axios";
import {formatDate} from "@/lib/formatDate"; // Asegúrate de que la ruta sea correcta según tu estructura de carpetas
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, ChevronDown, ChevronUp, Folder, FileText, Download, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import apiClient from "@/lib/apiClient";

type Expediente = {
  concesion: string
  id: string
  titular: string
  tipo: string
}
type ExpedienteData = {
  idC: any
  PlacaAsignada: string
  SerieNIV: string
  Motor: string
  Estatus: string
  Marca: string
  SubMarca: string
  TipoVehiculo: string
  PlacaAnterior: string
  ClaseVehiculo: string
}

type ConcesionData = {
  idC: any
  folio: string
  tipoServicio: string
  tipoPlaca: string
  mnemotecnia: string
  modalidad: string
  municipioAutorizado: string
  claseUnidad: string
  vigencia: string
  estatus: string
  seriePlaca: string
  fechaRegistro: string
  fechaRenovacion: string
  numeroExpediente: string
  submodalidad: string
  localidadAutorizada: string
  tipoUnidad: string
  seriePlacaAnterior: string
  fechaVencimiento: string
  observaciones: string
}

type SeguroData = {
  aseguradora: string
  folioPago: string
  fechaVencimiento: string
  numeroPoliza: string
  fechaExpedicion: string
  observaciones: string
}

type ConcesionarioData = {
  tipoPersona: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  fechaNacimiento: string
  lugarNacimiento: string
  identificador: string
  genero: string
  rfc: string
  nacionalidad: string
  correoElectronico: string
  estadoCivil: string
  fechaAlta: string
  estatus: string
  observacionesConcesionario: string
  domicilio: {
    calle: string
    colonia: string
    cruzaCon: string
    referencia: string
    numeroExterior: string
    numeroInterior: string
    estado: string
    codigoPostal: string
    municipio: string
    localidad: string
    tipoDireccion: string
    esFiscal: boolean
    telefono: string
    fax: string
  }
  beneficiarios: Array<{
    nombre: string
    parentesco: string
  }>
  referencias: Array<{
    nombreCompleto: string
    parentesco: string
    calle: string
    colonia: string
    cruzaCon: string
    referencia: string
    numeroExterior: string
    numeroInterior: string
    estado: string
    codigoPostal: string
    municipio: string
    localidad: string
    tipoDireccion: string
    telefonoParticular: string
    fax: string
  }>
}

type vehicleDetailsData = {
  idV: any
  clase: string
  placaAnterior: string
  tipo: string
  categoria: string
  marca: string
  rfv: string
  subMarca: string
  cilindros: string
  version: string
  numeroPasajeros: string
  modelo: string
  vigencia: string
  tipoPlaca: string
  numeroPuertas: string
  tipoServicio: string
  numeroToneladas: string
  fechaFactura: string
  centimetrosCubicos: string
  folioFactura: string
  color: string
  importeFactura: string
  numeroMotor: string
  polizaSeguro: string
  numeroSerie: string
  origen: string
  capacidad: string
  estadoProcedencia: string
  combustible: string
  estatus: string
  nrpv: string
}

export default function VehiculoModule() {
  const router = useRouter()

  const [placa, setPlaca] = useState('')
  const [numSerie, setNumSerie] = useState('')
  const [numMotor, setNumMotor] = useState('')


  // let idC: any; // Variable para almacenar el ID de la concesión
  // let idV: any; // Variable para almacenar el ID del vehículo
  // const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [selectedExpediente, setSelectedExpediente] = useState<Expediente | null>(null)
  const [openSections, setOpenSections] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any>(null);
  // Datos de ejemplo
  const [expedienteData, setExpedienteData] = useState<ExpedienteData | null>(null);
  const [concessionData, setConcessionData] = useState<ConcesionData | null>(null);
  const [seguroData, setSeguroData] = useState<SeguroData | null>(null);
  const [concesionarioData, setConcesionarioData] = useState<ConcesionarioData | null>(null);
  const [vehicleDetailsData, setVehicleDetailsData] = useState<vehicleDetailsData | null>(null);

  const [activeTab, setActiveTab] = useState(0); // Primera tab activa por defecto
  // const filteredExpedientes = expedientes.filter((exp) => {
  //   const searchLower = searchTerm.toLowerCase()
  //   return (
  //     exp.id.toLowerCase().includes(searchLower) ||
  //     exp.titular.toLowerCase().includes(searchLower) ||
  //     exp.tipo.toLowerCase().includes(searchLower)
  //   )
  // })
  // Prefetch de rutas comunes
  useEffect(() => {
    router.prefetch("/dashboard/ModificacionVehiculo");
    router.prefetch("/dashboard/iv");
  }, [router]);

  // Navegación optimizada con useCallback
  const navigateToModification = useCallback(() => {
    if (!concessionData?.idC || !vehicleDetailsData?.idV) return;

    const params = new URLSearchParams({
      idC: concessionData.idC,
      idV: vehicleDetailsData.idV
    });
    router.push(`/dashboard/ModificacionVehiculo?${params.toString()}`);
  }, [concessionData?.idC, vehicleDetailsData?.idV, router]);

  const navigateToInspection = useCallback(() => {
    router.push("/dashboard/iv");
  }, [router]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    // if (!placa.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      // Buscar por folio
      const searchParams = new URLSearchParams();
      searchParams.append("placa", placa);
      searchParams.append("numSerie", numSerie);
      searchParams.append("numMotor", numMotor);
      // const [placa, setPlaca] = useState('')
      // const [numSerie, setNumSerie] = useState('')
      // const [numMotor, setNumMotor] = useState('')

      const { data } = await apiClient(`/vehiculo/buscar?${searchParams.toString()}`, {
        method: 'GET',

        withCredentials: true
      });

      console.log("Respuesta de la API:", data);
      const expData = data[0];

      console.log("Respuesta de la API2:", expData);
      if (expData) {
        // idVehiculo: data.vehiculo.data.IdVehiculo || "",

        // Mapear los datos recibidos a la estructura esperada por la UI
        const expediente = {
          idC: expData.IdConcesion,
          PlacaAsignada: expData.PlacaAsignada || "",
          SerieNIV: expData.SerieNIV || "",
          Motor: expData.Motor || "",
          Estatus: expData.Estatus || "",
          Marca: expData.Marca || "",
          SubMarca: expData.SubMarca || "",
          TipoVehiculo: expData.TipoVehiculo || "",
          PlacaAnterior: expData.PlacaAnterior || "",
          ClaseVehiculo: expData.ClaseVehiculo || "",
        };

        setExpedienteData(expediente);
        // setSeguroData(null);
        // setConcesionarioData(null);
        // setVehicleDetailsData(null);
        setSelectedExpediente({
          id: expData.NumeroExpediente ?? "",
          concesion: expData.Folio ?? "",
          titular: "", // No viene en la respuesta
          tipo: expData.TipoServicio ?? ""
        });
        console.log("Respuesta de la API:", expediente.idC);

        // Nueva consulta para obtener la información completa de la concesión por su ID
        if (expediente.idC) {
          try {
            const detalle = await apiClient(`/concesion/${expediente.idC}`, {
              method: 'GET',
              withCredentials: true
            });

            console.log("Respuesta de la API 2:", detalle);

            const detalleData = detalle;

            // La variable 'detalleData' es el objeto completo de la respuesta de la API
            if (detalleData) {
              // --- Concesión ---
              if (detalleData.concesion?.data) {
                const dataC = detalleData.concesion.data;
                console.log("Datos de Concesión:", dataC);

                const concesion = {
                  idC: dataC.IdConcesion,
                  folio: dataC.Folio ?? "",
                  tipoServicio: dataC.TipoServicio ?? "",
                  tipoPlaca: dataC.TipoPlaca ?? "",
                  mnemotecnia: dataC.Mnemotecnia ?? "",
                  modalidad: dataC.Modalidad ?? "",
                  municipioAutorizado: dataC.MunicipioAutorizado ?? "",
                  claseUnidad: dataC.ClaseUnidad ?? "",
                  vigencia: dataC.VigenciaAnios ? `${dataC.VigenciaAnios} años` : "",
                  estatus: dataC.Estatus ?? "", // Usar Estatus de la respuesta
                  seriePlaca: dataC.SeriePlacaActual ?? "",
                  fechaRegistro: dataC.FechaExpedicion ?? "",
                  fechaRenovacion: dataC.FechaRenovacion ?? "",
                  numeroExpediente: dataC.NumeroExpediente ?? "",
                  submodalidad: dataC.SubModalidad ?? "",
                  localidadAutorizada: dataC.LocalidadAutorizada ?? "",
                  tipoUnidad: dataC.TipoUnidad ?? "",
                  seriePlacaAnterior: dataC.SeriePlacaAnterior ?? "",
                  fechaVencimiento: dataC.FechaVencimiento ?? "",
                  observaciones: dataC.Observaciones ?? "",
                };
                setConcessionData(concesion);
              } else {
                setConcessionData(null);
              }

              // --- Seguro ---
              if (detalleData.seguro?.data) {
                const dataSeguro = detalleData.seguro.data;
                setSeguroData({
                  aseguradora: dataSeguro.NombreAseguradora ?? "",
                  folioPago: dataSeguro.FolioPago ?? "",
                  fechaVencimiento: dataSeguro.FechaVencimiento ?? "",
                  numeroPoliza: dataSeguro.NumeroPoliza ?? "",
                  fechaExpedicion: dataSeguro.FechaExpedicion ?? "",
                  observaciones: dataSeguro.Observaciones ?? "",
                });
              } else {
                setSeguroData(null);
              }

              // --- Concesionario ---
              if (detalleData.concesionario?.data) {
                const dataConcesionario = detalleData.concesionario.data;
                const direccionesArr = detalleData.direcciones?.data ?? [];
                const beneficiariosArr = detalleData.beneficiarios?.data ?? [];
                const referenciasArr = detalleData.referencias?.data ?? [];

                setConcesionarioData({
                  tipoPersona: dataConcesionario.TipoPersona ?? "",
                  nombre: dataConcesionario.Nombre ?? "",
                  apellidoPaterno: dataConcesionario.ApellidoPaterno ?? "",
                  apellidoMaterno: dataConcesionario.ApellidoMaterno ?? "",
                  fechaNacimiento: dataConcesionario.FechaNacimiento ?? "",
                  lugarNacimiento: dataConcesionario.LugarNacimiento ?? "",
                  identificador: dataConcesionario.IdConcesionario ?? "",
                  genero: dataConcesionario.Genero ?? "",
                  rfc: dataConcesionario.RFC ?? "",
                  nacionalidad: dataConcesionario.Nacionalidad ?? "",
                  correoElectronico: dataConcesionario.Mail ?? "",
                  estadoCivil: dataConcesionario.EstadoCivil ?? "",
                  fechaAlta: dataConcesionario.FechaAlta ?? "",
                  estatus: dataConcesionario.Estatus ?? "",
                  observacionesConcesionario: dataConcesionario.Observaciones ?? "",

                  // CORRECCIÓN: Si existe la dirección, mapea sus propiedades.
                  // Si no, crea un objeto con propiedades vacías para satisfacer a TypeScript.
                  domicilio: direccionesArr.length > 0
                    ? {
                      calle: direccionesArr[0].Calle ?? "",
                      colonia: direccionesArr[0].Colonia ?? "",
                      cruzaCon: direccionesArr[0].CruceCalles ?? "",
                      referencia: direccionesArr[0].Referencia ?? "",
                      numeroExterior: direccionesArr[0].NumExterior ?? "",
                      numeroInterior: direccionesArr[0].NumInterior ?? "",
                      estado: direccionesArr[0].Estado ?? "",
                      codigoPostal: direccionesArr[0].CodigoPostal ?? "",
                      municipio: direccionesArr[0].Municipio ?? "",
                      localidad: direccionesArr[0].Localidad ?? "",
                      tipoDireccion: direccionesArr[0].TipoDireccion ?? "",
                      esFiscal: direccionesArr[0].EsFiscal ?? false,
                      telefono: direccionesArr[0].Telefono ?? "",
                      fax: direccionesArr[0].Fax ?? "",
                    }
                    : {
                      calle: "",
                      colonia: "",
                      cruzaCon: "",
                      referencia: "",
                      numeroExterior: "",
                      numeroInterior: "",
                      estado: "",
                      codigoPostal: "",
                      municipio: "",
                      localidad: "",
                      tipoDireccion: "",
                      esFiscal: false,
                      telefono: "",
                      fax: "",
                    },

                  beneficiarios: Array.isArray(beneficiariosArr)
                    ? beneficiariosArr.map((b: any) => ({
                      nombre: b.Nombre ?? "",
                      parentesco: b.Parentesco ?? "",
                    }))
                    : [],
                  referencias: Array.isArray(referenciasArr)
                    ? referenciasArr.map((r: any) => ({
                      ...r,
                      nombreCompleto: r.NombreCompleto ?? "",
                      parentesco: r.Parentesco ?? "",
                      telefonoParticular: r.Telefono ?? "",
                    }))
                    : [],
                });
              } else {
                setConcesionarioData(null);
              }

              // --- Vehículo ---
              if (detalleData.vehiculo?.data) {
                const dataVehiculo = detalleData.vehiculo.data;
                console.log("Datos de Vehículo:", dataVehiculo.IdVehiculo);
                const vehiculo = {
                  idV: dataVehiculo.IdVehiculo ?? "",
                  clase: dataVehiculo.ClaseVehiculo ?? "",
                  placaAnterior: dataVehiculo.PlacaAnterior ?? "",
                  tipo: dataVehiculo.TipoVehiculo ?? "",
                  categoria: dataVehiculo.Categoria ?? "",
                  marca: dataVehiculo.Marca ?? "",
                  rfv: dataVehiculo.RegFedVeh ?? "",
                  subMarca: dataVehiculo.SubMarca ?? "",
                  cilindros: dataVehiculo.NumeroCilindros?.toString() ?? "",
                  version: dataVehiculo.Version ?? "",
                  numeroPasajeros: dataVehiculo.NumeroPasajeros?.toString() ?? "",
                  modelo: dataVehiculo.Modelo?.toString() ?? "",
                  vigencia: dataVehiculo.Vigencia ?? "",
                  tipoPlaca: dataVehiculo.TipoPlaca ?? "",
                  numeroPuertas: dataVehiculo.NumeroPuertas?.toString() ?? "",
                  tipoServicio: dataVehiculo.TipoServicio ?? "",
                  numeroToneladas: dataVehiculo.NumeroToneladas ?? "",
                  fechaFactura: dataVehiculo.FechaFactura ?? "",
                  centimetrosCubicos: dataVehiculo.CentrimetrosCubicos ?? "",
                  folioFactura: dataVehiculo.NumeroFactura ?? "",
                  color: dataVehiculo.Color ?? "",
                  importeFactura: dataVehiculo.ImporteFactura?.toString() ?? "",
                  numeroMotor: dataVehiculo.Motor ?? "",
                  polizaSeguro: dataVehiculo.PolizaSeguro ?? "",
                  numeroSerie: dataVehiculo.SerieNIV ?? "",
                  origen: dataVehiculo.VehiculoOrigen ?? "",
                  capacidad: dataVehiculo.Capacidad ?? "",
                  estadoProcedencia: dataVehiculo.EstadoProcedencia ?? "",
                  combustible: dataVehiculo.Combustible ?? "",
                  estatus: dataVehiculo.IdEstatus?.toString() ?? "",
                  nrpv: dataVehiculo.NRPV ?? "",
                };
                setVehicleDetailsData(vehiculo);
              } else {
                setVehicleDetailsData(null);
              }
            }
          } catch (detalleErr) {
            // Mejorar el log para saber qué error ocurrió realmente
            console.error("Error al obtener el detalle de la concesión:", detalleErr);
            setError("No se pudo obtener el detalle de la concesión. Por favor, intente de nuevo.");
          }
        } else {
          setError("No se encontraron datos");
        }
        setSearchResults(data.data);
        setOpenSections([0, 1, 2, 3]); // Abrir todas las secciones por defecto
        setActiveTab(0); // Reiniciar a la primera pestaña
        // setSearchTerm(""); // Limpiar el campo de búsqueda
      }
    } catch (err) {
      console.error("Error al buscar concesión:", err);
      setError("Error al buscar concesión. Por favor, intenta de nuevo.");
    } finally {
      setIsSearching(false);


    };
  }
  function ReadonlyField({ label, value }: { label: string; value: string }) {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
        <div className="flex items-center h-10 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50">
          {value || <span className="text-gray-400">No especificado</span>}
        </div>
      </div>
    )
  }


  const toggleSection = (index: number) => {
    setOpenSections(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const cardSections = [
    {
      title: "Concesión",
      icon: <Folder className="w-4 h-4 text-gray-600" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <div className="space-y-3">
            <ReadonlyField label="Folio" value={concessionData?.folio ?? ""} />
            <ReadonlyField label="Tipo de Servicio" value={concessionData?.tipoServicio ?? ""} />
            <ReadonlyField label="Tipo Placa" value={concessionData?.tipoPlaca ?? ""} />
            <ReadonlyField label="Mnemotecnia" value={concessionData?.mnemotecnia ?? ""} />
            <ReadonlyField label="Modalidad" value={concessionData?.modalidad ?? ""} />
            <ReadonlyField label="Municipio Autorizado" value={concessionData?.municipioAutorizado ?? ""} />
            <ReadonlyField label="Clase Unidad" value={concessionData?.claseUnidad ?? ""} />
            <ReadonlyField label="Vigencia" value={concessionData?.vigencia ?? ""} />
            <ReadonlyField label="Estatus" value={concessionData?.estatus ?? ""} />
          </div>
          <div className="space-y-3">
            <ReadonlyField label="Serie Placa" value={concessionData?.seriePlaca ?? ""} />
            <ReadonlyField label="Fecha Registro" value={formatDate(concessionData?.fechaRegistro)?? ""} />
            <ReadonlyField label="Fecha Renovación" value={formatDate(concessionData?.fechaRenovacion) ?? ""} />
            <ReadonlyField label="Número Expediente" value={concessionData?.numeroExpediente ?? ""} />
            <ReadonlyField label="Submodalidad" value={concessionData?.submodalidad ?? ""} />
            <ReadonlyField label="Localidad Autorizada" value={concessionData?.localidadAutorizada ?? ""} />
            <ReadonlyField label="Tipo Unidad" value={concessionData?.tipoUnidad ?? ""} />
            <ReadonlyField label="Serie Placa Anterior" value={concessionData?.seriePlacaAnterior ?? ""} />
            <ReadonlyField label="Fecha de Vencimiento" value={formatDate(concessionData?.fechaVencimiento) ?? ""} />
          </div>
          <div className="md:col-span-2">
            <ReadonlyField label="Observaciones" value={concessionData?.observaciones ?? ""} />
          </div>
        </div>
      )
    },
    {
      title: "Seguro",
      icon: <FileText className="w-4 h-4 text-gray-600" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <div className="space-y-3">
            <ReadonlyField label="Aseguradora" value={seguroData?.aseguradora ?? ""} />
            <ReadonlyField label="Folio de Pago" value={seguroData?.folioPago ?? ""} />
            <ReadonlyField label="Fecha de Vencimiento" value={formatDate(seguroData?.fechaVencimiento) ?? ""} />
          </div>
          <div className="space-y-3">
            <ReadonlyField label="Número de Póliza" value={seguroData?.numeroPoliza ?? ""} />
            <ReadonlyField label="Fecha de Expedición" value={formatDate(seguroData?.fechaExpedicion) ?? ""} />
          </div>
          <div className="md:col-span-2">
            <ReadonlyField label="Observaciones" value={seguroData?.observaciones ?? ""} />
          </div>
        </div>
      )
    },
    {
      title: "Información del concesionario",
      icon: <FileText className="w-4 h-4 ttext-gray-600" />,
      content: (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-3">
              <ReadonlyField label="Tipo de Persona" value={concesionarioData?.tipoPersona ?? ""} />
              <ReadonlyField label="Identificador" value={concesionarioData?.identificador ?? ""} />
              <ReadonlyField label="Nombre" value={concesionarioData?.nombre ?? ""} />
              <ReadonlyField label="Apellido Paterno" value={concesionarioData?.apellidoPaterno ?? ""} />
              <ReadonlyField label="Apellido Materno" value={concesionarioData?.apellidoMaterno ?? ""} />
              <ReadonlyField label="Fecha de Nacimiento" value={formatDate(concesionarioData?.fechaNacimiento) ?? ""} />
              <ReadonlyField label="Lugar de Nacimiento" value={concesionarioData?.lugarNacimiento ?? ""} />
              <ReadonlyField label="Género" value={concesionarioData?.genero ?? ""} />
            </div>
            <div className="space-y-3">
              <ReadonlyField label="RFC" value={concesionarioData?.rfc ?? ""} />
              <ReadonlyField label="Nacionalidad" value={concesionarioData?.nacionalidad ?? ""} />
              <ReadonlyField label="Correo Electrónico" value={concesionarioData?.correoElectronico ?? ""} />
              <ReadonlyField label="Estado Civil" value={concesionarioData?.estadoCivil ?? ""} />
              <ReadonlyField label="Fecha Alta" value={formatDate(concesionarioData?.fechaAlta) ?? ""} />
              <ReadonlyField label="Estatus" value={concesionarioData?.estatus ?? ""} />
            </div>
          </div>

          <div className="mb-6">
            <ReadonlyField label="Observaciones" value={concesionarioData?.observacionesConcesionario ?? ""} />
          </div>

          <Accordion type="multiple" className="w-full space-y-2">
            <AccordionItem value="beneficiarios" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Beneficiarios Registrados</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 bg-white">
                {(concesionarioData?.beneficiarios ?? []).map((b, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <ReadonlyField label="Nombre" value={b.nombre} />
                    <ReadonlyField label="Parentesco" value={b.parentesco} />
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="domicilio" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Domicilio Registrado</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 bg-white grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReadonlyField label="Calle" value={concesionarioData?.domicilio?.calle ?? ""} />
                <ReadonlyField label="Colonia" value={concesionarioData?.domicilio?.colonia ?? ""} />
                <ReadonlyField label="Cruza con" value={concesionarioData?.domicilio?.cruzaCon ?? ""} />
                <ReadonlyField label="Referencia" value={concesionarioData?.domicilio?.referencia ?? ""} />
                <ReadonlyField label="Número Exterior" value={concesionarioData?.domicilio?.numeroExterior ?? ""} />
                <ReadonlyField label="Número Interior" value={concesionarioData?.domicilio?.numeroInterior ?? ""} />
                <ReadonlyField label="Estado" value={concesionarioData?.domicilio?.estado ?? ""} />
                <ReadonlyField label="Código Postal" value={concesionarioData?.domicilio?.codigoPostal ?? ""} />
                <ReadonlyField label="Municipio" value={concesionarioData?.domicilio?.municipio ?? ""} />
                <ReadonlyField label="Localidad" value={concesionarioData?.domicilio?.localidad ?? ""} />
                <ReadonlyField label="Tipo de Dirección" value={concesionarioData?.domicilio?.tipoDireccion ?? ""} />
                <ReadonlyField label="¿Es Fiscal?" value={concesionarioData?.domicilio?.esFiscal ? "Sí" : "No"} />
                <ReadonlyField label="Teléfono" value={concesionarioData?.domicilio?.telefono ?? ""} />
                <ReadonlyField label="Fax" value={concesionarioData?.domicilio?.fax ?? ""} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="referencias" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Referencias Familiares</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 bg-white space-y-4">
                {(concesionarioData?.referencias ?? []).map((r, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-md">
                    <ReadonlyField label="Nombre Completo" value={r.nombreCompleto} />
                    <ReadonlyField label="Parentesco" value={r.parentesco} />
                    <ReadonlyField label="Calle" value={r.calle} />
                    <ReadonlyField label="Colonia" value={r.colonia} />
                    <ReadonlyField label="Cruza con" value={r.cruzaCon} />
                    <ReadonlyField label="Referencia" value={r.referencia} />
                    <ReadonlyField label="Número Exterior" value={r.numeroExterior} />
                    <ReadonlyField label="Número Interior" value={r.numeroInterior} />
                    <ReadonlyField label="Estado" value={r.estado} />
                    <ReadonlyField label="Código Postal" value={r.codigoPostal} />
                    <ReadonlyField label="Municipio" value={r.municipio} />
                    <ReadonlyField label="Localidad" value={r.localidad} />
                    <ReadonlyField label="Tipo de Dirección" value={r.tipoDireccion} />
                    <ReadonlyField label="Teléfono (Particular)" value={r.telefonoParticular} />
                    <ReadonlyField label="Fax" value={r.fax} />
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )
    },
    {
      title: "Vehículo",
      icon: <FileText className="w-4 h-4 text-gray-600" />,
      content: (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <ReadonlyField label="Clase" value={vehicleDetailsData?.clase ?? ""} />
              <ReadonlyField label="Tipo" value={vehicleDetailsData?.tipo ?? ""} />
              <ReadonlyField label="Marca" value={vehicleDetailsData?.marca ?? ""} />
              <ReadonlyField label="SubMarca" value={vehicleDetailsData?.subMarca ?? ""} />
              <ReadonlyField label="Versión" value={vehicleDetailsData?.version ?? ""} />
              <ReadonlyField label="Modelo" value={vehicleDetailsData?.modelo ?? ""} />
              <ReadonlyField label="Tipo de Placa" value={vehicleDetailsData?.tipoPlaca ?? ""} />
              <ReadonlyField label="Tipo de Servicio" value={vehicleDetailsData?.tipoServicio ?? ""} />
              <ReadonlyField label="Fecha Factura" value={formatDate(vehicleDetailsData?.fechaFactura) ?? ""} />
              <ReadonlyField label="Folio Factura" value={vehicleDetailsData?.folioFactura ?? ""} />
              <ReadonlyField label="Importe Factura" value={vehicleDetailsData?.importeFactura ?? ""} />
              <ReadonlyField label="Número de Motor" value={vehicleDetailsData?.numeroMotor ?? ""} />
              <ReadonlyField label="Póliza de Seguro" value={vehicleDetailsData?.polizaSeguro ?? ""} />
              <ReadonlyField label="Número de Serie" value={vehicleDetailsData?.numeroSerie ?? ""} />
              <ReadonlyField label="Origen" value={vehicleDetailsData?.origen ?? ""} />
            </div>
            <div className="space-y-3">
              <ReadonlyField label="Capacidad" value={vehicleDetailsData?.capacidad ?? ""} />
              <ReadonlyField label="Estado de Procedencia" value={vehicleDetailsData?.estadoProcedencia ?? ""} />
              <ReadonlyField label="Combustible" value={vehicleDetailsData?.combustible ?? ""} />
              <ReadonlyField label="Estatus" value={vehicleDetailsData?.estatus ?? ""} />
              <ReadonlyField label="Placa Anterior" value={vehicleDetailsData?.placaAnterior ?? ""} />
              <ReadonlyField label="Categoría" value={vehicleDetailsData?.categoria ?? ""} />
              <ReadonlyField label="RFV" value={vehicleDetailsData?.rfv ?? ""} />
              <ReadonlyField label="Cilindros" value={vehicleDetailsData?.cilindros ?? ""} />
              <ReadonlyField label="Número de Pasajeros" value={vehicleDetailsData?.numeroPasajeros ?? ""} />
              <ReadonlyField label="Vigencia" value={formatDate(vehicleDetailsData?.vigencia) ?? ""} />
              <ReadonlyField label="Número de Puertas" value={vehicleDetailsData?.numeroPuertas ?? ""} />
              <ReadonlyField label="Número de Toneladas" value={vehicleDetailsData?.numeroToneladas ?? ""} />
              <ReadonlyField label="Centímetros Cúbicos" value={vehicleDetailsData?.centimetrosCubicos ?? ""} />
              <ReadonlyField label="Color" value={vehicleDetailsData?.color ?? ""} />
              <ReadonlyField label="NRPV" value={vehicleDetailsData?.nrpv ?? ""} />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => {
                if (concessionData?.idC) {
                  console.log("Sí hay idV:", concessionData.idC);
                  router.push(`/dashboard/iv?idC=${concessionData.idC}`);
                } else {
                  console.log("No hay idV");
                }
              }}
            >
              Realizar Inspección
            </Button>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="max-w-full  mx-auto md:p-6">
      <Card className="shadow-sm shadow-[#e2e8f0] border-x-gray-300 rounded-xl overflow-hidden">
        <CardHeader className="border-b bg-[#f7fafc] p-6">
          <div className="flex flex-col space-y-1.5">
            <h1 className="text-2xl font-extrabold text-gray-800">Consultar Vehículo</h1>
            <p className="text-sm">Modificar Datos del Vehículo</p>
          </div>
        </CardHeader>

        <CardContent className="p-6  space-y-6">
          {/* Sección de búsqueda */}
          <div className="space-y-3">
            <h2 className="text-lg font-medium text-gray-800">Datos de búsqueda</h2>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end w-full">
              <div className="flex-1 w-full">
                <label htmlFor="placa" className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
                <Input
                  id="placa"
                  placeholder="Placa"
                  className="w-full"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                />
              </div>
              <div className="flex-1 w-full">
                <label htmlFor="numSerie" className="block text-sm font-medium text-gray-700 mb-1">Núm. de Serie</label>
                <Input
                  id="numSerie"
                  placeholder="Núm. de Serie"
                  className="w-full"
                  value={numSerie}
                  onChange={(e) => setNumSerie(e.target.value)}
                />
              </div>
              <div className="flex-1 w-full">
                <label htmlFor="numMotor" className="block text-sm font-medium text-gray-700 mb-1">Núm. de Motor</label>
                <Input
                  id="numMotor"
                  placeholder="Núm. de Motor"
                  className="w-full"
                  value={numMotor}
                  onChange={(e) => setNumMotor(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleSearch}
              className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isSearching}
            >
              {isSearching ? "Buscando..." : "Buscar"}
            </Button>
            {error && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                {error}
              </div>
            )}
          </div>

          {/* Resultados o estado vacío */}
          {!selectedExpediente ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 bg-gray-100 rounded-full">
                <Search className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                No hay resultados para mostrar
                Ingresa un número de expediente, placa o folio para buscar información del vehículo.
              </h3>
              <p className="text-gray-500">
                Asegúrate de que los datos sean correctos y vuelve a intentarlo.
              </p>
            </div>
          ) : (
            <>
              {/* Tabla de resultados */}
              <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#f7fafc]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Elegir</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa Asignada</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número de Serie</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número de Motor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SubMarca</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Vehículo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa Anterior</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clase Vehículo</th>


                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-3">
                        <input
                          type="radio"
                          checked
                          readOnly
                          className="accent-blue-600"
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-700">{expedienteData?.PlacaAsignada}</td>
                      <td className="px-4 py-3 text-gray-700">{expedienteData?.SerieNIV}</td>
                      <td className="px-4 py-3 text-gray-700">{expedienteData?.Motor}</td>
                      <td className="px-4 py-3 text-gray-700">{expedienteData?.Estatus}</td>
                      <td className="px-4 py-3 text-gray-700">{expedienteData?.Marca}</td>
                      <td className="px-4 py-3 text-gray-700">{expedienteData?.SubMarca}</td>
                      <td className="px-4 py-3 text-gray-700">{expedienteData?.TipoVehiculo}</td>
                      <td className="px-4 py-3 text-gray-700">{expedienteData?.PlacaAnterior}</td>
                      <td className="px-4 py-3 text-gray-700">{expedienteData?.ClaseVehiculo}</td>

                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Botón para continuar */}
              <div className="flex justify-end mb-6">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 px-4 py-2 rounded-md text-sm"
                  onClick={navigateToModification}
                >
                  Continuar modificación
                </Button>
              </div>

              {/* Sistema de Tabs y Contenido */}
              <div className="bg-white rounded-lg border border-gray-200">
                {/* Pestañas */}
                <div className="flex border-b bg-[#f7fafc] border-gray-200 px-4">
                  {cardSections.map((section, index) => (
                    <button
                      key={index}
                      className={`
                  px-5 py-3 font-medium text-sm relative transition-colors duration-200
                  ${activeTab === index
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-700 hover:text-blue-500'
                        }
                  ${index === 0 ? 'ml-0' : '-ml-px'}
                  `}
                      onClick={() => setActiveTab(index)}
                    >
                      <div className="flex items-center gap-2">
                        {section.icon}
                        {section.title}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Contenido de la Tab activa */}
                <div className="p-6 bg-white max-h-[500px] overflow-y-auto">
                  {cardSections[activeTab]?.content || (
                    <p className="text-gray-500 italic text-base">
                      Seleccione una pestaña para ver su contenido.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
