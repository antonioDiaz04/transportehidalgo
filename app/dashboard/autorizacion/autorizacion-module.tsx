"use client"
import apiClient from '@/lib/apiClient'

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

type Expediente = {
  concesion: string
  id: string
  titular: string
  tipo: string
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

export default function AutorizacionModule() {
  const router = useRouter()
  // let idC: any; // Variable para almacenar el ID de la concesión
  // let idV: any; // Variable para almacenar el ID del vehículo
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [selectedExpediente, setSelectedExpediente] = useState<Expediente | null>(null)
  const [openSections, setOpenSections] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any>(null);
  // Datos de ejemplo
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [concessionData, setConcessionData] = useState<ConcesionData | null>(null);
  const [seguroData, setSeguroData] = useState<SeguroData | null>(null);
  const [concesionarioData, setConcesionarioData] = useState<ConcesionarioData | null>(null);
  const [vehicleDetailsData, setVehicleDetailsData] = useState<vehicleDetailsData | null>(null);

  const [activeTab, setActiveTab] = useState(0); // Primera tab activa por defecto
  const filteredExpedientes = expedientes.filter((exp) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      exp.id.toLowerCase().includes(searchLower) ||
      exp.titular.toLowerCase().includes(searchLower) ||
      exp.tipo.toLowerCase().includes(searchLower)
    )
  })


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
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      // Buscar por folio
      const searchParams = new URLSearchParams();
      // +.append("folio", searchTerm);

      const { data } = await apiClient(`/concesion/autorizacion/${searchTerm.toString()}`, {
        method: "GET",
        withCredentials: true
      });

      console.log("Respuesta de la API:", data);

      if (data) {
        // idVehiculo: data.vehiculo.data.IdVehiculo || "",

        // Mapear los datos recibidos a la estructura esperada por la UI
        const concesion = {
          idC: data.IdConcesion,
          folio: data.Folio ?? "",
          tipoServicio: data.TipoServicio ?? "",
          tipoPlaca: data.TipoPlaca ?? "",
          mnemotecnia: data.Mnemotecnia ?? "",
          modalidad: data.Modalidad ?? "",
          municipioAutorizado: data.MunicipioAutorizado ?? "",
          claseUnidad: data.ClaseUnidad ?? "",
          vigencia: data.VigenciaAnios ? `${data.VigenciaAnios} años` : "",
          estatus: "", // No viene en la respuesta, dejar vacío o mapear si existe
          seriePlaca: data.SeriePlacaActual ?? "",
          fechaRegistro: data.FechaExpedicion ?? "",
          fechaRenovacion: data.FechaRenovacion ?? "",
          numeroExpediente: data.NumeroExpediente ?? "",
          submodalidad: data.SubModalidad ?? "",
          localidadAutorizada: data.LocalidadAutorizada ?? "",
          tipoUnidad: data.TipoUnidad ?? "",
          seriePlacaAnterior: data.SeriePlacaAnterior ?? "",
          fechaVencimiento: data.FechaVencimiento ?? "",
          observaciones: data.Observaciones ?? "",
        }

        setConcessionData(concesion);
        // setSeguroData(null);
        // setConcesionarioData(null);
        // setVehicleDetailsData(null);
        setSelectedExpediente({
          id: data.NumeroExpediente ?? "",
          concesion: data.Folio ?? "",
          titular: "", // No viene en la respuesta
          tipo: data.TipoServicio ?? ""
        });
        console.log("Respuesta de la API:", concesion.idC);

        // Nueva consulta para obtener la información completa de la concesión por su ID
        if (concesion.idC) {
          try {
            const detalle = await apiClient(`/concesion/${concesion.idC}`, {
              method: "GET",
              withCredentials: true
            });
            // const detalle = detalleResp.data?.data;

            // Mapear datos relacionados si existen
            // El API regresa los datos anidados en .data.data, por lo que hay que desestructurar correctamente
            console.log("Respuesta de la API 2:", detalle);
            const detalleData = detalle;
            console.log("Respuesta de la API 3:", detalleData);
            if (detalleData) {
              // Seguro
              if (detalleData.seguro?.data) {
                setSeguroData({
                  aseguradora: detalleData.seguro.data.NombreAseguradora,
                  folioPago: detalleData.seguro.data.FolioPago,
                  fechaVencimiento: detalleData.seguro.data.FechaVencimiento,
                  numeroPoliza: detalleData.seguro.data.NumeroPoliza,
                  fechaExpedicion: detalleData.seguro.data.FechaExpedicion,
                  observaciones: detalleData.seguro.data.Observaciones,
                });
              }
              // Concesionario
              if (detalleData.concesionario?.data) {

                setConcesionarioData(
                  {

                    tipoPersona: detalleData.concesionario.data.TipoPersona,
                    nombre: detalleData.concesionario.data.Nombre,
                    apellidoPaterno: detalleData.concesionario.data.ApellidoPaterno,
                    apellidoMaterno: detalleData.concesionario.data.ApellidoMaterno,
                    fechaNacimiento: detalleData.concesionario.data.FechaNacimiento,
                    lugarNacimiento: detalleData.concesionario.data.LugarNacimiento,
                    identificador: detalleData.concesionario.data.IdConcesionario,
                    genero: detalleData.concesionario.data.Genero,
                    rfc: detalleData.concesionario.data.RFC,
                    nacionalidad: detalleData.concesionario.data.Nacionalidad,
                    correoElectronico: detalleData.concesionario.data.Mail,
                    estadoCivil: detalleData.concesionario.data.EstadoCivil,
                    fechaAlta: detalleData.concesionario.data.FechaAlta,
                    estatus: detalleData.concesionario.data.Estatus,
                    observacionesConcesionario: detalleData.concesionario.data.Observaciones,
                    domicilio: {
                      calle: detalleData.direcciones?.data?.[0]?.Calle,
                      colonia: detalleData.direcciones?.data?.[0]?.Colonia,
                      cruzaCon: detalleData.direcciones?.data?.[0]?.CruceCalles,
                      referencia: detalleData.direcciones?.data?.[0]?.Referencia,
                      numeroExterior: detalleData.direcciones?.data?.[0]?.NumExterior,
                      numeroInterior: detalleData.direcciones?.data?.[0]?.NumInterior,
                      estado: detalleData.direcciones?.data?.[0]?.Estado,
                      codigoPostal: detalleData.direcciones?.data?.[0]?.CodigoPostal,
                      municipio: detalleData.direcciones?.data?.[0]?.Municipio,
                      localidad: detalleData.direcciones?.data?.[0]?.Localidad,
                      tipoDireccion: detalleData.direcciones?.data?.[0]?.TipoDireccion,
                      esFiscal: detalleData.direcciones?.data?.[0]?.EsFiscal ?? false,
                      telefono: detalleData.direcciones?.data?.[0]?.Telefono,
                      fax: detalleData.direcciones?.data?.[0]?.Fax,
                    },
                    beneficiarios: Array.isArray(detalleData.beneficiarios?.data)
                      ? detalleData.beneficiarios.data.map((b: any) => ({
                        nombre: b.NombreCompleto,
                        parentesco: b.Parentesco,
                      }))
                      : [],
                    referencias: Array.isArray(detalleData.referencias?.data)
                      ? detalleData.referencias.data.map((r: any) => ({
                        nombreCompleto: r.NombreCompleto,
                        parentesco: r.Parentesco,
                        calle: r.Calle,
                        colonia: r.Colonia,
                        cruzaCon: r.CruceCalles,
                        referencia: r.Referencia,
                        numeroExterior: r.NumExterior,
                        numeroInterior: r.NumInterior,
                        estado: r.Estado,
                        codigoPostal: r.CodigoPostal,
                        municipio: r.Municipio,
                        localidad: r.Localidad,
                        tipoDireccion: r.TipoDireccion,
                        telefonoParticular: r.Telefono,
                        fax: r.Fax,
                      }))
                      : [],
                  }
                )
                // setConcesionarioData(vehiculo);
              }
              // Vehículo
              if (detalleData.vehiculo?.data) {
                console.log(detalleData.vehiculo.data.IdVehiculo)
                const vehiculo = {

                  idV: detalleData.vehiculo.data.IdVehiculo, // Obtener el ID del vehículo si existe
                  clase: detalleData.vehiculo.data.ClaseVehiculo,
                  placaAnterior: detalleData.vehiculo.data.PlacaAnterior,
                  tipo: detalleData.vehiculo.data.TipoVehiculo,
                  categoria: detalleData.vehiculo.data.Categoria,
                  marca: detalleData.vehiculo.data.Marca,
                  rfv: detalleData.vehiculo.data.RegFedVeh,
                  subMarca: detalleData.vehiculo.data.SubMarca,
                  cilindros: detalleData.vehiculo.data.NumeroCilindros?.toString(),
                  version: detalleData.vehiculo.data.Version,
                  numeroPasajeros: detalleData.vehiculo.data.NumeroPasajeros?.toString(),
                  modelo: detalleData.vehiculo.data.Modelo?.toString(),
                  vigencia: detalleData.vehiculo.data.Vigencia,
                  tipoPlaca: detalleData.vehiculo.data.TipoPlaca,
                  numeroPuertas: detalleData.vehiculo.data.NumeroPuertas?.toString(),
                  tipoServicio: detalleData.vehiculo.data.TipoServicio,
                  numeroToneladas: detalleData.vehiculo.data.NumeroToneladas,
                  fechaFactura: detalleData.vehiculo.data.FechaFactura,
                  centimetrosCubicos: detalleData.vehiculo.data.CentrimetrosCubicos,
                  folioFactura: detalleData.vehiculo.data.NumeroFactura,
                  color: detalleData.vehiculo.data.Color,
                  importeFactura: detalleData.vehiculo.data.ImporteFactura?.toString(),
                  numeroMotor: detalleData.vehiculo.data.Motor,
                  polizaSeguro: detalleData.vehiculo.data.PolizaSeguro,
                  numeroSerie: detalleData.vehiculo.data.SerieNIV,
                  origen: detalleData.vehiculo.data.VehiculoOrigen,
                  capacidad: detalleData.vehiculo.data.Capacidad,
                  estadoProcedencia: detalleData.vehiculo.data.EstadoProcedencia,
                  combustible: detalleData.vehiculo.data.Combustible,
                  estatus: detalleData.vehiculo.data.IdEstatus?.toString(),
                  nrpv: detalleData.vehiculo.data.NRPV,
                }
                setVehicleDetailsData(vehiculo);
                console.log("Respuesta de la API 2.2:", vehiculo.idV);

              }
            }
          }
          catch (detalleErr) {
            setError("No se pudo obtener el detalle de la concesión");
          }

        } else {
          setError("No se encontraron datos");
        }
        setSearchResults(data.data);
        setOpenSections([0, 1, 2, 3]); // Abrir todas las secciones por defecto
        setActiveTab(0); // Reiniciar a la primera pestaña
        // setSearchTerm(""); // Limpiar el campo de búsqueda
      }
      else {
        setError("No se encontraron datos para el folio proporcionado.");
        // setSearchResults(null);
        // setConcessionData(null);
        // setSeguroData(null);
        // setConcesionarioData(null);
        // setVehicleDetailsData(null);
      }

    } catch (err) {
      console.error("Error al buscar concesión:", err);
      setError("Error al buscar concesión. Por favor, intenta de nuevo.");

      // Limpieza en caso de error
      setConcessionData(null);
      setSeguroData(null);
      setConcesionarioData(null);
      setVehicleDetailsData(null);
      setSelectedExpediente(null);
      setSearchResults([]);
      setOpenSections([]);
    }
    finally {
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
            <ReadonlyField label="Fecha Registro" value={concessionData?.fechaRegistro ?? ""} />
            <ReadonlyField label="Fecha Renovación" value={concessionData?.fechaRenovacion ?? ""} />
            <ReadonlyField label="Número Expediente" value={concessionData?.numeroExpediente ?? ""} />
            <ReadonlyField label="Submodalidad" value={concessionData?.submodalidad ?? ""} />
            <ReadonlyField label="Localidad Autorizada" value={concessionData?.localidadAutorizada ?? ""} />
            <ReadonlyField label="Tipo Unidad" value={concessionData?.tipoUnidad ?? ""} />
            <ReadonlyField label="Serie Placa Anterior" value={concessionData?.seriePlacaAnterior ?? ""} />
            <ReadonlyField label="Fecha de Vencimiento" value={concessionData?.fechaVencimiento ?? ""} />
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
            <ReadonlyField label="Fecha de Vencimiento" value={seguroData?.fechaVencimiento ?? ""} />
          </div>
          <div className="space-y-3">
            <ReadonlyField label="Número de Póliza" value={seguroData?.numeroPoliza ?? ""} />
            <ReadonlyField label="Fecha de Expedición" value={seguroData?.fechaExpedicion ?? ""} />
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
              <ReadonlyField label="Fecha de Nacimiento" value={concesionarioData?.fechaNacimiento ?? ""} />
              <ReadonlyField label="Lugar de Nacimiento" value={concesionarioData?.lugarNacimiento ?? ""} />
              <ReadonlyField label="Género" value={concesionarioData?.genero ?? ""} />
            </div>
            <div className="space-y-3">
              <ReadonlyField label="RFC" value={concesionarioData?.rfc ?? ""} />
              <ReadonlyField label="Nacionalidad" value={concesionarioData?.nacionalidad ?? ""} />
              <ReadonlyField label="Correo Electrónico" value={concesionarioData?.correoElectronico ?? ""} />
              <ReadonlyField label="Estado Civil" value={concesionarioData?.estadoCivil ?? ""} />
              <ReadonlyField label="Fecha Alta" value={concesionarioData?.fechaAlta ?? ""} />
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
              <ReadonlyField label="Fecha Factura" value={vehicleDetailsData?.fechaFactura ?? ""} />
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
              <ReadonlyField label="Vigencia" value={vehicleDetailsData?.vigencia ?? ""} />
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
    <div className="max-w-full  mx-auto md:p-2">
      <Card className="bg-transparent items-start border-none shadow-none">
        <div className="text-start items-start mb-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-extrabold text-gray-800">Consultar Vehículo</h1>
            <p className="text-sm">Modificar Datos del Vehículo</p>
          </div>
        </div>

        <CardContent className="p-6 bg-white shadow-[#B4BFC2] rounded-xl overflow-hidden shadow-sm border-[#ECEFF0] space-y-6">
          {/* Sección de búsqueda */}
          <div className="space-y-3">
            <h2 className="text-lg font-medium text-gray-800">Datos de búsqueda</h2>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de autorización:
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Buscar por número de expediente, placa o folio..."
                    className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleSearch}
                className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isSearching || !searchTerm.trim()}
              >
                {isSearching ? "Buscando..." : "Buscar"}
              </Button>
            </div>
          </div>

          {isSearching ? (
            <div className="text-center py-20 text-gray-500">Buscando resultados...</div>
          ) : !concessionData || !selectedExpediente ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center bg-white rounded-lg shadow-sm border border-gray-200">
              <img
                src="https://img.freepik.com/premium-vector/vector-illustration-about-concept-no-result-data-document-file-found_675567-5734.jpg"
                alt="Sin resultados"
                className="w-60 h-60 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-800">
                No hay resultados para mostrar
              </h3>
              <p className="text-base text-gray-600 max-w-md leading-relaxed">
                {searchTerm.trim()
                  ? "No se encontraron coincidencias con tu búsqueda. Intenta con otro término."
                  : "Ingresa un número de expediente, placa o folio para buscar información del vehículo."}
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Folio</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serie Placa</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número Expediente</th>
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
                      <td className="px-4 py-3 text-gray-700">Concesión</td>
                      <td className="px-4 py-3 text-gray-700">{concessionData?.folio ?? ""}</td>
                      <td className="px-4 py-3 text-gray-700">{concessionData?.seriePlaca ?? ""}</td>
                      <td className="px-4 py-3 text-gray-700">{concessionData?.numeroExpediente ?? ""}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Botón para continuar */}
              <div className="flex justify-end mb-6">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-4 py-2 rounded-md text-sm"
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
                      {section.title}
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
