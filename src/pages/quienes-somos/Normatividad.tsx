import React, { useEffect, useState } from 'react';
import normatividadApi from '../../services/normatividadApiService';
import type { Category as LocalCategory } from '../../services/normatividadService';
import { 
  Folder, 
  FileText, 
  Search, 
  Plus, 
  Trash2, 
  Edit2, 
  Eye, 
  Upload, 
  Download, 
  X,
  Save,
  AlertCircle,
 
} from 'lucide-react';
import Swal from 'sweetalert2';

const BACKEND = (import.meta.env.VITE_BACKENDURL || '').replace(/\/$/, '');

function useNormatividad() {
  const [data, setData] = useState<LocalCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await normatividadApi.getAll();
      const mapped = (res || []).map((c: any) => ({ 
        id: String(c.id), 
        titulo: c.titulo, 
        documentos: (c.documentos || []).map((d: any) => ({ 
          id: String(d.id), 
          titulo: d.titulo, 
          archivo: d.archivo, 
          archivoName: d.archivo_name || d.archivoName 
        })) 
      }));
      setData(mapped);
    } catch (err) {
      console.error('Error cargando normatividad', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error cargando la información',
        toast: true,
        position: 'center',
        showConfirmButton: false,
        timer: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, refresh: fetchData, loading };
}

// --- Modals ---

interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, title: string, file: File | null) => Promise<void>;
  doc: { id: string, titulo: string } | null;
}

