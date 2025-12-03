import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { confirmDialog, toastSuccess, toastError } from '../../utils/alert';
import ComponentCard from '../../components/common/ComponentCard';
import * as convocatoriaService from '../../services/convocatoriaTituloService';

// Interfaces
interface Documento {
  id: string;
  titulo: string;
  createdAt: string;
  updatedAt: string;
}

interface InformacionGeneral {
  id?: string;
  titulo: string;
  subtitulo: string;
  nombreSeccion: string;
}

interface DocumentoFormData {
  titulo: string;
  archivoPdf: File | null;
}

export default function ConvocatoriaTituloPage() {
  // Estado para información general
  const [infoGeneral, setInfoGeneral] = useState<InformacionGeneral>({
    titulo: '',
    subtitulo: '',
    nombreSeccion: '',
  });
  const [editandoInfo, setEditandoInfo] = useState(false);
  const [infoTemporal, setInfoTemporal] = useState<InformacionGeneral>(infoGeneral);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Estado para documentos
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [mostrarFormDoc, setMostrarFormDoc] = useState(false);
  const [isSavingDoc, setIsSavingDoc] = useState(false);
  const [docFormData, setDocFormData] = useState<DocumentoFormData>({
    titulo: '',
    archivoPdf: null,
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      // Cargar información principal
      setIsLoadingInfo(true);
      try {
        const infoResponse = await convocatoriaService.getMainInfo();
        if (infoResponse) {
          const infoData = {
            id: infoResponse.id,
            titulo: infoResponse.titulo || '',
            subtitulo: infoResponse.subtitulo || '',
            nombreSeccion: infoResponse.nombreSeccionDocumentos || '',
          };
          setInfoGeneral(infoData);
          setInfoTemporal(infoData);
        }
      } catch (error) {
        console.error('Error al cargar información:', error);
      } finally {
        setIsLoadingInfo(false);
      }

      // Cargar documentos
      setIsLoadingDocs(true);
      try {
        const docsResponse = await convocatoriaService.getDocumentos();
        setDocumentos(docsResponse);
      } catch (error) {
        console.error('Error al cargar documentos:', error);
      } finally {
        setIsLoadingDocs(false);
      }
    };

    fetchData();
  }, []);

  // Dropzone para documentos
  const onDropDoc = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setDocFormData(prev => ({
        ...prev,
        archivoPdf: file,
      }));
    }
  };

  const { getRootProps: getDocRootProps, getInputProps: getDocInputProps, isDragActive: isDocDragActive } = useDropzone({
    onDrop: onDropDoc,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  });

  // Función para recargar la información principal desde el servidor
  const reloadMainInfo = async () => {
    try {
      const infoResponse = await convocatoriaService.getMainInfo();
      if (infoResponse) {
        const infoData = {
          id: infoResponse.id,
          titulo: infoResponse.titulo || '',
          subtitulo: infoResponse.subtitulo || '',
          nombreSeccion: infoResponse.nombreSeccionDocumentos || '',
        };
        setInfoGeneral(infoData);
        setInfoTemporal(infoData);
      }
    } catch (error) {
      console.error('Error al recargar información:', error);
    }
  };

  // Función para recargar los documentos desde el servidor
  const reloadDocumentos = async () => {
    try {
      const docsResponse = await convocatoriaService.getDocumentos();
      setDocumentos(docsResponse);
    } catch (error) {
      console.error('Error al recargar documentos:', error);
    }
  };

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
    if (!infoTemporal.nombreSeccion.trim()) {
      toastError('El nombre de la sección es obligatorio');
      return;
    }

    setIsSavingInfo(true);
    try {
      await convocatoriaService.createOrUpdateMainInfo({
        titulo: infoTemporal.titulo.trim(),
        subtitulo: infoTemporal.subtitulo.trim(),
        nombreSeccionDocumentos: infoTemporal.nombreSeccion.trim(),
      });

      // Recargar la información desde el servidor
      await reloadMainInfo();
      
      setEditandoInfo(false);
      toastSuccess('Información guardada correctamente');
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

  // Handlers para documentos
  const resetDocForm = () => {
    setDocFormData({
      titulo: '',
      archivoPdf: null,
    });
  };

  const handleGuardarDoc = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!docFormData.titulo.trim()) {
      toastError('El título del documento es obligatorio');
      return;
    }

    if (!docFormData.archivoPdf) {
      toastError('Debes seleccionar un archivo PDF');
      return;
    }

    setIsSavingDoc(true);
    try {
      await convocatoriaService.createDocumento(
        docFormData.titulo.trim(),
        docFormData.archivoPdf
      );

      // Recargar la lista de documentos desde el servidor
      await reloadDocumentos();
      
      toastSuccess('Documento agregado correctamente');
      setMostrarFormDoc(false);
      resetDocForm();
    } catch (error) {
      if (error instanceof Error) {
        toastError(error.message);
      } else {
        toastError('Error al subir el documento');
      }
    } finally {
      setIsSavingDoc(false);
    }
  };

  const handleEliminarDoc = async (id: string) => {
    const confirmed = await confirmDialog({
      title: 'Eliminar documento',
      text: '¿Estás seguro de que deseas eliminar este documento?'
    });
    if (!confirmed) return;

    try {
      await convocatoriaService.deleteDocumento(id);
      // Recargar la lista de documentos desde el servidor
      await reloadDocumentos();
      toastSuccess('Documento eliminado correctamente');
    } catch (error) {
      if (error instanceof Error) {
        toastError(error.message);
      } else {
        toastError('Error al eliminar el documento');
      }
    }
  };

  const handleEliminarTodosDoc = async () => {
    const confirmed = await confirmDialog({
      title: '¿Eliminar todos los documentos?',
      text: `Se eliminarán todos los documentos (${documentos.length}). Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar todos',
      cancelText: 'Cancelar'
    });
    
    if (!confirmed) return;

    try {
      await convocatoriaService.deleteAllDocumentos();
      // Recargar la lista de documentos desde el servidor
      await reloadDocumentos();
      toastSuccess('Todos los documentos fueron eliminados');
    } catch (error) {
      if (error instanceof Error) {
        toastError(error.message);
      } else {
        toastError('Error al eliminar los documentos');
      }
    }
  };

  const handleDescargarDoc = async (id: string) => {
    try {
      await convocatoriaService.downloadDocumento(id);
    } catch (error) {
      if (error instanceof Error) {
        toastError(error.message);
      } else {
        toastError('No se pudo abrir el documento');
      }
    }
  };

  const handleCancelarDoc = () => {
    setMostrarFormDoc(false);
    resetDocForm();
  };

  return (
    <div className="space-y-6">
      {/* Card 1: Información General */}
      <ComponentCard
        title="Información de la Convocatoria"
        desc="Configura el título, subtítulo y nombre de la sección que se mostrarán en la página principal"
      >
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
            {!infoGeneral.titulo && !infoGeneral.subtitulo && !infoGeneral.nombreSeccion ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">No hay información configurada</p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">Haz clic en "Agregar Información" para configurar la convocatoria.</p>
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
                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre de la Sección de Documentos</span>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{infoGeneral.nombreSeccion || '(Sin nombre)'}</p>
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
              {infoGeneral.titulo ? 'Editar Información' : 'Agregar Información'}
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
                placeholder="Ej: Convocatoria a trámite de título profesional"
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
                placeholder="Ej: Selecciona la convocatoria que deseas consultar y visualiza el PDF."
                rows={3}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 transition-all"
              />
            </div>

            <div>
              <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre de la Sección de Documentos *
              </label>
              <input
                type="text"
                value={infoTemporal.nombreSeccion}
                onChange={(e) => setInfoTemporal(prev => ({ ...prev, nombreSeccion: e.target.value }))}
                placeholder="Ej: Convocatorias a trámite de título profesional"
                disabled={isSavingInfo}
                className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 transition-all disabled:opacity-50"
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Este nombre se mostrará tanto en el badge/botón naranja como en el header de la sección verde
              </p>
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
                    Guardar Cambios
                  </>
                )}
              </button>
              <button
                onClick={handleCancelarInfo}
                disabled={isSavingInfo}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2.5 px-6 font-medium text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </ComponentCard>

      {/* Card 2: Gestión de Documentos */}
      <ComponentCard
        title="Documentos de la Convocatoria"
        desc="Administra los documentos PDF que se listarán para los estudiantes"
      >
        {isLoadingDocs ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="animate-spin w-10 h-10 mx-auto text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Cargando documentos...</p>
          </div>
        ) : (
          <>
        {/* Header con botón agregar */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00796B]/10 dark:bg-[#00796B]/20 text-[#00796B]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19,2H5C3.9,2 3,2.9 3,4V20C3,21.1 3.9,22 5,22H19C20.1,22 21,21.1 21,20V4C21,2.9 20.1,2 19,2M19,20H5V4H19V20M7,18H17V16H7V18M7,14H17V12H7V14M7,10H17V6H7V10Z" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-800 dark:text-white">{infoGeneral.nombreSeccion}</span>
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#00796B] text-white">
                {documentos.length} documento{documentos.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          {!mostrarFormDoc && (
            <div className="flex items-center gap-3">
              {documentos.length > 0 && (
                <button
                  onClick={handleEliminarTodosDoc}
                  className="inline-flex items-center justify-center rounded-lg bg-red-500 hover:bg-red-600 py-2.5 px-5 font-medium text-white text-sm shadow-theme-xs hover:shadow-lg transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                  </svg>
                  Eliminar todos
                </button>
              )}
              <button
                onClick={() => setMostrarFormDoc(true)}
                className="inline-flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 py-2.5 px-5 font-medium text-white text-sm shadow-theme-xs hover:shadow-lg transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                </svg>
                Agregar Documento
              </button>
            </div>
          )}
        </div>

        {/* Formulario para agregar documento */}
        {mostrarFormDoc && (
          <div className="mb-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-6">
            <h5 className="text-base font-semibold text-gray-800 dark:text-white mb-5">
              Nuevo Documento
            </h5>
            
            <form onSubmit={handleGuardarDoc} className="space-y-5">
              {/* Título del documento */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Título del Documento *
                </label>
                <input
                  type="text"
                  value={docFormData.titulo}
                  onChange={(e) => setDocFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ej: Alumnos que se encuentran cursando 7° cuatrimestre"
                  disabled={isSavingDoc}
                  className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 transition-all disabled:opacity-50"
                  required
                />
              </div>

              {/* Dropzone para PDF */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Archivo PDF *
                </label>
                
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-brand-500 dark:hover:border-brand-500 transition-colors">
                  <div
                    {...getDocRootProps()}
                    className={`dropzone rounded-xl p-6 cursor-pointer transition-all duration-200
                      ${isDocDragActive 
                        ? "border-brand-500 bg-gray-100 dark:bg-gray-800" 
                        : "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                      }`}
                  >
                    <input {...getDocInputProps()} />
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-3 flex justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-400">
                          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                            <path d="M19,2H5C3.9,2 3,2.9 3,4V20C3,21.1 3.9,22 5,22H19C20.1,22 21,21.1 21,20V4C21,2.9 20.1,2 19,2M19,20H5V4H19V20M7,18H17V16H7V18M7,14H17V12H7V14M7,10H17V6H7V10Z" />
                          </svg>
                        </div>
                      </div>
                      <h4 className="mb-2 font-medium text-gray-800 dark:text-white text-sm">
                        {isDocDragActive ? "Suelta el PDF aquí" : "Arrastra tu PDF aquí"}
                      </h4>
                      <span className="text-center mb-3 block text-xs text-gray-600 dark:text-gray-400">
                        o haz clic para buscar
                      </span>
                      <span className="font-medium text-xs text-brand-500 underline">
                        Buscar Archivo
                      </span>
                      <p className="mt-2 text-xs text-gray-500">PDF (máx. 10MB)</p>
                    </div>
                  </div>
                </div>
                
                {/* Preview del archivo */}
                {docFormData.archivoPdf && (
                  <div className="mt-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19,2H5C3.9,2 3,2.9 3,4V20C3,21.1 3.9,22 5,22H19C20.1,22 21,21.1 21,20V4C21,2.9 20.1,2 19,2M19,20H5V4H19V20M7,18H17V16H7V18M7,14H17V12H7V14M7,10H17V6H7V10Z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white truncate max-w-[200px]">
                            {docFormData.archivoPdf.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(docFormData.archivoPdf.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDocFormData(prev => ({ ...prev, archivoPdf: null }))}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={!docFormData.titulo || !docFormData.archivoPdf || isSavingDoc}
                  className="inline-flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 py-2.5 px-6 font-medium text-white text-sm shadow-theme-xs hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSavingDoc ? (
                    <>
                      <svg className="animate-spin w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                      </svg>
                      Agregar Documento
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancelarDoc}
                  disabled={isSavingDoc}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2.5 px-6 font-medium text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de documentos */}
        {documentos.length > 0 && (
          <div className="space-y-3">
            {documentos.map((doc) => (
              <div
                key={doc.id}
                className="group flex items-center gap-4 p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-600 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => handleDescargarDoc(doc.id)}
              >
                {/* Icono de documento */}
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors flex-shrink-0">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>

                {/* Información del documento */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 dark:text-white text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {doc.titulo}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Subido el {new Date(doc.createdAt).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Botón de descarga/vista */}
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-xs font-medium group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                    </svg>
                    Ver
                  </div>

                  {/* Eliminar */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEliminarDoc(doc.id);
                    }}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    title="Eliminar documento"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estado vacío */}
        {documentos.length === 0 && !mostrarFormDoc && (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19,2H5C3.9,2 3,2.9 3,4V20C3,21.1 3.9,22 5,22H19C20.1,22 21,21.1 21,20V4C21,2.9 20.1,2 19,2M19,20H5V4H19V20M7,18H17V16H7V18M7,14H17V12H7V14M7,10H17V6H7V10Z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              No hay documentos registrados
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Agrega los documentos PDF que los estudiantes podrán consultar y descargar.
            </p>
            <button
              onClick={() => setMostrarFormDoc(true)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 py-3 px-6 font-medium text-white text-sm shadow-theme-xs hover:shadow-lg transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
              Agregar Primer Documento
            </button>
          </div>
        )}
          </>
        )}
      </ComponentCard>
    </div>
  );
}
