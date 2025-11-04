import { useState } from 'react';
import { useAnuncios } from '../../../hooks/useAnuncios';
import { getAnuncioFileUrl } from '../../../services/homeService';

const AnunciosAdmin = () => {
  const { anuncios, anuncioActivo, loading, error, createItem, updateItem, deleteItem } = useAnuncios();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    fecha_inicio: '',
    fecha_fin: '',
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
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        activo: formData.activo,
        ...(selectedFile && { imagen: selectedFile }),
      };
      success = await updateItem(editingId, updateData);
    } else if (selectedFile) {
      const createData = {
        titulo: formData.titulo,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
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
    const anuncio = anuncios.find(a => a.id === id);
    if (anuncio) {
      setEditingId(id);
      setFormData({
        titulo: anuncio.titulo,
        fecha_inicio: new Date(anuncio.fecha_inicio).toISOString().slice(0, 10),
        fecha_fin: new Date(anuncio.fecha_fin).toISOString().slice(0, 10),
        activo: anuncio.activo,
      });
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este anuncio?')) {
      await deleteItem(id);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      fecha_inicio: '',
      fecha_fin: '',
      activo: true,
    });
    setSelectedFile(null);
    setEditingId(null);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) return <div className="p-4">Cargando...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Anuncios</h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Nuevo Anuncio
        </button>
      </div>

      {anuncioActivo && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-green-900 mb-2">
            Anuncio Activo (Mostrado en Modal)
          </h2>
          <div className="flex items-start space-x-4">
            <img 
              src={getAnuncioFileUrl(anuncioActivo.imagen)} 
              alt={anuncioActivo.titulo}
              className="h-24 w-32 object-cover rounded"
            />
            <div>
              <p className="text-green-800"><strong>{anuncioActivo.titulo}</strong></p>
              <p className="text-green-700 text-sm">
                Desde: {formatDate(anuncioActivo.fecha_inicio)}
              </p>
              <p className="text-green-700 text-sm">
                Hasta: {formatDate(anuncioActivo.fecha_fin)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imagen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Inicio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Fin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {anuncios.map((anuncio) => (
              <tr key={anuncio.id} className={anuncio.id === anuncioActivo?.id ? 'bg-green-50' : ''}>
                <td className="px-6 py-4">
                  <img 
                    src={getAnuncioFileUrl(anuncio.imagen)} 
                    alt={anuncio.titulo}
                    className="h-16 w-24 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{anuncio.titulo}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatDate(anuncio.fecha_inicio)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatDate(anuncio.fecha_fin)}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded ${anuncio.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {anuncio.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => handleEdit(anuncio.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(anuncio.id)}
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
              {editingId ? 'Editar Anuncio' : 'Nuevo Anuncio'}
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
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
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

export default AnunciosAdmin;
