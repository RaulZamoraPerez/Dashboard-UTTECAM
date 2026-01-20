// src/services/egresadosService.ts
import { fetchWithAuth } from './apiService';

export interface EgresadosResource {
  id: number;
  titulo: string;
  descripcion?: string;
  url: string;
  tipo: 'pdf' | 'image';
  fecha_subida: string;
  is_active: boolean;
}

const BASE_PATH = '/api/egresados-encuentros'; // ajusta si tu backend usa otra ruta

export const getEgresadosResources = async (): Promise<EgresadosResource[]> => {
  return fetchWithAuth<EgresadosResource[]>(BASE_PATH);
};

export const uploadEgresadosResource = async (formData: FormData): Promise<EgresadosResource> => {
  return fetchWithAuth<EgresadosResource>(BASE_PATH, {
    method: 'POST',
    body: formData,
  });
};

export const deleteEgresadosResource = async (id: number): Promise<{ message: string }> => {
  return fetchWithAuth<{ message: string }>(`${BASE_PATH}/${id}`, {
    method: 'DELETE',
  });
};

export const updateEgresadosResource = async (
  id: number,
  data: Partial<Pick<EgresadosResource, 'titulo' | 'descripcion' | 'is_active'>>
) => {
  return fetchWithAuth<EgresadosResource>(`${BASE_PATH}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};
