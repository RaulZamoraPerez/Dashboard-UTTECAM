import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toastSuccess, toastError, confirmDialog } from '../../utils/alert';
import ComponentCard from '../../components/common/ComponentCard';
import { 
  getTramitesVista, 
  createTramitesVista, 
  updateTramitesVista 
} from '../../services/tramitesService';
import * as personalService from '../../services/personalCarrerasService';
import * as carrerasService from '../../services/carrerasSimplesService';

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

interface PersonalCarrera {
  id: string;
  nombre: string;
  correo: string;
  carreras: string[];
  activo: boolean;
}

interface PersonalFormData {
  nombre: string;
  correo: string;
  carreras: string[];
  activo: boolean;
}

interface CarreraSimple {
  id: string;
  nombre: string;
  tipo: carrerasService.TipoCarrera;
  activo: boolean;
}

interface CarreraFormData {
  nombre: string;
  tipo: carrerasService.TipoCarrera;
  activo: boolean;
}

// Tipos de carrera disponibles
const TIPOS_CARRERA: Array<{ value: carrerasService.TipoCarrera; label: string }> = [
  { value: 'TSU', label: 'TSU (Técnico Superior Universitario)' },
  { value: 'INGENIERIA', label: 'Ingeniería' },
  { value: 'LICENCIATURA', label: 'Licenciatura' },
  { value: 'MAESTRIA', label: 'Maestría' },
  { value: 'DOCTORADO', label: 'Doctorado' },
  { value: 'OTRO', label: 'Otro' },
];

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
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Estado para personal de carreras
  const [personalList, setPersonalList] = useState<PersonalCarrera[]>([]);
  const [isLoadingPersonal, setIsLoadingPersonal] = useState(false);
  const [showPersonalForm, setShowPersonalForm] = useState(false);
  const [editingPersonalId, setEditingPersonalId] = useState<string | null>(null);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [personalFormData, setPersonalFormData] = useState<PersonalFormData>({
    nombre: '',
    correo: '',
    carreras: [],
    activo: true,
  });

  // Estado para carreras
  const [carrerasList, setCarrerasList] = useState<string[]>([]);
  const [isLoadingCarreras, setIsLoadingCarreras] = useState(false);
  const [showCarreraForm, setShowCarreraForm] = useState(false);
  const [editingCarreraId, setEditingCarreraId] = useState<string | null>(null);
  const [isSavingCarrera, setIsSavingCarrera] = useState(false);
  const [carreraFormData, setCarreraFormData] = useState<CarreraFormData>({
    nombre: '',
    tipo: 'TSU',
    activo: true,
  });
  const [carrerasCompletas, setCarrerasCompletas] = useState<CarreraSimple[]>([]);

  // Cargar información al montar el componente
  useEffect(() => {
    const fetchInfo = async () => {
      setIsLoadingInfo(true);
      try {
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

  // Cargar personal de carreras al montar
  useEffect(() => {
    loadPersonal();
    loadCarreras();
  }, []);

  const loadPersonal = async () => {
    setIsLoadingPersonal(true);
    try {
      const response = await personalService.getPersonalCarreras();
      setPersonalList(response);
    } catch (error) {
      console.error('Error al cargar personal:', error);
    } finally {
      setIsLoadingPersonal(false);
    }
  };

  const loadCarreras = async () => {
    setIsLoadingCarreras(true);
    try {
      const [nombres, completas] = await Promise.all([
        carrerasService.getNombresCarreras(true),
        carrerasService.getCarrerasSimples()
      ]);
      setCarrerasList(nombres);
      setCarrerasCompletas(completas);
    } catch (error) {
      console.error('Error al cargar carreras:', error);
    } finally {
      setIsLoadingCarreras(false);
    }
  };

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

  // Handlers para personal de carreras
  const resetPersonalForm = () => {
    setPersonalFormData({
      nombre: '',
      correo: '',
      carreras: [],
      activo: true,
    });
    setEditingPersonalId(null);
  };

  const handleAgregarPersonal = () => {
    resetPersonalForm();
    setShowPersonalForm(true);
  };

  const handleEditarPersonal = (personal: PersonalCarrera) => {
    setPersonalFormData({
      nombre: personal.nombre,
      correo: personal.correo,
      carreras: personal.carreras,
      activo: personal.activo,
    });
    setEditingPersonalId(personal.id);
    setShowPersonalForm(true);
  };

  const handleToggleCarrera = (carrera: string) => {
    setPersonalFormData(prev => ({
      ...prev,
      carreras: prev.carreras.includes(carrera)
        ? prev.carreras.filter(c => c !== carrera)
        : [...prev.carreras, carrera]
    }));
  };

  const handleGuardarPersonal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!personalFormData.nombre.trim()) {
      toastError('El nombre es obligatorio');
      return;
    }
    if (!personalFormData.correo.trim()) {
      toastError('El correo es obligatorio');
      return;
    }
    if (personalFormData.carreras.length === 0) {
      toastError('Debe asignar al menos una carrera');
      return;
    }

    setIsSavingPersonal(true);

    try {
      if (editingPersonalId) {
        // Actualizar
        await personalService.updatePersonalCarrera(editingPersonalId, personalFormData);
        toastSuccess('Personal actualizado correctamente');
      } else {
        // Crear nuevo
        await personalService.createPersonalCarrera(personalFormData);
        toastSuccess('Personal agregado correctamente');
      }

      await loadPersonal();
      setShowPersonalForm(false);
      resetPersonalForm();
    } catch (error) {
      if (error instanceof Error) {
        toastError(error.message);
      } else {
        toastError('Error al guardar el personal');
      }
    } finally {
      setIsSavingPersonal(false);
    }
  };

  const handleToggleActivoPersonal = async (personal: PersonalCarrera) => {
    try {
      await personalService.updatePersonalCarrera(personal.id, {
        activo: !personal.activo
      });
      toastSuccess(`Personal ${!personal.activo ? 'activado' : 'desactivado'} correctamente`);
      await loadPersonal();
    } catch (error) {
      if (error instanceof Error) {
        toastError(error.message);
      } else {
        toastError('Error al cambiar el estado');
      }
    }
  };

  const handleEliminarPersonal = async (personal: PersonalCarrera) => {
    const confirmed = await confirmDialog({
      title: '¿Eliminar personal?',
      text: `Se eliminará a ${personal.nombre}. Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });

    if (!confirmed) return;

    try {
      await personalService.deletePersonalCarrera(personal.id);
      toastSuccess('Personal eliminado correctamente');
      await loadPersonal();
    } catch (error) {
      if (error instanceof Error) {
        toastError(error.message);
      } else {
        toastError('Error al eliminar el personal');
      }
    }
  };

  const handleCancelarPersonal = () => {
    setShowPersonalForm(false);
    resetPersonalForm();
  };

  // Handlers para carreras
  const resetCarreraForm = () => {
    setCarreraFormData({
      nombre: '',
      tipo: 'TSU',
      activo: true,
    });
    setEditingCarreraId(null);
  };

  const handleAgregarCarrera = () => {
    resetCarreraForm();
    setShowCarreraForm(true);
  };

  const handleEditarCarrera = (carrera: CarreraSimple) => {
    setCarreraFormData({
      nombre: carrera.nombre,
      tipo: carrera.tipo,
      activo: carrera.activo,
    });
    setEditingCarreraId(carrera.id);
    setShowCarreraForm(true);
  };

  const handleGuardarCarrera = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!carreraFormData.nombre.trim()) {
      toastError('El nombre de la carrera es obligatorio');
      return;
    }

    setIsSavingCarrera(true);

    try {
      if (editingCarreraId) {
        // Actualizar
        await carrerasService.updateCarreraSimple(editingCarreraId, carreraFormData);
        toastSuccess('Carrera actualizada correctamente');
      } else {
        // Crear nueva
        await carrerasService.createCarreraSimple(carreraFormData);
        toastSuccess('Carrera agregada correctamente');
      }

      await loadCarreras();
      setShowCarreraForm(false);
      resetCarreraForm();
    } catch (error) {
      if (error instanceof Error) {
        toastError(error.message);
      } else {
        toastError('Error al guardar la carrera');
      }
    } finally {
      setIsSavingCarrera(false);
    }
  };

  const handleToggleActivoCarrera = async (carrera: CarreraSimple) => {
    try {
      await carrerasService.updateCarreraSimple(carrera.id, {
        activo: !carrera.activo
      });
      toastSuccess(`Carrera ${!carrera.activo ? 'activada' : 'desactivada'} correctamente`);
      await loadCarreras();
    } catch (error) {
      if (error instanceof Error) {
        toastError(error.message);
      } else {
        toastError('Error al cambiar el estado');
      }
    }
  };

  const handleEliminarCarrera = async (carrera: CarreraSimple) => {
    const confirmed = await confirmDialog({
      title: '¿Eliminar carrera?',
      text: `Se eliminará "${carrera.nombre}". Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });

    if (!confirmed) return;

    try {
      await carrerasService.deleteCarreraSimple(carrera.id);
      toastSuccess('Carrera eliminada correctamente');
      await loadCarreras();
    } catch (error) {
      if (error instanceof Error) {
        toastError(error.message);
      } else {
        toastError('Error al eliminar la carrera');
      }
    }
  };

  const handleCancelarCarrera = () => {
    setShowCarreraForm(false);
    resetCarreraForm();
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

      {/* Card 3: Personal de Carreras */}
      <ComponentCard
        title="Personal de Carreras"
        desc="Gestiona el personal que recibirá notificaciones por correo de los formularios que envíen los alumnos"
      >
        {isLoadingPersonal ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="animate-spin w-10 h-10 mx-auto text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Cargando personal...</p>
          </div>
        ) : (
          <>
            {/* Header con botón agregar */}
            {!showPersonalForm && (
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">
                    {personalList.length} persona{personalList.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  onClick={handleAgregarPersonal}
                  className="inline-flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 py-2.5 px-5 font-medium text-white text-sm shadow-theme-xs hover:shadow-lg transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15,14C12.33,14 7,15.33 7,18V20H23V18C23,15.33 17.67,14 15,14M6,10V7H4V10H1V12H4V15H6V12H9V10M15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12Z" />
                  </svg>
                  Agregar Personal
                </button>
              </div>
            )}

            {/* Formulario agregar/editar */}
            {showPersonalForm && (
              <div className="mb-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-6">
                <h5 className="text-base font-semibold text-gray-800 dark:text-white mb-5">
                  {editingPersonalId ? 'Editar Personal' : 'Nuevo Personal'}
                </h5>
                
                <form onSubmit={handleGuardarPersonal} className="space-y-5">
                  {/* Nombre */}
                  <div>
                    <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={personalFormData.nombre}
                      onChange={(e) => setPersonalFormData(prev => ({ ...prev, nombre: e.target.value }))}
                      placeholder="Ej: María González López"
                      disabled={isSavingPersonal}
                      className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 transition-all disabled:opacity-50"
                      required
                    />
                  </div>

                  {/* Correo */}
                  <div>
                    <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      value={personalFormData.correo}
                      onChange={(e) => setPersonalFormData(prev => ({ ...prev, correo: e.target.value }))}
                      placeholder="correo@uttecam.edu.mx"
                      disabled={isSavingPersonal}
                      className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 transition-all disabled:opacity-50"
                      required
                    />
                  </div>

                  {/* Carreras */}
                  <div>
                    <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Carreras Asignadas * (Seleccione al menos una)
                    </label>
                    {carrerasList.length === 0 ? (
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                          No hay carreras disponibles. Por favor, agregue carreras primero en la sección de "Gestión de Carreras" más abajo.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                          {carrerasList.map((carrera) => (
                            <label
                              key={carrera}
                              className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={personalFormData.carreras.includes(carrera)}
                                onChange={() => handleToggleCarrera(carrera)}
                                disabled={isSavingPersonal}
                                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 disabled:opacity-50"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {carrera}
                              </span>
                            </label>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {personalFormData.carreras.length} carrera{personalFormData.carreras.length !== 1 ? 's' : ''} seleccionada{personalFormData.carreras.length !== 1 ? 's' : ''}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Estado activo */}
                  <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <input
                      type="checkbox"
                      id="activo"
                      checked={personalFormData.activo}
                      onChange={(e) => setPersonalFormData(prev => ({ ...prev, activo: e.target.checked }))}
                      disabled={isSavingPersonal}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 disabled:opacity-50"
                    />
                    <label htmlFor="activo" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                      Personal activo (recibirá notificaciones)
                    </label>
                  </div>

                  {/* Botones */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="submit"
                      disabled={isSavingPersonal}
                      className="inline-flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 py-2.5 px-6 font-medium text-white text-sm shadow-theme-xs hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSavingPersonal ? (
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
                          {editingPersonalId ? 'Actualizar' : 'Guardar'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelarPersonal}
                      disabled={isSavingPersonal}
                      className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2.5 px-6 font-medium text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Lista de personal */}
            {personalList.length === 0 && !showPersonalForm ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16,13C15.71,13 15.38,13 15.03,13.05C16.19,13.89 17,15 17,16.5V19H23V16.5C23,14.17 18.33,13 16,13M8,13C5.67,13 1,14.17 1,16.5V19H15V16.5C15,14.17 10.33,13 8,13M8,11A3,3 0 0,0 11,8A3,3 0 0,0 8,5A3,3 0 0,0 5,8A3,3 0 0,0 8,11M16,11A3,3 0 0,0 19,8A3,3 0 0,0 16,5A3,3 0 0,0 13,8A3,3 0 0,0 16,11Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  No hay personal registrado
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Agrega personal y asigna las carreras de las cuales recibirán notificaciones por correo.
                </p>
              </div>
            ) : !showPersonalForm && (
              <div className="space-y-3">
                {personalList.map((personal) => (
                  <div
                    key={personal.id}
                    className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                  >
                    {/* Icono avatar */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex-shrink-0">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                      </svg>
                    </div>

                    {/* Información */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <h6 className="font-semibold text-gray-800 dark:text-white text-sm">
                            {personal.nombre}
                          </h6>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {personal.correo}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                          personal.activo
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {personal.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      
                      {/* Carreras */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {personal.carreras.map((carrera, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                          >
                            {carrera}
                          </span>
                        ))}
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditarPersonal(personal)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 text-xs font-medium transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                          </svg>
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleActivoPersonal(personal)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            personal.activo
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                              : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                          }`}
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                          </svg>
                          {personal.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => handleEliminarPersonal(personal)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 text-xs font-medium transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                          </svg>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </ComponentCard>

      {/* Card 4: Gestión de Carreras */}
      <ComponentCard
        title="Gestión de Carreras"
        desc="Administra el catálogo de carreras que estarán disponibles para asignar al personal"
      >
        {isLoadingCarreras ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="animate-spin w-10 h-10 mx-auto text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Cargando carreras...</p>
          </div>
        ) : (
          <>
            {/* Header con botón agregar */}
            {!showCarreraForm && (
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">
                    {carrerasCompletas.length} carrera{carrerasCompletas.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  onClick={handleAgregarCarrera}
                  className="inline-flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 py-2.5 px-5 font-medium text-white text-sm shadow-theme-xs hover:shadow-lg transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
                  </svg>
                  Agregar Carrera
                </button>
              </div>
            )}

            {/* Formulario agregar/editar */}
            {showCarreraForm && (
              <div className="mb-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-6">
                <h5 className="text-base font-semibold text-gray-800 dark:text-white mb-5">
                  {editingCarreraId ? 'Editar Carrera' : 'Nueva Carrera'}
                </h5>
                
                <form onSubmit={handleGuardarCarrera} className="space-y-5">
                  {/* Nombre */}
                  <div>
                    <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nombre de la Carrera *
                    </label>
                    <input
                      type="text"
                      value={carreraFormData.nombre}
                      onChange={(e) => setCarreraFormData(prev => ({ ...prev, nombre: e.target.value }))}
                      placeholder="Ej: TSU en Inteligencia Artificial"
                      disabled={isSavingCarrera}
                      className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 transition-all disabled:opacity-50"
                      required
                    />
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tipo de Carrera *
                    </label>
                    <select
                      value={carreraFormData.tipo}
                      onChange={(e) => setCarreraFormData(prev => ({ ...prev, tipo: e.target.value as carrerasService.TipoCarrera }))}
                      disabled={isSavingCarrera}
                      className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 transition-all disabled:opacity-50"
                      required
                    >
                      {TIPOS_CARRERA.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Estado activo */}
                  <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <input
                      type="checkbox"
                      id="carrera-activa"
                      checked={carreraFormData.activo}
                      onChange={(e) => setCarreraFormData(prev => ({ ...prev, activo: e.target.checked }))}
                      disabled={isSavingCarrera}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 disabled:opacity-50"
                    />
                    <label htmlFor="carrera-activa" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                      Carrera activa (disponible para selección)
                    </label>
                  </div>

                  {/* Botones */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="submit"
                      disabled={isSavingCarrera}
                      className="inline-flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 py-2.5 px-6 font-medium text-white text-sm shadow-theme-xs hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSavingCarrera ? (
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
                          {editingCarreraId ? 'Actualizar' : 'Guardar'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelarCarrera}
                      disabled={isSavingCarrera}
                      className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2.5 px-6 font-medium text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Lista de carreras */}
            {carrerasCompletas.length === 0 && !showCarreraForm ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  No hay carreras registradas
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Agrega carreras para que puedan ser asignadas al personal.
                </p>
              </div>
            ) : !showCarreraForm && (
              <div className="space-y-3">
                {carrerasCompletas.map((carrera) => (
                  <div
                    key={carrera.id}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                  >
                    {/* Icono */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex-shrink-0">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
                      </svg>
                    </div>

                    {/* Información */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h6 className="font-semibold text-gray-800 dark:text-white text-sm">
                          {carrera.nombre}
                        </h6>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          carrera.activo
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {carrera.activo ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Tipo: {TIPOS_CARRERA.find(t => t.value === carrera.tipo)?.label}
                      </p>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEditarCarrera(carrera)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 text-xs font-medium transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                        </svg>
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleActivoCarrera(carrera)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          carrera.activo
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                        </svg>
                        {carrera.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleEliminarCarrera(carrera)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 text-xs font-medium transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </ComponentCard>
    </div>
  );
}
