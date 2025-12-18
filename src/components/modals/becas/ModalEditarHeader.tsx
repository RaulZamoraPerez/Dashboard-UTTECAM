import { X, LayoutTemplate, Palette } from 'lucide-react';
import { useState } from 'react';
import becasService from '../../../services/becasService';
import { BaseSection } from '../../becas/BecasDashboard';

interface ModalEditarHeaderProps {
    isOpen: boolean;
    onClose: () => void;
    section: BaseSection;
    onSave: () => void;
}

export const ModalEditarHeader = ({ isOpen, onClose, section, onSave }: ModalEditarHeaderProps) => {
    const [title, setTitle] = useState(section.title);
    const [description, setDescription] = useState(section.description || '');
    const [variant, setVariant] = useState<'default' | 'green'>(section.variant || 'default');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSave = async () => {
        try {
            setLoading(true);
            setError(null);

            const dataPayload = {
                description,
                variant // Guardamos la variante en el objeto data
            };

            if (section.id === 0) {
                await becasService.createSection({
                    type: section.type,
                    title,
                    data: dataPayload
                });
            } else {
                await becasService.updateSection(section.id, {
                    title,
                    data: dataPayload
                });
            }

            onSave();
        } catch (err) {
            console.error('Error al guardar:', err);
            setError('Error al guardar los cambios');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <LayoutTemplate size={20} className="text-[#0a9782]" />
                        Editar Encabezado
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                        disabled={loading}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-100 dark:border-red-900/30">
                            {error}
                        </div>
                    )}

                    {/* Selector de Estilo */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <Palette size={16} />
                            Estilo Visual
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setVariant('default')}
                                className={`p-4 rounded-xl border-2 text-left transition relative overflow-hidden ${variant === 'default'
                                    ? 'border-[#0a9782] bg-[#0a9782]/5 ring-1 ring-[#0a9782]'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                <div className="font-bold text-gray-900 dark:text-white mb-1">Principal</div>
                                <div className="text-xs text-gray-500">Negro con acento verde</div>
                                {variant === 'default' && <div className="absolute top-2 right-2 w-2 h-2 bg-[#0a9782] rounded-full"></div>}
                            </button>

                            <button
                                onClick={() => setVariant('green')}
                                className={`p-4 rounded-xl border-2 text-left transition relative overflow-hidden ${variant === 'green'
                                    ? 'border-[#008f39] bg-[#008f39]/5 ring-1 ring-[#008f39]'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                <div className="font-bold text-[#008f39]">PROGRAMA</div>
                                <div className="text-xs text-gray-500">Todo verde y mayúsculas</div>
                                {variant === 'green' && <div className="absolute top-2 right-2 w-2 h-2 bg-[#008f39] rounded-full"></div>}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Título</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-[#0a9782] focus:ring-2 focus:ring-[#0a9782]/20 focus:outline-none dark:bg-gray-700 dark:text-white transition"
                            placeholder="Ej: Becas y *Apoyos*"
                            disabled={loading}
                        />
                    </div>

                    {variant === 'default' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-[#0a9782] focus:ring-2 focus:ring-[#0a9782]/20 focus:outline-none dark:bg-gray-700 dark:text-white transition resize-none"
                                placeholder="Descripción del encabezado"
                                disabled={loading}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 bg-[#0a9782] text-white rounded-lg font-semibold hover:bg-[#088c75] transition flex items-center gap-2 shadow-lg shadow-[#0a9782]/20"
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalEditarHeader;
