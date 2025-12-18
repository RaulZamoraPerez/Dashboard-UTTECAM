import { useState, useEffect } from 'react';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { noticiaService, Noticia } from '../../services/noticiaService';
import { useEventos } from '../../hooks/useEventos';

const HomeContentDashboard = () => {
  const { eventoActivo, eventos, loading: eventosLoading } = useEventos(true, true);
  const [noticiaConfig, setNoticiaConfig] = useState<Noticia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContentStatus();
  }, []);

  const loadContentStatus = async () => {
    try {
      setLoading(true);
      const [noticiaData] = await Promise.all([
        noticiaService.getActive().catch(() => null),
      ]);
      setNoticiaConfig(noticiaData);
    } catch (error) {
      console.error('Error al cargar estado del contenido:', error);
    } finally {
      setLoading(false);
    }
  };

  // Note: Event preview and status are loaded from useEventos() hook

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

          {/* Eventos */}
          {/* Noticias */}
          <ComponentCard title="Noticias">
            <div className="space-y-4">
                {/* Badge for inactive events */}
                {!eventosLoading && eventos.filter(ev => !ev.activo).length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Inactivos:</span>
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-xs font-medium">{eventos.filter(ev => !ev.activo).length}</span>
                  </div>
                )}
              {noticiaConfig ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Última noticia:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      noticiaConfig.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {noticiaConfig.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-700">Título:</span>
                    <p className="text-sm text-gray-600 mt-1">{noticiaConfig.titulo}</p>
                  </div>

                  {noticiaConfig.imagen && (
                    <div className="mt-2">
                      <img src={noticiaConfig.imagen.startsWith('http') ? noticiaConfig.imagen : `${import.meta.env.VITE_API_URL}/${noticiaConfig.imagen}`} alt={noticiaConfig.titulo} className="h-24 object-cover rounded" />
                    </div>
                  )}

                  <div className="pt-3">
                    <a href="/home/noticias" className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      Gestionar Noticias
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No hay noticias activas</p>
                  <a
                    href="/home/noticias"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Crear Noticia
                  </a>
                </div>
              )}
            </div>
          </ComponentCard>
          <ComponentCard title="Eventos">
            <div className="space-y-4">
              {eventoActivo ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Estado:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      eventoActivo.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {eventoActivo.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-700">Evento:</span>
                    <p className="text-sm text-gray-600 mt-1">{eventoActivo.titulo}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-700">Fecha:</span>
                    <p className="text-sm text-gray-600 mt-1">{new Date(eventoActivo.fecha_evento).toLocaleString('es-MX')}</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <p className="text-sm text-blue-700 mt-1">{eventoActivo.descripcion}</p>
                    </div>
                  </div>

                  {/* Small list showing both active and inactive events (latest 5) */}
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Últimos eventos</h4>
                    {!eventosLoading ? (
                      <ul className="space-y-2">
                        {eventos.slice(0, 5).map((e) => (
                          <li key={e.id} className="flex items-center justify-between text-sm">
                            <div className="truncate"><strong>{e.titulo}</strong> <span className="text-gray-500">— {new Date(e.fecha_evento).toLocaleDateString('es-MX')}</span></div>
                            <span className={`px-2 py-0.5 text-xs rounded ${e.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{e.activo ? 'Activo' : 'Inactivo'}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-gray-500">Cargando eventos...</div>
                    )}
                  </div>

                  {/* Explicit section for inactive events to improve discoverability */}
                  {!eventosLoading && eventos.filter(ev => !ev.activo).length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Eventos inactivos</h4>
                      <ul className="space-y-2">
                        {eventos.filter(ev => !ev.activo).slice(0, 5).map((inv) => (
                          <li key={`inactive-${inv.id}`} className="flex items-center justify-between text-sm">
                            <div className="truncate"><strong>{inv.titulo}</strong> <span className="text-gray-500">— {new Date(inv.fecha_evento).toLocaleDateString('es-MX')}</span></div>
                            <span className="px-2 py-0.5 text-xs rounded bg-red-100 text-red-800">Inactivo</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-3">
                    <a
                      href="/home/eventos"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Gestionar Eventos
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No hay evento activo</p>
                  <a
                    href="/home/eventos"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Crear Evento
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
              Desde aquí puedes gestionar los Hero Slides (imágenes / videos) y los Eventos que se muestran en la página de inicio.
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Hero Slides</h4>
                <p className="text-sm text-blue-800">
                  Gestiona los slides que aparecen en el carrusel principal (imágenes y videos).
                  Puedes configurar orden, enlaces y contenido multimedia.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Eventos</h4>
                <p className="text-sm text-green-800">
                  Administra los eventos mostrados en la homepage y gestiona el evento activo que se muestra en el cronómetro o listado principal.
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