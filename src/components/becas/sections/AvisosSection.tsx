import { Edit, AlertTriangle, Info, CheckCircle, Calendar, ExternalLink, ArrowRight, Maximize2 } from 'lucide-react';
import { useState } from 'react';

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

interface AvisosSectionProps {
    id: number;
    cards?: AvisoCard[];
    onEdit: () => void;
}

const getFullUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http') || url.startsWith('https')) return url;
    if (url.startsWith('/uploads/')) {
        return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${url}`;
    }
    return url;
};

const getVariantStyles = (variant: string) => {
    switch (variant) {
        case 'danger':
            return {
                bg: 'bg-red-50 dark:bg-red-900/10',
                border: 'border-red-100 dark:border-red-900/30',
                text: 'text-red-900 dark:text-red-200',
                icon: 'text-red-600 dark:text-red-400',
                iconBg: 'bg-white dark:bg-red-900/20',
                hover: 'hover:border-red-200 dark:hover:border-red-800',
                badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
                button: 'bg-white border-red-200 text-red-700 hover:bg-red-50 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
            };
        case 'warning':
            return {
                bg: 'bg-amber-50 dark:bg-amber-900/10',
                border: 'border-amber-100 dark:border-amber-900/30',
                text: 'text-amber-900 dark:text-amber-200',
                icon: 'text-amber-600 dark:text-amber-400',
                iconBg: 'bg-white dark:bg-amber-900/20',
                hover: 'hover:border-amber-200 dark:hover:border-amber-800',
                badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                button: 'bg-white border-amber-200 text-amber-700 hover:bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300'
            };
        case 'success':
            return {
                bg: 'bg-green-50 dark:bg-green-900/10',
                border: 'border-green-100 dark:border-green-900/30',
                text: 'text-green-900 dark:text-green-200',
                icon: 'text-green-600 dark:text-green-400',
                iconBg: 'bg-white dark:bg-green-900/20',
                hover: 'hover:border-green-200 dark:hover:border-green-800',
                badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
                button: 'bg-white border-green-200 text-green-700 hover:bg-green-50 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
            };
        case 'info':
            return {
                bg: 'bg-blue-50 dark:bg-blue-900/10',
                border: 'border-blue-100 dark:border-blue-900/30',
                text: 'text-blue-900 dark:text-blue-200',
                icon: 'text-blue-600 dark:text-blue-400',
                iconBg: 'bg-white dark:bg-blue-900/20',
                hover: 'hover:border-blue-200 dark:hover:border-blue-800',
                badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
                button: 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
            };
        default:
            return {
                bg: 'bg-gray-50 dark:bg-gray-800/50',
                border: 'border-gray-200 dark:border-gray-700',
                text: 'text-gray-900 dark:text-gray-200',
                icon: 'text-gray-600 dark:text-gray-400',
                iconBg: 'bg-white dark:bg-gray-700',
                hover: 'hover:border-gray-300 dark:hover:border-gray-600',
                badge: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
                button: 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
            };
    }
};

const getIcon = (iconName?: string) => {
    switch (iconName) {
        case 'alert': return <AlertTriangle size={32} strokeWidth={1.5} />;
        case 'info': return <Info size={32} strokeWidth={1.5} />;
        case 'check': return <CheckCircle size={32} strokeWidth={1.5} />;
        case 'calendar': return <Calendar size={32} strokeWidth={1.5} />;
        default: return <Info size={32} strokeWidth={1.5} />;
    }
};

export const AvisosSection = ({ cards = [], onEdit }: AvisosSectionProps) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (
        <div className="relative group/section">
            {/* Edit Button */}
            <button
                onClick={onEdit}
                className="absolute -top-3 right-0 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover/section:opacity-100 transition-all duration-200"
                title="Editar avisos"
            >
                <Edit size={16} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {cards.map((card) => {
                    const styles = getVariantStyles(card.variant);
                    const href = getFullUrl(card.url);
                    const isLink = !!href;
                    const Wrapper = isLink ? 'a' : 'div';
                    const wrapperProps = isLink ? { href, target: '_blank', rel: 'noopener noreferrer' } : {};

                    // Render differently based on type
                    if (card.type === 'alert') {
                        return (
                            <Wrapper
                                key={card.id}
                                {...wrapperProps}
                                className={`col-span-1 md:col-span-12 relative overflow-hidden flex flex-col md:flex-row items-start gap-6 p-6 rounded-3xl border ${styles.bg} ${styles.border} ${isLink ? `transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${styles.hover}` : ''}`}
                            >
                                {/* Decorative Background Circle */}
                                <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-50 blur-3xl ${styles.iconBg}`} />

                                {/* Icon */}
                                <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center shadow-sm ${styles.iconBg} ${styles.icon}`}>
                                    {getIcon(card.icon)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 relative z-10">
                                    {card.badge && (
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 ${styles.badge}`}>
                                            {card.badge}
                                        </span>
                                    )}
                                    <h3 className={`text-2xl font-bold mb-2 ${styles.text}`}>
                                        {card.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-4 max-w-3xl">
                                        {card.description}
                                    </p>

                                    {card.actionText && (
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all shadow-sm ${styles.button}`}>
                                            {card.actionText}
                                            <ExternalLink size={14} />
                                        </div>
                                    )}
                                </div>
                            </Wrapper>
                        );
                    }

                    if (card.type === 'poster') {
                        return (
                            <Wrapper
                                key={card.id}
                                {...wrapperProps}
                                className={`col-span-1 md:col-span-6 flex flex-col rounded-2xl overflow-hidden border bg-white dark:bg-gray-800 shadow-sm ${styles.border} ${isLink ? `transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${styles.hover}` : ''}`}
                            >
                                {/* Header: Icon + Title */}
                                <div className={`px-4 py-3 border-b flex items-center gap-3 ${styles.bg} ${styles.border}`}>
                                    <div className={`${styles.icon}`}>
                                        {getIcon(card.icon)}
                                    </div>
                                    <h3 className={`font-bold text-base ${styles.text}`}>
                                        {card.title}
                                    </h3>
                                </div>

                                {/* Image Body */}
                                {card.imageUrl && (
                                    <div className="w-full bg-gray-50 dark:bg-gray-900 flex justify-center relative group/image cursor-pointer" onClick={() => setSelectedImage(getFullUrl(card.imageUrl || '') || null)}>
                                        <img
                                            src={getFullUrl(card.imageUrl || '')}
                                            alt={card.title}
                                            className="w-full h-auto max-h-[600px] object-contain transition-transform duration-500 group-hover/image:scale-[1.02]"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/image:opacity-100">
                                            <span className="bg-white/90 text-gray-900 px-4 py-2 rounded-full font-medium flex items-center gap-2 shadow-lg transform translate-y-4 group-hover/image:translate-y-0 transition-all">
                                                <Maximize2 size={16} /> Ampliar
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Footer: Action (Optional) */}
                                {card.actionText && (
                                    <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:gap-2 transition-all">
                                            {card.actionText} <ArrowRight size={14} />
                                        </span>
                                    </div>
                                )}
                            </Wrapper>
                        );
                    }

                    // Default 'card'
                    return (
                        <Wrapper
                            key={card.id}
                            {...wrapperProps}
                            className={`col-span-1 md:col-span-4 p-6 rounded-2xl border bg-white dark:bg-gray-800 shadow-sm ${styles.border} ${isLink ? `transition-all duration-200 hover:shadow-md hover:border-blue-300 ${styles.hover}` : ''}`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${styles.bg} ${styles.icon}`}>
                                {getIcon(card.icon)}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                {card.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-3">
                                {card.description}
                            </p>
                            {card.actionText && (
                                <div className="text-blue-600 dark:text-blue-400 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                                    {card.actionText}
                                    <ArrowRight size={16} />
                                </div>
                            )}
                        </Wrapper>
                    );
                })}
            </div>

            {/* Modal Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center">
                        <img
                            src={selectedImage}
                            alt="Full size"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        />
                        <button
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition flex items-center gap-2"
                            onClick={() => setSelectedImage(null)}
                        >
                            <span className="text-sm font-medium uppercase tracking-widest">Cerrar</span>
                            <div className="bg-white/10 p-2 rounded-full">
                                <Maximize2 size={20} className="rotate-45" />
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
