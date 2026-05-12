import React, { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, Upload, Loader2, Layout, Type, ZoomIn } from 'lucide-react';
import becasService from '../../../services/becasService';
import { toastError, toastSuccess } from '../../../utils/alert';

export interface InfographicItem {
    title: string;
    subtitle?: string;
    imageUrl: string;
}

export interface InfographicsData {
    mainTitle?: string;
    title: string;
    items: InfographicItem[];
}

interface InfographicsFormProps {
    initialData: InfographicsData;
    onChange: (data: InfographicsData) => void;
}

export const InfographicsForm = ({ initialData, onChange }: InfographicsFormProps) => {
    const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

    const handleUpdate = (field: keyof InfographicsData, value: any) => {
        onChange({ ...initialData, [field]: value });
    };

    const addItem = () => {
        const newItems = [...(initialData.items || []), { title: 'Nuevo Aviso', subtitle: 'Información institucional', imageUrl: '' }];
        handleUpdate('items', newItems);
    };

    const removeItem = (index: number) => {
        const newItems = (initialData.items || []).filter((_, i) => i !== index);
        handleUpdate('items', newItems);
    };

    const updateItem = (index: number, field: keyof InfographicItem, value: string) => {
        const newItems = [...(initialData.items || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        handleUpdate('items', newItems);
    };

    const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar que sea imagen
        if (!file.type.startsWith('image/')) {
            toastError('El archivo debe ser una imagen');
            return;
        }

        try {
            setUploadingIdx(index);
            const response = await becasService.uploadBannerFile(file);
            updateItem(index, 'imageUrl', response.url);
            toastSuccess('Imagen subida correctamente');
        } catch (error) {
            console.error('Error uploading image:', error);
            toastError('Error al subir la imagen');
        } finally {
            setUploadingIdx(null);
            if (e.target) e.target.value = '';
        }
    };

    const handleLoadStructure = () => {
        const structure: InfographicsData = {
            title: 'AVISOS E INFORMACIÓN RELEVANTE',
            items: [
                { 
                    title: 'Beca de Continuidad', 
                    subtitle: 'Convocatoria 2024 - Registro Abierto', 
                    imageUrl: '' 
                },
                { 
                    title: 'Resultados Académicos', 
                    subtitle: 'Consulta el listado de beneficiarios', 
                    imageUrl: '' 
                },
                { 
                    title: 'Trámite de Referencia', 
                    subtitle: 'Guía paso a paso para el pago', 
                    imageUrl: '' 
                },
                { 
                    title: 'Seguro Facultativo', 
                    subtitle: 'Requisito indispensable para la beca', 
                    imageUrl: '' 
                }
            ]
        };
        onChange(structure);
        toastSuccess('Estructura sugerida cargada. ¡No olvides subir las imágenes!');
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Botón de Estructura Rápida */}
            <div className="flex justify-end">
                <button
                    onClick={handleLoadStructure}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-95"
                >
                    <Layout size={18} />
                    Generar Estructura Sugerida
                </button>
            </div>

            {/* Cabecera Principal */}
            <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Type size={20} className="text-blue-500" />
                    Configuración de Galería
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Título de la Sección (Principal)</label>
                        <input
                            type="text"
                            value={initialData.mainTitle || ''}
                            onChange={(e) => handleUpdate('mainTitle', e.target.value)}
                            placeholder="Ej: AVISOS IMPORTANTES"
                            className="w-full p-3 bg-white dark:bg-gray-800 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold shadow-sm transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Título de Periodo / Etiqueta (Superior)</label>
                        <input
                            type="text"
                            value={initialData.title}
                            onChange={(e) => handleUpdate('title', e.target.value)}
                            placeholder="Ej: MAYO - AGOSTO 2026"
                            className="w-full p-3 bg-white dark:bg-gray-800 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold shadow-sm transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Listado de Items */}
            <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ImageIcon size={20} className="text-emerald-500" />
                        Infografías / Imágenes
                    </h3>
                    <button
                        onClick={addItem}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        Agregar Tarjeta
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {initialData.items?.map((item, idx) => (
                        <div key={idx} className="group bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 relative">
                            <button
                                onClick={() => removeItem(idx)}
                                className="absolute -top-3 -right-3 p-2 bg-white dark:bg-gray-800 text-red-500 rounded-full shadow-lg border border-red-50 dark:border-red-900/30 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 z-10"
                            >
                                <Trash2 size={16} />
                            </button>

                            <div className="flex flex-col gap-5">
                                {/* Preview / Upload */}
                                <div className="relative aspect-video rounded-xl bg-gray-50 dark:bg-gray-900/40 border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden group/img">
                                    {item.imageUrl ? (
                                        <>
                                            <img 
                                                src={`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}${item.imageUrl}`} 
                                                alt={item.title} 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}${item.imageUrl}`, '_blank')}
                                                    className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-all shadow-lg transform translate-y-2 group-hover/img:translate-y-0"
                                                    title="Ver imagen completa"
                                                >
                                                    <ZoomIn size={18} />
                                                </button>
                                                <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-xl text-xs font-bold shadow-lg transform translate-y-2 group-hover/img:translate-y-0 transition-all">
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        onChange={(e) => handleFileUpload(idx, e)}
                                                        accept="image/*"
                                                    />
                                                    Cambiar Imagen
                                                </label>
                                            </div>
                                        </>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900/60 transition-colors">
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(idx, e)}
                                                accept="image/*"
                                            />
                                            {uploadingIdx === idx ? (
                                                <Loader2 size={32} className="text-blue-500 animate-spin" />
                                            ) : (
                                                <>
                                                    <Upload size={32} className="text-gray-300 mb-2" />
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subir Imagen</span>
                                                </>
                                            )}
                                        </label>
                                    )}
                                </div>

                                {/* Text Fields */}
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Título de Tarjeta</label>
                                        <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) => updateItem(idx, 'title', e.target.value)}
                                            placeholder="Ej: Aviso Beca 50%"
                                            className="w-full p-2.5 bg-gray-50 dark:bg-gray-900/40 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-sm font-bold transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Subtítulo / Bajada</label>
                                        <input
                                            type="text"
                                            value={item.subtitle}
                                            onChange={(e) => updateItem(idx, 'subtitle', e.target.value)}
                                            placeholder="Ej: Instrucciones específicas"
                                            className="w-full p-2.5 bg-gray-50 dark:bg-gray-900/40 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-sm transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Placeholder si no hay items */}
                    {(!initialData.items || initialData.items.length === 0) && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-900/20 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                            <ImageIcon size={48} className="opacity-20 mb-4" />
                            <p className="font-bold text-sm">No has agregado ninguna tarjeta aún</p>
                            <p className="text-xs">Usa el botón superior para agregar una nueva infografía</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
