// pages/Directorio/DirectorioForm.tsx
import { useState, useEffect } from 'react';
import { useDirectorio } from '../../hooks/useDirectorio';
import { Directorio, DirectorioFormData } from '../../types/directorio';
import { getImageUrl } from '../../services/directorioService';

/* Small inline SVG replacements for lucide-react icons */
const X = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const Upload = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5-5 5 5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15V5" />
  </svg>
);

const User = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const AlertCircle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

interface Props {
  directorio?: Directorio | null;
  onClose: () => void;
}

interface FieldErrors {
  titulo?: string;
  nombre?: string;
  telefono?: string;
  extension?: string;
  correo?: string;
  imagen?: string;
}

export default function DirectorioForm({ directorio, onClose }: Props) {
  const { createItem, updateItem } = useDirectorio();
  const [formData, setFormData] = useState<DirectorioFormData>({
    titulo: '',
    nombre: '',
    telefono: '',
    extension: '',
    correo: '',
    imagen: null,
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (directorio) {
      setFormData({
        titulo: directorio.titulo,
        nombre: directorio.nombre,
        telefono: directorio.telefono || '',
        extension: directorio.extension || '',
        correo: directorio.correo || '',
        imagen: null,
      });
      if (directorio.imagen) {
        setImagePreview(getImageUrl(directorio.imagen));
      }
    }
  }, [directorio]);

  // Validación de campo individual
  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'titulo':
        if (!value?.trim()) return 'El cargo es obligatorio';
        if (value.length > 100) return 'Máximo 100 caracteres';
        break;
      case 'nombre':
        if (!value?.trim()) return 'El nombre es obligatorio';
        if (value.length > 100) return 'Máximo 100 caracteres';
        break;
      case 'correo':
        if (value?.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) return 'Formato de correo inválido';
        }
        break;
      case 'telefono':
        if (value?.trim()) {
          const phoneRegex = /^[\d\s\-\(\)\+]+$/;
          if (!phoneRegex.test(value)) return 'Solo números, espacios y guiones';
          if (value.length > 20) return 'Máximo 20 caracteres';
        }
        break;
      case 'extension':
        if (value?.trim()) {
          if (!/^\d*$/.test(value)) return 'Solo números';
          if (value.length > 10) return 'Máximo 10 dígitos';
        }
        break;
    }
    return undefined;
  };

  // Manejar cambio con validación en tiempo real
  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validar inmediatamente mientras escribe
    const error = validateField(field, value);
    setFieldErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setFieldErrors(prev => ({ ...prev, imagen: 'La imagen no debe exceder 10MB' }));
        return;
      }
      setFieldErrors(prev => ({ ...prev, imagen: undefined }));
      setFormData({ ...formData, imagen: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar todos los campos
    const errors: FieldErrors = {};
    errors.titulo = validateField('titulo', formData.titulo);
    errors.nombre = validateField('nombre', formData.nombre);
    errors.correo = validateField('correo', formData.correo || '');
    errors.telefono = validateField('telefono', formData.telefono || '');
    errors.extension = validateField('extension', formData.extension || '');

    // Validar imagen si hay una nueva
    if (formData.imagen) {
       if (formData.imagen.size > 10 * 1024 * 1024) {
          errors.imagen = 'La imagen es demasiado pesada (máximo 10MB)';
       }
       const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
       if (!allowedTypes.includes(formData.imagen.type)) {
          errors.imagen = 'Formato no permitido (usa JPG, PNG o WebP)';
       }
    }

    // Marcar todos como tocados
    setTouched({ titulo: true, nombre: true, correo: true, telefono: true, extension: true, imagen: true });
    setFieldErrors(errors);

    // Verificar si hay errores locales
    const hasErrors = Object.values(errors).some(e => e !== undefined);
    if (hasErrors) {
      setError('Por favor revisa los campos marcados en rojo');
      return;
    }

    setSaving(true);
    try {
      let success;
      if (directorio) {
        success = await updateItem(directorio.id, formData);
      } else {
        success = await createItem(formData);
      }

      if (success) {
        onClose();
      } else {
        // useDirectorio maneja el mensaje en su estado 'error', podemos intentar leerlo aquí
        setError('El servidor rechazó la solicitud. Verifica que todos los datos sean correctos.');
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Error de conexión: No se pudo contactar con el servidor'
      );
    } finally {
      setSaving(false);
    }
  };

  // Componente de input con validación
  const InputField = ({ 
    id, 
    label, 
    required = false, 
    placeholder = '',
    type = 'text'
  }: { 
    id: string; 
    label: string; 
    required?: boolean; 
    placeholder?: string;
    type?: string;
  }) => {
    const hasError = touched[id] && fieldErrors[id as keyof FieldErrors];
    const value = (formData as any)[id] || '';
    
    return (
      <div className={hasError ? 'animate-pulse' : ''}>
        <label htmlFor={id} className={`block text-sm font-medium mb-2 ${hasError ? 'text-red-600' : 'text-black dark:text-white/90'}`}>
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
        <div className="relative">
          <input
            type={type}
            id={id}
            value={value}
            onChange={(e) => handleChange(id, e.target.value)}
            className={`w-full px-4 py-3 text-black placeholder-black dark:placeholder-gray-400 bg-white dark:bg-gray-800 border-2 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200
              ${hasError 
                ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20 shadow-[0_0_0_3px_rgba(239,68,68,0.2)]' 
                : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500 hover:border-gray-400 dark:hover:border-gray-600'}`}
            placeholder={placeholder}
          />
          {hasError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          )}
        </div>
        {hasError && (
          <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              {fieldErrors[id as keyof FieldErrors]}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-black dark:text-white">
            {directorio ? 'Editar Contacto' : 'Nuevo Contacto'}
          </h2>
          <button
            onClick={onClose}
            className="text-black dark:text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-white/90 mb-2">
              Foto de Perfil
            </label>
            <div className="flex items-center space-x-6">
              <div className="shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-24 w-24 object-cover rounded-full border-2 border-gray-300 dark:border-gray-700"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                    <User className="h-12 w-12 text-black dark:text-gray-400" />
                  </div>
                )}
              </div>
              <label className="block">
                <span className="sr-only">Elegir foto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-black dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-700 dark:file:text-blue-400
                    hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30 cursor-pointer"
                />
                <p className="mt-2 text-xs text-black dark:text-gray-500">
                  PNG, JPG, WebP hasta 10MB
                </p>
                {fieldErrors.imagen && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors.imagen}
                  </p>
                )}
              </label>
            </div>
          </div>

          {/* Título */}
          <InputField 
            id="titulo" 
            label="Título / Cargo" 
            required 
            placeholder="Ej: Director de Finanzas"
            
          />

          {/* Nombre */}
          <InputField 
            id="nombre" 
            label="Nombre Completo" 
            required 
            placeholder="Ej: Juan Pérez García"
          />

          {/* Teléfono y Extensión */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField 
              id="telefono" 
              label="Teléfono" 
              placeholder="2494223300"
            />
            <InputField 
              id="extension" 
              label="Extensión" 
              placeholder="120"
            />
          </div>

          {/* Correo */}
          <InputField 
            id="correo" 
            label="Correo Electrónico" 
            type="email"
            placeholder="ejemplo@uttecam.edu.mx"
          />

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  {directorio ? 'Actualizar' : 'Crear'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
