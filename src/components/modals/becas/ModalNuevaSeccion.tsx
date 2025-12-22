
import { useState } from 'react';
import {
    X,
    Layout,
    GraduationCap,
    Info,
    ArrowLeft,
    Check,
    Calendar,       // Added
    AlertTriangle,  // Added
    MessageCircle,   // Added
    FolderPlus      // Added
} from 'lucide-react';
import { BannerForm, BannerData } from './BannerForm';
import { ConvocatoriaForm, ConvocatoriaData } from './ConvocatoriaForm';
//import { CreateSectionData } from '../../services/becasService';
import { crearArea } from '../../../services/documentosService';

interface ModalNuevaSeccionProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (type: 'header' | 'banner' | 'convocatoria' | 'avisos' | 'footer' | 'repository', data?: any) => void;
}

const SECTION_TYPES = [
    {
        type: 'header' as const,
        icon: <GraduationCap size={48} />,
        title: 'Encabezado',
        description: 'Título principal con descripción',
        color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600'
    },
    {
        type: 'banner' as const,
        icon: <Layout size={48} />,
        title: 'Banner Destacado',
        description: 'Imagen grande con botones',
        color: 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-600'
    },
    {
        type: 'convocatoria' as const,
        icon: <Calendar size={48} />,
        title: 'Convocatoria Pasada',
        description: 'Tarjeta con documentos y poster',
        color: 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-600'
    },
    {
        type: 'avisos' as const,
        icon: <AlertTriangle size={48} />,
        title: 'Grid de Avisos',
        description: 'Alertas, Posters y Tarjetas informativas',
        color: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-600'
    },
    {
        type: 'footer' as const,
        icon: <MessageCircle size={48} />,
        title: 'Footer de Contacto',
        description: 'Información de contacto y enlaces de interés',
        color: 'bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-600'
    },
    {
        type: 'repository' as const,
        icon: <FolderPlus size={48} />,
        title: 'Repositorio de Documentos',
        description: 'Gestor avanzado de carpetas y archivos',
        color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-600'
    }
];

