// src/services/movilidadService.ts
import { fetchWithAuth } from './apiService';

export interface MovilidadResource {
  id: number;
  titulo: string;
  descripcion?: string;
  url: string;
  tipo: 'pdf' | 'image';
  fecha_subida: string;
  is_active: boolean;
}

/**
 * Obtener todos los recursos de Movilidad Internacional
 */
export const getMovilidadResources = async (): Promise<MovilidadResource[]> => {
  return await fetchWithAuth<MovilidadResource[]>('/api/movilidad-internacional');
};

/**
 * Subir un nuevo recurso (PDF o imagen)
 */
export const uploadMovilidadResource = async (formData: FormData): Promise<MovilidadResource> => {
  return await fetchWithAuth<MovilidadResource>('/api/movilidad-internacional', {
    method: 'POST',
    body: formData,
  });
};

/**
 * Eliminar un recurso de Movilidad Internacional
 */
export const deleteMovilidadResource = async (id: number): Promise<{ message: string }> => {
  return await fetchWithAuth<{ message: string }>(`/api/movilidad-internacional/${id}`, {
    method: 'DELETE',
  });
};
