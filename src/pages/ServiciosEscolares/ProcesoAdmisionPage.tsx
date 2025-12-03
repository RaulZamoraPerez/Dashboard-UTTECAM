import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { confirmDialog, toastSuccess, toastError } from '../../utils/alert';
import ComponentCard from '../../components/common/ComponentCard';
import { 
  createProcesoAdmision, 
  updateProcesoAdmision, 
  deleteProcesoAdmision,
  getProcesoAdmisionList
} from '../../services/procesoAdmisionService';

interface ConvocatoriaAdmision {
  id: string;
  titulo: string;
  subtitulo: string;
  archivoNombre: string;
  archivoBase64?: string;
  archivoMimeType?: string;
}

interface FormData {
  titulo: string;
  subtitulo: string;
  archivoImagen: File | null;
}

// Constantes de validación
const VALIDATION = {
  titulo: {
    min: 5,
    max: 150,
  },
  subtitulo: {
    min: 5,
    max: 200,
  },
};

export default function ProcesoAdmisionPage() {
  const [convocatorias, setConvocatorias] = useState<ConvocatoriaAdmision[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formErrors, setFormErrors] = useState<{ titulo?: string; subtitulo?: string; archivo?: string }>({});
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    subtitulo: '',
    archivoImagen: null,
  });

  // Cargar convocatorias al montar el componente
  useEffect(() => {
    const fetchConvocatorias = async () => {
      try {
        setIsLoadingData(true);
        const response = await getProcesoAdmisionList();
        
        // El backend puede devolver un objeto único o un array
        const dataArray = Array.isArray(response) ? response : [response];
        
        // Filtrar elementos válidos (que tengan id)
        const validData = dataArray.filter(item => item && item.id);
        
        // Mapear los datos del backend al formato del componente
        const mappedData: ConvocatoriaAdmision[] = validData.map(item => ({
          id: item.id,
          titulo: item.titulo,
          subtitulo: item.subtitulo,
          archivoNombre: item.archivo?.nombre || '',
          archivoBase64: item.archivo?.base64,
          archivoMimeType: item.archivo?.mimeType,
        }));
        
        setConvocatorias(mappedData);
      } catch (error) {
        // Solo mostrar error si no es un 404 (sin datos)
        console.error('Error al cargar convocatorias:', error);
        // No mostrar toast de error en la carga inicial
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchConvocatorias();
  }, []);

  // Limpiar error de un campo específico cuando el usuario escribe
  const clearFieldError = (field: 'titulo' | 'subtitulo' | 'archivo') => {
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFormData(prev => ({
        ...prev,
        archivoImagen: file,
      }));
      clearFieldError('archivo');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      subtitulo: '',
      archivoImagen: null,
    });
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario y obtener errores
    const errors: { titulo?: string; subtitulo?: string; archivo?: string } = {};
    
    // Validar título
    const tituloLength = formData.titulo.trim().length;
    if (!formData.titulo.trim()) {
      errors.titulo = 'El título es obligatorio';
    } else if (tituloLength < VALIDATION.titulo.min) {
      errors.titulo = `El título debe tener al menos ${VALIDATION.titulo.min} caracteres`;
    } else if (tituloLength > VALIDATION.titulo.max) {
      errors.titulo = `El título no puede exceder ${VALIDATION.titulo.max} caracteres`;
    }
    
    // Validar subtítulo
    const subtituloLength = formData.subtitulo.trim().length;
    if (!formData.subtitulo.trim()) {
      errors.subtitulo = 'El subtítulo es obligatorio';
    } else if (subtituloLength < VALIDATION.subtitulo.min) {
      errors.subtitulo = `El subtítulo debe tener al menos ${VALIDATION.subtitulo.min} caracteres`;
    } else if (subtituloLength > VALIDATION.subtitulo.max) {
      errors.subtitulo = `El subtítulo no puede exceder ${VALIDATION.subtitulo.max} caracteres`;
    }
    
    // Validar imagen (solo requerida al crear)
    if (!editingId && !formData.archivoImagen) {
      errors.archivo = 'Debes seleccionar una imagen';
    }
    
    // Si hay errores, mostrarlos y detener
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstError = errors.titulo || errors.subtitulo || errors.archivo;
      if (firstError) {
        toastError(firstError);
      }
      return;
    }

    setIsLoading(true);

    try {
      if (editingId) {
        // Actualizar convocatoria existente
        const response = await updateProcesoAdmision(editingId, {
          titulo: formData.titulo.trim(),
          subtitulo: formData.subtitulo.trim(),
          attachment: formData.archivoImagen || undefined,
        });

        const updatedConvocatoria: ConvocatoriaAdmision = {
          id: response.data.id,
          titulo: response.data.titulo,
          subtitulo: response.data.subtitulo,
          archivoNombre: response.data.archivo?.nombre || '',
        };

        setConvocatorias(prev => prev.map(c => c.id === editingId ? updatedConvocatoria : c));
        toastSuccess('Convocatoria actualizada correctamente');
      } else {
        // Crear nueva convocatoria
        const response = await createProcesoAdmision({
          titulo: formData.titulo.trim(),
          subtitulo: formData.subtitulo.trim(),
          attachment: formData.archivoImagen!,
        });

        const newConvocatoria: ConvocatoriaAdmision = {
          id: response.data.id,
          titulo: response.data.titulo,
          subtitulo: response.data.subtitulo,
          archivoNombre: response.data.archivo?.nombre || '',
        };

        setConvocatorias(prev => [...prev, newConvocatoria]);
        toastSuccess('Convocatoria creada correctamente');
      }

      setIsEditing(false);
      setEditingId(null);
      resetForm();
    } catch (error) {
      if (error instanceof Error) {
        toastError(error.message);
      } else {
        toastError('Ocurrió un error al guardar la convocatoria');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (convocatoria: ConvocatoriaAdmision) => {
    setFormData({
      titulo: convocatoria.titulo,
      subtitulo: convocatoria.subtitulo,
      archivoImagen: null, // El archivo no se precarga, el usuario debe seleccionar uno nuevo si quiere cambiarlo
    });
    setEditingId(convocatoria.id);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDialog({ 
      title: 'Eliminar convocatoria', 
      text: '¿Estás seguro de que deseas eliminar esta convocatoria de admisión?' 
    });
    if (!confirmed) return;
    
    setIsLoading(true);
    try {
      await deleteProcesoAdmision(id);
      setConvocatorias(prev => prev.filter(c => c.id !== id));
      toastSuccess('Convocatoria eliminada correctamente');
    } catch (error) {
      if (error instanceof Error) {
        toastError(error.message);
      } else {
        toastError('Ocurrió un error al eliminar la convocatoria');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <ComponentCard
        title="Convocatoria de Admisión"
        desc="Gestiona la información y documentos de la convocatoria de admisión que se mostrará en la página principal"
      >
        {/* Header con botón de nuevo */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              El periodo de registro e inscripción de los aspirantes a ingresar a la Universidad Tecnológica de Tecamachalco, 
              se encuentra publicado a través de la Convocatoria de admisión.
            </p>
          </div>
        </div>

        {/* Formulario */}
        {isEditing && (
          <div className="mb-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-6">
            <h5 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
              {editingId ? 'Editar Convocatoria' : 'Nueva Convocatoria de Admisión'}
            </h5>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Título de la Convocatoria *
                  <span className="text-gray-400 text-xs ml-2">({formData.titulo.length}/{VALIDATION.titulo.max})</span>
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, titulo: e.target.value }));
                    clearFieldError('titulo');
                  }}
                  placeholder="Ej: Convocatoria de Admisión 2025"
                  maxLength={VALIDATION.titulo.max}
                  className={`w-full h-11 rounded-lg border bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-theme-xs focus:outline-none focus:ring-3 transition-all ${
                    formErrors.titulo 
                      ? 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-300 dark:border-gray-700 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800'
                  }`}
                />
                {formErrors.titulo && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
                    </svg>
                    {formErrors.titulo}
                  </p>
                )}
              </div>

              {/* Subtítulo */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subtítulo *
                  <span className="text-gray-400 text-xs ml-2">({formData.subtitulo.length}/{VALIDATION.subtitulo.max})</span>
                </label>
                <textarea
                  value={formData.subtitulo}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, subtitulo: e.target.value }));
                    clearFieldError('subtitulo');
                  }}
                  placeholder="Describe los detalles de la convocatoria, requisitos, fechas importantes..."
                  rows={5}
                  maxLength={VALIDATION.subtitulo.max}
                  className={`w-full rounded-lg border bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-theme-xs focus:outline-none focus:ring-3 transition-all ${
                    formErrors.subtitulo 
                      ? 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-300 dark:border-gray-700 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800'
                  }`}
                />
                {formErrors.subtitulo && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
                    </svg>
                    {formErrors.subtitulo}
                  </p>
                )}
              </div>

              {/* Dropzone para Imagen */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Imagen de la Convocatoria {!editingId && '*'}
                  {editingId && <span className="text-gray-400 text-xs ml-1">(Opcional - solo si deseas cambiar la imagen)</span>}
                </label>
                
                <div className={`border-2 border-dashed rounded-xl transition-colors ${
                  formErrors.archivo 
                    ? 'border-red-500 dark:border-red-500 hover:border-red-400' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-brand-500 dark:hover:border-brand-500'
                }`}>
                  <div
                    {...getRootProps()}
                    className={`dropzone rounded-xl p-7 lg:p-10 cursor-pointer transition-all duration-200
                      ${isDragActive 
                        ? "border-brand-500 bg-gray-100 dark:bg-gray-800" 
                        : "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                      }`}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center text-center">
                      {/* Icon Container */}
                      <div className="mb-4 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-400">
                          <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                            <path d="M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19M19,19H5V5H19V19M13.96,12.29L11.21,15.83L9.25,13.47L6.5,17H17.5L13.96,12.29Z" />
                          </svg>
                        </div>
                      </div>

                      {/* Text Content */}
                      <h4 className="mb-3 font-semibold text-gray-800 dark:text-white text-lg">
                        {isDragActive ? "Suelta la imagen aquí" : "Arrastra tu imagen aquí"}
                      </h4>

                      <span className="text-center mb-5 block w-full max-w-[290px] text-sm text-gray-600 dark:text-gray-400">
                        Arrastra y suelta tu imagen aquí o haz clic para buscar
                      </span>

                      <span className="font-medium text-sm text-brand-500 underline">
                        Buscar Archivo
                      </span>

                      <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                        JPG, JPEG, PNG (máx. 10MB)
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Error de archivo */}
                {formErrors.archivo && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
                    </svg>
                    {formErrors.archivo}
                  </p>
                )}
                
                {/* Preview del archivo seleccionado */}
                {formData.archivoImagen && (
                  <div className="mt-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19M19,19H5V5H19V19M13.96,12.29L11.21,15.83L9.25,13.47L6.5,17H17.5L13.96,12.29Z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white truncate max-w-xs">
                            {formData.archivoImagen.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(formData.archivoImagen.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, archivoImagen: null }))}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Eliminar imagen"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={isLoading || !formData.titulo || !formData.subtitulo || (!editingId && !formData.archivoImagen)}
                  className="flex-1 sm:flex-initial justify-center rounded-lg bg-brand-500 hover:bg-brand-600 py-3 px-8 font-medium text-white shadow-theme-xs hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-5 h-5 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                      </svg>
                      {editingId ? 'Actualizar' : 'Guardar'} Convocatoria
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 sm:flex-initial justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-3 px-8 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-lg transition-all duration-200"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de convocatorias */}
        {!isLoadingData && convocatorias.length > 0 && (
          <div>
            <h5 className="text-base font-medium text-gray-800 dark:text-white mb-4">
              Convocatorias Registradas ({convocatorias.length})
            </h5>
            
            <div className="space-y-4">
              {convocatorias.map((convocatoria) => (
                <div 
                  key={convocatoria.id} 
                  className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Información */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex-shrink-0">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19M19,19H5V5H19V19M13.96,12.29L11.21,15.83L9.25,13.47L6.5,17H17.5L13.96,12.29Z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h6 className="font-semibold text-gray-800 dark:text-white">
                            {convocatoria.titulo}
                          </h6>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {convocatoria.subtitulo}
                          </p>
                          {convocatoria.archivoNombre && (
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19M19,19H5V5H19V19M13.96,12.29L11.21,15.83L9.25,13.47L6.5,17H17.5L13.96,12.29Z" />
                                </svg>
                                {convocatoria.archivoNombre}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Acciones */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(convocatoria)}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-900/50 transition-colors"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleDelete(convocatoria.id)}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado de carga */}
        {isLoadingData && (
          <div className="text-center py-16">
            <div className="mb-6">
              <svg className="animate-spin w-12 h-12 mx-auto text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Cargando convocatorias...</p>
          </div>
        )}

        {/* Estado vacío */}
        {!isLoadingData && convocatorias.length === 0 && !isEditing && (
          <div className="text-center py-16">
            <div className="mb-6">
              <svg className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19M19,19H5V5H19V19M13.96,12.29L11.21,15.83L9.25,13.47L6.5,17H17.5L13.96,12.29Z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
              No hay convocatorias registradas
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Crea la primera convocatoria de admisión con el título, descripción e imagen correspondiente.
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 py-4 px-8 font-medium text-white shadow-theme-xs hover:shadow-lg transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
              Crear Primera Convocatoria
            </button>
          </div>
        )}
      </ComponentCard>
    </div>
  );
}
