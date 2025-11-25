import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { toastSuccess, toastError, confirmDialog } from '../../utils/alert';
import ComponentCard from '../../components/common/ComponentCard';

// Interfaces
interface Requisito {
  id: string;
  texto: string;
}

interface Paso {
  id: string;
  texto: string;
}

interface InformacionTramite {
  titulo: string;
  subtitulo: string;
  tiempoEntrega: string;
  costo: string;
  requisitos: Requisito[];
  pasos: Paso[];
}

// Datos iniciales por tipo de trámite
const datosInicialesPorTramite: { [key: string]: InformacionTramite } = {
  Inscripcion: {
    titulo: 'Inscripción',
    subtitulo: 'Departamento de Servicios Escolares - Universidad Tecnológica de Tecamachalco',
    tiempoEntrega: '1 día',
    costo: '$0.00',
    requisitos: [
      { id: '1', texto: 'Haber sido aceptado en el proceso de admisión' },
      { id: '2', texto: 'Presentar documentación completa' },
      { id: '3', texto: 'Realizar el pago correspondiente' },
    ],
    pasos: [
      { id: '1', texto: 'Verificar aceptación en el sistema' },
      { id: '2', texto: 'Entregar documentación en ventanilla' },
      { id: '3', texto: 'Realizar pago en caja' },
      { id: '4', texto: 'Recibir comprobante de inscripción' },
    ],
  },
  Reinscripcion: {
    titulo: 'Reinscripción a Ingeniería/Licenciatura (7° cuatrimestre)',
    subtitulo: 'Departamento de Servicios Escolares - Universidad Tecnológica de Tecamachalco',
    tiempoEntrega: '1 día',
    costo: '$0.00',
    requisitos: [
      { id: '1', texto: 'Ser estudiante regular de la institución' },
      { id: '2', texto: 'No tener adeudos con la institución' },
      { id: '3', texto: 'Haber aprobado el cuatrimestre anterior' },
    ],
    pasos: [
      { id: '1', texto: 'Ingresar al sistema de Servicios Escolares en Línea' },
      { id: '2', texto: 'Verificar datos personales y académicos' },
      { id: '3', texto: 'Confirmar reinscripción' },
      { id: '4', texto: 'Descargar comprobante' },
    ],
  },
  Constancias: {
    titulo: 'Solicitud de Constancia de Estudios o Kardex',
    subtitulo: 'Departamento de Servicios Escolares - Universidad Tecnológica de Tecamachalco',
    tiempoEntrega: '1 día',
    costo: '$49.00',
    requisitos: [
      { id: '1', texto: 'Ser o haber sido estudiante, o en su caso egresado de la Universidad' },
      { id: '2', texto: 'No contar con ningún adeudo con la Institución' },
      { id: '3', texto: 'Pagar el costo del servicio' },
    ],
    pasos: [
      { id: '1', texto: 'Descargar la orden pago de la página pagos en línea Puebla' },
      { id: '2', texto: 'Realizar el pago en cualquiera de las instituciones bancarias autorizadas' },
      { id: '3', texto: 'Ingresar a la página de la Universidad en Servicios Escolares en Línea' },
      { id: '4', texto: 'Elegir tu carrera y tipo de documento solicitado' },
      { id: '5', texto: 'Contestar el formulario con número de referencia de pago' },
    ],
  },
  Certificado: {
    titulo: 'Certificado de Estudios',
    subtitulo: 'Departamento de Servicios Escolares - Universidad Tecnológica de Tecamachalco',
    tiempoEntrega: '5 días hábiles',
    costo: '$150.00',
    requisitos: [
      { id: '1', texto: 'Haber concluido satisfactoriamente el plan de estudios' },
      { id: '2', texto: 'No tener adeudos con la institución' },
      { id: '3', texto: 'Presentar identificación oficial' },
    ],
    pasos: [
      { id: '1', texto: 'Solicitar el trámite en ventanilla de Servicios Escolares' },
      { id: '2', texto: 'Realizar el pago correspondiente' },
      { id: '3', texto: 'Esperar el tiempo de procesamiento' },
      { id: '4', texto: 'Recoger el certificado en la fecha indicada' },
    ],
  },
  CartaPasante: {
    titulo: 'Carta Pasante',
    subtitulo: 'Departamento de Servicios Escolares - Universidad Tecnológica de Tecamachalco',
    tiempoEntrega: '3 días hábiles',
    costo: '$100.00',
    requisitos: [
      { id: '1', texto: 'Haber concluido el 100% de los créditos del plan de estudios' },
      { id: '2', texto: 'No tener adeudos con la institución' },
      { id: '3', texto: 'Presentar solicitud por escrito' },
    ],
    pasos: [
      { id: '1', texto: 'Solicitar el trámite en ventanilla' },
      { id: '2', texto: 'Entregar documentación requerida' },
      { id: '3', texto: 'Realizar el pago correspondiente' },
      { id: '4', texto: 'Recoger la carta en la fecha indicada' },
    ],
  },
  IMSS: {
    titulo: 'Alta o Baja del IMSS',
    subtitulo: 'Departamento de Servicios Escolares - Universidad Tecnológica de Tecamachalco',
    tiempoEntrega: '3 días hábiles',
    costo: '$0.00',
    requisitos: [
      { id: '1', texto: 'Ser estudiante inscrito en el cuatrimestre vigente' },
      { id: '2', texto: 'Presentar CURP actualizada' },
      { id: '3', texto: 'Presentar comprobante de domicilio' },
    ],
    pasos: [
      { id: '1', texto: 'Acudir a ventanilla de Servicios Escolares' },
      { id: '2', texto: 'Entregar documentación requerida' },
      { id: '3', texto: 'Esperar confirmación del trámite' },
    ],
  },
  Credencializacion: {
    titulo: 'Credencialización',
    subtitulo: 'Departamento de Servicios Escolares - Universidad Tecnológica de Tecamachalco',
    tiempoEntrega: '5 días hábiles',
    costo: '$50.00',
    requisitos: [
      { id: '1', texto: 'Ser estudiante inscrito' },
      { id: '2', texto: 'Presentar fotografía reciente tamaño infantil' },
      { id: '3', texto: 'Realizar el pago correspondiente' },
    ],
    pasos: [
      { id: '1', texto: 'Acudir a ventanilla con fotografía' },
      { id: '2', texto: 'Llenar formato de solicitud' },
      { id: '3', texto: 'Realizar pago en caja' },
      { id: '4', texto: 'Recoger credencial en la fecha indicada' },
    ],
  },
  TituloProfesional: {
    titulo: 'Título Profesional Electrónico',
    subtitulo: 'Departamento de Servicios Escolares - Universidad Tecnológica de Tecamachalco',
    tiempoEntrega: '30 días hábiles',
    costo: '$2,500.00',
    requisitos: [
      { id: '1', texto: 'Haber concluido satisfactoriamente el plan de estudios' },
      { id: '2', texto: 'Haber liberado el servicio social' },
      { id: '3', texto: 'No tener adeudos con la institución' },
      { id: '4', texto: 'Presentar documentación completa' },
    ],
    pasos: [
      { id: '1', texto: 'Solicitar el trámite en ventanilla' },
      { id: '2', texto: 'Entregar documentación requerida' },
      { id: '3', texto: 'Realizar el pago correspondiente' },
      { id: '4', texto: 'Esperar validación de documentos' },
      { id: '5', texto: 'Firmar documentos digitales' },
      { id: '6', texto: 'Recibir título electrónico' },
    ],
  },
};

