// pages/Directorio/DirectorioList.tsx
import { useState } from 'react';
import { useDirectorio } from '../../hooks/useDirectorio';
import { Directorio } from '../../types/directorio';
import { getImageUrl } from '../../services/directorioService';
import { Pencil, Trash2, Plus, User } from 'lucide-react';

function DirectorioForm(props: { directorio?: Directorio | null; onClose: () => void }) {
  const { directorio, onClose } = props;
  const [nombre, setNombre] = useState(directorio?.nombre ?? '');
  const [titulo, setTitulo] = useState(directorio?.titulo ?? '');
  const [telefono, setTelefono] = useState(directorio?.telefono ?? '');
  const [extension, setExtension] = useState(directorio?.extension ?? '');
  const [correo, setCorreo] = useState(directorio?.correo ?? '');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // NOTE: This is a minimal stub for the form; wire up saving logic to your services/hooks as needed.
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">{directorio ? 'Editar contacto' : 'Nuevo contactoa'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="mt-1 block w-full border rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Título</label>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className="mt-1 block w-full border rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input value={telefono} onChange={(e) => setTelefono(e.target.value)} className="mt-1 block w-full border rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Extensión</label>
            <input value={extension} onChange={(e) => setExtension(e.target.value)} className="mt-1 block w-full border rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo</label>
            <input value={correo} onChange={(e) => setCorreo(e.target.value)} className="mt-1 block w-full border rounded-md p-2" />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DirectorioList() {
  const { directorios, loading, error, deleteItem } = useDirectorio();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDirectorio, setSelectedDirectorio] = useState<Directorio | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleEdit = (directorio: Directorio) => {
    setSelectedDirectorio(directorio);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    const success = await deleteItem(id);
    if (success) {
      setDeleteConfirm(null);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedDirectorio(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando directorios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Directorios</h1>
          <p className="mt-2 text-sm text-gray-700">
            Administra los contactos del directorio institucional
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Contacto
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Foto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {directorios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <User className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">No hay contactos registrados</p>
                    <button
                      onClick={() => setIsFormOpen(true)}
                      className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Crear primer contacto
                    </button>
                  </td>
                </tr>
              ) : (
                directorios.map((directorio) => (
                  <tr key={directorio.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={getImageUrl(directorio.imagen)}
                        alt={directorio.nombre}
                        className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{directorio.nombre}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{directorio.titulo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {directorio.telefono}
                        {directorio.extension && (
                          <span className="text-gray-500"> Ext. {directorio.extension}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{directorio.correo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(directorio)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Editar"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      {deleteConfirm === directorio.id ? (
                        <div className="inline-flex items-center space-x-2">
                          <button
                            onClick={() => handleDelete(directorio.id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-gray-600 hover:text-gray-900 font-medium"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(directorio.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <DirectorioForm
          directorio={selectedDirectorio}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