export const ModalNuevaSeccion = ({ isOpen, onClose, onCreate }: ModalNuevaSeccionProps) => {
    const [hoveredType, setHoveredType] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);

    // Estado para los formularios
    const [bannerData, setBannerData] = useState<BannerData>({
        title: 'Nueva Sección Destacada',
        subtitle: 'Nuevo',
        description: '',
        imageUrl: '',
        footerNote: '',
        buttons: [{ text: 'Ver Cartel', url: '#', type: 'primary', icon: 'eye' }]
    });

    const [convocatoriaData, setConvocatoriaData] = useState<ConvocatoriaData>({
        badge: 'PERIODO ANTERIOR',
        title: 'Convocatoria Anterior',
        description: 'Consulta los documentos del periodo pasado.',
        imageUrl: '',
        imageCaption: '',
        documents: []
    });

    const handleCreate = async () => {
        if (selectedType === 'banner') {
            onCreate('banner', {
                title: bannerData.title,
                data: {
                    subtitle: bannerData.subtitle,
                    description: bannerData.description,
                    imageUrl: bannerData.imageUrl,
                    footerNote: bannerData.footerNote,
                    buttons: bannerData.buttons
                }
            });
        } else if (selectedType === 'convocatoria') {
            onCreate('convocatoria', {
                title: convocatoriaData.title,
                data: {
                    badge: convocatoriaData.badge,
                    description: convocatoriaData.description,
                    imageUrl: convocatoriaData.imageUrl,
                    imageCaption: convocatoriaData.imageCaption,
                    documents: convocatoriaData.documents
                }
            });
        } else if (selectedType === 'repository') {
            try {
                // Generar nombre único con Timestamp para evitar duplicados en BD
                const timestamp = new Date().toLocaleString('es-MX', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/[\/\,\s:]/g, '-');
                const areaName = `Becas - Repositorio (${timestamp})`;

                const newArea = await crearArea(areaName);

                if (newArea && newArea.ID_Area) {
                    onCreate('repository', {
                        title: 'Repositorio de Documentos',
                        data: {
                            areaId: newArea.ID_Area,
                            areaName: newArea.Nombre
                        }
                    });
                } else {
                    alert('Error al crear el área de documentos en el servidor.');
                }
            } catch (error) {
                console.error('Error creating area:', error);
                alert('Ocurrió un error al crear el repositorio. Verifique la conexión.');
            }
        } else {
            onCreate(selectedType as any);
        }
    };

    if (!isOpen) return null;

    // Wizard para Banner
    if (selectedType === 'banner') {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                    <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSelectedType(null)} className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"><ArrowLeft size={20} /></button>
                            <div><h2 className="text-xl font-bold">Configurar Banner</h2><p className="text-sm opacity-90">Personaliza la sección antes de crearla</p></div>
                        </div>
                        <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2 transition"><X size={24} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        <BannerForm initialData={bannerData} onChange={setBannerData} />
                    </div>
                    <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                        <button onClick={() => setSelectedType(null)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">Atrás</button>
                        <button onClick={handleCreate} className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition flex items-center gap-2"><Check size={18} /> Crear Sección</button>
                    </div>
                </div>
            </div>
        );
    }

    // Wizard para Convocatoria
    if (selectedType === 'convocatoria') {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSelectedType(null)} className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"><ArrowLeft size={20} /></button>
                            <div><h2 className="text-xl font-bold">Configurar Convocatoria</h2><p className="text-sm opacity-90">Personaliza la sección del periodo anterior</p></div>
                        </div>
                        <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2 transition"><X size={24} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        <ConvocatoriaForm initialData={convocatoriaData} onChange={setConvocatoriaData} />
                    </div>
                    <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                        <button onClick={() => setSelectedType(null)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">Atrás</button>
                        <button onClick={handleCreate} className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition flex items-center gap-2"><Check size={18} /> Crear Sección</button>
                    </div>
                </div>
            </div>
        );
    }

    // Wizard para Repositorio - CONFIRMATION SCREEN
    if (selectedType === 'repository') {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-4 flex justify-between items-center">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <FolderPlus size={24} /> Nuevo Repositorio
                        </h3>
                        <button onClick={() => setSelectedType(null)} className="text-white/80 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                            <FolderPlus size={32} />
                        </div>
                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Crear Área de Documentos</h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                            Esta acción creará una nueva área en el gestor de documentos y la vinculará a esta sección.
                            <br /><br />
                            Podrás administrar carpetas y archivos inmediatamente.
                        </p>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setSelectedType(null)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreate}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
                            >
                                <Check size={18} /> Confirmar y Crear
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white text-blue-600 w-10 h-10 rounded-full flex items-center justify-center">
                            <X size={24} strokeWidth={3} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Nueva Sección</h2>
                            <p className="text-sm opacity-90">Selecciona el tipo de sección que deseas agregar</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-lg p-2 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content - Grid de opciones */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {SECTION_TYPES.map((section) => (
                            <button
                                key={section.type}
                                onClick={() => {
                                    if (section.type === 'banner' || section.type === 'convocatoria' || section.type === 'repository') {
                                        setSelectedType(section.type);
                                    } else {
                                        onCreate(section.type);
                                    }
                                }}
                                onMouseEnter={() => setHoveredType(section.type)}
                                onMouseLeave={() => setHoveredType(null)}
                                className={`
                                    relative rounded-xl p-6 text-left transition-all duration-200 h-full flex flex-col border-2 ${section.color}
                                    ${hoveredType === section.type ? 'scale-105 shadow-lg' : 'shadow'}
                                `}
                            >
                                {/* Icon grande arriba */}
                                <div className="mb-4">
                                    {section.icon}
                                </div>

                                {/* Título */}
                                <h3 className="text-lg font-bold text-gray-800 mb-2">
                                    {section.title}
                                </h3>

                                {/* Descripción */}
                                <p className="text-sm text-gray-600 flex-grow">
                                    {section.description}
                                </p>

                                {/* Indicador de hover */}

                            </button>
                        ))}
                    </div>

                    {/* Info adicional */}
                    <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4 flex gap-3">
                        <div className="text-blue-600">
                            <Info size={28} />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800 mb-1">Consejo</p>
                            <p className="text-sm text-gray-600">
                                Después de crear la sección, podrás personalizarla completamente. También podrás reordenarla usando las flechas que aparecen al pasar el cursor sobre ella.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t-2 p-4 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalNuevaSeccion;
