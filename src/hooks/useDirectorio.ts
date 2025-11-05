// hooks/useDirectorio.ts
import { useState, useEffect, useCallback } from 'react';
import { Directorio, CreateDirectorioRequest } from '../types/directorio';
import {
  getAllDirectorios,
  createDirectorio,
  updateDirectorio,
  deleteDirectorio
} from '../services/directorioService';

interface UseDirectorioReturn {
  directorios: Directorio[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createItem: (data: CreateDirectorioRequest, imagen?: File) => Promise<boolean>;
  updateItem: (id: number, data: CreateDirectorioRequest, imagen?: File) => Promise<boolean>;
  deleteItem: (id: number) => Promise<boolean>;
}

export const useDirectorio = (): UseDirectorioReturn => {
  const [directorios, setDirectorios] = useState<Directorio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDirectorios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllDirectorios();
      setDirectorios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los directorios');
      console.error('Error fetching directorios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(async (
    data: CreateDirectorioRequest,
    imagen?: File
  ): Promise<boolean> => {
    try {
      setError(null);
      await createDirectorio(data, imagen);
      await fetchDirectorios();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el directorio';
      setError(errorMessage);
      console.error('Error creating directorio:', err);
      return false;
    }
  }, [fetchDirectorios]);

  const updateItem = useCallback(async (
    id: number,
    data: CreateDirectorioRequest,
    imagen?: File
  ): Promise<boolean> => {
    try {
      setError(null);
      await updateDirectorio(id, data, imagen);
      await fetchDirectorios();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el directorio';
      setError(errorMessage);
      console.error('Error updating directorio:', err);
      return false;
    }
  }, [fetchDirectorios]);

  const deleteItem = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await deleteDirectorio(id);
      await fetchDirectorios();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar el directorio';
      setError(errorMessage);
      console.error('Error deleting directorio:', err);
      return false;
    }
  }, [fetchDirectorios]);

  useEffect(() => {
    fetchDirectorios();
  }, [fetchDirectorios]);

  return {
    directorios,
    loading,
    error,
    refetch: fetchDirectorios,
    createItem,
    updateItem,
    deleteItem,
  };
};
