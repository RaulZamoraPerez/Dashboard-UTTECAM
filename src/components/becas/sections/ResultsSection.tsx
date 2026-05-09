import {
    Download,
    FileText,
    CheckCircle2,
    Bell,
    Check,
    Pin,
    TriangleAlert,
    Edit,
    Info
} from 'lucide-react';

interface DocumentItem {
    title: string;
    subtitle: string;
    url: string;
}

interface ResultsSectionProps {
    section: {
        id: number;
        title: string;
        data?: {
            badge?: string;
            mainTitle?: string;
            description?: string;
            beneficiadosText?: string;
            beneficiadosCard?: {
                title: string;
                content: string;
                note?: string;
            };
            documents?: DocumentItem[];
            indicacionesBeneficiados?: string[];
            indicacionesNoBeneficiados?: string[];
            infobox?: string;
            importantNote?: string;
        };
    };
    onEdit: () => void;
}

const getFullUrl = (url: string) => {
    if (!url) return '#';
    if (url.startsWith('http') || url.startsWith('https')) return url;
    if (url.startsWith('/uploads/')) {
        return `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}${url}`;
    }
    return url;
};

export const ResultsSection = ({ section, onEdit }: ResultsSectionProps) => {
    // Extraemos la información de section y section.data
    const title = section.title;
    const data = section.data || {};
    
    const {
        mainTitle,
        badge,
        beneficiadosText,
        beneficiadosCard,
        documents = [],
        indicacionesBeneficiados = [],
        indicacionesNoBeneficiados = [],
        infobox,
        importantNote,
    } = data;

    const renderTextWithBold = (text: string) => {
        if (!text) return null;
        const parts = text.split(/(\*[^*]+\*)/g);
        return (
            <>
                {parts.map((part, index) => {
                    if (part.startsWith('*') && part.endsWith('*')) {
                        const content = part.slice(1, -1);
                        return (
                            <strong key={index} className="font-bold text-gray-900">
                                {content}
                            </strong>
                        );
                    }
                    return <span key={index}>{part}</span>;
                })}
            </>
        );
    };

    return (
        <section className="py-16 px-4 max-w-6xl mx-auto font-sans animate-in fade-in duration-1000 relative group">
            {/* Botón de Edición flotante - Exclusivo del Dashboard */}
            <div className="absolute top-4 right-4 z-20">
                <button
                    onClick={onEdit}
                    className="p-3 bg-white text-slate-400 hover:text-[#00a499] hover:bg-green-50 rounded-2xl border border-slate-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 group/btn"
                >
                    <Edit size={20} className="group-hover/btn:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest pr-1">Configurar Diseño</span>
                </button>
            </div>

            {/* Header del Componente - Estilo Oficial UTTECAM */}
            <div className="flex items-center gap-6 mb-10">
                <div className="flex items-center gap-4 flex-1 text-left">
                    {/* Barra de acento vertical */}
                    <div className="w-1.5 h-10 bg-[#00a499] rounded-full hidden md:block" />

                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-green-50 rounded-xl text-[#00a499]">
                            <Bell size={28} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            {badge && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-green-100 text-green-700 uppercase tracking-widest mb-1 w-fit">
                                    {badge}
                                </span>
                            )}
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 uppercase tracking-tight leading-tight">
                                {mainTitle || "RESULTADOS"}
                            </h2>
                            {title && (
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                                    {title}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenedor Principal - Estilo Oficial UTTECAM */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 md:p-12 space-y-12 text-left">

                {/* Intro text */}
                {beneficiadosText && (
                    <p className="text-slate-600 text-lg leading-relaxed max-w-4xl">
                        {renderTextWithBold(beneficiadosText)}
                    </p>
                )}

                {/* Grid Superior: Beneficiados + Documento */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Tarjeta Beneficiados */}
                    <div className="bg-slate-50/50 rounded-[2rem] p-10 border border-gray-100 flex flex-col h-full transition-all hover:shadow-lg hover:border-green-100 shadow-sm duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100/50 rounded-lg text-green-600">
                                    <Check size={24} strokeWidth={3} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800">
                                    {beneficiadosCard?.title || "Beneficiados"}
                                </h3>
                            </div>
                        </div>

                        {/* Badge de Información - Estilo Green */}
                        {beneficiadosCard?.note && (
                            <div className="mb-6 inline-flex items-center gap-2 self-start px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
                                <Info size={16} />
                                {renderTextWithBold(beneficiadosCard.note)}
                            </div>
                        )}

                        <div className="text-slate-600 text-base leading-relaxed flex-grow">
                            {beneficiadosCard?.content ? renderTextWithBold(beneficiadosCard.content) : "Las y los estudiantes beneficiados recibirán un correo electrónico con las indicaciones a seguir."}
                        </div>
                    </div>

                    {/* Tarjeta Documento / Descarga */}
                    <div className="bg-slate-50/50 rounded-[2rem] p-10 border border-gray-100 flex flex-col items-center text-center justify-center space-y-6 h-full transition-all hover:shadow-lg hover:border-green-100 shadow-sm duration-500">
                        {documents.length > 0 ? (
                            <>
                                <div className="relative">
                                    <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                                        <FileText size={40} strokeWidth={1.5} />
                                    </div>
                                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-lg">PDF</span>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-800 mb-1">{documents[0].title}</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{documents[0].subtitle || "Documento Oficial"}</p>
                                </div>
                                <a
                                    href={getFullUrl(documents[0].url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-[#00a499] hover:bg-[#087a69] text-white py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-sm shadow-md transition-all active:scale-[0.98]"
                                >
                                    <Download size={18} strokeWidth={2.5} />
                                    DESCARGAR RESULTADOS
                                </a>
                            </>
                        ) : (
                            <div className="text-slate-300 flex flex-col items-center gap-4">
                                <FileText size={56} className="opacity-20" />
                                <p className="text-xs font-bold uppercase tracking-widest">Sin documento adjunto</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid Inferior: Indicaciones + notas embebidas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-slate-100">
                    {/* Columna Izquierda: Indicaciones Beneficiados + Nota Importante */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Pin className="text-orange-500" size={22} fill="currentColor" />
                            <h4 className="text-lg font-bold text-slate-800">
                                Indicaciones para beneficiados:
                            </h4>
                        </div>
                        <ul className="space-y-3">
                            {indicacionesBeneficiados.map((step, i) => (
                                <li key={i} className="flex gap-3 items-start">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                    <div className="text-slate-600 text-sm leading-relaxed">
                                        {renderTextWithBold(step)}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {/* Nota Importante dentro de columna izquierda */}
                        {importantNote && (
                            <div className="bg-red-50 text-red-700 rounded-xl p-4 border border-red-100 flex items-start gap-3 mt-4">
                                <TriangleAlert size={18} className="text-red-500 shrink-0 mt-0.5" />
                                <div className="text-xs font-semibold leading-relaxed italic">
                                    {renderTextWithBold(importantNote)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Columna Derecha: Indicaciones No Beneficiados + Para mayores informes */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Pin className="text-slate-400" size={22} fill="currentColor" />
                            <h4 className="text-lg font-bold text-slate-800">
                                Indicaciones para no beneficiados:
                            </h4>
                        </div>
                        <ul className="space-y-3">
                            {indicacionesNoBeneficiados.map((step, i) => (
                                <li key={i} className="flex gap-3 items-start">
                                    <div className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                                    <div className="text-slate-600 text-sm leading-relaxed">
                                        {renderTextWithBold(step)}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {/* Para mayores informes dentro de columna derecha */}
                        {infobox && (
                            <div className="mt-2 rounded-xl border border-[#00a499]/20 bg-[#f0faf8] p-4">
                                <div className="flex items-center gap-2 mb-2 text-slate-800">
                                    <Info size={16} className="text-[#00a499]" />
                                    <h5 className="font-bold text-sm text-[#00a499]">Para mayores informes</h5>
                                </div>
                                <div className="text-slate-600 text-xs leading-relaxed">
                                    {renderTextWithBold(infobox)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ResultsSection;
