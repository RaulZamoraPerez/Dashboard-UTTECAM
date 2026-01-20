import { fetchWithAuth } from './apiService';

export interface PracticasEstadiasBanner {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  activo: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export const practicasEstadiasBannerService = {
  getAll: async (): Promise<PracticasEstadiasBanner[]> => {
    return await fetchWithAuth<PracticasEstadiasBanner[]>('/api/practicas-estadias-banner');
  },

  create: async (formData: FormData): Promise<PracticasEstadiasBanner> => {
    return await fetchWithAuth<PracticasEstadiasBanner>('/api/practicas-estadias-banner', {
      method: 'POST',
      body: formData,
    });
  },

  update: async (id: number, formData: FormData): Promise<PracticasEstadiasBanner> => {
    return await fetchWithAuth<PracticasEstadiasBanner>(`/api/practicas-estadias-banner/${id}`, {
      method: 'PUT',
      body: formData,
    });
  },

  delete: async (id: number): Promise<void> => {
    return await fetchWithAuth<void>(`/api/practicas-estadias-banner/${id}`, {
      method: 'DELETE',
    });
  }
};
