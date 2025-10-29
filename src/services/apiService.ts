import { getAuthHeaders, isTokenExpired, removeToken } from './authService';

const API_URL = import.meta.env.VITE_BACKENDURL || 'http://localhost:3002';

/**
 * Realiza una petición HTTP con autenticación
 * @param endpoint - El endpoint de la API (ej: '/api/users')
 * @param options - Opciones de fetch (method, body, etc.)
 * @returns Promise con la respuesta parseada
 */
export const fetchWithAuth = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  // Verificar si el token está expirado antes de hacer la petición
  if (isTokenExpired()) {
    removeToken();
    // Redirigir al login
    window.location.href = '/signin';
    throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    // Si recibimos un 401, el token es inválido
    if (response.status === 401) {
      removeToken();
      window.location.href = '/signin';
      throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error en la petición' }));
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error de conexión con el servidor');
  }
};

/**
 * Realiza una petición HTTP con autenticación y retorna la Response (para downloads)
 * @param endpoint - El endpoint de la API
 * @param options - Opciones de fetch
 * @returns Promise con la Response
 */
export const fetchWithAuthResponse = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  // Verificar si el token está expirado antes de hacer la petición
  if (isTokenExpired()) {
    removeToken();
    // Redirigir al login
    window.location.href = '/signin';
    throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    // Si recibimos un 401, el token es inválido
    if (response.status === 401) {
      removeToken();
      window.location.href = '/signin';
      throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error de conexión con el servidor');
  }
};
