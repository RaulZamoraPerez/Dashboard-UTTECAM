const API_URL = import.meta.env.VITE_BACKENDURL || '';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
}

export interface ApiError {
  message: string;
  error?: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email?: string;
  role?: string;
}

/**
 * Realiza el login del usuario y obtiene el token JWT
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al iniciar sesión');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error de conexión con el servidor');
  }
};

/**
 * Guarda el token en localStorage
 */
export const saveToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

/**
 * Obtiene el token de localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Elimina el token de localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem('authToken');
};

/**
 * Verifica si el usuario está autenticado
 */
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

/**
 * Obtiene los headers de autorización con el token
 */
export const getAuthHeaders = (): any => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Verifica si el token es válido consultando el perfil del usuario
 * @returns UserProfile si el token es válido, null si es inválido o expirado
 */
export const verifyToken = async (): Promise<UserProfile | null> => {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Token inválido o expirado
      if (response.status === 401) {
        removeToken();
        return null;
      }
      throw new Error('Error al verificar token');
    }

    const userData = await response.json();
    return userData;
  } catch (error) {
    // En caso de error, eliminamos el token por seguridad
    removeToken();
    return null;
  }
};

/**
 * Verifica si el token está expirado sin hacer una petición al servidor
 * @returns true si el token está expirado, false si aún es válido
 */
export const isTokenExpired = (): boolean => {
  const token = getToken();

  if (!token) {
    return true;
  }

  try {
    // Decodificar el JWT (solo la parte del payload)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);

    // El payload debe tener un campo 'exp' con el timestamp de expiración
    if (!payload.exp) {
      return false; // Si no tiene expiración, asumimos que es válido
    }

    // Verificar si el token ha expirado (exp está en segundos, Date.now() en milisegundos)
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    // Si hay error al decodificar, consideramos el token como inválido
    return true;
  }
};
