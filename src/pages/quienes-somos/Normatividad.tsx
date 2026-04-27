import  { useEffect, useState, useCallback } from 'react';
import normatividadApi from '../../services/normatividadApiService';

import { 
  Folder, 
  FileText, 
  Plus, 
  Trash2, 
  Edit2, 
  
  Upload, 
  X,
  
  Check,
  Info
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Swal from 'sweetalert2';
import PageMeta from '../../components/common/PageMeta';

const BACKEND = (import.meta.env.VITE_BACKENDURL || '').replace(/\/$/, '');

interface NormDocument {
  id: string;
  titulo: string;
  archivo: string;
  archivoName: string;
}

interface NormCategory {
  id: string;
  titulo: string;
  documentos: NormDocument[];
}

function useNormatividad() {
  const [data, setData] = useState<NormCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await normatividadApi.getAll();
      const mapped = (res || []).map((c: any): NormCategory => ({ 
        id: String(c.id), 
        titulo: c.titulo, 
        documentos: (c.documentos || []).map((d: any): NormDocument => ({ 
          id: String(d.id), 
          titulo: d.titulo, 
          archivo: d.archivo, 
          archivoName: d.archivo_name || d.archivoName 
        })) 
      }));
      setData(mapped);
    } catch (err) {
      console.error('Error cargando normatividad', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, refresh: fetchData, loading };
}

export default function NormatividadPage() {
  const { data, refresh, loading } = useNormatividad();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditDocModalOpen, setIsEditDocModalOpen] = useState(false);
  const [isEditCatModalOpen, setIsEditCatModalOpen] = useState(false);

  // Form states
  const [categoryTitle, setCategoryTitle] = useState('');
  const [editingCategory, setEditingCategory] = useState<{id: string, titulo: string} | null>(null);
  const [editingDoc, setEditingDoc] = useState<{id: string, titulo: string} | null>(null);
  const [newDocFiles, setNewDocFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{current: number, total: number} | null>(null);

  // Selection states
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [multiSelectMode, setMultiSelectMode] = useState(false);

  useEffect(() => {
    if (!selectedCategory && data.length > 0) {
      setSelectedCategory(data[0].id);
    }
  }, [data, selectedCategory]);

  // --- Dropzone ---
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setNewDocFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] }
  });

  // --- Actions ---

  const handleCreateCategory = async () => {
    if (!categoryTitle.trim()) return;
    try {
      setBusy(true);
      const res = await normatividadApi.createCategory(categoryTitle.trim());
      setCategoryTitle('');
      setIsCategoryModalOpen(false);
      await refresh();
      if (res && res.id) {
        setSelectedCategory(String(res.id));
      }
      Swal.fire({ 
        icon: 'success', 
        title: 'Categoría creada', 
        toast: true, 
        position: 'top-end', 
        showConfirmButton: false, 
        timer: 2000 
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear la categoría.' });
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryTitle.trim()) return;
    try {
      setBusy(true);
      await normatividadApi.updateCategory(editingCategory.id, categoryTitle.trim());
      setEditingCategory(null);
      setIsEditCatModalOpen(false);
      await refresh();
      Swal.fire({ icon: 'success', title: 'Categoría actualizada', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar.' });
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar categoría?',
      text: `Se borrarán todos los documentos de "${name}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    });
    if (!result.isConfirmed) return;
    try {
      await normatividadApi.deleteCategory(id);
      if (selectedCategory === id) setSelectedCategory(null);
      await refresh();
      Swal.fire({ icon: 'success', title: 'Eliminado', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar.' });
    }
  };

  const handleBatchUpload = async () => {
    if (!selectedCategory || newDocFiles.length === 0) return;
    setBusy(true);
    setUploadProgress({ current: 0, total: newDocFiles.length });
    let success = 0;
    for (let i = 0; i < newDocFiles.length; i++) {
      try {
        const file = newDocFiles[i];
        const title = file.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ');
        await normatividadApi.uploadDocument(selectedCategory, file, title);
        success++;
      } catch (err) {
        console.error(err);
      }
      setUploadProgress(prev => prev ? { ...prev, current: i + 1 } : null);
    }
    setBusy(false);
    setUploadProgress(null);
    setNewDocFiles([]);
    setIsUploadModalOpen(false);
    await refresh();
    Swal.fire({ 
      icon: success === newDocFiles.length ? 'success' : 'warning', 
      title: 'Carga completada', 
      text: `Se subieron ${success} de ${newDocFiles.length} archivos.`, 
      toast: true, 
      position: 'top-end', 
      showConfirmButton: false, 
      timer: 3000 
    });
  };

  const handleDeleteDoc = async (id: string) => {
    const result = await Swal.fire({ title: '¿Eliminar documento?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33' });
    if (!result.isConfirmed) return;
    try {
      await normatividadApi.deleteDocument(id);
      await refresh();
      Swal.fire({ icon: 'success', title: 'Eliminado', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el documento.' });
    }
  };

  const handleUpdateDoc = async (id: string, title: string, file: File | null) => {
    try {
      await normatividadApi.updateDocument(id, { titulo: title, file: file || undefined });
      await refresh();
      Swal.fire({ icon: 'success', title: 'Actualizado', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
    } catch (err) {
       Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el documento.' });
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedDocs.size === 0) return;
    const result = await Swal.fire({ title: `¿Eliminar ${selectedDocs.size} documentos?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33' });
    if (!result.isConfirmed) return;
    setBusy(true);
    for (const id of selectedDocs) {
      try { await normatividadApi.deleteDocument(id); } catch(e) {}
    }
    setSelectedDocs(new Set());
    setMultiSelectMode(false);
    setBusy(false);
    await refresh();
    Swal.fire({ icon: 'success', title: 'Documentos eliminados', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
  };

  const toggleSelectAll = () => {
    const currentDocs = data.find(c => c.id === selectedCategory)?.documentos || [];
    if (selectedDocs.size === currentDocs.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(currentDocs.map((d: NormDocument) => d.id)));
    }
  };

  function buildFileUrl(archivo?: string | null) {
    if (!archivo) return '';
    const a = String(archivo || '');
    if (a.startsWith('http')) return a;
    if (a.startsWith('/uploads')) return BACKEND ? `${BACKEND}${a}` : a;
    return BACKEND ? `${BACKEND}/uploads/normatividad/${a}` : `/uploads/normatividad/${a}`;
  }

  const currentCategoryData = data.find(c => c.id === selectedCategory);
  const docs = currentCategoryData?.documentos || [];

  if (loading && data.length === 0) {
    return (
      <div className="p-6">
        <PageMeta title="Cargando - Disposición Jurídica" description="Por favor espere..." />
        <div className="flex flex-col items-center justify-center p-20 min-h-[400px] bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
           <div className="w-16 h-16 border-4 border-gray-100 border-t-[#0a9782] rounded-full animate-spin mb-4"></div>
           <p className="text-gray-400 font-medium animate-pulse">Sincronizando normatividad...</p>
        </div>
      </div>
    );
  }

  // Handle case where fetch failed or returned nothing
  if (!loading && data.length === 0 && !isCategoryModalOpen) {
    return (
      <div className="p-6">
        <PageMeta title="Gestión - Disposición Jurídica" description="Repositorio de documentos" />
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center flex flex-col items-center">
            <Info className="w-12 h-12 text-blue-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Configuración de Repositorio</h2>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">No se encontraron categorías. Crea la primera para comenzar a gestionar los documentos jurídicos.</p>
            <button onClick={() => setIsCategoryModalOpen(true)} className="px-8 py-3 bg-[#0a9782] text-white rounded-xl font-bold shadow-lg hover:bg-[#088c75] transition-all">
                Crear Primera Categoría
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
      {/* Header - Gestor Style */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Normatividad
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => { setCategoryTitle(''); setIsCategoryModalOpen(true); }}
            className="px-4 py-2.5 bg-[#0a9782] text-white rounded-xl hover:bg-[#088c75] transition-all font-medium shadow-lg hover:shadow-xl text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Categoría
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            disabled={data.length === 0}
            className="px-4 py-2.5 bg-[#d1672a] text-white rounded-xl hover:bg-[#b85822] transition-all font-medium shadow-lg hover:shadow-xl text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            Subir Documentos
          </button>
        </div>
      </div>

      {/* Categories Tabs - Gestor Style */}
      {data.length > 0 ? (
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px space-x-8 overflow-x-auto no-scrollbar">
            {data.map((cat) => (
              <div key={cat.id} className="flex items-center group">
                <button
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-all ${
                    selectedCategory === cat.id
                      ? 'border-[#0a9782] text-[#0a9782] dark:text-[#0a9782]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                  }`}
                >
                  {cat.titulo}
                  <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${
                    selectedCategory === cat.id ? 'bg-[#0a9782]/10 text-[#0a9782]' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}>
                    {cat.documentos.length}
                  </span>
                </button>
                
                {/* Tab Actions */}
                <div className="flex items-center ml-1 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => { setEditingCategory({id: cat.id, titulo: cat.titulo}); setCategoryTitle(cat.titulo); setIsEditCatModalOpen(true); }}
                     className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                   >
                     <Edit2 className="w-3.5 h-3.5" />
                   </button>
                   <button 
                     onClick={() => handleDeleteCategory(cat.id, cat.titulo)}
                     className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                   >
                     <Trash2 className="w-3.5 h-3.5" />
                   </button>
                </div>
              </div>
            ))}
          </nav>
        </div>
      ) : (
        <div className="p-12 text-center border-2 border-dashed rounded-3xl border-gray-100 dark:border-gray-800">
          <Folder className="w-12 h-12 mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No hay categorías registradas aún.
          </p>
        </div>
      )}

      {/* Docs Area */}
      {selectedCategory && (
        <div className="space-y-6">
          {/* Controls */}
          {docs.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setMultiSelectMode(!multiSelectMode); setSelectedDocs(new Set()); }}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                    multiSelectMode ? 'bg-[#d1672a] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {multiSelectMode ? 'Cancelar Selección' : 'Seleccionar Varios'}
                </button>
                {multiSelectMode && (
                  <button onClick={toggleSelectAll} className="text-sm font-bold text-gray-500 hover:text-gray-700">
                    {selectedDocs.size === docs.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                  </button>
                )}
              </div>
              {multiSelectMode && selectedDocs.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={busy}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/20 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar {selectedDocs.size}
                </button>
              )}
            </div>
          )}

          {/* Grid of Cards - Gestor Style */}
          {docs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => { if(multiSelectMode) {
                    const next = new Set(selectedDocs);
                    if(next.has(doc.id)) next.delete(doc.id); else next.add(doc.id);
                    setSelectedDocs(next);
                  }}}
                  className={`group relative p-5 bg-white dark:bg-gray-800 border rounded-2xl shadow-sm transition-all cursor-pointer ${
                    selectedDocs.has(doc.id) ? 'border-[#d1672a] ring-2 ring-[#d1672a]/10 bg-orange-50/10' : 'border-gray-100 dark:border-gray-700 hover:shadow-md'
                  }`}
                >
                  {multiSelectMode && (
                    <div className={`absolute top-4 right-4 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      selectedDocs.has(doc.id) ? 'bg-[#d1672a] border-[#d1672a]' : 'border-gray-200'
                    }`}>
                      {selectedDocs.has(doc.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                  )}

                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center justify-center text-red-500 shrink-0">
                       <FileText className="w-10 h-10" />
                    </div>
                    <div className="w-full">
                       <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate" title={doc.titulo}>
                         {doc.titulo}
                       </h3>
                       <p className="text-[10px] text-gray-400 mt-1 uppercase font-black tracking-widest">
                         {doc.archivoName || 'Documento PDF'}
                       </p>
                    </div>

                    {!multiSelectMode && (
                      <div className="flex gap-1.5 w-full pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); window.open(buildFileUrl(doc.archivo), '_blank'); }}
                          className="flex-1 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-all"
                        >
                          Ver
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingDoc({id: doc.id, titulo: doc.titulo}); setIsEditDocModalOpen(true); }}
                          className="px-2 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg hover:bg-amber-500 hover:text-white transition-all"
                        >
                           <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc.id); }}
                          className="px-2 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                        >
                           <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-20 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-800">
               <FileText className="w-12 h-12 mx-auto text-gray-200 mb-4" />
               <p className="text-gray-500">Sin documentos en esta categoría.</p>
            </div>
          )}
        </div>
      )}

      {/* --- Modals (Gestor Style) --- */}

      {/* Category Modal */}
      {(isCategoryModalOpen || isEditCatModalOpen) && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-sm border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                {isEditCatModalOpen ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <div className="space-y-4">
                 <div>
                   <label className="text-xs font-black uppercase text-gray-400 mb-2 block">Nombre</label>
                   <input 
                     value={categoryTitle}
                     onChange={e => setCategoryTitle(e.target.value)}
                     className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-[#0a9782] outline-none text-sm"
                     placeholder="Ej: Reglamentos Locales"
                     autoFocus
                   />
                 </div>
                 <div className="flex gap-3 pt-4">
                    <button onClick={() => { setIsCategoryModalOpen(false); setIsEditCatModalOpen(false); }} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-50 rounded-xl">Cancelar</button>
                    <button 
                      onClick={isEditCatModalOpen ? handleUpdateCategory : handleCreateCategory} 
                      disabled={busy || !categoryTitle.trim()}
                      className="flex-1 py-3 bg-[#0a9782] text-white font-bold rounded-xl shadow-lg shadow-[#0a9782]/20"
                    >
                      {busy ? 'Cargando...' : 'Guardar'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Batch Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-lg border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Subir Documentos</h3>
                <button onClick={() => { if(!busy) { setIsUploadModalOpen(false); setNewDocFiles([]); } }} className="text-gray-400"><X /></button>
              </div>

              <div className="space-y-6">
                 {/* Dropzone */}
                 <div 
                   {...getRootProps()}
                   className={`border-4 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer ${
                     isDragActive ? 'border-[#d1672a] bg-orange-50/30' : 'border-gray-100 dark:border-gray-700 hover:border-[#d1672a]'
                   }`}
                 >
                    <input {...getInputProps()} />
                    <Upload className="w-12 h-12 mx-auto text-[#d1672a] mb-4" />
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Arrastra archivos PDF aquí</p>
                    <p className="text-xs text-gray-400 mt-1">O haz clic para seleccionar (Máx 5MB recomendado)</p>
                 </div>

                 {/* File list */}
                 {newDocFiles.length > 0 && (
                   <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {newDocFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                           <div className="flex items-center gap-3 overflow-hidden">
                              <FileText className="w-4 h-4 text-red-500 shrink-0" />
                              <span className="text-xs font-medium truncate">{f.name}</span>
                           </div>
                           <button onClick={() => setNewDocFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4"/></button>
                        </div>
                      ))}
                   </div>
                 )}

                 {/* Progress */}
                 {uploadProgress && (
                   <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-gray-500">
                         <span>Subiendo {uploadProgress.current} de {uploadProgress.total}</span>
                         <span>{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                         <div className="h-full bg-[#d1672a] transition-all duration-300" style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }} />
                      </div>
                   </div>
                 )}

                 <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button onClick={() => setIsUploadModalOpen(false)} disabled={busy} className="flex-1 py-3 font-bold text-gray-500">Cerrar</button>
                    <button 
                      onClick={handleBatchUpload} 
                      disabled={busy || newDocFiles.length === 0} 
                      className="flex-1 py-3 bg-[#d1672a] text-white font-bold rounded-xl shadow-lg shadow-[#d1672a]/20 disabled:opacity-50"
                    >
                      {busy ? 'Subiendo...' : 'Iniciar Carga'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Edit Doc Modal */}
      {isEditDocModalOpen && editingDoc && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-sm border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Editar Documento</h3>
              <div className="space-y-4">
                 <div>
                   <label className="text-xs font-black uppercase text-gray-400 mb-2 block">Título</label>
                   <input 
                     value={editingDoc.titulo}
                     onChange={e => setEditingDoc({...editingDoc, titulo: e.target.value})}
                     className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-700 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500"
                   />
                 </div>
                 <div className="flex gap-3 pt-4">
                    <button onClick={() => setIsEditDocModalOpen(false)} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-50 rounded-xl">Cancelar</button>
                    <button 
                      onClick={() => { handleUpdateDoc(editingDoc.id, editingDoc.titulo, null); setIsEditDocModalOpen(false); }} 
                      className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20"
                    >
                      Guardar
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
