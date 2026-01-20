// src/services/entidadService.ts
import { fetchWithAuth } from './apiService';

export interface EntidadResource {
  id: number;
  titulo: string;
  descripcion?: string;
  url: string;
  tipo: 'pdf' | 'image';
  fecha_subida: string;
  is_active: boolean;
  // añade aquí campos extra si tu API los devuelve (created_by, size, mime, etc.)
}

// Ajusta esta ruta si tu backend expone otro endpoint
const BASE_PATH = '/api/entidad-certificacion-evaluacion';

/**
 * Obtener todos los recursos relacionados con la Entidad de Certificación y Evaluación
 */
export const getEntidadResources = async (): Promise<EntidadResource[]> => {
  return fetchWithAuth<EntidadResource[]>(BASE_PATH);
};

/**
 * Subir un recurso (imagen o PDF). Recibe un FormData con 'archivo', 'titulo', 'descripcion?' y 'tipo'.
 */
export const uploadEntidadResource = async (formData: FormData): Promise<EntidadResource> => {
  return fetchWithAuth<EntidadResource>(BASE_PATH, {
    method: 'POST',
    body: formData,
  });
};

/**
 * Eliminar un recurso por id
 */
export const deleteEntidadResource = async (id: number): Promise<{ message: string }> => {
  return fetchWithAuth<{ message: string }>(`${BASE_PATH}/${id}`, {
    method: 'DELETE',
  });
};

/**
 * Actualizar metadatos de un recurso (opcional). Útil para editar título/descripcion o activar/desactivar.
 */
export const updateEntidadResource = async (
  id: number,
  data: Partial<Pick<EntidadResource, 'titulo' | 'descripcion' | 'is_active'>>
): Promise<EntidadResource> => {
  return fetchWithAuth<EntidadResource>(`${BASE_PATH}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};
