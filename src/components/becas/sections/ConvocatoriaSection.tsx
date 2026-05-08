import { useState } from 'react';
import { Edit, FileText, ArrowRight, Eye, Calendar, Info, FileCheck, AlertCircle, X } from 'lucide-react';

interface DocumentItem {
    title: string;
    subtitle: string;
    type: 'pdf' | 'link';
    url: string;
    actionText: string;
    variant?: 'default' | 'warning' | 'success' | 'info' | 'outline' | 'danger';
}

interface ConvocatoriaSectionProps {
    id: number;
    badge?: string;
    mainTitle?: string;
    title: string;
    subtitle?: string;
    description?: string;
    documents?: DocumentItem[];
    imageUrl?: string;
    imageCaption?: string;
    onEdit: () => void;
}

const getVariantStyles = (variant: string = 'default') => {
    switch (variant) {
        case 'warning': // Yellow (Convocatoria) - Full Width
            return {
                card: 'bg-[#FFF9E6] border-[#FFEeba] hover:border-orange-300 dark:bg-yellow-900/10 dark:border-yellow-900/30',
                icon: 'bg-[#FFE0B2] text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
                text: 'text-gray-900 dark:text-gray-100 text-lg',
                subtext: 'text-[#0a9782] dark:text-[#2dd4bf] font-medium',
                action: 'text-gray-900 font-semibold dark:text-gray-200',
                span: 'md:col-span-2'
            };
        case 'success': // Green (Resultados) - Half Width
            return {
                card: 'bg-[#F0FDF4] border-green-100 hover:border-green-300 dark:bg-green-900/10 dark:border-green-900/30',
                icon: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
                text: 'text-gray-900 dark:text-gray-100',
                subtext: 'text-gray-500 dark:text-gray-400',
                action: 'text-[#0a9782] dark:text-[#2dd4bf]',
                span: 'md:col-span-1'
            };
        case 'info': // Blue (Casos Especiales) - Half Width
            return {
                card: 'bg-[#EFF6FF] border-blue-100 hover:border-blue-300 dark:bg-blue-900/10 dark:border-blue-900/30',
                icon: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
                text: 'text-gray-900 dark:text-gray-100',
                subtext: 'text-gray-500 dark:text-gray-400',
                action: 'text-[#0a9782] dark:text-[#2dd4bf]',
                span: 'md:col-span-1'
            };
        case 'danger': // Red (Peligro) - Half Width
            return {
                card: 'bg-[#FEF2F2] border-red-100 hover:border-red-300 dark:bg-red-900/10 dark:border-red-900/30',
                icon: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
                text: 'text-gray-900 dark:text-gray-100',
                subtext: 'text-gray-500 dark:text-gray-400',
                action: 'text-[#0a9782] dark:text-[#2dd4bf]',
                span: 'md:col-span-1'
            };
        case 'outline': // Outline (Carta Compromiso) - Full Width
            return {
                card: 'bg-white border-2 border-orange-100 hover:border-orange-300 dark:bg-gray-800 dark:border-orange-900/30',
                icon: 'bg-orange-50 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400',
                text: 'text-gray-900 dark:text-gray-100',
                subtext: 'text-gray-500 dark:text-gray-400',
                action: 'text-gray-400 group-hover:text-orange-500 transition-colors',
                span: 'md:col-span-2'
            };
        default: // Default Gray - Half Width
            return {
                card: 'bg-gray-50 border-gray-200 hover:border-[#0a9782] dark:bg-gray-800/50 dark:border-gray-700',
                icon: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
                text: 'text-gray-900 dark:text-white',
                subtext: 'text-gray-500 dark:text-gray-400',
                action: 'text-gray-500 group-hover:text-[#0a9782]',
                span: 'md:col-span-1'
            };
    }
};

const getDocumentIcon = (variant: string = 'default') => {
    switch (variant) {
        case 'success': return <FileCheck size={24} />;
        case 'info': return <Info size={24} />;
        case 'warning': return <FileText size={24} />;
        case 'danger': return <AlertCircle size={24} />;
        case 'outline': return <ArrowRight size={24} className="rotate-90 md:rotate-0" />; // Icono de descarga
        default: return <FileText size={24} />;
    }
};

