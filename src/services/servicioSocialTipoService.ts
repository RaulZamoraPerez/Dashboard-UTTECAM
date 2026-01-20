import axios from 'axios';
import { getToken } from './authService';

const API_URL = import.meta.env.VITE_BACKENDURL || 'http://localhost:3004';

export interface ServicioSocialTipo {
  ID: number;
  Nombre: string;
}

const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const obtenerTipos = async (): Promise<ServicioSocialTipo[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/servicio-social-tipos`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener tipos:', error);
    throw error;
  }
};

export const crearTipo = async (nombre: string): Promise<ServicioSocialTipo> => {
  try {
    const response = await axios.post(
      `${API_URL}/api/servicio-social-tipos`,
      { Nombre: nombre },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error al crear tipo:', error);
    throw error;
  }
};

export const actualizarTipo = async (id: number, nombre: string): Promise<ServicioSocialTipo> => {
  try {
    console.log(`Actualizando tipo ID: ${id} con nombre: ${nombre}`);
    const response = await axios.put(
      `${API_URL}/api/servicio-social-tipos/${id}`,
      { Nombre: nombre },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error al actualizar tipo:', error);
    throw error;
  }
};

export const eliminarTipo = async (id: number): Promise<void> => {
  try {
    console.log(`Eliminando tipo ID: ${id}`);
    await axios.delete(
      `${API_URL}/api/servicio-social-tipos/${id}`,
      { headers: getAuthHeaders() }
    );
  } catch (error) {
    console.error('Error al eliminar tipo:', error);
    throw error;
  }
};
