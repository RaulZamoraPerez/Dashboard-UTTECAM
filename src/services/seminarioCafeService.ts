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
  return await fetchWithAuth<SeminarioResource[]>('/api/seminarios-cafe');
};

export const uploadSeminarioResource = async (formData: FormData): Promise<SeminarioResource> => {
  return await fetchWithAuth<SeminarioResource>('/api/seminarios-cafe', {
    method: 'POST',
    body: formData,
  });
};

export const deleteSeminarioResource = async (id: number): Promise<{ message: string }> => {
  return await fetchWithAuth<{ message: string }>(`/api/seminarios-cafe/${id}`, {
    method: 'DELETE',
  });
};
