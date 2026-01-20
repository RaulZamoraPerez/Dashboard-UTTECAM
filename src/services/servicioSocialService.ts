import axios from 'axios';
import { getToken } from './authService';

const API_URL = import.meta.env.VITE_BACKENDURL || 'http://localhost:3004';

export interface ServicioSocialDocumento {
  ID: number;
  Nombre: string;
  Descripcion?: string;
  Ruta_Documento: string;
  Fecha_Subida: string;
  Tipo?: string;
}

export const obtenerDocumentos = async (): Promise<ServicioSocialDocumento[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/servicio-social`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      if (status === 401 || status === 403) {
        throw new Error('Acceso no autorizado: inicia sesión como admin');
      }
    }
    console.error('Error al obtener documentos:', error);
    throw error;
  }
};

export const subirDocumento = async (
  archivo: File,
  nombre: string,
  descripcion: string,
  tipo: string
): Promise<ServicioSocialDocumento> => {
  try {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('Nombre', nombre);
    formData.append('Descripcion', descripcion);
    formData.append('Tipo', tipo);

    const token = getToken();
    const headers: any = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await axios.post(`${API_URL}/api/servicio-social`, formData, {
      headers
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      if (status === 401 || status === 403) {
        throw new Error('Acceso no autorizado: inicia sesión como admin');
      }
    }
    console.error('Error al subir documento:', error);
    throw error;
  }
};

export const actualizarDocumento = async (
  id: number,
  nombre: string,
  descripcion: string,
  tipo: string
): Promise<ServicioSocialDocumento> => {
  try {
    const token = getToken();
    const headers: any = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await axios.put(`${API_URL}/api/servicio-social/${id}`, {
      Nombre: nombre,
      Descripcion: descripcion,
      Tipo: tipo
    }, {
      headers
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      if (status === 401 || status === 403) {
        throw new Error('Acceso no autorizado: inicia sesión como admin');
      }
    }
    console.error('Error al actualizar documento:', error);
    throw error;
  }
};

export const eliminarDocumento = async (id: number): Promise<void> => {
  try {
    const token = getToken();
    const headers: any = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    await axios.delete(`${API_URL}/api/servicio-social/${id}`, {
      headers
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      if (status === 401 || status === 403) {
        throw new Error('Acceso no autorizado: inicia sesión como admin');
      }
    }
    console.error('Error al eliminar documento:', error);
    throw error;
  }
};
