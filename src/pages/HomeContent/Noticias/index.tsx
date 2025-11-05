import { useState } from 'react';
import { useNoticias } from '../../../hooks/useNoticias';
import { getNoticiaFileUrl } from '../../../services/homeService';

const NoticiasAdmin = () => {
  const { noticias, loading, error, createItem, updateItem, deleteItem } = useNoticias();
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
      alert('Debe seleccionar una imagen');
      return;
    }

    let success = false;
    
    if (editingId) {
      const updateData = {
        titulo: formData.titulo,
        orden: formData.orden,
        activo: formData.activo,
        ...(selectedFile && { imagen: selectedFile }),
      };
      success = await updateItem(editingId, updateData);
    } else if (selectedFile) {
      const createData = {
        titulo: formData.titulo,
        orden: formData.orden,
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
    if (confirm('¿Está seguro de eliminar esta noticia?')) {
      await deleteItem(id);
    }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Noticias</h1>
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imagen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {noticias.map((noticia) => (
              <tr key={noticia.id}>
                <td className="px-6 py-4">
                  <img 
                    src={getNoticiaFileUrl(noticia.imagen)} 
                    alt={noticia.titulo}
                    className="h-16 w-24 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{noticia.titulo}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{noticia.orden}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded ${noticia.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {noticia.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => handleEdit(noticia.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(noticia.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

export default NoticiasAdmin;
