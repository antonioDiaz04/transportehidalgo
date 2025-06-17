import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

// 1. Perfil
export const useUserProfile = () =>
  useQuery({
    queryKey: ['userProfile'],
    queryFn: () => apiClient('/user/profile'),
  });

// 2. Productos
export const useProducts = () =>
  useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient('/products'),
  });

// 3. Producto por ID
export const useProductById = (id: string) =>
  useQuery({
    queryKey: ['product', id],
    queryFn: () => apiClient(`/products/${id}`),
    enabled: !!id,
  });

// 4. Crear orden
export const useCreateOrder = () =>
  useMutation({
    mutationFn: (orderData: any) =>
      apiClient('/orders', {
        method: 'POST',
        data: orderData,
      }),
  });

// 5. Actualizar perfil
export const useUpdateUserProfile = () =>
  useMutation({
    mutationFn: (user: any) =>
      apiClient('/user/profile', {
        method: 'PUT',
        data: user,
      }),
  });

// 6. Eliminar producto
export const useDeleteProduct = () =>
  useMutation({
    mutationFn: (id: string) =>
      apiClient(`/products/${id}`, {
        method: 'DELETE',
      }),
  });
