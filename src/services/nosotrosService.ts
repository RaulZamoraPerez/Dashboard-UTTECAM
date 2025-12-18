// services/nosotrosService.ts
import { fetchWithAuth } from './apiService';
import {
  NosotrosContent,
  SectionKey,
  ImageSectionKey,
  ApiResponse,
  UpdateSectionRequest
} from '../types/nosotros';

const API_BASE = '/api/nosotros';

/**
 * Convierte una ruta relativa de imagen a URL absoluta
 * @param imagePath - Ruta relativa de la imagen (ej: 'nosotros/vision.jpg')
 * @returns URL absoluta de la imagen
 */
export const getImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return '/images/placeholder.png';

  // Si ya es una URL absoluta, devolverla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Obtener la URL base del backend
  const backendUrl = import.meta.env.VITE_BACKENDURL || '';

  // Si la ruta ya incluye /uploads/, agregar el backend URL
  if (imagePath.startsWith('/uploads/')) {
    return `${backendUrl}${imagePath}`;
  }

  // Si la ruta es relativa (como 'nosotros/vision.jpg'), construir la ruta completa
  if (imagePath.startsWith('nosotros/')) {
    return `${backendUrl}/uploads/${imagePath}`;
  }

  // Para otros casos, intentar acceder con el backend
  return `${backendUrl}/${imagePath}`;
};

/**
 * Verifica si una imagen existe en el servidor
 * @param imagePath - Ruta de la imagen a verificar
 * @returns Promise que resuelve a true si la imagen existe
 */
export const checkImageExists = async (imagePath: string): Promise<boolean> => {
  if (!imagePath) return false;

  try {
    const response = await fetch(getImageUrl(imagePath), { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Obtiene todo el contenido de "Nosotros"
 */
export const getNosotrosContent = async (): Promise<NosotrosContent> => {
  const rawData = await fetchWithAuth<any>(`${API_BASE}/content`);

  // La nueva API ya devuelve los datos en el formato correcto
  const data = rawData || {}; // Handle null response for empty DB

  // objetivoIntegral viene como string de la BD, convertirlo a objeto para el frontend
  let objetivoIntegralObj = { text: '' };
  if (data.objetivoIntegral) {
    if (typeof data.objetivoIntegral === 'string') {
      objetivoIntegralObj = { text: data.objetivoIntegral };
    } else if (typeof data.objetivoIntegral === 'object' && 'text' in data.objetivoIntegral) {
      objetivoIntegralObj = data.objetivoIntegral;
    }
  }

  return {
    vision: data.vision || { title: 'Visión', description: '', imageSrc: null },
    mision: data.mision || { title: 'Misión', description: '', imageSrc: null },
    valores: data.valores || { title: 'Valores', description: [], imageSrc: null },
    politicaIntegral: data.politicaIntegral || { text: '', imageSrc: null },
    objetivoIntegral: objetivoIntegralObj,
    noDiscriminacion: data.noDiscriminacion || { items: [] },
    organigrama: data.organigrama || { imageSrc: null }
  };
};

/**
 * Obtiene una sección específica de "Nosotros"
 */
export const getNosotrosSection = async (section: SectionKey): Promise<Partial<NosotrosContent>> => {
  const response = await fetchWithAuth<Record<string, unknown>>(`${API_BASE}/content/${section}`);
  return response;
};

/**
 * Crea nuevo contenido completo de "Nosotros" (requiere autenticación)
 */
export const createNosotrosContent = async (content: NosotrosContent): Promise<ApiResponse<NosotrosContent>> => {
  return await fetchWithAuth<ApiResponse<NosotrosContent>>(`${API_BASE}/content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(content),
  });
};

/**
 * Actualiza todo el contenido de "Nosotros" (requiere autenticación)
 */
export const updateNosotrosContent = async (content: NosotrosContent): Promise<ApiResponse<NosotrosContent>> => {
  return await fetchWithAuth<ApiResponse<NosotrosContent>>(`${API_BASE}/content`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(content),
  });
};

/**
 * Actualiza una sección específica de "Nosotros" (requiere autenticación)
 */
export const updateNosotrosSection = async (
  section: SectionKey,
  data: UpdateSectionRequest
): Promise<ApiResponse<Partial<NosotrosContent>>> => {
  // Enviar los datos directamente, el backend simplificado los espera así
  return await fetchWithAuth<ApiResponse<Partial<NosotrosContent>>>(`${API_BASE}/content/${section}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};

/**
 * Elimina todo el contenido de "Nosotros" (requiere autenticación)
 */
export const deleteNosotrosContent = async (): Promise<ApiResponse> => {
  return await fetchWithAuth<ApiResponse>(`${API_BASE}/content`, {
    method: 'DELETE',
  });
};

/**
 * Sube una imagen y actualiza una sección específica de "Nosotros" (requiere autenticación)
 */
export const uploadImageAndUpdateSection = async (
  section: ImageSectionKey,
  file: File,
  additionalData?: Partial<UpdateSectionRequest>,
  _currentContent?: Partial<NosotrosContent>
): Promise<ApiResponse<Partial<NosotrosContent>>> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('section', section);

  // Añadir datos adicionales si se proporcionan
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'string') {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });
  }

  return await fetchWithAuth<ApiResponse<Partial<NosotrosContent>>>(`${API_BASE}/upload-image`, {
    method: 'POST',
    body: formData,
  }, false);
};