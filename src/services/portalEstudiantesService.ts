// services/portalEstudiantesService.ts
import { fetchWithAuth } from './apiService';

const API_BASE = '/api/portal-estudiantes';

export interface PortalEstudiantesConfig {
  id?: number;
  titulo: string;
  subtitulo: string;
  badgeTexto: string;
  parrafo1: string;
  parrafo2: string;
  parrafo3: string;
  imagenUrl: string;
  enlaceBoton: string;
  textoBoton: string;
  activo?: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

/**
 * Convierte una ruta relativa de imagen a URL absoluta
 */
export const getImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return '';

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  if (imagePath.startsWith('/uploads/')) {
    return imagePath;
  }

  // Si es solo el nombre del archivo, construir la ruta completa
  return `/uploads/nosotros/${imagePath}`;
};

/**
 * Obtiene la configuración del portal estudiantes
 */
export const getPortalConfig = async (): Promise<PortalEstudiantesConfig> => {
  const response = await fetch(`${API_BASE}`);
  if (!response.ok) {
    throw new Error('Error al obtener configuración del portal');
  }
  return response.json();
};

/**
 * Actualiza la configuración del portal estudiantes
 */
export const updatePortalConfig = async (config: Partial<PortalEstudiantesConfig>): Promise<{ message: string; config: PortalEstudiantesConfig }> => {
  return fetchWithAuth(`${API_BASE}`, {
    method: 'PUT',
    body: JSON.stringify(config),
  });
};

/**
 * Sube una imagen para el portal estudiantes
 */
export const uploadPortalImage = async (file: File): Promise<{ imagenUrl: string; message: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  return fetchWithAuth<{ imagenUrl: string; message: string }>(`${API_BASE}/upload-image`, {
    method: 'POST',
    body: formData,
  }, false); // false = no redirigir automáticamente en caso de 401
};

/**
 * Elimina una imagen del portal estudiantes
 */
export const deletePortalImage = async (filename: string): Promise<{ message: string }> => {
  return fetchWithAuth(`${API_BASE}/image/${filename}`, {
    method: 'DELETE',
  });
};
