import { fetchWithAuth } from './apiService';

// ==================== TIPOS ====================

export interface PersonalCarrera {
  id: string;
  nombre: string;
  correo: string;
  carreras: string[];
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePersonalCarreraData {
  nombre: string;
  correo: string;
  carreras: string[];
  activo?: boolean;
}

export interface UpdatePersonalCarreraData {
  nombre?: string;
  correo?: string;
  carreras?: string[];
  activo?: boolean;
}

// Endpoint base
const BASE_ENDPOINT = '/api/personal-carreras';

// ==================== CRUD OPERATIONS ====================

/**
 * Obtiene todo el personal de carreras
 */
export const getPersonalCarreras = async (): Promise<PersonalCarrera[]> => {
  try {
    const token = localStorage.getItem('authToken');
    const API_URL = import.meta.env.VITE_BACKENDURL || '';
    
    const response = await fetch(`${API_URL}${BASE_ENDPOINT}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    // Si es 404, no hay personal - retornar array vacío silenciosamente
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
 * Obtiene un personal por ID
 */
export const getPersonalCarreraById = async (id: string): Promise<PersonalCarrera | null> => {
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
 * Crea un nuevo personal de carrera
 */
export const createPersonalCarrera = async (data: CreatePersonalCarreraData): Promise<PersonalCarrera> => {
  return fetchWithAuth<PersonalCarrera>(BASE_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Actualiza un personal de carrera
 */
export const updatePersonalCarrera = async (
  id: string,
  data: UpdatePersonalCarreraData
): Promise<PersonalCarrera> => {
  return fetchWithAuth<PersonalCarrera>(`${BASE_ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * Elimina un personal de carrera
 */
export const deletePersonalCarrera = async (id: string): Promise<{ message: string }> => {
  return fetchWithAuth<{ message: string }>(`${BASE_ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
};
