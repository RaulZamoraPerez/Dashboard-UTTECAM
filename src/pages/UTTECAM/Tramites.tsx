import { useState } from 'react';

interface TramiteOpcion {
  id: string;
  titulo: string;
  descripcion: string;
  archivos?: Array<{
    id: string;
    nombre: string;
    tipo: 'pdf' | 'doc' | 'link';
    url: string;
  }>;
}

interface TramiteCard {
  id: string;
  titulo: string;
  descripcion: string;
  esExpandible: boolean;
  opciones?: TramiteOpcion[];
}

const Tramites = () => {
  const [tramites, setTramites] = useState<TramiteCard[]>([
    {
      id: 'reinscripcion',
      titulo: 'Reinscripción a Ingeniería/Licenciatura (7º cuatrimestre)',
      descripcion: 'Actualización de datos y continuidad de estudios.',
      esExpandible: true,
      opciones: [
        {
          id: 'reinscripcion-1',
          titulo: 'Alumnos de la UTTecam',
          descripcion: 'Reinscripción para estudiantes actuales de la Universidad Tecnológica de Tecamachalco.',
          archivos: [
            { id: 'arch-1', nombre: 'Formato de Reinscripción', tipo: 'pdf', url: '#' },
            { id: 'arch-2', nombre: 'Requisitos', tipo: 'pdf', url: '#' }
          ]
        },
        {
          id: 'reinscripcion-2',
          titulo: 'Alumnos provenientes de generaciones anteriores y de otras Universidades Tecnológicas',
          descripcion: 'Proceso especial para estudiantes de generaciones pasadas o transferencias.',
          archivos: [
            { id: 'arch-3', nombre: 'Solicitud de Reingreso', tipo: 'pdf', url: '#' },
            { id: 'arch-4', nombre: 'Documentos Requeridos', tipo: 'pdf', url: '#' }
          ]
        }
      ]
    },
    {
      id: 'cambio-programa',
      titulo: 'Cambio de Programa Educativo',
      descripcion: 'Solicitud para cambiar de carrera o especialidad.',
      esExpandible: true,
      opciones: [
        {
          id: 'cambio-1',
          titulo: 'Solicitud de Cambio de Carrera',
          descripcion: 'Cambio entre programas de la misma institución.',
          archivos: [
            { id: 'arch-5', nombre: 'Formato de Cambio', tipo: 'pdf', url: '#' }
          ]
        }
      ]
    },
    {
      id: 'credencial',
      titulo: 'Trámite de Credencial',
      descripcion: 'Solicitud y renovación de credencial de estudiante.',
      esExpandible: false
    }
  ]);

  const [tramiteSeleccionado, setTramiteSeleccionado] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [tramiteEditando, setTramiteEditando] = useState<string | null>(null);
  const [nuevoTramite, setNuevoTramite] = useState<TramiteCard>({
    id: '',
    titulo: '',
    descripcion: '',
    esExpandible: false,
    opciones: []
  });

  const handleAgregarTramite = () => {
    if (nuevoTramite.titulo.trim() && nuevoTramite.descripcion.trim()) {
      if (modoEdicion && tramiteEditando) {
        // Modo edición
        setTramites(tramites.map(t => 
          t.id === tramiteEditando 
            ? { ...nuevoTramite, id: tramiteEditando }
            : t
        ));
        setModoEdicion(false);
        setTramiteEditando(null);
      } else {
        // Modo crear nuevo
        const tramiteNuevo: TramiteCard = {
          ...nuevoTramite,
          id: `tramite-${Date.now()}`
        };
        setTramites([...tramites, tramiteNuevo]);
      }
      setNuevoTramite({
        id: '',
        titulo: '',
        descripcion: '',
        esExpandible: false,
        opciones: []
      });
      setMostrarFormulario(false);
    }
  };

  const handleIniciarEdicion = (tramite: TramiteCard) => {
    setNuevoTramite(tramite);
    setTramiteEditando(tramite.id);
    setModoEdicion(true);
    setMostrarFormulario(true);
  };

  /*
  const handleCancelarEdicion = () => {
    setModoEdicion(false);
    setTramiteEditando(null);
    setNuevoTramite({
      id: '',
      titulo: '',
      descripcion: '',
      esExpandible: false,
      opciones: []
    });
    setMostrarFormulario(false);
  };
  */

  const handleEliminarTramite = (id: string) => {
    setTramites(tramites.filter(t => t.id !== id));
    if (tramiteSeleccionado === id) {
      setTramiteSeleccionado(null);
    }
  };

  /*
  const handleEditarTramite = (id: string, updates: Partial<TramiteCard>) => {
    setTramites(tramites.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
  };
  */

  return (
    <div className="bg-white dark:bg-black min-h-screen">
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-gray-600 dark:bg-black sm:px-7.5 xl:pb-1">
        
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h4 className="text-xl font-semibold text-black dark:text-white">
              📋 Servicios Escolares - Trámites
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gestiona todos los trámites escolares disponibles
            </p>
          </div>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 py-3 px-6 font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200 border border-primary dark:border-primary dark:bg-primary dark:hover:bg-primary/90"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Nuevo Trámite
          </button>
        </div>

        {/* Formulario de Nuevo Trámite */}
        {mostrarFormulario && (
          <div className="mb-8 rounded-lg border border-stroke bg-gray-50 dark:bg-black dark:border-gray-600 p-6">
            <h5 className="text-lg font-semibold text-black dark:text-white mb-6">
              {modoEdicion ? 'Editar Trámite' : 'Crear Nuevo Trámite'}
            </h5>
            <div className="space-y-4">
              <div>
                <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                  Título del Trámite *
                </label>
                <input
                  type="text"
                  value={nuevoTramite.titulo}
                  onChange={(e) => setNuevoTramite({ ...nuevoTramite, titulo: e.target.value })}
                  placeholder="Ej: Reinscripción"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-white py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-gray-600 dark:bg-black dark:text-white dark:focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                  Descripción *
                </label>
                <textarea
                  value={nuevoTramite.descripcion}
                  onChange={(e) => setNuevoTramite({ ...nuevoTramite, descripcion: e.target.value })}
                  placeholder="Descripción del trámite..."
                  rows={3}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-white py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-gray-600 dark:bg-black dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="esExpandible"
                  checked={nuevoTramite.esExpandible}
                  onChange={(e) => setNuevoTramite({ ...nuevoTramite, esExpandible: e.target.checked })}
                  className="h-5 w-5 rounded border border-stroke bg-white text-primary focus:ring-primary dark:border-gray-600 dark:bg-black"
                />
                <label htmlFor="esExpandible" className="text-sm font-medium text-black dark:text-white">
                  ¿Es expandible? (contiene opciones)
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAgregarTramite}
                  className="flex-1 sm:flex-initial justify-center rounded-lg bg-primary hover:bg-primary/90 py-3 px-8 font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setMostrarFormulario(false)}
                  className="flex-1 sm:flex-initial justify-center rounded-lg border-2 border-stroke dark:border-gray-600 bg-white dark:bg-black py-3 px-8 font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Grid de Trámites */}
        <div className="mb-6">
          <h5 className="text-lg font-semibold text-black dark:text-white mb-4">
            Trámites Disponibles
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tramites.map((tramite) => (
              <div
                key={tramite.id}
                className="bg-white dark:bg-black rounded-lg border border-stroke dark:border-gray-600 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200"
              >
                {/* Card Header */}
                <div className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors" 
                     onClick={() => setTramiteSeleccionado(tramiteSeleccionado === tramite.id ? null : tramite.id)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h6 className="font-semibold text-black dark:text-white text-sm line-clamp-2">
                        {tramite.titulo}
                      </h6>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {tramite.descripcion}
                      </p>
                    </div>
                    {tramite.esExpandible && (
                      <svg className={`w-5 h-5 text-primary ml-2 flex-shrink-0 transition-transform ${tramiteSeleccionado === tramite.id ? 'rotate-180' : ''}`} 
                           fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 10l5 5 5-5z" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Opciones Expandibles */}
                {tramiteSeleccionado === tramite.id && tramite.esExpandible && tramite.opciones && (
                  <div className="border-t border-stroke dark:border-gray-600 bg-gray-50 dark:bg-black/50 p-4 space-y-3">
                    {tramite.opciones.map((opcion) => (
                      <div key={opcion.id} className="p-3 bg-white dark:bg-black border border-stroke dark:border-gray-600 rounded">
                        <h6 className="font-medium text-black dark:text-white text-sm mb-1">
                          {opcion.titulo}
                        </h6>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {opcion.descripcion}
                        </p>
                        {opcion.archivos && opcion.archivos.length > 0 && (
                          <div className="space-y-1">
                            {opcion.archivos.map((archivo) => (
                              <a
                                key={archivo.id}
                                href={archivo.url}
                                className="text-xs text-primary hover:text-primary/90 flex items-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                                </svg>
                                {archivo.nombre} ({archivo.tipo})
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Card Actions */}
                <div className="border-t border-stroke dark:border-gray-600 p-3 flex gap-2 justify-end">
                  <button
                    onClick={() => handleIniciarEdicion(tramite)}
                    className="text-primary hover:text-primary/90 p-1"
                    title="Editar"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3,17.25V21h3.75L17.81,9.94l-3.75,-3.75L3,17.25Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEliminarTramite(tramite.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Eliminar"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sin Trámites */}
        {tramites.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-6">
              <svg className="w-20 h-20 mx-auto text-gray-400 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              No hay trámites registrados
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Crea el primer trámite para comenzar a gestionar los servicios escolares.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tramites;
