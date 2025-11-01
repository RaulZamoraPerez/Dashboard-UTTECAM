// pages/Organigrama/OrganigramaForm.tsx
import { useState, useEffect } from 'react';
import { useOrganigrama } from '../../hooks/useOrganigrama';
import { Organigrama, OrganigramaFormData } from '../../types/organigrama';
import { getImageUrl } from '../../services/organigramaService';
import { X, Upload, User } from 'lucide-react';

interface Props {
  organigrama?: Organigrama | null;
  allNodes: Organigrama[];
  onClose: () => void;
}

export default function OrganigramaForm({ organigrama, allNodes, onClose }: Props) {
  const { createItem, updateItem } = useOrganigrama();
  const [formData, setFormData] = useState<OrganigramaFormData>({
    key: '',
    parent_id: undefined,
    expanded: true,
    type: 'person',
    name: '',
    title: '',
    text: '',
    order_position: 0,
    image: null,
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');

  // Filtrar nodos potenciales como padres (excluir el actual)
  const availableParents = allNodes.filter(
    node => !organigrama || node.id !== organigrama.id
  );

  useEffect(() => {
    if (organigrama) {
      setFormData({
        key: organigrama.key || '',
        parent_id: organigrama.parent_id || undefined,
        expanded: organigrama.expanded ?? true,
        type: organigrama.type,
        name: organigrama.name,
        title: organigrama.title,
        text: organigrama.text || '',
        order_position: organigrama.order_position || 0,
        image: null,
      });
      if (organigrama.image) {
        setImagePreview(getImageUrl(organigrama.image));
      }
    }
  }, [organigrama]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('La imagen no debe exceder 10MB');
        return;
      }
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.title) {
      setError('Nombre y cargo son obligatorios');
      return;
    }

    setSaving(true);
    try {
      let success;
      if (organigrama) {
        success = await updateItem(organigrama.id, formData);
      } else {
        success = await createItem(formData);
      }

      if (success) {
        onClose();
      } else {
        setError('Error al guardar el nodo');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {organigrama ? 'Editar Nodo' : 'Nuevo Nodo'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto de Perfil
            </label>
            <div className="flex items-center space-x-6">
              <div className="shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-24 w-24 object-cover rounded-full border-2 border-gray-300"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <label className="block">
                <span className="sr-only">Elegir foto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="mt-2 text-xs text-gray-500">
                  PNG, JPG, WebP hasta 10MB
                </p>
              </label>
            </div>
          </div>

          {/* Nodo Padre */}
          <div>
            <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 mb-2">
              Nodo Padre (Opcional)
            </label>
            <select
              id="parent_id"
              value={formData.parent_id || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                parent_id: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sin padre (Raíz)</option>
              {availableParents.map(node => (
                <option key={node.id} value={node.id}>
                  {node.name} - {node.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key */}
            <div>
              <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-2">
                Key (Identificador único)
              </label>
              <input
                type="text"
                id="key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="rector, director-finanzas"
              />
            </div>

            {/* Tipo */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="person">Person</option>
                <option value="department">Department</option>
              </select>
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Ing. Juan Pérez García"
              required
            />
          </div>

          {/* Título/Cargo */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Cargo *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Director de Finanzas"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción / Semblanza
            </label>
            <textarea
              id="text"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descripción de la persona o su trayectoria..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Orden */}
            <div>
              <label htmlFor="order_position" className="block text-sm font-medium text-gray-700 mb-2">
                Orden de Posición
              </label>
              <input
                type="number"
                id="order_position"
                value={formData.order_position}
                onChange={(e) => setFormData({ ...formData, order_position: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>

            {/* Expandido */}
            <div className="flex items-center h-full">
              <label htmlFor="expanded" className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="expanded"
                  checked={formData.expanded}
                  onChange={(e) => setFormData({ ...formData, expanded: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Nodo expandido por defecto</span>
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  {organigrama ? 'Actualizar' : 'Crear'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
