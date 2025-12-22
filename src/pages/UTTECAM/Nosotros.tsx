// pages/UTTECAM/Nosotros.tsx
import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { useNosotros } from "../../hooks/useNosotros";
import { SectionKey, ImageSectionKey, Vision, Mision, Valores, UpdateSectionRequest } from "../../types/nosotros";
import { getImageUrl } from "../../services/nosotrosService";

export default function Nosotros() {
  const { content, loading, error, updateSection, uploadImage } = useNosotros();
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null);
  const [editData, setEditData] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);
  const [imageLoading, setImageLoading] = useState<{[key: string]: boolean}>({
    politicaIntegral: true,
    vision: true,
    mision: true,
    valores: true
  });
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({
    politicaIntegral: false,
    vision: false,
    mision: false,
    valores: false
  });
  const [selectedFiles, setSelectedFiles] = useState<{[key: string]: File | null}>({
    politicaIntegral: null,
    vision: null,
    mision: null,
    valores: null
  });
  const [imagePreviews, setImagePreviews] = useState<{[key: string]: string | null}>({
    politicaIntegral: null,
    vision: null,
    mision: null,
    valores: null
  });
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    imageSrc: string | null;
    alt: string;
  }>({
    isOpen: false,
    imageSrc: null,
    alt: ''
  });
  const [fileInputRefs, setFileInputRefs] = useState<{[key: string]: HTMLInputElement | null}>({
    politicaIntegral: null,
    vision: null,
    mision: null,
    valores: null
  });

  const handleImageClick = (section: string) => {
    const fileInput = fileInputRefs[section];
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleEdit = (section: SectionKey, data: unknown) => {
    setEditingSection(section);
    setEditData(data);
  };

  const handleSave = async () => {
    if (!editingSection || !editData) return;

    setSaving(true);

    try {
      const selectedFile = selectedFiles[editingSection];
      
      if (selectedFile) {
        // Verificar que la sección soporte subida de imágenes
        const imageSections: ImageSectionKey[] = ['politicaIntegral', 'vision', 'mision', 'valores'];
        if (!imageSections.includes(editingSection as ImageSectionKey)) {
          alert('Esta sección no soporta subida de imágenes.');
          return;
        }
        
        // Si hay un archivo seleccionado, subir la imagen
        const success = await uploadImage(editingSection as ImageSectionKey, selectedFile, editData as UpdateSectionRequest);
        if (success) {
          setEditingSection(null);
          setEditData(null);
          // Limpiar el archivo seleccionado
          setSelectedFiles(prev => ({ ...prev, [editingSection]: null }));
          setImagePreviews(prev => ({ ...prev, [editingSection]: null }));
        } else {
          alert('Error al subir la imagen. Verifique que el archivo sea válido y que el backend esté funcionando correctamente.');
        }
      } else {
        // Si no hay archivo, actualizar solo los datos de texto
        const success = await updateSection(editingSection, editData as UpdateSectionRequest);
        if (success) {
          setEditingSection(null);
          setEditData(null);
        } else {
          alert('Error al guardar los cambios');
        }
      }
    } catch {
      alert('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditData(null);
    // Limpiar archivos seleccionados y vistas previas
    if (editingSection) {
      setSelectedFiles(prev => ({ ...prev, [editingSection]: null }));
      setImagePreviews(prev => ({ ...prev, [editingSection]: null }));
    }
  };

  const handleFileSelect = (section: string, file: File | null) => {
    setSelectedFiles(prev => ({ ...prev, [section]: file }));
    
    if (file) {
      // Crear vista previa de la imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => ({ 
          ...prev, 
          [section]: e.target?.result as string 
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreviews(prev => ({ ...prev, [section]: null }));
    }
  };

  const handleDisplayedImageClick = (imageSrc: string, alt: string) => {
    setImageModal({
      isOpen: true,
      imageSrc,
      alt
    });
  };

  const closeImageModal = () => {
    setImageModal({
      isOpen: false,
      imageSrc: null,
      alt: ''
    });
  };

  const handleImageLoad = (section: string) => {
    setImageLoading(prev => ({ ...prev, [section]: false }));
    setImageErrors(prev => ({ ...prev, [section]: false }));
  };

  const handleImageError = (section: string, retryCount = 0) => {
    const maxRetries = 2;

    setImageLoading(prev => ({ ...prev, [section]: false }));

    // Si es un error de CORS o conexión, no reintentar automáticamente
    // Simplemente mostrar el error inmediatamente
    if (retryCount === 0) {
      console.warn(`Error al cargar imagen para ${section} - posible problema de CORS o backend no disponible`);
      setImageErrors(prev => ({ ...prev, [section]: true }));
      return;
    }

    if (retryCount < maxRetries) {
      // Intentar recargar la imagen después de un pequeño delay
      setTimeout(() => {
        console.log(`Reintentando carga de imagen para ${section} (intento ${retryCount + 1})`);
        setImageLoading(prev => ({ ...prev, [section]: true }));
        // Forzar recarga cambiando un parámetro de query
        const imgElement = document.querySelector(`img[alt*="${section}"]`) as HTMLImageElement;
        if (imgElement) {
          const currentSrc = imgElement.src;
          const separator = currentSrc.includes('?') ? '&' : '?';
          imgElement.src = `${currentSrc}${separator}t=${Date.now()}`;
        }
      }, 1000 * (retryCount + 1)); // Delay progresivo: 1s, 2s
    } else {
      // Máximo de reintentos alcanzado, mostrar error
      setImageErrors(prev => ({ ...prev, [section]: true }));
      console.error(`Error al cargar imagen para ${section} después de ${maxRetries} reintentos`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando contenido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <div className="space-x-2">
            <Button onClick={() => window.location.reload()}>Reintentar</Button>
            <Button variant="outline" onClick={() => window.history.back()}>Volver</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">No se pudo cargar el contenido</p>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Nosotros - Universidad Tecnológica de Tecamachalco"
        description="Conoce nuestra visión, misión, valores y políticas institucionales"
      />
      <PageBreadcrumb pageTitle="Nosotros" />

      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Guardando cambios...</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Política Integral */}
        <ComponentCard title="POLÍTICA INTEGRAL">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {editingSection === 'politicaIntegral' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      value={(editData as Vision)?.title || ''}
                      onChange={(e) => setEditData({ ...(editData as Vision), title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={(editData as Vision)?.description || ''}
                      onChange={(e) => setEditData({ ...(editData as Vision), description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imagen
                    </label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      onClick={() => handleImageClick('politicaIntegral')}
                    >
                      {imagePreviews.politicaIntegral ? (
                        <div className="space-y-2">
                          <img 
                            src={imagePreviews.politicaIntegral} 
                            alt="Vista previa" 
                            className="w-32 h-32 object-cover rounded-md mx-auto border border-gray-300"
                          />
                          <p className="text-sm text-gray-600">Haz clic para cambiar la imagen</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="text-sm text-gray-600">Haz clic para seleccionar una imagen</p>
                          <p className="text-xs text-gray-400">PNG, JPG, WebP, AVIF hasta 10MB</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={(el) => {
                        if (fileInputRefs.politicaIntegral !== el) {
                          setFileInputRefs(prev => ({ ...prev, politicaIntegral: el }));
                        }
                      }}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect('politicaIntegral', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm">Guardar</Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">Cancelar</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {content.politicaIntegral?.title && content.politicaIntegral.title.trim() !== '' ? content.politicaIntegral.title : 'POLÍTICA INTEGRAL'}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {content.politicaIntegral?.description && content.politicaIntegral.description.trim() !== '' ? content.politicaIntegral.description : 'Contenido no disponible'}
                  </p>
                  <Button
                    onClick={() => handleEdit('politicaIntegral', content.politicaIntegral || {})}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    Editar
                  </Button>
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <div className="relative">
                {imageLoading.politicaIntegral && !imageErrors.politicaIntegral && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                )}
                {imageErrors.politicaIntegral && (
                  <div className="flex items-center justify-center bg-red-50 rounded-lg border-2 border-red-200 p-8">
                    <div className="text-center">
                      <svg className="mx-auto h-16 w-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <h3 className="text-lg font-medium text-red-800 mb-2">Imagen no disponible</h3>
                      <p className="text-sm text-red-600 mb-4">No se pudo cargar la imagen. Verifique que el backend esté ejecutándose en localhost:3004 y tenga CORS configurado correctamente.</p>
                      <button
                        onClick={() => {
                          setImageErrors(prev => ({ ...prev, politicaIntegral: false }));
                          setImageLoading(prev => ({ ...prev, politicaIntegral: true }));
                          handleImageError('politicaIntegral', 0);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Intentar nuevamente
                      </button>
                    </div>
                  </div>
                )}
                <img
                  src={getImageUrl(content.politicaIntegral?.imageSrc)}
                  alt="Política Integral"
                  className={`w-full max-w-md h-auto rounded-lg shadow-md cursor-pointer hover:opacity-80 transition-opacity ${imageErrors.politicaIntegral ? 'opacity-25' : ''}`}
                  onLoad={() => handleImageLoad('politicaIntegral')}
                  onError={() => handleImageError('politicaIntegral', 0)}
                  onClick={() => handleDisplayedImageClick(getImageUrl(content.politicaIntegral?.imageSrc), 'Política Integral')}
                  style={{ display: imageErrors.politicaIntegral ? 'none' : 'block' }}
                />
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Objetivo Integral */}
        <ComponentCard title="OBJETIVO INTEGRAL">
          <div>
            {editingSection === 'objetivoIntegral' ? (
              <div className="space-y-4">
                <textarea
                  value={(editData as string) || ''}
                  onChange={(e) => setEditData(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingrese el objetivo integral..."
                />
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm">Guardar</Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">Cancelar</Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {content.objetivoIntegral && content.objetivoIntegral.trim() !== '' ? content.objetivoIntegral : 'Contenido no disponible'}
                </p>
                <Button
                  onClick={() => handleEdit('objetivoIntegral', content.objetivoIntegral || '')}
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Editar
                </Button>
              </div>
            )}
          </div>
        </ComponentCard>

        {/* Visión */}
        <ComponentCard title="VISIÓN">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {editingSection === 'vision' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      value={(editData as Vision)?.title || ''}
                      onChange={(e) => setEditData({ ...(editData as Vision), title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={(editData as Vision)?.description || ''}
                      onChange={(e) => setEditData({ ...(editData as Vision), description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imagen
                    </label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      onClick={() => handleImageClick('vision')}
                    >
                      {imagePreviews.vision ? (
                        <div className="space-y-2">
                          <img 
                            src={imagePreviews.vision} 
                            alt="Vista previa" 
                            className="w-32 h-32 object-cover rounded-md mx-auto border border-gray-300"
                          />
                          <p className="text-sm text-gray-600">Haz clic para cambiar la imagen</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="text-sm text-gray-600">Haz clic para seleccionar una imagen</p>
                          <p className="text-xs text-gray-400">PNG, JPG, WebP, AVIF hasta 10MB</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={(el) => {
                        if (fileInputRefs.vision !== el) {
                          setFileInputRefs(prev => ({ ...prev, vision: el }));
                        }
                      }}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect('vision', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm">Guardar</Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">Cancelar</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {content.vision?.title && content.vision.title.trim() !== '' ? content.vision.title : 'VISIÓN'}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {content.vision?.description && content.vision.description.trim() !== '' ? content.vision.description : 'Contenido no disponible'}
                  </p>
                  <Button
                    onClick={() => handleEdit('vision', content.vision || {})}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    Editar
                  </Button>
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <div className="relative">
                {imageLoading.vision && !imageErrors.vision && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                )}
                {imageErrors.vision && (
                  <div className="flex items-center justify-center bg-red-50 rounded-lg border-2 border-red-200 p-8">
                    <div className="text-center">
                      <svg className="mx-auto h-16 w-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <h3 className="text-lg font-medium text-red-800 mb-2">Imagen no disponible</h3>
                      <p className="text-sm text-red-600 mb-4">No se pudo cargar la imagen. Verifique que el backend esté ejecutándose en localhost:3004 y tenga CORS configurado correctamente.</p>
                      <button
                        onClick={() => {
                          setImageErrors(prev => ({ ...prev, vision: false }));
                          setImageLoading(prev => ({ ...prev, vision: true }));
                          handleImageError('vision', 0);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Intentar nuevamente
                      </button>
                    </div>
                  </div>
                )}
                <img
                  src={getImageUrl(content.vision?.imageSrc)}
                  alt="Visión"
                  className={`w-full max-w-md h-auto rounded-lg shadow-md cursor-pointer hover:opacity-80 transition-opacity ${imageErrors.vision ? 'opacity-25' : ''}`}
                  onLoad={() => handleImageLoad('vision')}
                  onError={() => handleImageError('vision', 0)}
                  onClick={() => handleDisplayedImageClick(getImageUrl(content.vision?.imageSrc), 'Visión')}
                  style={{ display: imageErrors.vision ? 'none' : 'block' }}
                />
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Misión */}
        <ComponentCard title="MISIÓN">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {editingSection === 'mision' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      value={(editData as Mision)?.title || ''}
                      onChange={(e) => setEditData({ ...(editData as Mision), title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={(editData as Mision)?.description || ''}
                      onChange={(e) => setEditData({ ...(editData as Mision), description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imagen
                    </label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      onClick={() => handleImageClick('mision')}
                    >
                      {imagePreviews.mision ? (
                        <div className="space-y-2">
                          <img 
                            src={imagePreviews.mision} 
                            alt="Vista previa" 
                            className="w-32 h-32 object-cover rounded-md mx-auto border border-gray-300"
                          />
                          <p className="text-sm text-gray-600">Haz clic para cambiar la imagen</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="text-sm text-gray-600">Haz clic para seleccionar una imagen</p>
                          <p className="text-xs text-gray-400">PNG, JPG, WebP, AVIF hasta 10MB</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={(el) => {
                        if (fileInputRefs.mision !== el) {
                          setFileInputRefs(prev => ({ ...prev, mision: el }));
                        }
                      }}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect('mision', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm">Guardar</Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">Cancelar</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {content.mision?.title && content.mision.title.trim() !== '' ? content.mision.title : 'MISIÓN'}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {content.mision?.description && content.mision.description.trim() !== '' ? content.mision.description : 'Contenido no disponible'}
                  </p>
                  <Button
                    onClick={() => handleEdit('mision', content.mision || {})}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    Editar
                  </Button>
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <div className="relative">
                {imageLoading.mission && !imageErrors.mission && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                )}
                {imageErrors.mision && (
                  <div className="flex items-center justify-center bg-red-50 rounded-lg border-2 border-red-200 p-8">
                    <div className="text-center">
                      <svg className="mx-auto h-16 w-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <h3 className="text-lg font-medium text-red-800 mb-2">Imagen no disponible</h3>
                      <p className="text-sm text-red-600 mb-4">No se pudo cargar la imagen. Verifique que el backend esté ejecutándose en localhost:3004 y tenga CORS configurado correctamente.</p>
                      <button
                        onClick={() => {
                          setImageErrors(prev => ({ ...prev, mision: false }));
                          setImageLoading(prev => ({ ...prev, mision: true }));
                          handleImageError('mision', 0);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Intentar nuevamente
                      </button>
                    </div>
                  </div>
                )}
                <img
                  src={getImageUrl(content.mision?.imageSrc)}
                  alt="Misión"
                  className={`w-full max-w-md h-auto rounded-lg shadow-md cursor-pointer hover:opacity-80 transition-opacity ${imageErrors.mision ? 'opacity-25' : ''}`}
                  onLoad={() => handleImageLoad('mision')}
                  onError={() => handleImageError('mision', 0)}
                  onClick={() => handleDisplayedImageClick(getImageUrl(content.mision?.imageSrc), 'Misión')}
                  style={{ display: imageErrors.mision ? 'none' : 'block' }}
                />
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Valores */}
        <ComponentCard title="VALORES">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {editingSection === 'valores' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      value={(editData as Valores)?.title || ''}
                      onChange={(e) => setEditData({ ...(editData as Valores), title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valores (uno por línea)
                    </label>
                    <textarea
                      value={(editData as Valores)?.description?.join('\n') || ''}
                      onChange={(e) => setEditData({
                        ...(editData as Valores),
                        description: e.target.value.split('\n').filter(v => v.trim())
                      })}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Valor 1&#10;Valor 2&#10;Valor 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imagen
                    </label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      onClick={() => handleImageClick('valores')}
                    >
                      {imagePreviews.valores ? (
                        <div className="space-y-2">
                          <img 
                            src={imagePreviews.valores} 
                            alt="Vista previa" 
                            className="w-32 h-32 object-cover rounded-md mx-auto border border-gray-300"
                          />
                          <p className="text-sm text-gray-600">Haz clic para cambiar la imagen</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="text-sm text-gray-600">Haz clic para seleccionar una imagen</p>
                          <p className="text-xs text-gray-400">PNG, JPG, WebP, AVIF hasta 10MB</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={(el) => {
                        if (fileInputRefs.valores !== el) {
                          setFileInputRefs(prev => ({ ...prev, valores: el }));
                        }
                      }}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect('valores', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm">Guardar</Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">Cancelar</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {content.valores?.title && content.valores.title.trim() !== '' ? content.valores.title : 'VALORES'}
                  </h3>
                  <ul className="space-y-2">
                    {content.valores?.description && content.valores.description.length > 0 ? (
                      content.valores.description.map((valor, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700">{valor}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">Contenido no disponible</li>
                    )}
                  </ul>
                  <Button
                    onClick={() => handleEdit('valores', content.valores || {})}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    Editar
                  </Button>
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <div className="relative">
                {imageLoading.valores && !imageErrors.valores && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                )}
                {imageErrors.valores && (
                  <div className="flex items-center justify-center bg-red-50 rounded-lg border-2 border-red-200 p-8">
                    <div className="text-center">
                      <svg className="mx-auto h-16 w-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <h3 className="text-lg font-medium text-red-800 mb-2">Imagen no disponible</h3>
                      <p className="text-sm text-red-600 mb-4">No se pudo cargar la imagen. Verifique que el backend esté ejecutándose en localhost:3004 y tenga CORS configurado correctamente.</p>
                      <button
                        onClick={() => {
                          setImageErrors(prev => ({ ...prev, valores: false }));
                          setImageLoading(prev => ({ ...prev, valores: true }));
                          handleImageError('valores', 0);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Intentar nuevamente
                      </button>
                    </div>
                  </div>
                )}
                <img
                  src={getImageUrl(content.valores?.imageSrc)}
                  alt="Valores"
                  className={`w-full max-w-md h-auto rounded-lg shadow-md cursor-pointer hover:opacity-80 transition-opacity ${imageErrors.valores ? 'opacity-25' : ''}`}
                  onLoad={() => handleImageLoad('valores')}
                  onError={() => handleImageError('valores', 0)}
                  onClick={() => handleDisplayedImageClick(getImageUrl(content.valores?.imageSrc), 'Valores')}
                  style={{ display: imageErrors.valores ? 'none' : 'block' }}
                />
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Política de No Discriminación */}
        <ComponentCard title="POLÍTICA DE NO DISCRIMINACIÓN">
          <div>
            {editingSection === 'noDiscriminacion' ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-2">
                  Ingrese las categorías de no discriminación (una por línea, separadas por comas para subcategorías)
                </p>
                <textarea
                  value={Array.isArray(editData) ? editData.map((row: string[]) => row.join(', ')).join('\n') : ''}
                  onChange={(e) => {
                    const rows = e.target.value.split('\n').map(row =>
                      row.split(',').map(item => item.trim()).filter(item => item)
                    ).filter(row => row.length > 0);
                    setEditData(rows);
                  }}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Categoría 1, Subcategoría 1, Subcategoría 2&#10;Categoría 2, Subcategoría 1"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm">Guardar</Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">Cancelar</Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.isArray(content.noDiscriminacion) && content.noDiscriminacion.length > 0 ? (
                    content.noDiscriminacion.map((categoria, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {categoria[0]}
                        </h4>
                        {categoria.slice(1).length > 0 && (
                          <ul className="space-y-1">
                            {categoria.slice(1).map((subcategoria, subIndex) => (
                              <li key={subIndex} className="text-sm text-gray-700 flex items-start">
                                <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {subcategoria}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">Contenido no disponible</p>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => handleEdit('noDiscriminacion', Array.isArray(content.noDiscriminacion) ? content.noDiscriminacion : [])}
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Editar
                </Button>
              </div>
            )}
          </div>
        </ComponentCard>
      </div>

      {/* Modal para mostrar imagen ampliada */}
      {imageModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeImageModal}>
          <div className="relative max-w-4xl max-h-screen p-4">
            <img
              src={imageModal.imageSrc || ''}
              alt={imageModal.alt}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}