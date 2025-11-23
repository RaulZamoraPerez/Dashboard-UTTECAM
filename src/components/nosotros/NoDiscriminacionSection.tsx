import { useState, useEffect } from 'react';
import Button from '../ui/button/Button';
import ComponentCard from '../common/ComponentCard';
import { Trash2, Plus } from 'lucide-react';

interface NoDiscriminacionSectionProps {
  title: string;
  data: string[][];
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: string[][]) => Promise<void>;
}

export default function NoDiscriminacionSection({
  title,
  data,
  isEditing,
  onEdit,
  onCancel,
  onSave
}: NoDiscriminacionSectionProps) {
  // Ensure we have at least 3 columns or whatever data provides
  const [columns, setColumns] = useState<string[][]>(data || [[], [], []]);

  useEffect(() => {
    if (isEditing) {
      // Deep copy
      const copy = (data || [[], [], []]).map(col => [...col]);
      // Ensure at least 3 columns for layout consistency if empty
      while (copy.length < 3) copy.push([]);
      setColumns(copy);
    }
  }, [isEditing, data]);

  const handleAddItem = (colIndex: number) => {
    const newCols = [...columns];
    newCols[colIndex] = [...newCols[colIndex], ''];
    setColumns(newCols);
  };

  const handleRemoveItem = (colIndex: number, itemIndex: number) => {
    const newCols = [...columns];
    newCols[colIndex].splice(itemIndex, 1);
    setColumns(newCols);
  };

  const handleItemChange = (colIndex: number, itemIndex: number, value: string) => {
    const newCols = [...columns];
    newCols[colIndex][itemIndex] = value;
    setColumns(newCols);
  };

  const handleSave = async () => {
    // Filter empty strings
    const cleanCols = columns.map(col => col.filter(item => item.trim() !== ''));
    await onSave(cleanCols);
  };

  return (
    <ComponentCard title={title}>
      {isEditing ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map((col, colIndex) => (
              <div key={colIndex} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-3 text-center">Columna {colIndex + 1}</h4>
                <div className="space-y-2">
                  {col.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex gap-1">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleItemChange(colIndex, itemIndex, e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleRemoveItem(colIndex, itemIndex)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <Button 
                    onClick={() => handleAddItem(colIndex)} 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-dashed text-xs mt-2"
                  >
                    <Plus size={14} className="mr-1" /> Agregar
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <Button onClick={handleSave} size="sm">Guardar Cambios</Button>
            <Button onClick={onCancel} variant="outline" size="sm">Cancelar</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data && data.map((col, idx) => (
              <ul key={idx} className="list-disc pl-5 space-y-2 text-gray-700">
                {col.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ))}
          </div>

          <div className="pt-4">
            <Button onClick={onEdit} variant="outline" size="sm">
              Editar Contenido
            </Button>
          </div>
        </div>
      )}
    </ComponentCard>
  );
}
