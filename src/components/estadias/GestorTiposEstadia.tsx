import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import {
  listarTipos,
  crearTipo,
  actualizarTipo,
  eliminarTipo,
  reordenarTipos,
  TipoEstadia,
} from '../../services/tipoEstadiaService';
import { useAuth } from '../../context/AuthContext';

export default function GestorTiposEstadia() {
  const { isAuthenticated } = useAuth();
  const [tipos, setTipos] = useState<TipoEstadia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tipoEditando, setTipoEditando] = useState<TipoEstadia | null>(null);
  const [formData, setFormData] = useState({ Nombre: '', Descripcion: '', Activo: true });

  useEffect(() => {
    cargarTipos();
  }, []);

  const cargarTipos = async () => {
    try {
      setLoading(true);
      const data = await listarTipos(true); // Incluir inactivos
      setTipos(data);
    } catch (err) {
      setError('Error al cargar tipos de estadía');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (tipo?: TipoEstadia) => {
    if (tipo) {
      setTipoEditando(tipo);
      setFormData({ Nombre: tipo.Nombre, Descripcion: tipo.Descripcion || '', Activo: tipo.Activo });
    } else {
      setTipoEditando(null);
      setFormData({ Nombre: '', Descripcion: '', Activo: true });
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setTipoEditando(null);
    setFormData({ Nombre: '', Descripcion: '', Activo: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Debes iniciar sesión como administrador');
      return;
    }

    try {
      if (tipoEditando) {
        await actualizarTipo(tipoEditando.ID, formData);
      } else {
        await crearTipo(formData);
      }
      cargarTipos();
      cerrarModal();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al guardar tipo');
    }
  };

  const handleEliminar = async (id: number, forzar = false) => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión como administrador');
      return;
    }

    if (!forzar && !confirm('¿Estás seguro de eliminar este tipo?')) {
      return;
    }

    try {
      await eliminarTipo(id, forzar);
      cargarTipos();
      setError('');
      setSuccess('Tipo eliminado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.documentosAsociados > 0 && !forzar) {
        const confirmar = confirm(
          `Este tipo tiene ${errorData.documentosAsociados} documento(s) asociado(s).\n\n` +
          `Si lo eliminas, esos documentos quedarán sin categoría.\n\n` +
          `¿Deseas continuar con la eliminación?`
        );
        if (confirmar) {
          handleEliminar(id, true); // Reintentar con forzar=true
        }
      } else {
        setError(errorData?.error || 'Error al eliminar tipo');
        setTimeout(() => setError(''), 5000);
      }
    }
  };

  const toggleActivo = async (tipo: TipoEstadia) => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión como administrador');
      return;
    }

    try {
      await actualizarTipo(tipo.ID, { Activo: !tipo.Activo });
      cargarTipos();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al cambiar estado');
    }
  };

  const moverTipo = async (index: number, direccion: 'arriba' | 'abajo') => {
    if (!isAuthenticated) return;
    
    const nuevoOrden = [...tipos];
    const temp = nuevoOrden[index];
    
    if (direccion === 'arriba' && index > 0) {
      nuevoOrden[index] = nuevoOrden[index - 1];
      nuevoOrden[index - 1] = temp;
    } else if (direccion === 'abajo' && index < nuevoOrden.length - 1) {
      nuevoOrden[index] = nuevoOrden[index + 1];
      nuevoOrden[index + 1] = temp;
    } else {
      return;
    }

    const updates = nuevoOrden.map((tipo, idx) => ({ ID: tipo.ID, Orden: idx }));
    
    try {
      await reordenarTipos(updates);
      setTipos(nuevoOrden);
    } catch (err) {
      alert('Error al reordenar tipos');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Tipos de Estadía</h2>
          <p className="text-gray-600 mt-1">Administra las secciones de documentos (Vinculación, Prácticas, etc.)</p>
        </div>
        <button
          onClick={() => abrirModal()}
          disabled={!isAuthenticated}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nuevo Tipo
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tipos.map((tipo, index) => (
              <tr key={tipo.ID} className={!tipo.Activo ? 'bg-gray-50 opacity-60' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moverTipo(index, 'arriba')}
                      disabled={index === 0 || !isAuthenticated}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                      title="Mover arriba"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moverTipo(index, 'abajo')}
                      disabled={index === tipos.length - 1 || !isAuthenticated}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                      title="Mover abajo"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <GripVertical className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{index + 1}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{tipo.Nombre}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 max-w-md truncate">
                    {tipo.Descripcion || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleActivo(tipo)}
                    disabled={!isAuthenticated}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                      tipo.Activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    } disabled:cursor-not-allowed`}
                  >
                    {tipo.Activo ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {tipo.Activo ? 'Visible' : 'Oculto'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => abrirModal(tipo)}
                      disabled={!isAuthenticated}
                      className="text-blue-600 hover:text-blue-900 disabled:opacity-30"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEliminar(tipo.ID)}
                      disabled={!isAuthenticated}
                      className="text-red-600 hover:text-red-900 disabled:opacity-30"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tipos.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay tipos de estadía registrados. Crea uno nuevo para comenzar.
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {tipoEditando ? 'Editar Tipo' : 'Nuevo Tipo'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.Nombre}
                  onChange={(e) => setFormData({ ...formData, Nombre: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Vinculación, Prácticas, etc."
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.Descripcion}
                  onChange={(e) => setFormData({ ...formData, Descripcion: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descripción opcional..."
                />
              </div>
              <div className="mb-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.Activo}
                    onChange={(e) => setFormData({ ...formData, Activo: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Visible en el sitio público</span>
                </label>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {tipoEditando ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
