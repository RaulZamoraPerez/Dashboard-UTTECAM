import { fetchWithAuth } from './apiService';

export interface VideoInstitucional {
  id?: number;
  titulo: string;
  descripcion?: string;
  urlVideo: string;
  thumbnailUrl?: string;
  duracion?: number;
  activo: boolean;
  mostrarControles: boolean;
  autoplay: boolean;
  loop: boolean;
  volumen: number;
  createdAt?: string;
  updatedAt?: string;
}

export const videoInstitucionalApi = {
  // Obtener video institucional activo
  getActive: async (): Promise<VideoInstitucional> => {
    const response = await fetchWithAuth<{ success: boolean; data: VideoInstitucional }>(
      '/api/video-institucional/activo'
    );
    return response.data;
  },

  // Obtener todos los videos institucionales
  getAll: async (): Promise<VideoInstitucional[]> => {
    const response = await fetchWithAuth<{ success: boolean; data: VideoInstitucional[] }>(
      '/api/video-institucional'
    );
    return response.data;
  },

  // Crear nuevo video institucional
  create: async (videoData: Omit<VideoInstitucional, 'id' | 'createdAt' | 'updatedAt'>): Promise<VideoInstitucional> => {
    const response = await fetchWithAuth<{ success: boolean; data: VideoInstitucional }>(
      '/api/video-institucional',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoData),
      }
    );
    return response.data;
  },

  // Actualizar video institucional
  update: async (id: number, videoData: Partial<VideoInstitucional>): Promise<VideoInstitucional> => {
    const response = await fetchWithAuth<{ success: boolean; data: VideoInstitucional }>(
      `/api/video-institucional/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoData),
      }
    );
    return response.data;
  },

  // Eliminar video institucional
  delete: async (id: number): Promise<void> => {
    await fetchWithAuth(`/api/video-institucional/${id}`, {
      method: 'DELETE',
    });
  },
};