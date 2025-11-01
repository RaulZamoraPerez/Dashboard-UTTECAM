// hooks/useCalendario.ts
import { useState, useEffect, useCallback } from 'react';
import { Calendario, CreateCalendarioRequest } from '../types/calendario';
import {
  getAllCalendarios,
  createCalendario,
  updateCalendario,
  deleteCalendario
} from '../services/calendarioService';

interface UseCalendarioReturn {
  calendarios: Calendario[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createItem: (data: CreateCalendarioRequest) => Promise<boolean>;
  updateItem: (id: number, data: Partial<CreateCalendarioRequest>) => Promise<boolean>;
  deleteItem: (id: number) => Promise<boolean>;
}

export const useCalendario = (): UseCalendarioReturn => {
  const [calendarios, setCalendarios] = useState<Calendario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCalendarios();
      setCalendarios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los calendarios');
      console.error('Error fetching calendarios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(async (
    data: CreateCalendarioRequest
  ): Promise<boolean> => {
    try {
      setError(null);
      await createCalendario(data);
      await fetchCalendarios();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el calendario';
      setError(errorMessage);
      console.error('Error creating calendario:', err);
      return false;
    }
  }, [fetchCalendarios]);

  const updateItem = useCallback(async (
    id: number,
    data: Partial<CreateCalendarioRequest>
  ): Promise<boolean> => {
    try {
      setError(null);
      await updateCalendario(id, data);
      await fetchCalendarios();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el calendario';
      setError(errorMessage);
      console.error('Error updating calendario:', err);
      return false;
    }
  }, [fetchCalendarios]);

  const deleteItem = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await deleteCalendario(id);
      await fetchCalendarios();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar el calendario';
      setError(errorMessage);
      console.error('Error deleting calendario:', err);
      return false;
    }
  }, [fetchCalendarios]);

  useEffect(() => {
    fetchCalendarios();
  }, [fetchCalendarios]);

  return {
    calendarios,
    loading,
    error,
    refetch: fetchCalendarios,
    createItem,
    updateItem,
    deleteItem,
  };
};