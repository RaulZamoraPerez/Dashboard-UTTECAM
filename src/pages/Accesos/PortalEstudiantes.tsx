import { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { 
  getPortalConfig, 
  updatePortalConfig, 
  uploadPortalImage,
  getImageUrl,
  PortalEstudiantesConfig 
} from '../../services/portalEstudiantesService';
import { toastSuccess, toastError, confirmDialog } from '../../utils/alert';

export default function PortalEstudiantes() {
  const [config, setConfig] = useState<PortalEstudiantesConfig>({
    titulo: 'MI ESCUELA',
    subtitulo: 'UNIVERSIDAD TECNOLÓGICA DE TECAMACHALCO',
    badgeTexto: 'Información importante',
    parrafo1: 'En la Universidad Tecnológica de Tecamachalco se cuenta con un sistema de control escolar que es acorde al modelo educativo de la institución y puede ser consultado por toda la comunidad universitaria.',
    parrafo2: 'El sistema de Control Escolar está disponible los 365 días del año, durante las 24 horas del día y está administrado por el departamento de Servicios Escolares.',
    parrafo3: 'Para ingresar al sistema de control escolar deberás tener tu usuario y contraseña y acceder en el siguiente enlace:',
    imagenUrl: '',
    enlaceBoton: 'http://187.217.125.214/uttecam/acceso.asp',
    textoBoton: 'Acceder al Sistema'
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [previewImagen, setPreviewImagen] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Cargar configuración existente
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoadingData(true);
      const data = await getPortalConfig();
      setConfig(data);
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      setError('Error al cargar la configuración');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (field: keyof PortalEstudiantesConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    // Limpiar errores al editar
    if (error) setError('');
  };

  const validateFields = (): string | null => {
    if (!config.titulo.trim()) {
      return 'El título es requerido';
    }
    if (!config.subtitulo.trim()) {
      return 'El subtítulo es requerido';
    }
    if (!config.badgeTexto.trim()) {
      return 'El texto del badge es requerido';
    }
    if (!config.parrafo1.trim()) {
      return 'El párrafo 1 es requerido';
    }
    if (!config.parrafo2.trim()) {
      return 'El párrafo 2 es requerido';
    }
    if (!config.parrafo3.trim()) {
      return 'El párrafo 3 es requerido';
    }
    if (!config.enlaceBoton.trim()) {
      return 'El enlace del botón es requerido';
    }
    // Validar que el enlace sea una URL válida
    try {
      new URL(config.enlaceBoton);
    } catch {
      return 'El enlace del botón debe ser una URL válida (ejemplo: http://ejemplo.com)';
    }
    if (!config.textoBoton.trim()) {
      return 'El texto del botón es requerido';
    }
    return null;
  };

  const handleImagenChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limpiar errores previos
    setError('');

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      e.target.value = ''; // Limpiar input
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Solo se permiten imágenes (JPG, PNG, GIF, WEBP)');
      e.target.value = ''; // Limpiar input
      return;
    }

    // Validar dimensiones mínimas (opcional)
    const img = new Image();
    img.onload = () => {
      if (img.width < 100 || img.height < 100) {
        setError('La imagen debe tener al menos 100x100 píxeles');
        e.target.value = '';
        setImagenFile(null);
        setPreviewImagen('');
        return;
      }
    };
    
    setImagenFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreviewImagen(result);
      img.src = result;
    };
    reader.onerror = () => {
      setError('Error al leer la imagen');
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    // Validar campos antes de guardar
    const validationError = validateFields();
    if (validationError) {
      toastError(validationError, 'Validación');
      return;
    }

    setLoading(true);
    
    try {
      let imagenUrlToSave = config.imagenUrl;

      // Si hay una imagen nueva, subirla primero
      if (imagenFile) {
        const uploadResult = await uploadPortalImage(imagenFile);
        imagenUrlToSave = uploadResult.imagenUrl;
      }

      // Actualizar configuración
      await updatePortalConfig({
        ...config,
        imagenUrl: imagenUrlToSave
      });

      toastSuccess('La configuración se guardó correctamente', 'Éxito');
      setImagenFile(null);
      setPreviewImagen('');
      
      // Recargar configuración
      await loadConfig();
    } catch (error: any) {
      console.error('Error al guardar:', error);
      toastError(error.message || 'Error al guardar la configuración', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    const confirmed = await confirmDialog({
      title: '¿Restablecer configuración?',
      text: 'Se restablecerán todos los valores a los predeterminados',
      confirmText: 'Sí, restablecer',
      cancelText: 'Cancelar'
    });

    if (!confirmed) return;

    const defaultConfig = {
      titulo: 'MI ESCUELA',
      subtitulo: 'UNIVERSIDAD TECNOLÓGICA DE TECAMACHALCO',
      badgeTexto: 'Información importante',
      parrafo1: 'En la Universidad Tecnológica de Tecamachalco se cuenta con un sistema de control escolar que es acorde al modelo educativo de la institución y puede ser consultado por toda la comunidad universitaria.',
      parrafo2: 'El sistema de Control Escolar está disponible los 365 días del año, durante las 24 horas del día y está administrado por el departamento de Servicios Escolares.',
      parrafo3: 'Para ingresar al sistema de control escolar deberás tener tu usuario y contraseña y acceder en el siguiente enlace:',
      imagenUrl: '',
      enlaceBoton: 'http://187.217.125.214/uttecam/acceso.asp',
      textoBoton: 'Acceder al Sistema'
    };
    
    setConfig(defaultConfig);
    setImagenFile(null);
    setPreviewImagen('');
    
    // Guardar configuración por defecto
    try {
      setLoading(true);
      await updatePortalConfig(defaultConfig);
      toastSuccess('Configuración restablecida correctamente', 'Éxito');
    } catch (error: any) {
      toastError(error.message || 'Error al restablecer la configuración', 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Gestión Portal Estudiantes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configura el contenido que verán los estudiantes en "Mi Escuela"
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de Edición */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Contenido Principal
            </h2>

            {/* Título */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título Principal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={config.titulo}
                onChange={(e) => handleInputChange('titulo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="MI ESCUELA"
                required
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">{config.titulo.length}/200 caracteres</p>
            </div>

            {/* Subtítulo */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subtítulo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={config.subtitulo}
                onChange={(e) => handleInputChange('subtitulo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Universidad Tecnológica de Tecamachalco"
                required
                maxLength={300}
              />
              <p className="text-xs text-gray-500 mt-1">{config.subtitulo.length}/300 caracteres</p>
            </div>

            {/* Badge */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Texto del Badge <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={config.badgeTexto}
                onChange={(e) => handleInputChange('badgeTexto', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Información importante"
                required
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">{config.badgeTexto.length}/100 caracteres</p>
            </div>

            {/* Párrafo 1 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Párrafo 1 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={config.parrafo1}
                onChange={(e) => handleInputChange('parrafo1', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Información sobre el sistema..."
                required
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{config.parrafo1.length}/1000 caracteres</p>
            </div>

            {/* Párrafo 2 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Párrafo 2 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={config.parrafo2}
                onChange={(e) => handleInputChange('parrafo2', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Disponibilidad del sistema..."
                required
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{config.parrafo2.length}/1000 caracteres</p>
            </div>

            {/* Párrafo 3 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Párrafo 3 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={config.parrafo3}
                onChange={(e) => handleInputChange('parrafo3', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Instrucciones de acceso..."
                required
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{config.parrafo3.length}/1000 caracteres</p>
            </div>
          </div>

          {/* Panel de Imagen y Botón */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Imagen y Acceso
            </h2>

            {/* Imagen */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Imagen de Vista Previa (Opcional)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Formatos: JPG, PNG, GIF, WEBP | Tamaño máximo: 5MB | Dimensiones mínimas: 100x100px
              </p>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer transition-colors">
                  <Camera className="w-4 h-4" />
                  Subir Imagen
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImagenChange}
                    className="hidden"
                  />
                </label>
                {imagenFile && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {imagenFile.name}
                  </span>
                )}
              </div>
              {previewImagen && (
                <div className="mt-3">
                  <img
                    src={previewImagen}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-md border border-gray-300 dark:border-gray-600"
                  />
                </div>
              )}
            </div>

            {/* Enlace del Botón */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enlace del Botón <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={config.enlaceBoton}
                onChange={(e) => handleInputChange('enlaceBoton', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="http://ejemplo.com"
                required
                pattern="https?://.+"
              />
              <p className="text-xs text-gray-500 mt-1">Debe ser una URL válida (ejemplo: http://ejemplo.com)</p>
            </div>

            {/* Texto del Botón */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Texto del Botón <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={config.textoBoton}
                onChange={(e) => handleInputChange('textoBoton', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Acceder al Sistema"
                required
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">{config.textoBoton.length}/100 caracteres</p>
            </div>
          </div>
        </div>

        {/* Panel de Vista Previa */}
        <div className="lg:sticky lg:top-6 h-fit">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Vista Previa
            </h2>
            
            {/* Preview del contenido */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
              <div className="max-w-2xl mx-auto">
                {/* Título */}
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold text-amber-800 dark:text-amber-500 mb-2">
                    {config.titulo}
                  </h1>
                  <h2 className="text-xl text-gray-700 dark:text-gray-300 font-light">
                    {config.subtitulo}
                  </h2>
                  <div className="mt-3 h-1 w-24 bg-amber-600 rounded-full mx-auto"></div>
                </div>

                {/* Badge */}
                <div className="text-center mb-4">
                  <span className="inline-block bg-amber-700 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {config.badgeTexto}
                  </span>
                </div>

                {/* Párrafos */}
                <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                  <p className="text-center">{config.parrafo1}</p>
                  <div className="flex justify-center">
                    <div className="h-px bg-amber-200 w-16"></div>
                  </div>
                  <p className="text-center">{config.parrafo2}</p>
                  <div className="flex justify-center">
                    <div className="h-px bg-amber-200 w-16"></div>
                  </div>
                  <p className="text-center">{config.parrafo3}</p>
                </div>

                {/* Imagen Preview */}
                {(previewImagen || config.imagenUrl) ? (
                  <div className="my-4">
                    <img
                      src={previewImagen || getImageUrl(config.imagenUrl)}
                      alt="Vista previa del sistema"
                      className="w-full h-32 object-cover rounded-lg border shadow-sm"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="my-4 w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <p className="text-xs text-gray-400">Sin imagen</p>
                  </div>
                )}

                {/* Botón */}
                <div className="text-center mt-4">
                  <button className="bg-amber-600 text-white font-semibold py-2 px-6 rounded-lg text-sm shadow-md">
                    {config.textoBoton}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
              Esta es una representación simplificada de cómo se verá en el sitio público
            </p>
          </div>
        </div>
      </div>

      {/* Botones de acción centrados */}
      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-[#009883] hover:bg-[#007a6b] text-white px-8 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-medium"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Guardar Cambios</span>
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          disabled={loading}
          className="flex items-center gap-2 bg-[#e17100] hover:bg-[#b35a00] text-white px-8 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Restablecer</span>
        </button>
      </div>
    </div>
  );
}
