// pages/Organigrama/OrganigramaList.tsx
import { useState } from 'react';
import * as React from 'react';
import { useOrganigrama } from '../../hooks/useOrganigrama';
import { Organigrama } from '../../types/organigrama';
import { getImageUrl } from '../../services/directorioService';
import { Pencil, Trash2, Plus, User, ChevronRight } from 'lucide-react';
import OrganigramaForm from './OrganigramaForm';

export default function OrganigramaList() {
  const { organigrama, loading, error, deleteItem } = useOrganigrama();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrganigrama, setSelectedOrganigrama] = useState<Organigrama | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const handleEdit = (item: Organigrama) => {
    setSelectedOrganigrama(item);
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
    setSelectedOrganigrama(null);
  };

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Agrupar por parent_id para mostrar jerarquía
  const rootItems = organigrama.filter(item => !item.parent_id);
  const getChildren = (parentId: number) => 
    organigrama.filter(item => item.parent_id === parentId);

  const renderRow = (item: Organigrama, level = 0): React.ReactNode => {
    const children = getChildren(item.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedRows.has(item.id);

    return (
      <>
        <tr key={item.id} className="hover:bg-gray-50 border-b">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
              {hasChildren && (
                <button
                  onClick={() => toggleRow(item.id)}
                  className="mr-2 text-gray-400 hover:text-gray-600"
                >
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </button>
              )}
              <img
                src={getImageUrl(item.image)}
                alt={item.name}
                className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
              />
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="text-sm font-medium text-gray-900">{item.name}</div>
          </td>
          <td className="px-6 py-4">
            <div className="text-sm text-gray-900">{item.title}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {item.type}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-center">
            <span className="text-sm text-gray-900">{item.order_position || '-'}</span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button
              onClick={() => handleEdit(item)}
              className="text-blue-600 hover:text-blue-900 mr-4"
              title="Editar"
            >
              <Pencil className="h-5 w-5" />
            </button>
            {deleteConfirm === item.id ? (
              <div className="inline-flex items-center space-x-2">
                <button
                  onClick={() => handleDelete(item.id)}
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
                onClick={() => setDeleteConfirm(item.id)}
                className="text-red-600 hover:text-red-900"
                title="Eliminar"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </td>
        </tr>
        {isExpanded && children.map(child => renderRow(child, level + 1))}
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando organigrama...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Gestión del Organigrama</h1>
          <p className="mt-2 text-sm text-gray-700">
            Administra la estructura organizacional de la institución
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Nodo
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
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rootItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <User className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">No hay nodos registrados</p>
                    <button
                      onClick={() => setIsFormOpen(true)}
                      className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Crear primer nodo
                    </button>
                  </td>
                </tr>
              ) : (
                rootItems.map(item => renderRow(item))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <OrganigramaForm
          organigrama={selectedOrganigrama}
          allNodes={organigrama}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
