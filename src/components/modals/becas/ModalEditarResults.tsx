import { useState } from 'react';
import { X, Check, Trash2, Layout } from 'lucide-react';
import { ResultsForm, ResultsData } from './ResultsForm';
import becasService from '../../../services/becasService';
import { toastError, toastSuccess, confirmDialog } from '../../../utils/alert';

interface ModalEditarResultsProps {
    isOpen: boolean;
    onClose: () => void;
    section: {
        id: number;
        title: string;
        data: any;
    };
    onSave: () => void;
}

export const ModalEditarResults = ({ isOpen, onClose, section, onSave }: ModalEditarResultsProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<ResultsData>({
        badge: section.data?.badge || 'RESULTADOS',
        mainTitle: section.data?.mainTitle || '',
        title: section.title,
        description: section.data?.description || '',
        beneficiadosText: section.data?.beneficiadosText || '',
        beneficiadosCard: section.data?.beneficiadosCard || { title: 'Beneficiados', content: '', note: '' },
        documents: section.data?.documents || [],
        indicacionesBeneficiados: section.data?.indicacionesBeneficiados || [],
        indicacionesNoBeneficiados: section.data?.indicacionesNoBeneficiados || [],
        infobox: section.data?.infobox || '',
        importantNote: section.data?.importantNote || ''
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
                    type: 'results',
                    title: formData.title,
                    data: formData
                });
            } else {
                await becasService.updateSection(section.id, updateData);
            }
            toastSuccess('Sección de resultados guardada');
            onSave();
            onClose();
        } catch (error) {
            console.error('Error updating results section:', error);
            toastError('Error al actualizar la sección');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = await confirmDialog({
            title: '¿Eliminar sección?',
            text: 'Esta acción eliminará todos los resultados y documentos vinculados.',
            confirmText: 'Sí, eliminar'
        });

        if (confirmed) {
            try {
                await becasService.deleteSection(section.id);
                toastSuccess('Sección eliminada');
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-5 flex justify-between items-center shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Layout size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Editar Resultados</h2>
                            <p className="text-sm opacity-80 font-medium">Gestiona la información de beneficiados</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2 transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50 dark:bg-gray-800/50">
                    <ResultsForm 
                        initialData={formData} 
                        onChange={setFormData} 
                    />
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center">
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition flex items-center gap-2 font-medium"
                    >
                        <Trash2 size={18} />
                        Eliminar Sección
                    </button>
                    
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition font-semibold"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-8 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2 font-bold shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : <><Check size={18} /> Guardar Cambios</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
