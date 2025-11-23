import { useState, useEffect } from 'react';
import Button from '../ui/button/Button';
import ComponentCard from '../common/ComponentCard';

interface SimpleTextSectionProps {
  title: string;
  description: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (description: string) => Promise<void>;
}

export default function SimpleTextSection({
  title,
  description,
  isEditing,
  onEdit,
  onCancel,
  onSave
}: SimpleTextSectionProps) {
  const [localDescription, setLocalDescription] = useState(description);

  useEffect(() => {
    if (isEditing) {
      setLocalDescription(description);
    }
  }, [isEditing, description]);

  const handleSave = async () => {
    await onSave(localDescription);
  };

  return (
    <ComponentCard title={title}>
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={localDescription}
              onChange={(e) => setLocalDescription(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm">Guardar</Button>
            <Button onClick={onCancel} variant="outline" size="sm">Cancelar</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {description || 'Contenido no disponible'}
          </p>
          <Button onClick={onEdit} variant="outline" size="sm">
            Editar
          </Button>
        </div>
      )}
    </ComponentCard>
  );
}
