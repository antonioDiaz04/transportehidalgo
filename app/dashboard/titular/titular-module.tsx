"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import apiClient from "@/lib/apiClient";

// Define interfaces for your data structures
interface Expediente {
  id: string;
  titular: string;
  tipo: string;
  concesion: string;
}

interface ConcesionData {
  idC: string;
  folio: string;
  tipoServicio: string;
  tipoPlaca: string;
  mnemotecnia: string;
  modalidad: string;
  municipioAutorizado: string;
  claseUnidad: string;
  vigencia: string;
  estatus: string;
  seriePlaca: string;
  fechaRegistro: string;
  fechaRenovacion: string;
  numeroExpediente: string;
  submodalidad: string;
  localidadAutorizada: string;
  tipoUnidad: string;
  seriePlacaAnterior: string;
  fechaVencimiento: string;
  observaciones: string;
}

interface SeguroData {
  aseguradora: string;
  folioPago: string;
  fechaVencimiento: string;
  numeroPoliza: string;
  fechaExpedicion: string;
  observaciones: string;
}

interface DomicilioData {
  calle: string;
  colonia: string;
  cruzaCon: string;
  referencia: string;
  numeroExterior: string;
  numeroInterior: string;
  estado: string;
  codigoPostal: string;
  municipio: string;
  localidad: string;
  tipoDireccion: string;
  esFiscal: boolean;
  telefono: string;
  fax: string;
}

interface BeneficiarioData {
  nombre: string;
  parentesco: string;
}

interface ReferenciaData {
  nombreCompleto: string;
  parentesco: string;
  calle: string;
  colonia: string;
  cruzaCon: string;
  referencia: string;
  numeroExterior: string;
  numeroInterior: string;
  estado: string;
  codigoPostal: string;
  municipio: string;
  localidad: string;
  tipoDireccion: string;
  telefonoParticular: string;
  fax: string;
}

interface ConcesionarioData {
  tipoPersona: string;
  identificador: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  lugarNacimiento: string;
  genero: string;
  rfc: string;
  nacionalidad: string;
  correoElectronico: string;
  estadoCivil: string;
  fechaAlta: string;
  estatus: string;
  observacionesConcesionario: string;
  domicilio: DomicilioData | null;
  beneficiarios: BeneficiarioData[];
  referencias: ReferenciaData[];
  // Nuevos atributos agregados según el objeto data
  idConcesion: number | string;
  folio: string;
  fechaExpedicion: string;
  fechaVencimiento: string;
  vigenciaAnios: number;
  seriePlacaActual: string;
  seriePlacaAnterior: string;
  ultimaActualizacion: string;
  idItinerario: number;
  itinerario: string;
  ruta: string;
  idServicio: number;
  idMunicipioAutorizado: number;
  estadoExpedicion: string;
  municipioAutorizado: string;
  idMunicipioExpedicion: number;
  municipioExpedicion: string;
  idEstadoExpedicion: number;
  idEstatus: number;
  idVehiculoActual: string | number;
  idVehiculoAnterior: string | number;
  idDelegacion: number;
  delegacion: string;
  idConcesionarioActual: string | number;
  idConcesionarioAnterior: string | number;
  tipoServicio: string;
  tipoServicioAbreviatura: string;
  idPropietario: string | number;
  idTipoPlaca: string | number;
  tipoPlaca: string;
  idClaseUnidad: string | number;
  claseUnidad: string;
  idTipoUnidad: string | number;
  tipoUnidad: string;
  idUsoUnidad: string | number;
  usoUnidad: string;
  idTipoConcesion: string | number;
  clave: string;
  tipoConcesion: string;
  idModalidad: number;
  modalidad: string;
  esConcesion: boolean;
  numeroExpediente: string;
  idSubmodalidad: number;
  subModalidad: string;
  mnemotecnia: string;
  idRuta: number;
  idLocalidadAutorizada: number;
  localidadAutorizada: string;
  observaciones: string;
  fechaRenovacion: string;
}

interface VehicleDetailsData {
  idV: string;
  // Add other vehicle details properties if available from your API
}

