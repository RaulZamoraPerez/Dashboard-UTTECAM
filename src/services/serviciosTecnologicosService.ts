import { fetchWithAuth } from './apiService';

export interface ServicioTecnologico {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string | null;
  pdf: string | null;
  orden: number;
  activo: boolean;
}

export const getServicios = async (): Promise<ServicioTecnologico[]> => {
  return await fetchWithAuth<ServicioTecnologico[]>('/api/servicios-tecnologicos/admin/all');
};

export const createServicio = async (formData: FormData): Promise<ServicioTecnologico> => {
  return await fetchWithAuth<ServicioTecnologico>('/api/servicios-tecnologicos', {
    method: 'POST',
    body: formData,
  });
};

export const deleteServicio = async (id: number): Promise<void> => {
  return await fetchWithAuth<void>(`/api/servicios-tecnologicos/${id}`, {
    method: 'DELETE',
  });
};
