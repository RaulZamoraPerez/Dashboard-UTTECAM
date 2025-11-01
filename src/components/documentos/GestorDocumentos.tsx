import { useState, useEffect, useCallback } from 'react';
import type { Categoria, Archivo } from '../../services/documentosService';
import {
  obtenerCategorias,
  crearCategoria,
  eliminarCategoria,
  subirArchivo,
  eliminarArchivo,
  obtenerAreas
} from '../../services/documentosService';

interface GestorDocumentosProps {
  areaId: number;
  areaNombre: string;
}

export default function GestorDocumentos({ areaId, areaNombre }: GestorDocumentosProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false);
  const [mostrarModalArchivo, setMostrarModalArchivo] = useState(false);
  
  // Form states
  const [nombreCategoria, setNombreCategoria] = useState('');
  const [archivosASubir, setArchivosASubir] = useState<File[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [progresoSubida, setProgresoSubida] = useState<{ actual: number; total: number; archivoActual?: string } | null>(null);

  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  // Selection states
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<Set<number>>(new Set());
  const [modoSeleccionMultiple, setModoSeleccionMultiple] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [progresoEliminacion, setProgresoEliminacion] = useState<{ actual: number; total: number; archivoActual?: string } | null>(null);
  const cargarCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const todasCategorias = await obtenerCategorias();
      const categoriasArea = todasCategorias.filter(c => c.ID_Area === areaId);
      setCategorias(categoriasArea);

      // Resetear selección cuando cambia el área
      setCategoriaSeleccionada(null);

      // Seleccionar automáticamente la primera categoría del área
      if (categoriasArea.length > 0) {
        setCategoriaSeleccionada(categoriasArea[0].ID_Categorias);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  }, [areaId]);  useEffect(() => {
    cargarCategorias();
  }, [areaId, cargarCategorias]);

  useEffect(() => {
    if (categoriaSeleccionada) {
      const categoria = categorias.find(c => c.ID_Categorias === categoriaSeleccionada);
      setArchivos(categoria?.archivos || []);
      // Resetear selección múltiple al cambiar de categoría
      setArchivosSeleccionados(new Set());
      setModoSeleccionMultiple(false);
    }
  }, [categoriaSeleccionada, categorias]);

  const handleCrearCategoria = async () => {
    if (!nombreCategoria.trim()) {
      setError('El nombre de la categoría es requerido');
      return;
    }

    try {
      setError('');
      console.log(`Intentando crear categoría "${nombreCategoria}" en área ID: ${areaId} (${areaNombre})`);

      // Verificar que el área existe antes de crear la categoría
      const areas = await obtenerAreas();
      console.log('Áreas disponibles:', areas);

      const areaExiste = areas.some(area => area.ID_Area === areaId);
      console.log(`¿Área ${areaId} existe?`, areaExiste);

      if (!areaExiste) {
        const errorMsg = `El área "${areaNombre}" (ID: ${areaId}) no existe en el sistema. Áreas disponibles: ${areas.map(a => `${a.Nombre} (${a.ID_Area})`).join(', ')}`;
        console.error(errorMsg);
        setError(errorMsg);
        return;
      }

      console.log('Creando categoría...');
      await crearCategoria(nombreCategoria, areaId);
      console.log('Categoría creada exitosamente');

      setNombreCategoria('');
      setMostrarModalCategoria(false);
      cargarCategorias();
    } catch (err) {
      console.error('Error completo al crear categoría:', err);
      let errorMessage = 'Error al crear categoría';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        // Intentar extraer mensaje de error del servidor
        const errorObj = err as any;
        if (errorObj.message) {
          errorMessage = errorObj.message;
        } else if (errorObj.error) {
          errorMessage = errorObj.error;
        }
      }

      setError(errorMessage);
    }
  };

  const handleSubirArchivo = async () => {
    if (archivosASubir.length === 0) {
      setError('Por favor seleccione al menos un archivo');
      return;
    }

    if (!categoriaSeleccionada) {
      setError('Por favor seleccione una categoría');
      return;
    }

    try {
      setSubiendo(true);
      setError('');
      setProgresoSubida({ actual: 0, total: archivosASubir.length });

      // Subir cada archivo con su nombre automático
      for (let i = 0; i < archivosASubir.length; i++) {
        const archivo = archivosASubir[i];
        const nombre = archivo.name;

        setProgresoSubida({
          actual: i,
          total: archivosASubir.length,
          archivoActual: archivo.name
        });

        await subirArchivo(
          archivo,
          nombre,
          '',
          categoriaSeleccionada
        );

        setProgresoSubida({
          actual: i + 1,
          total: archivosASubir.length,
          archivoActual: archivo.name
        });
      }

      // Reset form
      setArchivosASubir([]);
      setMostrarModalArchivo(false);
      setProgresoSubida(null);

      // Recargar categorías para actualizar archivos
      cargarCategorias();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir archivo');
      setProgresoSubida(null);
    } finally {
      setSubiendo(false);
    }
  };

  // Drag and drop handlers
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
      
      // Auto-seleccionar primera categoría si no hay ninguna seleccionada
      if (!categoriaSeleccionada && categorias.length > 0) {
        setCategoriaSeleccionada(categorias[0].ID_Categorias);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setArchivosASubir(prev => [...prev, ...files]);
      
      // Auto-seleccionar primera categoría si no hay ninguna seleccionada
      if (!categoriaSeleccionada && categorias.length > 0) {
        setCategoriaSeleccionada(categorias[0].ID_Categorias);
      }
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

  const handleEliminarArchivo = async (archivoId: number) => {
    if (!confirm('¿Está seguro de eliminar este archivo?')) return;

    try {
      setError('');
      await eliminarArchivo(archivoId);
      cargarCategorias();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar archivo');
    }
  };

  const handleSeleccionarArchivo = (archivoId: number, seleccionado: boolean) => {
    setArchivosSeleccionados(prev => {
      const nuevo = new Set(prev);
      if (seleccionado) {
        nuevo.add(archivoId);
      } else {
        nuevo.delete(archivoId);
      }
      return nuevo;
    });
  };

  const handleSeleccionarTodos = () => {
    if (archivosSeleccionados.size === archivos.length) {
      setArchivosSeleccionados(new Set());
    } else {
      setArchivosSeleccionados(new Set(archivos.map(a => a.ID)));
    }
  };

  const handleEliminarSeleccionados = async () => {
    if (archivosSeleccionados.size === 0) return;

    const confirmMessage = `¿Está seguro de eliminar ${archivosSeleccionados.size} archivo${archivosSeleccionados.size > 1 ? 's' : ''}?`;
    if (!confirm(confirmMessage)) return;

    try {
      setEliminando(true);
      setError('');
      setProgresoEliminacion({ actual: 0, total: archivosSeleccionados.size });

      const archivosArray = Array.from(archivosSeleccionados);
      for (let i = 0; i < archivosArray.length; i++) {
        const archivoId = archivosArray[i];
        const archivo = archivos.find(a => a.ID === archivoId);

        setProgresoEliminacion({
          actual: i,
          total: archivosArray.length,
          archivoActual: archivo?.Nombre || 'Archivo desconocido'
        });

        await eliminarArchivo(archivoId);

        setProgresoEliminacion({
          actual: i + 1,
          total: archivosArray.length,
          archivoActual: archivo?.Nombre || 'Archivo desconocido'
        });
      }

      setArchivosSeleccionados(new Set());
      setModoSeleccionMultiple(false);
      setProgresoEliminacion(null);
      cargarCategorias();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar archivos');
      setProgresoEliminacion(null);
    } finally {
      setEliminando(false);
    }
  };

  const handleEliminarCategoria = async (categoriaId: number, nombreCategoria: string) => {
    const categoria = categorias.find(c => c.ID_Categorias === categoriaId);
    const archivosCount = categoria?.archivos?.length || 0;
    
    const mensajeConfirmacion = archivosCount > 0
      ? `¿Está seguro de eliminar la categoría "${nombreCategoria}"? Se eliminarán también ${archivosCount} archivo${archivosCount > 1 ? 's' : ''} asociado${archivosCount > 1 ? 's' : ''}.`
      : `¿Está seguro de eliminar la categoría "${nombreCategoria}"?`;
    
    if (!confirm(mensajeConfirmacion)) {
      return;
    }

    try {
      setError('');
      await eliminarCategoria(categoriaId);
      
      // Si la categoría eliminada era la seleccionada, seleccionar la primera disponible
      if (categoriaSeleccionada === categoriaId) {
        const categoriasRestantes = categorias.filter(c => c.ID_Categorias !== categoriaId);
        setCategoriaSeleccionada(categoriasRestantes.length > 0 ? categoriasRestantes[0].ID_Categorias : null);
      }
      
      cargarCategorias();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar categoría';
      
      // Mostrar mensaje específico si no se puede eliminar por restricciones
      if (errorMessage.includes('No se puede eliminar') || errorMessage.includes('tiene archivos')) {
        setError(`No se puede eliminar la categoría "${nombreCategoria}" porque contiene archivos. Elimine primero todos los archivos de esta categoría.`);
      } else {
        setError(errorMessage);
      }
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Previsualización functions
  const handlePrevisualizar = async (archivo: Archivo) => {
    try {
      // Para previsualización, abrir directamente la URL sin descargar
      const url = `${import.meta.env.VITE_BACKENDURL || 'https://api.uttecam.edu.mx'}${archivo.Ruta_Documento}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error al previsualizar archivo:', error);
      alert('Error al previsualizar el archivo. Intente descargar en su lugar.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-t-4 border-gray-200 rounded-full border-t-brand-500 animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Documentos - {areaNombre}
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => setMostrarModalCategoria(true)}
            className="px-4 py-2.5 sm:py-3 bg-[#0a9782] text-white rounded-lg sm:rounded-xl hover:bg-[#088c75] transition-all font-medium shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            + Nueva Categoría
          </button>
          <button
            onClick={() => {
              setMostrarModalArchivo(true);
              // Preseleccionar la categoría actualmente seleccionada, o la primera si no hay ninguna
              if (!categoriaSeleccionada && categorias.length > 0) {
                setCategoriaSeleccionada(categorias[0].ID_Categorias);
              }
              // Limpiar archivos anteriores si el modal se abre vacío
              if (archivosASubir.length === 0) {
                // No hay campos adicionales que limpiar
              }
            }}
            disabled={categorias.length === 0}
            className="px-4 py-2.5 sm:py-3 bg-[#d1672a] text-white rounded-lg sm:rounded-xl hover:bg-[#b85822] transition-all font-medium shadow-lg hover:shadow-xl text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Subir Documento
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Categorías Tabs */}
      {categorias.length > 0 ? (
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px space-x-8 overflow-x-auto">
            {categorias.map((categoria) => (
              <div key={categoria.ID_Categorias} className="flex items-center group">
                <button
                  onClick={() => setCategoriaSeleccionada(categoria.ID_Categorias)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    categoriaSeleccionada === categoria.ID_Categorias
                      ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                  }`}
                >
                  {categoria.Nombre}
                  <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                    (categoria.archivos?.length || 0) > 0
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {(categoria.archivos?.length || 0)} archivo{(categoria.archivos?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </button>
                <button
                  onClick={() => handleEliminarCategoria(categoria.ID_Categorias, categoria.Nombre)}
                  className="ml-1 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  title={`Eliminar categoría "${categoria.Nombre}"`}
                  disabled={subiendo}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </nav>
        </div>
      ) : (
        <div className="p-8 text-center border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            No hay categorías. Cree una para empezar a organizar documentos.
          </p>
        </div>
      )}

      {/* Lista de Archivos */}
      {archivos.length > 0 ? (
        <>
          {/* Header con controles de selección múltiple */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setModoSeleccionMultiple(!modoSeleccionMultiple)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  modoSeleccionMultiple
                    ? 'bg-[#d1672a] text-white hover:bg-[#b85822]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {modoSeleccionMultiple ? 'Cancelar selección' : 'Seleccionar múltiples'}
              </button>
              {modoSeleccionMultiple && archivos.length > 0 && (
                <button
                  onClick={handleSeleccionarTodos}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  {archivosSeleccionados.size === archivos.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                </button>
              )}
            </div>
            {modoSeleccionMultiple && archivosSeleccionados.size > 0 && (
              <button
                onClick={handleEliminarSeleccionados}
                disabled={eliminando}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {eliminando ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar {archivosSeleccionados.size} archivo{archivosSeleccionados.size > 1 ? 's' : ''}
                  </>
                )}
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {archivos.map((archivo) => (
            <div
              key={archivo.ID}
              onClick={() => !modoSeleccionMultiple && handlePrevisualizar(archivo)}
              className={`p-4 bg-white border rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 transition-all ${
                modoSeleccionMultiple ? 'cursor-default' : 'cursor-pointer hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600'
              } ${archivosSeleccionados.has(archivo.ID) ? 'ring-2 ring-[#d1672a] border-[#d1672a]' : 'border-gray-200'} ${
                progresoEliminacion && archivosSeleccionados.has(archivo.ID) ? 'opacity-50 animate-pulse' : ''
              }`}
            >
              {modoSeleccionMultiple && (
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    checked={archivosSeleccionados.has(archivo.ID)}
                    onChange={(e) => handleSeleccionarArchivo(archivo.ID, e.target.checked)}
                    className="w-4 h-4 text-[#d1672a] bg-gray-100 border-gray-300 rounded focus:ring-[#d1672a] dark:focus:ring-[#d1672a] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                    Seleccionar
                  </label>
                </div>
              )}

              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate dark:text-white">
                      {archivo.Nombre}
                    </h3>
                  </div>
                </div>
              </div>

              {archivo.Descripcion && (
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {archivo.Descripcion}
                </p>
              )}

              <div className="mb-3 text-xs text-gray-400">
                <p>Subido: {formatearFecha(archivo.Fecha_Subida)}</p>
              </div>

              {!modoSeleccionMultiple && (
                <div className="flex gap-2">
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        // Abrir directamente la URL para descarga
                        const url = `${import.meta.env.VITE_BACKENDURL || 'https://api.uttecam.edu.mx'}${archivo.Ruta_Documento}`;
                        window.open(url, '_blank');
                      } catch (error) {
                        console.error('Error al descargar archivo:', error);
                        alert('Error al descargar el archivo.');
                      }
                    }}
                    className="flex-1 px-3 py-2 text-xs font-medium text-center text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-all"
                  >
                    Descargar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEliminarArchivo(archivo.ID);
                    }}
                    className="px-3 py-2 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        </>
      ) : (
        categoriaSeleccionada && (
          <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              No hay documentos en esta categoría. Suba el primer documento.
            </p>
          </div>
        )
      )}

      {/* Modal Crear Categoría */}
      {mostrarModalCategoria && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-[95%] sm:max-w-md mx-auto max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Nueva Categoría
              </h3>
              <button
                onClick={() => setMostrarModalCategoria(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full flex-shrink-0"
                aria-label="Cerrar modal"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nombre de la Categoría <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nombreCategoria}
                  onChange={(e) => setNombreCategoria(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#0a9782] focus:border-[#0a9782] dark:bg-gray-700 dark:text-white transition-all outline-none text-sm sm:text-base"
                  placeholder="Ej: Reglamentos Internos"
                  autoFocus
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                <button
                  onClick={() => {
                    setMostrarModalCategoria(false);
                    setNombreCategoria('');
                  }}
                  className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-sm sm:text-base"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrearCategoria}
                  className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-[#0a9782] text-white rounded-lg sm:rounded-xl hover:bg-[#088c75] transition-all font-medium shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  Crear Categoría
                </button>
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
                Subir Documento
              </h3>
              <button
                onClick={() => {
                  setMostrarModalArchivo(false);
                  setArchivosASubir([]);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full flex-shrink-0"
                aria-label="Cerrar modal"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {archivosASubir.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Información automática:</strong> Los archivos se subirán con sus nombres originales. 
                    {archivosASubir.length === 1 
                      ? `Nombre: "${archivosASubir[0].name}"`
                      : `Se usarán los nombres originales de cada archivo (${archivosASubir.length} archivos)`
                    }
                  </p>
                </div>
              )}

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Archivos *
                </label>
                
                {/* Drag and drop zone */}
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
                      <p className="text-xs text-gray-500">
                        Máximo 100MB por archivo. Formatos: PDF, Word, Excel, PowerPoint, TXT, ZIP, RAR
                      </p>
                    </div>
                  </div>
                </div>

                {/* File list */}
                {archivosASubir.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Archivos seleccionados ({archivosASubir.length}):
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {archivosASubir.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded p-2">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 dark:text-white truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatearTamanoArchivo(file.size)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remover archivo"
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

            {/* Barra de progreso */}
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
                {progresoSubida.archivoActual && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
                    {progresoSubida.archivoActual}
                  </p>
                )}
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-[#d1672a] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(progresoSubida.actual / progresoSubida.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Barra de progreso de eliminación */}
            {progresoEliminacion && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg sm:rounded-xl border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    Eliminando archivos...
                  </span>
                  <span className="text-sm text-red-600 dark:text-red-400">
                    {progresoEliminacion.actual} de {progresoEliminacion.total}
                  </span>
                </div>
                {progresoEliminacion.archivoActual && (
                  <p className="text-xs text-red-600 dark:text-red-400 mb-2 truncate">
                    {progresoEliminacion.archivoActual}
                  </p>
                )}
                <div className="w-full bg-red-200 dark:bg-red-800 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(progresoEliminacion.actual / progresoEliminacion.total) * 100}%` }}
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
                disabled={subiendo || archivosASubir.length === 0 || !categoriaSeleccionada}
                className="flex-1 px-4 py-2.5 sm:py-3 bg-[#d1672a] text-white rounded-lg sm:rounded-xl hover:bg-[#b85822] transition-all font-medium shadow-lg hover:shadow-xl text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {progresoSubida
                  ? `Subiendo... (${progresoSubida.actual}/${progresoSubida.total})`
                  : subiendo
                    ? 'Subiendo...'
                    : archivosASubir.length === 0
                      ? 'Subir archivos'
                      : !categoriaSeleccionada
                        ? 'Selecciona una categoría'
                        : `Subir ${archivosASubir.length} archivo${archivosASubir.length > 1 ? 's' : ''}`
                }
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
