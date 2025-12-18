import { useState, useEffect } from 'react';
import { confirmDialog, toastError, toastSuccess } from '../../../utils/alert';
import { useHeroSlides } from '../../../hooks/useHeroSlides';
import type { HeroSlide } from '../../../types/home';
import { getHeroSlideFileUrl } from '../../../services/homeService';
import type { CreateHeroSlideRequest, UpdateHeroSlideRequest } from '../../../types/home';

const HeroSlidesAdmin = () => {
  const {
    heroSlides,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    includeInactive,
    setIncludeInactive,
    reorderSlides,
  } = useHeroSlides();

  const [orderedSlides, setOrderedSlides] = useState<HeroSlide[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{ url: string; tipo: 'imagen' | 'video'; titulo?: string } | null>(null);
  const [previewLoadError, setPreviewLoadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'imagen' as 'imagen' | 'video',
    orden: 0,
    activo: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile && !editingId) {
      toastError('Debe seleccionar un archivo');
      return;
    }

    // Validar tamaño de archivo en cliente con el límite configurado
    const maxMbEnv = Number(import.meta.env.VITE_HERO_SLIDE_MAX_FILE_SIZE_MB) || 200;
    if (selectedFile && selectedFile.size > maxMbEnv * 1024 * 1024) {
      toastError(`El archivo supera el tamaño máximo permitido de ${maxMbEnv}MB`);
      return;
    }

    const data: CreateHeroSlideRequest | UpdateHeroSlideRequest = {
      titulo: formData.titulo,
      tipo: formData.tipo,
      orden: formData.orden,
      activo: formData.activo,
      ...(selectedFile && { archivo: selectedFile }),
    };

    const success = editingId 
      ? await updateItem(editingId, data as UpdateHeroSlideRequest)
      : await createItem(data as CreateHeroSlideRequest);

    if (success) {
      resetForm();
      setIsModalOpen(false);
    }
  };

  const handleEdit = (id: number) => {
    const slide = heroSlides.find(s => s.id === id);
    if (slide) {
      setEditingId(id);
      setFormData({
        titulo: slide.titulo,
        tipo: slide.tipo,
        orden: slide.orden,
        activo: slide.activo,
      });
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDialog({ title: 'Eliminar Slide', text: '¿Está seguro de eliminar este slide?' });
    if (!confirmed) return;
    const success = await deleteItem(id);
    if (success) toastSuccess('Slide eliminado correctamente');
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      tipo: 'imagen',
      orden: 0,
      activo: true,
    });
    setSelectedFile(null);
    setEditingId(null);
  };

  // Close preview on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewOpen(false);
    };
    if (previewOpen) {
      window.addEventListener('keydown', onKey);
    }
    return () => window.removeEventListener('keydown', onKey);
  }, [previewOpen]);

  // keep orderedSlides in sync with heroSlides
  useEffect(() => {
    setOrderedSlides(heroSlides.slice().sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)));
  }, [heroSlides]);

  if (loading) return <div className="p-4">Cargando...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Gestión de Hero Slides</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span>Mostrar:</span>
            <select
              value={includeInactive ? 'all' : 'active'}
              onChange={(e) => setIncludeInactive(e.target.value === 'all')}
              className="px-2 py-1 border rounded"
            >
              <option value="active">Activos</option>
              <option value="all">Todos</option>
            </select>
          </label>
          <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Nuevo Slide
        </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {heroSlides.length === 0 && (
          <div className="col-span-full bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-lg font-medium">No hay slides</h3>
            <p className="text-sm text-gray-500 mt-2">Crea tu primer slide usando el botón 'Nuevo Slide'.</p>
          </div>
        )}
          {orderedSlides.map((slide, idx) => (
          <div key={slide.id} className="bg-white rounded-lg shadow p-4 flex flex-col">
            <div
              className={`w-full rounded overflow-hidden bg-gray-100 relative ${dragIndex === idx ? 'opacity-70' : ''}`}
              draggable
              onDragStart={(e) => {
                setDragIndex(idx);
                e.dataTransfer.setData('text/plain', String(idx));
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDragEnd={() => setDragIndex(null)}
              onDrop={async (e) => {
                e.preventDefault();
                const sourceStr = e.dataTransfer.getData('text/plain');
                if (!sourceStr) return;
                const sourceIndex = parseInt(sourceStr, 10);
                const targetIndex = idx;
                if (isNaN(sourceIndex)) return;
                // Create new order
                const newOrder = [...orderedSlides];
                const [moved] = newOrder.splice(sourceIndex, 1);
                newOrder.splice(targetIndex, 0, moved);
                // Update order values
                const updated = newOrder.map((s, i) => ({ ...s, orden: i + 1 }));
                setOrderedSlides(updated);
                try {
                  await reorderSlides(updated);
                  toastSuccess('Orden guardado');
                } catch (err) {
                  toastError('Error al guardar el orden');
                  // revert
                  setOrderedSlides([...orderedSlides]);
                }
                setDragIndex(null);
                // no-op
              }}
            >
              {slide.archivo ? (
                slide.tipo === 'imagen' ? (
                  <img
                    src={getHeroSlideFileUrl(slide.archivo)}
                    alt={slide.titulo}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <video
                    src={getHeroSlideFileUrl(slide.archivo)}
                    className="w-full h-40 object-cover"
                    controls
                    aria-label={slide.titulo}
                  />
                )
              ) : (
                <div className="w-full h-40 flex items-center justify-center bg-gray-100 text-gray-400">Sin archivo</div>
              )}
              <button
                className="absolute top-2 right-2 bg-white/80 rounded p-1 border border-gray-200 hover:bg-white"
                onClick={(e) => {
                  // Prevent drag events and stop propagation so preview opens reliably
                  e.preventDefault();
                  e.stopPropagation();
                  if (!slide.archivo) {
                    toastError('Archivo no disponible para previsualizar');
                    return;
                  }
                  const url = getHeroSlideFileUrl(slide.archivo);
                  if (!url) {
                    toastError('URL de archivo inválida');
                    return;
                  }
                  // Clear any drag state before showing modal
                  setDragIndex(null);
                  setPreviewData({ url, tipo: slide.tipo, titulo: slide.titulo });
                  setPreviewLoadError(null);
                  setPreviewOpen(true);
                }}
                aria-label={`Previsualizar ${slide.titulo}`}
                title={slide.archivo ? `Previsualizar ${slide.titulo}` : 'Archivo no disponible'}
                disabled={!slide.archivo}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A2 2 0 0122 9.618v4.764a2 2 0 01-2.447 1.894L15 14M4 6h8v12H4z" />
                </svg>
              </button>
            </div>
            <div className="mt-3 flex-grow">
              <h3 className="font-medium text-lg text-gray-900 truncate">{slide.titulo}</h3>
              <p className="text-sm text-gray-500 mt-1">Tipo: <span className="font-medium text-gray-700">{slide.tipo}</span></p>
              <p className="text-sm text-gray-500">Orden: <span className="font-medium text-gray-700">{slide.orden}</span></p>
            </div>
              <div className="mt-3 flex items-center justify-between">
              <span className={`px-2 py-1 text-xs rounded ${slide.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {slide.activo ? 'Activo' : 'Inactivo'}
              </span>
              <div className="space-x-2">
                <button onClick={() => handleEdit(slide.id)} className="px-2 py-1 bg-white border border-gray-200 text-blue-600 rounded hover:bg-gray-50" aria-label={`Editar ${slide.titulo}`}>Editar</button>
                <button onClick={() => handleDelete(slide.id)} className="px-2 py-1 bg-white border border-gray-200 text-red-600 rounded hover:bg-gray-50" aria-label={`Eliminar ${slide.titulo}`}>Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewOpen && previewData && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black bg-opacity-60">
          <div className="relative max-w-4xl w-full mx-4">
            <button
              className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow"
              onClick={() => setPreviewOpen(false)}
              aria-label="Cerrar previsualización"
            >
              ✕
            </button>
            <div className="bg-white rounded overflow-hidden p-4 max-h-[80vh] overflow-auto">
              <h3 className="text-lg font-semibold mb-2">{previewData.titulo}</h3>
              {previewData.tipo === 'imagen' ? (
                <img src={previewData.url} alt={previewData.titulo} className="w-full object-contain" onError={() => setPreviewLoadError('No se pudo cargar la imagen')} />
              ) : (
                <video src={previewData.url} className="w-full" controls aria-label={previewData.titulo} onError={() => setPreviewLoadError('No se pudo cargar el video')} />
              )}
              {previewLoadError && <div className="text-sm text-red-600 mt-2">{previewLoadError}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'Editar Slide' : 'Nuevo Slide'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'imagen' | 'video' })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="imagen">Imagen</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archivo {editingId && '(dejar vacío para mantener el actual)'}
                </label>
                <input
                  type="file"
                  accept={formData.tipo === 'imagen' ? 'image/*' : 'video/*'}
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  required={!editingId}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orden
                </label>
                <input
                  type="number"
                  value={formData.orden}
                  onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Activo</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSlidesAdmin;