function EditDocumentModal({ isOpen, onClose, onSave, doc }: EditDocumentModalProps) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (doc) {
      setTitle(doc.titulo);
      setFile(null);
    }
  }, [doc]);

  if (!isOpen || !doc) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await onSave(doc!.id, title.trim(), file);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-blue-600" />
            Editar Documento
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Título del documento</label>
            <input 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="Nombre del documento"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Reemplazar archivo (Opcional)</label>
            <div className="relative">
              <input 
                type="file" 
                accept="application/pdf" 
                onChange={e => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer" 
              />
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Deja esto vacío si no quieres cambiar el archivo PDF.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={busy || !title.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all flex items-center gap-2"
            >
              {busy ? 'Guardando...' : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, title: string) => Promise<void>;
  category: { id: string, titulo: string } | null;
}

function EditCategoryModal({ isOpen, onClose, onSave, category }: EditCategoryModalProps) {
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (category) {
      setTitle(category.titulo);
    }
  }, [category]);

  if (!isOpen || !category) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await onSave(category!.id, title.trim());
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-blue-600" />
            Editar Categoría
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nombre de la categoría</label>
            <input 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="Ej. Reglamentos"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={busy || !title.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all flex items-center gap-2"
            >
              {busy ? 'Guardando...' : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function NormatividadPage() {
  const { data, refresh, loading } = useNormatividad();
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [isUploadExpanded, setIsUploadExpanded] = useState(false);
  
  // Edit States
  const [editingDoc, setEditingDoc] = useState<{ id: string, titulo: string } | null>(null);
  const [editingCategory, setEditingCategory] = useState<{ id: string, titulo: string } | null>(null);

  useEffect(() => {
    if (!selectedCategory && data.length) setSelectedCategory(data[0].id);
  }, [data, selectedCategory]);

  // --- Category Actions ---

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategoryTitle.trim()) return;
    try {
      await normatividadApi.createCategory(newCategoryTitle.trim());
      setNewCategoryTitle('');
      await refresh();
      Swal.fire({
        icon: 'success',
        title: '¡Categoría Creada!',
        toast: true,
        position: 'center',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear la categoría.',
      });
    }
  }

  async function handleUpdateCategory(id: string, title: string) {
    try {
      await normatividadApi.updateCategory(id, title);
      await refresh();
      Swal.fire({
        icon: 'success',
        title: '¡Categoría Actualizada!',
        toast: true,
        position: 'center',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.message || 'No se pudo actualizar la categoría.',
      });
    }
  }

  async function handleDeleteCategory(id: string) {
    const result = await Swal.fire({
      title: '¿Eliminar categoría?',
      text: "Se eliminarán todos los documentos contenidos en ella. Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar todo',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      await normatividadApi.deleteCategory(id);
      if (selectedCategory === id) setSelectedCategory(null);
      await refresh();
      Swal.fire({
        icon: 'success',
        title: '¡Eliminada!',
        text: 'La categoría y sus documentos han sido eliminados.',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar la categoría.',
      });
    }
  }

  // --- Document Actions ---

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f && !docTitle) {
      setDocTitle(f.name.replace(/\.pdf$/i, '').replace(/_/g, ' '));
    }
  }

  async function handleAddDocument(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCategory || !file || !docTitle.trim()) return;
    
    setBusy(true);
    try {
      await normatividadApi.uploadDocument(selectedCategory, file, docTitle.trim());
      setDocTitle('');
      setFile(null);
      const fileInput = document.getElementById('file-input') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
      setIsUploadExpanded(false);
      await refresh();
      Swal.fire({
        icon: 'success',
        title: '¡Documento Subido!',
        toast: true,
        position: 'center',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.message || 'Ocurrió un error al subir el archivo.',
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdateDocument(id: string, title: string, newFile: File | null) {
    try {
      await normatividadApi.updateDocument(id, { titulo: title, file: newFile || undefined });
      await refresh();
      Swal.fire({
        icon: 'success',
        title: '¡Actualización Exitosa!',
        toast: true,
        position: 'center',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.message || 'No se pudo actualizar el documento.',
      });
      throw err;
    }
  }

  async function handleDeleteDocument(docId: string) {
    const result = await Swal.fire({
      title: '¿Eliminar documento?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      await normatividadApi.deleteDocument(docId);
      await refresh();
      Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        toast: true,
        position: 'center',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el documento.',
      });
    }
  }

  function buildFileUrl(archivo?: string | null) {
    if (!archivo) return '';
    const a = String(archivo || '');
    if (a.startsWith('http')) return a;
    if (a.startsWith('/uploads')) {
      return BACKEND ? `${BACKEND}${a}` : a;
    }
    if (a.startsWith('/')) {
      const tryNorm = `/uploads/normatividad${a}`;
      return BACKEND ? `${BACKEND}${tryNorm}` : tryNorm;
    }
    const tryRel = `/uploads/normatividad/${a}`;
    return BACKEND ? `${BACKEND}${tryRel}` : tryRel;
  }

  const docsInCategory = (data.find(c => c.id === selectedCategory)?.documentos) ?? [];
  const filteredDocs = search.trim()
    ? docsInCategory.filter(d => {
        const s = search.toLowerCase();
        return (d.titulo ?? '').toLowerCase().includes(s) || ((d.archivoName ?? d.archivo ?? '').toLowerCase().includes(s));
      })
    : docsInCategory;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-6 md:p-8 font-sans text-slate-800 dark:text-slate-200">
      <style>{`
        .swal2-container {
          z-index: 99999 !important;
        }
      `}</style>
      
      <EditDocumentModal 
        isOpen={!!editingDoc} 
        onClose={() => setEditingDoc(null)} 
        onSave={handleUpdateDocument}
        doc={editingDoc}
      />

      <EditCategoryModal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        onSave={handleUpdateCategory}
        category={editingCategory}
      />

      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Normatividad</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gestión centralizada de documentos y regulaciones.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar: Categories */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden flex flex-col h-[calc(100vh-12rem)] sticky top-8">
            <div className="p-4 border-b border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-700/50 flex items-center justify-between">
              <h2 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Folder className="w-4 h-4 text-slate-400" />
                Categorías
              </h2>
              <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                {data.length}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {loading ? (
                <div className="p-4 text-center text-slate-400 text-sm">Cargando...</div>
              ) : data.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-sm">No hay categorías</div>
              ) : (
                data.map(cat => (
                  <div key={cat.id} className="group relative flex items-center pr-2">
                    <button
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                        selectedCategory === cat.id 
                          ? 'bg-blue-50 text-blue-700 font-medium shadow-sm ring-1 ring-blue-100' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="truncate mr-2">{cat.titulo}</span>
                      {cat.documentos.length > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-md transition-opacity duration-200 group-hover:opacity-0 ${
                          selectedCategory === cat.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {cat.documentos.length}
                        </span>
                      )}
                    </button>
                    
                    {/* Category Actions (Hover) */}
                    <div className={`absolute right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/80 backdrop-blur-sm rounded-md shadow-sm border border-slate-100 p-0.5`}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingCategory({ id: cat.id, titulo: cat.titulo }); }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar categoría"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50/30">
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  value={newCategoryTitle}
                  onChange={e => setNewCategoryTitle(e.target.value)}
                  placeholder="Nueva categoría..."
                  className="flex-1 min-w-0 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!newCategoryTitle.trim()}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white p-1.5 rounded-lg transition-colors shadow-sm"
                  title="Crear categoría"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Main Content: Documents */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="relative w-full sm:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar documentos..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={() => setIsUploadExpanded(!isUploadExpanded)}
                disabled={!selectedCategory}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isUploadExpanded 
                    ? 'bg-slate-100 text-slate-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'
                }`}
              >
                {isUploadExpanded ? <X className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                {isUploadExpanded ? 'Cancelar' : 'Subir Documento'}
              </button>
            </div>
          </div>

          {/* Upload Area (Collapsible) */}
          {isUploadExpanded && selectedCategory && (
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 animate-in slide-in-from-top-2 duration-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Nuevo Documento
              </h3>
              <form onSubmit={handleAddDocument} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Título del documento</label>
                  <input 
                    value={docTitle} 
                    onChange={e => setDocTitle(e.target.value)} 
                    placeholder="Ej. Reglamento Interno 2024"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Archivo PDF</label>
                  <div className="relative">
                    <input 
                      id="file-input" 
                      type="file" 
                      accept="application/pdf" 
                      onChange={handleFileChange} 
                      className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        cursor-pointer" 
                    />
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsUploadExpanded(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={busy || !file || !docTitle}
                    className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                  >
                    {busy ? 'Subiendo...' : 'Guardar Documento'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Documents List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
            {!selectedCategory ? (
              <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                <Folder className="w-16 h-16 mb-4 text-slate-200" />
                <p>Selecciona una categoría para ver los documentos</p>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                <FileText className="w-16 h-16 mb-4 text-slate-200" />
                <p>No hay documentos en esta categoría</p>
                <button 
                  onClick={() => setIsUploadExpanded(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
                >
                  Subir el primer documento
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-gray-700">
                {filteredDocs.map(doc => (
                  <div key={doc.id} className="group p-4 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0 text-red-500 dark:text-red-400 shadow-sm">
                      <FileText className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 dark:text-white truncate" title={doc.titulo}>
                        {doc.titulo}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 flex items-center gap-2">
                        <span className="bg-slate-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 font-mono text-[10px] uppercase tracking-wider border border-slate-200 dark:border-gray-600">PDF</span>
                        {doc.archivoName || 'Documento PDF'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => window.open(buildFileUrl(doc.archivo), '_blank')}
                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Ver documento"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a 
                        href={buildFileUrl(doc.archivo)} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                        title="Descargar"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <div className="w-px h-4 bg-slate-200 dark:bg-gray-700 mx-1"></div>
                      <button 
                        onClick={() => setEditingDoc({ id: doc.id, titulo: doc.titulo })}
                        className="p-2 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
