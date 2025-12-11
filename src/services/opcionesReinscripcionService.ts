import { fetchWithAuth } from './apiService';

const API_URL = '/api/opciones-reinscripcion';

// === INTERFACES ===

export interface OpcionReinscripcion {
  id: string;
  titulo: string;
  subtitulo?: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SeccionReinscripcion {
  titulo: string;
  subtitulo?: string;
}

export interface CreateOpcionData {
  id?: string;
  titulo: string;
  subtitulo?: string;
  activo?: boolean;
  archivo: File; // Siempre requerido
}

export interface UpdateSeccionData {
  titulo: string;
  subtitulo?: string;
}

// === FUNCIONES PARA SECCIÓN (Título y Subtítulo principal) ===

/**
 * Obtener la sección principal (título y subtítulo)
 */
export const getSeccion = async (): Promise<SeccionReinscripcion> => {
  const response = await fetch(`${API_URL}/seccion`);
  if (!response.ok) {
    if (response.status === 404) {
      return { titulo: 'Opciones de Reinscripción', subtitulo: '' };
    }
    throw new Error('Error al obtener la sección');
  }
  return response.json();
};

/**
 * Crear o actualizar la sección principal
 */
export const createOrUpdateSeccion = async (data: UpdateSeccionData): Promise<SeccionReinscripcion> => {
  try {
    const result = await fetchWithAuth<SeccionReinscripcion>(`${API_URL}/seccion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al guardar la sección');
  }
};

// === FUNCIONES PARA OPCIONES/CARDS ===

/**
 * Obtener todas las opciones de reinscripción
 */
export const getOpciones = async (activas?: boolean): Promise<OpcionReinscripcion[]> => {
  const url = activas !== undefined 
    ? `${API_URL}?activas=${activas}` 
    : API_URL;
  
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    throw new Error('Error al obtener las opciones');
  }
  return response.json();
};

/**
 * Obtener una opción por ID
 */
export const getOpcionById = async (id: string): Promise<OpcionReinscripcion> => {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) {
    throw new Error('Opción no encontrada');
  }
  return response.json();
};

/**
 * Crear o actualizar una opción
 */
export const createOrUpdateOpcion = async (data: CreateOpcionData): Promise<OpcionReinscripcion> => {
  try {
    const formData = new FormData();
    formData.append('titulo', data.titulo);
    if (data.subtitulo) formData.append('subtitulo', data.subtitulo);
    if (data.id) formData.append('id', data.id);
    // Enviar activo como string JSON válido: "true" o "false"
    formData.append('activo', JSON.stringify(data.activo ?? true));
    formData.append('archivo', data.archivo);

    // Debug: verificar contenido del FormData
    console.log('FormData a enviar:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    const result = await fetchWithAuth<OpcionReinscripcion>(API_URL, {
      method: 'POST',
      body: formData,
    });
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al guardar la opción');
  }
};

/**
 * Eliminar una opción
 */
export const deleteOpcion = async (id: string): Promise<void> => {
  try {
    await fetchWithAuth<void>(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al eliminar la opción');
  }
};

/**
 * Toggle estado activo de una opción
 */
export const toggleActivoOpcion = async (id: string, activo: boolean): Promise<OpcionReinscripcion> => {
  try {
    const result = await fetchWithAuth<OpcionReinscripcion>(`${API_URL}/${id}/toggle-activo`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo })
    });
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al cambiar el estado de la opción');
  }
};

/**
 * Obtener URL de descarga de archivo
 */
export const getDownloadUrl = (id: string): string => {
  return `${API_URL}/${id}/download`;
};