export default function TitularModule() {
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [paterno, setPaterno] = useState('');
  const [materno, setMaterno] = useState('');
  // const [rfc, setRfc] = useState('');

  const [isSearching, setIsSearching] = useState(false);
  const [selectedExpediente, setSelectedExpediente] = useState<Expediente | null>(null);
  const [openSections, setOpenSections] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [expedientes, setExpedientes] = useState<Expediente[]>([]); // Not directly used for display, but kept for consistency
  const [concessionData, setConcessionData] = useState<ConcesionData | null>(null);
  const [seguroData, setSeguroData] = useState<SeguroData | null>(null);
  const [concesionarioData, setConcesionarioData] = useState<ConcesionarioData | null>(null);
  const [vehicleDetailsData, setVehicleDetailsData] = useState<VehicleDetailsData | null>(null);

  const [concesionariosEncontrados, setConcesionariosEncontrados] = useState<any[]>([]);
  const [concesionarioSeleccionado, setConcesionarioSeleccionado] = useState<any>(null); // Stores the fully selected concessionaire object
  const [concesionesSeleccionadas, setConcesionesSeleccionadas] = useState<string[]>([]);

  const [activeTab, setActiveTab] = useState(0);

  // Prefetch de rutas comunes
  useEffect(() => {
    router.prefetch("/dashboard/ModificacionVehiculo");
    router.prefetch("/dashboard/iv");
  }, [router]);

  const navigateToModification = useCallback(() => {
    if (!concessionData?.idC || !vehicleDetailsData?.idV) return;

    const params = new URLSearchParams({
      idC: concessionData.idC,
      idV: vehicleDetailsData.idV,
    });
    router.push(`/dashboard/ModificacionVehiculo?${params.toString()}`);
  }, [concessionData?.idC, vehicleDetailsData?.idV, router]);

  const navigateToInspection = useCallback(() => {
    router.push("/dashboard/iv");
  }, [router]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();

    setIsSearching(true);
    setError(null);
    setConcesionariosEncontrados([]); // Clear previous search results
    setConcesionarioSeleccionado(null); // Clear previous selection
    setConcessionData(null);
    setSeguroData(null);
    setConcesionarioData(null);
    setVehicleDetailsData(null);
    setSelectedExpediente(null);

    try {
      // Paginación: puedes agregar estados para page y pageSize si lo deseas
      const page = 1; // O usa un estado para la página actual
      const pageSize = 10; // O usa un estado para el tamaño de página

      const searchParams = new URLSearchParams();
      if (nombre.trim()) searchParams.append("nombre", nombre.trim());
      if (paterno.trim()) searchParams.append("paterno", paterno.trim());
      if (materno.trim()) searchParams.append("materno", materno.trim());
      searchParams.append("page", page.toString());
      searchParams.append("pageSize", pageSize.toString());

      console.log("Buscando titular con parámetros:", {
        nombre,
        paterno,
        materno,
        page,
        pageSize,
      });

      const { data } = await apiClient(
        `/concesion/titular?${searchParams.toString()}`,
        {
          method: 'GET',
          withCredentials: true,
        }
      );

      console.log("Respuesta de la API (búsqueda de titular):", data);

      if (data) {
        setConcesionariosEncontrados(data);
        console.log("Concesionarios encontrados:", data);
        // If only one result, automatically select it and load details
        if (data.length === 1) {
          console.log("Solo un concesionario encontrado, seleccionando automáticamente:", data.data[0]);
          handleSelectConcesionario(data.data[0]);
        }
      } else {
        setConcesionariosEncontrados([]);
        setError("No se encontraron resultados para la búsqueda.");
        console.log("No se encontraron resultados para la búsqueda.");
      }
    } catch (err) {
      console.error("Error al buscar titular:", err);
      setError("Error al buscar titular. Por favor, intenta de nuevo.");
    } finally {
      setIsSearching(false);
      console.log("Búsqueda finalizada.");
    }
  };

  const handleSelectConcesionario = async (concesionario: any) => {
    setConcesionarioSeleccionado(concesionario); // Set the selected concessionaire for highlighting
    setError(null); // Clear any previous errors
    console.log("Concesionario seleccionado:", concesionario);

    const idConcesionario = Number(concesionario.idConcesionario)

    try {
      // Make a single API call to the comprehensive endpoint
      const response = await apiClient(
        `/concesion/concesionario/${idConcesionario}`,

        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log("Respuesta de la API para concesionario seleccionado:", response.data);
      const primeraConcesion = response.data[0];
      const idC = Number(primeraConcesion.idConcesion); // Asegúrate que el campo se llama idConcesion (minúscula según tu respuesta)

      console.log("ID de concesión a buscar:", idC);

      // Make a single API call to the comprehensive endpoint
      const resdata = await apiClient(
        `/concesion/${idC}`,
        {
          method: 'GET',

          withCredentials: true,
        }
      );
      const fullConcessionData = resdata;
      console.log("Respuesta de la API para detalle de concesión (full data):", fullConcessionData);

      // El objeto real está en fullConcessionData.data
      // fullConcessionData.data is an array of concessions
      // For backward compatibility, pick the first concession as "main" data
      // const data = Array.isArray(fullConcessionData.data) && fullConcessionData.data.length > 0
      //   ? fullConcessionData.data[0]
      //   : fullConcessionData.data;
      console.log("Datos de la concesión obtenidos:", fullConcessionData);
      // fullConcessionData.data is now an array of concessions
      // Adapt to new API response structure (object with .concesion, .concesionario, etc.)
      const concesionItem = fullConcessionData.concesion?.data;
      const concesionarioItem = fullConcessionData.concesionario?.data;
      const beneficiariosArr = fullConcessionData.beneficiarios?.data ?? [];
      const referenciasArr = fullConcessionData.referencias?.data ?? [];
      const direccionesArr = fullConcessionData.direcciones?.data ?? [];
      const seguroItem = fullConcessionData.seguro?.data;
      const vehiculoItem = fullConcessionData.vehiculo?.data;

      if (concesionItem && concesionarioItem) {
        // ConcesionData
        const concession: ConcesionData = {
          idC: concesionItem.IdConcesion,
          folio: concesionItem.Folio ?? "",
          tipoServicio: concesionItem.TipoServicio ?? "",
          tipoPlaca: concesionItem.TipoPlaca ?? "",
          mnemotecnia: concesionItem.Mnemotecnia ?? "",
          modalidad: concesionItem.Modalidad ?? "",
          municipioAutorizado: concesionItem.MunicipioAutorizado ?? "",
          claseUnidad: concesionItem.ClaseUnidad ?? "",
          vigencia: concesionItem.VigenciaAnios ? `${concesionItem.VigenciaAnios} años` : "",
          estatus: concesionItem.Estatus ?? concesionItem.estatus ?? "",
          seriePlaca: concesionItem.SeriePlacaActual ?? "",
          fechaRegistro: concesionItem.FechaExpedicion ?? "",
          fechaRenovacion: concesionItem.FechaRenovacion ?? "",
          numeroExpediente: concesionItem.NumeroExpediente ?? "",
          submodalidad: concesionItem.SubModalidad ?? "",
          localidadAutorizada: concesionItem.LocalidadAutorizada ?? "",
          tipoUnidad: concesionItem.TipoUnidad ?? "",
          seriePlacaAnterior: concesionItem.SeriePlacaAnterior ?? "",
          fechaVencimiento: concesionItem.FechaVencimiento ?? "",
          observaciones: concesionItem.Observaciones ?? "",
        };
        setConcessionData(concession);

        // Set selected concesionario and all their concessions for the table (simulate single concession)
        setConcesionarioSeleccionado({
          ...concesionario,
          ...concesionarioItem,
          nombreCompleto: concesionarioItem.NombreConcesionario ?? `${concesionarioItem.Nombre} ${concesionarioItem.ApellidoPaterno} ${concesionarioItem.ApellidoMaterno}`,
          concesiones: [
            {
              idConcesion: concesionItem.IdConcesion,
              folio: concesionItem.Folio,
              seriePlaca: concesionItem.SeriePlacaActual,
              numeroExpediente: concesionItem.NumeroExpediente,
            },
          ],
        });

        setSelectedExpediente({
          id: concession.numeroExpediente,
          concesion: concession.folio,
          titular:
            concesionarioItem.NombreConcesionario ??
            `${concesionarioItem.Nombre} ${concesionarioItem.ApellidoPaterno} ${concesionarioItem.ApellidoMaterno}`,
          tipo: concession.tipoServicio,
        });

        // Seguro
        if (seguroItem) {
          setSeguroData({
            aseguradora: seguroItem.NombreAseguradora ?? "",
            folioPago: seguroItem.FolioPago ?? "",
            fechaVencimiento: seguroItem.FechaVencimiento ?? "",
            numeroPoliza: seguroItem.NumeroPoliza ?? "",
            fechaExpedicion: seguroItem.FechaExpedicion ?? "",
            observaciones: seguroItem.Observaciones ?? "",
          });
        } else {
          setSeguroData(null);
        }

        // ConcesionarioData
        setConcesionarioData({
          tipoPersona: concesionarioItem.TipoPersona ?? "",
          identificador: concesionarioItem.IdConcesionario ?? "",
          nombre: concesionarioItem.Nombre ?? "",
          apellidoPaterno: concesionarioItem.ApellidoPaterno ?? "",
          apellidoMaterno: concesionarioItem.ApellidoMaterno ?? "",
          fechaNacimiento: concesionarioItem.FechaNacimiento ?? "",
          lugarNacimiento: concesionarioItem.LugarNacimiento ?? "",
          genero: concesionarioItem.Genero ?? "",
          rfc: concesionarioItem.RFC ?? "",
          nacionalidad: concesionarioItem.Nacionalidad ?? "",
          correoElectronico: concesionarioItem.Mail ?? "",
          estadoCivil: concesionarioItem.EstadoCivil ?? "",
          fechaAlta: concesionarioItem.FechaAlta ?? "",
          estatus: concesionarioItem.Estatus ?? "",
          observacionesConcesionario: concesionarioItem.Observaciones ?? "",
          domicilio:
            Array.isArray(direccionesArr) && direccionesArr.length > 0
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
              : null,
          beneficiarios: Array.isArray(beneficiariosArr)
            ? beneficiariosArr.map((b: any) => ({
              nombre: b.NombreCompleto ?? "",
              parentesco: b.Parentesco ?? "",
            }))
            : [],
          referencias: Array.isArray(referenciasArr)
            ? referenciasArr.map((r: any) => ({
              nombreCompleto: r.NombreCompleto ?? "",
              parentesco: r.Parentesco ?? "",
              calle: r.Calle ?? "",
              colonia: r.Colonia ?? "",
              cruzaCon: r.CruceCalles ?? "",
              referencia: r.Referencia ?? "",
              numeroExterior: r.NumExterior ?? "",
              numeroInterior: r.NumInterior ?? "",
              estado: r.Estado ?? "",
              codigoPostal: r.CodigoPostal ?? "",
              municipio: r.Municipio ?? "",
              localidad: r.Localidad ?? "",
              tipoDireccion: r.TipoDireccion ?? "",
              telefonoParticular: r.Telefono ?? "",
              fax: r.Fax ?? "",
            }))
            : [],
          idConcesion: concesionItem.IdConcesion ?? "",
          folio: concesionItem.Folio ?? "",
          fechaExpedicion: concesionItem.FechaExpedicion ?? "",
          fechaVencimiento: concesionItem.FechaVencimiento ?? "",
          vigenciaAnios: concesionItem.VigenciaAnios ?? 0,
          seriePlacaActual: concesionItem.SeriePlacaActual ?? "",
          seriePlacaAnterior: concesionItem.SeriePlacaAnterior ?? "",
          ultimaActualizacion: concesionItem.UltimaActualizacion ?? "",
          idItinerario: concesionItem.IdItinerario ?? 0,
          itinerario: concesionItem.Itinerario ?? "",
          ruta: concesionItem.Ruta ?? "",
          idServicio: concesionItem.IdServicio ?? 0,
          idMunicipioAutorizado: concesionItem.IdMunicipioAutorizado ?? 0,
          estadoExpedicion: concesionItem.EstadoExpedicion ?? "",
          municipioAutorizado: concesionItem.MunicipioAutorizado ?? "",
          idMunicipioExpedicion: concesionItem.IdMunicipioExpedicion ?? 0,
          municipioExpedicion: concesionItem.MunicipioExpedicion ?? "",
          idEstadoExpedicion: concesionItem.IdEstadoExpedicion ?? 0,
          idEstatus: concesionItem.IdEstatus ?? 0,
          idVehiculoActual: concesionItem.IdVehiculoActual ?? "",
          idVehiculoAnterior: concesionItem.IdVehiculoAnterior ?? "",
          idDelegacion: concesionItem.IdDelegacion ?? 0,
          delegacion: concesionItem.Delegacion ?? "",
          idConcesionarioActual: concesionItem.IdConcesionarioActual ?? "",
          idConcesionarioAnterior: concesionItem.IdConcesionarioAnterior ?? "",
          tipoServicio: concesionItem.TipoServicio ?? "",
          tipoServicioAbreviatura: concesionItem.TipoServicioAbreviatura ?? "",
          idPropietario: concesionItem.IdPropietario ?? "",
          idTipoPlaca: concesionItem.IdTipoPlaca ?? "",
          tipoPlaca: concesionItem.TipoPlaca ?? "",
          idClaseUnidad: concesionItem.IdClaseUnidad ?? "",
          claseUnidad: concesionItem.ClaseUnidad ?? "",
          idTipoUnidad: concesionItem.IdTipoUnidad ?? "",
          tipoUnidad: concesionItem.TipoUnidad ?? "",
          idUsoUnidad: concesionItem.IdUsoUnidad ?? "",
          usoUnidad: concesionItem.UsoUnidad ?? "",
          idTipoConcesion: concesionItem.IdTipoConcesion ?? "",
          clave: concesionItem.Clave ?? "",
          tipoConcesion: concesionItem.TipoConcesion ?? "",
          idModalidad: concesionItem.IdModalidad ?? 0,
          modalidad: concesionItem.Modalidad ?? "",
          esConcesion: concesionItem.EsConcesion ?? false,
          numeroExpediente: concesionItem.NumeroExpediente ?? "",
          idSubmodalidad: concesionItem.IdSubmodalidad ?? 0,
          subModalidad: concesionItem.SubModalidad ?? "",
          mnemotecnia: concesionItem.Mnemotecnia ?? "",
          idRuta: concesionItem.IdRuta ?? 0,
          idLocalidadAutorizada: concesionItem.IdLocalidadAutorizada ?? 0,
          localidadAutorizada: concesionItem.LocalidadAutorizada ?? "",
          observaciones: concesionItem.Observaciones ?? "",
          fechaRenovacion: concesionItem.FechaRenovacion ?? "",
        });

        // Vehículo
        if (vehiculoItem) {
          setVehicleDetailsData({
            idV: vehiculoItem.IdVehiculo ?? "",
            // Puedes agregar más campos si los necesitas
          });
        } else {
          setVehicleDetailsData(null);
        }

        setOpenSections([0]);
        setActiveTab(0);
      } else {
        setError("No se encontraron datos detallados para esta concesión.");
      }
    } catch (err) {
      console.error("Error al obtener detalle de la concesión:", err);
      setError("No se pudo obtener el detalle de la concesión. Por favor, intenta de nuevo.");
      setConcessionData(null);
      setSeguroData(null);
      setConcesionarioData(null);
      setVehicleDetailsData(null);
      setSelectedExpediente(null);
    }
  };
  const handleSelectConcesion = async (folio: string) => {
    setConcesionesSeleccionadas([folio]);
    setError(null);

    try {
      // 1. PRIMERA PETICIÓN: Buscar por folio
      const params = new URLSearchParams();
      params.append("folio", folio);

      const { data: basicData } = await apiClient(
        `/concesion/folio?${params.toString()}`,
        {
          method: 'GET',
          withCredentials: true,
        }
      );
      console.log("Respuesta de la API (búsqueda por folio):", basicData);

      const concesionBasica = basicData.data;

      const concesion = {
        idC: concesionBasica?.IdConcesion,
        folio: concesionBasica.Folio ?? "",
        tipoServicio: concesionBasica.TipoServicio ?? "",
        tipoPlaca: concesionBasica.TipoPlaca ?? "",
        mnemotecnia: concesionBasica.Mnemotecnia ?? "",
        modalidad: concesionBasica.Modalidad ?? "",
        municipioAutorizado: concesionBasica.MunicipioAutorizado ?? "",
        claseUnidad: concesionBasica.ClaseUnidad ?? "",
        vigencia: concesionBasica.VigenciaAnios ? `${concesionBasica.VigenciaAnios} años` : "",
        estatus: "",
        seriePlaca: concesionBasica.SeriePlacaActual ?? "",
        fechaRegistro: concesionBasica.FechaExpedicion ?? "",
        fechaRenovacion: concesionBasica.FechaRenovacion ?? "",
        numeroExpediente: concesionBasica.NumeroExpediente ?? "",
        submodalidad: concesionBasica.SubModalidad ?? "",
        localidadAutorizada: concesionBasica.LocalidadAutorizada ?? "",
        tipoUnidad: concesionBasica.TipoUnidad ?? "",
        seriePlacaAnterior: concesionBasica.SeriePlacaAnterior ?? "",
        fechaVencimiento: concesionBasica.FechaVencimiento ?? "",
        observaciones: concesionBasica.Observaciones ?? "",
      };
      console.log("Concesión básica obtenida:", concesion);

      setConcessionData(concesion);
      setSeguroData(null);
      setConcesionarioData(null);
      setVehicleDetailsData(null);
      setSelectedExpediente({
        id: concesionBasica.NumeroExpediente ?? "",
        concesion: concesionBasica.Folio ?? "",
        titular: "", // aún no viene
        tipo: concesionBasica.TipoServicio ?? ""
      });

      // 2. SEGUNDA PETICIÓN: Obtener detalles por IdConcesion
      if (concesion.idC) {
        const { data: detailData } = await apiClient(
          `/concesion/${concesion.idC}`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        const detalle = detailData;

        // Concesionario
        if (detalle.concesionario?.data) {
          const c = detalle.concesionario.data;

          // Creamos un objeto para inspección/debug
          const concesionarioDebugObj = {
            // Datos personales
            tipoPersona: c.TipoPersona ?? "",
            identificador: c.IdConcesionario ?? "",
            nombre: c.Nombre ?? "",
            apellidoPaterno: c.ApellidoPaterno ?? "",
            apellidoMaterno: c.ApellidoMaterno ?? "",
            fechaNacimiento: c.FechaNacimiento ?? "",
            lugarNacimiento: c.LugarNacimiento ?? "",
            genero: c.Genero ?? "",
            rfc: c.RFC ?? "",
            nacionalidad: c.Nacionalidad ?? "",
            correoElectronico: c.Mail ?? "",
            estadoCivil: c.EstadoCivil ?? "",
            fechaAlta: c.FechaAlta ?? "",
            estatus: c.Estatus ?? "",
            observacionesConcesionario: c.Observaciones ?? "",
            domicilio: detalle.direcciones?.data && detalle.direcciones.data.length > 0
              ? {
                calle: detalle.direcciones.data[0].Calle ?? "",
                colonia: detalle.direcciones.data[0].Colonia ?? "",
                cruzaCon: detalle.direcciones.data[0].CruceCalles ?? "",
                referencia: detalle.direcciones.data[0].Referencia ?? "",
                numeroExterior: detalle.direcciones.data[0].NumExterior ?? "",
                numeroInterior: detalle.direcciones.data[0].NumInterior ?? "",
                estado: detalle.direcciones.data[0].Estado ?? "",
                codigoPostal: detalle.direcciones.data[0].CodigoPostal ?? "",
                municipio: detalle.direcciones.data[0].Municipio ?? "",
                localidad: detalle.direcciones.data[0].Localidad ?? "",
                tipoDireccion: detalle.direcciones.data[0].TipoDireccion ?? "",
                esFiscal: detalle.direcciones.data[0].EsFiscal ?? false,
                telefono: detalle.direcciones.data[0].Telefono ?? "",
                fax: detalle.direcciones.data[0].Fax ?? "",
              }
              : null,
            beneficiarios: Array.isArray(detalle.beneficiarios?.data)
              ? detalle.beneficiarios.data.map((b: any) => ({
                nombre: b.NombreCompleto ?? "",
                parentesco: b.Parentesco ?? "",
              }))
              : [],
            referencias: Array.isArray(detalle.referencias?.data)
              ? detalle.referencias.data.map((r: any) => ({
                nombreCompleto: r.NombreCompleto ?? "",
                parentesco: r.Parentesco ?? "",
                calle: r.Calle ?? "",
                colonia: r.Colonia ?? "",
                cruzaCon: r.CruceCalles ?? "",
                referencia: r.Referencia ?? "",
                numeroExterior: r.NumExterior ?? "",
                numeroInterior: r.NumInterior ?? "",
                estado: r.Estado ?? "",
                codigoPostal: r.CodigoPostal ?? "",
                municipio: r.Municipio ?? "",
                localidad: r.Localidad ?? "",
                tipoDireccion: r.TipoDireccion ?? "",
                telefonoParticular: r.Telefono ?? "",
                fax: r.Fax ?? "",
              }))
              : [],
            // Datos de concesión (rellenar con los datos del objeto detalle principal)
            idConcesion: concesionBasica?.IdConcesion ?? "",
            folio: concesionBasica?.Folio ?? "",
            fechaExpedicion: concesionBasica?.FechaExpedicion ?? "",
            fechaVencimiento: concesionBasica?.FechaVencimiento ?? "",
            vigenciaAnios: concesionBasica?.VigenciaAnios ?? 0,
            seriePlacaActual: concesionBasica?.SeriePlacaActual ?? "",
            seriePlacaAnterior: concesionBasica?.SeriePlacaAnterior ?? "",
            ultimaActualizacion: concesionBasica?.UltimaActualizacion ?? "",
            idItinerario: concesionBasica?.IdItinerario ?? 0,
            itinerario: concesionBasica?.Itinerario ?? "",
            ruta: concesionBasica?.Ruta ?? "",
            idServicio: concesionBasica?.IdServicio ?? 0,
            idMunicipioAutorizado: concesionBasica?.IdMunicipioAutorizado ?? 0,
            estadoExpedicion: concesionBasica?.EstadoExpedicion ?? "",
            municipioAutorizado: concesionBasica?.MunicipioAutorizado ?? "",
            idMunicipioExpedicion: concesionBasica?.IdMunicipioExpedicion ?? 0,
            municipioExpedicion: concesionBasica?.MunicipioExpedicion ?? "",
            idEstadoExpedicion: concesionBasica?.IdEstadoExpedicion ?? 0,
            idEstatus: concesionBasica?.IdEstatus ?? 0,
            idVehiculoActual: concesionBasica?.IdVehiculoActual ?? "",
            idVehiculoAnterior: concesionBasica?.IdVehiculoAnterior ?? "",
            idDelegacion: concesionBasica?.IdDelegacion ?? 0,
            delegacion: concesionBasica?.Delegacion ?? "",
            idConcesionarioActual: concesionBasica?.IdConcesionarioActual ?? "",
            idConcesionarioAnterior: concesionBasica?.IdConcesionarioAnterior ?? "",
            tipoServicio: concesionBasica?.TipoServicio ?? "",
            tipoServicioAbreviatura: concesionBasica?.TipoServicioAbreviatura ?? "",
            idPropietario: concesionBasica?.IdPropietario ?? "",
            idTipoPlaca: concesionBasica?.IdTipoPlaca ?? "",
            tipoPlaca: concesionBasica?.TipoPlaca ?? "",
            idClaseUnidad: concesionBasica?.IdClaseUnidad ?? "",
            claseUnidad: concesionBasica?.ClaseUnidad ?? "",
            idTipoUnidad: concesionBasica?.IdTipoUnidad ?? "",
            tipoUnidad: concesionBasica?.TipoUnidad ?? "",
            idUsoUnidad: concesionBasica?.IdUsoUnidad ?? "",
            usoUnidad: concesionBasica?.UsoUnidad ?? "",
            idTipoConcesion: concesionBasica?.IdTipoConcesion ?? "",
            clave: concesionBasica?.Clave ?? "",
            tipoConcesion: concesionBasica?.TipoConcesion ?? "",
            idModalidad: concesionBasica?.IdModalidad ?? 0,
            modalidad: concesionBasica?.Modalidad ?? "",
            esConcesion: concesionBasica?.EsConcesion ?? false,
            numeroExpediente: concesionBasica?.NumeroExpediente ?? "",
            idSubmodalidad: concesionBasica?.IdSubmodalidad ?? 0,
            subModalidad: concesionBasica?.SubModalidad ?? "",
            mnemotecnia: concesionBasica?.Mnemotecnia ?? "",
            idRuta: concesionBasica?.IdRuta ?? 0,
            idLocalidadAutorizada: concesionBasica?.IdLocalidadAutorizada ?? 0,
            localidadAutorizada: concesionBasica?.LocalidadAutorizada ?? "",
            observaciones: concesionBasica?.Observaciones ?? "",
            fechaRenovacion: concesionBasica?.FechaRenovacion ?? "",
          };

          // Puedes ver el objeto en consola para debug
          console.log("Objeto concesionario para debug:", concesionarioDebugObj);

          // Lo asignamos al estado como antes
          setConcesionarioData(concesionarioDebugObj);
        }

        // Vehículo
        // if (detalle.vehiculo?.data) {
        //   const v = detalle.vehiculo.data;
        //   setVehicleDetailsData({
        //     idV: v.IdVehiculo,
        //     clase: v.ClaseVehiculo,
        //     tipo: v.TipoVehiculo,
        //     marca: v.Marca,
        //     modelo: v.Modelo?.toString(),
        //     numeroSerie: v.SerieNIV,
        //     color: v.Color,
        //     numeroMotor: v.Motor,
        //     // ...otros campos si los necesitas
        //   });
        // }

        // Seguro
        // if (detalle.seguro?.data) {
        //   const s = detalle.seguro.data;
        //   setSeguroData({
        //     aseguradora: s.NombreAseguradora,
        //     folioPago: s.FolioPago,
        //     fechaVencimiento: s.FechaVencimiento,
        //     numeroPoliza: s.NumeroPoliza,
        //     fechaExpedicion: s.FechaExpedicion,
        //     observaciones: s.Observaciones,
        //   });
        // }
      }

    } catch (err: any) {
      console.error("Error al seleccionar concesión:", err);
      setError("No se pudo obtener el detalle de la concesión.");
    }
  };


  const toggleConcesionSeleccionada = (id: string) => {
    setConcesionesSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  function ReadonlyField({ label, value }: { label: string; value: string | undefined | null }) {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
        <div className="flex items-center h-10 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50">
          {value || <span className="text-gray-400">No especificado</span>}
        </div>
      </div>
    );
  }

  const cardSections = [
    {
      title: "Información del Concesionario",
      icon: <FileText className="w-4 h-4 text-gray-600" />,
      content: (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-3">
              <ReadonlyField label="Tipo de Persona" value={concesionarioData?.tipoPersona} />
              <ReadonlyField label="Identificador" value={concesionarioData?.identificador} />
              <ReadonlyField label="Nombre" value={concesionarioData?.nombre} />
              <ReadonlyField label="Apellido Paterno" value={concesionarioData?.apellidoPaterno} />
              <ReadonlyField label="Apellido Materno" value={concesionarioData?.apellidoMaterno} />
              <ReadonlyField label="Fecha de Nacimiento" value={concesionarioData?.fechaNacimiento} />
              <ReadonlyField label="Lugar de Nacimiento" value={concesionarioData?.lugarNacimiento} />
              <ReadonlyField label="Género" value={concesionarioData?.genero} />
            </div>
            <div className="space-y-3">
              <ReadonlyField label="RFC" value={concesionarioData?.rfc} />
              <ReadonlyField label="Nacionalidad" value={concesionarioData?.nacionalidad} />
              <ReadonlyField label="Correo Electrónico" value={concesionarioData?.correoElectronico} />
              <ReadonlyField label="Estado Civil" value={concesionarioData?.estadoCivil} />
              <ReadonlyField label="Fecha Alta" value={concesionarioData?.fechaAlta} />
              <ReadonlyField label="Estatus" value={concesionarioData?.estatus} />
            </div>
          </div>

          <div className="mb-6">
            <ReadonlyField label="Observaciones" value={concesionarioData?.observacionesConcesionario} />
          </div>

          <Accordion type="multiple" className="w-full space-y-2">
            <AccordionItem value="beneficiarios" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Beneficiarios Registrados</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 bg-white">
                {(concesionarioData?.beneficiarios ?? []).length > 0 ? (
                  (concesionarioData?.beneficiarios ?? []).map((b, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <ReadonlyField label="Nombre" value={b.nombre} />
                      <ReadonlyField label="Parentesco" value={b.parentesco} />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No hay beneficiarios registrados.</p>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="domicilio" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Domicilio Registrado</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 bg-white grid grid-cols-1 md:grid-cols-2 gap-4">
                {concesionarioData?.domicilio ? (
                  <>
                    <ReadonlyField label="Calle" value={concesionarioData.domicilio.calle} />
                    <ReadonlyField label="Colonia" value={concesionarioData.domicilio.colonia} />
                    <ReadonlyField label="Cruza con" value={concesionarioData.domicilio.cruzaCon} />
                    <ReadonlyField label="Referencia" value={concesionarioData.domicilio.referencia} />
                    <ReadonlyField label="Número Exterior" value={concesionarioData.domicilio.numeroExterior} />
                    <ReadonlyField label="Número Interior" value={concesionarioData.domicilio.numeroInterior} />
                    <ReadonlyField label="Estado" value={concesionarioData.domicilio.estado} />
                    <ReadonlyField label="Código Postal" value={concesionarioData.domicilio.codigoPostal} />
                    <ReadonlyField label="Municipio" value={concesionarioData.domicilio.municipio} />
                    <ReadonlyField label="Localidad" value={concesionarioData.domicilio.localidad} />
                    <ReadonlyField label="Tipo de Dirección" value={concesionarioData.domicilio.tipoDireccion} />
                    <ReadonlyField label="¿Es Fiscal?" value={concesionarioData.domicilio.esFiscal ? "Sí" : "No"} />
                    <ReadonlyField label="Teléfono" value={concesionarioData.domicilio.telefono} />
                    <ReadonlyField label="Fax" value={concesionarioData.domicilio.fax} />
                  </>
                ) : (
                  <p className="text-gray-500 text-sm col-span-2">No hay domicilio registrado.</p>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="referencias" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Referencias Familiares</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 bg-white space-y-4">
                {(concesionarioData?.referencias ?? []).length > 0 ? (
                  (concesionarioData?.referencias ?? []).map((r, i) => (
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
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No hay referencias familiares registradas.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ),
    },
  ];

  // Nuevo: Estado para el término de búsqueda de la segunda tabla
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="max-w-full mx-auto md:p-6">
      <Card className="bg-transparent items-start border-none shadow-none">


        <div className="text-start items-start mb-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-extrabold text-gray-800">Detalle de Vehículo y Seguro</h1>
            <p className="text-sm text-gray-600">Administra la información de vehículos y sus pólizas asociadas</p>
          </div>
        </div>

        <CardContent className="p-6 bg-white shadow-[#B4BFC2] rounded-xl overflow-hidden shadow-md border-[#ECEFF0] space-y-6">
          {/* Sección de búsqueda */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-800">Datos de búsqueda</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <Input
                  id="nombre"
                  className="w-full"
                  placeholder="Nombre"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="paterno" className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno</label>
                <Input
                  id="paterno"
                  className="w-full"
                  placeholder="Apellido Paterno"
                  value={paterno}
                  onChange={e => setPaterno(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="materno" className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno</label>
                <Input
                  id="materno"
                  className="w-full"
                  placeholder="Apellido Materno"
                  value={materno}
                  onChange={e => setMaterno(e.target.value)}
                />
              </div>

            </div>
            <Button
              onClick={handleSearch}
              className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white mt-4"
              disabled={isSearching}
            >
              {isSearching ? "Buscando..." : "Buscar Titular"}
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm text-sm">
              <p>{error}</p>
            </div>
          )}

          {concesionariosEncontrados.length > 0 ? (
            <>
              {/* Tabla de resultados */}
              <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-x-auto">
                <h3 className="px-4 py-3 text-lg font-semibold text-gray-800 border-b">Resultados de la Búsqueda</h3>
                <table className="min-w-full border border-gray-300">
                  <thead className="bg-[#f7fafc]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-300">Seleccionar</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-300">Tipo Persona</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-300">Nombre Completo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-300">RFC</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {concesionariosEncontrados.map((item, index) => (
                      <tr
                        key={index}
                        className={`cursor-pointer hover:bg-gray-50 ${concesionarioSeleccionado?.idConcesionario === item.idConcesionario ? 'bg-blue-50' : ''}`}
                        onClick={() => handleSelectConcesionario(item)}
                      >
                        <td className="px-4 py-3 border-b border-r border-gray-300">
                          <input
                            type="radio"
                            name="selectedConcesionario"
                            checked={concesionarioSeleccionado?.idConcesionario === item.idConcesionario}
                            onChange={() => handleSelectConcesionario(item)}
                            className="accent-blue-600 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-700 border-b border-r border-gray-300">{item.tipoPersona}</td>
                        <td className="px-4 py-3 text-gray-700 border-b border-r border-gray-300">{item.nombreCompleto || `${item.Nombre} ${item.ApellidoPaterno} ${item.ApellidoMaterno}`}</td>
                        <td className="px-4 py-3 text-gray-700 border-b border-gray-300">{item.RFC}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {concesionarioSeleccionado && Array.isArray(concesionarioSeleccionado.concesiones) && (
                  <Card className="border-none shadow-none rounded-xl overflow-hidden">
                    <CardHeader className="border-b  p-6">
                      <div className="flex flex-col space-y-1.5">
                        <h2 className="text-xl font-extrabold text-gray-800">Concesiones del Titular Seleccionado</h2>
                        <p className="text-sm">
                          Información de todas las concesiones asociadas a {concesionarioSeleccionado.nombreCompleto || `${concesionarioSeleccionado.Nombre} ${concesionarioSeleccionado.ApellidoPaterno} ${concesionarioSeleccionado.ApellidoMaterno}`}
                        </p>
                      </div>
                      <div className="mt-4 border-t pt-4">
                        <table className="w-full text-sm text-gray-700 border border-gray-300 rounded-lg overflow-hidden">
                          <thead className=" border border-gray-300">
                            <tr>
                              <th className="font-medium pr-4 py-2 border border-gray-300 bg-gray-50">Seleccionar</th>
                              <th className="font-medium pr-4 py-2 border border-gray-300 bg-gray-50">ID Concesión</th>
                              <th className="font-medium pr-4 py-2 border border-gray-300 bg-gray-50">Folio</th>
                              <th className="font-medium pr-4 py-2 border border-gray-300 bg-gray-50">Serie Placa</th>
                              <th className="font-medium pr-4 py-2 border border-gray-300 bg-gray-50">Número Expediente</th>
                            </tr>
                          </thead>
                          <tbody>
                            {concesionarioSeleccionado.concesiones.map((item: any, idx: number) => (
                              <tr key={idx} className="border-b border-gray-200">
                                <td className="py-2 px-2 border-r border-gray-200 text-center">
                                  <input
                                    type="radio"
                                    name="selectedConcesion"
                                    checked={concessionData?.folio?.toString().trim() === item.folio?.toString().trim()}
                                    onChange={() => handleSelectConcesion(item.folio)}
                                    className="accent-blue-600 cursor-pointer"
                                  />
                                  <div className="text-xs text-gray-400">
                                    debug: {String(concessionData?.folio?.toString().trim())} == {String(item.folio?.toString().trim()) ? "true" : "false"}
                                  </div>
                                </td>
                                <td className="py-2 px-2 border-r border-gray-200">{item.idConcesion || 'N/A'}</td>
                                <td className="py-2 px-2 border-r border-gray-200">{item.folio || 'N/A'}</td>
                                <td className="py-2 px-2 border-r border-gray-200">{item.seriePlaca || 'N/A'}</td>
                                <td className="py-2 px-2">{item.numeroExpediente || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardHeader>
                  </Card>
                )}
              </div>
            </>
          ) : (
            // No results or initial state
            !isSearching && !error && (
              <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 bg-gray-100 rounded-full">
                  <Search className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  No hay resultados para mostrar
                </h3>
                <p className="text-base text-gray-600 max-w-md leading-relaxed">
                  Ingresa el nombre o RFC para buscar información del titular.
                </p>
              </div>
            )
          )}
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
          {/* Sistema de Tabs y  FContenido */}
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

        </CardContent>
      </Card>
    </div >
  );
}