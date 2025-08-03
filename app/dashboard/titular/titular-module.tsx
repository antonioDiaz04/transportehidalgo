"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Loader2, Car, Shield } from "lucide-react";
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

// Interfaces de tipos
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
  clase: string;
  placaAnterior: string;
  tipo: string;
  categoria: string;
  marca: string;
  subMarca: string;
  modelo: string;
  numeroMotor: string;
  numeroSerie: string;
  polizaSeguro: string;
  capacidad: string;
  combustible: string;
  estatus: string;
}

export default function TitularModule() {
  const router = useRouter();

  // Estados para búsqueda
  const [nombre, setNombre] = useState('');
  const [paterno, setPaterno] = useState('');
  const [materno, setMaterno] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Estados para datos
  const [selectedExpediente, setSelectedExpediente] = useState<Expediente | null>(null);
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [concessionData, setConcessionData] = useState<ConcesionData | null>(null);
  const [seguroData, setSeguroData] = useState<SeguroData | null>(null);
  const [concesionarioData, setConcesionarioData] = useState<ConcesionarioData | null>(null);
  const [vehicleDetailsData, setVehicleDetailsData] = useState<VehicleDetailsData | null>(null);

  // Estados para UI
  const [error, setError] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [isLoadingSelection, setIsLoadingSelection] = useState(false);
  const [concesionariosEncontrados, setConcesionariosEncontrados] = useState<any[]>([]);
  const [concesionarioSeleccionado, setConcesionarioSeleccionado] = useState<any>(null);
  const [concesionesSeleccionadas, setConcesionesSeleccionadas] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  // Prefetch de rutas
  useEffect(() => {
    router.prefetch("/dashboard/ModificacionVehiculo");
    router.prefetch("/dashboard/iv");
  }, [router]);

  // Navegación
  const navigateToModification = useCallback(() => {
    if (!concessionData?.idC || !vehicleDetailsData?.idV) return;
    router.push(`/dashboard/ModificacionVehiculo?idC=${concessionData.idC}&idV=${vehicleDetailsData.idV}`);
  }, [concessionData?.idC, vehicleDetailsData?.idV, router]);

  const navigateToInspection = useCallback(() => {
    if (!concessionData?.idC) return;
    router.push(`/dashboard/iv?idC=${concessionData.idC}`);
  }, [concessionData?.idC, router]);

  // Componente para campos de solo lectura
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

  // Definición de las pestañas
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
                  concesionarioData?.beneficiarios.map((b, i) => (
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
                  concesionarioData?.referencias.map((r, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <ReadonlyField label="Teléfono Particular" value={r.telefonoParticular} />
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
    {
      title: "Concesión",
      icon: <FileText className="w-4 h-4 text-gray-600" />,
      content: (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <ReadonlyField label="Folio" value={concessionData?.folio} />
              <ReadonlyField label="Tipo de Servicio" value={concessionData?.tipoServicio} />
              <ReadonlyField label="Tipo Placa" value={concessionData?.tipoPlaca} />
              <ReadonlyField label="Mnemotecnia" value={concessionData?.mnemotecnia} />
              <ReadonlyField label="Modalidad" value={concessionData?.modalidad} />
              <ReadonlyField label="Municipio Autorizado" value={concessionData?.municipioAutorizado} />
              <ReadonlyField label="Clase Unidad" value={concessionData?.claseUnidad} />
            </div>
            <div className="space-y-3">
              <ReadonlyField label="Vigencia" value={concessionData?.vigencia} />
              <ReadonlyField label="Estatus" value={concessionData?.estatus} />
              <ReadonlyField label="Serie Placa" value={concessionData?.seriePlaca} />
              <ReadonlyField label="Fecha Registro" value={concessionData?.fechaRegistro} />
              <ReadonlyField label="Fecha Renovación" value={concessionData?.fechaRenovacion} />
              <ReadonlyField label="Número Expediente" value={concessionData?.numeroExpediente} />
              <ReadonlyField label="Submodalidad" value={concessionData?.submodalidad} />
            </div>
          </div>
          <div className="mt-4">
            <ReadonlyField label="Observaciones" value={concessionData?.observaciones} />
          </div>
        </div>
      ),
    },
    {
      title: "Seguro",
      icon: <Shield className="w-4 h-4 text-gray-600" />,
      content: (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <ReadonlyField label="Aseguradora" value={seguroData?.aseguradora} />
              <ReadonlyField label="Número de Póliza" value={seguroData?.numeroPoliza} />
              <ReadonlyField label="Folio de Pago" value={seguroData?.folioPago} />
            </div>
            <div className="space-y-3">
              <ReadonlyField label="Fecha de Expedición" value={seguroData?.fechaExpedicion} />
              <ReadonlyField label="Fecha de Vencimiento" value={seguroData?.fechaVencimiento} />
            </div>
          </div>
          <div className="mt-4">
            <ReadonlyField label="Observaciones" value={seguroData?.observaciones} />
          </div>
        </div>
      ),
    },
    {
      title: "Vehículo",
      icon: <Car className="w-4 h-4 text-gray-600" />,
      content: (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <ReadonlyField label="Marca" value={vehicleDetailsData?.marca} />
              <ReadonlyField label="SubMarca" value={vehicleDetailsData?.subMarca} />
              <ReadonlyField label="Modelo" value={vehicleDetailsData?.modelo} />
              <ReadonlyField label="Tipo" value={vehicleDetailsData?.tipo} />
              <ReadonlyField label="Clase" value={vehicleDetailsData?.clase} />
              <ReadonlyField label="Número de Motor" value={vehicleDetailsData?.numeroMotor} />
            </div>
            <div className="space-y-3">
              <ReadonlyField label="Número de Serie" value={vehicleDetailsData?.numeroSerie} />
              <ReadonlyField label="Placa Anterior" value={vehicleDetailsData?.placaAnterior} />
              <ReadonlyField label="Póliza de Seguro" value={vehicleDetailsData?.polizaSeguro} />
              <ReadonlyField label="Capacidad" value={vehicleDetailsData?.capacidad} />
              <ReadonlyField label="Combustible" value={vehicleDetailsData?.combustible} />
              <ReadonlyField label="Estatus" value={vehicleDetailsData?.estatus} />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={navigateToModification}
              disabled={!concessionData?.idC || !vehicleDetailsData?.idV}
            >
              Modificar Vehículo
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={navigateToInspection}
              disabled={!concessionData?.idC}
            >
              Realizar Inspección
            </Button>
          </div>
        </div>
      ),
    },
  ];

  // Función para buscar titulares
  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSearching(true);
    setError(null);
    setSelectionError(null);
    setConcesionariosEncontrados([]);
    setConcesionarioSeleccionado(null);
    setConcessionData(null);
    setSeguroData(null);
    setConcesionarioData(null);
    setVehicleDetailsData(null);
    setSelectedExpediente(null);

    try {
      const searchParams = new URLSearchParams();
      if (nombre.trim()) searchParams.append("nombre", nombre.trim());
      if (paterno.trim()) searchParams.append("paterno", paterno.trim());
      if (materno.trim()) searchParams.append("materno", materno.trim());

      const { data } = await apiClient(`/concesion/titular?${searchParams.toString()}`, {
        method: 'GET',
        withCredentials: true,
      });

      const searchResults = data || [];
      setConcesionariosEncontrados(searchResults);

      if (searchResults.length === 0) {
        setError("No se encontraron resultados para la búsqueda.");
      } else if (searchResults.length === 1) {
        await handleSelectConcesionario(searchResults[0]);
      }
    } catch (err) {
      console.error("Error al buscar titular:", err);
      setError("Error al buscar titular. Por favor, intenta de nuevo.");
    } finally {
      setIsSearching(false);
    }
  };

  // Función para seleccionar concesionario

  // Función para seleccionar concesionario (lógica completada y corregida)
  const handleSelectConcesionario = async (concesionario: any) => {
    setIsLoadingSelection(true);
    setConcesionarioSeleccionado(concesionario);
    setError(null);
    setSelectionError(null);
    const idConcesionario = Number(concesionario.idConcesionario);

    try {
      console.log("Obteniendo detalle de concesión para concesionario ID:", idConcesionario);

      // PRIMERA LLAMADA: Obtiene el detalle del concesionario
      const response = await apiClient(`/concesion/concesionario/${idConcesionario}`, {
        method: 'GET',
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      console.log("Respuesta de la API para concesionario seleccionado:", response);

      let fullConcessionData;
      let concesionDataFromResponse = response?.concesion?.data;
      const concesionarioDataFromResponse = response?.concesionario?.data;
      const isConcesionarioOnlyResponse = concesionarioDataFromResponse && !concesionDataFromResponse;

      // Lógica para cuando la concesión es null
      if (isConcesionarioOnlyResponse) {
        console.log("Se recibieron solo datos del concesionario. Procediendo con el flujo adecuado.");
        fullConcessionData = response;
      } else if (response?.concesionario?.data) {
        console.log("Se recibieron los datos completos en la primera llamada.");
        fullConcessionData = response;
      } else if (Array.isArray(response?.data) && response.data.length > 0) {
        const primeraConcesion = response.data[0];
        const idConcesion = Number(primeraConcesion.idConcesion);

        if (!idConcesion) {
          throw new Error("No se pudo obtener un ID de concesión válido para la segunda llamada.");
        }

        console.log("Se recibió un array de concesiones. Realizando segunda llamada con ID:", idConcesion);
        const resdata = await apiClient(`/concesion/${idConcesion}`, {
          method: 'GET',
          withCredentials: true,
        });
        fullConcessionData = resdata;
      } else {
        throw new Error("La respuesta de la API no contiene los datos de concesión esperados.");
      }

      // A partir de aquí, el código maneja de forma segura los datos
      console.log("Respuesta de la API para detalle de concesión (full data):", fullConcessionData);

      // Mapeo de datos seguro
      const concesionItem = fullConcessionData.concesion?.data;
      const concesionarioItem = fullConcessionData.concesionario?.data;
      const beneficiariosArr = fullConcessionData.beneficiarios?.data ?? [];
      const referenciasArr = fullConcessionData.referencias?.data ?? [];
      const direccionesArr = fullConcessionData.direcciones?.data ?? [];
      const seguroItem = fullConcessionData.seguro?.data;
      const vehiculoItem = fullConcessionData.vehiculo?.data;

      if (concesionarioItem) {
        // ConcesionData (se puede establecer como null si no existe)
        if (concesionItem) {
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
        } else {
          setConcessionData(null); // Establecer como null si no hay datos de concesión
        }

        // Set selected concesionario and all their concessions for the table (simulate single concession)
        setConcesionarioSeleccionado({
          ...concesionario,
          ...concesionarioItem,
          nombreCompleto: concesionarioItem.NombreConcesionario ?? `${concesionarioItem.Nombre} ${concesionarioItem.ApellidoPaterno} ${concesionarioItem.ApellidoMaterno}`,
          concesiones: concesionItem ? [{
            idConcesion: concesionItem.IdConcesion,
            folio: concesionItem.Folio,
            seriePlaca: concesionItem.SeriePlacaActual,
            numeroExpediente: concesionItem.NumeroExpediente,
          }] : [],
        });

        if (concesionItem) {
          setSelectedExpediente({
            id: concesionItem.NumeroExpediente,
            concesion: concesionItem.Folio,
            titular:
              concesionarioItem.NombreConcesionario ??
              `${concesionarioItem.Nombre} ${concesionarioItem.ApellidoPaterno} ${concesionarioItem.ApellidoMaterno}`,
            tipo: concesionItem.TipoServicio,
          });
        } else {
          setSelectedExpediente(null);
        }


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
          idConcesion: concesionItem?.IdConcesion ?? "",
          folio: concesionItem?.Folio ?? "",
          fechaExpedicion: concesionItem?.FechaExpedicion ?? "",
          fechaVencimiento: concesionItem?.FechaVencimiento ?? "",
          vigenciaAnios: concesionItem?.VigenciaAnios ?? 0,
          seriePlacaActual: concesionItem?.SeriePlacaActual ?? "",
          seriePlacaAnterior: concesionItem?.SeriePlacaAnterior ?? "",
          ultimaActualizacion: concesionItem?.UltimaActualizacion ?? "",
          idItinerario: concesionItem?.IdItinerario ?? 0,
          itinerario: concesionItem?.Itinerario ?? "",
          ruta: concesionItem?.Ruta ?? "",
          idServicio: concesionItem?.IdServicio ?? 0,
          idMunicipioAutorizado: concesionItem?.IdMunicipioAutorizado ?? 0,
          estadoExpedicion: concesionItem?.EstadoExpedicion ?? "",
          municipioAutorizado: concesionItem?.MunicipioAutorizado ?? "",
          idMunicipioExpedicion: concesionItem?.IdMunicipioExpedicion ?? 0,
          municipioExpedicion: concesionItem?.MunicipioExpedicion ?? "",
          idEstadoExpedicion: concesionItem?.IdEstadoExpedicion ?? 0,
          idEstatus: concesionItem?.IdEstatus ?? 0,
          idVehiculoActual: concesionItem?.IdVehiculoActual ?? "",
          idVehiculoAnterior: concesionItem?.IdVehiculoAnterior ?? "",
          idDelegacion: concesionItem?.IdDelegacion ?? 0,
          delegacion: concesionItem?.Delegacion ?? "",
          idConcesionarioActual: concesionItem?.IdConcesionarioActual ?? "",
          idConcesionarioAnterior: concesionItem?.IdConcesionarioAnterior ?? "",
          tipoServicio: concesionItem?.TipoServicio ?? "",
          tipoServicioAbreviatura: concesionItem?.TipoServicioAbreviatura ?? "",
          idPropietario: concesionItem?.IdPropietario ?? "",
          idTipoPlaca: concesionItem?.IdTipoPlaca ?? "",
          tipoPlaca: concesionItem?.TipoPlaca ?? "",
          idClaseUnidad: concesionItem?.IdClaseUnidad ?? "",
          claseUnidad: concesionItem?.ClaseUnidad ?? "",
          idTipoUnidad: concesionItem?.IdTipoUnidad ?? "",
          tipoUnidad: concesionItem?.TipoUnidad ?? "",
          idUsoUnidad: concesionItem?.IdUsoUnidad ?? "",
          usoUnidad: concesionItem?.UsoUnidad ?? "",
          idTipoConcesion: concesionItem?.IdTipoConcesion ?? "",
          clave: concesionItem?.Clave ?? "",
          tipoConcesion: concesionItem?.TipoConcesion ?? "",
          idModalidad: concesionItem?.IdModalidad ?? 0,
          modalidad: concesionItem?.Modalidad ?? "",
          esConcesion: concesionItem?.EsConcesion ?? false,
          numeroExpediente: concesionItem?.NumeroExpediente ?? "",
          idSubmodalidad: concesionItem?.IdSubmodalidad ?? 0,
          subModalidad: concesionItem?.SubModalidad ?? "",
          mnemotecnia: concesionItem?.Mnemotecnia ?? "",
          idRuta: concesionItem?.IdRuta ?? 0,
          idLocalidadAutorizada: concesionItem?.IdLocalidadAutorizada ?? 0,
          localidadAutorizada: concesionItem?.LocalidadAutorizada ?? "",
          observaciones: concesionItem?.Observaciones ?? "",
          fechaRenovacion: concesionItem?.FechaRenovacion ?? "",
        });

        // Vehiculo
        if (vehiculoItem) {
          setVehicleDetailsData({
            idV: vehiculoItem.IdVehiculo ?? "",
            clase: vehiculoItem.Clase ?? "",
            placaAnterior: vehiculoItem.PlacaAnterior ?? "",
            tipo: vehiculoItem.Tipo ?? "",
            categoria: vehiculoItem.Categoria ?? "",
            marca: vehiculoItem.Marca ?? "",
            subMarca: vehiculoItem.SubMarca ?? "",
            modelo: vehiculoItem.Modelo ?? "",
            numeroMotor: vehiculoItem.NumeroMotor ?? "",
            numeroSerie: vehiculoItem.NumeroSerie ?? "",
            polizaSeguro: vehiculoItem.PolizaSeguro ?? "",
            capacidad: vehiculoItem.Capacidad ?? "",
            combustible: vehiculoItem.Combustible ?? "",
            estatus: vehiculoItem.Estatus ?? "",
          });
        } else {
          setVehicleDetailsData(null);
        }

      } else {
        throw new Error("Datos de concesionario no encontrados en la respuesta de la API.");
      }

    } catch (err) {
      console.error("Error al obtener el detalle del concesionario:", err);
      setSelectionError("No se pudo cargar la información completa. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoadingSelection(false);
    }
  };

  return (
    <div className="max-w-full mx-auto md:p-6">
      <Card className="bg-transparent border-none shadow-none">
        <div className="text-start mb-4">
          <h1 className="text-2xl font-extrabold text-gray-800">Detalle de Vehículo y Seguro</h1>
          <p className="text-sm text-gray-600">Administra la información de vehículos y sus pólizas asociadas</p>
        </div>

        <CardContent className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 space-y-6">
          {/* Sección de búsqueda */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-800">Datos de búsqueda</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <Input
                  placeholder="Nombre"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno</label>
                <Input
                  placeholder="Apellido Paterno"
                  value={paterno}
                  onChange={e => setPaterno(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno</label>
                <Input
                  placeholder="Apellido Materno"
                  value={materno}
                  onChange={e => setMaterno(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : "Buscar Titular"}
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Resultados de búsqueda */}
          {concesionariosEncontrados.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <h3 className="px-4 py-3 text-lg font-semibold text-gray-800 border-b">Resultados de la Búsqueda</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seleccionar</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo Persona</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre Completo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">RFC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {concesionariosEncontrados.map((item, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-gray-50 cursor-pointer ${concesionarioSeleccionado?.idConcesionario === item.idConcesionario ? 'bg-blue-50' : ''}`}
                      onClick={() => handleSelectConcesionario(item)}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="radio"
                          checked={concesionarioSeleccionado?.idConcesionario === item.idConcesionario}
                          onChange={() => handleSelectConcesionario(item)}
                          className="accent-blue-600"
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-700">{item.tipoPersona}</td>
                      <td className="px-4 py-3 text-gray-700">{item.nombreCompleto}</td>
                      <td className="px-4 py-3 text-gray-700">{item.RFC}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Detalles del concesionario seleccionado */}
          {concesionarioSeleccionado && (
            <div className="mt-6">
              {isLoadingSelection ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <>
                  {selectionError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                      {selectionError}
                    </div>
                  )}
                  {/* Tabla de resultados */}
                   {concesionarioSeleccionado && Array.isArray(concesionarioSeleccionado.concesiones) && (
                  <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-x-auto">
                    <h2 className="px-4 py-3 text-lg font-semibold text-gray-800 border-b"> Información de la consesion seleccionado</h2>

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
                )}


                  <div className="bg-white rounded-lg border border-gray-200">
                    {/* Pestañas */}
                    {/* Sistema de Tabs y Contenido */}
                    <h2 className="px-4 py-3 text-lg font-semibold text-gray-800 border-b">Detalles del Concesionario</h2>

                    <div className="flex border-b border-gray-200">
                      {cardSections.map((section, index) => (
                        <button
                          key={index}
                          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === index
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-blue-500'
                            }`}
                          onClick={() => setActiveTab(index)}
                        >
                          <div className="flex items-center gap-2">
                            {section.icon}
                            {section.title}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Contenido de la pestaña activa */}
                    <div className="p-6">
                      {cardSections[activeTab]?.content}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}