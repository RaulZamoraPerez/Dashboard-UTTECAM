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

  // Si la ruta ya incluye /uploads/, devolverla directamente (el proxy la manejará)
  if (imagePath.startsWith('/uploads/')) {
    return imagePath;
  }

  // Si la ruta es relativa (como 'nosotros/vision.jpg'), construir la ruta completa
  // Asumiendo que todas las imágenes están en /uploads/nosotros/
  if (imagePath.startsWith('nosotros/')) {
    return `/uploads/${imagePath}`;
  }

  // Para otros casos, intentar acceder directamente
  return `/${imagePath}`;
};/**
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
  const rawData = await fetchWithAuth<Partial<NosotrosContent>>(`${API_BASE}/content`);
  
  // Deserializar los campos que vienen como JSON strings desde la base de datos
  const data = {
    ...rawData,
    politicaIntegral: rawData.politicaIntegral ? (typeof rawData.politicaIntegral === 'string' ? JSON.parse(rawData.politicaIntegral) : rawData.politicaIntegral) : { imageSrc: '', title: '', description: '' },
    vision: rawData.vision ? (typeof rawData.vision === 'string' ? JSON.parse(rawData.vision) : rawData.vision) : { imageSrc: '', title: '', description: '' },
    mision: rawData.mision ? (typeof rawData.mision === 'string' ? JSON.parse(rawData.mision) : rawData.mision) : { imageSrc: '', title: '', description: '' },
    valores: rawData.valores ? (typeof rawData.valores === 'string' ? JSON.parse(rawData.valores) : rawData.valores) : { imageSrc: '', title: '', description: [] },
    noDiscriminacion: rawData.noDiscriminacion ? (typeof rawData.noDiscriminacion === 'string' ? JSON.parse(rawData.noDiscriminacion) : rawData.noDiscriminacion) : []
  };

  // Normalizar los datos para asegurar que todos los campos requeridos estén presentes
  return {
    politicaIntegral: data.politicaIntegral,
    objetivoIntegral: data.objetivoIntegral || '',
    vision: data.vision,
    mision: data.mision,
    valores: data.valores,
    noDiscriminacion: data.noDiscriminacion
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
  // Enviar los datos envueltos en un objeto con la clave de la sección
  // El backend espera { [section]: data }
  return await fetchWithAuth<ApiResponse<Partial<NosotrosContent>>>(`${API_BASE}/content/${section}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ [section]: data }),
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
  currentContent?: Partial<NosotrosContent>
): Promise<ApiResponse<Partial<NosotrosContent>>> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('section', section); // Campo separado como en el ejemplo de curl

  // Obtener los datos actuales de la sección para preservarlos
  let sectionData: any = {};

  if (currentContent && currentContent[section]) {
    sectionData = { ...currentContent[section] };
  }

  // Combinar con los datos adicionales proporcionados
  if (additionalData) {
    sectionData = { ...sectionData, ...additionalData };
  }

  // Agregar todos los campos de la sección al FormData
  Object.entries(sectionData).forEach(([key, value]) => {
    if (value !== undefined && value !== null && key !== 'imageSrc') {
      // No enviar imageSrc ya que se actualizará con la nueva imagen
      formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
  });

  // Usar fetchWithAuth corregido sin redirección automática en caso de 401
  return await fetchWithAuth<ApiResponse<Partial<NosotrosContent>>>(`${API_BASE}/upload-image`, {
    method: 'POST',
    body: formData,
  }, false); // false = no redirigir automáticamente en caso de 401
};