// hooks/useNosotros.ts
import { useState, useEffect, useCallback } from 'react';
import {
  NosotrosContent,
  SectionKey,
  ImageSectionKey,
  UpdateSectionRequest
} from '../types/nosotros';
import {
  getNosotrosContent,
  updateNosotrosSection,
  updateNosotrosContent,
  uploadImageAndUpdateSection
} from '../services/nosotrosService';

interface UseNosotrosReturn {
  content: NosotrosContent | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateSection: (section: SectionKey, data: UpdateSectionRequest) => Promise<boolean>;
  updateAllContent: (newContent: NosotrosContent) => Promise<boolean>;
  uploadImage: (section: ImageSectionKey, file: File, additionalData?: Partial<UpdateSectionRequest>) => Promise<boolean>;
}

export const useNosotros = (): UseNosotrosReturn => {
  const [content, setContent] = useState<NosotrosContent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNosotrosContent();
      setContent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el contenido');
      console.error('Error fetching nosotros content:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSection = useCallback(async (
    section: SectionKey,
    data: UpdateSectionRequest
  ): Promise<boolean> => {
    try {
      setError(null);
      await updateNosotrosSection(section, data);

      // Recargar el contenido desde el servidor para asegurar que se vea actualizado
      await fetchContent();

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la sección';
      setError(errorMessage);
      console.error('Error updating section:', err);
      return false;
    }
  }, [content]);

  const updateAllContent = useCallback(async (newContent: NosotrosContent): Promise<boolean> => {
    try {
      setError(null);
      await updateNosotrosContent(newContent);
      setContent(newContent);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el contenido';
      setError(errorMessage);
      console.error('Error updating content:', err);
      return false;
    }
  }, []);

  const uploadImage = useCallback(async (
    section: ImageSectionKey,
    file: File,
    additionalData?: Partial<UpdateSectionRequest>
  ): Promise<boolean> => {
    try {
      setError(null);
      await uploadImageAndUpdateSection(section, file, additionalData, content || undefined);

      // Recargar el contenido desde el servidor para asegurar que la imagen se actualice
      await fetchContent();

      return true;
    } catch (err) {
      let errorMessage = 'Error al subir la imagen';
      
      if (err instanceof Error) {
        if (err.message.includes('Debe especificar la sección')) {
          errorMessage = 'Error de configuración: sección no válida. Use vision, mision o valores.';
        } else if (err.message.includes('Tipo MIME no permitido')) {
          errorMessage = 'Tipo de archivo no permitido. Use imágenes PNG, JPG, WebP, AVIF o SVG.';
        } else if (err.message.includes('Contenido no encontrado')) {
          errorMessage = 'Debe crear el contenido de "Nosotros" antes de subir imágenes.';
        } else if (err.message.includes('Error de autenticación')) {
          errorMessage = 'Su sesión ha expirado. Por favor, refresque la página e inicie sesión nuevamente.';
        } else if (err.message.includes('500')) {
          errorMessage = 'Error interno del servidor. Contacte al administrador del sistema.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      console.error('Error uploading image:', err);
      return false;
    }
  }, [content]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return {
    content,
    loading,
    error,
    refetch: fetchContent,
    updateSection,
    updateAllContent,
    uploadImage,
  };
};