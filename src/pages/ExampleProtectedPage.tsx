import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

// Ejemplo de interfaz para datos del backend
interface Usuario {
  id: number;
  username: string;
  email: string;
}

/**
 * Ejemplo de componente que usa autenticación JWT
 * para obtener y mostrar datos protegidos del backend
 */
export default function ExampleProtectedPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout } = useAuth();

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Ejemplo de petición GET con autenticación
      const data = await fetchWithAuth<Usuario[]>('/api/usuarios', {
        method: 'GET'
      });
      
      setUsuarios(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos';
      setError(errorMessage);
      
      // Si el token expiró o es inválido (error 401)
      if (errorMessage.includes('401')) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const crearUsuario = async (username: string, email: string) => {
    try {
      // Ejemplo de petición POST con autenticación
      await fetchWithAuth('/api/usuarios', {
        method: 'POST',
        body: JSON.stringify({ username, email })
      });
      
      // Recargar la lista después de crear
      cargarUsuarios();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear usuario';
      setError(errorMessage);
    }
  };

  const actualizarUsuario = async (id: number, username: string, email: string) => {
    try {
      // Ejemplo de petición PUT con autenticación
      await fetchWithAuth(`/api/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ username, email })
      });
      
      // Recargar la lista después de actualizar
      cargarUsuarios();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar usuario';
      setError(errorMessage);
    }
  };

  const eliminarUsuario = async (id: number) => {
    try {
      // Ejemplo de petición DELETE con autenticación
      await fetchWithAuth(`/api/usuarios/${id}`, {
        method: 'DELETE'
      });
      
      // Recargar la lista después de eliminar
      cargarUsuarios();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar usuario';
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-t-4 border-gray-200 rounded-full border-t-brand-500 animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
        Ejemplo de Página Protegida con JWT
      </h1>

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-200">
          Lista de Usuarios
        </h2>
        
        {usuarios.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No hay usuarios</p>
        ) : (
          <ul className="space-y-2">
            {usuarios.map(usuario => (
              <li 
                key={usuario.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded dark:border-gray-700"
              >
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {usuario.username}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {usuario.email}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => actualizarUsuario(usuario.id, usuario.username, usuario.email)}
                    className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarUsuario(usuario.id)}
                    className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={() => crearUsuario('nuevo_usuario', 'nuevo@email.com')}
          className="px-4 py-2 mt-4 text-white rounded bg-brand-500 hover:bg-brand-600"
        >
          Crear Usuario de Prueba
        </button>
      </div>

      <div className="p-6 mt-6 bg-gray-100 rounded-lg dark:bg-gray-900">
        <h3 className="mb-2 font-semibold text-gray-700 dark:text-gray-200">
          💡 Cómo funciona este ejemplo
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>✅ Todas las peticiones incluyen automáticamente el token JWT</li>
          <li>✅ Si el token es inválido (401), se hace logout automático</li>
          <li>✅ Usa <code className="px-1 py-0.5 bg-gray-200 rounded dark:bg-gray-800">fetchWithAuth</code> en lugar de fetch</li>
          <li>✅ Manejo de errores integrado</li>
          <li>✅ Estados de carga implementados</li>
        </ul>
      </div>
    </div>
  );
}
