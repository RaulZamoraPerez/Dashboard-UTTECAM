import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { toastSuccess, toastError, confirmDialog } from '../../utils/alert';
import ComponentCard from '../../components/common/ComponentCard';
import * as tramiteService from '../../services/tramiteFormularioService';

// Interfaces
interface Requisito {
  id: string;
  index?: number;
  texto: string;
}

interface Paso {
  id: string;
  index?: number;
  texto: string;
}

interface Documento {
  id: string;
  index?: number;
  texto: string;
}

interface InformacionTramite {
  titulo: string;
  subtitulo: string;
  descripcion: string;
  tiempoEntrega: string;
  costo: string;
  requisitos: Requisito[];
  pasos: Paso[];
  documentos: Documento[];
}

// Datos iniciales por tipo de trámite
const datosInicialesPorTramite: { [key: string]: InformacionTramite } = {
  Inscripcion: {
    titulo: 'Inscripción',
    subtitulo: 'Departamento de Servicios Escolares - Universidad Tecnológica de Tecamachalco',
    descripcion: 'Proceso de registro para nuevo ingreso a la institución. Este trámite permite formalizar tu inscripción como estudiante de la Universidad Tecnológica de Tecamachalco.',
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
    documentos: [
      { id: '1', texto: 'Acta de nacimiento (original y copia)' },
      { id: '2', texto: 'Certificado de bachillerato (original y copia)' },
      { id: '3', texto: 'CURP actualizada' },
      { id: '4', texto: 'Fotografías tamaño infantil' },
    ],
  },
  Reinscripcion: {
    titulo: 'Reinscripción a Ingeniería/Licenciatura (7° cuatrimestre)',
    subtitulo: 'Departamento de Servicios Escolares - Universidad Tecnológica de Tecamachalco',
    descripcion: 'Proceso de actualización de datos y continuidad de estudios para estudiantes que ingresan al séptimo cuatrimestre de Ingeniería o Licenciatura.',
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
    documentos: [
      { id: '1', texto: 'Credencial de estudiante vigente' },
      { id: '2', texto: 'Comprobante de pago del cuatrimestre anterior' },
    ],
  },
  Constancias: {
    titulo: 'Solicitud de Constancia de Estudios o Kardex',
    subtitulo: 'Departamento de Servicios Escolares - Universidad Tecnológica de Tecamachalco',
    descripcion: 'Documento oficial que acredita tu situación académica actual o historial de calificaciones. Útil para trámites laborales, becas y otros fines oficiales.',
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
    documentos: [
      { id: '1', texto: 'Identificación oficial vigente' },
      { id: '2', texto: 'Comprobante de pago' },
    ],
  },
  Certificado: {
    titulo: 'Certificado de Estudios',
    subtitulo: 'Departamento de Servicios Escolares - Universidad Tecnológica de Tecamachalco',
    descripcion: 'Documento oficial que certifica la conclusión de tus estudios y el historial académico completo. Requisito indispensable para trámites de titulación y ejercicio profesional.',
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
    documentos: [
      { id: '1', texto: 'Identificación oficial vigente' },
      { id: '2', texto: 'Comprobante de pago' },
      { id: '3', texto: 'Acta de nacimiento (copia)' },
    ],
  },
  CartaPasante: {
    titulo: 'Carta Pasante',
    subtitulo: 'Departamento de Servicios Escolares - Universidad Tecnológica de Tecamachalco',
    descripcion: 'Documento que acredita la conclusión del 100% de los créditos del plan de estudios. Permite ejercer temporalmente mientras se realiza el trámite de titulación.',
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
    documentos: [
      { id: '1', texto: 'Identificación oficial vigente' },
      { id: '2', texto: 'Comprobante de pago' },
      { id: '3', texto: 'Constancia de no adeudo' },
    ],
  },
  IMSS: {
    titulo: 'Alta o Baja del IMSS',
    subtitulo: 'Departamento de Servicios Escolares - Universidad Tecnológica de Tecamachalco',
    descripcion: 'Trámite para dar de alta o baja en el Instituto Mexicano del Seguro Social como estudiante. Permite acceder a servicios médicos durante tu estancia en la universidad.',
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
    documentos: [
      { id: '1', texto: 'CURP actualizada' },
      { id: '2', texto: 'Comprobante de domicilio reciente' },
      { id: '3', texto: 'Credencial de estudiante vigente' },
    ],
  },
  Credencializacion: {
    titulo: 'Credencialización',
    subtitulo: 'Departamento de Servicios Escolares - Universidad Tecnológica de Tecamachalco',
    descripcion: 'Trámite para obtener o renovar la credencial de estudiante. Documento oficial que te identifica como alumno activo de la institución.',
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
    documentos: [
      { id: '1', texto: 'Fotografía tamaño infantil (fondo blanco)' },
      { id: '2', texto: 'Comprobante de inscripción vigente' },
      { id: '3', texto: 'Comprobante de pago' },
    ],
  },
  TituloProfesional: {
    titulo: 'Título Profesional Electrónico',
    subtitulo: 'Departamento de Servicios Escolares - Universidad Tecnológica de Tecamachalco',
    descripcion: 'Documento oficial que acredita la conclusión de tus estudios profesionales y te autoriza para ejercer legalmente tu profesión. El título electrónico tiene validez oficial ante la SEP.',
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
    documentos: [
      { id: '1', texto: 'Acta de nacimiento (original y copia)' },
      { id: '2', texto: 'Certificado de estudios' },
      { id: '3', texto: 'Carta de liberación de servicio social' },
      { id: '4', texto: 'CURP actualizada' },
      { id: '5', texto: 'Fotografías tamaño título' },
      { id: '6', texto: 'Comprobante de pago' },
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

// Mapeo de tramiteId a tipo de API
const tipoApiPorTramite: { [key: string]: string | null } = {
  Inscripcion: null,
  Reinscripcion: null,
  Constancias: 'kardex_constancias', // Solo este tiene conexión a API por ahora
  Certificado: null,
  CartaPasante: null,
  IMSS: null,
  Credencializacion: null,
  TituloProfesional: null,
};

export default function TramiteFormularioPage() {
  const { tramiteId } = useParams<{ tramiteId: string }>();
  const navigate = useNavigate();

  // Obtener datos iniciales según el tramiteId
  const datosIniciales = tramiteId && datosInicialesPorTramite[tramiteId] 
    ? datosInicialesPorTramite[tramiteId] 
    : datosInicialesPorTramite['Constancias'];

  // Obtener el tipo de API para este trámite
  const tipoApi = tramiteId ? tipoApiPorTramite[tramiteId] : null;

  // Estados
  const [informacion, setInformacion] = useState<InformacionTramite>(datosIniciales);
  const [editandoInfo, setEditandoInfo] = useState(false);
  const [infoTemporal, setInfoTemporal] = useState<InformacionTramite>(informacion);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Estados para edición inline de requisitos, pasos y documentos
  const [editandoRequisitoIndex, setEditandoRequisitoIndex] = useState<number | null>(null);
  const [editandoPasoIndex, setEditandoPasoIndex] = useState<number | null>(null);
  const [editandoDocumentoIndex, setEditandoDocumentoIndex] = useState<number | null>(null);
  const [textoEditando, setTextoEditando] = useState('');
  const [isSavingItem, setIsSavingItem] = useState(false);

  // Estado para nuevo requisito/paso/documento
  const [nuevoRequisito, setNuevoRequisito] = useState('');
  const [nuevoPaso, setNuevoPaso] = useState('');
  const [nuevoDocumento, setNuevoDocumento] = useState('');
  const [isAddingRequisito, setIsAddingRequisito] = useState(false);
  const [isAddingPaso, setIsAddingPaso] = useState(false);
  const [isAddingDocumento, setIsAddingDocumento] = useState(false);

  // Función para recargar solo requisitos
  const reloadRequisitos = async () => {
    if (!tipoApi) return;
    try {
      // Pequeño delay para asegurar que el backend haya persistido los cambios
      await new Promise(resolve => setTimeout(resolve, 300));
      const requisitosData = await tramiteService.getRequisitos(tipoApi);
      setInformacion(prev => ({
        ...prev,
        requisitos: requisitosData.map((r, idx) => ({
          id: r.id || idx.toString(),
          index: r.index ?? idx,
          texto: r.texto || '',
        })),
      }));
    } catch (error) {
      console.error('Error al recargar requisitos:', error);
    }
  };

  // Función para recargar solo pasos
  const reloadPasos = async () => {
    if (!tipoApi) return;
    try {
      // Pequeño delay para asegurar que el backend haya persistido los cambios
      await new Promise(resolve => setTimeout(resolve, 300));
      const pasosData = await tramiteService.getPasos(tipoApi);
      setInformacion(prev => ({
        ...prev,
        pasos: pasosData.map((p, idx) => ({
          id: p.id || idx.toString(),
          index: p.index ?? idx,
          texto: p.texto || '',
        })),
      }));
    } catch (error) {
      console.error('Error al recargar pasos:', error);
    }
  };

  // Función para recargar solo documentos
  const reloadDocumentos = async () => {
    if (!tipoApi) return;
    try {
      // Pequeño delay para asegurar que el backend haya persistido los cambios
      await new Promise(resolve => setTimeout(resolve, 300));
      const documentosData = await tramiteService.getDocumentos(tipoApi);
      setInformacion(prev => ({
        ...prev,
        documentos: documentosData.map((d, idx) => ({
          id: d.id || idx.toString(),
          index: d.index ?? idx,
          texto: d.texto || '',
        })),
      }));
    } catch (error) {
      console.error('Error al recargar documentos:', error);
    }
  };

  // Cargar datos desde la API al montar el componente
  // Datos por defecto para kardex_constancias
  const datosDefaultKardex = {
    info: {
      titulo: 'Solicitud de Constancia de Estudios o Kardex',
      subtitulo: 'Departamento de Servicios Escolares - Universidad Tecnológica de Tecamachalco',
      descripcion: '', // Sin descripción según indicaciones
      tiempoEntrega: '1 día',
      costo: '$49.00',
    },
    requisitos: [
      'Ser o haber sido estudiante, o en su caso egresado de la Universidad',
      'No contar con ningún adeudo con la Institución',
      'Pagar el costo del servicio',
    ],
    pasos: [
      'Descargar la orden pago de la página pagos en línea Puebla',
      'Realizar el pago en cualquiera de las instituciones bancarias autorizadas',
      'Ingresar a la página de la Universidad en Servicios Escolares en Línea',
      'Elegir tu carrera y tipo de documento solicitado',
      'Contestar el formulario con número de referencia de pago',
      'Presentarse en ventanilla con el comprobante de pago original',
    ],
    documentos: [
      'Identificarse con credencial de estudiante o INE',
      'Original y copia de la orden y comprobante de pago',
    ],
  };

  useEffect(() => {
    if (!tipoApi) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Cargar todas las secciones en paralelo
        const [infoData, requisitosData, pasosData, documentosData] = await Promise.all([
          tramiteService.getInfoPrincipal(tipoApi),
          tramiteService.getRequisitos(tipoApi),
          tramiteService.getPasos(tipoApi),
          tramiteService.getDocumentos(tipoApi),
        ]);

        // Determinar si necesitamos crear datos por defecto
        const needsDefaultData = !infoData && requisitosData.length === 0 && pasosData.length === 0 && documentosData.length === 0;

        if (needsDefaultData && tipoApi === 'kardex_constancias') {
          // Crear datos por defecto para kardex_constancias
          try {
            // Crear info principal
            await tramiteService.createInfoPrincipal(tipoApi, datosDefaultKardex.info);
            
            // Crear requisitos
            for (const requisito of datosDefaultKardex.requisitos) {
              await tramiteService.createRequisito(tipoApi, { texto: requisito });
            }
            
            // Crear pasos
            for (const paso of datosDefaultKardex.pasos) {
              await tramiteService.createPaso(tipoApi, { texto: paso });
            }
            
            // Crear documentos
            for (const documento of datosDefaultKardex.documentos) {
              await tramiteService.createDocumento(tipoApi, { texto: documento });
            }

            // Actualizar estado con los datos creados
            setInformacion(prev => ({
              ...prev,
              ...datosDefaultKardex.info,
              requisitos: datosDefaultKardex.requisitos.map((texto, idx) => ({
                id: idx.toString(),
                index: idx,
                texto,
              })),
              pasos: datosDefaultKardex.pasos.map((texto, idx) => ({
                id: idx.toString(),
                index: idx,
                texto,
              })),
              documentos: datosDefaultKardex.documentos.map((texto, idx) => ({
                id: idx.toString(),
                index: idx,
                texto,
              })),
            }));
            setInfoTemporal(prev => ({
              ...prev,
              ...datosDefaultKardex.info,
            }));
          } catch (error) {
            console.error('Error al crear datos por defecto:', error);
          }
        } else {
          // Usar datos existentes del servidor
          if (infoData) {
            setInformacion(prev => ({
              ...prev,
              titulo: infoData.titulo || '',
              subtitulo: infoData.subtitulo || '',
              descripcion: infoData.descripcion || '',
              tiempoEntrega: infoData.tiempoEntrega || '',
              costo: infoData.costo || '',
            }));
            setInfoTemporal(prev => ({
              ...prev,
              titulo: infoData.titulo || '',
              subtitulo: infoData.subtitulo || '',
              descripcion: infoData.descripcion || '',
              tiempoEntrega: infoData.tiempoEntrega || '',
              costo: infoData.costo || '',
            }));
          }

          // Actualizar requisitos
          if (requisitosData.length > 0) {
            setInformacion(prev => ({
              ...prev,
              requisitos: requisitosData.map((r, idx) => ({
                id: r.id || idx.toString(),
                index: r.index ?? idx,
                texto: r.texto,
              })),
            }));
          }

          // Actualizar pasos
          if (pasosData.length > 0) {
            setInformacion(prev => ({
              ...prev,
              pasos: pasosData.map((p, idx) => ({
                id: p.id || idx.toString(),
                index: p.index ?? idx,
                texto: p.texto,
              })),
            }));
          }

          // Actualizar documentos
          if (documentosData.length > 0) {
            setInformacion(prev => ({
              ...prev,
              documentos: documentosData.map((d, idx) => ({
                id: d.id || idx.toString(),
                index: d.index ?? idx,
                texto: d.texto,
              })),
            }));
          }
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tipoApi]);

  // Handlers para información básica
  const handleGuardarInfo = async () => {
    if (!infoTemporal.titulo.trim()) {
      toastError('El título es obligatorio');
      return;
    }
    if (!infoTemporal.subtitulo.trim()) {
      toastError('El subtítulo es obligatorio');
      return;
    }

    if (tipoApi) {
      setIsSavingInfo(true);
      try {
        const data = {
          titulo: infoTemporal.titulo.trim(),
          subtitulo: infoTemporal.subtitulo.trim(),
          descripcion: infoTemporal.descripcion.trim(),
          tiempoEntrega: infoTemporal.tiempoEntrega.trim(),
          costo: infoTemporal.costo.trim(),
        };

        // Intentar actualizar, si falla crear
        try {
          await tramiteService.updateInfoPrincipal(tipoApi, data);
        } catch {
          await tramiteService.createInfoPrincipal(tipoApi, data);
        }

        setInformacion(prev => ({ ...prev, ...data }));
        setEditandoInfo(false);
        toastSuccess('Información actualizada correctamente');
      } catch (error) {
        if (error instanceof Error) {
          toastError(error.message);
        } else {
          toastError('Error al guardar la información');
        }
      } finally {
        setIsSavingInfo(false);
      }
    } else {
      setInformacion(infoTemporal);
      setEditandoInfo(false);
      toastSuccess('Información actualizada correctamente');
    }
  };

  const handleCancelarInfo = () => {
    setInfoTemporal(informacion);
    setEditandoInfo(false);
  };

  // Handlers para requisitos
  const handleAgregarRequisito = async () => {
    if (!nuevoRequisito.trim()) {
      toastError('El requisito no puede estar vacío');
      return;
    }

    if (tipoApi) {
      setIsAddingRequisito(true);
      try {
        await tramiteService.createRequisito(tipoApi, { texto: nuevoRequisito.trim() });
        // Recargar desde el servidor para obtener datos actualizados
        await reloadRequisitos();
        setNuevoRequisito('');
        toastSuccess('Requisito agregado');
      } catch (error) {
        if (error instanceof Error) {
          toastError(error.message);
        } else {
          toastError('Error al agregar requisito');
        }
      } finally {
        setIsAddingRequisito(false);
      }
    } else {
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
    }
  };

  const handleEliminarRequisito = async (id: string, index: number) => {
    const confirmed = await confirmDialog({
      title: 'Eliminar requisito',
      text: '¿Estás seguro de eliminar este requisito?',
    });
    if (!confirmed) return;

    if (tipoApi) {
      try {
        await tramiteService.deleteRequisito(tipoApi, index);
        // Recargar desde el servidor para sincronizar índices
        await reloadRequisitos();
        toastSuccess('Requisito eliminado');
      } catch (error) {
        if (error instanceof Error) {
          toastError(error.message);
        } else {
          toastError('Error al eliminar requisito');
        }
      }
    } else {
      setInformacion(prev => ({
        ...prev,
        requisitos: prev.requisitos.filter(r => r.id !== id),
      }));
      toastSuccess('Requisito eliminado');
    }
  };

  const handleIniciarEdicionRequisito = (index: number, texto: string) => {
    setEditandoRequisitoIndex(index);
    setTextoEditando(texto || '');
  };

  const handleGuardarEdicionRequisito = async (id: string, index: number) => {
    if (!textoEditando.trim()) {
      toastError('El requisito no puede estar vacío');
      return;
    }

    if (tipoApi) {
      setIsSavingItem(true);
      try {
        await tramiteService.updateRequisito(tipoApi, index, { texto: textoEditando.trim() });
        // Recargar desde el servidor para sincronizar
        await reloadRequisitos();
        setEditandoRequisitoIndex(null);
        setTextoEditando('');
        toastSuccess('Requisito actualizado');
      } catch (error) {
        console.error('Error al actualizar requisito:', error);
        if (error instanceof Error) {
          toastError(error.message);
        } else {
          toastError('Error al actualizar requisito');
        }
      } finally {
        setIsSavingItem(false);
      }
    } else {
      setInformacion(prev => ({
        ...prev,
        requisitos: prev.requisitos.map(r => 
          r.id === id ? { ...r, texto: textoEditando.trim() } : r
        ),
      }));
      setEditandoRequisitoIndex(null);
      setTextoEditando('');
      toastSuccess('Requisito actualizado');
    }
  };

  const handleCancelarEdicionRequisito = () => {
    setEditandoRequisitoIndex(null);
    setTextoEditando('');
  };

  // Handlers para pasos
  const handleAgregarPaso = async () => {
    if (!nuevoPaso.trim()) {
      toastError('El paso no puede estar vacío');
      return;
    }

    if (tipoApi) {
      setIsAddingPaso(true);
      try {
        await tramiteService.createPaso(tipoApi, { texto: nuevoPaso.trim() });
        // Recargar desde el servidor
        await reloadPasos();
        setNuevoPaso('');
        toastSuccess('Paso agregado');
      } catch (error) {
        if (error instanceof Error) {
          toastError(error.message);
        } else {
          toastError('Error al agregar paso');
        }
      } finally {
        setIsAddingPaso(false);
      }
    } else {
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
    }
  };

  const handleEliminarPaso = async (id: string, index: number) => {
    const confirmed = await confirmDialog({
      title: 'Eliminar paso',
      text: '¿Estás seguro de eliminar este paso?',
    });
    if (!confirmed) return;

    if (tipoApi) {
      try {
        await tramiteService.deletePaso(tipoApi, index);
        // Recargar desde el servidor para sincronizar índices
        await reloadPasos();
        toastSuccess('Paso eliminado');
      } catch (error) {
        if (error instanceof Error) {
          toastError(error.message);
        } else {
          toastError('Error al eliminar paso');
        }
      }
    } else {
      setInformacion(prev => ({
        ...prev,
        pasos: prev.pasos.filter(p => p.id !== id),
      }));
      toastSuccess('Paso eliminado');
    }
  };

  const handleIniciarEdicionPaso = (index: number, texto: string) => {
    setEditandoPasoIndex(index);
    setTextoEditando(texto || '');
  };

  const handleGuardarEdicionPaso = async (id: string, index: number) => {
    if (!textoEditando.trim()) {
      toastError('El paso no puede estar vacío');
      return;
    }

    if (tipoApi) {
      setIsSavingItem(true);
      try {
        await tramiteService.updatePaso(tipoApi, index, { texto: textoEditando.trim() });
        // Recargar desde el servidor
        await reloadPasos();
        setEditandoPasoIndex(null);
        setTextoEditando('');
        toastSuccess('Paso actualizado');
      } catch (error) {
        if (error instanceof Error) {
          toastError(error.message);
        } else {
          toastError('Error al actualizar paso');
        }
      } finally {
        setIsSavingItem(false);
      }
    } else {
      setInformacion(prev => ({
        ...prev,
        pasos: prev.pasos.map(p => 
          p.id === id ? { ...p, texto: textoEditando.trim() } : p
        ),
      }));
      setEditandoPasoIndex(null);
      setTextoEditando('');
      toastSuccess('Paso actualizado');
    }
  };

  const handleCancelarEdicionPaso = () => {
    setEditandoPasoIndex(null);
    setTextoEditando('');
  };

  // Handlers para documentos
  const handleAgregarDocumento = async () => {
    if (!nuevoDocumento.trim()) {
      toastError('El documento no puede estar vacío');
      return;
    }

    if (tipoApi) {
      setIsAddingDocumento(true);
      try {
        await tramiteService.createDocumento(tipoApi, { texto: nuevoDocumento.trim() });
        // Recargar desde el servidor
        await reloadDocumentos();
        setNuevoDocumento('');
        toastSuccess('Documento agregado');
      } catch (error) {
        if (error instanceof Error) {
          toastError(error.message);
        } else {
          toastError('Error al agregar documento');
        }
      } finally {
        setIsAddingDocumento(false);
      }
    } else {
      const nuevoDoc: Documento = {
        id: Date.now().toString(),
        texto: nuevoDocumento.trim(),
      };
      setInformacion(prev => ({
        ...prev,
        documentos: [...prev.documentos, nuevoDoc],
      }));
      setNuevoDocumento('');
      toastSuccess('Documento agregado');
    }
  };

  const handleEliminarDocumento = async (id: string, index: number) => {
    const confirmed = await confirmDialog({
      title: 'Eliminar documento',
      text: '¿Estás seguro de eliminar este documento?',
    });
    if (!confirmed) return;

    if (tipoApi) {
      try {
        await tramiteService.deleteDocumento(tipoApi, index);
        // Recargar desde el servidor para sincronizar índices
        await reloadDocumentos();
        toastSuccess('Documento eliminado');
      } catch (error) {
        if (error instanceof Error) {
          toastError(error.message);
        } else {
          toastError('Error al eliminar documento');
        }
      }
    } else {
      setInformacion(prev => ({
        ...prev,
        documentos: prev.documentos.filter(d => d.id !== id),
      }));
      toastSuccess('Documento eliminado');
    }
  };

  const handleIniciarEdicionDocumento = (index: number, texto: string) => {
    setEditandoDocumentoIndex(index);
    setTextoEditando(texto || '');
  };

  const handleGuardarEdicionDocumento = async (id: string, index: number) => {
    if (!textoEditando.trim()) {
      toastError('El documento no puede estar vacío');
      return;
    }

    if (tipoApi) {
      setIsSavingItem(true);
      try {
        await tramiteService.updateDocumento(tipoApi, index, { texto: textoEditando.trim() });
        // Recargar desde el servidor
        await reloadDocumentos();
        setEditandoDocumentoIndex(null);
        setTextoEditando('');
        toastSuccess('Documento actualizado');
      } catch (error) {
        if (error instanceof Error) {
          toastError(error.message);
        } else {
          toastError('Error al actualizar documento');
        }
      } finally {
        setIsSavingItem(false);
      }
    } else {
      setInformacion(prev => ({
        ...prev,
        documentos: prev.documentos.map(d => 
          d.id === id ? { ...d, texto: textoEditando.trim() } : d
        ),
      }));
      setEditandoDocumentoIndex(null);
      setTextoEditando('');
      toastSuccess('Documento actualizado');
    }
  };

  const handleCancelarEdicionDocumento = () => {
    setEditandoDocumentoIndex(null);
    setTextoEditando('');
  };

  const nombreTramite = tramiteId ? nombresAmigables[tramiteId] || tramiteId : 'Trámite';

  // Pantalla de carga inicial
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <svg className="w-12 h-12 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando información del trámite...</p>
      </div>
    );
  }

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
                <div className="md:col-span-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descripción</span>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{informacion.descripcion || '(Sin descripción)'}</p>
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
              <div className="md:col-span-2">
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descripción
                </label>
                <textarea
                  value={infoTemporal.descripcion}
                  onChange={(e) => setInfoTemporal(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción detallada del trámite..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 transition-all"
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
                disabled={isSavingInfo}
                className="inline-flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 py-2.5 px-6 font-medium text-white text-sm shadow-theme-xs hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingInfo ? (
                  <>
                    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
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
                    Guardar Cambios
                  </>
                )}
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
              
              {editandoRequisitoIndex === index ? (
                // Modo edición
                <>
                  <input
                    type="text"
                    value={textoEditando || ''}
                    onChange={(e) => setTextoEditando(e.target.value)}
                    className="flex-1 h-9 rounded-lg border border-brand-400 dark:border-brand-500 bg-transparent dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    autoFocus
                  />
                  <button
                    onClick={() => handleGuardarEdicionRequisito(requisito.id!, index)}
                    disabled={isSavingItem}
                    className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50"
                  >
                    {isSavingItem ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={handleCancelarEdicionRequisito}
                    className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                    </svg>
                  </button>
                </>
              ) : (
                // Modo visualización
                <>
                  <span className="flex-1 text-sm text-gray-800 dark:text-white px-3 py-1.5">
                    {requisito.texto}
                  </span>
                  <button
                    onClick={() => handleIniciarEdicionRequisito(index, requisito.texto)}
                    className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEliminarRequisito(requisito.id, index)}
                    className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                    </svg>
                  </button>
                </>
              )}
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
            onKeyDown={(e) => e.key === 'Enter' && !isAddingRequisito && handleAgregarRequisito()}
            disabled={isAddingRequisito}
          />
          <button
            onClick={handleAgregarRequisito}
            disabled={isAddingRequisito}
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 py-2.5 px-5 font-medium text-white text-sm shadow-theme-xs hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingRequisito ? (
              <svg className="w-4 h-4 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
            )}
            {isAddingRequisito ? 'Agregando...' : 'Agregar'}
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
              
              {editandoPasoIndex === index ? (
                // Modo edición
                <>
                  <input
                    type="text"
                    value={textoEditando || ''}
                    onChange={(e) => setTextoEditando(e.target.value)}
                    className="flex-1 h-9 rounded-lg border border-brand-400 dark:border-brand-500 bg-transparent dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    autoFocus
                  />
                  <button
                    onClick={() => handleGuardarEdicionPaso(paso.id!, index)}
                    disabled={isSavingItem}
                    className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50"
                  >
                    {isSavingItem ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={handleCancelarEdicionPaso}
                    className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                    </svg>
                  </button>
                </>
              ) : (
                // Modo visualización
                <>
                  <span className="flex-1 text-sm text-gray-800 dark:text-white px-3 py-1.5">
                    {paso.texto}
                  </span>
                  <button
                    onClick={() => handleIniciarEdicionPaso(index, paso.texto)}
                    className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEliminarPaso(paso.id, index)}
                    className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                    </svg>
                  </button>
                </>
              )}
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
            onKeyDown={(e) => e.key === 'Enter' && !isAddingPaso && handleAgregarPaso()}
            disabled={isAddingPaso}
          />
          <button
            onClick={handleAgregarPaso}
            disabled={isAddingPaso}
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 py-2.5 px-5 font-medium text-white text-sm shadow-theme-xs hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingPaso ? (
              <svg className="w-4 h-4 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
            )}
            {isAddingPaso ? 'Agregando...' : 'Agregar'}
          </button>
        </div>
      </ComponentCard>

      {/* Card 4: Documentos a Presentar */}
      <ComponentCard
        title="Documentos a Presentar"
        desc="Lista de documentos que el estudiante debe entregar para realizar este trámite"
      >
        {/* Lista de documentos */}
        <div className="space-y-3 mb-6">
          {informacion.documentos.map((documento, index) => (
            <div
              key={documento.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-semibold text-xs flex-shrink-0">
                {index + 1}
              </div>
              
              {editandoDocumentoIndex === index ? (
                // Modo edición
                <>
                  <input
                    type="text"
                    value={textoEditando || ''}
                    onChange={(e) => setTextoEditando(e.target.value)}
                    className="flex-1 h-9 rounded-lg border border-brand-400 dark:border-brand-500 bg-transparent dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    autoFocus
                  />
                  <button
                    onClick={() => handleGuardarEdicionDocumento(documento.id!, index)}
                    disabled={isSavingItem}
                    className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50"
                  >
                    {isSavingItem ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={handleCancelarEdicionDocumento}
                    className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                    </svg>
                  </button>
                </>
              ) : (
                // Modo visualización
                <>
                  <span className="flex-1 text-sm text-gray-800 dark:text-white px-3 py-1.5">
                    {documento.texto}
                  </span>
                  <button
                    onClick={() => handleIniciarEdicionDocumento(index, documento.texto)}
                    className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEliminarDocumento(documento.id, index)}
                    className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Agregar nuevo documento */}
        <div className="flex gap-3">
          <input
            type="text"
            value={nuevoDocumento}
            onChange={(e) => setNuevoDocumento(e.target.value)}
            placeholder="Nuevo documento..."
            className="flex-1 h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 transition-all"
            onKeyDown={(e) => e.key === 'Enter' && !isAddingDocumento && handleAgregarDocumento()}
            disabled={isAddingDocumento}
          />
          <button
            onClick={handleAgregarDocumento}
            disabled={isAddingDocumento}
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 py-2.5 px-5 font-medium text-white text-sm shadow-theme-xs hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingDocumento ? (
              <svg className="w-4 h-4 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
            )}
            {isAddingDocumento ? 'Agregando...' : 'Agregar'}
          </button>
        </div>
      </ComponentCard>
    </div>
  );
}
