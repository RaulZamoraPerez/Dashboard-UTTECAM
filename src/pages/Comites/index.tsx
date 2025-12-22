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
    comiteId: number;
}

interface Comite {
    id: number;
    titulo: string;
    descripcion: string;
    activo: boolean;
    documentos?: Documento[];
}

const Comites = () => {
    const [comites, setComites] = useState<Comite[]>([]);
    const [selectedComite, setSelectedComite] = useState<Comite | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Modal States
    const [isComiteModalOpen, setIsComiteModalOpen] = useState(false);
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    
    // Form Data
    const [comiteForm, setComiteForm] = useState({ id: 0, titulo: '', descripcion: '', activo: true });
    const [docForm, setDocForm] = useState({ titulo: '', archivo: null as File | null, activo: true });

    useEffect(() => {
        fetchComites();
    }, []);

    const fetchComites = async () => {
        try {
            const response = await fetch(`${API_URL}/api/comites?admin=true`);
            if (!response.ok) {
                // Si es 404, simplemente no hay datos
                if (response.status === 404) {
                    setComites([]);
                    setLoading(false);
                    return;
                }
                throw new Error('Error fetching comites');
            }
            const data = await response.json();
            setComites(Array.isArray(data) ? data : []);
            
            // Update selected comite if exists
            if (selectedComite) {
                const updated = data.find((c: Comite) => c.id === selectedComite.id);
                if (updated) setSelectedComite(updated);
            }
            setLoading(false);
        } catch (error) {
            console.warn('Error al cargar comités:', error);
            setComites([]);
            setLoading(false);
        }
    };

    // --- COMITE ACTIONS ---

    const handleEditComite = (comite: Comite) => {
        setComiteForm({ 
            id: comite.id, 
            titulo: comite.titulo, 
            descripcion: comite.descripcion || '', 
            activo: comite.activo 
        });
        setIsComiteModalOpen(true);
    };

    const handleDeleteComite = async (id: number) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Se eliminarán todos los documentos asociados",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_URL}/api/comites/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete');
                
                Swal.fire('Eliminado', 'El comité ha sido eliminado.', 'success');
                if (selectedComite?.id === id) setSelectedComite(null);
                fetchComites();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el comité', 'error');
            }
        }
    };

    const submitComite = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = comiteForm.id ? 'PUT' : 'POST';
            const url = comiteForm.id 
                ? `${API_URL}/api/comites/${comiteForm.id}`
                : `${API_URL}/api/comites`;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(comiteForm)
            });

            if (!response.ok) throw new Error('Operation failed');

            Swal.fire('Éxito', `Comité ${comiteForm.id ? 'actualizado' : 'creado'} correctamente`, 'success');
            setIsComiteModalOpen(false);
            fetchComites();
            setComiteForm({ id: 0, titulo: '', descripcion: '', activo: true });
        } catch (error) {
            Swal.fire('Error', 'Hubo un problema al guardar', 'error');
        }
    };

    // --- DOCUMENT ACTIONS ---

    const handleDeleteDoc = async (id: number) => {
         const result = await Swal.fire({
            title: '¿Eliminar documento?',
            text: "No podrás revertir esto",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_URL}/api/comites/documentos/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete');
                
                Swal.fire('Eliminado', 'El documento ha sido eliminado.', 'success');
                fetchComites(); // Refresh to update list
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el documento', 'error');
            }
        }
    };

    const submitDoc = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedComite) return;
        
        const formData = new FormData();
        formData.append('comiteId', String(selectedComite.id));
        formData.append('titulo', docForm.titulo);
        formData.append('activo', String(docForm.activo));
        if (docForm.archivo) {
            formData.append('archivo', docForm.archivo);
        } else {
            Swal.fire('Error', 'Debes seleccionar un archivo', 'warning');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/comites/documentos`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            Swal.fire('Éxito', 'Documento agregado correctamente', 'success');
            setIsDocModalOpen(false);
            setDocForm({ titulo: '', archivo: null, activo: true });
            fetchComites();
        } catch (error) {
            Swal.fire('Error', 'Error al subir documento', 'error');
        }
    };


    if (loading) return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;

    return (
        <>
            <PageMeta title="Gestión de Comités" description="Administra comités y sus documentos" />
            <PageBreadcrumb pageTitle="Comités y Documentos" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
                {/* LISTA DE COMITÉS (Left Panel) */}
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/50">
                        <h3 className="font-bold text-gray-800 dark:text-white">Comités</h3>
                        <button 
                            onClick={() => { setComiteForm({ id: 0, titulo: '', descripcion: '', activo: true }); setIsComiteModalOpen(true); }}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition"
                        >
                            + Nuevo
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {comites.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
                                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-blue-400 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Sin comités</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Crea tu primer comité para comenzar</p>
                                <button 
                                    onClick={() => { setComiteForm({ id: 0, titulo: '', descripcion: '', activo: true }); setIsComiteModalOpen(true); }}
                                    className="text-blue-600 font-medium text-sm hover:underline"
                                >
                                    + Crear comité
                                </button>
                            </div>
                        ) : comites.map(comite => (
                            <div 
                                key={comite.id}
                                onClick={() => setSelectedComite(comite)}
                                className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 group relative
                                    ${selectedComite?.id === comite.id 
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm ring-1 ring-blue-100 dark:ring-blue-900/50' 
                                        : 'bg-white dark:bg-gray-800 border-transparent dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-100 dark:hover:border-gray-600'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <h4 className={`font-semibold ${selectedComite?.id === comite.id ? 'text-blue-800 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'}`}>{comite.titulo}</h4>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleEditComite(comite); }}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-white"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteComite(comite.id); }}
                                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-white"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{comite.descripcion}</p>
                                <div className="mt-2 flex justify-between items-center">
                                    <Badge size="sm" color={comite.activo ? 'success' : 'error'}>{comite.activo ? 'Activo' : 'Inactivo'}</Badge>
                                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{comite.documentos?.length || 0} Docs</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* DETALLE Y DOCUMENTOS (Right Panel) */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full">
                    {selectedComite ? (
                        <>
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-gray-50/30 dark:bg-gray-700/30">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{selectedComite.titulo}</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedComite.descripcion}</p>
                                </div>
                                <button
                                    onClick={() => { setDocForm({ titulo: '', archivo: null, activo: true }); setIsDocModalOpen(true); }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                    Agregar Documento
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/10">
                                {selectedComite.documentos && selectedComite.documentos.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedComite.documentos.map(doc => (
                                            <div key={doc.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between group">
                                                <div className="flex items-start gap-3 overflow-hidden">
                                                    <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-2.5 rounded-lg shrink-0">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h5 className="font-semibold text-gray-800 dark:text-white text-sm truncate block" title={doc.titulo}>{doc.titulo}</h5>
                                                        <a 
                                                            href={`${API_URL}${doc.archivo}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-blue-500 dark:text-blue-400 hover:underline mt-1 inline-block"
                                                        >
                                                            Ver archivo
                                                        </a>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteDoc(doc.id)}
                                                    className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition opacity-0 group-hover:opacity-100"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-4">
                                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-full">
                                            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        </div>
                                        <p>No hay documentos en este comité</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                         <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-4">
                            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">Selecciona un comité para ver sus documentos</p>
                            <p className="text-sm">O crea uno nuevo desde el panel izquierdo.</p>
                         </div>
                    )}
                </div>
            </div>

            {/* MODAL COMITÉ */}
            {isComiteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">{comiteForm.id ? 'Editar Comité' : 'Nuevo Comité'}</h3>
                        <form onSubmit={submitComite}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Comité</label>
                                    <input autoFocus type="text" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none" required value={comiteForm.titulo} onChange={e => setComiteForm({...comiteForm, titulo: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none" rows={3} value={comiteForm.descripcion} onChange={e => setComiteForm({...comiteForm, descripcion: e.target.value})} />
                                </div>
                                <div className="flex items-center">
                                     <input type="checkbox" id="activeComite" className="w-4 h-4 text-blue-600 rounded" checked={comiteForm.activo} onChange={e => setComiteForm({...comiteForm, activo: e.target.checked})} />
                                     <label htmlFor="activeComite" className="ml-2 text-sm text-gray-700">Activo (Visible al público)</label>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsComiteModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DOCUMENTO */}
            {isDocModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">Agregar Documento</h3>
                        <form onSubmit={submitDoc}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Título del Documento</label>
                                    <input autoFocus type="text" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none" required value={docForm.titulo} onChange={e => setDocForm({...docForm, titulo: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Archivo</label>
                                    <input type="file" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required onChange={e => setDocForm({...docForm, archivo: e.target.files ? e.target.files[0] : null})} />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsDocModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Subir</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Comites;
