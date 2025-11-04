// services/calendarioService.ts
import { fetchWithAuth } from './apiService';

const API_BASE_URL = import.meta.env.VITE_BACKENDURL || '';

export interface Calendario {
  id: number;
  titulo: string;
  descripcion?: string;
  archivo: string;
  fechaSubida: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalendarioRequest {
  titulo: string;
  descripcion?: string;
  archivo: File;
}

export const getFileUrl = (filePath: string): string => {
  if (filePath.startsWith('http')) {
    return filePath;
  }
  return `${API_BASE_URL}/uploads/calendarios/${filePath}`;
};

export const getAllCalendarios = async (): Promise<Calendario[]> => {
  const response = await fetchWithAuth<{ data: Calendario[] }>('/api/calendario');
  return response.data;
};

export const getCalendarioById = async (id: number): Promise<Calendario> => {
  const response = await fetchWithAuth<{ data: Calendario }>(`/api/calendario/${id}`);
  return response.data;
};

export const createCalendario = async (
  data: CreateCalendarioRequest
): Promise<Calendario> => {
  const formData = new FormData();
  formData.append('titulo', data.titulo);
  if (data.descripcion) formData.append('descripcion', data.descripcion);
  formData.append('archivo', data.archivo);

  const response = await fetchWithAuth<{ data: Calendario }>('/api/calendario', {
    method: 'POST',
    body: formData,
    headers: {
      // No establecer Content-Type, el navegador lo hará automáticamente con boundary
    },
  });
  return response.data;
};

export const updateCalendario = async (
  id: number,
  data: Partial<CreateCalendarioRequest>
): Promise<Calendario> => {
  const formData = new FormData();
  if (data.titulo) formData.append('titulo', data.titulo);
  if (data.descripcion !== undefined) formData.append('descripcion', data.descripcion);
  if (data.archivo) formData.append('archivo', data.archivo);

  const response = await fetchWithAuth<{ data: Calendario }>(`/api/calendario/${id}`, {
    method: 'PUT',
    body: formData,
    headers: {
      // No establecer Content-Type
    },
  });
  return response.data;
};

export const deleteCalendario = async (id: number): Promise<void> => {
  await fetchWithAuth(`/api/calendario/${id}`, {
    method: 'DELETE',
  });
};