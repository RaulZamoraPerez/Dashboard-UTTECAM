import { useState, useEffect } from 'react';
import { confirmDialog, toastError, toastSuccess } from '../../../utils/alert';
import { HorizontaLDots } from '../../../icons';
import { useNoticias } from '../../../hooks/useNoticias';
import { getNoticiaFileUrl } from '../../../services/homeService';

const NoticiasAdmin = () => {
  const { noticias, loading, error, createItem, updateItem, deleteItem, reorderNoticias, includeInactive, setIncludeInactive } = useNoticias();
  const [orderedNoticias, setOrderedNoticias] = useState(() => [] as typeof noticias);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // keep orderedNoticias in sync with noticias
  useEffect(() => {
    setOrderedNoticias(noticias.slice().sort((a,b) => (a.orden ?? 0) - (b.orden ?? 0)));
  }, [noticias]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    orden: 0,
    activo: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile && !editingId) {
      toastError('Debe seleccionar una imagen');
      return;
    }

    let success = false;
    
    if (editingId) {
      const updateData: any = {
        titulo: formData.titulo,
        activo: formData.activo,
        ...(selectedFile && { imagen: selectedFile }),
      };
      success = await updateItem(editingId, updateData);
    } else if (selectedFile) {
      const createData: any = {
        titulo: formData.titulo,
        activo: formData.activo,
        imagen: selectedFile,
      };
      success = await createItem(createData);
    }

    if (success) {
      resetForm();
      setIsModalOpen(false);
    }
  };

  const handleEdit = (id: number) => {
    const noticia = noticias.find(n => n.id === id);
    if (noticia) {
      setEditingId(id);
      setFormData({
        titulo: noticia.titulo,
        orden: noticia.orden,
        activo: noticia.activo,
      });
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDialog({ title: 'Eliminar noticia', text: '¿Está seguro de eliminar esta noticia?' });
    if (!confirmed) return;
    const success = await deleteItem(id);
    if (success) toastSuccess('Noticia eliminada correctamente');
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      orden: 0,
      activo: true,
    });
    setSelectedFile(null);
    setEditingId(null);
  };

  if (loading) return <div className="p-4">Cargando...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Gestión de Noticias</h1>
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
            Nueva Noticia
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {noticias.length === 0 && (
          <div className="col-span-full bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-lg font-medium">No hay noticias</h3>
            <p className="text-sm text-gray-500 mt-2">Crea tu primera noticia usando el botón 'Nueva Noticia'.</p>
          </div>
        )}

        {orderedNoticias.map((noticia, idx) => (
          <div key={noticia.id} className={`bg-white rounded-lg shadow p-4 flex flex-col relative ${dragIndex === idx ? 'opacity-70' : ''}`}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
            onDrop={async (e) => {
              e.preventDefault();
              const sourceStr = e.dataTransfer.getData('text/plain');
              if (!sourceStr) return;
              const sourceIndex = parseInt(sourceStr, 10);
              const targetIndex = idx;
              if (isNaN(sourceIndex)) return;
              const newOrder = [...orderedNoticias];
              const [moved] = newOrder.splice(sourceIndex, 1);
              newOrder.splice(targetIndex, 0, moved);
              const updated = newOrder.map((n, i) => ({ ...n, orden: i + 1 }));
              setOrderedNoticias(updated);
              try {
                await reorderNoticias(updated);
                toastSuccess('Orden guardado');
              } catch (err) {
                toastError('Error al guardar el orden');
                setOrderedNoticias(noticias.slice().sort((a,b) => (a.orden ?? 0) - (b.orden ?? 0)));
              }
              setDragIndex(null);
            }}>
            <button
              type="button"
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                setDragIndex(idx);
                e.dataTransfer.setData('text/plain', String(idx));
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragEnd={() => setDragIndex(null)}
              title="Reordenar noticia"
              aria-label="Reordenar noticia"
              className="absolute top-2 right-2 bg-white/80 rounded p-1 border border-gray-200 hover:bg-white cursor-grab"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 9h10M7 12h10M7 15h10" />
              </svg>
            </button>
            <div className="w-full rounded overflow-hidden bg-gray-100">
              <button
                type="button"
                onClick={() => { setPreviewUrl(getNoticiaFileUrl(noticia.imagen)); setPreviewOpen(true); }}
                className="w-full h-40 block"
              >
                <img src={getNoticiaFileUrl(noticia.imagen)} alt={noticia.titulo} className="w-full h-40 object-cover" />
              </button>
            </div>
            <div className="mt-3 flex-grow">
              <h3 className="font-medium text-lg text-gray-900 truncate">{noticia.titulo}</h3>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className={`px-2 py-1 text-xs rounded ${noticia.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {noticia.activo ? 'Activo' : 'Inactivo'}
              </span>
              <div className="space-x-2">
                <button onClick={() => handleEdit(noticia.id)} className="px-2 py-1 bg-white border border-gray-200 text-blue-600 rounded hover:bg-gray-50">Editar</button>
                <button onClick={() => handleDelete(noticia.id)} className="px-2 py-1 bg-white border border-gray-200 text-red-600 rounded hover:bg-gray-50">Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'Editar Noticia' : 'Nueva Noticia'}
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
                  Imagen {editingId && '(dejar vacío para mantener la actual)'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  required={!editingId}
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

      {/* Preview Modal */}
      {previewOpen && previewUrl && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black bg-opacity-60">
          <div className="relative max-w-4xl w-full mx-4">
            <button className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow" onClick={() => setPreviewOpen(false)}>✕</button>
            <div className="bg-white rounded overflow-hidden p-4 max-h-[80vh] overflow-auto">
              <img src={previewUrl} className="w-full object-contain" alt="Preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticiasAdmin;
