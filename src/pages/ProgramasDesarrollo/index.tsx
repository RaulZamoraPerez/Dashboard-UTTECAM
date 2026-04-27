import  { useEffect, useState, useCallback } from 'react';
import api from '../../services/programaDesarrolloApiService';
import { 
   
  FileText, 
  Plus, 
  Trash2, 
  Edit2, 
  Upload, 
  X,
  Check,
  Library,
  Info
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Swal from 'sweetalert2';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

interface ProgramDocument {
  id: string;
  titulo: string;
  descripcion: string;
  archivo: string;
  activo: boolean;
}

interface ProgramCategory {
  id: string;
  titulo: string;
  documentos: ProgramDocument[];
}

const BACKEND = (import.meta.env.VITE_BACKENDURL || '').replace(/\/$/, '');

export default function ProgramasDesarrolloPage() {
  const [data, setData] = useState<ProgramCategory[]>([]); // Categories with programs
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditDocModalOpen, setIsEditDocModalOpen] = useState(false);
  const [isEditCatModalOpen, setIsEditCatModalOpen] = useState(false);

  // Form states
  const [categoryTitle, setCategoryTitle] = useState('');
  const [editingCategory, setEditingCategory] = useState<{id: string, titulo: string} | null>(null);
  const [editingDoc, setEditingDoc] = useState<{id: string, titulo: string, descripcion: string, activo: boolean} | null>(null);
  const [newDocFiles, setNewDocFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{current: number, total: number} | null>(null);

  // Selection states
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [multiSelectMode, setMultiSelectMode] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.getAll(true);
      // Ensure data is array (if backend returns flat list because no categories exist, we handle it)
      if (Array.isArray(res)) {
        // If they are categories (they have 'programas' or 'documentos')
        if (res.length > 0 && (res[0].programas || res[0].documentos)) {
           setData(res.map((c: any): ProgramCategory => ({
             id: String(c.id),
             titulo: c.titulo,
             documentos: (c.programas || c.documentos || []).map((d: any): ProgramDocument => ({
                id: String(d.id),
                titulo: d.titulo,
                descripcion: d.descripcion,
                archivo: d.archivo,
                activo: !!d.activo
             }))
           })));
        } else {
           // It's a flat list, we create a default category
           setData([{
             id: 'general',
             titulo: 'General',
             documentos: res.map((d: any): ProgramDocument => ({
                id: String(d.id),
                titulo: d.titulo,
                descripcion: d.descripcion,
                archivo: d.archivo,
                activo: !!d.activo
             }))
           }]);
        }
      }
    } catch (err) {
      console.error('Error cargando programas', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      const res = await api.createCategory(categoryTitle.trim());
      setCategoryTitle('');
      setIsCategoryModalOpen(false);
      await fetchData();
      if (res && res.id) setSelectedCategory(String(res.id));
      Swal.fire({ icon: 'success', title: 'Categoría creada', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
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
      await api.updateCategory(editingCategory.id, categoryTitle.trim());
      setIsEditCatModalOpen(false);
      setEditingCategory(null);
      await fetchData();
      Swal.fire({ icon: 'success', title: 'Actualizada', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar.' });
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (id === 'general') return;
    const result = await Swal.fire({
      title: '¿Eliminar categoría?',
      text: `Se borrarán todos los programas de "${name}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    });
    if (!result.isConfirmed) return;
    try {
      await api.deleteCategory(id);
      if (selectedCategory === id) setSelectedCategory(null);
      await fetchData();
      Swal.fire({ icon: 'success', title: 'Eliminado', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar.' });
    }
  };

  const handleBatchUpload = async () => {
    if (!selectedCategory || newDocFiles.length === 0) return;
    // Don't allow upload to 'general' virtual category if there are real ones
    const catId = selectedCategory === 'general' ? null : selectedCategory;
    if (catId === null && data.some(c => c.id !== 'general')) {
       Swal.fire({ icon: 'warning', title: 'Aviso', text: 'Por favor selecciona una categoría real o crea una.' });
       return;
    }

    setBusy(true);
    setUploadProgress({ current: 0, total: newDocFiles.length });
    let success = 0;
    for (let i = 0; i < newDocFiles.length; i++) {
      try {
        const file = newDocFiles[i];
        const title = file.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ');
        await api.uploadDocument(catId || 0, file, title);
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
    await fetchData();
    Swal.fire({ icon: success === newDocFiles.length ? 'success' : 'warning', title: 'Carga completada', text: `Se subieron ${success} de ${newDocFiles.length} programas.`, toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
  };

  const handleDeleteDoc = async (id: string) => {
    const result = await Swal.fire({ title: '¿Eliminar programa?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33' });
    if (!result.isConfirmed) return;
    try {
      await api.deleteDocument(id);
      await fetchData();
      Swal.fire({ icon: 'success', title: 'Eliminado', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar.' });
    }
  };

  const handleUpdateDoc = async () => {
    if (!editingDoc) return;
    try {
      setBusy(true);
      await api.updateDocument(editingDoc.id, { 
        titulo: editingDoc.titulo, 
        descripcion: editingDoc.descripcion,
        activo: editingDoc.activo
      });
      setIsEditDocModalOpen(false);
      setEditingDoc(null);
      await fetchData();
      Swal.fire({ icon: 'success', title: 'Actualizado', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
    } catch (err) {
       Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar.' });
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedDocs.size === 0) return;
    const result = await Swal.fire({ title: `¿Eliminar ${selectedDocs.size} programas?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33' });
    if (!result.isConfirmed) return;
    setBusy(true);
    for (const id of selectedDocs) {
      try { await api.deleteDocument(id); } catch(e) {}
    }
    setSelectedDocs(new Set());
    setMultiSelectMode(false);
    setBusy(false);
    await fetchData();
    Swal.fire({ icon: 'success', title: 'Eliminados', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
  };

  const toggleSelectAll = () => {
    const currentDocs = data.find(c => c.id === selectedCategory)?.documentos || [];
    if (selectedDocs.size === currentDocs.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(currentDocs.map((d: ProgramDocument) => d.id)));
    }
  };

  function buildFileUrl(archivo?: string | null) {
    if (!archivo) return '';
    if (archivo.startsWith('http')) return archivo;
    return `${BACKEND}${archivo}`;
  }

  const currentCategoryData = data.find(c => c.id === selectedCategory);
  const docs = currentCategoryData?.documentos || [];

  if (loading && data.length === 0) {
    return (
      <div className="p-6">
        <PageMeta title="Cargando - Programas de Desarrollo" description="Por favor espere..." />
        <div className="flex flex-col items-center justify-center p-20 min-h-[400px] bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
           <div className="w-16 h-16 border-4 border-gray-100 border-t-[#0a9782] rounded-full animate-spin mb-4"></div>
           <p className="text-gray-400 font-medium animate-pulse">Sincronizando programas...</p>
        </div>
      </div>
    );
  }

  if (!loading && data.length === 0 && !isCategoryModalOpen) {
    return (
      <div className="p-6">
        <PageMeta title="Gestión - Programas de Desarrollo" description="Repositorio de documentos" />
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center flex flex-col items-center">
            <Info className="w-12 h-12 text-[#0a9782] mb-4" />
            <h2 className="text-xl font-bold mb-2">Configuración de Repositorio</h2>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">Aún no se han configurado categorías para los programas de desarrollo.</p>
            <button onClick={() => setIsCategoryModalOpen(true)} className="px-8 py-3 bg-[#0a9782] text-white rounded-xl font-bold shadow-lg hover:bg-[#088c75] transition-all">
                Crear Primera Categoría
            </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Gestión - Programas de Desarrollo" description="Administración de Programas de Desarrollo" />
      <PageBreadcrumb pageTitle="Programas de Desarrollo" />

      <div className="space-y-6 p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
        
        {/* Header - Normatividad Layout */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Programas de Desarrollo</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
               <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Repositorio Activo</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { setCategoryTitle(''); setIsCategoryModalOpen(true); }}
              className="px-4 py-2.5 bg-[#0a9782] text-white rounded-xl hover:bg-[#088c75] transition-all font-medium shadow-lg hover:shadow-xl text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Nueva Categoría
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              disabled={data.length === 0}
              className="px-4 py-2.5 bg-[#d1672a] text-white rounded-xl hover:bg-[#b85822] transition-all font-medium shadow-lg hover:shadow-xl text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" /> Subir Archivos
            </button>
          </div>
        </div>

        {/* Categories Tabs - Normatividad Styling */}
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
                  
                  {cat.id !== 'general' && (
                    <div className="flex items-center ml-1 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => { setEditingCategory({id: cat.id, titulo: cat.titulo}); setCategoryTitle(cat.titulo); setIsEditCatModalOpen(true); }} className="p-1 text-gray-400 hover:text-blue-500 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                       <button onClick={() => handleDeleteCategory(cat.id, cat.titulo)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        ) : (
          <div className="p-12 text-center border-2 border-dashed rounded-3xl border-gray-100 dark:border-gray-800 bg-gray-50/50">
            <Library className="w-12 h-12 mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 text-sm">Crea la primera categoría para organizar los programas.</p>
          </div>
        )}

        {/* Docs Area */}
        {selectedCategory && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => { setMultiSelectMode(!multiSelectMode); setSelectedDocs(new Set()); }} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${multiSelectMode ? 'bg-[#d1672a] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                    {multiSelectMode ? 'CANCELAR SELECCIÓN' : 'SELECCIÓN MÚLTIPLE'}
                  </button>
                  {multiSelectMode && docs.length > 0 && (
                    <button onClick={toggleSelectAll} className="text-xs font-bold text-gray-400 hover:text-gray-600">Seleccionar todos</button>
                  )}
                </div>
                {multiSelectMode && selectedDocs.size > 0 && (
                   <button onClick={handleDeleteSelected} disabled={busy} className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-red-500/20">
                     <Trash2 className="w-4 h-4" /> ELIMINAR {selectedDocs.size}
                   </button>
                )}
            </div>

            {/* Grid of Cards - EXACT Normatividad Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
               {docs.map((doc: ProgramDocument) => (
                  <div 
                    key={doc.id} 
                    onClick={() => { if(multiSelectMode){ const n = new Set(selectedDocs); if(n.has(doc.id)) n.delete(doc.id); else n.add(doc.id); setSelectedDocs(n); }}} 
                    className={`group relative p-5 bg-white dark:bg-gray-800 border-2 rounded-2xl transition-all cursor-pointer ${
                      selectedDocs.has(doc.id) ? 'border-[#d1672a] ring-2 ring-[#d1672a]/10 bg-orange-50/10' : 'border-gray-50 dark:border-gray-700 hover:shadow-md'
                    }`}
                  >
                     {multiSelectMode && (
                        <div className={`absolute top-4 right-4 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          selectedDocs.has(doc.id) ? 'bg-[#d1672a] border-[#d1672a]' : 'border-gray-100'
                        }`}>
                          {selectedDocs.has(doc.id) && <Check className="w-3 h-3 text-white" />}
                        </div>
                     )}

                     <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center justify-center text-red-500 shrink-0">
                           <FileText className="w-10 h-10" />
                        </div>
                        <div className="w-full text-center">
                           <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 min-h-[40px] px-2">{doc.titulo}</h3>
                           <p className="text-[10px] text-gray-400 mt-1 uppercase font-black tracking-widest truncate">Documento PDF</p>
                        </div>

                        {!multiSelectMode && (
                          <div className="flex gap-1.5 w-full pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={(e) => { e.stopPropagation(); window.open(buildFileUrl(doc.archivo), '_blank'); }} className="flex-1 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-all">VER</button>
                             <button onClick={(e) => { e.stopPropagation(); setEditingDoc(doc); setIsEditDocModalOpen(true); }} className="px-2 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg hover:bg-amber-500 hover:text-white transition-all shadow-sm"><Edit2 className="w-3.5 h-3.5" /></button>
                             <button onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc.id); }} className="px-2 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        )}
                     </div>
                  </div>
               ))}
               
               {docs.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                     <FileText className="w-12 h-12 mx-auto text-gray-200 mb-4" />
                     <p className="text-gray-400 text-sm">Sin documentos en esta categoría.</p>
                  </div>
               )}
            </div>
          </div>
        )}

        {/* --- Modals (Consolidated Gestor Style) --- */}

        {/* Category Modal */}
        {(isCategoryModalOpen || isEditCatModalOpen) && (
           <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
                 <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">{isEditCatModalOpen ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
                 <div className="space-y-4">
                    <div>
                       <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block px-1">Nombre</label>
                       <input value={categoryTitle} onChange={e => setCategoryTitle(e.target.value)} className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 dark:bg-gray-700 rounded-xl focus:border-[#0a9782] outline-none transition-all text-sm" placeholder="Ej: Programas 2025" autoFocus />
                    </div>
                    <div className="flex gap-3 pt-6">
                       <button onClick={()=>{ setIsCategoryModalOpen(false); setIsEditCatModalOpen(false); }} className="flex-1 font-bold text-gray-500 hover:bg-gray-50 py-3 rounded-xl">Cancelar</button>
                       <button onClick={isEditCatModalOpen?handleUpdateCategory:handleCreateCategory} disabled={busy || !categoryTitle.trim()} className="flex-1 py-3 bg-[#0a9782] text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all">{busy ? 'Cargando...' : 'Guardar'}</button>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* Upload Modal */}
        {isUploadModalOpen && (
           <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                 <div className="flex justify-between mb-8 items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Subir Programas</h3>
                    <button onClick={()=>setIsUploadModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X /></button>
                 </div>
                 <div {...getRootProps()} className={`border-4 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${isDragActive ? 'border-[#d1672a] bg-orange-50/30' : 'border-gray-50 dark:border-gray-700 hover:border-[#d1672a]'}`}>
                    <input {...getInputProps()} />
                    <Upload className="w-14 h-14 mx-auto text-[#d1672a] mb-4" />
                    <p className="font-bold text-gray-700 dark:text-gray-300">Arrastra archivos PDF aquí</p>
                    <p className="text-xs text-gray-400 mt-2 font-medium">O haz clic para seleccionar (Máx 100MB)</p>
                 </div>
                 {newDocFiles.length > 0 && (
                    <div className="mt-6 space-y-2 max-h-40 overflow-auto pr-2 custom-scrollbar">
                       {newDocFiles.map((f,i)=>(
                         <div key={i} className="text-xs bg-slate-50 dark:bg-gray-700 p-3 rounded-xl flex justify-between items-center group font-medium border border-gray-100 dark:border-gray-600">
                           <div className="flex items-center gap-3">
                             <FileText className="w-4 h-4 text-red-500" />
                             <span className="truncate max-w-[220px] dark:text-gray-200">{f.name}</span>
                           </div>
                           <button onClick={()=>setNewDocFiles(p=>p.filter((_,idx)=>idx!==i))} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4"/></button>
                         </div>
                       ))}
                    </div>
                 )}
                 {uploadProgress && (
                    <div className="mt-8">
                       <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase mb-2">
                          <span>Subiendo {uploadProgress.current} de {uploadProgress.total}</span>
                          <span>{Math.round((uploadProgress.current/uploadProgress.total)*100)}%</span>
                       </div>
                       <div className="h-2 bg-gray-50 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-[#d1672a] transition-all duration-300" style={{width: `${(uploadProgress.current/uploadProgress.total)*100}%`}}></div>
                       </div>
                    </div>
                 )}
                 <div className="flex gap-4 mt-10 pt-6 border-t border-gray-50 dark:border-gray-700">
                    <button onClick={()=>setIsUploadModalOpen(false)} disabled={busy} className="flex-1 font-bold text-gray-500 py-4">Cerrar</button>
                    <button onClick={handleBatchUpload} disabled={busy || newDocFiles.length===0} className="flex-1 py-4 bg-[#d1672a] text-white font-bold rounded-2xl shadow-xl shadow-[#d1672a]/20 active:scale-95 transition-all">Iniciar Carga</button>
                 </div>
              </div>
           </div>
        )}

        {/* Edit Doc Modal */}
        {isEditDocModalOpen && editingDoc && (
           <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
                 <h3 className="text-xl font-bold mb-8 text-gray-900 dark:text-white">Detalles del Programa</h3>
                 <div className="space-y-6">
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Título</label>
                       <input value={editingDoc.titulo} onChange={e=>setEditingDoc({...editingDoc, titulo: e.target.value})} className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 dark:bg-gray-700 rounded-xl focus:border-blue-500 outline-none font-medium text-sm transition-all dark:text-white" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Descripción</label>
                       <textarea value={editingDoc.descripcion || ''} onChange={e=>setEditingDoc({...editingDoc, descripcion: e.target.value})} className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 dark:bg-gray-700 rounded-xl focus:border-blue-500 outline-none font-medium text-sm transition-all dark:text-white h-24" />
                    </div>
                    <label className="flex items-center gap-3 p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-50 dark:border-gray-700">
                       <input type="checkbox" checked={editingDoc.activo} onChange={e=>setEditingDoc({...editingDoc, activo: e.target.checked})} className="w-5 h-5 rounded-lg text-[#0a9782] focus:ring-[#0a9782] transition-all" />
                       <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Visible al público</span>
                    </label>
                 </div>
                 <div className="flex gap-4 mt-10 pt-6 border-t border-gray-50 dark:border-gray-700">
                    <button onClick={()=>setIsEditDocModalOpen(false)} className="flex-1 font-bold text-gray-500 py-4">Cancelar</button>
                    <button onClick={handleUpdateDoc} disabled={busy} className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Guardar</button>
                 </div>
              </div>
           </div>
        )}

      </div>
    </>
  );
}
