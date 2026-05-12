import { useState } from 'react';
import { Edit, Image as ImageIcon, ZoomIn, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { InfographicItem } from '../../modals/becas/InfographicsForm';

interface InfographicsSectionProps {
    id: number;
    mainTitle?: string;
    title: string;
    items: InfographicItem[];
    onEdit?: () => void;
}

export const InfographicsSection = ({ mainTitle, title, items, onEdit }: InfographicsSectionProps) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';

    const getFullUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${baseUrl}${url}`;
    };

    return (
        <section className="py-16 px-4 max-w-6xl mx-auto relative group/section font-sans">
            {/* Botón de Edición flotante - Estilo Oficial */}
            {onEdit && (
                <div className="absolute top-4 right-4 z-20">
                    <button
                        onClick={onEdit}
                        className="p-3 bg-white text-slate-400 hover:text-[#00a499] hover:bg-green-50 rounded-2xl border border-slate-100 shadow-sm opacity-0 group-hover/section:opacity-100 transition-all flex items-center gap-2 group/btn"
                    >
                        <Edit size={20} className="group-hover/btn:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest pr-1">Configurar Galería</span>
                    </button>
                </div>
            )}

            {/* Header del Componente - Estilo Oficial UTTECAM */}
            {mainTitle && (
                <div className="flex items-center gap-6 mb-10">
                    <div className="flex items-center gap-4 flex-1 text-left">
                        {/* Barra de acento vertical */}
                        <div className="w-1.5 h-10 bg-[#00a499] rounded-full hidden md:block" />

                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-green-50 rounded-xl text-[#00a499]">
                                <ImageIcon size={28} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col text-left">
                                {title && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-green-100 text-green-700 uppercase tracking-widest mb-1 w-fit">
                                        {title}
                                    </span>
                                )}
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 uppercase tracking-tight leading-tight">
                                    {mainTitle}
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items && items.length > 0 ? (
                    items.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group h-full flex flex-col bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-3 hover:shadow-2xl transition-all duration-500 cursor-pointer"
                            onClick={() => item.imageUrl && setSelectedImage(getFullUrl(item.imageUrl))}
                        >
                            {/* Image Container */}
                            <div className="relative aspect-[4/5] rounded-[1.8rem] overflow-hidden mb-6 bg-gray-50 border border-gray-50">
                                {item.imageUrl ? (
                                    <>
                                        <img
                                            src={getFullUrl(item.imageUrl)}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                                            <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-white/30 mb-2">
                                                    <ZoomIn size={14} /> Ver Detalle
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                        <ImageIcon size={48} className="mb-2 opacity-20" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Sin Imagen</span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="px-5 pb-5 mt-auto">
                                <h3 className="text-xl font-black text-blue-950 mb-1 group-hover:text-blue-700 transition-colors">
                                    {item.title}
                                </h3>
                                {item.subtitle && (
                                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">
                                        {item.subtitle}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center text-gray-400 border-4 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/50">
                        <ImageIcon size={64} className="opacity-10 mb-4" />
                        <p className="font-black text-lg uppercase tracking-tight text-gray-400">No hay contenido</p>
                        <p className="text-sm font-medium">Usa el botón de edición para configurar esta sección</p>
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-blue-950/95 backdrop-blur-md"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/20 z-[10000]"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X size={28} />
                        </motion.button>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-5xl w-full h-full flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={selectedImage}
                                alt="Vista ampliada"
                                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border-4 border-white/10"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};
