import { useState, useEffect } from 'react';
import { getToken } from '../services/authService';
import * as homeService from '../services/homeService';
import type { Noticia, CreateNoticiaRequest, UpdateNoticiaRequest } from '../types/home';

export const useNoticias = () => {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNoticias = async () => {
    try {
      setLoading(true);
      const data = await homeService.getNoticias();
      setNoticias(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar noticias');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNoticias();
  }, []);

  const createItem = async (data: CreateNoticiaRequest): Promise<boolean> => {
    try {
      const token = getToken();
      if (!token) throw new Error('No hay token de autenticación');
      
      await homeService.createNoticia(data, token);
      await fetchNoticias();
      return true;
    } catch (err) {
      console.error('Error al crear noticia:', err);
      setError('Error al crear noticia');
      return false;
    }
  };

  const updateItem = async (id: number, data: UpdateNoticiaRequest): Promise<boolean> => {
    try {
      const token = getToken();
      if (!token) throw new Error('No hay token de autenticación');
      
      await homeService.updateNoticia(id, data, token);
      await fetchNoticias();
      return true;
    } catch (err) {
      console.error('Error al actualizar noticia:', err);
      setError('Error al actualizar noticia');
      return false;
    }
  };

  const deleteItem = async (id: number): Promise<boolean> => {
    try {
      const token = getToken();
      if (!token) throw new Error('No hay token de autenticación');
      
      await homeService.deleteNoticia(id, token);
      await fetchNoticias();
      return true;
    } catch (err) {
      console.error('Error al eliminar noticia:', err);
      setError('Error al eliminar noticia');
      return false;
    }
  };

  return {
    noticias,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    refresh: fetchNoticias,
  };
};
