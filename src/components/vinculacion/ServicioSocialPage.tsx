import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { ServicioSocialDocumento } from '../../services/servicioSocialService';
import {
  obtenerDocumentos,
  subirDocumento,
  eliminarDocumento,
  actualizarDocumento
} from '../../services/servicioSocialService';
import {
  obtenerTipos,
  crearTipo,
  actualizarTipo,
  eliminarTipo,
  ServicioSocialTipo
} from '../../services/servicioSocialTipoService';

export default function ServicioSocialPage() {
  const [documentos, setDocumentos] = useState<ServicioSocialDocumento[]>([]);
  const [tipos, setTipos] = useState<ServicioSocialTipo[]>([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [mostrarModalArchivo, setMostrarModalArchivo] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [mostrarModalTipos, setMostrarModalTipos] = useState(false);
  
  // Form states
  const [archivosASubir, setArchivosASubir] = useState<File[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [progresoSubida, setProgresoSubida] = useState<{ actual: number; total: number; archivoActual?: string } | null>(null);
  
  // Edit states
  const [documentoAEditar, setDocumentoAEditar] = useState<ServicioSocialDocumento | null>(null);
  const [nombreEdit, setNombreEdit] = useState('');
  const [descripcionEdit, setDescripcionEdit] = useState('');
  const [tipoEdit, setTipoEdit] = useState('');

  // Tipos management states
  const [nuevoTipoNombre, setNuevoTipoNombre] = useState('');
  const [tipoAEditar, setTipoAEditar] = useState<ServicioSocialTipo | null>(null);
  const [nombreTipoEdit, setNombreTipoEdit] = useState('');

  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const { isAuthenticated } = useAuth();

  const cargarDatos = useCallback(async () => {
    try {
      // No activar loading global para evitar parpadeos molestos en actualizaciones pequeñas
      // setLoading(true); 
      setError('');
      const [docs, tiposData] = await Promise.all([
        obtenerDocumentos(),
        obtenerTipos()
      ]);
      setDocumentos(docs);
      
      // Identificar tipos "huérfanos" (que existen en documentos pero no en la lista de tipos)
      const tiposEnDocumentos = new Set(docs.map(d => d.Tipo || 'General'));
      const tiposRegistrados = new Set(tiposData.map(t => t.Nombre));
      
      // Crear objetos temporales para los tipos huérfanos
      const tiposHuerfanos: ServicioSocialTipo[] = [];
      tiposEnDocumentos.forEach(nombreTipo => {
        if (!tiposRegistrados.has(nombreTipo)) {
          tiposHuerfanos.push({
            ID: -1 * Math.floor(Math.random() * 10000), // ID temporal negativo
            Nombre: nombreTipo
          });
        }
      });

      // Combinar tipos registrados con huérfanos
      const todosLosTipos = [...tiposData, ...tiposHuerfanos];
      setTipos(todosLosTipos);
      
      // Seleccionar el primer tipo por defecto si no hay seleccionado
      if (!tipoSeleccionado && todosLosTipos.length > 0) {
        setTipoSeleccionado(todosLosTipos[0].Nombre);
      } else if (todosLosTipos.length > 0 && !todosLosTipos.find(t => t.Nombre === tipoSeleccionado)) {
        // Si el tipo seleccionado ya no existe, seleccionar el primero
        setTipoSeleccionado(todosLosTipos[0].Nombre);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []); // Removed tipoSeleccionado from dependency array to avoid infinite loops

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const documentosFiltrados = documentos.filter(doc => doc.Tipo === tipoSeleccionado);

  // --- Manejo de Documentos ---

  const handleSubirArchivo = async () => {
    if (!isAuthenticated) {
      setError('Debes iniciar sesión como administrador para subir archivos');
      return;
    }
    if (archivosASubir.length === 0) {
      setError('Por favor seleccione al menos un archivo');
      return;
    }

    try {
      setSubiendo(true);
      setError('');
      setProgresoSubida({ actual: 0, total: archivosASubir.length });

      for (let i = 0; i < archivosASubir.length; i++) {
        const archivo = archivosASubir[i];
        const nombre = archivo.name;

        setProgresoSubida({
          actual: i,
          total: archivosASubir.length,
          archivoActual: archivo.name
        });

        await subirDocumento(
          archivo,
          nombre,
          '', // Descripción vacía por defecto
          tipoSeleccionado
        );

        setProgresoSubida({
          actual: i + 1,
          total: archivosASubir.length,
          archivoActual: archivo.name
        });
      }

      setArchivosASubir([]);
      setMostrarModalArchivo(false);
      setProgresoSubida(null);
      cargarDatos();
      setSuccess('Archivo(s) subido(s) correctamente');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir archivo');
      setProgresoSubida(null);
    } finally {
      setSubiendo(false);
    }
  };

  const handleEliminarDocumento = async (id: number) => {
    if (!isAuthenticated) {
      setError('Debes iniciar sesión como administrador para eliminar archivos');
      return;
    }
    if (!confirm('¿Está seguro de eliminar este documento?')) return;

    try {
      setError('');
      await eliminarDocumento(id);
      cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar documento');
    }
  };

  const handleEditarDocumento = async () => {
    if (!isAuthenticated) {
      setError('Debes iniciar sesión como administrador para editar archivos');
      return;
    }
    if (!documentoAEditar) return;

    try {
      setError('');
      await actualizarDocumento(
        documentoAEditar.ID,
        nombreEdit,
        descripcionEdit,
        tipoEdit
      );
      setMostrarModalEditar(false);
      setDocumentoAEditar(null);
      cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar documento');
    }
  };

  const abrirModalEditar = (doc: ServicioSocialDocumento) => {
    setDocumentoAEditar(doc);
    setNombreEdit(doc.Nombre);
    setDescripcionEdit(doc.Descripcion || '');
    setTipoEdit(doc.Tipo || (tipos.length > 0 ? tipos[0].Nombre : ''));
    setMostrarModalEditar(true);
  };

  // --- Manejo de Tipos ---

  const handleCrearTipo = async () => {
    if (!nuevoTipoNombre.trim()) return;
    try {
      await crearTipo(nuevoTipoNombre);
      setNuevoTipoNombre('');
      cargarDatos();
    } catch (err) {
      setError('Error al crear categoría');
    }
  };

  const handleActualizarTipo = async () => {
    if (!tipoAEditar || !nombreTipoEdit.trim()) return;
    try {
      await actualizarTipo(tipoAEditar.ID, nombreTipoEdit);
      
      // Si el tipo que estamos editando es el seleccionado actualmente, actualizar la selección
      if (tipoSeleccionado === tipoAEditar.Nombre) {
        setTipoSeleccionado(nombreTipoEdit);
      }

      setTipoAEditar(null);
      setNombreTipoEdit('');
      await cargarDatos();
    } catch (err) {
      setError('Error al actualizar categoría');
    }
  };

  const handleEliminarTipo = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta categoría? Los documentos asociados se moverán a "General".')) return;
    try {
      const tipoAEliminar = tipos.find(t => t.ID === id);
      await eliminarTipo(id);
      
      // Si eliminamos el tipo seleccionado, cambiar a otro
      if (tipoAEliminar && tipoSeleccionado === tipoAEliminar.Nombre) {
        setTipoSeleccionado(tipos.length > 1 ? tipos.find(t => t.ID !== id)?.Nombre || '' : '');
      }

      await cargarDatos();
    } catch (err) {
      setError('Error al eliminar categoría');
    }
  };

  // --- Drag and Drop ---
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter - 1 === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setArchivosASubir(prev => [...prev, ...files]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setArchivosASubir(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setArchivosASubir(prev => prev.filter((_, i) => i !== index));
  };

  const formatearTamanoArchivo = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const BACKEND_URL = import.meta.env.VITE_BACKENDURL || 'http://localhost:3004';

  if (loading && tipos.length === 0 && documentos.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-t-4 border-gray-200 rounded-full border-t-brand-500 animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Documentos - Servicio Social
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setMostrarModalTipos(true)}
            disabled={!isAuthenticated}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-medium shadow-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Categorías
          </button>
          <button
            onClick={() => setMostrarModalArchivo(true)}
            disabled={!isAuthenticated}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-[#d1672a] text-white rounded-lg hover:bg-[#b85822] transition-all font-medium shadow-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Subir
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 mb-4 text-sm text-green-800 bg-green-100 rounded-lg dark:bg-green-900/20 dark:text-green-300">
          {success}
        </div>
      )}

      {/* Tipos Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px space-x-8 overflow-x-auto pb-2">
          {tipos.length > 0 ? (
            tipos.map((tipo) => (
              <button
                key={tipo.ID}
                onClick={() => setTipoSeleccionado(tipo.Nombre)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  tipoSeleccionado === tipo.Nombre
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }`}
              >
                {tipo.Nombre}
                <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                  documentos.filter(d => d.Tipo === tipo.Nombre).length > 0
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {documentos.filter(d => d.Tipo === tipo.Nombre).length}
                </span>
              </button>
            ))
          ) : (
            <p className="py-4 text-gray-500 text-sm">No hay categorías definidas. Crea una para empezar.</p>
          )}
        </nav>
      </div>

      {/* Lista de Archivos */}
      {documentosFiltrados.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documentosFiltrados.map((doc) => (
            <div
              key={doc.ID}
              className="p-4 bg-white border rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 transition-all hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 border-gray-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate dark:text-white">
                      {doc.Nombre}
                    </h3>
                  </div>
                </div>
              </div>

              {doc.Descripcion && (
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {doc.Descripcion}
                </p>
              )}

              <div className="mb-3 text-xs text-gray-400">
                <p>Subido: {formatearFecha(doc.Fecha_Subida)}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const url = `${BACKEND_URL}${doc.Ruta_Documento}`;
                    window.open(url, '_blank');
                  }}
                  className="flex-1 px-3 py-2 text-xs font-medium text-center text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-all"
                >
                  Ver
                </button>
                <button
                  onClick={() => abrirModalEditar(doc)}
                  disabled={!isAuthenticated}
                  className="px-3 py-2 text-xs font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminarDocumento(doc.ID)}
                  disabled={!isAuthenticated}
                  className="px-3 py-2 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            {tipos.length === 0 
              ? "Crea una categoría para comenzar a subir documentos." 
              : "No hay documentos en esta sección."}
          </p>
        </div>
      )}

      {/* Modal Gestión de Tipos */}
      {mostrarModalTipos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Gestionar Categorías
              </h3>
              <button
                onClick={() => setMostrarModalTipos(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Crear nuevo tipo */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nuevoTipoNombre}
                  onChange={(e) => setNuevoTipoNombre(e.target.value)}
                  placeholder="Nueva categoría..."
                  className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button
                  onClick={handleCrearTipo}
                  disabled={!nuevoTipoNombre.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Agregar
                </button>
              </div>

              {/* Lista de tipos */}
              <div className="max-h-60 overflow-y-auto space-y-2 border-t pt-4 dark:border-gray-700">
                {tipos.map((tipo) => (
                  <div key={tipo.ID} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                    {tipoAEditar?.ID === tipo.ID ? (
                      <div className="flex gap-2 flex-1">
                        <input
                          type="text"
                          value={nombreTipoEdit}
                          onChange={(e) => setNombreTipoEdit(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border rounded dark:bg-gray-600 dark:text-white"
                        />
                        <button onClick={handleActualizarTipo} className="text-green-600 hover:text-green-700">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button onClick={() => setTipoAEditar(null)} className="text-gray-500 hover:text-gray-700">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {tipo.Nombre}
                          {tipo.ID < 0 && <span className="ml-2 text-xs text-red-500">(No registrado)</span>}
                        </span>
                        {tipo.ID > 0 && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setTipoAEditar(tipo);
                                setNombreTipoEdit(tipo.Nombre);
                              }}
                              className="text-blue-500 hover:text-blue-700"
                              title="Editar nombre"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            {tipo.Nombre !== 'General' && (
                              <button
                                onClick={() => handleEliminarTipo(tipo.ID)}
                                className="text-red-500 hover:text-red-700"
                                title="Eliminar categoría"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        )}
                        {tipo.ID < 0 && (
                          <button
                            onClick={async () => {
                              try {
                                await crearTipo(tipo.Nombre);
                                cargarDatos();
                              } catch (e) {
                                setError('Error al registrar categoría');
                              }
                            }}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Registrar
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Subir Archivo */}
      {mostrarModalArchivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-[95%] sm:max-w-2xl mx-auto max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Subir Documento - {tipoSeleccionado}
              </h3>
              <button
                onClick={() => {
                  setMostrarModalArchivo(false);
                  setArchivosASubir([]);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full flex-shrink-0"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Archivos *
                </label>
                
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-8 text-center transition-all bg-gray-50 dark:bg-gray-700/50 ${
                    isDragging
                      ? 'border-[#d1672a] bg-[#d1672a]/5'
                      : 'border-gray-300 dark:border-gray-600 hover:border-[#d1672a] dark:hover:border-[#d1672a]'
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    onChange={handleFileInputChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <div className="space-y-2">
                    <div className="flex justify-center mb-2 sm:mb-3">
                      <div className="p-2 sm:p-3 bg-[#d1672a]/10 rounded-full">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#d1672a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Arrastra y suelta archivos aquí, o{' '}
                        <span className="text-[#d1672a] font-semibold cursor-pointer">haz clic para seleccionar</span>
                      </p>
                    </div>
                  </div>
                </div>

                {archivosASubir.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Archivos seleccionados ({archivosASubir.length}):
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {archivosASubir.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded p-2">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 dark:text-white truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatearTamanoArchivo(file.size)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {progresoSubida && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subiendo archivos...
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {progresoSubida.actual} de {progresoSubida.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-[#d1672a] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(progresoSubida.actual / progresoSubida.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setMostrarModalArchivo(false);
                  setArchivosASubir([]);
                  setProgresoSubida(null);
                }}
                disabled={subiendo}
                className="flex-1 px-4 py-2.5 sm:py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubirArchivo}
                disabled={!isAuthenticated || subiendo || archivosASubir.length === 0}
                className="flex-1 px-4 py-2.5 sm:py-3 bg-[#d1672a] text-white rounded-lg sm:rounded-xl hover:bg-[#b85822] transition-all font-medium shadow-lg hover:shadow-xl text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {subiendo ? 'Subiendo...' : 'Subir archivos'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Documento */}
      {mostrarModalEditar && documentoAEditar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-[95%] sm:max-w-md mx-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Editar Documento
              </h3>
              <button
                onClick={() => setMostrarModalEditar(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={nombreEdit}
                  onChange={(e) => setNombreEdit(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0a9782] focus:border-[#0a9782] dark:bg-gray-700 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={descripcionEdit}
                  onChange={(e) => setDescripcionEdit(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0a9782] focus:border-[#0a9782] dark:bg-gray-700 dark:text-white outline-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tipo
                </label>
                <select
                  value={tipoEdit}
                  onChange={(e) => setTipoEdit(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0a9782] focus:border-[#0a9782] dark:bg-gray-700 dark:text-white outline-none"
                >
                  {tipos.map(tipo => (
                    <option key={tipo.ID} value={tipo.Nombre}>{tipo.Nombre}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setMostrarModalEditar(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEditarDocumento}
                  className="flex-1 px-4 py-2 bg-[#0a9782] text-white rounded-lg hover:bg-[#088c75] transition-all font-medium shadow-lg"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
