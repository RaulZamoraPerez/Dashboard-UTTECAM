import { fetchWithAuth } from './apiService';

// Tipos para el servicio de Proceso de Admisión
export interface ArchivoData {
  nombre: string;
  mimeType: string;
  base64: string;
}

export interface ProcesoAdmisionData {
  id: string;
  titulo: string;
  subtitulo: string;
  archivo: ArchivoData;
}

export interface ProcesoAdmisionResponse {
  message: string;
  data: ProcesoAdmisionData;
}

// El GET puede devolver un objeto único o un array
export type ProcesoAdmisionGetResponse = ProcesoAdmisionData | ProcesoAdmisionData[];

export interface CreateProcesoAdmisionPayload {
  titulo: string;
  subtitulo: string;
  attachment: File;
}

export interface UpdateProcesoAdmisionPayload {
  titulo?: string;
  subtitulo?: string;
  attachment?: File;
}

// Endpoint base
const ENDPOINT = '/api/servicios-escolares/proceso-admision';

/**
 * Crea una nueva convocatoria de proceso de admisión
 * @param payload - Datos de la convocatoria (titulo, subtitulo, attachment)
 * @returns Promise con la respuesta del servidor
 */
export const createProcesoAdmision = async (
  payload: CreateProcesoAdmisionPayload
): Promise<ProcesoAdmisionResponse> => {
  const formData = new FormData();
  formData.append('titulo', payload.titulo);
  formData.append('subtitulo', payload.subtitulo);
  formData.append('attachment', payload.attachment);

  return fetchWithAuth<ProcesoAdmisionResponse>(ENDPOINT, {
    method: 'POST',
    body: formData,
  });
};

/**
 * Obtiene todas las convocatorias de proceso de admisión
 * @returns Promise con la lista de convocatorias
 */
export const getProcesoAdmisionList = async (): Promise<ProcesoAdmisionGetResponse> => {
  return fetchWithAuth<ProcesoAdmisionGetResponse>(ENDPOINT, {
    method: 'GET',
  });
};

/**
 * Obtiene una convocatoria específica por ID
 * @param id - ID de la convocatoria
 * @returns Promise con la convocatoria
 */
export const getProcesoAdmisionById = async (
  id: string
): Promise<ProcesoAdmisionResponse> => {
  return fetchWithAuth<ProcesoAdmisionResponse>(`${ENDPOINT}/${id}`, {
    method: 'GET',
  });
};

/**
 * Actualiza una convocatoria existente
 * @param id - ID de la convocatoria a actualizar
 * @param payload - Datos a actualizar
 * @returns Promise con la respuesta del servidor
 */
export const updateProcesoAdmision = async (
  id: string,
  payload: UpdateProcesoAdmisionPayload
): Promise<ProcesoAdmisionResponse> => {
  const formData = new FormData();
  
  if (payload.titulo) {
    formData.append('titulo', payload.titulo);
  }
  if (payload.subtitulo) {
    formData.append('subtitulo', payload.subtitulo);
  }
  if (payload.attachment) {
    formData.append('attachment', payload.attachment);
  }

  return fetchWithAuth<ProcesoAdmisionResponse>(`${ENDPOINT}/${id}`, {
    method: 'PUT',
    body: formData,
  });
};

/**
 * Elimina una convocatoria
 * @param id - ID de la convocatoria a eliminar
 * @returns Promise con la respuesta del servidor
 */
export const deleteProcesoAdmision = async (
  id: string
): Promise<{ message: string }> => {
  return fetchWithAuth<{ message: string }>(`${ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
};
