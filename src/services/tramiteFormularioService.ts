import { fetchWithAuth } from './apiService';

// Interfaces
export interface InfoPrincipal {
  id?: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  tiempoEntrega: string;
  costo: string;
}

export interface Requisito {
  id?: string;
  index?: number;
  texto: string;
}

export interface Paso {
  id?: string;
  index?: number;
  texto: string;
}

export interface Documento {
  id?: string;
  index?: number;
  texto: string;
}

// Base URL
const BASE_URL = '/api/formularios-config';

// ==================== INFO PRINCIPAL ====================

export const getInfoPrincipal = async (tipo: string): Promise<InfoPrincipal | null> => {
  try {
    const response = await fetchWithAuth<InfoPrincipal>(`${BASE_URL}/${tipo}/info`, {
      method: 'GET',
    });
    return response;
  } catch {
    return null;
  }
};

export const createInfoPrincipal = async (tipo: string, data: InfoPrincipal): Promise<InfoPrincipal> => {
  return fetchWithAuth<InfoPrincipal>(`${BASE_URL}/${tipo}/info`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateInfoPrincipal = async (tipo: string, data: InfoPrincipal): Promise<InfoPrincipal> => {
  return fetchWithAuth<InfoPrincipal>(`${BASE_URL}/${tipo}/info`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteInfoPrincipal = async (tipo: string): Promise<{ message: string }> => {
  return fetchWithAuth<{ message: string }>(`${BASE_URL}/${tipo}/info`, {
    method: 'DELETE',
  });
};

// ==================== REQUISITOS ====================

export const getRequisitos = async (tipo: string): Promise<Requisito[]> => {
  try {
    const response = await fetchWithAuth<unknown>(`${BASE_URL}/${tipo}/requisitos`, {
      method: 'GET',
    });
    
    // Extraer el array de items de diferentes formatos posibles
    let items: string[] = [];
    
    if (Array.isArray(response)) {
      items = response;
    } else if (response && typeof response === 'object') {
      const obj = response as Record<string, unknown>;
      if (Array.isArray(obj.requisitos)) {
        items = obj.requisitos;
      } else if (Array.isArray(obj.data)) {
        items = obj.data;
      } else if (Array.isArray(obj.items)) {
        items = obj.items;
      } else if (Array.isArray(obj.result)) {
        items = obj.result;
      }
    }
    
    return items.map((item, idx) => ({
      id: idx.toString(),
      index: idx,
      texto: typeof item === 'string' ? item : (item && typeof item === 'object' && 'item' in item ? String((item as {item: string}).item) : String(item)),
    }));
  } catch (error) {
    console.error('Error getting requisitos:', error);
    return [];
  }
};

// Interfaz para la respuesta del backend (usa 'item')
interface BackendItemResponse {
  item: string;
  index?: number;
}

export const createRequisito = async (tipo: string, data: { texto: string }): Promise<Requisito> => {
  const response = await fetchWithAuth<BackendItemResponse>(`${BASE_URL}/${tipo}/requisitos`, {
    method: 'POST',
    body: JSON.stringify({ item: data.texto }),
  });
  // Transformar respuesta del backend, usar el texto enviado como fallback
  return {
    id: (response?.index ?? Date.now()).toString(),
    index: response?.index,
    texto: response?.item ?? data.texto,
  };
};

export const updateRequisito = async (tipo: string, index: number, data: { texto: string }): Promise<Requisito> => {
  const response = await fetchWithAuth<BackendItemResponse>(`${BASE_URL}/${tipo}/requisitos/${index}`, {
    method: 'PUT',
    body: JSON.stringify({ item: data.texto }),
  });
  return {
    id: index.toString(),
    index: index,
    texto: response?.item ?? data.texto,
  };
};

export const deleteRequisito = async (tipo: string, index: number): Promise<{ message: string }> => {
  return fetchWithAuth<{ message: string }>(`${BASE_URL}/${tipo}/requisitos/${index}`, {
    method: 'DELETE',
  });
};

// ==================== PASOS ====================

export const getPasos = async (tipo: string): Promise<Paso[]> => {
  try {
    const response = await fetchWithAuth<unknown>(`${BASE_URL}/${tipo}/pasos`, {
      method: 'GET',
    });
    
    // Extraer el array de items de diferentes formatos posibles
    let items: string[] = [];
    
    if (Array.isArray(response)) {
      items = response;
    } else if (response && typeof response === 'object') {
      const obj = response as Record<string, unknown>;
      if (Array.isArray(obj.pasos)) {
        items = obj.pasos;
      } else if (Array.isArray(obj.data)) {
        items = obj.data;
      } else if (Array.isArray(obj.items)) {
        items = obj.items;
      } else if (Array.isArray(obj.result)) {
        items = obj.result;
      }
    }
    
    return items.map((item, idx) => ({
      id: idx.toString(),
      index: idx,
      texto: typeof item === 'string' ? item : (item && typeof item === 'object' && 'item' in item ? String((item as {item: string}).item) : String(item)),
    }));
  } catch (error) {
    console.error('Error getting pasos:', error);
    return [];
  }
};

export const createPaso = async (tipo: string, data: { texto: string }): Promise<Paso> => {
  const response = await fetchWithAuth<BackendItemResponse>(`${BASE_URL}/${tipo}/pasos`, {
    method: 'POST',
    body: JSON.stringify({ item: data.texto }),
  });
  return {
    id: (response?.index ?? Date.now()).toString(),
    index: response?.index,
    texto: response?.item ?? data.texto,
  };
};

export const updatePaso = async (tipo: string, index: number, data: { texto: string }): Promise<Paso> => {
  const response = await fetchWithAuth<BackendItemResponse>(`${BASE_URL}/${tipo}/pasos/${index}`, {
    method: 'PUT',
    body: JSON.stringify({ item: data.texto }),
  });
  return {
    id: index.toString(),
    index: index,
    texto: response?.item ?? data.texto,
  };
};

export const deletePaso = async (tipo: string, index: number): Promise<{ message: string }> => {
  return fetchWithAuth<{ message: string }>(`${BASE_URL}/${tipo}/pasos/${index}`, {
    method: 'DELETE',
  });
};

// ==================== DOCUMENTOS ====================

export const getDocumentos = async (tipo: string): Promise<Documento[]> => {
  try {
    const response = await fetchWithAuth<unknown>(`${BASE_URL}/${tipo}/documentos`, {
      method: 'GET',
    });
    
    // Extraer el array de items de diferentes formatos posibles
    let items: string[] = [];
    
    if (Array.isArray(response)) {
      items = response;
    } else if (response && typeof response === 'object') {
      const obj = response as Record<string, unknown>;
      if (Array.isArray(obj.documentos)) {
        items = obj.documentos;
      } else if (Array.isArray(obj.data)) {
        items = obj.data;
      } else if (Array.isArray(obj.items)) {
        items = obj.items;
      } else if (Array.isArray(obj.result)) {
        items = obj.result;
      }
    }
    
    return items.map((item, idx) => ({
      id: idx.toString(),
      index: idx,
      texto: typeof item === 'string' ? item : (item && typeof item === 'object' && 'item' in item ? String((item as {item: string}).item) : String(item)),
    }));
  } catch (error) {
    console.error('Error getting documentos:', error);
    return [];
  }
};

export const createDocumento = async (tipo: string, data: { texto: string }): Promise<Documento> => {
  const response = await fetchWithAuth<BackendItemResponse>(`${BASE_URL}/${tipo}/documentos`, {
    method: 'POST',
    body: JSON.stringify({ item: data.texto }),
  });
  return {
    id: (response?.index ?? Date.now()).toString(),
    index: response?.index,
    texto: response?.item ?? data.texto,
  };
};

export const updateDocumento = async (tipo: string, index: number, data: { texto: string }): Promise<Documento> => {
  const response = await fetchWithAuth<BackendItemResponse>(`${BASE_URL}/${tipo}/documentos/${index}`, {
    method: 'PUT',
    body: JSON.stringify({ item: data.texto }),
  });
  return {
    id: index.toString(),
    index: index,
    texto: response?.item ?? data.texto,
  };
};

export const deleteDocumento = async (tipo: string, index: number): Promise<{ message: string }> => {
  return fetchWithAuth<{ message: string }>(`${BASE_URL}/${tipo}/documentos/${index}`, {
    method: 'DELETE',
  });
};
