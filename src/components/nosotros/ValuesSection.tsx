import React, { useState, useRef, useEffect } from 'react';
import Button from '../ui/button/Button';
import ComponentCard from '../common/ComponentCard';
import { getImageUrl } from '../../services/nosotrosService';
import { Trash2, Plus } from 'lucide-react';

interface ValuesSectionProps {
  title: string;
  data: { imageSrc: string; title?: string; description: string[] };
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: { imageSrc: string; title?: string; description: string[] }, file: File | null) => Promise<void>;
}

export default function ValuesSection({
  title,
  data,
  isEditing,
  onEdit,
  onCancel,
  onSave
}: ValuesSectionProps) {
  const [values, setValues] = useState<string[]>(data.description || []);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setValues([...(data.description || [])]);
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [isEditing, data]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddValue = () => {
    setValues([...values, '']);
  };

  const handleRemoveValue = (index: number) => {
    const newValues = [...values];
    newValues.splice(index, 1);
    setValues(newValues);
  };

  const handleValueChange = (index: number, val: string) => {
    const newValues = [...values];
    newValues[index] = val;
    setValues(newValues);
  };

  const handleSave = async () => {
    const validValues = values.filter(v => v.trim() !== '');
    await onSave({ ...data, description: validValues }, selectedFile);
  };

  return (
    <ComponentCard title={title}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Content/Form */}
        <div>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lista de Valores
                </label>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {values.map((val, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleValueChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Valor ${index + 1}`}
                      />
                      <button
                        onClick={() => handleRemoveValue(index)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                <Button onClick={handleAddValue} variant="outline" size="sm" className="mt-2 border-dashed w-full">
                  <Plus size={16} className="mr-2" /> Agregar Valor
                </Button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen
                </label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <div className="space-y-2">
                      <img 
                        src={previewUrl} 
                        alt="Vista previa" 
                        className="w-32 h-32 object-cover rounded-md mx-auto border border-gray-300"
                      />
                      <p className="text-sm text-gray-600">Clic para cambiar</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="text-sm text-gray-600">Clic para subir imagen</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} size="sm">Guardar</Button>
                <Button onClick={onCancel} variant="outline" size="sm">Cancelar</Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <ul className="list-disc pl-5 space-y-1 text-gray-700 flex-grow">
                {data.description && data.description.map((val, idx) => (
                  <li key={idx}>{val}</li>
                ))}
              </ul>
              <div className="mt-4">
                <Button onClick={onEdit} variant="outline" size="sm">
                  Editar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Image Display */}
        <div className="flex justify-center items-start">
          <div className="relative w-full max-w-md">
            {imageError ? (
              <div className="flex items-center justify-center bg-red-50 rounded-lg border-2 border-red-200 p-8 h-64">
                <p className="text-sm text-red-600">No se pudo cargar la imagen</p>
              </div>
            ) : (
              <img
                src={getImageUrl(data.imageSrc)}
                alt={title}
                className="w-full h-auto rounded-lg shadow-md"
                onError={() => setImageError(true)}
              />
            )}
          </div>
        </div>
      </div>
    </ComponentCard>
  );
}
