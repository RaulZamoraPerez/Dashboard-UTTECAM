import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface Documento {
  id: string;
  titulo: string;
  archivo: string;
  fechaSubida?: string;
}

interface ConvocatoriaData {
  id: string;
  titulo: string;
  descripcion?: string;
  documentos: Documento[];
}

const ConvocatoriaTitulo = () => {
  const [convocatorias, setConvocatorias] = useState<ConvocatoriaData[]>([
    {
      id: 'convocatoria-titulo',
      titulo: 'Convocatorias a trámite de título profesional',
      documentos: [
        {
          id: 'convocatoria1',
          titulo: 'Alumnos que se encuentran cursando 7º cuatrimestre',
          archivo: 'convocatoria Titulo/1. Alumnos que se encuentran cursando el 7o cuatrimestre.pdf',
          fechaSubida: '2025-01-15'
        },
        {
          id: 'convocatoria2',
          titulo: 'Alumnos que se encuentran cursando 10º cuatrimestre',
          archivo: 'convocatoria Titulo/2. Alumnos que se encuentran cursando el 10o cuatrimestre.pdf',
          fechaSubida: '2025-01-15'
        },
        {
          id: 'convocatoria3',
          titulo: 'Egresados de LIC/ING en enero-abril 2025',
          archivo: 'convocatoria Titulo/3. Egresados de LIC.ING en enero-abril 2025.pdf',
          fechaSubida: '2025-01-20'
        }
      ]
    }
  ]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [docEditando, setDocEditando] = useState<string | null>(null);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<File | null>(null);
  const [nuevoDocumento, setNuevoDocumento] = useState({
    titulo: '',
    archivo: ''
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10485760, // 10MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setDocumentoSeleccionado(acceptedFiles[0]);
        setNuevoDocumento(prev => ({
          ...prev,
          archivo: acceptedFiles[0].name
        }));
      }
    }
  });

  const handleAgregarDocumento = () => {
    if (nuevoDocumento.titulo.trim() && nuevoDocumento.archivo.trim()) {
      const convocatoriaActualizada = { ...convocatorias[0] };
      
      if (modoEdicion && docEditando) {
        // Modo edición
        const indice = convocatoriaActualizada.documentos.findIndex(d => d.id === docEditando);
        if (indice !== -1) {
          convocatoriaActualizada.documentos[indice] = {
            ...convocatoriaActualizada.documentos[indice],
            titulo: nuevoDocumento.titulo,
            archivo: nuevoDocumento.archivo
          };
        }
        setModoEdicion(false);
        setDocEditando(null);
      } else {
        // Modo crear nuevo
        convocatoriaActualizada.documentos.push({
          id: `doc-${Date.now()}`,
          titulo: nuevoDocumento.titulo,
          archivo: nuevoDocumento.archivo,
          fechaSubida: new Date().toISOString().split('T')[0]
        });
      }
      
      setConvocatorias([convocatoriaActualizada]);
      setNuevoDocumento({ titulo: '', archivo: '' });
      setDocumentoSeleccionado(null);
      setMostrarFormulario(false);
    }
  };

  const handleIniciarEdicionDoc = (doc: Documento) => {
    setNuevoDocumento({
      titulo: doc.titulo,
      archivo: doc.archivo
    });
    setDocEditando(doc.id);
    setModoEdicion(true);
    setMostrarFormulario(true);
    setDocumentoSeleccionado(null);
  };

  const handleCancelarEdicionDoc = () => {
    setModoEdicion(false);
    setDocEditando(null);
    setNuevoDocumento({ titulo: '', archivo: '' });
    setDocumentoSeleccionado(null);
    setMostrarFormulario(false);
  };

  const handleEliminarDocumento = (docId: string) => {
    const convocatoriaActualizada = { ...convocatorias[0] };
    convocatoriaActualizada.documentos = convocatoriaActualizada.documentos.filter(d => d.id !== docId);
    setConvocatorias([convocatoriaActualizada]);
  };

  const convocatoria = convocatorias[0];

  return (
    <div className="bg-white dark:bg-black min-h-screen">
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-gray-600 dark:bg-black sm:px-7.5 xl:pb-1">
        
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h4 className="text-xl font-semibold text-black dark:text-white">
              📜 Convocatoria a Trámite de Título Profesional
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gestiona las convocatorias y documentos para trámite de título
            </p>
          </div>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 py-3 px-6 font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200 border border-primary dark:border-primary dark:bg-primary dark:hover:bg-primary/90"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Nuevo Documento
          </button>
        </div>

        {/* Formulario de Nuevo Documento */}
        {mostrarFormulario && (
          <div className="mb-8 rounded-lg border border-stroke bg-gray-50 dark:bg-black dark:border-gray-600 p-6">
            <h5 className="text-lg font-semibold text-black dark:text-white mb-6">
              {modoEdicion ? 'Editar Documento' : 'Subir Nuevo Documento'}
            </h5>
            <div className="space-y-6">
              {/* Título */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                  Título del Documento *
                </label>
                <input
                  type="text"
                  value={nuevoDocumento.titulo}
                  onChange={(e) => setNuevoDocumento({ ...nuevoDocumento, titulo: e.target.value })}
                  placeholder="Ej: Alumnos que se encuentran cursando 7º cuatrimestre"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-white py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-gray-600 dark:bg-black dark:text-white dark:focus:border-primary placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Dropzone para PDF */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors dark:border-gray-600 dark:hover:border-primary">
                <div
                  {...getRootProps()}
                  className={`dropzone rounded-lg p-6 cursor-pointer transition-all duration-200
                    ${isDragActive 
                      ? "border-primary bg-primary/5 dark:bg-primary/10" 
                      : "bg-gray-50/50 dark:bg-black/50 hover:bg-gray-100/50 dark:hover:bg-gray-900/50"
                    }`}
                >
                  <input {...getInputProps()} />
                  <div className="text-center">
                    <div className="mb-4 flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19,2H5C3.9,2 3,2.9 3,4V20C3,21.1 3.9,22 5,22H19C20.1,22 21,21.1 21,20V4C21,2.9 20.1,2 19,2M19,20H5V4H19V20M7,18H17V16H7V18M7,14H17V12H7V14M7,10H17V6H7V10Z" />
                        </svg>
                      </div>
                    </div>
                    <h4 className="mb-2 font-medium text-gray-800 dark:text-gray-200">
                      {isDragActive ? "Suelta el PDF aquí" : "Arrastra tu PDF aquí"}
                    </h4>
                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                      PDF (máx. 10MB)
                    </p>
                    <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors">
                      Buscar Documento
                    </span>
                  </div>
                </div>
              </div>

              {/* Archivo Seleccionado */}
              {documentoSeleccionado && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-black border border-stroke dark:border-gray-600 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h6 className="font-medium text-black dark:text-white text-sm">Archivo seleccionado:</h6>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{documentoSeleccionado.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {(documentoSeleccionado.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setDocumentoSeleccionado(null);
                        setNuevoDocumento(prev => ({ ...prev, archivo: '' }));
                      }}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={handleAgregarDocumento}
                  disabled={!modoEdicion && !documentoSeleccionado}
                  className="flex-1 sm:flex-initial justify-center rounded-lg bg-primary hover:bg-primary/90 py-3 px-8 font-medium text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {modoEdicion ? 'Actualizar Documento' : 'Guardar Documento'}
                </button>
                <button
                  onClick={handleCancelarEdicionDoc}
                  className="flex-1 sm:flex-initial justify-center rounded-lg border-2 border-stroke dark:border-gray-600 bg-white dark:bg-black py-3 px-8 font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Documentos */}
        <div className="mb-6">
          <h5 className="text-lg font-semibold text-black dark:text-white mb-4">
            {convocatoria.titulo}
          </h5>
          {convocatoria.descripcion && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {convocatoria.descripcion}
            </p>
          )}

          <div className="space-y-3">
            {convocatoria.documentos.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-black border border-stroke dark:border-gray-600 rounded-lg hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h6 className="font-semibold text-black dark:text-white text-sm">
                      {doc.titulo}
                    </h6>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Subido: {doc.fechaSubida || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <a
                    href={`#download-${doc.id}`}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md border border-primary"
                    title="Descargar"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19,12A7,7 0 0,0 12,5V13H8L13,18L18,13H14A5,5 0 0,1 19,12Z" />
                    </svg>
                  </a>
                  <button
                    onClick={() => handleIniciarEdicionDoc(doc)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors shadow-sm hover:shadow-md border border-yellow-500"
                    title="Editar"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3,17.25V21h3.75L17.81,9.94l-3.75,-3.75L3,17.25Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEliminarDocumento(doc.id)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm hover:shadow-md border border-red-500"
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

          {convocatoria.documentos.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No hay documentos registrados. ¡Crea el primer documento!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConvocatoriaTitulo;
