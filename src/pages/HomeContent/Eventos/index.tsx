import { useState } from 'react';
import { confirmDialog, toastSuccess } from '../../../utils/alert';
import { useEventos } from '../../../hooks/useEventos';
import CountdownPreview from '../../../components/CountdownPreview';
import { eventThemes, type EventTheme } from '../../../constants/eventThemes';

const EventosAdmin = () => {
  const { eventos, eventoActivo, loading, error, createItem, updateItem, deleteItem, refresh } = useEventos(true, true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<EventTheme | null>(null);
  const [updatingActiveId, setUpdatingActiveId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_evento: '',
    tema: 'general',
    color: '#FFD700',
    activo: true,
    imagen_fondo: null as File | null,
    imagen_fondo_url: '',
    imagen_fondo_remove: false,
    texto_boton: '',
    url_boton: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: any = {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      fecha_evento: formData.fecha_evento,
      tema: formData.tema,
      color: formData.color,
      activo: formData.activo,
      texto_boton: formData.texto_boton,
      url_boton: formData.url_boton,
    };

    if (formData.imagen_fondo) {
      data.imagen_fondo = formData.imagen_fondo;
    }
    if (formData.imagen_fondo_remove) {
      data.imagen_fondo_remove = true;
    }

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
      const theme = eventThemes.find(t => t.color === evento.color);
      setSelectedTheme(theme || null);
      setFormData({
        titulo: evento.titulo,
        descripcion: evento.descripcion || '',
        fecha_evento: new Date(evento.fecha_evento).toISOString().slice(0, 16),
        tema: evento.tema || 'general',
        color: evento.color || '#FFD700',
        activo: evento.activo,
        imagen_fondo: null,
        imagen_fondo_url: evento.imagen_fondo_url || '',
        imagen_fondo_remove: false,
        texto_boton: evento.texto_boton || '',
        url_boton: evento.url_boton || '',
      });
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDialog({ title: 'Eliminar evento', text: '¿Está seguro de eliminar este evento?' });
    if (!confirmed) return;
    const ok = await deleteItem(id);
    if (ok) toastSuccess('Evento eliminado correctamente');
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      fecha_evento: '',
      tema: 'general',
      color: '#FFD700',
      activo: true,
      imagen_fondo: null,
      imagen_fondo_url: '',
      imagen_fondo_remove: false,
      texto_boton: '',
      url_boton: '',
    });
    setSelectedTheme(null);
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

  const formatDDMMYYYY = (value: string) => {
    if (!value) return '';
    // support both ISO and datetime-local inputs
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      const dd = String(parsed.getDate()).padStart(2, '0');
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const yyyy = String(parsed.getFullYear());
      return `${dd}/${mm}/${yyyy}`;
    }
    // fallback: try to parse 'YYYY-MM-DDTHH:MM' manually
    const match = value.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[3]}/${match[2]}/${match[1]}`;
    }
    return '';
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
          <div className="flex items-center gap-3">
            {eventoActivo.color && (
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: eventoActivo.color }}
              ></div>
            )}
            <div>
              <p className="text-blue-800"><strong>{eventoActivo.titulo}</strong></p>
              <p className="text-blue-700">{eventoActivo.descripcion}</p>
              <p className="text-blue-600 text-sm">{formatDate(eventoActivo.fecha_evento)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Evento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tema</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {eventos.map((evento) => {
              const theme = eventThemes.find(t => t.color === evento.color);
              return (
              <tr key={evento.id} className={evento.id === eventoActivo?.id ? 'bg-blue-50' : ''}>
                <td className="px-6 py-4 text-sm text-gray-900">{evento.titulo}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{evento.descripcion}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatDate(evento.fecha_evento)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {theme && (
                      <span className="text-lg" title={theme.description}>
                        {theme.icon}
                      </span>
                    )}
                    <span 
                      className="px-3 py-1 text-xs font-semibold rounded-full text-white inline-flex items-center gap-1"
                      style={{ backgroundColor: evento.color || '#FFD700' }}
                    >
                      {evento.tema || 'general'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={evento.activo}
                        disabled={updatingActiveId !== null}
                        onChange={async (e) => {
                          const next = e.target.checked;
                          // confirm when activating because it will deactivate others
                          if (next) {
                            const ok = await confirmDialog({ title: 'Activar evento', text: 'Al activar este evento se desactivará el evento actualmente activo. ¿Deseas continuar?' });
                            if (!ok) {
                              await refresh();
                              return;
                            }
                          }
                          setUpdatingActiveId(evento.id);
                          const success = await updateItem(evento.id, { activo: next });
                          setUpdatingActiveId(null);
                          await refresh();
                          if (success) {
                            toastSuccess('Estado actualizado');
                          }
                        }}
                        className="h-4 w-4"
                      />
                    </label>
                    <span className={`text-sm ${evento.activo ? 'text-green-800' : 'text-red-800'}`}>{evento.activo ? 'Activo' : 'Inactivo'}</span>
                  </div>
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999999] overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'Editar Evento' : 'Nuevo Evento'}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formulario */}
              <div>
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
                <p className="text-xs text-gray-500 mt-1">Formato: <strong>dd/mm/aaaa</strong> (ej. {formatDDMMYYYY(formData.fecha_evento) || 'dd/mm/aaaa'})</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diseños Predefinidos
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {eventThemes.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        setSelectedTheme(theme);
                        setFormData({ 
                          ...formData, 
                          color: theme.color,
                          tema: theme.name
                        });
                      }}
                      className={`p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                        selectedTheme?.id === theme.id 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      title={theme.description}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div 
                          className="w-8 h-8 rounded-full shadow-sm"
                          style={{ backgroundColor: theme.color }}
                        ></div>
                        <span className="text-xs font-medium text-center">{theme.icon}</span>
                        <span className="text-[10px] text-gray-600 text-center leading-tight">{theme.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Selecciona un diseño predefinido o personaliza manualmente el tema y color
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tema del Evento
                </label>
                <input
                  type="text"
                  value={formData.tema}
                  onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="general, deportivo, cultural, académico..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color del Tema
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="h-10 w-20 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="#FFD700"
                  />
                  <div 
                    className="w-10 h-10 rounded border-2 border-gray-300"
                    style={{ backgroundColor: formData.color }}
                  ></div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen de Fondo (Opcional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFormData({ ...formData, imagen_fondo: e.target.files[0], imagen_fondo_remove: false });
                    }
                  }}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
                {formData.imagen_fondo_url && !formData.imagen_fondo && !formData.imagen_fondo_remove && (
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-gray-500">Imagen actual: {formData.imagen_fondo_url.split('/').pop()}</p>
                    <button
                      type="button"
                      className="text-sm text-red-600 hover:underline"
                      onClick={async () => {
                        const ok = await confirmDialog({ title: 'Eliminar imagen', text: '¿Eliminar la imagen de fondo actual? Esta acción se aplicará al actualizar el evento.', confirmText: 'Eliminar', cancelText: 'Cancelar' });
                        if (!ok) return;
                        setFormData({ ...formData, imagen_fondo_url: '', imagen_fondo_remove: true });
                      }}
                    >
                      Eliminar imagen
                    </button>
                  </div>
                )}
                {formData.imagen_fondo_remove && (
                  <p className="text-xs text-amber-600 mt-1">La imagen será eliminada al guardar los cambios.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto del Botón (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.texto_boton}
                    onChange={(e) => setFormData({ ...formData, texto_boton: e.target.value })}
                    placeholder="Ej: Registrarse"
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL del Botón (Opcional)
                  </label>
                  <input
                    type="url"
                    value={formData.url_boton}
                    onChange={(e) => setFormData({ ...formData, url_boton: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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

          {/* Vista Previa */}
          <div className="lg:border-l lg:pl-6">
            <CountdownPreview
              title={formData.titulo}
              targetDate={formData.fecha_evento}
              color={formData.color}
              imagen_fondo={formData.imagen_fondo ? formData.imagen_fondo : (formData.imagen_fondo_remove ? null : (formData.imagen_fondo_url ? `${import.meta.env.VITE_API_URL}${formData.imagen_fondo_url}` : null))}
              texto_boton={formData.texto_boton}
              url_boton={formData.url_boton}
            />
          </div>
        </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventosAdmin;
