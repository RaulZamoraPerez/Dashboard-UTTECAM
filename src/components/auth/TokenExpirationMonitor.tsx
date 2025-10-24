import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getToken, verifyToken } from '../../services/authService';

/**
 * Componente que monitorea la expiración del token JWT
 * - Verifica el token con el servidor cada 2 minutos
 * - Verifica localmente cada 30 segundos
 * - Muestra una alerta cuando el token está por expirar
 * - Cierra sesión automáticamente si el token es inválido
 */
export default function TokenExpirationMonitor() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const { logout, checkTokenValidity } = useAuth();
  const lastServerCheck = useRef<number>(0);

  useEffect(() => {
    /**
     * Verifica el token con el servidor llamando a GET /api/auth/profile
     * Si responde 401, el token expiró y cierra sesión inmediatamente
     */
    const checkWithServer = async () => {
      const token = getToken();
      
      if (!token) {
        console.log('No se encontró token, cerrando sesión...');
        logout();
        return;
      }

      try {
        const userData = await verifyToken();
        
        if (!userData) {
          // Token inválido o expirado (401 del servidor)
          console.log('Token inválido o expirado detectado por el servidor, cerrando sesión...');
          logout();
          return;
        }
        
        // Token válido, actualizar timestamp de última verificación
        lastServerCheck.current = Date.now();
      } catch (error) {
        console.error('Error al verificar token con el servidor:', error);
        // En caso de error de red, no cerramos sesión inmediatamente
        // pero marcamos para intentar de nuevo en la siguiente verificación
      }
    };

    /**
     * Verifica el token localmente decodificando el JWT
     * Esta verificación es más rápida y se ejecuta con mayor frecuencia
     */
    const checkLocalExpiration = () => {
      const token = getToken();
      
      if (!token) {
        console.log('No se encontró token válido, cerrando sesión...');
        logout();
        return;
      }

      try {
        // Decodificar el JWT
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );

        const payload = JSON.parse(jsonPayload);
        
        if (payload.exp) {
          const currentTime = Date.now() / 1000;
          const timeLeft = payload.exp - currentTime;
          
          setTimeRemaining(Math.floor(timeLeft));

          // Mostrar advertencia si quedan menos de 5 minutos (300 segundos)
          if (timeLeft > 0 && timeLeft < 300) {
            setShowWarning(true);
          } else if (timeLeft <= 0) {
            // Token expirado localmente
            console.log('Token expirado detectado localmente, cerrando sesión...');
            setShowWarning(false);
            logout();
          } else {
            setShowWarning(false);
          }

          // Verificar con el servidor cada 2 minutos (120000 ms)
          const timeSinceLastCheck = Date.now() - lastServerCheck.current;
          if (timeSinceLastCheck >= 120000) {
            checkWithServer();
          }
        }
      } catch (error) {
        console.error('Error al verificar expiración del token:', error);
        // Si hay error al decodificar el token, probablemente esté corrupto
        console.log('Token corrupto detectado, cerrando sesión...');
        logout();
      }
    };

    // Verificación inicial con el servidor
    checkWithServer();
    
    // Verificar localmente cada 30 segundos
    checkLocalExpiration();
    const interval = setInterval(checkLocalExpiration, 30000);

    return () => clearInterval(interval);
  }, [logout]);

  const handleExtendSession = async () => {
    const isValid = await checkTokenValidity();
    if (!isValid) {
      logout();
    } else {
      setShowWarning(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!showWarning) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg shadow-lg dark:bg-yellow-900/20 dark:border-yellow-500">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-yellow-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Tu sesión está por expirar
            </h3>
            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
              Tiempo restante: <strong>{formatTime(timeRemaining)}</strong>
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleExtendSession}
                className="px-3 py-1.5 text-xs font-medium text-white bg-yellow-600 rounded hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                Continuar sesión
              </button>
              <button
                onClick={() => setShowWarning(false)}
                className="px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-100 rounded hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 dark:hover:bg-yellow-900/70 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                Cerrar
              </button>
            </div>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={() => setShowWarning(false)}
              className="inline-flex text-yellow-400 hover:text-yellow-600 focus:outline-none"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
