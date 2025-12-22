import { fetchWithAuth } from './apiService';

export interface Noticia {
  id?: number;
  titulo: string;
  resumen?: string;
  contenido?: string;
  imagen?: string; // filename on uploads or full URL
  activo?: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export const noticiaService = {
  getActive: async (): Promise<Noticia | null> => {
    // Use the shared fetchWithAuth so headers and tokens are handled
    const response = await fetchWithAuth<{ success: boolean; data: Noticia[] }>('/api/noticias')
      .catch(() => ({ success: false, data: [] } as { success: boolean; data: Noticia[] }));

    const data = response.data || [];
    return data.length ? data[0] : null;
  },
  getAll: async (): Promise<Noticia[]> => {
    const response = await fetchWithAuth<{ success: boolean; data: Noticia[] }>('/api/noticias');
    return response.data || [];
  }
};
