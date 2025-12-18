import { fetchWithAuth } from './apiService';

// Tipos para el servicio de Trámites
export interface TramitesVistaData {
  id?: string;
  titulo: string;
  subtitulo: string;
}

export interface TramitesVistaResponse {
  id: string;
  titulo: string;
  subtitulo: string;
}

// Endpoint base
const ENDPOINT = '/api/servicios-escolares/tramites';

/**
 * Obtiene la información de la vista de trámites
 * @returns Promise con la información de la vista
 */
export const getTramitesVista = async (): Promise<TramitesVistaResponse | null> => {
  try {
    const response = await fetchWithAuth<TramitesVistaResponse>(ENDPOINT, {
      method: 'GET',
    });
    return response;
  } catch {
    // Si no hay datos, retornar null
    return null;
  }
};

/**
 * Crea la información de la vista de trámites
 * @param data - Datos de la vista (titulo, subtitulo)
 * @returns Promise con la respuesta del servidor
 */
export const createTramitesVista = async (
  data: TramitesVistaData
): Promise<TramitesVistaResponse> => {
  return fetchWithAuth<TramitesVistaResponse>(ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Actualiza la información de la vista de trámites
 * @param id - ID del registro a actualizar
 * @param data - Datos a actualizar
 * @returns Promise con la respuesta del servidor
 */
export const updateTramitesVista = async (
  id: string,
  data: TramitesVistaData
): Promise<TramitesVistaResponse> => {
  return fetchWithAuth<TramitesVistaResponse>(`${ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * Elimina la información de la vista de trámites
 * @param id - ID del registro a eliminar
 * @returns Promise con la respuesta del servidor
 */
export const deleteTramitesVista = async (
  id: string
): Promise<{ message: string }> => {
  return fetchWithAuth<{ message: string }>(`${ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
};
