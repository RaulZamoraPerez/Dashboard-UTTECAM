import { fetchWithAuth } from './apiService';

export interface CaracteristicaModelo {
  number: number;
  title: string;
  description: string;
}

export interface ModeloEducativo {
  id?: number;
  titulo_principal: string;
  descripcion_principal: string;
  titulo_seccion: string;
  descripcion_seccion: string;
  imagen_url: string;
  caracteristicas: CaracteristicaModelo[];
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const modeloEducativoApi = {
  // Obtener modelo educativo (singleton)
  get: async (): Promise<ModeloEducativo> => {
    return await fetchWithAuth<ModeloEducativo>('/api/modelo-educativo');
  },

  // Actualizar modelo educativo
  update: async (id: number, data: Partial<ModeloEducativo> & { imagenFile?: File | null } = {}): Promise<ModeloEducativo> => {
    // If there is a file to upload, construct FormData, otherwise send JSON
    if (data.imagenFile) {
      const formData = new FormData();
      // Append JSON fields
      const { imagenFile, ...rest } = data;
      formData.append('imagen', imagenFile as File);
      Object.keys(rest).forEach((key) => {
        const value = (rest as any)[key];
        if (value !== undefined && value !== null) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });

      return await fetchWithAuth<ModeloEducativo>(`/api/modelo-educativo/${id}`, {
        method: 'PUT',
        body: formData,
      });
    }

    return await fetchWithAuth<ModeloEducativo>(`/api/modelo-educativo/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
