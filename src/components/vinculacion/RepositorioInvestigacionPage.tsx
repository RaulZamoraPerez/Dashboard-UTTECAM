// src/components/vinculacion/RepositorioInvestigacionPage.tsx
import React, { useEffect, useRef, useState } from "react";
import PdfViewModal from "./PdfViewModal";
import ConfirmModal from "./ConfirmModal";
import { 
  ChevronDown, 
  ChevronRight, 
  Folder, 
  FileText, 
  Upload, 
  Trash2, 
  Eye, 
  Download, 
  FolderPlus, 
  Edit, // Nuevo icono
  X 
} from "lucide-react";
import { productoInvestigacionService } from "../../services/productoInvestigacionService";

// --- TIPOS ---
type RepoPdf = {
  id: string;
  title: string;
  name?: string;
  url: string;
  folderName: string; // Cambiamos 'year' por 'folderName' para ser más genéricos
};

// --- CONSTANTES ---
const STORAGE_FOLDERS_KEY = "repositorio_investigacion_folders";
const API_URL = import.meta.env.VITE_BACKENDURL || '';

// Carpetas por defecto (si no hay nada guardado)
const DEFAULT_FOLDERS = [
  "Productos de Investigación 2025",
  "Productos de Investigación 2024",
  "Productos de Investigación 2023",
  "Productos de Investigación 2022",
  "Productos de Investigación 2021",
];

