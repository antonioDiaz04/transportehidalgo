import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Car, FileText, Users } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bienvenido al Sistema ERP</h2>
        <p className="text-muted-foreground">Aquí encontrará un resumen de la información más relevante.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expedientes Activos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#bc1c44]">245</div>
                <p className="text-xs text-muted-foreground">+12% respecto al mes anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#bc1c44]">128</div>
                <p className="text-xs text-muted-foreground">+4 nuevos esta semana</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vehículos Registrados</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#bc1c44]">573</div>
                <p className="text-xs text-muted-foreground">+18 nuevos este mes</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="space-y-4">
                  {[
                    {
                      title: "Nuevo expediente creado",
                      description: "El usuario Admin ha creado un nuevo expediente #12345",
                      timestamp: "Hace 2 horas",
                    },
                    {
                      title: "Vehículo actualizado",
                      description: "Se actualizó la información del vehículo con placa ABC-123",
                      timestamp: "Hace 3 horas",
                    },
                    {
                      title: "Usuario modificado",
                      description: "Se modificaron los permisos del usuario Juan Pérez",
                      timestamp: "Hace 5 horas",
                    },
                    {
                      title: "Inspección completada",
                      description: "Se completó la inspección del vehículo con placa XYZ-789",
                      timestamp: "Hace 1 día",
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-4 rounded-md border p-3">
                      <div className="w-full space-y-1">
                        <p className="text-sm font-medium leading-none">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Estadísticas Rápidas</CardTitle>
                <CardDescription>Resumen de las principales métricas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Expedientes completados", value: "78%" },
                    { label: "Inspecciones pendientes", value: "23" },
                    { label: "Autorizaciones emitidas", value: "156" },
                    { label: "Usuarios activos hoy", value: "42" },
                  ].map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <p className="text-sm font-medium">{stat.label}</p>
                      <p className="text-sm font-bold text-[#bc1c44]">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Datos</CardTitle>
              <CardDescription>Visualización de datos y tendencias</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">Gráficos de análisis (Contenido de ejemplo)</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Disponibles</CardTitle>
              <CardDescription>Genere informes detallados sobre la operación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  "Reporte de Expedientes",
                  "Reporte de Usuarios",
                  "Reporte de Vehículos",
                  "Reporte de Inspecciones",
                  "Reporte de Autorizaciones",
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md border p-3">
                    <p className="text-sm font-medium">{report}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[#bc1c44] border-[#bc1c44] hover:bg-[#bc1c44]/10"
                    >
                      Generar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
