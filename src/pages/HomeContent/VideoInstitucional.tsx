import { useState, useEffect } from 'react';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { videoInstitucionalApi, VideoInstitucional } from '../../services/videoInstitucionalApi';

const VideoInstitucionalAdmin = () => {
  const [config, setConfig] = useState<VideoInstitucional>({
    titulo: '',
    descripcion: '',
    urlVideo: '',
    thumbnailUrl: '',
    duracion: 0,
    activo: true,
    mostrarControles: true,
    autoplay: false,
    loop: false,
    volumen: 50
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [videoId, setVideoId] = useState<number | null>(null);

  // Cargar configuración existente al montar el componente
  useEffect(() => {
    loadVideoConfig();
  }, []);

  const loadVideoConfig = async () => {
    try {
      const videoData = await videoInstitucionalApi.getActive();
      setConfig(videoData);
      setVideoId(videoData.id || null);
    } catch (error) {
      console.error('Error al cargar configuración del video:', error);
      // Si no hay configuración, mantener valores por defecto
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      if (videoId) {
        // Actualizar video existente
        await videoInstitucionalApi.update(videoId, config);
        setMessage('✅ Configuración actualizada exitosamente');
      } else {
        // Crear nuevo video
        const newVideo = await videoInstitucionalApi.create(config);
        setVideoId(newVideo.id || null);
        setMessage('✅ Video institucional creado exitosamente');
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      setMessage('❌ Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof VideoInstitucional, value: string | boolean | number) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
      <PageMeta
        title="Video Institucional | Dashboard UTTECAM"
        description="Administrar el video institucional de la página de inicio"
      />
      <PageBreadcrumb pageTitle="Video Institucional" />

      <div className="space-y-6">
        <ComponentCard title="Configuración del Video Institucional">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título del Video
                  </label>
                  <input
                    type="text"
                    value={config.titulo}
                    onChange={(e) => handleInputChange('titulo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Video Institucional UTTECAM"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={config.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descripción del video institucional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL del Video
                  </label>
                  <input
                    type="text"
                    value={config.urlVideo}
                    onChange={(e) => handleInputChange('urlVideo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="/uploads/videos/uttecam-institucional.mp4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración (segundos)
                  </label>
                  <input
                    type="number"
                    value={config.duracion || ''}
                    onChange={(e) => handleInputChange('duracion', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="180"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Volumen (0-100)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.volumen}
                    onChange={(e) => handleInputChange('volumen', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">{config.volumen}%</div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="mostrarControles"
                      checked={config.mostrarControles}
                      onChange={(e) => handleInputChange('mostrarControles', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="mostrarControles" className="ml-2 block text-sm text-gray-900">
                      Mostrar controles del video
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoplay"
                      checked={config.autoplay}
                      onChange={(e) => handleInputChange('autoplay', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="autoplay" className="ml-2 block text-sm text-gray-900">
                      Reproducción automática
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="loop"
                      checked={config.loop}
                      onChange={(e) => handleInputChange('loop', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="loop" className="ml-2 block text-sm text-gray-900">
                      Repetir video (loop)
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="activoVideo"
                      checked={config.activo}
                      onChange={(e) => handleInputChange('activo', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="activoVideo" className="ml-2 block text-sm text-gray-900">
                      Video activo en la página de inicio
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Vista Previa</h4>
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      <p className="text-sm">Vista previa del video</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Información</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• El video aparece en la página de inicio</li>
                    <li>• Formatos soportados: MP4, WebM</li>
                    <li>• Tamaño recomendado: Hasta 100MB</li>
                    <li>• Resolución recomendada: 1920x1080</li>
                  </ul>
                </div>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-md ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {message}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
};

export default VideoInstitucionalAdmin;