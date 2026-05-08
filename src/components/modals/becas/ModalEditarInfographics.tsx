import { useState } from 'react';
import { X, Check, Trash2, Image as ImageIcon } from 'lucide-react';
import { InfographicsForm, InfographicsData } from './InfographicsForm';
import becasService from '../../../services/becasService';
import { toastError, toastSuccess, confirmDialog } from '../../../utils/alert';

interface ModalEditarInfographicsProps {
    isOpen: boolean;
    onClose: () => void;
    section: {
        id: number;
        title: string;
        data: any;
    };
    onSave: () => void;
}

export const ModalEditarInfographics = ({ isOpen, onClose, section, onSave }: ModalEditarInfographicsProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<InfographicsData>({
        mainTitle: section.data?.mainTitle || '',
        title: section.title,
        items: section.data?.items || []
    });

    const handleSave = async () => {
        try {
            setLoading(true);
            const updateData = {
                title: formData.title,
                data: {
                    ...formData
                }
            };

            if (section.id === 0) {
                await becasService.createSection({
                    type: 'infographics',
                    title: formData.title,
                    data: formData.items
                });
            } else {
                await becasService.updateSection(section.id, updateData);
            }
            toastSuccess('Galería de infografías guardada');
            onSave();
            onClose();
        } catch (error) {
            console.error('Error updating infographics section:', error);
            toastError('Error al actualizar la sección');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = await confirmDialog({
            title: '¿Eliminar galería?',
            text: 'Esta acción eliminará todas las imágenes e información de esta sección.',
            confirmText: 'Sí, eliminar'
        });

        if (confirmed) {
            try {
                await becasService.deleteSection(section.id);
                toastSuccess('Galería eliminada');
                onSave();
                onClose();
            } catch (error) {
                toastError('Error al eliminar');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-6 flex justify-between items-center shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                            <ImageIcon size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">EDITAR GALERÍA</h2>
                            <p className="text-sm opacity-90 font-bold uppercase tracking-widest">Información y Avisos</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2 transition-all">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50 dark:bg-gray-900/50">
                    <InfographicsForm 
                        initialData={formData} 
                        onChange={setFormData} 
                    />
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center">
                    <button
                        onClick={handleDelete}
                        className="px-6 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all flex items-center gap-2 font-bold uppercase text-xs tracking-widest"
                    >
                        <Trash2 size={18} />
                        Eliminar Sección
                    </button>
                    
                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-all font-bold uppercase text-xs tracking-widest"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-10 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all flex items-center gap-2 font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                        >
                            {loading ? 'GUARDANDO...' : <><Check size={18} /> GUARDAR CAMBIOS</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
