import { useState, useEffect } from 'react';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { videoInstitucionalApi, VideoInstitucional } from '../../services/videoInstitucionalApi';
import { relojDigitalApi, RelojDigital } from '../../services/relojDigitalApi';

const HomeContentDashboard = () => {
  const [videoConfig, setVideoConfig] = useState<VideoInstitucional | null>(null);
  const [relojConfig, setRelojConfig] = useState<RelojDigital | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContentStatus();
  }, []);

  const loadContentStatus = async () => {
    try {
      setLoading(true);
      const [videoData, relojData] = await Promise.all([
        videoInstitucionalApi.getActive().catch(() => null),
        relojDigitalApi.getActive().catch(() => null)
      ]);

      setVideoConfig(videoData);
      setRelojConfig(relojData);
    } catch (error) {
      console.error('Error al cargar estado del contenido:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-MX', {
      hour12: !relojConfig?.formato24Horas,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: relojConfig?.zonaHoraria || 'America/Mexico_City'
    });
  };

  const formatDate = (date: Date) => {
    if (!relojConfig?.mostrarFecha) return '';

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    if (relojConfig?.mostrarDiaSemana) {
      options.weekday = 'long';
    }

    return date.toLocaleDateString('es-MX', options);
  };

  if (loading) {
    return (
      <>
        <PageMeta
          title="Contenido Homepage | Dashboard UTTECAM"
          description="Panel de control del contenido de la página de inicio"
        />
        <PageBreadcrumb pageTitle="Contenido Homepage" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Contenido Homepage | Dashboard UTTECAM"
        description="Panel de control del contenido de la página de inicio"
      />
      <PageBreadcrumb pageTitle="Contenido Homepage" />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Video Institucional */}
          <ComponentCard title="Video Institucional">
            <div className="space-y-4">
              {videoConfig ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Estado:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      videoConfig.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {videoConfig.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-700">Título:</span>
                    <p className="text-sm text-gray-600 mt-1">{videoConfig.titulo}</p>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-500">Controles:</span>
                      <span className={videoConfig.mostrarControles ? 'text-green-600' : 'text-red-600'}>
                        {videoConfig.mostrarControles ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-500">Autoplay:</span>
                      <span className={videoConfig.autoplay ? 'text-green-600' : 'text-red-600'}>
                        {videoConfig.autoplay ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-500">Loop:</span>
                      <span className={videoConfig.loop ? 'text-green-600' : 'text-red-600'}>
                        {videoConfig.loop ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3">
                    <a
                      href="/home-content/video-institucional"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Configurar Video
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <p className="text-gray-500 mb-4">No hay video institucional configurado</p>
                  <a
                    href="/home-content/video-institucional"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Configurar Video
                  </a>
                </div>
              )}
            </div>
          </ComponentCard>

          {/* Reloj Digital */}
          <ComponentCard title="Reloj Digital">
            <div className="space-y-4">
              {relojConfig ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Estado:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      relojConfig.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {relojConfig.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-700">Zona Horaria:</span>
                    <p className="text-sm text-gray-600 mt-1">{relojConfig.zonaHoraria}</p>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-500">24H:</span>
                      <span className={relojConfig.formato24Horas ? 'text-green-600' : 'text-red-600'}>
                        {relojConfig.formato24Horas ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-500">Fecha:</span>
                      <span className={relojConfig.mostrarFecha ? 'text-green-600' : 'text-red-600'}>
                        {relojConfig.mostrarFecha ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-500">Día:</span>
                      <span className={relojConfig.mostrarDiaSemana ? 'text-green-600' : 'text-red-600'}>
                        {relojConfig.mostrarDiaSemana ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>

                  {/* Vista previa del reloj */}
                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-4 text-white">
                    <div className="text-center">
                      <div className="text-2xl font-mono font-bold mb-1">
                        {formatTime(new Date())}
                      </div>
                      {relojConfig.mostrarFecha && (
                        <div className="text-sm opacity-90 capitalize">
                          {formatDate(new Date())}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3">
                    <a
                      href="/home-content/reloj-digital"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Configurar Reloj
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  <p className="text-gray-500 mb-4">No hay reloj digital configurado</p>
                  <a
                    href="/home-content/reloj-digital"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Configurar Reloj
                  </a>
                </div>
              )}
            </div>
          </ComponentCard>
        </div>

        {/* Información general */}
        <ComponentCard title="Información del Contenido Homepage">
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-600">
              Este panel muestra el estado actual del contenido que aparece en la página de inicio de UTTECAM.
              Desde aquí puedes gestionar el video institucional y la configuración del reloj digital.
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Video Institucional</h4>
                <p className="text-sm text-blue-800">
                  Configura el video de presentación que aparece en la página principal.
                  Puedes ajustar controles, autoplay, y otras opciones de reproducción.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Reloj Digital</h4>
                <p className="text-sm text-green-800">
                  Personaliza el reloj que se muestra en la página de inicio.
                  Configura zona horaria, formato de hora y opciones de visualización.
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default HomeContentDashboard;