import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Rutas que requieren autenticación
  const protectedPaths = ["/dashboard"]

  // Verificar si la ruta actual está protegida
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath) {
    // Verificar si existe el token de sesión en las cookies
    const sessionToken = request.cookies.get("user-session")

    if (!sessionToken) {
      // Redirigir al login si no hay sesión
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
