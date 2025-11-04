import { useState, useEffect } from 'react';
import { getToken } from '../services/authService';
import * as carreraService from '../services/carreraService';
import type { Carrera, CreateCarreraRequest, UpdateCarreraRequest } from '../types/carrera';

export const useCarreras = () => {
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCarreras = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error('No hay token de autenticación');
      
      const data = await carreraService.getAllCarreras(token);
      setCarreras(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar carreras');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarreras();
  }, []);

  const createItem = async (data: CreateCarreraRequest): Promise<boolean> => {
    try {
      const token = getToken();
      if (!token) throw new Error('No hay token de autenticación');
      
      await carreraService.createCarrera(data, token);
      await fetchCarreras();
      return true;
    } catch (err) {
      console.error('Error al crear carrera:', err);
      setError('Error al crear carrera');
      return false;
    }
  };

  const updateItem = async (id: number, data: UpdateCarreraRequest): Promise<boolean> => {
    try {
      const token = getToken();
      if (!token) throw new Error('No hay token de autenticación');
      
      await carreraService.updateCarrera(id, data, token);
      await fetchCarreras();
      return true;
    } catch (err) {
      console.error('Error al actualizar carrera:', err);
      setError('Error al actualizar carrera');
      return false;
    }
  };

  const deleteItem = async (id: number): Promise<boolean> => {
    try {
      const token = getToken();
      if (!token) throw new Error('No hay token de autenticación');
      
      await carreraService.deleteCarrera(id, token);
      await fetchCarreras();
      return true;
    } catch (err) {
      console.error('Error al eliminar carrera:', err);
      setError('Error al eliminar carrera');
      return false;
    }
  };

  // Filtros útiles
  const getCarrerasByNivel = (nivel: 'TSU' | 'Ingenieria' | 'Licenciatura') => {
    return carreras.filter(c => c.nivel === nivel);
  };

  return {
    carreras,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    refresh: fetchCarreras,
    getCarrerasByNivel,
  };
};
