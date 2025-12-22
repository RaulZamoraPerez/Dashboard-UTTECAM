import { useState, useEffect } from 'react';
import {
    Plus,
    Edit,
    Save,
    RotateCcw,
    Check,
    Trash2,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import becasService from '../../services/becasService';

// Componentes de Secciones
import { HeaderSection } from './sections/HeaderSection';
import { BannerSection } from './sections/BannerSection';
import { ConvocatoriaSection } from './sections/ConvocatoriaSection';
import { AvisosSection } from './sections/AvisosSection'; // Reverted from NoticesSection
import { GestorDocumentosSection } from './sections/GestorDocumentosSection';
import { FooterSection } from './sections/FooterSection';
//import { NoticesSection } from './sections/NoticesSection';


// Modales
import { ModalEditarHeader } from '../modals/becas/ModalEditarHeader';
import { ModalEditarBanner } from '../modals/becas/ModalEditarBanner';
import { ModalEditarConvocatoria } from '../modals/becas/ModalEditarConvocatoria';
import { ModalEditarAvisos } from '../modals/becas/ModalEditarAvisos'; // Reverted from ModalEditarNotices
import { ModalEditarFooter } from '../modals/becas/ModalEditarFooter';
import ModalNuevaSeccion from '../modals/becas/ModalNuevaSeccion';

// Tipos unificados
export type SectionType = 'header' | 'banner' | 'convocatoria' | 'avisos' | 'footer' | 'repository';

export interface BaseSection {
    id: number;
    type: SectionType;
    title: string;
    [key: string]: any; // Para propiedades dinámicas que vienen de 'data'
}

// ============================================
// 📊 COMPONENTE PRINCIPAL
// ============================================
export const BecasDashboard = () => {
    const [sections, setSections] = useState<BaseSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estado para el modo de edición (Organizar estructura)
    const [isEditing, setIsEditing] = useState(false);

    const [modalState, setModalState] = useState<{
        type: SectionType | 'create' | null;
        section?: BaseSection;
    }>({ type: null });

    // Cargar secciones al iniciar
    useEffect(() => {
        loadSections();
    }, []);

    const loadSections = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await becasService.getAllSections();

            // Convertir formato del backend (data JSON) al formato plano que usan los componentes
            const supportedTypes = ['header', 'banner', 'convocatoria', 'avisos', 'footer', 'repository'];

            const formattedSections = data
                .filter(s => supportedTypes.includes(s.type))
                .map(s => ({
                    id: s.id,
                    type: s.type as SectionType,
                    title: s.title,
                    data: s.data,
                    ...s.data, // Esparcir el contenido de 'data' en el nivel superior
                    // Preservar documentos para convocatoria
                    documents: (s.data?.documents || [])
                }));

            setSections(formattedSections);
        } catch (err) {
            console.error('Error al cargar secciones:', err);
            setError('No se pudieron cargar las secciones. Por favor intente más tarde.');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // 🎮 ACCIONES
    // ============================================

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Mover sección
    const moveSection = (id: number, direction: 'up' | 'down') => {
        const index = sections.findIndex(s => s.id === id);
        if (index === -1) return;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= sections.length) return;

        // Optimistic UI update
        const newSections = [...sections];
        [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
        setSections(newSections);
        setHasUnsavedChanges(true);
    };

    // Guardar nuevo orden
    const saveOrder = async () => {
        try {
            setLoading(true);
            // Enviar nuevo orden al backend
            const reorderData = sections.map((s, idx) => ({
                id: s.id,
                order: idx + 1
            }));
            await becasService.reorderSections(reorderData);
            setHasUnsavedChanges(false);
            setIsEditing(false); // Salir del modo edición al guardar
            // Recargar para asegurar consistencia
            await loadSections();
        } catch (err) {
            console.error('Error al guardar orden:', err);
            setError('Error al guardar el orden de las secciones');
            setLoading(false);
        }
    };

    // Cancelar edición (revertir cambios)
    const cancelEditing = () => {
        if (hasUnsavedChanges) {
            if (confirm('Tienes cambios sin guardar en el orden. ¿Deseas descartarlos?')) {
                loadSections(); // Recargar para revertir
                setHasUnsavedChanges(false);
                setIsEditing(false);
            }
        } else {
            setIsEditing(false);
        }
    };

    // Eliminar sección
    const deleteSection = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar esta sección? Esta acción no se puede deshacer.')) return;

        try {
            await becasService.deleteSection(id);
            setSections(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error('Error al eliminar:', err);
            alert('Error al eliminar la sección');
        }
    };

    // Iniciar creación de nueva sección (o crear directamente si viene data)
    const startCreateSection = async (type: SectionType, data?: any) => {
        // Si vienen datos completos (wizard mode), crear directamente
        if (data) {
            try {
                setLoading(true);
                const sectionData = {
                    title: data.title,
                    type: type,
                    data: data.data // La estructura ya viene correcta del modal
                };

                await becasService.createSection(sectionData);
                await loadSections(); // Recargar lista
                setModalState({ type: null }); // Cerrar modales
            } catch (err) {
                console.error('Error al crear sección:', err);
                setError('Error al crear la sección');
            } finally {
                setLoading(false);
            }
            return;
        }

        // ... Flujo estándar (abrir modal de edición) ...
        // Datos iniciales por defecto según el tipo
        let defaultData: any = {};
        let defaultTitle = 'Nueva Sección';

        switch (type) {
            case 'header':
                defaultTitle = 'Título de Convocatoria';
                defaultData = { description: 'Descripción de la convocatoria...' };
                break;
            case 'banner':
                defaultTitle = 'Nueva Sección Destacada';
                defaultData = {
                    subtitle: 'NUEVO',
                    description: 'Descripción de la sección destacada...',
                    buttons: [{ text: 'Ver más', url: '#', type: 'primary', icon: 'eye' }]
                };
                break;
            case 'convocatoria':
                defaultTitle = 'Convocatoria Anterior';
                defaultData = {
                    badge: 'PERIODO ANTERIOR',
                    description: 'Descripción del periodo anterior...',
                    documents: []
                };
                break;
            case 'avisos':
                defaultTitle = 'Avisos y Calendarios';
                defaultData = {
                    cards: []
                };
                break;
            case 'footer':
                defaultTitle = 'Footer de Contacto';
                defaultData = {
                    title: '¿Tienes dudas?',
                    subtitle: 'Estamos aquí para ayudarte en tu proceso',
                    email: 'serviciosestudiantiles@uttecam.edu.mx',
                    phone: '249 422 3300 Ext. 161',
                    links: []
                };
                break;
        }

        // Crear objeto temporal sin ID (o ID 0)
        const newSectionPlaceholder: BaseSection = {
            id: 0, // 0 indica que es nueva
            type,
            title: defaultTitle,
            ...defaultData,
            // Asegurar que data también esté presente para compatibilidad
            data: defaultData
        };

        // Cerrar modal de selección y abrir el de edición
        setModalState({ type, section: newSectionPlaceholder });
    };

    // Actualizar sección (callback para los modales)
    const handleUpdateSection = async () => {
        await loadSections();
        setModalState({ type: null });
    };

    // Helper para renderizar la sección correcta
    const renderSection = (section: BaseSection) => {
        const props = {
            id: section.id,
            title: section.title
        };

        switch (section.type) {
            case 'header':
                return (
                    <HeaderSection
                        {...props}
                        {...(section.data || {})}
                        onEdit={() => setModalState({ type: 'header', section })}
                    />
                );
            case 'banner':
                return (
                    <BannerSection
                        {...props}
                        {...(section.data || {})}
                        onEdit={() => setModalState({ type: 'banner', section })}
                    />
                );
            case 'convocatoria':
                return (
                    <ConvocatoriaSection
                        {...props}
                        {...(section.data || {})}
                        onEdit={() => setModalState({ type: 'convocatoria', section })}
                    />
                );
            case 'avisos':
                return (
                    <AvisosSection
                        id={section.id}
                        cards={section.data?.cards || []}
                        onEdit={() => setModalState({ type: 'avisos', section })}
                    />
                );
            case 'footer':
                return (
                    <FooterSection
                        id={section.id}
                        data={section.data}
                        onEdit={() => setModalState({ type: 'footer', section })}
                    />
                );
            case 'repository':
                return (
                    <GestorDocumentosSection
                        id={section.id}
                        title={section.title}
                        data={section.data}
                    />
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a9782] mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Cargando becas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a9782]/5 to-gray-50 dark:from-[#0a9782]/10 dark:to-gray-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded shadow-sm">
                        <div className="flex">
                            <div className="flex-shrink-0">⚠️</div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                                <button
                                    onClick={loadSections}
                                    className="mt-2 text-sm font-medium text-red-700 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 underline"
                                >
                                    Reintentar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header Dashboard */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-b-4 border-[#0a9782]">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-[#0a9782] dark:text-[#0a9782]">Gestión de Becas</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">Administra las convocatorias y documentos</p>
                        </div>
                        <div className="flex gap-3">
                            {/* Botones de Edición de Estructura */}
                            {isEditing ? (
                                <>
                                    {hasUnsavedChanges && (
                                        <button
                                            onClick={saveOrder}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2 animate-pulse"
                                        >
                                            <Save size={20} />
                                            Guardar Orden
                                        </button>
                                    )}
                                    <button
                                        onClick={cancelEditing}
                                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2"
                                    >
                                        <Check size={20} />
                                        Listo
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 text-[#0a9782] dark:text-[#0a9782] border border-[#0a9782]/30 hover:bg-[#0a9782]/10 dark:hover:bg-[#0a9782]/20 rounded-lg transition flex items-center gap-2"
                                >
                                    <Edit size={18} />
                                    Organizar
                                </button>
                            )}

                            <div className="w-px h-10 bg-gray-200 dark:bg-gray-700 mx-2"></div>

                            <button
                                onClick={loadSections}
                                className="px-4 py-2 text-[#0a9782] dark:text-[#0a9782] hover:bg-[#0a9782]/10 dark:hover:bg-[#0a9782]/20 rounded-lg transition flex items-center gap-2"
                                title="Recargar datos"
                            >
                                <RotateCcw size={20} />
                            </button>
                            <button
                                onClick={() => setModalState({ type: 'create' })}
                                className="px-6 py-3 bg-[#0a9782] text-white rounded-lg font-semibold hover:bg-[#088c75] transition flex items-center gap-2 shadow-lg hover:shadow-xl"
                            >
                                <Plus size={20} />
                                Nueva Sección
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lista de Secciones */}
                <div className={`space-y-8 ${isEditing ? 'pl-12' : ''} transition-all duration-300`}>
                    {sections.length === 0 && !error && (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400 text-lg">No hay secciones creadas.</p>
                            <button
                                onClick={() => setModalState({ type: 'create' })}
                                className="mt-4 text-[#0a9782] font-medium hover:underline"
                            >
                                Crear la primera sección
                            </button>
                        </div>
                    )}

                    {sections.map((section, idx) => (
                        <div key={section.id} className={`relative group transition-all duration-300 ${isEditing ? 'scale-[0.99] opacity-90 hover:opacity-100 hover:scale-100' : ''}`}>

                            {/* Controles de Orden (Solo visibles en modo edición) */}
                            {isEditing && (
                                <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-10">
                                    <button
                                        onClick={() => moveSection(section.id, 'up')}
                                        disabled={idx === 0}
                                        className={`p-2 rounded-full shadow-md transition ${idx === 0 ? 'bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-[#0a9782] hover:bg-[#0a9782]/10 dark:hover:bg-[#0a9782]/20'
                                            }`}
                                        title="Mover arriba"
                                    >
                                        <ArrowUp size={16} />
                                    </button>
                                    <div className="text-center font-bold text-gray-400 text-sm">{idx + 1}</div>
                                    <button
                                        onClick={() => moveSection(section.id, 'down')}
                                        disabled={idx === sections.length - 1}
                                        className={`p-2 rounded-full shadow-md transition ${idx === sections.length - 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-[#0a9782] hover:bg-[#0a9782]/10 dark:hover:bg-[#0a9782]/20'
                                            }`}
                                        title="Mover abajo"
                                    >
                                        <ArrowDown size={16} />
                                    </button>
                                </div>
                            )}

                            {/* Botón Eliminar (Solo visible en modo edición) */}
                            {isEditing && (
                                <div className="absolute -right-4 -top-4 z-20">
                                    <button
                                        onClick={() => deleteSection(section.id)}
                                        className="p-2 bg-white dark:bg-gray-800 text-red-500 rounded-full shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 transition border border-red-100 dark:border-red-900/30"
                                        title="Eliminar sección"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )}

                            {/* Contenido de la Sección */}
                            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border ${isEditing ? 'border-[#0a9782]/30 border-dashed' : 'border-gray-100 dark:border-gray-700'}`}>
                                {renderSection(section)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ============ MODALES ============ */}

            {/* Modal Nueva Sección */}
            {modalState.type === 'create' && (
                <ModalNuevaSeccion
                    isOpen={true}
                    onClose={() => setModalState({ type: null })}
                    onCreate={startCreateSection}
                />
            )}

            {/* Modales de Edición */}
            {modalState.type === 'header' && modalState.section && (
                <ModalEditarHeader
                    isOpen={true}
                    onClose={() => setModalState({ type: null })}
                    section={modalState.section}
                    onSave={handleUpdateSection}
                />
            )}

            {modalState.type === 'banner' && modalState.section && (
                <ModalEditarBanner
                    isOpen={true}
                    onClose={() => setModalState({ type: null })}
                    section={modalState.section as any}
                    onSave={handleUpdateSection}
                />
            )}

            {modalState.type === 'convocatoria' && modalState.section && (
                <ModalEditarConvocatoria
                    isOpen={true}
                    onClose={() => setModalState({ type: null })}
                    section={modalState.section as any}
                    onSave={handleUpdateSection}
                />
            )}

            {modalState.type === 'avisos' && modalState.section && (
                <ModalEditarAvisos
                    isOpen={true}
                    onClose={() => setModalState({ type: null })}
                    section={modalState.section as any}
                    onSave={handleUpdateSection}
                />
            )}

            {modalState.type === 'footer' && modalState.section && (
                <ModalEditarFooter
                    isOpen={true}
                    onClose={() => setModalState({ type: null })}
                    section={modalState.section as any}
                    onSave={handleUpdateSection}
                />
            )}
        </div>
    );
};

export default BecasDashboard;
