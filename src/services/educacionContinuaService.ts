import { fetchWithAuth } from './apiService';

export interface EducacionContinuaInfo {
  id: number;
  titulo_principal: string;
  descripcion_final: string;
}

export interface EducacionContinuaCurso {
  id: number;
  titulo: string;
  imagen: string;
  orden: number;
  activo: boolean;
}

export const educacionContinuaService = {
  // Info methods
  getInfo: async (): Promise<EducacionContinuaInfo> => {
    return await fetchWithAuth<EducacionContinuaInfo>('/api/educacion-continua/info');
  },

  updateInfo: async (data: { titulo_principal: string; descripcion_final: string }): Promise<EducacionContinuaInfo> => {
    return await fetchWithAuth<EducacionContinuaInfo>('/api/educacion-continua/info', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  // Cursos methods
  getCursos: async (): Promise<EducacionContinuaCurso[]> => {
    return await fetchWithAuth<EducacionContinuaCurso[]>('/api/educacion-continua/cursos');
  },

  createCurso: async (formData: FormData): Promise<EducacionContinuaCurso> => {
    return await fetchWithAuth<EducacionContinuaCurso>('/api/educacion-continua/cursos', {
      method: 'POST',
      body: formData,
    });
  },

  updateCurso: async (id: number, formData: FormData): Promise<EducacionContinuaCurso> => {
    return await fetchWithAuth<EducacionContinuaCurso>(`/api/educacion-continua/cursos/${id}`, {
      method: 'PUT',
      body: formData,
    });
  },

  deleteCurso: async (id: number): Promise<void> => {
    return await fetchWithAuth<void>(`/api/educacion-continua/cursos/${id}`, {
      method: 'DELETE',
    });
  },

  toggleStatus: async (id: number, activo: boolean): Promise<EducacionContinuaCurso> => {
    return await fetchWithAuth<EducacionContinuaCurso>(`/api/educacion-continua/cursos/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ activo }),
    });
  },

  reorderCursos: async (orderedIds: number[]): Promise<EducacionContinuaCurso[]> => {
    return await fetchWithAuth<EducacionContinuaCurso[]>('/api/educacion-continua/cursos/reorder', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderedIds }),
    });
  }
};
