import { Edit, Download, Eye, Info, X } from 'lucide-react';
import { useState } from 'react';

interface BannerSectionProps {
    id: number;
    title: string;
    subtitle?: string;
    description?: string;
    imageUrl?: string;
    buttons?: {
        text: string;
        url: string;
        type: 'primary' | 'secondary';
        icon?: 'download' | 'eye';
    }[];
    footerNote?: string;
    onEdit: () => void;
}

export const BannerSection = ({
    title,
    subtitle,
    description,
    imageUrl,
    buttons = [],
    footerNote,
    onEdit
}: BannerSectionProps) => {
    const [isImageExpanded, setIsImageExpanded] = useState(false);

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden relative">
                {/* Botón de editar */}
                <button
                    onClick={onEdit}
                    className="absolute top-4 right-4 z-20 bg-white/80 hover:bg-white text-gray-700 dark:bg-gray-700/80 dark:hover:bg-gray-600 dark:text-gray-300 p-2 rounded-lg transition backdrop-blur-sm shadow-sm"
                    title="Editar sección"
                >
                    <Edit size={18} />
                </button>

                <div className="flex flex-col md:flex-row md:min-h-[500px]">
                    {/* Columna Izquierda: Contenido */}
                    <div className="p-6 md:p-8 md:w-3/5 flex flex-col justify-center relative z-10">

                        {/* Badge / Subtítulo */}
                        {subtitle && (
                            <div className="inline-flex items-center gap-2 mb-3">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-xs font-bold text-[#0a9782] dark:text-[#2dd4bf] tracking-wider uppercase">
                                    {subtitle}
                                </span>
                            </div>
                        )}

                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                            {title.split('\n').map((line, i) => {
                                const renderLine = (text: string) => {
                                    if (!text) return null;
                                    const parts = text.split(/(\*[^*]+\*)/g);
                                    return (
                                        <>
                                            {parts.map((part, index) => {
                                                if (part.startsWith('*') && part.endsWith('*')) {
                                                    const content = part.slice(1, -1);
                                                    return (
                                                        <span key={index} className="text-[#0a9782]">
                                                            {content}
                                                        </span>
                                                    );
                                                }
                                                return <span key={index}>{part}</span>;
                                            })}
                                        </>
                                    );
                                };

                                return (
                                    <span key={i} className="block">{renderLine(line)}</span>
                                );
                            })}
                        </h2>

                        {description && (
                            <div className="prose dark:prose-invert text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-sm md:text-base">
                                {description.split('\n').map((line, i) => (
                                    <p key={i} className="mb-1">{line}</p>
                                ))}
                            </div>
                        )}

                        {/* Botones */}
                        {buttons.length > 0 && (
                            <div className="flex flex-wrap gap-3 mb-6">
                                {buttons.map((btn, idx) => (
                                    <a
                                        key={idx}
                                        href={btn.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${btn.type === 'primary'
                                            ? 'bg-[#0a2540] text-white hover:bg-[#0f355a]'
                                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {btn.icon === 'download' && <Download size={16} />}
                                        {btn.icon === 'eye' && <Eye size={16} />}
                                        {btn.text}
                                    </a>
                                ))}
                            </div>
                        )}

                        {/* Nota al pie */}
                        {footerNote && (
                            <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                                <Info size={14} className="mt-0.5 flex-shrink-0" />
                                <p>{footerNote}</p>
                            </div>
                        )}
                    </div>

                    {/* Columna Derecha: Imagen */}
                    <div className="md:w-2/5 relative h-64 md:h-auto min-h-[300px] group flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-800/50">
                        {imageUrl ? (
                            <div className="relative w-full max-w-[320px] transform transition-transform duration-500 hover:scale-105">
                                <div
                                    className="relative rounded-2xl overflow-hidden shadow-2xl border-[6px] border-white dark:border-gray-700 bg-white dark:bg-gray-800 w-full cursor-pointer"
                                    onClick={() => setIsImageExpanded(true)}
                                >
                                    <img
                                        src={imageUrl}
                                        alt={title}
                                        className="w-full h-auto object-contain"
                                    />
                                    {/* Overlay con botón de ampliar */}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur text-gray-800 dark:text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 pointer-events-auto">
                                            <Eye size={16} />
                                            Ampliar Resultado
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <span className="text-sm">Sin imagen</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Imagen Expandida */}
            {isImageExpanded && imageUrl && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setIsImageExpanded(false)}
                >
                    <button
                        className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
                        onClick={() => setIsImageExpanded(false)}
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={imageUrl}
                        alt={title}
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
};

export default BannerSection;
