import { Edit, Maximize2, Calendar, AlertCircle, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface NoticeItem {
    title: string;
    type: 'warning' | 'calendar' | 'info';
    imageUrl: string;
    linkUrl?: string;
    buttonText?: string;
}

interface NoticesSectionProps {
    id: number;
    title: string;
    notices?: NoticeItem[];
    onEdit: () => void;
}

export const NoticesSection = ({ title, notices = [], onEdit }: NoticesSectionProps) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const getIcon = (type: string) => {
        switch (type) {
            case 'calendar': return <Calendar className="text-blue-500" size={20} />;
            case 'warning': return <AlertCircle className="text-orange-500" size={20} />;
            default: return <ExternalLink className="text-gray-500" size={20} />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'calendar': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'warning': return 'bg-orange-50 text-orange-700 border-orange-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 relative">
            {/* Botón de editar */}
            <button
                onClick={onEdit}
                className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 p-3 rounded-lg transition"
                title="Editar sección"
            >
                <Edit size={20} />
            </button>

            {/* Título de la Sección */}
            {title && <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{title}</h3>}

            {/* Grid de Avisos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {notices.map((notice, idx) => (
                    <div key={idx} className="group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">

                        {/* Header del Card */}
                        <div className={`p-4 flex items-center gap-3 border-b ${getColor(notice.type)} bg-opacity-50`}>
                            {getIcon(notice.type)}
                            <span className="font-bold text-sm uppercase tracking-wide">{notice.title}</span>
                        </div>

                        {/* Imagen Preview */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 cursor-pointer" onClick={() => setSelectedImage(notice.imageUrl)}>
                            <img
                                src={notice.imageUrl}
                                alt={notice.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <span className="bg-white/90 text-gray-900 px-4 py-2 rounded-full font-medium flex items-center gap-2 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all">
                                    <Maximize2 size={16} /> Ampliar
                                </span>
                            </div>
                        </div>

                        {/* Footer / Acciones */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 mt-auto">
                            {notice.linkUrl ? (
                                <a
                                    href={notice.linkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition shadow-sm"
                                >
                                    {notice.buttonText || 'Ver más detalles'}
                                </a>
                            ) : (
                                <button
                                    onClick={() => setSelectedImage(notice.imageUrl)}
                                    className="block w-full text-center py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition shadow-sm"
                                >
                                    {notice.buttonText || 'Ver imagen completa'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-5xl max-h-[90vh] w-full">
                        <img
                            src={selectedImage}
                            alt="Full size"
                            className="w-full h-full object-contain rounded-lg shadow-2xl"
                        />
                        <button
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
                            onClick={() => setSelectedImage(null)}
                        >
                            <span className="text-sm font-medium uppercase tracking-widest">Cerrar</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoticesSection;
