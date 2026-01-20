import { fetchWithAuth } from './apiService';

export interface VinculacionBannerDocumento {
  id: number;
  titulo: string;
  imagen: string;
  orden: number;
  activo: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export const vinculacionBannerService = {
  getAll: async (): Promise<VinculacionBannerDocumento[]> => {
    return await fetchWithAuth<VinculacionBannerDocumento[]>('/api/vinculacion-banner');
  },

  create: async (formData: FormData): Promise<VinculacionBannerDocumento> => {
    return await fetchWithAuth<VinculacionBannerDocumento>('/api/vinculacion-banner', {
      method: 'POST',
      body: formData,
    });
  },

  update: async (id: number, formData: FormData): Promise<VinculacionBannerDocumento> => {
    return await fetchWithAuth<VinculacionBannerDocumento>(`/api/vinculacion-banner/${id}`, {
      method: 'PUT',
      body: formData,
    });
  },

  delete: async (id: number): Promise<void> => {
    return await fetchWithAuth<void>(`/api/vinculacion-banner/${id}`, {
      method: 'DELETE',
    });
  }
};
