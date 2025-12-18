import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import becasService, { BecaSection } from '../../../services/becasService';
import { BannerForm, BannerData } from './BannerForm';

interface ModalEditarBannerProps {
    isOpen: boolean;
    onClose: () => void;
    section: BecaSection;
    onSave: () => void;
}

export const ModalEditarBanner = ({ isOpen, onClose, section, onSave }: ModalEditarBannerProps) => {
    const [formData, setFormData] = useState<BannerData>({
        title: '',
        subtitle: '',
        description: '',
        imageUrl: '',
        footerNote: '',
        buttons: []
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (section) {
            console.log('ModalEditarBanner received section:', section);

            let rawData = section.data || {};

            // Si data viene como string JSON, parsearlo
            if (typeof rawData === 'string') {
                try {
                    rawData = JSON.parse(rawData);
                } catch (e) {
                    console.error('Error parsing section data:', e);
                    rawData = {};
                }
            }

            // Fusionar propiedades planas y anidadas (prioridad a anidadas si existen)
            // Esto asegura que si 'subtitle' está en la raíz O en data, se encuentre.
            const mergedData = { ...section, ...rawData };

            setFormData({
                title: section.title || '',
                subtitle: mergedData.subtitle || '',
                description: mergedData.description || '',
                imageUrl: mergedData.imageUrl || '',
                footerNote: mergedData.footerNote || '',
                buttons: mergedData.buttons || []
            });
        }
    }, [section]);

    const handleSave = async () => {
        try {
            setLoading(true);
            const sectionData = {
                title: formData.title,
                type: 'banner' as const,
                data: {
                    subtitle: formData.subtitle,
                    description: formData.description,
                    imageUrl: formData.imageUrl,
                    footerNote: formData.footerNote,
                    buttons: formData.buttons
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        {section.id === 0 ? 'Nueva Sección Destacada' : 'Editar Sección Destacada'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    <BannerForm
                        initialData={formData}
                        onChange={setFormData}
                    />
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

export default ModalEditarBanner;
