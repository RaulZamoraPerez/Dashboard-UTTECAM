import { useState, useEffect } from 'react';
import { getToken } from '../services/authService';
import * as homeService from '../services/homeService';
import type { Evento, CreateEventoRequest, UpdateEventoRequest } from '../types/home';

export const useEventos = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventoActivo, setEventoActivo] = useState<Evento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventos = async () => {
    try {
      setLoading(true);
      const data = await homeService.getEventos();
      setEventos(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar eventos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventoActivo = async () => {
    try {
      const data = await homeService.getEventoActivo();
      setEventoActivo(data);
    } catch (err) {
      console.error('Error al cargar evento activo:', err);
    }
  };

  useEffect(() => {
    fetchEventos();
    fetchEventoActivo();
  }, []);

  const createItem = async (data: CreateEventoRequest): Promise<boolean> => {
    try {
      const token = getToken();
      if (!token) throw new Error('No hay token de autenticación');
      
      await homeService.createEvento(data, token);
      await fetchEventos();
      await fetchEventoActivo();
      return true;
    } catch (err) {
      console.error('Error al crear evento:', err);
      setError('Error al crear evento');
      return false;
    }
  };

  const updateItem = async (id: number, data: UpdateEventoRequest): Promise<boolean> => {
    try {
      const token = getToken();
      if (!token) throw new Error('No hay token de autenticación');
      
      await homeService.updateEvento(id, data, token);
      await fetchEventos();
      await fetchEventoActivo();
      return true;
    } catch (err) {
      console.error('Error al actualizar evento:', err);
      setError('Error al actualizar evento');
      return false;
    }
  };

  const deleteItem = async (id: number): Promise<boolean> => {
    try {
      const token = getToken();
      if (!token) throw new Error('No hay token de autenticación');
      
      await homeService.deleteEvento(id, token);
      await fetchEventos();
      await fetchEventoActivo();
      return true;
    } catch (err) {
      console.error('Error al eliminar evento:', err);
      setError('Error al eliminar evento');
      return false;
    }
  };

  return {
    eventos,
    eventoActivo,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    refresh: fetchEventos,
    refreshActivo: fetchEventoActivo,
  };
};
