// lib/apiClient.ts
import axios, { AxiosRequestConfig } from 'axios';
import { clearUserSession } from "@/lib/indexedDb"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// Creamos una instancia de Axios
const instance = axios.create({
  baseURL: baseUrl,
  headers: {
    // Mantenemos 'Content-Type': 'application/json' como el valor por defecto.
    // Esto es lo que la mayoría de tus APIs REST probablemente esperan.
    'Content-Type': 'application/json',
  },
});

// Interceptor: añadir token automáticamente
instance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('No autorizado (401) – cerrando sesión...')

      // 🧹 Limpiar token localStorage
      localStorage.removeItem('authToken')

      // 🧹 Limpiar sesión del usuario en IndexedDB
      await clearUserSession()

      // 🔁 Redirigir al login
      if (typeof window !== "undefined") {
        window.location.href = "/" // O "/login" si es tu ruta de login
      }
    }

    return Promise.reject(error)
  }
)

// Función API tipo fetch: (endpoint, config)
const apiClient = async <T = any>(endpoint: string, config: AxiosRequestConfig = {}) => {
  // Creamos una copia de la configuración para evitar mutar el objeto original
  const requestConfig: AxiosRequestConfig = { ...config };

  // ** Aquí está la clave: detectamos si los datos son FormData **
  // Si 'data' es una instancia de FormData, ajustamos el Content-Type para esa solicitud.
  // Esto sobrescribe el Content-Type por defecto de la instancia de Axios solo para esta llamada.
  if (requestConfig.data instanceof FormData) {
    requestConfig.headers = {
      ...requestConfig.headers, // Mantenemos otros encabezados que ya existan en la configuración
      'Content-Type': 'multipart/form-data', // Establecemos explícitamente el tipo correcto para archivos
    };
    // NOTA: Axios es lo suficientemente inteligente como para añadir el 'boundary'
    // automáticamente cuando el Content-Type es 'multipart/form-data' y el data es FormData.
    // No necesitas añadirlo manualmente aquí.
  }

  const response = await instance.request<T>({
    url: endpoint,
    ...requestConfig, // Usamos la configuración potencialmente modificada
  });
  return response.data;
};

export default apiClient;
