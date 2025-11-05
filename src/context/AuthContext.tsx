import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { LoginCredentials, LoginResponse, UserProfile } from '../services/authService';
import { 
  login as loginService, 
  saveToken, 
  removeToken, 
  getToken,
  isAuthenticated as checkAuth,
  verifyToken,
  isTokenExpired
} from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: UserProfile | null;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => void;
  isLoading: boolean;
  checkTokenValidity: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un token guardado al cargar la aplicación
    const initAuth = async () => {
      console.log('AuthContext - Iniciando verificación de autenticación');
      const savedToken = getToken();
      console.log('AuthContext - Token guardado:', savedToken ? 'Sí' : 'No');
      
      if (savedToken) {
        // Verificar si el token está expirado (verificación local)
        if (isTokenExpired()) {
          console.log('AuthContext - Token expirado');
          removeToken();
          setToken(null);
          setUser(null);
        } else {
          console.log('AuthContext - Token válido, verificando con servidor');
          setToken(savedToken);
          // Verificar el token con el servidor
          const userData = await verifyToken();
          console.log('AuthContext - Datos de usuario del servidor:', userData);
          if (userData) {
            setUser(userData);
          } else {
            // Token inválido, limpiar
            console.log('AuthContext - Token inválido, limpiando');
            setToken(null);
          }
        }
      } else {
        console.log('AuthContext - No hay token guardado');
      }
      setIsLoading(false);
      console.log('AuthContext - Verificación completada');
    };

    initAuth();

    // Verificar el token periódicamente (cada 5 minutos)
    const interval = setInterval(async () => {
      if (getToken()) {
        const userData = await verifyToken();
        if (!userData) {
          // Token expirado o inválido, hacer logout
          logout();
        } else {
          setUser(userData);
        }
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await loginService(credentials);
    saveToken(response.token);
    setToken(response.token);
    
    // Obtener datos del usuario después del login
    const userData = await verifyToken();
    if (userData) {
      setUser(userData);
    }
    
    return response;
  };

  const logout = () => {
    removeToken();
    setToken(null);
    setUser(null);
  };

  const checkTokenValidity = async (): Promise<boolean> => {
    // Primero verificar localmente
    if (isTokenExpired()) {
      logout();
      return false;
    }

    // Luego verificar con el servidor
    const userData = await verifyToken();
    if (!userData) {
      logout();
      return false;
    }

    setUser(userData);
    return true;
  };

  const value = {
    isAuthenticated: checkAuth() && !isTokenExpired(),
    token,
    user,
    login,
    logout,
    isLoading,
    checkTokenValidity,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
