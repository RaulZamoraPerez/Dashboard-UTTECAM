import { fetchWithAuth, fetchWithAuthResponse } from './apiService';

const API_URL = import.meta.env.VITE_BACKENDURL || '';

// Interfaces basadas en la API
export interface Area {
  ID_Area: number;
  Nombre: string;
  categorias?: Categoria[];
}

export interface Categoria {
  ID_Categorias: number;
  Nombre: string;
  ID_Area: number;
  area?: Area;
  archivos?: Archivo[];
}

export interface Archivo {
  ID: number;
  Nombre: string;
  Descripcion?: string | null;
  Ruta_Documento: string;
  Fecha_Subida: string;
  ID_Categorias: number;
  categoria?: Categoria;
}

export interface UploadResponse {
  message: string;
  archivo: Archivo;
  file: {
    originalname: string;
    filename: string;
    mimetype: string;
    size: number;
    path: string;
  };
}

// ============ ÁREAS ============

/**
 * Obtener todas las áreas con sus categorías y archivos
 */
export const obtenerAreas = async (): Promise<Area[]> => {
  return fetchWithAuth<Area[]>('/api/documentos/areas', {
    method: 'GET'
  });
};

/**
 * Obtener un área específica
 */
export const obtenerArea = async (id: number): Promise<Area> => {
  return fetchWithAuth<Area>(`/api/documentos/areas/${id}`, {
    method: 'GET'
  });
};

/**
 * Crear una nueva área
 */
export const crearArea = async (nombre: string): Promise<Area> => {
  return fetchWithAuth<Area>('/api/documentos/areas', {
    method: 'POST',
    body: JSON.stringify({ Nombre: nombre })
  });
};

/**
 * Actualizar un área
 */
export const actualizarArea = async (id: number, nombre: string): Promise<Area> => {
  return fetchWithAuth<Area>(`/api/documentos/areas/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ Nombre: nombre })
  });
};

/**
 * Eliminar un área
 */
export const eliminarArea = async (id: number): Promise<{ message: string }> => {
  return fetchWithAuth<{ message: string }>(`/api/documentos/areas/${id}`, {
    method: 'DELETE'
  });
};

// ============ CATEGORÍAS ============

/**
 * Obtener todas las categorías
 */
export const obtenerCategorias = async (): Promise<Categoria[]> => {
  return fetchWithAuth<Categoria[]>('/api/documentos/categorias', {
    method: 'GET'
  });
};

/**
 * Obtener una categoría específica
 */
export const obtenerCategoria = async (id: number): Promise<Categoria> => {
  return fetchWithAuth<Categoria>(`/api/documentos/categorias/${id}`, {
    method: 'GET'
  });
};

/**
 * Crear una nueva categoría
 */
export const crearCategoria = async (nombre: string, idArea: number): Promise<Categoria> => {
  const payload = { Nombre: nombre, ID_Area: idArea };
  console.log('Creando categoría con payload:', payload);
  return fetchWithAuth<Categoria>('/api/documentos/categorias', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

/**
 * Actualizar una categoría
 */
export const actualizarCategoria = async (
  id: number, 
  nombre: string, 
  idArea: number
): Promise<Categoria> => {
  return fetchWithAuth<Categoria>(`/api/documentos/categorias/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ Nombre: nombre, ID_Area: idArea })
  });
};

/**
 * Eliminar una categoría
 */
export const eliminarCategoria = async (id: number): Promise<{ message: string }> => {
  return fetchWithAuth<{ message: string }>(`/api/documentos/categorias/${id}`, {
    method: 'DELETE'
  });
};

// ============ ARCHIVOS ============

/**
 * Obtener todos los archivos
 */
export const obtenerArchivos = async (): Promise<Archivo[]> => {
  return fetchWithAuth<Archivo[]>('/api/documentos/archivos', {
    method: 'GET'
  });
};

/**
 * Obtener un archivo específico
 */
export const obtenerArchivo = async (id: number): Promise<Archivo> => {
  return fetchWithAuth<Archivo>(`/api/documentos/archivos/${id}`, {
    method: 'GET'
  });
};

/**
 * Obtener archivos de un área específica
 */
export const obtenerArchivosPorArea = async (areaId: number): Promise<Archivo[]> => {
  return fetchWithAuth<Archivo[]>(`/api/documentos/archivos/area/${areaId}`, {
    method: 'GET'
  });
};

/**
 * Subir archivo físico (RECOMENDADO)
 */
export const subirArchivo = async (
  archivo: File,
  nombre: string,
  descripcion: string,
  idCategoria: number
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('archivo', archivo);
  formData.append('Nombre', nombre);
  formData.append('Descripcion', descripcion);
  formData.append('ID_Categorias', idCategoria.toString());

  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_URL}/api/documentos/archivos/upload`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error al subir archivo' }));
    throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Crear registro de archivo sin subir archivo físico
 */
export const crearArchivoRegistro = async (
  nombre: string,
  rutaDocumento: string,
  idCategoria: number,
  descripcion?: string
): Promise<Archivo> => {
  return fetchWithAuth<Archivo>('/api/documentos/archivos', {
    method: 'POST',
    body: JSON.stringify({
      Nombre: nombre,
      Ruta_Documento: rutaDocumento,
      ID_Categorias: idCategoria,
      Descripcion: descripcion
    })
  });
};

/**
 * Actualizar un archivo
 */
export const actualizarArchivo = async (
  id: number,
  nombre: string,
  rutaDocumento: string,
  idCategoria: number,
  descripcion?: string
): Promise<Archivo> => {
  return fetchWithAuth<Archivo>(`/api/documentos/archivos/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      Nombre: nombre,
      Ruta_Documento: rutaDocumento,
      ID_Categorias: idCategoria,
      Descripcion: descripcion
    })
  });
};

/**
 * Eliminar un archivo
 */
export const eliminarArchivo = async (id: number): Promise<{ message: string }> => {
  return fetchWithAuth<{ message: string }>(`/api/documentos/archivos/${id}`, {
    method: 'DELETE'
  });
};

/**
 * Obtener estadísticas de archivos por área
 */
export const obtenerEstadisticas = async (): Promise<Area[]> => {
  return fetchWithAuth<Area[]>('/api/documentos/estadisticas', {
    method: 'GET'
  });
};

/**
 * Descargar archivo
 */
export const descargarArchivo = async (rutaDocumento: string): Promise<string> => {
  try {
    const response = await fetchWithAuthResponse(rutaDocumento);
    if (!response.ok) {
      throw new Error('Error al descargar el archivo');
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    throw error;
  }
};
