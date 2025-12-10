import { useState, useEffect, useCallback } from 'react';
import { confirmDialog, toastSuccess, toastError } from '../../utils/alert';
import type { ExtensionDocument, ExtensionCategory } from '../../services/extensionDocumentosService';
import {
  obtenerCategorias,
  obtenerDocumentos,
  subirArchivo,
  eliminarArchivo,
  previsualizarArchivo
} from '../../services/extensionDocumentosService';
import { Trash2, Upload, Eye, Download, Calendar } from 'lucide-react';
import Button from '../ui/button/Button';

interface GestorDocumentosExtensionProps {
  initialCategory?: 'gaceta' | 'promocion';
}

export default function GestorDocumentosExtension({ initialCategory }: GestorDocumentosExtensionProps) {
  const [categorias, setCategorias] = useState<ExtensionCategory[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [documentos, setDocumentos] = useState<ExtensionDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [mostrarModalDocumento, setMostrarModalDocumento] = useState(false);
  
  // Form states
  const [titulo, setTitulo] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [imagenPortada, setImagenPortada] = useState<File | null>(null);
  const [fechaPublicacion, setFechaPublicacion] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [subiendo, setSubiendo] = useState(false);

  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);

  // Selection states
  const [documentosSeleccionados, setDocumentosSeleccionados] = useState<Set<number>>(new Set());
  const [modoSeleccionMultiple, setModoSeleccionMultiple] = useState(false);

  const cargarCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const cats = await obtenerCategorias();
      setCategorias(cats);

      // Seleccionar categoría inicial
      const categoriaInicial = initialCategory || 'gaceta';
      setCategoriaSeleccionada(categoriaInicial);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  }, [initialCategory]);

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  const cargarDocumentos = useCallback(async () => {
    if (!categoriaSeleccionada) return;
    
    try {
      setLoading(true);
      setError('');
      const docs = await obtenerDocumentos(categoriaSeleccionada);
      setDocumentos(docs);
      setDocumentosSeleccionados(new Set());
      setModoSeleccionMultiple(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar documentos');
    } finally {
      setLoading(false);
    }
  }, [categoriaSeleccionada]);

  useEffect(() => {
    if (categoriaSeleccionada) {
      cargarDocumentos();
    }
  }, [categoriaSeleccionada, cargarDocumentos]);

  const handleSubirDocumento = async () => {
    if (!categoriaSeleccionada) {
      toastError('Debes seleccionar una categoría');
      return;
    }

    if (!titulo.trim()) {
      toastError('El título es requerido');
      return;
    }

    if (!archivo) {
      toastError('Debes seleccionar un archivo (PDF o imagen)');
      return;
    }

    // Category-specific validation
    if (categoriaSeleccionada === 'gaceta' && archivo.type !== 'application/pdf') {
      toastError('Gacetas requieren un PDF como documento principal');
      return;
    }
    if (categoriaSeleccionada === 'promocion' && !(archivo.type === 'application/pdf' || archivo.type.startsWith('image/'))) {
      toastError('Para Promoción solo se permiten PDF o imágenes');
      return;
    }

    try {
      setSubiendo(true);
      setError('');
      
      await subirArchivo(
        categoriaSeleccionada,
        titulo,
        archivo,
        imagenPortada,
        fechaPublicacion
      );

      toastSuccess('Documento subido correctamente');
      setMostrarModalDocumento(false);
      resetForm();
      cargarDocumentos();
    } catch (err) {
      console.error('Error al subir documento:', err);
      toastError(err instanceof Error ? err.message : 'Error al subir el documento');
    } finally {
      setSubiendo(false);
    }
  };

  const handleEliminarDocumento = async (id: number, titulo: string) => {
    const isConfirmed = await confirmDialog({
      title: '¿Eliminar documento?',
      text: `Se eliminará "${titulo}" y no se puede deshacer.`
    });

    if (isConfirmed) {
      try {
        await eliminarArchivo(id);
        toastSuccess('Documento eliminado correctamente');
        cargarDocumentos();
      } catch (err) {
        console.error('Error al eliminar:', err);
        toastError('Error al eliminar el documento');
      }
    }
  };

  const handleEliminarSeleccionados = async () => {
    if (documentosSeleccionados.size === 0) {
      toastError('No hay documentos seleccionados');
      return;
    }

    const isConfirmed = await confirmDialog({
      title: '¿Eliminar documentos seleccionados?',
      text: `Se eliminarán ${documentosSeleccionados.size} documento(s) y no se puede deshacer.`
    });

    if (!isConfirmed) return;

    try {
      const idsArray = Array.from(documentosSeleccionados);
      let eliminados = 0;

      for (const id of idsArray) {
        try {
          await eliminarArchivo(id);
          eliminados++;
        } catch (err) {
          console.error(`Error al eliminar documento ${id}:`, err);
        }
      }

      if (eliminados > 0) {
        toastSuccess(`${eliminados} documento(s) eliminado(s) correctamente`);
      }
      
      setDocumentosSeleccionados(new Set());
      setModoSeleccionMultiple(false);
      cargarDocumentos();
    } catch (err) {
      console.error('Error al eliminar documentos:', err);
      toastError('Error al eliminar los documentos');
    }
  };

  const resetForm = () => {
    setTitulo('');
    setArchivo(null);
    setImagenPortada(null);
    setFechaPublicacion(new Date().toISOString().split('T')[0]);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    // For promotions, accept an image as primary; for gaceta expect PDF. Default: prefer PDF as primary.
    const pdfFile = files.find(f => f.type === 'application/pdf');
    const imageFile = files.find(f => f.type.startsWith('image/'));

    // If category is promotion we'll allow image as primary
    if (categoriaSeleccionada === 'promocion') {
      const primary = pdfFile || imageFile || null;
      if (primary) {
        setArchivo(primary);
        if (!titulo) setTitulo(primary.name.replace(/\.(pdf|jpg|jpeg|png|webp)$/i, ''));
      }
      // If we found an image but no pdf, set it as cover if not primary
      if (!pdfFile && imageFile) {
        setImagenPortada(imageFile);
      }
    } else {
      // Other categories expect a PDF as primary
      if (pdfFile) {
        setArchivo(pdfFile);
        if (!titulo) setTitulo(pdfFile.name.replace('.pdf', ''));
      }
      if (imageFile) {
        setImagenPortada(imageFile);
      }
    }

    if (!pdfFile && !imageFile) {
      toastError('Debes arrastrar un archivo PDF y opcionalmente una imagen de portada');
    }
  };

  const toggleSeleccion = (id: number) => {
    const nuevaSeleccion = new Set(documentosSeleccionados);
    if (nuevaSeleccion.has(id)) {
      nuevaSeleccion.delete(id);
    } else {
      nuevaSeleccion.add(id);
    }
    setDocumentosSeleccionados(nuevaSeleccion);
  };

  const seleccionarTodos = () => {
    if (documentosSeleccionados.size === documentos.length) {
      setDocumentosSeleccionados(new Set());
    } else {
      setDocumentosSeleccionados(new Set(documentos.map(d => d.id)));
    }
  };

  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && categorias.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs de Categorías */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Categorías">
          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              onClick={() => setCategoriaSeleccionada(categoria.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  categoriaSeleccionada === categoria.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {categoria.name}
              <span className="ml-2 py-0.5 px-2 rounded-full bg-gray-100 text-xs">
                {documentos.length}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            onClick={() => setMostrarModalDocumento(true)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Upload size={16} />
            Subir Documento
          </Button>

          {documentos.length > 0 && (
            <Button
              onClick={() => setModoSeleccionMultiple(!modoSeleccionMultiple)}
              variant={modoSeleccionMultiple ? 'primary' : 'outline'}
            >
              {modoSeleccionMultiple ? 'Cancelar selección' : 'Seleccionar múltiples'}
            </Button>
          )}

          {modoSeleccionMultiple && documentosSeleccionados.size > 0 && (
            <Button
              onClick={handleEliminarSeleccionados}
              variant="danger"
              className="flex items-center gap-2"
            >
              <Trash2 size={16} />
              Eliminar ({documentosSeleccionados.size})
            </Button>
          )}
        </div>

        {modoSeleccionMultiple && documentos.length > 0 && (
          <Button onClick={seleccionarTodos} variant="outline" size="sm">
            {documentosSeleccionados.size === documentos.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </Button>
        )}
      </div>

      {/* Lista de Documentos */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : documentos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay documentos</h3>
          <p className="mt-1 text-sm text-gray-500">Comienza subiendo tu primer documento</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {documentos.map((documento) => (
              <li key={documento.id} className="hover:bg-gray-50 transition-colors">
                <div className="px-4 py-4 flex items-center sm:px-6">
                  {modoSeleccionMultiple && (
                    <input
                      type="checkbox"
                      checked={documentosSeleccionados.has(documento.id)}
                      onChange={() => toggleSeleccion(documento.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
                    />
                  )}

                  {documento.cover_url && (
                    <img
                      src={`${import.meta.env.VITE_BACKENDURL}${documento.cover_url}`}
                      alt={documento.title}
                      className="h-16 w-16 object-cover rounded mr-4"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {documento.title}
                    </h4>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <Calendar size={14} className="mr-1" />
                      {formatearFecha(documento.publication_date)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => previsualizarArchivo(documento.file_url)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Vista previa"
                    >
                      <Eye size={18} />
                    </button>

                    <a
                      href={`${import.meta.env.VITE_BACKENDURL}${documento.file_url}`}
                      download
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                      title="Descargar"
                    >
                      <Download size={18} />
                    </a>

                    <button
                      onClick={() => handleEliminarDocumento(documento.id, documento.title)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal Subir Documento */}
      {mostrarModalDocumento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Subir Nuevo Documento</h2>

              {/* Drag & Drop Zone */}
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-colors
                  ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                `}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Arrastra tu PDF y portada aquí o haz clic en los botones de abajo
                </p>
              </div>

              <div className="space-y-4">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre del documento"
                  />
                </div>

                {/* Archivo PDF */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {categoriaSeleccionada === 'promocion' ? 'Archivo (PDF o imagen) *' : 'Archivo PDF *'}
                  </label>
                  <input
                      type="file"
                      accept={categoriaSeleccionada === 'promocion' ? 'application/pdf,image/*' : 'application/pdf'}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const isImage = file.type.startsWith('image/');
                        const isPdf = file.type === 'application/pdf';
                        // If selected file type is not allowed for the current category, show an error and hint user
                        if (categoriaSeleccionada === 'gaceta' && !isPdf) {
                          setArchivo(null);
                          toastError('Gacetas requieren un PDF. Cambia a la categoría Promoción si deseas subir imágenes.');
                          return;
                        }
                        if (categoriaSeleccionada === 'promocion' && !(isPdf || isImage)) {
                          setArchivo(null);
                          toastError('Para Promoción sólo se permiten PDF o imágenes.');
                          return;
                        }
                        setArchivo(file);
                        if (!titulo) setTitulo(file.name.replace(/\.(pdf|jpg|jpeg|png|webp)$/i, ''));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  {archivo ? (
                    <p className="mt-1 text-sm text-green-600">✓ {archivo.name}</p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">{categoriaSeleccionada === 'promocion' ? 'Acepta imágenes (JPG/PNG/WebP) o PDF.' : 'Sólo PDFs permitidos para Gacetas.'}</p>
                  )}
                </div>

                {/* Imagen de Portada */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen de Portada (Opcional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImagenPortada(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {imagenPortada && (
                    <p className="mt-1 text-sm text-green-600">✓ {imagenPortada.name}</p>
                  )}
                </div>

                {/* Fecha de Publicación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Publicación
                  </label>
                  <input
                    type="date"
                    value={fechaPublicacion}
                    onChange={(e) => setFechaPublicacion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  onClick={() => {
                    setMostrarModalDocumento(false);
                    resetForm();
                  }}
                  variant="outline"
                  disabled={subiendo}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubirDocumento}
                  variant="primary"
                  disabled={subiendo || !archivo || !titulo.trim()}
                >
                  {subiendo ? 'Subiendo...' : 'Subir Documento'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
