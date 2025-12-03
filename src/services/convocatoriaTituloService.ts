import { fetchWithAuth } from './apiService';

// ==================== TIPOS ====================

export interface MainInfoData {
  titulo: string;
  subtitulo: string;
  nombreSeccionDocumentos: string;
}

export interface MainInfoResponse {
  id: string;
  titulo: string;
  subtitulo: string;
  nombreSeccionDocumentos: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentoResponse {
  id: string;
  titulo: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentosListResponse {
  total: number;
  documentos: DocumentoResponse[];
}

// Endpoint base
const BASE_ENDPOINT = '/api/servicios-escolares/convocatoria-titulo';

// ==================== INFORMACIÓN PRINCIPAL ====================

/**
 * Obtiene la información principal de la convocatoria
 * Devuelve null si no existe (404) sin mostrar error
 */
export const getMainInfo = async (): Promise<MainInfoResponse | null> => {
  try {
    const token = localStorage.getItem('authToken');
    const API_URL = import.meta.env.VITE_BACKENDURL || '';
    
    const response = await fetch(`${API_URL}${BASE_ENDPOINT}/mainInfo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    // Si es 404, no hay datos - retornar null silenciosamente
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    return await response.json();
  } catch {
    return null;
  }
};

/**
 * Crea o actualiza la información principal
 */
export const createOrUpdateMainInfo = async (data: MainInfoData): Promise<MainInfoResponse> => {
  return fetchWithAuth<MainInfoResponse>(`${BASE_ENDPOINT}/mainInfo`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Elimina la información principal por ID
 */
export const deleteMainInfo = async (id: string): Promise<{ message: string }> => {
  return fetchWithAuth<{ message: string }>(`${BASE_ENDPOINT}/mainInfo/${id}`, {
    method: 'DELETE',
  });
};

// ==================== DOCUMENTOS ====================

/**
 * Obtiene todos los documentos
 * Devuelve array vacío si no hay documentos (404) sin mostrar error
 */
export const getDocumentos = async (): Promise<DocumentoResponse[]> => {
  try {
    const token = localStorage.getItem('authToken');
    const API_URL = import.meta.env.VITE_BACKENDURL || '';
    
    const response = await fetch(`${API_URL}${BASE_ENDPOINT}/documentos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    // Si es 404, no hay documentos - retornar array vacío silenciosamente
    if (response.status === 404) {
      return [];
    }

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data: DocumentosListResponse = await response.json();
    return data.documentos || [];
  } catch {
    return [];
  }
};

/**
 * Descarga un documento por ID
 * Abre el documento en una nueva pestaña del navegador
 */
export const downloadDocumento = async (id: string): Promise<void> => {
  const token = localStorage.getItem('authToken');
  const API_URL = import.meta.env.VITE_BACKENDURL || '';
  
  const response = await fetch(`${API_URL}${BASE_ENDPOINT}/documentos/${id}/download`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'No se pudo descargar el documento');
  }

  // Obtener el blob del PDF
  const blob = await response.blob();
  
  // Crear URL temporal para el blob
  const url = window.URL.createObjectURL(blob);
  
  // Abrir en nueva pestaña
  window.open(url, '_blank');
  
  // Limpiar la URL después de un tiempo
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 100);
};

/**
 * Sube un nuevo documento PDF
 * @param titulo - Título del documento
 * @param archivo - Archivo PDF
 */
export const createDocumento = async (titulo: string, archivo: File): Promise<DocumentoResponse> => {
  const formData = new FormData();
  formData.append('titulo', titulo);
  formData.append('attachment', archivo);

  // Para subir archivos, necesitamos usar fetch directamente sin Content-Type
  const token = localStorage.getItem('authToken');
  const API_URL = import.meta.env.VITE_BACKENDURL || '';
  
  const response = await fetch(`${API_URL}${BASE_ENDPOINT}/documentos`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'No se pudo subir el documento');
  }

  return response.json();
};

/**
 * Elimina un documento por ID
 */
export const deleteDocumento = async (id: string): Promise<{ message: string }> => {
  return fetchWithAuth<{ message: string }>(`${BASE_ENDPOINT}/documentos/${id}`, {
    method: 'DELETE',
  });
};

/**
 * Elimina todos los documentos
 */
export const deleteAllDocumentos = async (): Promise<{ message: string }> => {
  return fetchWithAuth<{ message: string }>(`${BASE_ENDPOINT}/documentos`, {
    method: 'DELETE',
  });
};
