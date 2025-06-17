// lib/apiClient.ts
import axios, { AxiosRequestConfig } from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// Creamos una instancia de Axios
const instance = axios.create({
  baseURL: baseUrl,
  headers: {
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

// Interceptor: manejo global de errores
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('No autorizado (401)');
      // Aquí puedes hacer logout o redirigir al login
    }
    return Promise.reject(error);
  }
);

// Función API tipo fetch: (endpoint, config)
const apiClient = async <T = any>(endpoint: string, config: AxiosRequestConfig = {}) => {
  const response = await instance.request<T>({
    url: endpoint,
    ...config,
  });
  return response.data;
};

export default apiClient;
