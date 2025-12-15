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
  lastResponse?: any | null;
  refetch: () => Promise<void>;
  updateSection: (section: SectionKey, data: UpdateSectionRequest) => Promise<boolean>;
  updateAllContent: (newContent: NosotrosContent) => Promise<boolean>;
  uploadImage: (section: ImageSectionKey, file: File, additionalData?: Partial<UpdateSectionRequest>) => Promise<boolean>;
}

export const useNosotros = (): UseNosotrosReturn => {
  const [content, setContent] = useState<NosotrosContent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<any | null>(null);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNosotrosContent();
      setContent(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      // El backend devuelve este mensaje cuando no existe contenido aún.
      // En ese caso no queremos tratarlo como un 'error' que bloquea la UI,
      // sino mostrar el formulario para crear contenido inicial.
      if (message && message.includes("El contenido de 'Nosotros' no ha sido creado aún")) {
        setError(null);
        setContent(null);
      } else {
        setError(message || 'Error al cargar el contenido');
        console.error('Error fetching nosotros content:', err);
      }
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
      const resp = await updateNosotrosSection(section, data);
      setLastResponse(resp);

      // Si la API devolvió la sección actualizada, aplicar actualización localmente
      try {
        if (resp && typeof resp === 'object') {
          // resp puede tener la forma { message: '...', [section]: { ... } }
          const updated = (resp as any)[section];
          if (updated) {
            setContent(prev => {
              if (!prev) return prev;
              return { ...prev, [section]: updated } as NosotrosContent;
            });
          }
        }
      } catch (e) {
        console.warn('No se pudo aplicar la actualización optimista:', e);
      }

      // Hacer un refetch para asegurar consistencia final (no bloquear si falla)
      fetchContent().catch(e => console.warn('Refetch tras updateSection falló:', e));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la sección';
      setError(errorMessage);
      console.error('Error updating section:', err);
      return false;
    }
  }, [fetchContent]);

  const updateAllContent = useCallback(async (newContent: NosotrosContent): Promise<boolean> => {
    try {
      setError(null);
      await updateNosotrosContent(newContent);

      // Recargar el contenido desde el servidor para asegurar consistencia
      await fetchContent();

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el contenido';
      setError(errorMessage);
      console.error('Error updating content:', err);
      return false;
    }
  }, [fetchContent]);

  const uploadImage = useCallback(async (
    section: ImageSectionKey,
    file: File,
    additionalData?: Partial<UpdateSectionRequest>
  ): Promise<boolean> => {
    try {
      setError(null);
      const resp = await uploadImageAndUpdateSection(section, file, additionalData, content || undefined);
      setLastResponse(resp);

      // Aplicar actualización optimista localmente si API regresó la nueva imagen/texto
      try {
        if (resp && typeof resp === 'object') {
          const updated = (resp as any)[section];
          if (updated) {
            setContent(prev => {
              if (!prev) return prev;
              return { ...prev, [section]: updated } as NosotrosContent;
            });
          } else if ((resp as any).imageSrc) {
            // caso en el que backend devuelve imageSrc directamente
            setContent(prev => {
              if (!prev) return prev;
              return { ...prev, [section]: { ...(prev as any)[section], imageSrc: (resp as any).imageSrc } } as NosotrosContent;
            });
          }
        }
      } catch (e) {
        console.warn('No se pudo aplicar la actualización optimista tras upload:', e);
      }

      // Intentar refetch para consistencia, sin bloquear el return
      fetchContent().catch(e => console.warn('Refetch tras uploadImage falló:', e));

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
  }, [fetchContent]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return {
    content,
    loading,
    error,
    lastResponse,
    refetch: fetchContent,
    updateSection,
    updateAllContent,
    uploadImage,
  };
};