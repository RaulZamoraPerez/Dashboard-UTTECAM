import { useState, useEffect } from 'react';
import { X, Save, Trash2, Upload, AlertTriangle, Layout, CreditCard, ArrowUp, ArrowDown } from 'lucide-react';
import becasService, { BecaSection } from '../../../services/becasService';

interface AvisoCard {
    id: string;
    type: 'alert' | 'poster' | 'card';
    variant: 'danger' | 'info' | 'success' | 'warning' | 'default';
    title: string;
    description: string;
    icon?: string;
    badge?: string;
    imageUrl?: string;
    url?: string;
    actionText?: string;
}

interface ModalEditarAvisosProps {
    isOpen: boolean;
    onClose: () => void;
    section: BecaSection;
    onSave: () => void;
}

export const ModalEditarAvisos = ({ isOpen, onClose, section, onSave }: ModalEditarAvisosProps) => {
    const [cards, setCards] = useState<AvisoCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (section) {
            let rawData = section.data || {};
            // Handle parsing if necessary (though usually it's already an object)
            if (typeof rawData === 'string') {
                try { rawData = JSON.parse(rawData); } catch (e) { rawData = {}; }
            }
            setCards(rawData.cards || []);
        }
    }, [section]);

    const addCard = (type: AvisoCard['type']) => {
        const newCard: AvisoCard = {
            id: crypto.randomUUID(),
            type,
            variant: 'default',
            title: 'Nuevo Elemento',
            description: 'Descripción del elemento',
            icon: 'info',
            badge: '',
            url: ''
        };
        setCards([...cards, newCard]);
    };

    const removeCard = (id: string) => {
        setCards(cards.filter(c => c.id !== id));
    };

    const updateCard = (id: string, field: keyof AvisoCard, value: any) => {
        setCards(cards.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const moveCard = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === cards.length - 1) return;

        const newCards = [...cards];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newCards[index], newCards[targetIndex]] = [newCards[targetIndex], newCards[index]];
        setCards(newCards);
    };

    const handleUpload = async (id: string, file: File) => {
        try {
            setUploading(true);
            const response = await becasService.uploadBannerFile(file);
            const fullUrl = response.url.startsWith('http') ? response.url : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${response.url}`;

            // Logic to determine if it's an image or a doc based on card type or extension could go here
            // For now, if it allows uploads, we usually mean Image for Poster or URL for others
            const card = cards.find(c => c.id === id);
            if (card?.type === 'poster') {
                updateCard(id, 'imageUrl', fullUrl);
            } else {
                updateCard(id, 'url', fullUrl);
            }

        } catch (error) {
            console.error('Error uploading:', error);
            alert('Error al subir archivo');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const sectionData = {
                title: section.title || 'Avisos',
                type: 'avisos' as const,
                data: { cards }
            };

            if (section.id === 0) {
                await becasService.createSection(sectionData);
            } else {
                await becasService.updateSection(section.id, sectionData);
            }

            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving avisos:', error);
            alert('Error al guardar sección');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        Editar Grid de Avisos
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/50">

                    {/* Toolbar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <button onClick={() => addCard('alert')} className="p-4 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition flex flex-col items-center justify-center gap-2 group text-center h-full">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <span className="font-bold text-sm block">Agregar Alerta</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">Aviso destacado de ancho completo</span>
                            </div>
                        </button>
                        <button onClick={() => addCard('poster')} className="p-4 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-600 dark:hover:text-blue-400 transition flex flex-col items-center justify-center gap-2 group text-center h-full">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                                <Layout size={24} />
                            </div>
                            <div>
                                <span className="font-bold text-sm block">Agregar Poster</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">Imagen vertical (mitad de ancho)</span>
                            </div>
                        </button>
                        <button onClick={() => addCard('card')} className="p-4 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 hover:text-green-600 dark:hover:text-green-400 transition flex flex-col items-center justify-center gap-2 group text-center h-full">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <span className="font-bold text-sm block">Agregar Tarjeta</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">Enlace simple (tercio de ancho)</span>
                            </div>
                        </button>
                    </div>

                    {/* Cards List */}
                    <div className="space-y-6">
                        {cards.map((card, idx) => (
                            <div key={card.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 relative group">
                                <div className="absolute top-4 right-4 flex items-center gap-1">
                                    <button
                                        onClick={() => moveCard(idx, 'up')}
                                        disabled={idx === 0}
                                        className="text-gray-400 hover:text-blue-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-30 disabled:hover:text-gray-400"
                                        title="Mover arriba"
                                    >
                                        <ArrowUp size={18} />
                                    </button>
                                    <button
                                        onClick={() => moveCard(idx, 'down')}
                                        disabled={idx === cards.length - 1}
                                        className="text-gray-400 hover:text-blue-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-30 disabled:hover:text-gray-400"
                                        title="Mover abajo"
                                    >
                                        <ArrowDown size={18} />
                                    </button>
                                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 self-center"></div>
                                    <button
                                        onClick={() => removeCard(card.id)}
                                        className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                {/* Dynamic Header based on Type */}
                                <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                        {card.type === 'alert' && <><AlertTriangle size={20} className="text-red-500" /> Configurar Alerta</>}
                                        {card.type === 'poster' && <><Layout size={20} className="text-blue-500" /> Configurar Poster</>}
                                        {card.type === 'card' && <><CreditCard size={20} className="text-green-500" /> Configurar Tarjeta</>}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {card.type === 'alert' && 'Aviso de ancho completo para mensajes importantes.'}
                                        {card.type === 'poster' && 'Imagen vertical ideal para promociones o eventos.'}
                                        {card.type === 'card' && 'Tarjeta compacta para enlaces rápidos.'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    {/* Left: Type & Variant */}
                                    <div className="md:col-span-3 space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Tipo</label>
                                            <select
                                                value={card.type}
                                                onChange={(e) => updateCard(card.id, 'type', e.target.value)}
                                                className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600 text-sm"
                                            >
                                                <option value="alert">Alerta (Horizontal)</option>
                                                <option value="poster">Poster (Vertical)</option>
                                                <option value="card">Tarjeta (Simple)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Variante</label>
                                            <select
                                                value={card.variant}
                                                onChange={(e) => updateCard(card.id, 'variant', e.target.value)}
                                                className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600 text-sm"
                                            >
                                                <option value="default">Estándar (Gris)</option>
                                                <option value="danger">Peligro (Rojo)</option>
                                                <option value="warning">Advertencia (Ámbar)</option>
                                                <option value="success">Éxito (Verde)</option>
                                                <option value="info">Info (Azul)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Icono</label>
                                            <select
                                                value={card.icon}
                                                onChange={(e) => updateCard(card.id, 'icon', e.target.value)}
                                                className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600 text-sm"
                                            >
                                                <option value="info">Info</option>
                                                <option value="alert">Alerta</option>
                                                <option value="check">Check</option>
                                                <option value="calendar">Calendario</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Right: Content */}
                                    <div className="md:col-span-9 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2 md:col-span-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Título</label>
                                                <input
                                                    type="text"
                                                    value={card.title}
                                                    onChange={(e) => updateCard(card.id, 'title', e.target.value)}
                                                    className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                                />
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Badge (Opcional)</label>
                                                <input
                                                    type="text"
                                                    value={card.badge || ''}
                                                    onChange={(e) => updateCard(card.id, 'badge', e.target.value)}
                                                    className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                                    placeholder="Ej: NUEVO"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Descripción</label>
                                            <textarea
                                                value={card.description}
                                                onChange={(e) => updateCard(card.id, 'description', e.target.value)}
                                                className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                                rows={2}
                                            />
                                        </div>

                                        {/* Uploads & Links */}
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border dark:border-gray-700">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {card.type === 'poster' ? (
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Imagen del Poster</label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={card.imageUrl || ''}
                                                                onChange={(e) => updateCard(card.id, 'imageUrl', e.target.value)}
                                                                placeholder="URL de imagen..."
                                                                className="flex-1 p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                                                            />
                                                            <label className={`p-2 bg-blue-100 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-200 transition ${uploading ? 'opacity-50' : ''}`}>
                                                                <Upload size={18} />
                                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(card.id, e.target.files[0])} disabled={uploading} />
                                                            </label>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                                                            Enlace / Documento (PDF)
                                                        </label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={card.url || ''}
                                                                onChange={(e) => updateCard(card.id, 'url', e.target.value)}
                                                                placeholder={card.url?.includes('/uploads/') ? 'Archivo subido' : 'https://...'}
                                                                className="flex-1 p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                                                            />
                                                            <label className={`p-2 bg-gray-200 text-gray-600 rounded-lg cursor-pointer hover:bg-gray-300 transition ${uploading ? 'opacity-50' : ''}`} title="Subir PDF">
                                                                <Upload size={18} />
                                                                <input
                                                                    type="file"
                                                                    accept=".pdf"
                                                                    className="hidden"
                                                                    onChange={(e) => e.target.files?.[0] && handleUpload(card.id, e.target.files[0])}
                                                                    disabled={uploading}
                                                                />
                                                            </label>
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 mt-1">
                                                            Sube un PDF o ingresa un enlace externo.
                                                        </p>
                                                    </div>
                                                )}


                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {cards.length === 0 && (
                            <div className="text-center py-12 text-gray-400 dark:text-gray-600">
                                <Layout size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No hay elementos. Agrega una Alerta, Poster o Tarjeta.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-white dark:bg-gray-800">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || uploading}
                        className="px-6 py-2 bg-[#0a9782] text-white rounded-lg hover:bg-[#088c75] transition flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : <><Save size={18} /> Guardar Cambios</>}
                    </button>
                </div>
            </div >
        </div >
    );
};
