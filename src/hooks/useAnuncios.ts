import { useState, useEffect } from 'react';
import { getToken } from '../services/authService';
import * as homeService from '../services/homeService';
import type { Anuncio, CreateAnuncioRequest, UpdateAnuncioRequest } from '../types/home';

export const useAnuncios = () => {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [anuncioActivo, setAnuncioActivo] = useState<Anuncio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnuncios = async () => {
    try {
      setLoading(true);
      const data = await homeService.getAnuncios();
      setAnuncios(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar anuncios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnuncioActivo = async () => {
    try {
      const data = await homeService.getAnuncioActivo();
      setAnuncioActivo(data);
    } catch (err) {
      console.error('Error al cargar anuncio activo:', err);
    }
  };

  useEffect(() => {
    fetchAnuncios();
    fetchAnuncioActivo();
  }, []);

  const createItem = async (data: CreateAnuncioRequest): Promise<boolean> => {
    try {
      const token = getToken();
      if (!token) throw new Error('No hay token de autenticación');
      
      await homeService.createAnuncio(data, token);
      await fetchAnuncios();
      await fetchAnuncioActivo();
      return true;
    } catch (err) {
      console.error('Error al crear anuncio:', err);
      setError('Error al crear anuncio');
      return false;
    }
  };

  const updateItem = async (id: number, data: UpdateAnuncioRequest): Promise<boolean> => {
    try {
      const token = getToken();
      if (!token) throw new Error('No hay token de autenticación');
      
      await homeService.updateAnuncio(id, data, token);
      await fetchAnuncios();
      await fetchAnuncioActivo();
      return true;
    } catch (err) {
      console.error('Error al actualizar anuncio:', err);
      setError('Error al actualizar anuncio');
      return false;
    }
  };

  const deleteItem = async (id: number): Promise<boolean> => {
    try {
      const token = getToken();
      if (!token) throw new Error('No hay token de autenticación');
      
      await homeService.deleteAnuncio(id, token);
      await fetchAnuncios();
      await fetchAnuncioActivo();
      return true;
    } catch (err) {
      console.error('Error al eliminar anuncio:', err);
      setError('Error al eliminar anuncio');
      return false;
    }
  };

  return {
    anuncios,
    anuncioActivo,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    refresh: fetchAnuncios,
    refreshActivo: fetchAnuncioActivo,
  };
};
