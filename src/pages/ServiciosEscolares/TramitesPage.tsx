import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toastSuccess, toastError } from '../../utils/alert';
import ComponentCard from '../../components/common/ComponentCard';
import { 
  getTramitesVista, 
  createTramitesVista, 
  updateTramitesVista 
} from '../../services/tramitesService';

// Interfaces
interface TramiteCard {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  ruta: string;
  activo: boolean;
}

interface InformacionGeneral {
  titulo: string;
  subtitulo: string;
}

// Iconos SVG como componentes
const iconos: { [key: string]: React.ReactNode } = {
  inscripcion: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19,2H5C3.9,2 3,2.9 3,4V20C3,21.1 3.9,22 5,22H19C20.1,22 21,21.1 21,20V4C21,2.9 20.1,2 19,2M19,20H5V4H19V20M7,18H17V16H7V18M7,14H17V12H7V14M7,10H17V6H7V10Z" />
    </svg>
  ),
  reinscripcion: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
    </svg>
  ),
  constancias: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M9,13V19H7V13H9M15,15V19H17V15H15M11,11V19H13V11H11Z" />
    </svg>
  ),
  certificado: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4,3C2.89,3 2,3.89 2,5V15A2,2 0 0,0 4,17H12V22L15,19L18,22V17H20A2,2 0 0,0 22,15V8L22,6V5A2,2 0 0,0 20,3H16V3H4M12,5L15,7L18,5V8.5L21,10L18,11.5V15L15,13L12,15V11.5L9,10L12,8.5V5M4,5H9V7H4V5M4,9H7V11H4V9M4,13H9V15H4V13Z" />
    </svg>
  ),
  cartaPasante: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
    </svg>
  ),
  imss: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19,8C19.56,8 20,8.43 20,9A1,1 0 0,1 19,10H18V19A2,2 0 0,1 16,21H8A2,2 0 0,1 6,19V10H5A1,1 0 0,1 4,9C4,8.43 4.44,8 5,8H6V7C6,4.23 8.24,2 11,2H13C15.76,2 18,4.23 18,7V8H19M8,10V19H16V10H8M16,8V7A3,3 0 0,0 13,4H11A3,3 0 0,0 8,7V8H16Z" />
    </svg>
  ),
  credencializacion: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22,3H2A2,2 0 0,0 0,5V19A2,2 0 0,0 2,21H22A2,2 0 0,0 24,19V5A2,2 0 0,0 22,3M22,19H2V5H22V19M14,17V15.75C14,14.09 10.66,13.25 9,13.25C7.34,13.25 4,14.09 4,15.75V17H14M9,7A2.5,2.5 0 0,0 6.5,9.5A2.5,2.5 0 0,0 9,12A2.5,2.5 0 0,0 11.5,9.5A2.5,2.5 0 0,0 9,7M14,7V8H20V7H14M14,9V10H20V9H14M14,11V12H18V11H14Z" />
    </svg>
  ),
  tituloProfesional: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
    </svg>
  ),
};

