import { Edit, AlertTriangle, Info, CheckCircle, Calendar, ExternalLink, ArrowRight, Maximize2, ZoomIn, Image as ImageIcon } from 'lucide-react';
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
    title?: string;
    cards?: AvisoCard[];
    onEdit: () => void;
}

const getFullUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http') || url.startsWith('https')) return url;
    if (url.startsWith('/uploads/')) {
        return `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}${url}`;
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

export const AvisosSection = ({ id, title, cards = [], onEdit }: AvisosSectionProps) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
    const getFullUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${baseUrl}${url}`;
    };

    const sortedCards = [...cards].sort((a, b) => {
        if (a.type === 'alert' && b.type !== 'alert') return -1;
        if (a.type !== 'alert' && b.type === 'alert') return 1;
        if (a.type === 'alert' && b.type === 'alert') {
            const aText = (a.title + (a.badge || '')).toLowerCase();
            const bText = (b.title + (b.badge || '')).toLowerCase();
            if (aText.includes('prioritario')) return -1;
            if (bText.includes('prioritario')) return 1;
            if (aText.includes('resultado')) return 1;
            if (bText.includes('resultado')) return -1;
        }
        return 0;
    });

    const featuredCards = sortedCards.filter(c => c.type === 'alert' || c.type === 'poster');
    const standardCards = sortedCards.filter(c => c.type === 'card');

    const renderCard = (card: any) => {
        const styles = getVariantStyles(card.variant);
        const isLink = !!card.url;
        const Wrapper = isLink ? 'a' : 'div';
        const wrapperProps = isLink ? { href: card.url, target: "_blank", rel: "noopener noreferrer" } : {};

        if (card.type === 'alert') {
            return (
                <Wrapper
                    key={card.id}
                    {...wrapperProps}
                    className={`col-span-1 h-full relative overflow-hidden rounded-[2rem] border transition-all duration-300 bg-white ${styles.border} ${styles.hover} group`}
                >
                    <div className="flex flex-col h-full">
                        <div className={`px-6 py-4 border-b flex items-center gap-3 ${styles.bg} ${styles.border}`}>
                            <div className={`p-2 rounded-full ${styles.iconBg} ${styles.icon} shadow-sm`}>
                                {getIcon(card.icon)}
                            </div>
                            <h3 className={`text-lg font-black ${styles.text}`}>
                                {card.title}
                            </h3>
                            {card.badge && (
                                <span className={`ml-auto inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}>
                                    {card.badge}
                                </span>
                            )}
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                                {card.description}
                            </p>
                        </div>
                    </div>
                </Wrapper>
            );
        }

        if (card.type === 'poster') {
            return (
                <Wrapper
                    key={card.id}
                    {...wrapperProps}
                    className={`col-span-1 h-full flex flex-col rounded-[2rem] border transition-all duration-300 bg-white ${styles.border} ${styles.hover} overflow-hidden group`}
                >
                    <div className={`px-6 py-4 border-b flex items-center gap-3 ${styles.bg} ${styles.border}`}>
                        <div className={`p-2 rounded-full ${styles.iconBg} ${styles.icon} shadow-sm`}>
                            {getIcon(card.icon || 'calendar')}
                        </div>
                        <h3 className={`text-lg font-black ${styles.text}`}>
                            {card.title}
                        </h3>
                        {card.badge && (
                            <span className={`ml-auto inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}>
                                {card.badge}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 relative group/img overflow-hidden">
                        {card.imageUrl ? (
                            <>
                                <img
                                    src={getFullUrl(card.imageUrl)}
                                    alt={card.title}
                                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700"
                                />
                                <div
                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedImage(getFullUrl(card.imageUrl!));
                                    }}
                                >
                                    <ZoomIn className="text-white" size={32} />
                                </div>
                            </>
                        ) : (
                            <div className="py-20 flex flex-col items-center opacity-20">
                                <ImageIcon size={48} />
                                <span className="text-[10px] font-black uppercase mt-2">Sin Imagen</span>
                            </div>
                        )}
                    </div>
                </Wrapper>
            );
        }

        return (
            <Wrapper
                key={card.id}
                {...wrapperProps}
                className={`col-span-1 h-full flex flex-col rounded-[2rem] border bg-white shadow-sm border-gray-100 ${isLink ? `transition-all duration-500 hover:shadow-md group` : ''}`}
            >
                <div className={`px-6 py-4 border-b flex items-center gap-3 ${styles.bg} ${styles.border}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.iconBg} ${styles.icon} shadow-sm`}>
                        {getIcon(card.icon)}
                    </div>
                    <h3 className={`text-lg font-black ${styles.text}`}>
                        {card.title}
                    </h3>
                    {card.badge && (
                        <span className={`ml-auto inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}>
                            {card.badge}
                        </span>
                    )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                        {card.description}
                    </p>
                    {card.actionText && (
                        <div className="text-[#0a9782] text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
                            {card.actionText}
                            <ArrowRight size={14} />
                        </div>
                    )}
                </div>
            </Wrapper>
        );
    };

    return (
        <div className="relative group/section py-12 px-4 max-w-6xl mx-auto">
            {/* Edit Button */}
            <button
                onClick={onEdit}
                className="absolute -top-3 right-0 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover/section:opacity-100 transition-all duration-200"
                title="Editar avisos"
            >
                <Edit size={16} />
            </button>

            {/* Grid Principal (Alertas y Posters) - 2 Columnas */}
            {featuredCards.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {featuredCards.map(renderCard)}
                </div>
            )}

            {/* Grid Secundario (Tarjetas de Enlace) - 3 Columnas */}
            {standardCards.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                    {standardCards.map(renderCard)}
                </div>
            )}

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
