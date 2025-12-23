import { fetchWithAuth } from './apiService';

export interface SeminarioResource {
  id: number;
  titulo: string;
  descripcion?: string;
  url: string;
  tipo: 'pdf' | 'image';
  fecha_subida: string;
  is_active: boolean;
}

export const getSeminarioResources = async (): Promise<SeminarioResource[]> => {
  return await fetchWithAuth<SeminarioResource[]>('/api/seminario-cafe');
};

export const uploadSeminarioResource = async (formData: FormData): Promise<SeminarioResource> => {
  return await fetchWithAuth<SeminarioResource>('/api/seminario-cafe', {
    method: 'POST',
    body: formData,
  });
};

export const deleteSeminarioResource = async (id: number): Promise<{ message: string }> => {
  return await fetchWithAuth<{ message: string }>(`/api/seminario-cafe/${id}`, {
    method: 'DELETE',
  });
};
