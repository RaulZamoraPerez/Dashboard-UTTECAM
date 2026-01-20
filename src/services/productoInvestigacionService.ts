import { fetchWithAuth } from './apiService';

export interface ProductoInvestigacion {
  id: number;
  titulo: string;
  pdf: string;
  carpeta: string;
  orden: number;
  activo: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export const productoInvestigacionService = {
  getAll: async (): Promise<ProductoInvestigacion[]> => {
    return await fetchWithAuth<ProductoInvestigacion[]>('/api/productos-investigacion');
  },

  create: async (formData: FormData): Promise<ProductoInvestigacion> => {
    return await fetchWithAuth<ProductoInvestigacion>('/api/productos-investigacion', {
      method: 'POST',
      body: formData,
    });
  },

  update: async (id: number, formData: FormData): Promise<ProductoInvestigacion> => {
    return await fetchWithAuth<ProductoInvestigacion>(`/api/productos-investigacion/${id}`, {
      method: 'PUT',
      body: formData,
    });
  },

  delete: async (id: number): Promise<void> => {
    return await fetchWithAuth<void>(`/api/productos-investigacion/${id}`, {
      method: 'DELETE',
    });
  }
};
