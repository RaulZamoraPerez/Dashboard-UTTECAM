import { fetchWithAuth, fetchWithAuthResponse } from './apiService';

const API_URL = import.meta.env.VITE_BACKENDURL || '';

// Interfaces para Extension Universitaria - Documentos
export interface ExtensionDocument {
  id: number;
  category: string; // 'gaceta' | 'promocion'
  title: string;
  file_url: string;
  cover_url?: string | null;
  publication_date: string;
  created_at: string;
  mime_type?: string | null;
  media_type?: string | null;
}

export interface ExtensionDocumentUploadResponse {
  id: number;
  category: string;
  title: string;
  file_url: string;
  cover_url?: string | null;
  publication_date: string;
  created_at: string;
}

// Categorías fijas para Extension Universitaria
export interface ExtensionCategory {
  id: string;
  name: string;
  area_id: number; // Referencia a AREAS.EXTENSION_GACETAS o AREAS.EXTENSION_PROMOCION
}

// ============ CATEGORÍAS ============

/**
 * Obtener categorías de documentos de Extensión
 * (categorías fijas: gacetas y promocion institucional)
 */
export const obtenerCategorias = async (): Promise<ExtensionCategory[]> => {
  // Categorías hardcoded basadas en el sistema
  return Promise.resolve([
    { id: 'gaceta', name: 'Gacetas', area_id: 9 },
    { id: 'promocion', name: 'Promoción Institucional', area_id: 10 }
  ]);
};

/**
 * Crear nueva categoría (no aplicable en Extension, categorías son fijas)
 */
export const crearCategoria = async (
  _nombre: string,
  _areaId: number
): Promise<ExtensionCategory> => {
  throw new Error('Las categorías de Extensión Universitaria son fijas y no pueden crearse dinámicamente');
};

// ============ DOCUMENTOS ============

/**
 * Obtener todos los documentos de una categoría específica
 */
export const obtenerDocumentos = async (category: string): Promise<ExtensionDocument[]> => {
  return fetchWithAuth<ExtensionDocument[]>(`/api/extension-universitaria/documents/${category}`, {
    method: 'GET'
  });
};

/**
 * Obtener un documento específico por ID
 */
export const obtenerDocumento = async (_id: number): Promise<ExtensionDocument> => {
  // Not implemented in backend yet, would need separate endpoint
  throw new Error('Not implemented');
};

/**
 * Subir nuevo documento con archivo PDF y portada opcional
 */
export const subirArchivo = async (
  category: string,
  title: string,
  file: File,
  cover?: File | null,
  publicationDate?: string
): Promise<ExtensionDocumentUploadResponse> => {
  const formData = new FormData();
  formData.append('category', category);
  formData.append('title', title);
  formData.append('file', file); // PDF document
  
  if (cover) {
    formData.append('cover', cover); // Optional cover image
  }
  
  if (publicationDate) {
    formData.append('publication_date', publicationDate);
  } else {
    formData.append('publication_date', new Date().toISOString().split('T')[0]);
  }

  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/api/extension-universitaria/documents`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error al subir documento' }));
    throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Actualizar un documento existente
 * (Por ahora solo soporta eliminar y volver a crear)
 */
export const actualizarArchivo = async (
  _id: number,
  _category: string,
  _title: string,
  _file?: File | null,
  _cover?: File | null,
  _publicationDate?: string
): Promise<ExtensionDocument> => {
  throw new Error('Actualización directa no soportada. Elimina y vuelve a subir el documento.');
};

/**
 * Eliminar un documento
 */
export const eliminarArchivo = async (id: number): Promise<{ message: string }> => {
  return fetchWithAuth<{ message: string }>(`/api/extension-universitaria/documents/${id}`, {
    method: 'DELETE'
  });
};

/**
 * Descargar documento
 */
export const descargarArchivo = async (fileUrl: string): Promise<string> => {
  try {
    const response = await fetchWithAuthResponse(fileUrl);
    if (!response.ok) {
      throw new Error('Error al descargar el documento');
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error al descargar documento:', error);
    throw error;
  }
};

/**
 * Previsualizar documento (abrir en nueva pestaña)
 */
export const previsualizarArchivo = (fileUrl: string): void => {
  const fullUrl = `${API_URL}${fileUrl}`;
  window.open(fullUrl, '_blank');
};
