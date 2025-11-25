import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { confirmDialog, toastSuccess, toastError } from '../../utils/alert';
import ComponentCard from '../../components/common/ComponentCard';

// Interfaces
interface Documento {
  id: string;
  titulo: string;
  archivoPdf: File;
  nombreArchivo: string;
  fechaSubida: string;
}

interface InformacionGeneral {
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
    titulo: 'Convocatoria a trámite de título profesional',
    subtitulo: 'Selecciona la convocatoria que deseas consultar y visualiza el PDF.',
    nombreSeccion: 'Convocatorias a trámite de título profesional',
  });
  const [editandoInfo, setEditandoInfo] = useState(false);
  const [infoTemporal, setInfoTemporal] = useState<InformacionGeneral>(infoGeneral);

  // Estado para documentos
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [mostrarFormDoc, setMostrarFormDoc] = useState(false);
  const [editandoDocId, setEditandoDocId] = useState<string | null>(null);
  const [docFormData, setDocFormData] = useState<DocumentoFormData>({
    titulo: '',
    archivoPdf: null,
  });

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
    if (!infoTemporal.nombreSeccion.trim()) {
      toastError('El nombre de la sección es obligatorio');
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

  // Handlers para documentos
  const resetDocForm = () => {
    setDocFormData({
      titulo: '',
      archivoPdf: null,
    });
  };

  const handleGuardarDoc = (e: React.FormEvent) => {
    e.preventDefault();

    if (!docFormData.titulo.trim()) {
      toastError('El título del documento es obligatorio');
      return;
    }

    if (!editandoDocId && !docFormData.archivoPdf) {
      toastError('Debes seleccionar un archivo PDF');
      return;
    }

    const nuevoDoc: Documento = {
      id: editandoDocId || Date.now().toString(),
      titulo: docFormData.titulo.trim(),
      archivoPdf: docFormData.archivoPdf!,
      nombreArchivo: docFormData.archivoPdf?.name || '',
      fechaSubida: new Date().toLocaleDateString('es-ES'),
    };

    if (editandoDocId) {
      setDocumentos(prev => prev.map(d => d.id === editandoDocId ? nuevoDoc : d));
      toastSuccess('Documento actualizado correctamente');
    } else {
      setDocumentos(prev => [...prev, nuevoDoc]);
      toastSuccess('Documento agregado correctamente');
    }

    setMostrarFormDoc(false);
    setEditandoDocId(null);
    resetDocForm();
  };

  const handleEditarDoc = (doc: Documento) => {
    setDocFormData({
      titulo: doc.titulo,
      archivoPdf: doc.archivoPdf,
    });
    setEditandoDocId(doc.id);
    setMostrarFormDoc(true);
  };

  const handleEliminarDoc = async (id: string) => {
    const confirmed = await confirmDialog({
      title: 'Eliminar documento',
      text: '¿Estás seguro de que deseas eliminar este documento?'
    });
    if (!confirmed) return;

    setDocumentos(prev => prev.filter(d => d.id !== id));
    toastSuccess('Documento eliminado correctamente');
  };

  const handleCancelarDoc = () => {
    setMostrarFormDoc(false);
    setEditandoDocId(null);
    resetDocForm();
  };

  const handleVerPdf = (doc: Documento) => {
    if (doc.archivoPdf) {
      const url = URL.createObjectURL(doc.archivoPdf);
      window.open(url, '_blank');
    }
  };

  // Mover documento arriba/abajo
  const moverDocumento = (index: number, direccion: 'arriba' | 'abajo') => {
    const nuevosDocumentos = [...documentos];
    const nuevoIndex = direccion === 'arriba' ? index - 1 : index + 1;
    
    if (nuevoIndex < 0 || nuevoIndex >= documentos.length) return;
    
    [nuevosDocumentos[index], nuevosDocumentos[nuevoIndex]] = [nuevosDocumentos[nuevoIndex], nuevosDocumentos[index]];
    setDocumentos(nuevosDocumentos);
  };

  return (
    <div className="space-y-6">
      {/* Card 1: Información General */}
      <ComponentCard
        title="Información de la Convocatoria"
        desc="Configura el título, subtítulo y nombre de la sección que se mostrarán en la página principal"
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
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre de la Sección de Documentos</span>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{infoGeneral.nombreSeccion}</p>
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
                className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 transition-all"
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Este nombre se mostrará tanto en el badge/botón naranja como en el header de la sección verde
              </p>
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

      {/* Card 2: Gestión de Documentos */}
      <ComponentCard
        title="Documentos de la Convocatoria"
        desc="Administra los documentos PDF que se listarán para los estudiantes"
      >
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
            <button
              onClick={() => setMostrarFormDoc(true)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 py-2.5 px-5 font-medium text-white text-sm shadow-theme-xs hover:shadow-lg transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
              Agregar Documento
            </button>
          )}
        </div>

        {/* Formulario para agregar/editar documento */}
        {mostrarFormDoc && (
          <div className="mb-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-6">
            <h5 className="text-base font-semibold text-gray-800 dark:text-white mb-5">
              {editandoDocId ? 'Editar Documento' : 'Nuevo Documento'}
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
                  className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 transition-all"
                  required
                />
              </div>

              {/* Dropzone para PDF */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Archivo PDF {!editandoDocId && '*'}
                  {editandoDocId && <span className="text-gray-400 text-xs ml-1">(Opcional)</span>}
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
                  disabled={!docFormData.titulo || (!editandoDocId && !docFormData.archivoPdf)}
                  className="inline-flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 py-2.5 px-6 font-medium text-white text-sm shadow-theme-xs hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                  </svg>
                  {editandoDocId ? 'Actualizar' : 'Agregar'} Documento
                </button>
                <button
                  type="button"
                  onClick={handleCancelarDoc}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2.5 px-6 font-medium text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
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
            {documentos.map((doc, index) => (
              <div
                key={doc.id}
                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
              >
                {/* Número */}
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00796B]/10 dark:bg-[#00796B]/20 text-[#00796B] font-semibold text-sm flex-shrink-0">
                  {index + 1}
                </div>

                {/* Icono PDF */}
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19,2H5C3.9,2 3,2.9 3,4V20C3,21.1 3.9,22 5,22H19C20.1,22 21,21.1 21,20V4C21,2.9 20.1,2 19,2M19,20H5V4H19V20M7,18H17V16H7V18M7,14H17V12H7V14M7,10H17V6H7V10Z" />
                  </svg>
                </div>

                {/* Título */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 dark:text-white text-sm truncate">
                    {doc.titulo}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {doc.nombreArchivo} • Subido: {doc.fechaSubida}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Mover arriba */}
                  <button
                    onClick={() => moverDocumento(index, 'arriba')}
                    disabled={index === 0}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Mover arriba"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" />
                    </svg>
                  </button>

                  {/* Mover abajo */}
                  <button
                    onClick={() => moverDocumento(index, 'abajo')}
                    disabled={index === documentos.length - 1}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Mover abajo"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                    </svg>
                  </button>

                  {/* Ver PDF */}
                  <button
                    onClick={() => handleVerPdf(doc)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    title="Ver PDF"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                    </svg>
                  </button>

                  {/* Editar */}
                  <button
                    onClick={() => handleEditarDoc(doc)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-900/50 transition-colors"
                    title="Editar"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                    </svg>
                  </button>

                  {/* Eliminar */}
                  <button
                    onClick={() => handleEliminarDoc(doc.id)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    title="Eliminar"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                    </svg>
                  </button>

                  {/* Descargar */}
                  <button
                    onClick={() => handleVerPdf(doc)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#00796B]/10 dark:bg-[#00796B]/20 text-[#00796B] hover:bg-[#00796B]/20 dark:hover:bg-[#00796B]/30 transition-colors"
                    title="Descargar"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
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
      </ComponentCard>
    </div>
  );
}