const getFullUrl = (url: string) => {
    if (!url) return '#';
    if (url.startsWith('http') || url.startsWith('https')) return url;
    // If it's a relative upload path, prepend API URL
    if (url.startsWith('/uploads/')) {
        return `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}${url}`;
    }
    return url;
};

export const ConvocatoriaSection = ({
    badge,
    mainTitle,
    title,
    subtitle,
    description,
    documents = [],
    imageUrl,
    imageCaption,
    onEdit
}: ConvocatoriaSectionProps) => {
    const [isImageExpanded, setIsImageExpanded] = useState(false);

    return (
        <section className="py-12 px-4 max-w-6xl mx-auto relative group/section">
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 lg:p-12 shadow-sm border border-gray-100 relative">
                {/* Edit Button */}
                <button
                    onClick={onEdit}
                    className="absolute top-6 right-6 z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                    title="Editar sección"
                >
                    <Edit size={20} />
                </button>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                    {/* Left Column: Content & Documents */}
                    <div className="flex-1 space-y-8">
                        {/* Header */}
                        <div className="space-y-4">
                            {(badge || mainTitle) && (
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300 text-[10px] font-bold tracking-widest uppercase border border-amber-100 dark:border-amber-900/50">
                                    <Calendar size={12} />
                                    {badge || mainTitle}
                                </div>
                            )}
                            <div>
                                <h2 className="text-3xl lg:text-4xl font-extrabold text-[#002B49] dark:text-white mb-2 tracking-tight leading-tight">
                                    {title}
                                </h2>
                                {subtitle && (
                                    <p className="text-gray-800 dark:text-gray-100 text-base font-bold leading-relaxed max-w-2xl mt-1">
                                        {subtitle}
                                    </p>
                                )}
                                {description && (
                                    <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed max-w-2xl mt-2">
                                        {description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Documents Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                            {documents.map((doc, idx) => {
                                const styles = getVariantStyles(doc.variant);
                                return (
                                    <a
                                        key={idx}
                                        href={getFullUrl(doc.url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`
                                            flex items-center gap-5 p-5 rounded-[2rem] border transition-all duration-500 group 
                                            ${styles.card} ${styles.span}
                                            hover:shadow-md hover:-translate-y-0.5
                                        `}
                                    >
                                        <div className={`p-3.5 rounded-xl ${styles.icon} shadow-sm group-hover:scale-110 transition-transform`}>
                                            {getDocumentIcon(doc.variant)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-bold text-lg truncate ${styles.text}`}>
                                                {doc.title}
                                            </h3>
                                            <p className={`text-xs truncate mt-0.5 uppercase tracking-wider font-bold opacity-70`}>
                                                {doc.subtitle}
                                            </p>
                                        </div>
                                        <div className={`flex items-center gap-2 transition-colors whitespace-nowrap ${styles.action} opacity-40 group-hover:opacity-100`}>
                                            <ArrowRight size={20} />
                                        </div>
                                    </a>
                                );
            })}
                        </div>
                    </div>

                    {/* Right Column: Poster Image */}
                    {imageUrl && (
                        <div className="lg:w-[300px] xl:w-[340px] flex-shrink-0 flex flex-col items-center justify-start">
                            <div 
                                className="relative rounded-[2rem] overflow-hidden w-full group cursor-pointer"
                                style={{maxHeight: '380px'}}
                                onClick={() => setIsImageExpanded(true)}
                            >
                                <img
                                    src={imageUrl}
                                    alt={imageCaption || title}
                                    className="w-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                                    style={{maxHeight: '380px'}}
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur text-gray-800 dark:text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <Eye size={16} />
                                        Ver Imagen
                                    </div>
                                </div>
                            </div>
                            {imageCaption && (
                                <p className="mt-4 text-sm font-semibold text-gray-400 text-center italic">
                                    {imageCaption}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Imagen Expandida */}
            {isImageExpanded && imageUrl && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setIsImageExpanded(false)}
                >
                    <button
                        className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
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
        </section>
    );
};

export default ConvocatoriaSection;
