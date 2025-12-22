import { Edit, FileText, ArrowRight, Eye, Calendar, Info, FileCheck, AlertCircle } from 'lucide-react';

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
    title: string;
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
        default: // Default Gray - Full Width
            return {
                card: 'bg-gray-50 border-gray-200 hover:border-[#0a9782] dark:bg-gray-800/50 dark:border-gray-700',
                icon: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
                text: 'text-gray-900 dark:text-white',
                subtext: 'text-gray-500 dark:text-gray-400',
                action: 'text-gray-500 group-hover:text-[#0a9782]',
                span: 'md:col-span-2'
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
        return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${url}`;
    }
    return url;
};

export const ConvocatoriaSection = ({
    badge,
    title,
    description,
    documents = [],
    imageUrl,
    imageCaption,
    onEdit
}: ConvocatoriaSectionProps) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 relative">
            {/* Edit Button */}
            <button
                onClick={onEdit}
                className="absolute top-6 right-6 z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                title="Editar sección"
            >
                <Edit size={20} />
            </button>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Content & Documents */}
                <div className="flex-1 space-y-8">
                    {/* Header */}
                    <div className="space-y-4">
                        {badge && (
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF3E0] text-orange-800 dark:bg-orange-900/40 dark:text-orange-200 text-xs font-bold tracking-wider uppercase border border-orange-100 dark:border-orange-900/50">
                                <Calendar size={14} />
                                {badge}
                            </div>
                        )}
                        <div>
                            <h2 className="text-4xl font-extrabold text-[#002B49] dark:text-white mb-3 tracking-tight">
                                {title}
                            </h2>
                            {description && (
                                <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Documents Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {documents.map((doc, idx) => {
                            const styles = getVariantStyles(doc.variant);
                            return (
                                <a
                                    key={idx}
                                    href={getFullUrl(doc.url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`
                                        flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 group 
                                        ${styles.card} ${styles.span}
                                        hover:shadow-lg hover:-translate-y-0.5
                                    `}
                                >
                                    <div className={`p-3.5 rounded-xl ${styles.icon} shadow-sm`}>
                                        {getDocumentIcon(doc.variant)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-bold truncate ${styles.text}`}>
                                            {doc.title}
                                        </h3>
                                        <p className={`text-sm truncate mt-0.5 ${styles.subtext}`}>
                                            {doc.subtitle}
                                        </p>
                                    </div>
                                    <div className={`flex items-center gap-2 transition-colors whitespace-nowrap ${styles.action}`}>
                                        <span className="text-sm font-semibold hidden sm:inline">{doc.actionText}</span>
                                        {doc.type === 'pdf' ? <Eye size={20} /> : <ArrowRight size={20} />}
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Poster Image */}
                {imageUrl && (
                    <div className="lg:w-[380px] flex flex-col items-center pt-4">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-[6px] border-white dark:border-gray-700 bg-gray-100 dark:bg-gray-900 w-full transform rotate-1 hover:rotate-0 transition-transform duration-500">
                            <img
                                src={imageUrl}
                                alt={imageCaption || title}
                                className="w-full h-auto object-cover"
                            />
                        </div>
                        {imageCaption && (
                            <p className="mt-4 text-sm font-semibold text-gray-800 dark:text-gray-200 text-center">
                                {imageCaption}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
