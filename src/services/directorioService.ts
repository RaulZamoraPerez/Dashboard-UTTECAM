// services/directorioService.ts
import { fetchWithAuth } from './apiService';
import { Directorio, CreateDirectorioRequest } from '../types/directorio';

const API_BASE_URL = import.meta.env.VITE_BACKENDURL || '';

export const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) {
    return '/images/default-avatar.png';
  }
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  // Normalizar rutas relativas a la carpeta correcta del backend
  if (imagePath.startsWith('directorio/')) {
    return `${API_BASE_URL}/uploads/${imagePath.replace('directorio/', 'directorios/')}`;
  }
  if (imagePath.startsWith('directorios/')) {
    return `${API_BASE_URL}/uploads/${imagePath}`;
  }
  return `${API_BASE_URL}/uploads/directorios/${imagePath}`;
};

export const getAllDirectorios = async (): Promise<Directorio[]> => {
  const response = await fetchWithAuth<{ data: Directorio[] }>('/api/directorios');
  return response.data;
};

export const getDirectorioById = async (id: number): Promise<Directorio> => {
  const response = await fetchWithAuth<{ data: Directorio }>(`/api/directorios/${id}`);
  return response.data;
};

export const createDirectorio = async (
  data: CreateDirectorioRequest,
  imagen?: File
): Promise<Directorio> => {
  const formData = new FormData();
  formData.append('titulo', data.titulo);
  formData.append('nombre', data.nombre);
  if (data.telefono) formData.append('telefono', data.telefono);
  if (data.extension) formData.append('extension', data.extension);
  if (data.correo) formData.append('correo', data.correo);
  if (imagen) formData.append('imagen', imagen);

  const response = await fetchWithAuth<{ data: Directorio }>('/api/directorios', {
    method: 'POST',
    body: formData,
    headers: {
      // No establecer Content-Type, el navegador lo hará automáticamente con boundary
    },
  });

  return response.data;
};

export const updateDirectorio = async (
  id: number,
  data: CreateDirectorioRequest,
  imagen?: File
): Promise<Directorio> => {
  const formData = new FormData();
  formData.append('titulo', data.titulo);
  formData.append('nombre', data.nombre);
  if (data.telefono) formData.append('telefono', data.telefono);
  if (data.extension) formData.append('extension', data.extension);
  if (data.correo) formData.append('correo', data.correo);
  if (imagen) formData.append('imagen', imagen);

  const response = await fetchWithAuth<{ data: Directorio }>(`/api/directorios/${id}`, {
    method: 'PUT',
    body: formData,
    headers: {
      // No establecer Content-Type, el navegador lo hará automáticamente con boundary
    },
  });

  return response.data;
};

export const deleteDirectorio = async (id: number): Promise<void> => {
  await fetchWithAuth(`/api/directorios/${id}`, {
    method: 'DELETE',
  });
};
