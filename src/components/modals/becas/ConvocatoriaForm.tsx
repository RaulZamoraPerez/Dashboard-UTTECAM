import { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, Upload, ArrowUp, ArrowDown } from 'lucide-react';
import becasService from '../../../services/becasService';

export interface ConvocatoriaData {
    badge: string;
    title: string;
    description: string;
    imageUrl: string;
    imageCaption: string;
    documents: {
        title: string;
        subtitle: string;
        type: 'pdf' | 'link';
        url: string;
        actionText: string;
        variant?: 'default' | 'warning' | 'success' | 'info' | 'outline' | 'danger';
    }[];
}

interface ConvocatoriaFormProps {
    initialData: ConvocatoriaData;
    onChange: (data: ConvocatoriaData) => void;
}

export const ConvocatoriaForm = ({ initialData, onChange }: ConvocatoriaFormProps) => {
    const [uploading, setUploading] = useState(false);

    // Helper to update fields
    const updateField = (field: keyof ConvocatoriaData, value: any) => {
        onChange({
            ...initialData,
            [field]: value
        });
    };

    const addDocument = () => {
        const newDoc = {
            title: 'Nuevo Documento',
            subtitle: 'Descripción corta',
            type: 'pdf' as const,
            url: '#',
            actionText: 'Ver Documento',
            variant: 'default' as const
        };
        const updatedDocs = [...(initialData.documents || []), newDoc];
        updateField('documents', updatedDocs);
    };

    const removeDocument = (index: number) => {
        const updatedDocs = (initialData.documents || []).filter((_, i) => i !== index);
        updateField('documents', updatedDocs);
    };

    const moveDocument = (index: number, direction: 'up' | 'down') => {
        const updatedDocs = [...(initialData.documents || [])];
        if (direction === 'up' && index > 0) {
            [updatedDocs[index], updatedDocs[index - 1]] = [updatedDocs[index - 1], updatedDocs[index]];
        } else if (direction === 'down' && index < updatedDocs.length - 1) {
            [updatedDocs[index], updatedDocs[index + 1]] = [updatedDocs[index + 1], updatedDocs[index]];
        }
        updateField('documents', updatedDocs);
    };

    const updateDocument = (index: number, field: string, value: any) => {
        const updatedDocs = [...(initialData.documents || [])];
        updatedDocs[index] = { ...updatedDocs[index], [field]: value };
        updateField('documents', updatedDocs);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const response = await becasService.uploadBannerFile(file);
            const fullUrl = response.url.startsWith('http') ? response.url : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${response.url}`;
            updateField('imageUrl', fullUrl);
        } catch (error) {
            console.error('Error al subir imagen:', error);
            alert('Error al subir la imagen');
        } finally {
            setUploading(false);
        }
    };

    // Helper to upload PDF for a specific document item
    const handleDocUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            // Reusing banner file upload for generic files for now
            const response = await becasService.uploadBannerFile(file);
            const fullUrl = response.url.startsWith('http') ? response.url : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${response.url}`;

            const updatedDocs = [...(initialData.documents || [])];
            updatedDocs[index] = {
                ...updatedDocs[index],
                url: fullUrl,
                type: 'pdf'
            };
            updateField('documents', updatedDocs);

        } catch (error) {
            console.error('Error al subir documento:', error);
            alert('Error al subir documento');
        } finally {
            setUploading(false);
            // Reset input value to allow re-uploading same file if needed
            e.target.value = '';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Badge (Etiqueta)</label>
                    <input
                        type="text"
                        value={initialData.badge || ''}
                        onChange={(e) => updateField('badge', e.target.value)}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Ej: PERIODO ANTERIOR"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                    <input
                        type="text"
                        value={initialData.title || ''}
                        onChange={(e) => updateField('title', e.target.value)}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Ej: Convocatoria Sep-Dic 2025"
                    />
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                <textarea
                    value={initialData.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={2}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Descripción breve..."
                />
            </div>

            {/* Documents List */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Documentos / Enlaces</label>
                    <button
                        onClick={addDocument}
                        className="text-sm text-[#0a9782] hover:underline flex items-center gap-1"
                    >
                        <Plus size={16} /> Agregar Documento
                    </button>
                </div>

                <div className="space-y-4">
                    {(initialData.documents || []).map((doc, idx) => (
                        <div key={idx} className="flex gap-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700 relative">
                            {/* Reordering Arrows */}
                            <div className="flex flex-col gap-1 pt-1 justify-center">
                                <button
                                    onClick={() => moveDocument(idx, 'up')}
                                    disabled={idx === 0}
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                    title="Mover arriba"
                                >
                                    <ArrowUp size={16} />
                                </button>
                                <button
                                    onClick={() => moveDocument(idx, 'down')}
                                    disabled={idx === (initialData.documents?.length || 0) - 1}
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                    title="Mover abajo"
                                >
                                    <ArrowDown size={16} />
                                </button>
                            </div>

                            <div className="flex-1">
                                <button
                                    onClick={() => removeDocument(idx)}
                                    className="absolute top-2 right-2 text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 z-10"
                                >
                                    <Trash2 size={18} />
                                </button>

                                <div className="grid grid-cols-1 gap-3 pr-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            value={doc.title}
                                            onChange={(e) => updateDocument(idx, 'title', e.target.value)}
                                            className="p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="Título del documento"
                                        />
                                        <input
                                            type="text"
                                            value={doc.subtitle}
                                            onChange={(e) => updateDocument(idx, 'subtitle', e.target.value)}
                                            className="p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="Subtítulo / Info"
                                        />
                                    </div>

                                    {/* Variant Selector */}
                                    <div>
                                        <select
                                            value={doc.variant || 'default'}
                                            onChange={(e) => updateDocument(idx, 'variant', e.target.value)}
                                            className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="default">Estándar (Gris)</option>
                                            <option value="danger">Peligro (Rojo)</option>
                                            <option value="warning">Advertencia (Ámbar)</option>
                                            <option value="success">Éxito (Verde)</option>
                                            <option value="info">Info (Azul)</option>
                                            <option value="outline">Destacado (Borde)</option>
                                        </select>
                                    </div>

                                    {doc.type === 'link' ? (
                                        <input
                                            type="text"
                                            value={doc.url}
                                            onChange={(e) => updateDocument(idx, 'url', e.target.value)}
                                            className="flex-1 p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="Pegar enlace aquí (https://...)"
                                        />
                                    ) : (
                                        <div className="flex-1 flex gap-2">
                                            <div className="flex-1 p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 bg-gray-50 text-gray-500 truncate flex items-center">
                                                {doc.url ? (doc.url.startsWith('/uploads/') ? doc.url.split('/').pop() : 'Archivo externo') : 'Sin archivo'}
                                            </div>
                                            <label className={`flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition whitespace-nowrap ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                                <Upload size={16} className="text-gray-600 dark:text-gray-300" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
                                                    Subir PDF
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="application/pdf"
                                                    className="hidden"
                                                    onChange={(e) => handleDocUpload(idx, e)}
                                                />
                                            </label>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <select
                                            value={doc.type}
                                            onChange={(e) => updateDocument(idx, 'type', e.target.value)}
                                            className="p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="pdf">Documento PDF</option>
                                            <option value="link">Enlace Externo</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={doc.actionText}
                                            onChange={(e) => updateDocument(idx, 'actionText', e.target.value)}
                                            className="flex-1 p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="Texto del botón (ej: Ver)"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* URL Imagen (Opcional - para poster) */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Imagen / Poster Lateral (Opcional)</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <ImageIcon className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={initialData.imageUrl || ''}
                            onChange={(e) => updateField('imageUrl', e.target.value)}
                            className="w-full pl-10 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="https://..."
                        />
                    </div>
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition">
                        <Upload size={18} className="text-gray-600 dark:text-gray-300" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {uploading ? 'Subiendo...' : 'Subir'}
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={uploading}
                        />
                    </label>
                </div>
                {initialData.imageUrl && (
                    <div className="mt-2 h-32 w-full bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                        <img src={initialData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                )}
            </div>
        </div>
    );
};