// Nombres amigables para mostrar
const nombresAmigables: { [key: string]: string } = {
  Inscripcion: 'Inscripción',
  Reinscripcion: 'Reinscripción',
  Constancias: 'Constancias y Kardex',
  Certificado: 'Certificado de Estudios',
  CartaPasante: 'Carta Pasante',
  IMSS: 'IMSS',
  Credencializacion: 'Credencialización',
  TituloProfesional: 'Título Profesional Electrónico',
};

export default function TramiteFormularioPage() {
  const { tramiteId } = useParams<{ tramiteId: string }>();
  const navigate = useNavigate();

  // Obtener datos iniciales según el tramiteId
  const datosIniciales = tramiteId && datosInicialesPorTramite[tramiteId] 
    ? datosInicialesPorTramite[tramiteId] 
    : datosInicialesPorTramite['Constancias'];

  // Estados
  const [informacion, setInformacion] = useState<InformacionTramite>(datosIniciales);
  const [editandoInfo, setEditandoInfo] = useState(false);
  const [infoTemporal, setInfoTemporal] = useState<InformacionTramite>(informacion);

  // Estado para nuevo requisito/paso
  const [nuevoRequisito, setNuevoRequisito] = useState('');
  const [nuevoPaso, setNuevoPaso] = useState('');

  // Handlers para información básica
  const handleGuardarInfo = () => {
    if (!infoTemporal.titulo.trim()) {
      toastError('El título es obligatorio');
      return;
    }
    if (!infoTemporal.subtitulo.trim()) {
      toastError('El subtítulo es obligatorio');
      return;
    }

    setInformacion(infoTemporal);
    setEditandoInfo(false);
    toastSuccess('Información actualizada correctamente');
  };

  const handleCancelarInfo = () => {
    setInfoTemporal(informacion);
    setEditandoInfo(false);
  };

  // Handlers para requisitos
  const handleAgregarRequisito = () => {
    if (!nuevoRequisito.trim()) {
      toastError('El requisito no puede estar vacío');
      return;
    }

    const nuevoReq: Requisito = {
      id: Date.now().toString(),
      texto: nuevoRequisito.trim(),
    };

    setInformacion(prev => ({
      ...prev,
      requisitos: [...prev.requisitos, nuevoReq],
    }));
    setNuevoRequisito('');
    toastSuccess('Requisito agregado');
  };

  const handleEliminarRequisito = async (id: string) => {
    const confirmed = await confirmDialog({
      title: 'Eliminar requisito',
      text: '¿Estás seguro de eliminar este requisito?',
    });
    if (!confirmed) return;

    setInformacion(prev => ({
      ...prev,
      requisitos: prev.requisitos.filter(r => r.id !== id),
    }));
    toastSuccess('Requisito eliminado');
  };

  const handleEditarRequisito = (id: string, nuevoTexto: string) => {
    setInformacion(prev => ({
      ...prev,
      requisitos: prev.requisitos.map(r => 
        r.id === id ? { ...r, texto: nuevoTexto } : r
      ),
    }));
  };

  // Handlers para pasos
  const handleAgregarPaso = () => {
    if (!nuevoPaso.trim()) {
      toastError('El paso no puede estar vacío');
      return;
    }

    const nuevoPasoObj: Paso = {
      id: Date.now().toString(),
      texto: nuevoPaso.trim(),
    };

    setInformacion(prev => ({
      ...prev,
      pasos: [...prev.pasos, nuevoPasoObj],
    }));
    setNuevoPaso('');
    toastSuccess('Paso agregado');
  };

  const handleEliminarPaso = async (id: string) => {
    const confirmed = await confirmDialog({
      title: 'Eliminar paso',
      text: '¿Estás seguro de eliminar este paso?',
    });
    if (!confirmed) return;

    setInformacion(prev => ({
      ...prev,
      pasos: prev.pasos.filter(p => p.id !== id),
    }));
    toastSuccess('Paso eliminado');
  };

  const handleEditarPaso = (id: string, nuevoTexto: string) => {
    setInformacion(prev => ({
      ...prev,
      pasos: prev.pasos.map(p => 
        p.id === id ? { ...p, texto: nuevoTexto } : p
      ),
    }));
  };

  // Mover requisito/paso
  const moverRequisito = (index: number, direccion: 'arriba' | 'abajo') => {
    const nuevosRequisitos = [...informacion.requisitos];
    const nuevoIndex = direccion === 'arriba' ? index - 1 : index + 1;
    if (nuevoIndex < 0 || nuevoIndex >= nuevosRequisitos.length) return;
    [nuevosRequisitos[index], nuevosRequisitos[nuevoIndex]] = [nuevosRequisitos[nuevoIndex], nuevosRequisitos[index]];
    setInformacion(prev => ({ ...prev, requisitos: nuevosRequisitos }));
  };

  const moverPaso = (index: number, direccion: 'arriba' | 'abajo') => {
    const nuevosPasos = [...informacion.pasos];
    const nuevoIndex = direccion === 'arriba' ? index - 1 : index + 1;
    if (nuevoIndex < 0 || nuevoIndex >= nuevosPasos.length) return;
    [nuevosPasos[index], nuevosPasos[nuevoIndex]] = [nuevosPasos[nuevoIndex], nuevosPasos[index]];
    setInformacion(prev => ({ ...prev, pasos: nuevosPasos }));
  };

  const nombreTramite = tramiteId ? nombresAmigables[tramiteId] || tramiteId : 'Trámite';

  return (
    <div className="space-y-6">
      {/* Botón regresar */}
      <button
        onClick={() => navigate('/ServiciosEscolares/Tramites')}
        className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
      >
        <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
        </svg>
        Volver a Trámites
      </button>

      {/* Card 1: Información Básica */}
      <ComponentCard
        title={`Configuración: ${nombreTramite}`}
        desc="Configura el título, subtítulo, tiempo de entrega y costo del trámite"
      >
        {!editandoInfo ? (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Título</span>
                  <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white">{informacion.titulo}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subtítulo</span>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{informacion.subtitulo}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tiempo de Entrega</span>
                  <p className="mt-1 text-sm text-[#00796B] font-medium">{informacion.tiempoEntrega}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Costo</span>
                  <p className="mt-1 text-sm text-[#00796B] font-medium">{informacion.costo}</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => {
                setInfoTemporal(informacion);
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Título *
                </label>
                <input
                  type="text"
                  value={infoTemporal.titulo}
                  onChange={(e) => setInfoTemporal(prev => ({ ...prev, titulo: e.target.value }))}
                  className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 transition-all"
                />
              </div>
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subtítulo *
                </label>
                <input
                  type="text"
                  value={infoTemporal.subtitulo}
                  onChange={(e) => setInfoTemporal(prev => ({ ...prev, subtitulo: e.target.value }))}
                  className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 transition-all"
                />
              </div>
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tiempo de Entrega
                </label>
                <input
                  type="text"
                  value={infoTemporal.tiempoEntrega}
                  onChange={(e) => setInfoTemporal(prev => ({ ...prev, tiempoEntrega: e.target.value }))}
                  placeholder="Ej: 1 día, 3 días hábiles"
                  className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 transition-all"
                />
              </div>
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Costo
                </label>
                <input
                  type="text"
                  value={infoTemporal.costo}
                  onChange={(e) => setInfoTemporal(prev => ({ ...prev, costo: e.target.value }))}
                  placeholder="Ej: $49.00, $0.00"
                  className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 transition-all"
                />
              </div>
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

      {/* Card 2: Requisitos */}
      <ComponentCard
        title="Requisitos"
        desc="Lista de requisitos que el estudiante debe cumplir para realizar este trámite"
      >
        {/* Lista de requisitos */}
        <div className="space-y-3 mb-6">
          {informacion.requisitos.map((requisito, index) => (
            <div
              key={requisito.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00796B]/10 text-[#00796B] font-semibold text-xs flex-shrink-0">
                {index + 1}
              </div>
              
              <input
                type="text"
                value={requisito.texto}
                onChange={(e) => handleEditarRequisito(requisito.id, e.target.value)}
                className="flex-1 h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />

              <div className="flex items-center gap-1">
                <button
                  onClick={() => moverRequisito(index, 'arriba')}
                  disabled={index === 0}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" />
                  </svg>
                </button>
                <button
                  onClick={() => moverRequisito(index, 'abajo')}
                  disabled={index === informacion.requisitos.length - 1}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleEliminarRequisito(requisito.id)}
                  className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Agregar nuevo requisito */}
        <div className="flex gap-3">
          <input
            type="text"
            value={nuevoRequisito}
            onChange={(e) => setNuevoRequisito(e.target.value)}
            placeholder="Nuevo requisito..."
            className="flex-1 h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleAgregarRequisito()}
          />
          <button
            onClick={handleAgregarRequisito}
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 py-2.5 px-5 font-medium text-white text-sm shadow-theme-xs hover:shadow-lg transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Agregar
          </button>
        </div>
      </ComponentCard>

      {/* Card 3: Pasos a Seguir */}
      <ComponentCard
        title="Pasos a Seguir"
        desc="Instrucciones que el estudiante debe seguir para completar el trámite"
      >
        {/* Lista de pasos */}
        <div className="space-y-3 mb-6">
          {informacion.pasos.map((paso, index) => (
            <div
              key={paso.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-semibold text-xs flex-shrink-0">
                {index + 1}
              </div>
              
              <input
                type="text"
                value={paso.texto}
                onChange={(e) => handleEditarPaso(paso.id, e.target.value)}
                className="flex-1 h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />

              <div className="flex items-center gap-1">
                <button
                  onClick={() => moverPaso(index, 'arriba')}
                  disabled={index === 0}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" />
                  </svg>
                </button>
                <button
                  onClick={() => moverPaso(index, 'abajo')}
                  disabled={index === informacion.pasos.length - 1}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleEliminarPaso(paso.id)}
                  className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Agregar nuevo paso */}
        <div className="flex gap-3">
          <input
            type="text"
            value={nuevoPaso}
            onChange={(e) => setNuevoPaso(e.target.value)}
            placeholder="Nuevo paso..."
            className="flex-1 h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleAgregarPaso()}
          />
          <button
            onClick={handleAgregarPaso}
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 py-2.5 px-5 font-medium text-white text-sm shadow-theme-xs hover:shadow-lg transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Agregar
          </button>
        </div>
      </ComponentCard>

      {/* Vista Previa */}
      <ComponentCard
        title="Vista Previa"
        desc="Así se verá la sección de información importante en la página del trámite"
      >
        <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-6">
          {/* Título */}
          <h2 className="text-2xl font-bold text-[#d1672a] text-center mb-2" style={{ fontFamily: 'serif' }}>
            {informacion.titulo}
          </h2>
          
          {/* Subtítulo */}
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6 text-sm">
            {informacion.subtitulo}
          </p>

          {/* Sección de información */}
          <div className="bg-gradient-to-r from-[#d1672a] to-[#e87d3a] rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                </svg>
              </div>
              <span className="font-semibold text-lg">Información importante sobre este trámite</span>
            </div>

            {/* Tiempo de entrega */}
            <div className="flex items-center justify-between py-3 border-b border-white/20">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z" />
                </svg>
                <span className="font-medium">Tiempo de entrega</span>
              </div>
              <span className="text-white/90">{informacion.tiempoEntrega}</span>
            </div>

            {/* Requisitos */}
            <div className="py-4 border-b border-white/20">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19,2H5C3.9,2 3,2.9 3,4V20C3,21.1 3.9,22 5,22H19C20.1,22 21,21.1 21,20V4C21,2.9 20.1,2 19,2M19,20H5V4H19V20M7,18H17V16H7V18M7,14H17V12H7V14M7,10H17V6H7V10Z" />
                </svg>
                <span className="font-medium">Requisitos</span>
              </div>
              <ul className="space-y-2 ml-7">
                {informacion.requisitos.map((req) => (
                  <li key={req.id} className="flex items-start gap-2 text-sm text-white/90">
                    <span className="text-white/60">→</span>
                    {req.texto}
                  </li>
                ))}
              </ul>
            </div>

            {/* Costo */}
            <div className="flex items-center justify-between py-3 border-b border-white/20">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
                </svg>
                <span className="font-medium">Costo</span>
              </div>
              <span className="text-white/90 font-semibold">{informacion.costo}</span>
            </div>

            {/* Pasos a seguir */}
            <div className="py-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19,2H5C3.9,2 3,2.9 3,4V20C3,21.1 3.9,22 5,22H19C20.1,22 21,21.1 21,20V4C21,2.9 20.1,2 19,2M19,20H5V4H19V20M7,18H17V16H7V18M7,14H17V12H7V14M7,10H17V6H7V10Z" />
                </svg>
                <span className="font-medium">Pasos a seguir</span>
              </div>
              <ul className="space-y-2 ml-7">
                {informacion.pasos.map((paso) => (
                  <li key={paso.id} className="flex items-start gap-2 text-sm text-white/90">
                    <span className="text-white/60">→</span>
                    {paso.texto}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
