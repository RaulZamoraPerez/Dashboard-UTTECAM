import { fetchWithAuth } from './apiService';

export interface MiembroSNII {
  id: number;
  titulo: string;
  pdf: string;
  orden: number;
  activo: boolean;
  tipo?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface MiembroSniiTipo {
  ID: number;
  Nombre: string;
}

export const miembrosSniiService = {
  getAll: async (): Promise<MiembroSNII[]> => {
    // Public endpoint, but we can use fetchWithAuth or standard fetch. 
    // If the endpoint is public, standard fetch is fine, but fetchWithAuth handles base URL.
    // Let's check apiService.
    return await fetchWithAuth<MiembroSNII[]>('/api/miembros-snii');
  },

  create: async (formData: FormData): Promise<MiembroSNII> => {
    return await fetchWithAuth<MiembroSNII>('/api/miembros-snii', {
      method: 'POST',
      body: formData,
    });
  },

  update: async (id: number, formData: FormData): Promise<MiembroSNII> => {
    return await fetchWithAuth<MiembroSNII>(`/api/miembros-snii/${id}`, {
      method: 'PUT',
      body: formData,
    });
  },

  delete: async (id: number): Promise<void> => {
    return await fetchWithAuth<void>(`/api/miembros-snii/${id}`, {
      method: 'DELETE',
    });
  },

  // Tipos
  getTipos: async (): Promise<MiembroSniiTipo[]> => {
    return await fetchWithAuth<MiembroSniiTipo[]>('/api/miembros-snii-tipos');
  },

  createTipo: async (nombre: string): Promise<MiembroSniiTipo> => {
    return await fetchWithAuth<MiembroSniiTipo>('/api/miembros-snii-tipos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Nombre: nombre }),
    });
  },

  updateTipo: async (id: number, nombre: string): Promise<MiembroSniiTipo> => {
    return await fetchWithAuth<MiembroSniiTipo>(`/api/miembros-snii-tipos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Nombre: nombre }),
    });
  },

  deleteTipo: async (id: number): Promise<void> => {
    return await fetchWithAuth<void>(`/api/miembros-snii-tipos/${id}`, {
      method: 'DELETE',
    });
  }
};
