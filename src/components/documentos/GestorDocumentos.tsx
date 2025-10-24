import { useState, useEffect } from 'react';
import type { Categoria, Archivo } from '../../services/documentosService';
import {
  obtenerCategorias,
  crearCategoria,
  subirArchivo,
  eliminarArchivo,
  descargarArchivo
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
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [descripcionArchivo, setDescripcionArchivo] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    cargarCategorias();
  }, [areaId]);

  useEffect(() => {
    if (categoriaSeleccionada) {
      const categoria = categorias.find(c => c.ID_Categorias === categoriaSeleccionada);
      setArchivos(categoria?.archivos || []);
    }
  }, [categoriaSeleccionada, categorias]);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      setError('');
      const todasCategorias = await obtenerCategorias();
      const categoriasArea = todasCategorias.filter(c => c.ID_Area === areaId);
      setCategorias(categoriasArea);
      
      if (categoriasArea.length > 0 && !categoriaSeleccionada) {
        setCategoriaSeleccionada(categoriasArea[0].ID_Categorias);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearCategoria = async () => {
    if (!nombreCategoria.trim()) {
      setError('El nombre de la categoría es requerido');
      return;
    }

    try {
      setError('');
      await crearCategoria(nombreCategoria, areaId);
      setNombreCategoria('');
      setMostrarModalCategoria(false);
      cargarCategorias();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear categoría');
    }
  };

  const handleSubirArchivo = async () => {
    if (!archivo || !nombreArchivo.trim() || !categoriaSeleccionada) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      setSubiendo(true);
      setError('');
      
      await subirArchivo(
        archivo,
        nombreArchivo,
        descripcionArchivo,
        categoriaSeleccionada
      );

      // Reset form
      setNombreArchivo('');
      setDescripcionArchivo('');
      setArchivo(null);
      setMostrarModalArchivo(false);
      
      // Recargar categorías para actualizar archivos
      cargarCategorias();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir archivo');
    } finally {
      setSubiendo(false);
    }
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

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
            className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600"
          >
            + Nueva Categoría
          </button>
          <button
            onClick={() => setMostrarModalArchivo(true)}
            disabled={categorias.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📤 Subir Documento
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
              <button
                key={categoria.ID_Categorias}
                onClick={() => setCategoriaSeleccionada(categoria.ID_Categorias)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  categoriaSeleccionada === categoria.ID_Categorias
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }`}
              >
                {categoria.Nombre}
                <span className="ml-2 text-xs text-gray-400">
                  ({categoria.archivos?.length || 0})
                </span>
              </button>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {archivos.map((archivo) => (
            <div
              key={archivo.ID}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700"
            >
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

              <div className="flex gap-2">
                <a
                  href={descargarArchivo(archivo.Ruta_Documento)}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 text-xs font-medium text-center text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                  Descargar
                </a>
                <button
                  onClick={() => handleEliminarArchivo(archivo.ID)}
                  className="px-3 py-2 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Nueva Categoría
            </h3>
            <input
              type="text"
              value={nombreCategoria}
              onChange={(e) => setNombreCategoria(e.target.value)}
              placeholder="Nombre de la categoría"
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMostrarModalCategoria(false);
                  setNombreCategoria('');
                }}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearCategoria}
                className="flex-1 px-4 py-2 text-white rounded-lg bg-brand-500 hover:bg-brand-600"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Subir Archivo */}
      {mostrarModalArchivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Subir Documento
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Categoría
                </label>
                <select
                  value={categoriaSeleccionada || ''}
                  onChange={(e) => setCategoriaSeleccionada(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {categorias.map((cat) => (
                    <option key={cat.ID_Categorias} value={cat.ID_Categorias}>
                      {cat.Nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre del documento *
                </label>
                <input
                  type="text"
                  value={nombreArchivo}
                  onChange={(e) => setNombreArchivo(e.target.value)}
                  placeholder="Ej: Reglamento Interno 2025"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descripción
                </label>
                <textarea
                  value={descripcionArchivo}
                  onChange={(e) => setDescripcionArchivo(e.target.value)}
                  placeholder="Descripción opcional del documento"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Archivo *
                </label>
                <input
                  type="file"
                  onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Máximo 100MB. Formatos: PDF, Word, Excel, PowerPoint, TXT, ZIP, RAR
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setMostrarModalArchivo(false);
                  setNombreArchivo('');
                  setDescripcionArchivo('');
                  setArchivo(null);
                }}
                disabled={subiendo}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubirArchivo}
                disabled={subiendo || !archivo || !nombreArchivo.trim()}
                className="flex-1 px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {subiendo ? 'Subiendo...' : 'Subir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
