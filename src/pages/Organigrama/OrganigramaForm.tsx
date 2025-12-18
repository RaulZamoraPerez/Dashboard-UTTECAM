// pages/Organigrama/OrganigramaForm.tsx
import { useState, useEffect } from 'react';
import { useOrganigrama } from '../../hooks/useOrganigrama';
import { Organigrama, OrganigramaFormData } from '../../types/organigrama';
import { X, Upload, User, AlertCircle } from 'lucide-react';
import { getImageUrl } from '../../services/directorioService';

interface Props {
  organigrama?: Organigrama | null;
  allNodes: Organigrama[];
  onClose: () => void;
}

interface FieldErrors {
  name?: string;
  title?: string;
  key?: string;
  text?: string;
  image?: string;
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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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

  // Validación de campo individual
  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value?.trim()) return 'El nombre es obligatorio';
        if (value.length > 100) return 'Máximo 100 caracteres';
        break;
      case 'title':
        if (!value?.trim()) return 'El cargo es obligatorio';
        if (value.length > 100) return 'Máximo 100 caracteres';
        break;
      case 'key':
        if (value && value.length > 50) return 'Máximo 50 caracteres';
        if (value && !/^[a-zA-Z0-9\-_]*$/.test(value)) return 'Solo letras, números, guiones y guiones bajos';
        break;
      case 'text':
        if (value && value.length > 1000) return 'Máximo 1000 caracteres';
        break;
    }
    return undefined;
  };

  // Manejar cambio con validación en tiempo real
  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validar inmediatamente mientras escribe
    const error = validateField(field, value);
    setFieldErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setFieldErrors(prev => ({ ...prev, image: 'La imagen no debe exceder 10MB' }));
        return;
      }
      setFieldErrors(prev => ({ ...prev, image: undefined }));
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

    // Validar todos los campos
    const errors: FieldErrors = {};
    errors.name = validateField('name', formData.name || '');
    errors.title = validateField('title', formData.title || '');
    errors.key = validateField('key', formData.key || '');
    errors.text = validateField('text', formData.text || '');

    // Marcar todos como tocados
    setTouched({ name: true, title: true, key: true, text: true });
    setFieldErrors(errors);

    // Verificar si hay errores
    const hasErrors = Object.values(errors).some(e => e !== undefined);
    if (hasErrors) {
      setError('Por favor corrige los errores antes de guardar');
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

  // Componente de input con validación
  const InputField = ({ 
    id, 
    label, 
    required = false, 
    placeholder = '',
    type = 'text'
  }: { 
    id: string; 
    label: string; 
    required?: boolean; 
    placeholder?: string;
    type?: string;
  }) => {
    const hasError = touched[id] && fieldErrors[id as keyof FieldErrors];
    const value = (formData as any)[id] || '';
    
    return (
      <div className={hasError ? 'animate-pulse' : ''}>
        <label htmlFor={id} className={`block text-sm font-medium mb-2 ${hasError ? 'text-red-600' : 'text-gray-700'}`}>
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
        <div className="relative">
          <input
            type={type}
            id={id}
            value={value}
            onChange={(e) => handleChange(id, e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200
              ${hasError 
                ? 'border-red-500 focus:ring-red-500 bg-red-50 shadow-[0_0_0_3px_rgba(239,68,68,0.2)]' 
                : 'border-gray-300 focus:ring-blue-500 hover:border-gray-400'}`}
            placeholder={placeholder}
          />
          {hasError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          )}
        </div>
        {hasError && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-sm font-medium text-red-700">
              {fieldErrors[id as keyof FieldErrors]}
            </p>
          </div>
        )}
      </div>
    );
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
          <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
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
                {fieldErrors.image && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors.image}
                  </p>
                )}
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
            <InputField 
              id="key" 
              label="Key (Identificador único)" 
              placeholder="rector, director-finanzas"
            />

            {/* Tipo */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="person">Person</option>
                <option value="department">Department</option>
              </select>
            </div>
          </div>

          {/* Nombre */}
          <InputField 
            id="name" 
            label="Nombre Completo" 
            required 
            placeholder="Ej: Ing. Juan Pérez García"
          />

          {/* Título/Cargo */}
          <InputField 
            id="title" 
            label="Cargo" 
            required 
            placeholder="Ej: Director de Finanzas"
          />

          {/* Descripción */}
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción / Semblanza
            </label>
            <textarea
              id="text"
              value={formData.text}
              onChange={(e) => handleChange('text', e.target.value)}
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors
                ${touched.text && fieldErrors.text 
                  ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                  : 'border-gray-300 focus:ring-blue-500'}`}
              placeholder="Descripción de la persona o su trayectoria..."
            />
            {touched.text && fieldErrors.text && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.text}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500 text-right">
              {formData.text?.length || 0}/1000 caracteres
            </p>
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
                onChange={(e) => setFormData({ ...formData, order_position: parseInt(e.target.value) || 0 })}
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
