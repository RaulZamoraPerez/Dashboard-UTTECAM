import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Image as ImageIcon, ExternalLink } from 'lucide-react';
import becasService from '../../../services/becasService';

interface ModalEditarNoticesProps {
    isOpen: boolean;
    onClose: () => void;
    section: any;
    onSave: () => void;
}

export const ModalEditarNotices = ({ isOpen, onClose, section, onSave }: ModalEditarNoticesProps) => {
    const [title, setTitle] = useState('');
    const [notices, setNotices] = useState<{ title: string; type: 'warning' | 'calendar' | 'info'; imageUrl: string; linkUrl?: string; buttonText?: string }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (section) {
            setTitle(section.title || '');
            setNotices(section.data?.notices || []);
        }
    }, [section]);

    const handleSave = async () => {
        try {
            setLoading(true);
            const sectionData = {
                title,
                type: 'avisos' as const,
                data: {
                    notices
                }
            };

            if (section.id === 0) {
                await becasService.createSection(sectionData);
            } else {
                await becasService.updateSection(section.id, sectionData);
            }

            onSave();
            onClose();
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar la sección');
        } finally {
            setLoading(false);
        }
    };

    const addNotice = () => {
        setNotices([...notices, { title: 'Nuevo Aviso', type: 'info', imageUrl: '' }]);
    };

    const removeNotice = (index: number) => {
        setNotices(notices.filter((_, i) => i !== index));
    };

    const updateNotice = (index: number, field: string, value: any) => {
        const newNotices = [...notices];
        newNotices[index] = { ...newNotices[index], [field]: value };
        setNotices(newNotices);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        {section.id === 0 ? 'Nueva Sección de Avisos' : 'Editar Sección de Avisos'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Título de la Sección */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título de la Sección</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Ej: Avisos Importantes"
                        />
                    </div>

                    {/* Lista de Avisos */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lista de Avisos (Cards)</label>
                            <button
                                onClick={addNotice}
                                className="text-sm bg-[#0a9782] text-white px-3 py-1.5 rounded-lg hover:bg-[#088c75] flex items-center gap-1"
                            >
                                <Plus size={16} /> Agregar Aviso
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {notices.map((notice, idx) => (
                                <div key={idx} className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700 relative">
                                    <button
                                        onClick={() => removeNotice(idx)}
                                        className="absolute top-2 right-2 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                        title="Eliminar aviso"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                                        {/* Columna 1: Datos Básicos */}
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 uppercase">Título del Aviso</label>
                                                <input
                                                    type="text"
                                                    value={notice.title}
                                                    onChange={(e) => updateNotice(idx, 'title', e.target.value)}
                                                    className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    placeholder="Ej: Calendario de Pagos"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 uppercase">Tipo</label>
                                                <select
                                                    value={notice.type}
                                                    onChange={(e) => updateNotice(idx, 'type', e.target.value)}
                                                    className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                >
                                                    <option value="info">Información (Gris)</option>
                                                    <option value="warning">Aviso Importante (Naranja)</option>
                                                    <option value="calendar">Calendario (Azul)</option>
                                                </select>
                                            </div>

                                        </div>

                                        {/* Columna 2: Imagen y Link */}
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 uppercase">URL de Imagen</label>
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <ImageIcon className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                                        <input
                                                            type="text"
                                                            value={notice.imageUrl}
                                                            onChange={(e) => updateNotice(idx, 'imageUrl', e.target.value)}
                                                            className="w-full pl-9 p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                            placeholder="https://..."
                                                        />
                                                    </div>
                                                </div>
                                                {notice.imageUrl && (
                                                    <div className="mt-2 h-20 w-full bg-gray-200 dark:bg-gray-800 rounded overflow-hidden">
                                                        <img src={notice.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 uppercase">Enlace Externo (Opcional)</label>
                                                <div className="relative">
                                                    <ExternalLink className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                                    <input
                                                        type="text"
                                                        value={notice.linkUrl}
                                                        onChange={(e) => updateNotice(idx, 'linkUrl', e.target.value)}
                                                        className="w-full pl-9 p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                        placeholder="https://... (Si se deja vacío, abre la imagen)"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 sticky bottom-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2 bg-[#0a9782] text-white rounded-lg hover:bg-[#088c75] transition flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : (
                            <>
                                <Save size={18} />
                                Guardar Cambios
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalEditarNotices;
