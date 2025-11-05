import { Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { ReactNode } from "react";

interface PublicRouteProps {
  children: ReactNode;
}

/**
 * Componente para rutas públicas (login, signup)
 * Redirige al dashboard si el usuario ya está autenticado
 */
export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-t-4 border-gray-200 rounded-full border-t-brand-500 animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
