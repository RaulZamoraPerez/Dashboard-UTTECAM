import { fetchWithAuth } from './apiService';

export interface RelojDigital {
  id?: number;
  zonaHoraria: string;
  formato24Horas: boolean;
  mostrarFecha: boolean;
  mostrarDiaSemana: boolean;
  activo: boolean;
  estilo: 'digital' | 'analogico';
  createdAt?: string;
  updatedAt?: string;
}

export const relojDigitalApi = {
  // Obtener configuración activa del reloj digital
  getActive: async (): Promise<RelojDigital> => {
    const response = await fetchWithAuth<{ success: boolean; data: RelojDigital }>(
      '/reloj-digital/activo'
    );
    return response.data;
  },

  // Obtener todas las configuraciones de relojes digitales
  getAll: async (): Promise<RelojDigital[]> => {
    const response = await fetchWithAuth<{ success: boolean; data: RelojDigital[] }>(
      '/reloj-digital'
    );
    return response.data;
  },

  // Crear nueva configuración de reloj digital
  create: async (relojData: Omit<RelojDigital, 'id' | 'createdAt' | 'updatedAt'>): Promise<RelojDigital> => {
    const response = await fetchWithAuth<{ success: boolean; data: RelojDigital }>(
      '/reloj-digital',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(relojData),
      }
    );
    return response.data;
  },

  // Actualizar configuración de reloj digital
  update: async (id: number, relojData: Partial<RelojDigital>): Promise<RelojDigital> => {
    const response = await fetchWithAuth<{ success: boolean; data: RelojDigital }>(
      `/reloj-digital/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(relojData),
      }
    );
    return response.data;
  },

  // Eliminar configuración de reloj digital
  delete: async (id: number): Promise<void> => {
    await fetchWithAuth(`/reloj-digital/${id}`, {
      method: 'DELETE',
    });
  },
};