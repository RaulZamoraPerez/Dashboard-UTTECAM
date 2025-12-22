import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import becasService, { BecaSection } from '../../../services/becasService';

interface FooterLink {
    id: string;
    text: string;
    url: string;
}

interface FooterData {
    title: string;
    subtitle: string;
    email: string;
    phone: string;
    links: FooterLink[];
}

interface ModalEditarFooterProps {
    isOpen: boolean;
    onClose: () => void;
    section: BecaSection;
    onSave: () => void;
}

export const ModalEditarFooter = ({ isOpen, onClose, section, onSave }: ModalEditarFooterProps) => {
    const [formData, setFormData] = useState<FooterData>({
        title: '',
        subtitle: '',
        email: '',
        phone: '',
        links: []
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (section) {
            const defaultData: FooterData = {
                title: '¿Tienes dudas?',
                subtitle: 'Estamos aquí para ayudarte en tu proceso',
                email: 'serviciosestudiantiles@uttecam.edu.mx',
                phone: '249 422 3300 Ext. 161',
                links: []
            };

            let rawData = section.data || {};
            if (typeof rawData === 'string') {
                try { rawData = JSON.parse(rawData); } catch (e) { rawData = {}; }
            }

            setFormData({ ...defaultData, ...rawData });
        }
    }, [section]);

    const addLink = () => {
        const newLink: FooterLink = {
            id: crypto.randomUUID(),
            text: 'Nuevo Enlace',
            url: '#'
        };
        setFormData({ ...formData, links: [...formData.links, newLink] });
    };

    const removeLink = (id: string) => {
        setFormData({ ...formData, links: formData.links.filter(l => l.id !== id) });
    };

    const updateLink = (id: string, field: keyof FooterLink, value: string) => {
        setFormData({
            ...formData,
            links: formData.links.map(l => l.id === id ? { ...l, [field]: value } : l)
        });
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const sectionData = {
                title: section.title || 'Footer Contacto',
                type: 'footer' as const,
                data: formData
            };

            if (section.id === 0) {
                await becasService.createSection(sectionData);
            } else {
                await becasService.updateSection(section.id, sectionData);
            }

            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving footer:', error);
            alert('Error al guardar sección');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        Editar Footer de Contacto
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/50">
                    <div className="space-y-6">
                        {/* Main Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-gray-600 dark:text-gray-300 block mb-1">Título Principal</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="Ej: ¿Tienes dudas?"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-600 dark:text-gray-300 block mb-1">Subtítulo</label>
                                <input
                                    type="text"
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="Ej: Estamos aquí para ayudarte..."
                                />
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold text-gray-600 dark:text-gray-300 block mb-1">Correo Electrónico</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="email@ejemplo.com"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-600 dark:text-gray-300 block mb-1">Teléfono</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="Ej: 123 456 7890"
                                />
                            </div>
                        </div>

                        {/* Links Section */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Enlaces Inferiores</label>
                                <button
                                    onClick={addLink}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                >
                                    <Plus size={14} /> Agregar Enlace
                                </button>
                            </div>

                            <div className="space-y-3">
                                {formData.links.map((link) => (
                                    <div key={link.id} className="flex gap-2 items-start bg-white dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700">
                                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">
                                            <LinkIcon size={16} />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="text"
                                                value={link.text}
                                                onChange={(e) => updateLink(link.id, 'text', e.target.value)}
                                                className="w-full p-1 border-b dark:bg-transparent dark:border-gray-600 text-sm focus:border-blue-500 outline-none"
                                                placeholder="Texto del enlace"
                                            />
                                            <input
                                                type="text"
                                                value={link.url}
                                                onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                                                className="w-full p-1 border-b dark:bg-transparent dark:border-gray-600 text-xs text-gray-500 focus:border-blue-500 outline-none"
                                                placeholder="URL (https://...)"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeLink(link.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                {formData.links.length === 0 && (
                                    <p className="text-sm text-gray-400 text-center py-4 border-2 border-dashed rounded-lg">
                                        No hay enlaces adicionales
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-white dark:bg-gray-800">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2 bg-[#0a9782] text-white rounded-lg hover:bg-[#088c75] transition flex items-center gap-2"
                    >
                        {loading ? 'Guardando...' : <><Save size={18} /> Guardar Cambios</>}
                    </button>
                </div>
            </div>
        </div>
    );
};
