import { fetchWithAuth } from './apiService';

// ==================== TIPOS ====================

export type TipoCarrera = 'TSU' | 'INGENIERIA' | 'LICENCIATURA' | 'MAESTRIA' | 'DOCTORADO' | 'OTRO';

export interface CarreraSimple {
  id: string;
  nombre: string;
  tipo: TipoCarrera;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCarreraSimpleData {
  nombre: string;
  tipo: TipoCarrera;
  activo?: boolean;
}

export interface UpdateCarreraSimpleData {
  nombre?: string;
  tipo?: TipoCarrera;
  activo?: boolean;
}

export interface CarrerasAgrupadas {
  [tipo: string]: Array<{
    id: string;
    nombre: string;
    activo: boolean;
  }>;
}

// Endpoint base
const BASE_ENDPOINT = '/api/carreras-simples';

// ==================== CRUD OPERATIONS ====================

/**
 * Obtiene todas las carreras simples
 * @param activas - Filtrar solo carreras activas (opcional)
 */
export const getCarrerasSimples = async (activas?: boolean): Promise<CarreraSimple[]> => {
  try {
    const token = localStorage.getItem('authToken');
    const API_URL = import.meta.env.VITE_BACKENDURL || '';
    
    const url = activas !== undefined 
      ? `${API_URL}${BASE_ENDPOINT}?activas=${activas}`
      : `${API_URL}${BASE_ENDPOINT}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (response.status === 404) {
      return [];
    }

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();
    return data || [];
  } catch {
    return [];
  }
};

/**
 * Obtiene carreras agrupadas por tipo
 * @param activas - Filtrar solo carreras activas (opcional)
 */
export const getCarrerasAgrupadas = async (activas?: boolean): Promise<CarrerasAgrupadas> => {
  try {
    const token = localStorage.getItem('authToken');
    const API_URL = import.meta.env.VITE_BACKENDURL || '';
    
    const url = activas !== undefined 
      ? `${API_URL}${BASE_ENDPOINT}/grouped?activas=${activas}`
      : `${API_URL}${BASE_ENDPOINT}/grouped`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (response.status === 404) {
      return {};
    }

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();
    return data || {};
  } catch {
    return {};
  }
};

/**
 * Obtiene solo los nombres de las carreras
 * @param activas - Filtrar solo carreras activas (default: true)
 */
export const getNombresCarreras = async (activas: boolean = true): Promise<string[]> => {
  try {
    const token = localStorage.getItem('authToken');
    const API_URL = import.meta.env.VITE_BACKENDURL || '';
    
    const response = await fetch(`${API_URL}${BASE_ENDPOINT}/nombres?activas=${activas}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (response.status === 404) {
      return [];
    }

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();
    return data || [];
  } catch {
    return [];
  }
};

/**
 * Obtiene una carrera por ID
 */
export const getCarreraSimpleById = async (id: string): Promise<CarreraSimple | null> => {
  try {
    const token = localStorage.getItem('authToken');
    const API_URL = import.meta.env.VITE_BACKENDURL || '';
    
    const response = await fetch(`${API_URL}${BASE_ENDPOINT}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

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
 * Crea una nueva carrera
 */
export const createCarreraSimple = async (data: CreateCarreraSimpleData): Promise<CarreraSimple> => {
  return fetchWithAuth<CarreraSimple>(BASE_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Actualiza una carrera
 */
export const updateCarreraSimple = async (
  id: string,
  data: UpdateCarreraSimpleData
): Promise<CarreraSimple> => {
  return fetchWithAuth<CarreraSimple>(`${BASE_ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * Elimina una carrera
 */
export const deleteCarreraSimple = async (id: string): Promise<{ message: string }> => {
  return fetchWithAuth<{ message: string }>(`${BASE_ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
};
