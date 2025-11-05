import { useState } from 'react';
import { useEventos } from '../../../hooks/useEventos';

const EventosAdmin = () => {
  const { eventos, eventoActivo, loading, error, createItem, updateItem, deleteItem } = useEventos();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_evento: '',
    activo: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      fecha_evento: formData.fecha_evento,
      activo: formData.activo,
    };

    const success = editingId 
      ? await updateItem(editingId, data)
      : await createItem(data);

    if (success) {
      resetForm();
      setIsModalOpen(false);
    }
  };

  const handleEdit = (id: number) => {
    const evento = eventos.find(e => e.id === id);
    if (evento) {
      setEditingId(id);
      setFormData({
        titulo: evento.titulo,
        descripcion: evento.descripcion || '',
        fecha_evento: new Date(evento.fecha_evento).toISOString().slice(0, 16),
        activo: evento.activo,
      });
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este evento?')) {
      await deleteItem(id);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      fecha_evento: '',
      activo: true,
    });
    setEditingId(null);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <div className="p-4">Cargando...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Eventos</h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Nuevo Evento
        </button>
      </div>

      {eventoActivo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            Evento Activo (Mostrado en Countdown)
          </h2>
          <p className="text-blue-800"><strong>{eventoActivo.titulo}</strong></p>
          <p className="text-blue-700">{eventoActivo.descripcion}</p>
          <p className="text-blue-600 text-sm">{formatDate(eventoActivo.fecha_evento)}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Evento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {eventos.map((evento) => (
              <tr key={evento.id} className={evento.id === eventoActivo?.id ? 'bg-blue-50' : ''}>
                <td className="px-6 py-4 text-sm text-gray-900">{evento.titulo}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{evento.descripcion}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatDate(evento.fecha_evento)}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded ${evento.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {evento.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => handleEdit(evento.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(evento.id)}
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
              {editingId ? 'Editar Evento' : 'Nuevo Evento'}
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
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha y Hora del Evento
                </label>
                <input
                  type="datetime-local"
                  value={formData.fecha_evento}
                  onChange={(e) => setFormData({ ...formData, fecha_evento: e.target.value })}
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

export default EventosAdmin;