const RepositorioInvestigacionPage: React.FC = () => {
  // --- ESTADOS ---
  const [pdfs, setPdfs] = useState<RepoPdf[]>([]);
  const [folders, setFolders] = useState<string[]>(DEFAULT_FOLDERS);
  
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);

  // Vista y Edición
  const [viewPdfUrl, setViewPdfUrl] = useState<string | null>(null);
  const [viewPdfName, setViewPdfName] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Estados para Nueva Carpeta
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Estados para Renombrar Carpeta
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState<string | null>(null);
  const [newNameValue, setNewNameValue] = useState("");

  // Flujo de carga (Cola de archivos)
  const [pendingFiles, setPendingFiles] = useState<{ file: File; preview: string }[]>([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // Datos temporales para el modal de edición
  const [tempTitle, setTempTitle] = useState("");
  const [tempFolder, setTempFolder] = useState("");

  // UI Generales
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  // --- CARGA INICIAL ---
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Cargar Carpetas (LocalStorage para persistir vacías)
      const storedFolders = localStorage.getItem(STORAGE_FOLDERS_KEY);
      let currentFolders = DEFAULT_FOLDERS;
      
      if (storedFolders) {
        currentFolders = JSON.parse(storedFolders);
        setFolders(currentFolders);
      }

      // Cargar PDFs (API)
      const data = await productoInvestigacionService.getAll();
      
      const mappedPdfs: RepoPdf[] = data.map(item => ({
        id: item.id.toString(),
        title: item.titulo,
        name: item.pdf.split('/').pop() || 'documento.pdf',
        url: `${API_URL}/uploads/${item.pdf}`,
        folderName: item.carpeta
      }));
      
      setPdfs(mappedPdfs);

      // Asegurar que todas las carpetas de la BD existan en la lista
      const dbFolders = Array.from(new Set(mappedPdfs.map(p => p.folderName)));
      const newFolders = [...currentFolders];
      let changed = false;
      
      dbFolders.forEach(f => {
        if (!newFolders.includes(f)) {
          newFolders.push(f);
          changed = true;
        }
      });

      if (changed) {
        setFolders(newFolders);
        localStorage.setItem(STORAGE_FOLDERS_KEY, JSON.stringify(newFolders));
      }

      // Expandir la primera carpeta por defecto si no hay expandidas
      if (newFolders.length > 0 && expandedFolders.length === 0) {
        setExpandedFolders([newFolders[0]]);
      }

    } catch (e) { 
      console.error(e); 
      setToast({ type: "error", message: "Error al cargar datos del servidor." });
    }
  };

  // --- PERSISTENCIA ---
  const persistFolders = (next: string[]) => {
    setFolders(next);
    localStorage.setItem(STORAGE_FOLDERS_KEY, JSON.stringify(next));
  };

  // --- LÓGICA DE CARPETAS ---
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    if (folders.includes(newFolderName.trim())) {
      setToast({ type: "error", message: "Ya existe una carpeta con ese nombre." });
      setTimeout(() => setToast(null), 2000);
      return;
    }

    const updatedFolders = [newFolderName.trim(), ...folders]; // Añadir al principio
    persistFolders(updatedFolders);
    setExpandedFolders(prev => [...prev, newFolderName.trim()]); // Auto expandir la nueva
    setNewFolderName("");
    setIsFolderModalOpen(false);
    setToast({ type: "success", message: "Carpeta creada exitosamente." });
    setTimeout(() => setToast(null), 2000);
  };

  const handleRenameClick = (folder: string) => {
    setFolderToRename(folder);
    setNewNameValue(folder);
    setIsRenameModalOpen(true);
  };

  const handleRenameConfirm = async () => {
    if (!folderToRename || !newNameValue.trim()) return;
    if (newNameValue.trim() === folderToRename) {
        setIsRenameModalOpen(false);
        return;
    }
    if (folders.includes(newNameValue.trim())) {
        setToast({ type: "error", message: "Ya existe una carpeta con ese nombre." });
        setTimeout(() => setToast(null), 2000);
        return;
    }

    try {
        setIsSaving(true);
        const newName = newNameValue.trim();
        
        // 1. Actualizar items en Backend
        const itemsInFolder = pdfs.filter(p => p.folderName === folderToRename);
        
        // Actualizamos cada item. El backend permite actualizar solo metadatos si no se envía archivo.
        const updatePromises = itemsInFolder.map(item => {
            const formData = new FormData();
            formData.append('titulo', item.title);
            formData.append('carpeta', newName);
            return productoInvestigacionService.update(parseInt(item.id), formData);
        });

        await Promise.all(updatePromises);

        // 2. Actualizar Estado Local
        const updatedFolders = folders.map(f => f === folderToRename ? newName : f);
        persistFolders(updatedFolders);
        
        // Actualizar PDFs localmente
        setPdfs(prev => prev.map(p => p.folderName === folderToRename ? { ...p, folderName: newName } : p));

        // Actualizar estado de expandidos
        if (expandedFolders.includes(folderToRename)) {
            setExpandedFolders(prev => prev.map(f => f === folderToRename ? newName : f));
        }

        setToast({ type: "success", message: "Carpeta renombrada." });
        setIsRenameModalOpen(false);
    } catch (error) {
        console.error(error);
        setToast({ type: "error", message: "Error al renombrar carpeta." });
    } finally {
        setIsSaving(false);
        setTimeout(() => setToast(null), 2000);
    }
  };

  const handleDeleteFolder = async (folderName: string) => {
    const filesInFolder = pdfs.filter(p => p.folderName === folderName);
    
    if (filesInFolder.length > 0) {
        const confirm = window.confirm(`La carpeta "${folderName}" contiene ${filesInFolder.length} documentos.\n\n¿Estás seguro de que quieres eliminarla y TODO su contenido?`);
        if (!confirm) return;

        try {
            setIsSaving(true);
            // Eliminar todos los archivos en backend
            const deletePromises = filesInFolder.map(f => productoInvestigacionService.delete(parseInt(f.id)));
            await Promise.all(deletePromises);
            
            // Eliminar de estado local
            setPdfs(prev => prev.filter(p => p.folderName !== folderName));
        } catch (error) {
            console.error(error);
            setToast({ type: "error", message: "Error al eliminar contenidos de la carpeta." });
            setIsSaving(false);
            setTimeout(() => setToast(null), 2000);
            return;
        }
    } else {
        const confirm = window.confirm(`¿Eliminar la carpeta vacía "${folderName}"?`);
        if (!confirm) return;
    }

    // Eliminar carpeta de la lista
    persistFolders(folders.filter(f => f !== folderName));
    setToast({ type: "success", message: "Carpeta eliminada." });
    setIsSaving(false);
    setTimeout(() => setToast(null), 2000);
  };

  // --- SELECCIÓN DE ARCHIVOS ---
  const openPdfPicker = () => pdfInputRef.current?.click();

  const onPdfPicked: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const pdfFiles = files.filter((f) => f.type === "application/pdf");
    if (pdfFiles.length === 0) {
      alert("Solo se permiten archivos PDF.");
      e.target.value = "";
      return;
    }

    const readers = pdfFiles.map(f => 
      new Promise<{ file: File; preview: string }>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ file: f, preview: reader.result as string });
        reader.readAsDataURL(f);
      })
    );

    Promise.all(readers).then((items) => {
      setPendingFiles(prev => [...prev, ...items]);
      if (!isDetailsModalOpen && items.length > 0) {
        setupModalForFile(items[0]);
      }
    });
    e.target.value = "";
  };

  // --- MODAL DE DETALLES ---
  const setupModalForFile = (item: { file: File }) => {
    setTempTitle(item.file.name.replace(".pdf", ""));
    // Seleccionar la primera carpeta disponible por defecto
    setTempFolder(folders[0] || ""); 
    setIsDetailsModalOpen(true);
  };

  const handleDetailsConfirm = async () => {
    const queue = [...pendingFiles];
    if (queue.length === 0) return;
    if (!tempFolder) {
      alert("Debes seleccionar o crear una carpeta primero.");
      return;
    }

    const current = queue[0];
    
    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('titulo', tempTitle || "Sin título");
      formData.append('carpeta', tempFolder);
      formData.append('pdf', current.file);

      await productoInvestigacionService.create(formData);
      
      // Recargar datos para obtener el ID real y URL
      await loadData();

      if (!expandedFolders.includes(tempFolder)) {
        setExpandedFolders(prev => [...prev, tempFolder]);
      }

      queue.shift();
      setPendingFiles(queue);

      if (queue.length > 0) {
        setupModalForFile(queue[0]);
      } else {
        setIsDetailsModalOpen(false);
        setToast({ type: "success", message: "Documento añadido correctamente." });
        setTimeout(() => setToast(null), 2000);
      }
    } catch (error) {
      console.error(error);
      setToast({ type: "error", message: "Error al subir el documento." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDetailsCancel = () => {
    const queue = [...pendingFiles];
    queue.shift();
    setPendingFiles(queue);

    if (queue.length > 0) {
      setupModalForFile(queue[0]);
    } else {
      setIsDetailsModalOpen(false);
    }
  };

  // --- ACCIONES GENERALES ---
  const handleDeleteConfirmed = async (id: string) => {
    try {
      await productoInvestigacionService.delete(parseInt(id));
      setPdfs(pdfs.filter(p => p.id !== id));
      setToast({ type: "success", message: "PDF eliminado." });
    } catch (error) {
      console.error(error);
      setToast({ type: "error", message: "Error al eliminar el documento." });
    } finally {
      setConfirmDeleteId(null);
      setTimeout(() => setToast(null), 1800);
    }
  };

  const handleSaveAll = async () => {
    // Esta función ya no es necesaria porque guardamos al crear
    // Pero la mantenemos para feedback visual o futuras implementaciones batch
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 800)); 
    setIsSaving(false);
    setToast({ type: "success", message: "Sincronizado." });
    setTimeout(() => setToast(null), 2000);
  };

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => 
      prev.includes(folder) ? prev.filter(f => f !== folder) : [...prev, folder]
    );
  };


  return (
    <div className="p-6 max-w-6xl mx-auto font-sans text-gray-800">
      
      {/* HEADER */}
      <header className="mb-8 border-b pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Repositorio Digital</h1>
            <p className="text-gray-500 mt-2">Productos de Investigación organizados por carpetas.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <input ref={pdfInputRef} type="file" accept="application/pdf" multiple className="hidden" onChange={onPdfPicked} />
            
            {/* BOTÓN NUEVA CARPETA */}
            <button 
              onClick={() => setIsFolderModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <FolderPlus size={16} className="text-gray-600" />
              Nueva Carpeta
            </button>

            <button 
              onClick={openPdfPicker} 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Upload size={16} />
              Subir PDF
            </button>
            
            <button 
              onClick={handleSaveAll} 
              disabled={isSaving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO (CARPETAS) */}
      <main className="space-y-4 min-h-[300px]">
        {folders.length === 0 && (
          <div className="text-center py-10 bg-gray-50 border-2 border-dashed rounded-lg">
             <p className="text-gray-400">No hay carpetas creadas.</p>
             <button onClick={() => setIsFolderModalOpen(true)} className="text-blue-600 hover:underline mt-2 text-sm">Crear la primera carpeta</button>
          </div>
        )}

        {folders.map(folderName => {
          const pdfsInFolder = pdfs.filter(p => p.folderName === folderName);
          const isOpen = expandedFolders.includes(folderName);

          return (
            <div key={folderName} className="border rounded-lg bg-white shadow-sm overflow-hidden">
              {/* Header del Acordeón (Carpeta) */}
              <div className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors border-b last:border-0 group">
                <button 
                  onClick={() => toggleFolder(folderName)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <div className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                    {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>
                  <Folder className="text-yellow-500 fill-yellow-500/20" size={20} />
                  <h2 className="text-lg font-semibold text-gray-800">{folderName}</h2>
                  <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                    {pdfsInFolder.length}
                  </span>
                </button>
                
                {/* Botones de Acción Carpeta */}
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRenameClick(folderName); }}
                    className="text-gray-400 hover:text-blue-600 p-2"
                    title="Renombrar carpeta"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folderName); }}
                    className="text-gray-400 hover:text-red-600 p-2"
                    title="Eliminar carpeta"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Contenido de la Carpeta */}
              {isOpen && (
                <div className="p-5 bg-white animate-in fade-in slide-in-from-top-2 duration-300">
                  {pdfsInFolder.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed rounded-lg">
                      Carpeta vacía. Sube un PDF para verlo aquí.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pdfsInFolder.map(pdf => (
                        <div key={pdf.id} className="group border border-gray-200 hover:border-blue-300 rounded-lg p-4 transition-all hover:shadow-md flex flex-col justify-between">
                          <div>
                            <div className="flex items-start gap-3 mb-2">
                              <FileText className="text-red-500 shrink-0 mt-1" size={20} />
                              <div>
                                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight" title={pdf.title}>
                                  {pdf.title}
                                </h3>
                                <p className="text-xs text-gray-400 mt-1 truncate">{pdf.name}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                            <button 
                              onClick={() => { setViewPdfUrl(pdf.url); setViewPdfName(pdf.title); }}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Ver"
                            >
                              <Eye size={16} />
                            </button>
                            <a 
                              href={pdf.url} 
                              download={pdf.name || `${pdf.title}.pdf`}
                              className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Descargar"
                            >
                              <Download size={16} />
                            </a>
                            <button 
                              onClick={() => setConfirmDeleteId(pdf.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </main>

      {/* --- MODALES --- */}

      {/* MODAL CREAR CARPETA */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-3 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800">Nueva Carpeta</h3>
              <button onClick={() => setIsFolderModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la carpeta</label>
              <input 
                type="text" 
                value={newFolderName} 
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej. Investigación 2026"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
            </div>
            <div className="px-5 py-3 bg-gray-50 flex justify-end gap-2 border-t">
              <button onClick={() => setIsFolderModalOpen(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-md">Cancelar</button>
              <button onClick={handleCreateFolder} className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md">Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RENOMBRAR CARPETA */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-3 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800">Renombrar Carpeta</h3>
              <button onClick={() => setIsRenameModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo nombre</label>
              <input 
                type="text" 
                value={newNameValue} 
                onChange={(e) => setNewNameValue(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleRenameConfirm()}
              />
            </div>
            <div className="px-5 py-3 bg-gray-50 flex justify-end gap-2 border-t">
              <button onClick={() => setIsRenameModalOpen(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-md">Cancelar</button>
              <button onClick={handleRenameConfirm} className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES ARCHIVO */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">Detalles del Documento</h3>
              <p className="text-xs text-gray-500 mt-0.5">Archivo: {pendingFiles[0]?.file.name}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título del Producto</label>
                <input 
                  type="text" 
                  value={tempTitle} 
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2 text-sm"
                  placeholder="Ej: Artículo de investigación..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Carpeta</label>
                <div className="relative">
                  <select 
                    value={tempFolder} 
                    onChange={(e) => setTempFolder(e.target.value)}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2 text-sm appearance-none bg-white"
                  >
                    {folders.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
                </div>
                <button 
                  onClick={() => { setIsFolderModalOpen(true); }} // Abrir modal carpeta sobre este
                  className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1"
                >
                  <FolderPlus size={12} />
                  Crear nueva carpeta si no existe
                </button>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2 border-t">
              <button onClick={handleDetailsCancel} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">Cancelar</button>
              <button onClick={handleDetailsConfirm} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">Guardar Documento</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VIEWER */}
      <PdfViewModal 
        open={!!viewPdfUrl} 
        pdfUrl={viewPdfUrl ?? undefined} 
        fileName={viewPdfName ?? undefined} 
        onClose={() => { setViewPdfUrl(null); setViewPdfName(null); }} 
        onDownload={() => { 
          if (viewPdfUrl) { 
            const a = document.createElement("a"); 
            a.href = viewPdfUrl; 
            a.download = viewPdfName ?? "doc.pdf"; 
            document.body.appendChild(a); a.click(); a.remove(); 
          } 
        }} 
      />

      {/* CONFIRM DELETE */}
      <ConfirmModal 
        open={!!confirmDeleteId} 
        title="Eliminar Producto" 
        description="¿Estás seguro de que deseas eliminar este producto?" 
        onCancel={() => setConfirmDeleteId(null)} 
        onConfirm={() => confirmDeleteId && handleDeleteConfirmed(confirmDeleteId)} 
      />

      {/* TOAST */}
      {toast && (
        <div className="fixed right-6 bottom-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${toast.type === "success" ? "bg-gray-900 text-white" : "bg-red-600 text-white"}`}>
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default RepositorioInvestigacionPage;