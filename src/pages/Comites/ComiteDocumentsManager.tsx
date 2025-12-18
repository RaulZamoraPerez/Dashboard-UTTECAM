import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";

const API_URL = import.meta.env.VITE_BACKENDURL || '';

interface Documento {
    id: number;
    titulo: string;
    archivo: string;
    activo: boolean;
}

interface Comite {
    id: number;
    slug: string;
    titulo: string;
    descripcion: string;
    activo: boolean;
    documentos?: Documento[];
}

interface Props {
    slug: string;
    pageTitle: string;
}

const ComiteDocumentsManager = ({ slug, pageTitle }: Props) => {
    const [comite, setComite] = useState<Comite | null>(null);
    const [documents, setDocuments] = useState<Documento[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form Data
    const [docForm, setDocForm] = useState({ titulo: '', archivo: null as File | null, activo: true });

    useEffect(() => {
        fetchComiteAndDocuments();
    }, [slug]);

    const fetchComiteAndDocuments = async () => {
        setLoading(true);
        try {
            // Fetch comite by slug. Backend endpoint: GET /api/comites/:slug?admin=true
            const response = await fetch(`${API_URL}/api/comites/${slug}?admin=true`);
            
            if (response.status === 404) {
                // Comite no existe - permitir inicializarlo
                setComite(null);
                setDocuments([]);
            } else if (!response.ok) {
                // Otros errores - también permitir inicializar
                console.warn('Error al obtener comité:', response.status);
                setComite(null);
                setDocuments([]);
            } else {
                const data = await response.json();
                setComite(data);
                setDocuments(data.documentos || []);
            }
        } catch (error) {
            // Error de red - permitir inicializar en lugar de mostrar error
            console.warn('Error de red al cargar comité:', error);
            setComite(null);
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInitializeComite = async () => {
        try {
            const response = await fetch(`${API_URL}/api/comites`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titulo: pageTitle,
                    slug: slug,
                    descripcion: `Documentos del ${pageTitle}`,
                    activo: true
                })
            });
            
            if (!response.ok) throw new Error('Failed to create');
            
            const newComite = await response.json();
            setComite(newComite);
            Swal.fire('Éxito', 'Comité inicializado correctamente', 'success');
        } catch (error) {
            Swal.fire('Error', 'No se pudo inicializar el comité', 'error');
        }
    };

    const handleDeleteDoc = async (id: number) => {
        const result = await Swal.fire({
            title: '¿Eliminar documento?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_URL}/api/comites/documentos/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete');
                
                Swal.fire('Eliminado', 'El documento ha sido eliminado.', 'success');
                fetchComiteAndDocuments();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el documento', 'error');
            }
        }
    };

    const submitDoc = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comite) return;
        
        const formData = new FormData();
        formData.append('comiteId', String(comite.id));
        formData.append('titulo', docForm.titulo);
        formData.append('activo', String(docForm.activo));
        if (docForm.archivo) {
            formData.append('archivo', docForm.archivo);
        } else {
            Swal.fire('Atención', 'Debes seleccionar un archivo', 'warning');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/comites/documentos`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            Swal.fire('Éxito', 'Documento agregado correctamente', 'success');
            setIsModalOpen(false);
            setDocForm({ titulo: '', archivo: null, activo: true });
            fetchComiteAndDocuments();
        } catch (error) {
            Swal.fire('Error', 'Error al subir documento', 'error');
        }
    };

    if (loading) return (
         <div className="flex justify-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
         </div>
    );

    if (!comite) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{pageTitle}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Este comité aún no ha sido inicializado en el sistema.</p>
                <button 
                    onClick={handleInitializeComite}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                    Inicializar Comité
                </button>
            </div>
        );
    }

    return (
        <>
            <PageMeta title={`Gestión - ${pageTitle}`} description={`Administrar documentos para ${pageTitle}`} />
            <PageBreadcrumb pageTitle={pageTitle} />

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm mb-6">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/30 dark:bg-gray-700/30">
                     <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Documentos</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Gestión de archivos para {pageTitle}</p>
                     </div>
                     <button 
                        onClick={() => { setDocForm({ titulo: '', archivo: null, activo: true }); setIsModalOpen(true); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-sm"
                     >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Agregar Documento
                     </button>
                </div>
                
                <div className="p-6">
                    {documents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {documents.map(doc => (
                                <div key={doc.id} className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-all duration-200 relative">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`p-3 rounded-lg ${doc.activo ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}>
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        </div>
                                        <Badge color={doc.activo ? 'success' : 'error'} size="sm">
                                            {doc.activo ? 'Activo' : 'Oculto'}
                                        </Badge>
                                    </div>
                                    
                                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1 line-clamp-2" title={doc.titulo}>{doc.titulo}</h3>
                                    <a 
                                        href={`${API_URL}${doc.archivo}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline mb-4 inline-block"
                                    >
                                        Ver archivo PDF
                                    </a>

                                    <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-end">
                                        <button 
                                            onClick={() => handleDeleteDoc(doc.id)}
                                            className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
                                            title="Eliminar documento"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <p className="text-gray-500 dark:text-gray-400">No hay documentos cargados en este comité.</p>
                            </div>
                    )}
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Agregar Documento</h3>
                             <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <form onSubmit={submitDoc}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Título del Documento</label>
                                    <input 
                                        autoFocus 
                                        type="text" 
                                        className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" 
                                        placeholder="Ej. Reglamento interno 2024"
                                        required 
                                        value={docForm.titulo} 
                                        onChange={e => setDocForm({...docForm, titulo: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Archivo PDF</label>
                                    <input 
                                        type="file" 
                                        accept=".pdf"
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" 
                                        required 
                                        onChange={e => setDocForm({...docForm, archivo: e.target.files ? e.target.files[0] : null})} 
                                    />
                                </div>
                                <div className="flex items-center pt-2">
                                     <label className="flex items-center cursor-pointer select-none">
                                        <div className="relative">
                                            <input type="checkbox" className="sr-only" checked={docForm.activo} onChange={e => setDocForm({...docForm, activo: e.target.checked})} />
                                            <div className={`block w-10 h-6 rounded-full transition-colors ${docForm.activo ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${docForm.activo ? 'transform translate-x-4' : ''}`}></div>
                                        </div>
                                        <span className="ml-3 text-sm text-gray-700 font-medium">Visible al público</span>
                                     </label>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition">Subir Documento</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ComiteDocumentsManager;
