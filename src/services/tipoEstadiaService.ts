import axios from 'axios';
import { getToken } from './authService';

const API_URL = import.meta.env.VITE_BACKENDURL || 'http://localhost:3004';

export interface TipoEstadia {
  ID: number;
  Nombre: string;
  Descripcion?: string;
  Orden: number;
  Activo: boolean;
}

export const listarTipos = async (incluirInactivos = false): Promise<TipoEstadia[]> => {
  const response = await axios.get(`${API_URL}/api/tipos-estadia`, {
    params: { incluirInactivos },
  });
  return response.data;
};

export const obtenerTipo = async (id: number): Promise<TipoEstadia> => {
  const response = await axios.get(`${API_URL}/api/tipos-estadia/${id}`);
  return response.data;
};

export const crearTipo = async (data: Partial<TipoEstadia>): Promise<TipoEstadia> => {
  const token = getToken();
  const response = await axios.post(`${API_URL}/api/tipos-estadia`, data, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const actualizarTipo = async (id: number, data: Partial<TipoEstadia>): Promise<TipoEstadia> => {
  const token = getToken();
  const response = await axios.put(`${API_URL}/api/tipos-estadia/${id}`, data, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const eliminarTipo = async (id: number, forzar = false): Promise<void> => {
  const token = getToken();
  await axios.delete(`${API_URL}/api/tipos-estadia/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    params: { forzar: forzar ? 'true' : 'false' }
  });
};

export const reordenarTipos = async (tipos: { ID: number; Orden: number }[]): Promise<void> => {
  const token = getToken();
  await axios.post(`${API_URL}/api/tipos-estadia/reordenar`, { tipos }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};
