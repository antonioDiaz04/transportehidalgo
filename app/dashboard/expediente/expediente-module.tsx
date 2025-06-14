"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, FileText, Download } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type ReadonlyFieldProps = {
  label: string
  value: string
}

function ReadonlyField({ label, value }: ReadonlyFieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground">{label}:</label>
      <Input value={value} readOnly />
    </div>
  )
}

export default function ExpedienteModule() {
  const [concession, setConcession] = useState('');

  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const toggleAccordion = (index: number) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? null : index))
  }

  // Datos de ejemplo
  const expedientes = [
    { concesion: "Concesión", id: "C014690", titular: "A660FVC", tipo: "STCH-6*1S.2.1/14690-12" },
    { concesion: "Concesión", id: "C014691", titular: "A661FVC", tipo: "STCH-6*1S.2.1/14691-12" },
    { concesion: "Concesión", id: "C014692", titular: "A662FVC", tipo: "STCH-6*1S.2.1/14692-12" },
    { concesion: "Concesión", id: "C014693", titular: "A663FVC", tipo: "STCH-6*1S.2.1/14693-12" },
  ]

  const filteredExpedientes = expedientes.filter((exp) => {
    const matchesSearch =
      exp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.titular.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.tipo.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })


  // Minimalist Accordion Card Section
  const [openCard, setOpenCard] = useState<number | null>(0)

  // Datos de ejemplo para concesión
  const concessionData = {
    folio: "123456",
    tipoServicio: "Transporte Público",
    tipoPlaca: "A",
    mnemotecnia: "MNEMO",
    modalidad: "Urbano",
    municipioAutorizado: "ATOTONILCO DE TULA",
    claseUnidad: "",
    vigencia: "2025",
    estatus: "Activo",
    seriePlaca: "SP123456",
    fechaRegistro: "01/01/2020",
    fechaRenovacion: "01/01/2025",
    numeroExpediente: "EXP123456",
    submodalidad: "Suburbano",
    localidadAutorizada: "Centro",
    tipoUnidad: "",
    seriePlacaAnterior: "",
    fechaVencimiento: "01/01/2026",
    observaciones: "",
  }

  // Datos de ejemplo para seguro
  const seguroData = {
    aseguradora: "AXA Seguros",
    folioPago: "FP123456",
    fechaVencimiento: "01/01/2026",
    numeroPoliza: "NP789012",
    fechaExpedicion: "01/01/2025",
    observaciones: "",
  };

  const concesionarioData = {
    tipoPersona: "Física",
    nombre: "Juan",
    apellidoPaterno: "Pérez",
    apellidoMaterno: "García",
    fechaNacimiento: "01/01/1980",
    lugarNacimiento: "Hidalgo",
    identificador: "ID123456",
    genero: "Masculino",
    rfc: "PEGA800101XXX",
    nacionalidad: "Mexicana",
    correoElectronico: "juan.perez@example.com",
    estadoCivil: "Soltero",
    fechaAlta: "01/01/2020",
    estatus: "Activo",
    observacionesConcesionario: "",

    domicilio: {
      calle: "Av. Reforma",
      colonia: "Centro",
      cruzaCon: "Av. Juárez",
      referencia: "Frente a la plaza",
      numeroExterior: "123",
      numeroInterior: "4B",
      estado: "Hidalgo",
      codigoPostal: "42000",
      municipio: "Pachuca",
      localidad: "Pachuca Centro",
      tipoDireccion: "Particular",
      esFiscal: true,
      telefono: "7711234567",
      fax: "7717654321"
    },

    beneficiarios: [
      { nombre: "Luis Pérez", parentesco: "Hijo" },
      { nombre: "Ana García", parentesco: "Esposa" },
    ],

    referencias: [
      {
        nombreCompleto: "Carlos Ramírez",
        parentesco: "Hermano",
        calle: "Av. Insurgentes",
        colonia: "Del Valle",
        cruzaCon: "Eje 7 Sur",
        referencia: "Cerca del parque",
        numeroExterior: "456",
        numeroInterior: "2A",
        estado: "CDMX",
        codigoPostal: "03100",
        municipio: "Benito Juárez",
        localidad: "Ciudad de México",
        tipoDireccion: "Particular",
        telefonoParticular: "5551234567",
        fax: "5557654321",
      }]
  };

  type Concesionario = {
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
    domicilio?: {
      calle: string;
      numero: string;
      colonia: string;
      municipio: string;
      estado: string;
      codigoPostal: string;
    };
    beneficiarios?: {
      nombre: string;
      parentesco: string;
    }[];
    referencias?: {
      nombre: string;
      telefono: string;
    }[];
  };

  // Data structure for the "Vehiculo" section, based on unnamed.png / image_c99a1c.png
  const vehicleDetailsData = {
    clase: 'AUTOMÓVIL',
    placaAnterior: 'A782FUZ',
    tipo: 'SEDAN',
    categoria: 'Automovil',
    marca: 'NISSAN',
    rfv: '', // Empty in image
    subMarca: 'VERSA',
    cilindros: '0',
    version: 'SEDAN',
    numeroPasajeros: '5',
    modelo: '2018',
    vigencia: '31/dic/2030',
    tipoPlaca: '', // Empty in image
    numeroPuertas: '', // Empty in image
    tipoServicio: 'SERVICIO PÚBLICO DE TRANSPORTE DE PASAJEROS',
    numeroToneladas: '', // Empty in image
    fechaFactura: '01/ene./0001',
    centimetrosCubicos: '', // Empty in image
    folioFactura: '', // Empty in image
    color: '', // Empty in image
    importeFactura: '', // Empty in image
    numeroMotor: 'HR16446815T',
    polizaSeguro: '7960002470',
    numeroSerie: '3N1CN7AD4JK419815',
    origen: '', // Empty in image
    capacidad: '5 P.',
    estadoProcedencia: '', // Empty in image
    combustible: '', // Empty in image
    estatus: 'Activo/Asignado',
    nrpv: '', // Empty in image
  };

  // Datos de ejemplo para propietario
  const propietarioData = {
    nombrePropietario: "Juan Pérez García",
    numeroPoliza: "NP789012",
    folio: "FP123456",
    fechaEmision: "01/01/2025",
    fechaVencimiento: "01/01/2026",
    ruta: "Ruta 1",
    tipoUnidad: "Urbano",
    claseUnidad: "Clase A",
  };

  const cardSections = [
    {
      title: "Concesión",
      content: (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4  p-4 rounded-md">
            <div className="space-y-3">
              <Input readOnly className="bg-gray-100" value={concessionData.folio} placeholder="Folio" />
              <Input readOnly className="bg-gray-100" value={concessionData.tipoServicio} placeholder="Tipo de Servicio" />
              <Input readOnly className="bg-gray-100" value={concessionData.tipoPlaca} placeholder="Tipo Placa" />
              <Input readOnly className="bg-gray-100" value={concessionData.mnemotecnia} placeholder="Mnemotecnia" />
              <Input readOnly className="bg-gray-100" value={concessionData.modalidad} placeholder="Modalidad" />
              <Input readOnly className="bg-gray-100" value={concessionData.municipioAutorizado} placeholder="Municipio Autorizado" />
              <Input readOnly className="bg-gray-100" value={concessionData.claseUnidad} placeholder="Clase Unidad" />
              <Input readOnly className="bg-gray-100" value={concessionData.vigencia} placeholder="Vigencia" />
              <Input readOnly className="bg-gray-100" value={concessionData.estatus} placeholder="Estatus" />
            </div>
            <div className="space-y-3">
              <Input readOnly className="bg-gray-100" value={concessionData.seriePlaca} placeholder="Serie Placa" />
              <Input readOnly className="bg-gray-100" value={concessionData.fechaRegistro} placeholder="Fecha Registro" />
              <Input readOnly className="bg-gray-100" value={concessionData.fechaRenovacion} placeholder="Fecha Renovacion" />
              <Input readOnly className="bg-gray-100" value={concessionData.numeroExpediente} placeholder="Número Expediente" />
              <Input readOnly className="bg-gray-100" value={concessionData.submodalidad} placeholder="Submodalidad" />
              <Input readOnly className="bg-gray-100" value={concessionData.localidadAutorizada} placeholder="Localidad Autorizada" />
              <Input readOnly className="bg-gray-100" value={concessionData.tipoUnidad} placeholder="Tipo Unidad" />
              <Input readOnly className="bg-gray-100" value={concessionData.seriePlacaAnterior} placeholder="Serie Placa Anterior" />
              <Input readOnly className="bg-gray-100" value={concessionData.fechaVencimiento} placeholder="Fecha de Vencimiento" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Observaciones:</label>
            <Input
              value={concessionData.observaciones}
              readOnly
              className="bg-gray-100 border border-gray-200 text-gray-800 rounded-md p-2 text-sm focus:outline-none focus:ring-0 focus:border-gray-200"
            />
          </div>
        </>
      ),
    },
    {
      title: "Seguro",
      content: (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Input readOnly className="bg-gray-100" value={seguroData.aseguradora} placeholder="Aseguradora" />
              <Input readOnly className="bg-gray-100" value={seguroData.folioPago} placeholder="Folio de Pago" />
              <Input readOnly className="bg-gray-100" value={seguroData.fechaVencimiento} placeholder="Fecha de Vencimiento" />
            </div>
            <div className="space-y-3">
              <Input readOnly className="bg-gray-100" value={seguroData.numeroPoliza} placeholder="Número de Póliza" />
              <Input readOnly className="bg-gray-100" value={seguroData.fechaExpedicion} placeholder="Fecha de Expedición" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Observaciones:</label>
            <Input
              value={seguroData.observaciones}
              readOnly
              className="bg-gray-100 border border-gray-200 text-gray-800 rounded-md p-2 text-sm focus:outline-none focus:ring-0 focus:border-gray-200"
            />
          </div>
        </>
      ),
    },
    {
      title: "Información del concesionario",
      content: (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="space-y-3">
              <Input readOnly className="bg-gray-100" value={concesionarioData.tipoPersona} placeholder="Tipo de Persona" />
              <Input readOnly className="bg-gray-100" value={concesionarioData.identificador} placeholder="Identificador" />
              <Input readOnly className="bg-gray-100" value={concesionarioData.nombre} placeholder="Nombre" />
              <Input readOnly className="bg-gray-100" value={concesionarioData.apellidoPaterno} placeholder="Apellido Paterno" />
              <Input readOnly className="bg-gray-100" value={concesionarioData.apellidoMaterno} placeholder="Apellido Materno" />
              <Input readOnly className="bg-gray-100" value={concesionarioData.fechaNacimiento} placeholder="Fecha de Nacimiento" />
              <Input readOnly className="bg-gray-100" value={concesionarioData.lugarNacimiento} placeholder="Lugar de Nacimiento" />
              <Input readOnly className="bg-gray-100" value={concesionarioData.genero} placeholder="Género" />
            </div>
            <div className="space-y-3">
              <Input readOnly className="bg-gray-100" value={concesionarioData.rfc} placeholder="RFC" />
              <Input readOnly className="bg-gray-100" value={concesionarioData.nacionalidad} placeholder="Nacionalidad" />
              <Input readOnly className="bg-gray-100" value={concesionarioData.correoElectronico} placeholder="Correo Electrónico" />
              <Input readOnly className="bg-gray-100" value={concesionarioData.estadoCivil} placeholder="Estado Civil" />
              <Input readOnly className="bg-gray-100" value={concesionarioData.fechaAlta} placeholder="Fecha Alta" />
              <Input readOnly className="bg-gray-100" value={concesionarioData.estatus} placeholder="Estatus" />
            </div>
          </div>

          <div className="mt-4 mb-6">
            <label className="block text-xs font-medium text-gray-700 mb-1">Observaciones:</label>
            <Input
              value={concesionarioData.observacionesConcesionario}
              readOnly
              className="bg-gray-100 border border-gray-200 text-gray-800 rounded-md p-2 text-sm focus:outline-none focus:ring-0 focus:border-gray-200"
            />
          </div>

          {/* Acordeón debajo de observaciones */}
          <div className="border rounded-md overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="beneficiarios">
                <AccordionTrigger className="text-left px-4 py-2 font-medium bg-white border-b">Beneficiarios Registrados</AccordionTrigger>
                <AccordionContent className="p-4 bg-gray-50 space-y-3">
                  {concesionarioData.beneficiarios?.map((b, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-3 rounded-md bg-white">
                      <Input readOnly className="bg-gray-100" value={b.nombre} placeholder="Nombre" />
                      <Input readOnly className="bg-gray-100" value={b.parentesco} placeholder="Parentesco" />
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="domicilio">
                <AccordionTrigger className="text-left px-4 py-2 font-medium bg-white border-b">
                  Domicilio Registrado
                </AccordionTrigger>
                <AccordionContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Calle</label>
                    <Input readOnly className="bg-gray-100" value={concesionarioData.domicilio?.calle} placeholder="Calle" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Colonia</label>
                    <Input readOnly className="bg-gray-100" value={concesionarioData.domicilio?.colonia} placeholder="Colonia" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Cruza con</label>
                    <Input readOnly className="bg-gray-100" value={concesionarioData.domicilio?.cruzaCon} placeholder="Cruza con" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Referencia</label>
                    <Input readOnly className="bg-gray-100" value={concesionarioData.domicilio?.referencia} placeholder="Referencia" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Número Exterior</label>
                    <Input readOnly className="bg-gray-100" value={concesionarioData.domicilio?.numeroExterior} placeholder="Número Exterior" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Número Interior</label>
                    <Input readOnly className="bg-gray-100" value={concesionarioData.domicilio?.numeroInterior} placeholder="Número Interior" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                    <Input readOnly className="bg-gray-100" value={concesionarioData.domicilio?.estado} placeholder="Estado" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Código Postal</label>
                    <Input readOnly className="bg-gray-100" value={concesionarioData.domicilio?.codigoPostal} placeholder="Código Postal" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Municipio</label>
                    <Input readOnly className="bg-gray-100" value={concesionarioData.domicilio?.municipio} placeholder="Municipio" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Localidad</label>
                    <Input readOnly className="bg-gray-100" value={concesionarioData.domicilio?.localidad} placeholder="Localidad" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Dirección</label>
                    <Input readOnly className="bg-gray-100" value={concesionarioData.domicilio?.tipoDireccion} placeholder="Tipo de Dirección" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">¿Es Fiscal?</label>
                    <Input readOnly className="bg-gray-100" value={concesionarioData.domicilio?.esFiscal ? "Sí" : "No"} placeholder="¿Es Fiscal?" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                    <Input readOnly className="bg-gray-100" value={concesionarioData.domicilio?.telefono} placeholder="Teléfono" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Fax</label>
                    <Input readOnly className="bg-gray-100" value={concesionarioData.domicilio?.fax} placeholder="Fax" />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="referencias">
                <AccordionTrigger className="text-left px-4 py-2 font-medium bg-white border-b">
                  Referencias Familiares
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-gray-50 space-y-4">
                  {concesionarioData.referencias?.map((r, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md bg-white">
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Nombre Completo</label>
                        <Input readOnly className="bg-gray-100" value={r.nombreCompleto} placeholder="Nombre Completo" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Parentesco</label>
                        <Input readOnly className="bg-gray-100" value={r.parentesco} placeholder="Parentesco" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Calle</label>
                        <Input readOnly className="bg-gray-100" value={r.calle} placeholder="Calle" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Colonia</label>
                        <Input readOnly className="bg-gray-100" value={r.colonia} placeholder="Colonia" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Cruza con</label>
                        <Input readOnly className="bg-gray-100" value={r.cruzaCon} placeholder="Cruza con" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Referencia</label>
                        <Input readOnly className="bg-gray-100" value={r.referencia} placeholder="Referencia" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Número Exterior</label>
                        <Input readOnly className="bg-gray-100" value={r.numeroExterior} placeholder="Número Exterior" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Número Interior</label>
                        <Input readOnly className="bg-gray-100" value={r.numeroInterior} placeholder="Número Interior" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Estado</label>
                        <Input readOnly className="bg-gray-100" value={r.estado} placeholder="Estado" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Código Postal</label>
                        <Input readOnly className="bg-gray-100" value={r.codigoPostal} placeholder="Código Postal" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Municipio</label>
                        <Input readOnly className="bg-gray-100" value={r.municipio} placeholder="Municipio" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Localidad</label>
                        <Input readOnly className="bg-gray-100" value={r.localidad} placeholder="Localidad" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Tipo de Dirección</label>
                        <Input readOnly className="bg-gray-100" value={r.tipoDireccion} placeholder="Tipo de Dirección" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Teléfono (Particular)</label>
                        <Input readOnly className="bg-gray-100" value={r.telefonoParticular} placeholder="Teléfono (Particular)" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Fax</label>
                        <Input readOnly className="bg-gray-100" value={r.fax} placeholder="Fax" />
                      </div>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </div>
        </>
      ),
    }
    ,
    {
      title: "Vehiculo",
      content: (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.clase} placeholder="Clase" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.tipo} placeholder="Tipo" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.marca} placeholder="Marca" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.subMarca} placeholder="SubMarca" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.version} placeholder="Versión" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.modelo} placeholder="Modelo" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.tipoPlaca} placeholder="Tipo de Placa" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.tipoServicio} placeholder="Tipo de Servicio" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.fechaFactura} placeholder="Fecha Factura" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.folioFactura} placeholder="Folio Factura" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.importeFactura} placeholder="Importe Factura" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.numeroMotor} placeholder="Número de Motor" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.polizaSeguro} placeholder="Póliza de Seguro" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.numeroSerie} placeholder="Número de Serie" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.origen} placeholder="Origen" />
            </div>
            <div className="space-y-3">
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.capacidad} placeholder="Capacidad" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.estadoProcedencia} placeholder="Estado de Procedencia" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.combustible} placeholder="Combustible" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.estatus} placeholder="Estatus" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.placaAnterior} placeholder="Placa Anterior" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.categoria} placeholder="Categoría" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.rfv} placeholder="RFV" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.cilindros} placeholder="Cilindros" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.numeroPasajeros} placeholder="Número de Pasajeros" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.vigencia} placeholder="Vigencia" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.numeroPuertas} placeholder="Número de Puertas" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.numeroToneladas} placeholder="Número de Toneladas" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.centimetrosCubicos} placeholder="Centímetros Cúbicos" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.color} placeholder="Color" />
              <Input readOnly className="bg-gray-100" value={vehicleDetailsData.nrpv} placeholder="NRPV" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
              onClick={() => {
                // Usar router.push para navegación sin recargar la página
                // Importa useRouter de next/navigation arriba
                // import { useRouter } from "next/navigation"
                router.push("iv")
              }}
            >
              Realizar Inspección
            </Button>
          </div>

        </>
      ),
    },
  ]

  return (
    <div className="space-y-6 ">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Consultar Vehículo</h2>
          <p className="text-muted-foreground">Modificar Datos del Vehículo</p>
        </div>
      </div>

      {/* Card simple para la lista de expedientes */}
      <Card className="border border-muted shadow-none">
        <CardContent className="pt-6 pb-6 px-6">
          <div className="mb-6 flex flex-col gap-4">
  <h2 className="text-lg font-semibold text-foreground">Datos de búsqueda</h2>

  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-muted-foreground">Serie Placa:</label>
    <Input
      type="text"
      placeholder="Ingrese la serie o placa..."
    />
  </div>

  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-muted-foreground">Folio:</label>
    <Input
      type="text"
      placeholder="Ingrese el folio..."
    />
  </div>
</div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Elegir</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Folio</TableHead>
                  <TableHead>Serie</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Número Expediente</TableHead>
                  {/* <TableHead className="text-right">Acciones</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpedientes.length > 0 ? (
                  filteredExpedientes.map((exp, idx) => (
                    <TableRow key={exp.id}>
                      <TableCell>
                        <div className="relative group flex justify-center">
                          <button
                            type="button"
                            className="p-1 rounded hover:bg-accent focus:outline-none"
                            aria-label="Seleccionar"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={20}
                              height={20}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              className="text-muted-foreground"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8.5V19a2 2 0 002 2h14a2 2 0 002-2V8.5M3 8.5L12 3l9 5.5M3 8.5l9 5.5 9-5.5"
                              />
                            </svg>
                            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition bg-black text-white text-xs rounded py-1 px-2 z-10 whitespace-nowrap">
                              Seleccionar
                            </span>
                          </button>
                        </div>
                      </TableCell>
                      <TableCell> {exp.concesion}</TableCell>
                      <TableCell>{exp.id}</TableCell>
                      <TableCell>{exp.tipo}</TableCell>
                      <TableCell>{exp.titular}</TableCell>
                      <TableCell>{exp.id}</TableCell>
                      {/* <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon">
                <FileText className="h-4 w-4" />
                <span className="sr-only">Ver detalles</span>
                </Button>
                <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
                <span className="sr-only">Descargar</span>
                </Button>
              </div>
              </TableCell> */}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No se encontraron resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <CardFooter className="flex justify-between px-0 pt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {filteredExpedientes.length} de {expedientes.length} expedientes
            </div>
          </CardFooter>
        </CardContent>
      </Card>

      {cardSections.map((section, idx) => (
        <Card key={section.title} className="border border-muted shadow-none overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center justify-between px-2 py-2  border-b border-blue-200 hover:bg-muted bg-blue-50  transition-colors rounded-t-lg focus:outline-none"
            onClick={() => setOpenCard(openCard === idx ? null : idx)}
            aria-expanded={openCard === idx}
            aria-controls={`section-content-${idx}`}
          >
            <span className="text-lg font-semibold text-blue-800">{section.title}</span>
            <span
              className={`transition-transform duration-200 text-muted-foreground ${openCard === idx ? "rotate-90" : ""}`}
            >
              ▶
            </span>
          </button>
          <div
            id={`section-content-${idx}`}
            style={{
              maxHeight: openCard === idx ? 2000 : 0,
              transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              overflow: "hidden",
              opacity: openCard === idx ? 1 : 0,
              pointerEvents: openCard === idx ? "auto" : "none",
            }}
            aria-hidden={openCard !== idx}
          >
            {openCard === idx && (
              <CardContent className="pt-0 pb-6 px-6 animate-fade-in">
                {section.content}
              </CardContent>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
