import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, FileText } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AutorizacionModule() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("autorizaciones")

  // Datos de ejemplo
  const autorizaciones = [
    { id: "AUT-001", fecha: "2025-03-15", titular: "Juan Pérez", vehiculo: "ABC-123", estado: "Aprobado" },
    { id: "AUT-002", fecha: "2025-03-14", titular: "María López", vehiculo: "XYZ-789", estado: "Pendiente" },
    { id: "AUT-003", fecha: "2025-03-12", titular: "Carlos Gómez", vehiculo: "DEF-456", estado: "Aprobado" },
    { id: "AUT-004", fecha: "2025-03-10", titular: "Ana Martínez", vehiculo: "GHI-789", estado: "Rechazado" },
    { id: "AUT-005", fecha: "2025-03-08", titular: "Roberto Sánchez", vehiculo: "JKL-012", estado: "Aprobado" },
  ]

  const filteredAutorizaciones = autorizaciones.filter(
    (auth) =>
      auth.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auth.titular.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auth.vehiculo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Número de Autorización</h2>
          <p className="text-muted-foreground">Gestione las autorizaciones del sistema</p>
        </div>
        <Button className="bg-[#bc1c44] hover:bg-[#80142c]">
          <Plus className="mr-2 h-4 w-4" /> Nueva Autorización
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="autorizaciones">Autorizaciones</TabsTrigger>
          <TabsTrigger value="datos">Datos del Cliente</TabsTrigger>
          <TabsTrigger value="vehiculo">Datos del Vehículo</TabsTrigger>
        </TabsList>

        <TabsContent value="autorizaciones">
          <Card>
            <CardHeader>
              <CardTitle>Autorizaciones</CardTitle>
              <CardDescription>Lista de todas las autorizaciones registradas en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar por ID, titular o vehículo..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Titular</TableHead>
                      <TableHead>Vehículo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAutorizaciones.length > 0 ? (
                      filteredAutorizaciones.map((auth) => (
                        <TableRow key={auth.id}>
                          <TableCell className="font-medium">{auth.id}</TableCell>
                          <TableCell>{auth.fecha}</TableCell>
                          <TableCell>{auth.titular}</TableCell>
                          <TableCell>{auth.vehiculo}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                auth.estado === "Aprobado"
                                  ? "bg-green-100 text-green-800"
                                  : auth.estado === "Rechazado"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {auth.estado}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">Ver detalles</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No se encontraron resultados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {filteredAutorizaciones.length} de {autorizaciones.length} autorizaciones
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="datos">
          <Card>
            <CardHeader>
              <CardTitle>Datos del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Player Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Anglicanism</h3>
                  <div className="text-sm text-muted-foreground">
                    <p>Feria de Papi</p>
                    <p>Feria de Vicentenete</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">Observaciones</h3>
                  <div className="text-sm text-muted-foreground">
                    <h4 className="font-medium">Contras</h4>
                    <p>ENVANZO PARADO</p>
                    <p>Titivillus 2022</p>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <h4 className="font-medium">Normes de Planar</h4>
                  <p>Feria de Escalable</p>
                </div>

                <div className="text-sm text-muted-foreground">
                  <h4 className="font-medium">TAXIANATO</h4>
                  <p>Titivillus 2023</p>
                </div>

                <div>
                  <h4 className="font-medium">Normas de Constancia seleccionada</h4>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipos de Persona</TableHead>
                          <TableHead>Ficha</TableHead>
                          <TableHead>Identidades</TableHead>
                          <TableHead>HTML</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="text-sm">Nombre</TableCell>
                          <TableCell className="text-sm">JAPRIL30</TableCell>
                          <TableCell className="text-sm">Apellido Palermo</TableCell>
                          <TableCell className="text-sm">ACANDO</TableCell>
                        </TableRow>
                        {/* Resto de filas de la tabla... */}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <h4 className="font-medium">Observaciones</h4>
                  <div>
                    <h5 className="font-medium">Beneficiarios Negrativos</h5>
                    <ul className="list-disc pl-5">
                      <li>Decisión Negrativa</li>
                      <li>Referencias Funáceas</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Datos de búsqueda Section */}
              <div>
                <h3 className="font-medium">Datos de búsqueda</h3>
                <div className="text-sm text-muted-foreground">
                  <p>Jóvenes es un resolución:</p>
                  <p>[Hélo]</p>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium">Base</h4>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Documento</TableHead>
                          <TableHead>Ficha</TableHead>
                          <TableHead>Sede Plaza</TableHead>
                          <TableHead>Mínima Expediente</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="text-sm">1</TableCell>
                          <TableCell className="text-sm">Generado</TableCell>
                          <TableCell className="text-sm">CIN 0000</TableCell>
                          <TableCell className="text-sm">JABOYIC</TableCell>
                          <TableCell className="text-sm">STCH-PT-2.3.1/18B0-12</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Resto de las secciones de datos... */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehiculo">
          <Card>
            <CardHeader>
              <CardTitle>Datos del Vehículo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Website</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-sm">Client</TableCell>
                      <TableCell className="text-sm">AUTORÓVIA</TableCell>
                    </TableRow>
                    {/* Resto de filas de la tabla del vehículo... */}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pistas Anterior</TableHead>
                      <TableHead>AYSEVIZ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-sm">Cartagena</TableCell>
                      <TableCell className="text-sm">Automoral</TableCell>
                    </TableRow>
                    {/* Resto de filas de la tabla... */}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                <h4 className="font-medium">Futural Impuesto</h4>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}