export default function TramitesPage() {
  const navigate = useNavigate();

  // Estado para información general
  const [infoGeneral, setInfoGeneral] = useState<InformacionGeneral>({
    titulo: '',
    subtitulo: '',
  });
  const [infoId, setInfoId] = useState<string | null>(null); // ID del registro en el backend
  const [editandoInfo, setEditandoInfo] = useState(false);
  const [infoTemporal, setInfoTemporal] = useState<InformacionGeneral>(infoGeneral);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Cargar información al montar el componente
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setIsLoadingInfo(true);
        const response = await getTramitesVista();
        
        if (response) {
          setInfoGeneral({
            titulo: response.titulo || '',
            subtitulo: response.subtitulo || '',
          });
          setInfoId(response.id || null);
        }
      } catch (error) {
        // Si hay error, dejamos los campos vacíos
        console.error('Error al cargar información:', error);
      } finally {
        setIsLoadingInfo(false);
      }
    };

    fetchInfo();
  }, []);

  // Estado para las cards de trámites (fijas)
  const [tramites] = useState<TramiteCard[]>([
    {
      id: 'inscripcion',
      titulo: 'Inscripción',
      descripcion: 'Proceso de registro para nuevo ingreso a la institución.',
      icono: 'inscripcion',
      ruta: '/ServiciosEscolares/Tramites/Inscripcion',
      activo: true,
    },
    {
      id: 'reinscripcion',
      titulo: 'Reinscripción a Ingeniería/Licenciatura (7° cuatrimestre)',
      descripcion: 'Actualización de datos y continuidad de estudios.',
      icono: 'reinscripcion',
      ruta: '/ServiciosEscolares/Tramites/Reinscripcion',
      activo: true,
    },
    {
      id: 'constancias',
      titulo: 'Constancias y Kardex',
      descripcion: 'Emisión de documentos académicos oficiales.',
      icono: 'constancias',
      ruta: '/ServiciosEscolares/Tramites/Constancias',
      activo: true,
    },
    {
      id: 'certificado',
      titulo: 'Certificado de Estudios',
      descripcion: 'Documento oficial del historial académico completo.',
      icono: 'certificado',
      ruta: '/ServiciosEscolares/Tramites/Certificado',
      activo: true,
    },
    {
      id: 'cartaPasante',
      titulo: 'Carta Pasante',
      descripcion: 'Documento que acredita el término de estudios.',
      icono: 'cartaPasante',
      ruta: '/ServiciosEscolares/Tramites/CartaPasante',
      activo: true,
    },
    {
      id: 'imss',
      titulo: 'IMSS',
      descripcion: 'Alta o baja de servicios del seguro social estudiantil.',
      icono: 'imss',
      ruta: '/ServiciosEscolares/Tramites/IMSS',
      activo: true,
    },
    {
      id: 'credencializacion',
      titulo: 'Credencialización',
      descripcion: 'Trámite y renovación de credencial estudiantil.',
      icono: 'credencializacion',
      ruta: '/ServiciosEscolares/Tramites/Credencializacion',
      activo: true,
    },
    {
      id: 'tituloProfesional',
      titulo: 'Título Profesional Electrónico',
      descripcion: 'Trámite para la obtención del título profesional.',
      icono: 'tituloProfesional',
      ruta: '/ServiciosEscolares/Tramites/TituloProfesional',
      activo: true,
    },
  ]);

  // Handlers para información general
  const handleGuardarInfo = async () => {
    if (!infoTemporal.titulo.trim()) {
      toastError('El título es obligatorio');
      return;
    }
    if (!infoTemporal.subtitulo.trim()) {
      toastError('El subtítulo es obligatorio');
      return;
    }

    setIsSavingInfo(true);

    try {
      const data = {
        titulo: infoTemporal.titulo.trim(),
        subtitulo: infoTemporal.subtitulo.trim(),
      };

      if (infoId) {
        // Actualizar registro existente
        await updateTramitesVista(infoId, data);
        toastSuccess('Información actualizada correctamente');
      } else {
        // Crear nuevo registro
        await createTramitesVista(data);
        toastSuccess('Información guardada correctamente');
      }

      // Después de guardar, obtener los datos actualizados del servidor
      const updatedData = await getTramitesVista();
      if (updatedData) {
        setInfoGeneral({
          titulo: updatedData.titulo,
          subtitulo: updatedData.subtitulo,
        });
        setInfoTemporal({
          titulo: updatedData.titulo,
          subtitulo: updatedData.subtitulo,
        });
        setInfoId(updatedData.id);
      }
      
      setEditandoInfo(false);
    } catch (error) {
      if (error instanceof Error) {
        toastError(error.message);
      } else {
        toastError('Error al guardar la información');
      }
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handleCancelarInfo = () => {
    setInfoTemporal(infoGeneral);
    setEditandoInfo(false);
  };

  // Navegar al formulario del trámite
  const handleClickCard = (tramite: TramiteCard) => {
    navigate(tramite.ruta);
  };

  return (
    <div className="space-y-6">
      {/* Card 1: Información General */}
      <ComponentCard
        title="Información de la Vista de Trámites"
        desc="Configura el título y subtítulo que se mostrarán en la página principal de Servicios Escolares"
      >
        {/* Estado de carga inicial */}
        {isLoadingInfo ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="animate-spin w-10 h-10 mx-auto text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Cargando información...</p>
          </div>
        ) : !editandoInfo ? (
          // Vista de lectura
          <div className="space-y-4">
            {/* Mostrar mensaje si no hay datos */}
            {!infoGeneral.titulo && !infoGeneral.subtitulo ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">No hay información configurada</p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">Haz clic en "Editar Información" para agregar el título y subtítulo de la vista.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Título Principal</span>
                    <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white">{infoGeneral.titulo || '(Sin título)'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subtítulo / Descripción</span>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{infoGeneral.subtitulo || '(Sin subtítulo)'}</p>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={() => {
                setInfoTemporal(infoGeneral);
                setEditandoInfo(true);
              }}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 py-2.5 px-5 font-medium text-white text-sm shadow-theme-xs hover:shadow-lg transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
              </svg>
              {infoGeneral.titulo || infoGeneral.subtitulo ? 'Editar Información' : 'Agregar Información'}
            </button>
          </div>
        ) : (
          // Formulario de edición
          <div className="space-y-6">
            <div>
              <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Título Principal *
              </label>
              <input
                type="text"
                value={infoTemporal.titulo}
                onChange={(e) => setInfoTemporal(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ej: Servicios Escolares"
                disabled={isSavingInfo}
                className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Subtítulo / Descripción *
              </label>
              <textarea
                value={infoTemporal.subtitulo}
                onChange={(e) => setInfoTemporal(prev => ({ ...prev, subtitulo: e.target.value }))}
                placeholder="Describe los servicios que ofrece el departamento..."
                rows={4}
                disabled={isSavingInfo}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 transition-all disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleGuardarInfo}
                disabled={isSavingInfo}
                className="inline-flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 py-2.5 px-6 font-medium text-white text-sm shadow-theme-xs hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingInfo ? (
                  <>
                    <svg className="animate-spin w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                    </svg>
                    {infoId ? 'Actualizar Cambios' : 'Guardar Cambios'}
                  </>
                )}
              </button>
              <button
                onClick={handleCancelarInfo}
                disabled={isSavingInfo}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2.5 px-6 font-medium text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </ComponentCard>

      {/* Card 2: Cards de Trámites */}
      <ComponentCard
        title="Cards de Trámites"
        desc="Accede a la configuración de cada formulario haciendo clic en las cards"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tramites.map((tramite) => (
            <div
              key={tramite.id}
              className="relative bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-all duration-200 hover:shadow-lg hover:border-brand-300 dark:hover:border-brand-700 cursor-pointer"
              onClick={() => handleClickCard(tramite)}
            >
              {/* Icono */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 mb-4">
                {iconos[tramite.icono]}
              </div>

              {/* Contenido */}
              <h6 className="font-semibold text-gray-800 dark:text-white text-sm mb-2">
                {tramite.titulo}
              </h6>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {tramite.descripcion}
              </p>
              
              {/* Indicador de clic */}
              <div className="mt-4 flex items-center text-xs text-brand-500 dark:text-brand-400 font-medium">
                <span>Configurar formulario</span>
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </ComponentCard>
    </div>
  );
}
