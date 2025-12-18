import { useState, useEffect } from 'react';
import { getToken } from '../services/authService';
import * as homeService from '../services/homeService';
import type { HeroSlide, CreateHeroSlideRequest, UpdateHeroSlideRequest } from '../types/home';

export const useHeroSlides = () => {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [includeInactive, setIncludeInactive] = useState(false);

  const fetchHeroSlides = async (all?: boolean) => {
    try {
      setLoading(true);
      const data = await homeService.getHeroSlides(all ?? includeInactive);
      setHeroSlides(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar hero slides');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroSlides(includeInactive);
  }, [includeInactive]);

  const createItem = async (data: CreateHeroSlideRequest): Promise<boolean> => {
    try {
      const token = getToken();
      if (!token) throw new Error('No hay token de autenticación');
      
      await homeService.createHeroSlide(data, token);
      await fetchHeroSlides();
      return true;
    } catch (err) {
      console.error('Error al crear hero slide:', err);
      setError('Error al crear hero slide');
      return false;
    }
  };

  const updateItem = async (id: number, data: UpdateHeroSlideRequest): Promise<boolean> => {
    try {
      const token = getToken();
      if (!token) throw new Error('No hay token de autenticación');
      
      await homeService.updateHeroSlide(id, data, token);
      await fetchHeroSlides();
      return true;
    } catch (err) {
      console.error('Error al actualizar hero slide:', err);
      setError('Error al actualizar hero slide');
      return false;
    }
  };

  const deleteItem = async (id: number): Promise<boolean> => {
    try {
      const token = getToken();
      if (!token) throw new Error('No hay token de autenticación');
      
      await homeService.deleteHeroSlide(id, token);
      await fetchHeroSlides();
      return true;
    } catch (err) {
      console.error('Error al eliminar hero slide:', err);
      setError('Error al eliminar hero slide');
      return false;
    }
  };

  const reorderSlides = async (orderedSlides: HeroSlide[]): Promise<boolean> => {
    try {
      const token = getToken();
      if (!token) throw new Error('No hay token de autenticación');
      // Update each slide with new orden
      for (const slide of orderedSlides) {
        await homeService.updateHeroSlide(slide.id, { orden: slide.orden }, token);
      }
      await fetchHeroSlides();
      return true;
    } catch (err) {
      console.error('Error al reordenar hero slides:', err);
      setError('Error al reordenar');
      return false;
    }
  };

  return {
    heroSlides,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    refresh: fetchHeroSlides,
    includeInactive,
    setIncludeInactive,
    reorderSlides,
  };
};
