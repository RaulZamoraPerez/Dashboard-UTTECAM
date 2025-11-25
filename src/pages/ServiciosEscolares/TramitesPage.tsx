import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toastSuccess, toastError } from '../../utils/alert';
import ComponentCard from '../../components/common/ComponentCard';

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
    titulo: 'Servicios Escolares',
    subtitulo: 'El departamento de Servicios Escolares, brinda atención a los estudiantes y egresados de la Universidad Tecnológica de Tecamachalco, con respecto a los servicios que demanden durante su ingreso, permanencia y egreso.',
  });
  const [editandoInfo, setEditandoInfo] = useState(false);
  const [infoTemporal, setInfoTemporal] = useState<InformacionGeneral>(infoGeneral);

  // Estado para las cards de trámites (fijas, solo se puede editar el título)
  const [tramites, setTramites] = useState<TramiteCard[]>([
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

  // Estado para editar card individual
  const [editandoCardId, setEditandoCardId] = useState<string | null>(null);
  const [tituloCardTemporal, setTituloCardTemporal] = useState('');

  // Handlers para información general
  const handleGuardarInfo = () => {
    if (!infoTemporal.titulo.trim()) {
      toastError('El título es obligatorio');
      return;
    }
    if (!infoTemporal.subtitulo.trim()) {
      toastError('El subtítulo es obligatorio');
      return;
    }

    setInfoGeneral(infoTemporal);
    setEditandoInfo(false);
    toastSuccess('Información actualizada correctamente');
  };

  const handleCancelarInfo = () => {
    setInfoTemporal(infoGeneral);
    setEditandoInfo(false);
  };

  // Handlers para editar título de card
  const handleIniciarEdicionCard = (tramite: TramiteCard) => {
    setEditandoCardId(tramite.id);
    setTituloCardTemporal(tramite.titulo);
  };

  const handleGuardarTituloCard = (id: string) => {
    if (!tituloCardTemporal.trim()) {
      toastError('El título no puede estar vacío');
      return;
    }

    setTramites(prev => prev.map(t => 
      t.id === id ? { ...t, titulo: tituloCardTemporal.trim() } : t
    ));
    setEditandoCardId(null);
    setTituloCardTemporal('');
    toastSuccess('Título actualizado correctamente');
  };

  const handleCancelarEdicionCard = () => {
    setEditandoCardId(null);
    setTituloCardTemporal('');
  };

  // Navegar al formulario del trámite
  const handleClickCard = (tramite: TramiteCard) => {
    if (editandoCardId) return; // No navegar si está editando
    navigate(tramite.ruta);
  };

  return (
    <div className="space-y-6">
      {/* Card 1: Información General */}
      <ComponentCard
        title="Información de la Vista de Trámites"
        desc="Configura el título y subtítulo que se mostrarán en la página principal de Servicios Escolares"
      >
        {!editandoInfo ? (
          // Vista de lectura
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Título Principal</span>
                  <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white">{infoGeneral.titulo}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subtítulo / Descripción</span>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{infoGeneral.subtitulo}</p>
                </div>
              </div>
            </div>
            
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
              Editar Información
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
                className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 transition-all"
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
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 transition-all"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleGuardarInfo}
                className="inline-flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 py-2.5 px-6 font-medium text-white text-sm shadow-theme-xs hover:shadow-lg transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                </svg>
                Guardar Cambios
              </button>
              <button
                onClick={handleCancelarInfo}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2.5 px-6 font-medium text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
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
        desc="Gestiona los títulos de las cards y accede a la configuración de cada formulario haciendo clic en ellas"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tramites.map((tramite) => (
            <div
              key={tramite.id}
              className={`relative bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-all duration-200 ${
                editandoCardId === tramite.id 
                  ? 'ring-2 ring-brand-500' 
                  : 'hover:shadow-lg hover:border-brand-300 dark:hover:border-brand-700 cursor-pointer'
              }`}
              onClick={() => !editandoCardId && handleClickCard(tramite)}
            >
              {/* Botón de editar título */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleIniciarEdicionCard(tramite);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors z-10"
                title="Editar título"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                </svg>
              </button>

              {/* Icono */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 mb-4">
                {iconos[tramite.icono]}
              </div>

              {/* Contenido */}
              {editandoCardId === tramite.id ? (
                // Modo edición
                <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={tituloCardTemporal}
                    onChange={(e) => setTituloCardTemporal(e.target.value)}
                    className="w-full h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-900 px-3 py-1.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    placeholder="Título del trámite"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleGuardarTituloCard(tramite.id);
                      if (e.key === 'Escape') handleCancelarEdicionCard();
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGuardarTituloCard(tramite.id)}
                      className="flex-1 inline-flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 py-1.5 px-3 font-medium text-white text-xs transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                      </svg>
                      Guardar
                    </button>
                    <button
                      onClick={handleCancelarEdicionCard}
                      className="flex-1 inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-1.5 px-3 font-medium text-gray-700 dark:text-gray-300 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // Modo lectura
                <>
                  <h6 className="font-semibold text-gray-800 dark:text-white text-sm mb-2 pr-8">
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
                </>
              )}
            </div>
          ))}
        </div>
      </ComponentCard>
    </div>
  );
}
