import { getUserSession, clearUserSession, saveUserSession } from "@/lib/indexedDb"

export interface User {
  id: string
  name: string
  username: string
  email?: string
  role?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Verificar si el usuario está autenticado
export async function checkAuth(): Promise<AuthState> {
  try {
    const session = await getUserSession()

    if (session.length > 0) {
      return {
        user: session[0],
        isAuthenticated: true,
        isLoading: false,
      }
    }

    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }
  } catch (error) {
    console.error("Error checking auth:", error)
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }
  }
}

// Cerrar sesión
export async function logout() {
  try {
    await clearUserSession()
    // Limpiar cookies si las usas
    document.cookie = "session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    window.location.href = "/"
  } catch (error) {
    console.error("Error during logout:", error)
  }
}

// Iniciar sesión
export async function login(user: User) {
  try {
    await saveUserSession(user)
    // Opcional: establecer cookie para el middleware
    document.cookie = `session-token=${user.id}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 días
  } catch (error) {
    console.error("Error during login:", error)
    throw error
  }
}
