import { isTokenExpired, removeToken } from './authService';

const API_URL = import.meta.env.VITE_BACKENDURL || '';

/**
 * Realiza una petición HTTP con autenticación
 * @param endpoint - El endpoint de la API (ej: '/api/users')
 * @param options - Opciones de fetch (method, body, etc.)
 * @param redirectOn401 - Si debe redirigir automáticamente al login en caso de 401 (default: true)
 * @returns Promise con la respuesta parseada
 */
export const fetchWithAuth = async <T>(
  endpoint: string,
  options: RequestInit = {},
  redirectOn401: boolean = true
): Promise<T> => {
  // Verificar si el token está expirado antes de hacer la petición
  if (isTokenExpired()) {
    removeToken();
    // Redirigir al login
    window.location.href = '/signin';
    throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
  }

  try {
    // Preparar headers
    const headers: Record<string, string> = {};
    
    // Agregar Authorization header
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Agregar headers adicionales, pero no Content-Type si es FormData
    if (options.headers) {
      const additionalHeaders = options.headers as Record<string, string>;
      Object.assign(headers, additionalHeaders);
    }
    
    // Si el body es FormData, no incluir Content-Type
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    } else if (!headers['Content-Type']) {
      // Solo agregar Content-Type por defecto si no es FormData y no está ya establecido
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Si recibimos un 401, el token es inválido
    if (response.status === 401) {
      if (redirectOn401) {
        removeToken();
        window.location.href = '/signin';
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      } else {
        // Para operaciones que no deben redirigir automáticamente (como subida de imágenes),
        // devolver el error sin redirigir
        let errorMessage = 'Error de autenticación';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Si no se puede parsear el JSON, usar mensaje genérico
        }
        throw new Error(errorMessage);
      }
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
 * @param redirectOn401 - Si debe redirigir automáticamente al login en caso de 401 (default: true)
 * @returns Promise con la Response
 */
export const fetchWithAuthResponse = async (
  endpoint: string,
  options: RequestInit = {},
  redirectOn401: boolean = true
): Promise<Response> => {
  // Verificar si el token está expirado antes de hacer la petición
  if (isTokenExpired()) {
    removeToken();
    // Redirigir al login
    window.location.href = '/signin';
    throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
  }

  // Preparar headers
  const headers: Record<string, string> = {};
  
  // Agregar Authorization header
  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Agregar headers adicionales, pero no Content-Type si es FormData
  if (options.headers) {
    const additionalHeaders = options.headers as Record<string, string>;
    Object.assign(headers, additionalHeaders);
  }
  
  // Si el body es FormData, no incluir Content-Type
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  } else if (!headers['Content-Type']) {
    // Solo agregar Content-Type por defecto si no es FormData y no está ya establecido
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Si recibimos un 401, el token es inválido
    if (response.status === 401) {
      if (redirectOn401) {
        removeToken();
        window.location.href = '/signin';
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      } else {
        // Para operaciones que no deben redirigir automáticamente,
        // devolver el error sin redirigir
        throw new Error('Error de autenticación (401)');
      }
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error de conexión con el servidor');
  }
};
