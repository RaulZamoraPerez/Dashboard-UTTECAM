import React, { useEffect, useRef, useState } from "react";
import ImageViewModal from "./ImageViewModal";
import ConfirmModal from "./ConfirmModal";
import TitleModal from "./TitleModal";
import PdfViewModal from "./PdfViewModal";
import { Upload, FileText, Image as ImageIcon, FolderPlus, Trash2, Eye, Download, Save, Plus } from "lucide-react";

/*
  Estructura de datos:
  - Folder: agrupa varios MediaItem (por ejemplo: "Servicios tecnologicos realizados en 2025")
  - MediaItem: imagen + título + descripción + pdf opcional
*/

type PdfFile = { url: string; name?: string };

type MediaItem = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string; // dataURL
  pdf?: PdfFile | null;
};

type Folder = {
  id: string;
  title: string; // Ej: "Servicios tecnológicos realizados en 2025"
  items: MediaItem[];
};

const STORAGE_KEY = "serv_tecnologicos_realizados_v1";

// Modal para crear/editar carpeta (title only)
const FolderModal: React.FC<{
  open: boolean;
  defaultTitle?: string;
  onCancel: () => void;
  onConfirm: (title: string) => void;
}> = ({ open, defaultTitle = "", onCancel, onConfirm }) => {
  const [title, setTitle] = useState(defaultTitle);
  useEffect(() => setTitle(defaultTitle), [defaultTitle, open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6 z-10">
        <h3 className="text-lg font-semibold mb-3">Nombre de la carpeta</h3>
        <label className="text-sm text-gray-600">Título (p. ej. "Servicios tecnológicos realizados en 2025")</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 mb-4 w-full border rounded px-3 py-2" />
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded border">Cancelar</button>
          <button onClick={() => onConfirm(title.trim() || "Sin título")} className="px-4 py-2 rounded bg-blue-600 text-white">Guardar</button>
        </div>
      </div>
    </div>
  );
};

const ServiciosTecnologicosRealizadosPage: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);

  // UI
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modals / temporary state
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [pendingFolderEditId, setPendingFolderEditId] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [pdfPreview, setPdfPreview] = useState<{ url: string | null; name?: string | null } | null>(null);
  const [confirmDeleteFolderId, setConfirmDeleteFolderId] = useState<string | null>(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<{ folderId: string; itemId: string } | null>(null);

  // For adding images/pdfs we use refs and pending ids
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingFolderForImage, setPendingFolderForImage] = useState<string | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingImageDataUrl, setPendingImageDataUrl] = useState<string | null>(null);

  const [pendingItemForPdf, setPendingItemForPdf] = useState<{ folderId: string; itemId: string } | null>(null);
  const [pendingPdfFile, setPendingPdfFile] = useState<File | null>(null);
  const [pendingPdfDataUrl, setPendingPdfDataUrl] = useState<string | null>(null);

  // We reuse TitleModal to get title/description for a new image item
  const [titleModalOpen, setTitleModalOpen] = useState(false);
  const [titleModalDefault, setTitleModalDefault] = useState<{ title?: string; description?: string }>({});

  // Load persisted
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setFolders(JSON.parse(raw));
    } catch (e) {}
  }, []);

  // Persist helper
  const persist = (next: Folder[]) => {
    setFolders(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (e) {}
  };

  // Folder actions
  const handleCreateFolder = (title: string) => {
    const f: Folder = { id: String(Date.now()) + "-" + Math.random().toString(36).slice(2, 9), title: title || "Sin título", items: [] };
    persist([f, ...folders]);
    setFolderModalOpen(false);
    setToast({ type: "success", message: "Carpeta creada." });
    setTimeout(() => setToast(null), 1800);
  };

  const handleEditFolder = (id: string, title: string) => {
    const next = folders.map(f => f.id === id ? { ...f, title } : f);
    persist(next);
    setPendingFolderEditId(null);
    setFolderModalOpen(false);
    setToast({ type: "success", message: "Carpeta actualizada." });
    setTimeout(() => setToast(null), 1500);
  };

  const handleDeleteFolderConfirmed = () => {
    if (!confirmDeleteFolderId) return;
    persist(folders.filter(f => f.id !== confirmDeleteFolderId));
    setConfirmDeleteFolderId(null);
    setToast({ type: "success", message: "Carpeta eliminada." });
    setTimeout(() => setToast(null), 1500);
  };

  // Image flow: click "Añadir imagen" in a folder -> open file picker -> after read, open TitleModal -> create item
  const onAddImageClick = (folderId: string) => {
    setPendingFolderForImage(folderId);
    imageInputRef.current?.click();
  };

  const onImagePicked: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!f.type.startsWith("image/")) { alert("Solo imágenes."); e.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPendingImageFile(f);
      setPendingImageDataUrl(dataUrl);
      setTitleModalDefault({ title: "", description: "" });
      setTitleModalOpen(true);
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  const handleTitleModalConfirm = (t: string, d?: string) => {
    if (!pendingFolderForImage || !pendingImageDataUrl) {
      setPendingImageFile(null);
      setPendingImageDataUrl(null);
      setPendingFolderForImage(null);
      setTitleModalOpen(false);
      return;
    }
    const newItem: MediaItem = { id: String(Date.now()) + "-" + Math.random().toString(36).slice(2, 9), title: t || "Sin título", description: d || "", imageUrl: pendingImageDataUrl, pdf: null };
    const next = folders.map(f => f.id === pendingFolderForImage ? { ...f, items: [...f.items, newItem] } : f);
    persist(next);
    setPendingImageFile(null);
    setPendingImageDataUrl(null);
    setPendingFolderForImage(null);
    setTitleModalOpen(false);
    setToast({ type: "success", message: "Imagen añadida." });
    setTimeout(() => setToast(null), 1500);
  };

  const handleTitleModalCancel = () => {
    setPendingImageFile(null);
    setPendingImageDataUrl(null);
    setPendingFolderForImage(null);
    setTitleModalOpen(false);
  };

  // Add/replace PDF for an existing item
  const onAddPdfToItem = (folderId: string, itemId: string) => {
    setPendingItemForPdf({ folderId, itemId });
    pdfInputRef.current?.click();
  };

  const onPdfPicked: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (f.type !== "application/pdf") { alert("Solo PDF."); e.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPendingPdfFile(f);
      setPendingPdfDataUrl(dataUrl);

      // attach directly to item (no extra metadata required here)
      if (pendingItemForPdf) {
        const next = folders.map(fold => {
          if (fold.id !== pendingItemForPdf.folderId) return fold;
          return { ...fold, items: fold.items.map(it => it.id === pendingItemForPdf.itemId ? { ...it, pdf: { url: dataUrl, name: f.name } } : it) };
        });
        persist(next);
        setPendingItemForPdf(null);
        setPendingPdfFile(null);
        setPendingPdfDataUrl(null);
        setToast({ type: "success", message: "PDF adjuntado al ítem." });
        setTimeout(() => setToast(null), 1500);
      }
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  // Item level actions
  const handleDeleteItemConfirmed = () => {
    if (!confirmDeleteItem) return;
    const next = folders.map(fold => fold.id === confirmDeleteItem.folderId ? { ...fold, items: fold.items.filter(i => i.id !== confirmDeleteItem.itemId) } : fold);
    persist(next);
    setConfirmDeleteItem(null);
    setToast({ type: "success", message: "Ítem eliminado." });
    setTimeout(() => setToast(null), 1500);
  };

  const handleDownloadPdf = (pdf?: PdfFile | null) => {
    if (!pdf?.url) return;
    const a = document.createElement("a");
    a.href = pdf.url;
    a.download = pdf.name ?? "document.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      persist(folders);
      await new Promise(r => setTimeout(r, 400));
      setToast({ type: "success", message: "Cambios guardados." });
    } catch (e) { setToast({ type: "error", message: "Error al guardar." }); }
    finally { setIsSaving(false); setTimeout(() => setToast(null), 1800); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans text-gray-800">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Servicios Tecnológicos realizados</h1>
          <p className="text-sm text-gray-500 mt-2">Agrupa evidencias por carpetas (por ejemplo: por año) y añade imágenes con título, descripción y PDF opcional.</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => { setPendingFolderEditId(null); setFolderModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm"><FolderPlus size={16} /> Nueva carpeta</button>
          <button onClick={handleSaveAll} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"><Save size={16} /> {isSaving ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </header>

      <main className="grid grid-cols-1 gap-6">
        {folders.length === 0 ? (
          <div className="bg-white border rounded-xl shadow-sm p-6 text-center">
            <p className="text-gray-600">No hay carpetas aún. Crea una nueva carpeta (por ejemplo "Servicios tecnológicos realizados en 2025") para comenzar.</p>
            <button onClick={() => setFolderModalOpen(true)} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded"> <Plus size={14} /> Crear carpeta</button>
          </div>
        ) : (
          folders.map(folder => (
            <div key={folder.id} className="bg-white border rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{folder.title}</h2>
                  <div className="text-xs text-gray-500">{folder.items.length} ítems</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setPendingFolderEditId(folder.id); setFolderModalOpen(true); }} className="px-3 py-2 rounded border text-sm">Editar</button>
                  <button onClick={() => setConfirmDeleteFolderId(folder.id)} className="px-3 py-2 rounded border text-red-600">Eliminar</button>
                </div>
              </div>

              <div className="mb-4">
                <button onClick={() => onAddImageClick(folder.id)} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded"><Upload size={14} /> Añadir imagen</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {folder.items.map(item => (
                  <div key={item.id} className="border rounded-lg overflow-hidden group bg-gray-50">
                    <div className="h-40 bg-gray-200 cursor-pointer" onClick={() => setImagePreviewUrl(item.imageUrl ?? null)}>
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No hay imagen</div>}
                    </div>
                    <div className="p-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="text-sm font-semibold truncate">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.pdf ? 'PDF adjunto' : 'Sin PDF'}</div>
                      </div>
                      {item.description && <div className="text-sm text-gray-600 mt-1">{item.description}</div>}

                      <div className="flex items-center gap-2 mt-3">
                        <button onClick={() => setImagePreviewUrl(item.imageUrl ?? null)} className="p-2 rounded border" title="Ver imagen"><Eye size={16} /></button>
                        {item.pdf ? (
                          <>
                            <button onClick={() => { setPdfPreview({ url: item.pdf?.url ?? null, name: item.pdf?.name }); }} className="p-2 rounded border" title="Ver PDF"><FileText size={16} /></button>
                            <button onClick={() => handleDownloadPdf(item.pdf)} className="p-2 rounded border" title="Descargar PDF"><Download size={16} /></button>
                          </>
                        ) : (
                          <button onClick={() => onAddPdfToItem(folder.id, item.id)} className="p-2 rounded border text-sm">Adjuntar PDF</button>
                        )}

                        <button onClick={() => setConfirmDeleteItem({ folderId: folder.id, itemId: item.id })} className="ml-auto p-2 rounded border text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      {/* Hidden inputs for file picking */}
      <input ref={imageInputRef} type="file" accept="image/*" onChange={onImagePicked} className="hidden" />
      <input ref={pdfInputRef} type="file" accept="application/pdf" onChange={onPdfPicked} className="hidden" />

      {/* Modals */}
      <FolderModal open={folderModalOpen} defaultTitle={pendingFolderEditId ? (folders.find(f => f.id === pendingFolderEditId)?.title ?? "") : ""} onCancel={() => { setFolderModalOpen(false); setPendingFolderEditId(null); }} onConfirm={(t) => { if (pendingFolderEditId) handleEditFolder(pendingFolderEditId, t); else handleCreateFolder(t); }} />

      <TitleModal open={titleModalOpen} defaultTitle={titleModalDefault.title} onCancel={handleTitleModalCancel} onConfirm={(t, d) => handleTitleModalConfirm(t, d)} />

      <ImageViewModal open={!!imagePreviewUrl} imageUrl={imagePreviewUrl ?? undefined} onClose={() => setImagePreviewUrl(null)} />

      <PdfViewModal open={!!pdfPreview} pdfUrl={pdfPreview?.url ?? undefined} fileName={pdfPreview?.name ?? undefined} onClose={() => setPdfPreview(null)} onDownload={() => { if (pdfPreview?.url) { const a = document.createElement('a'); a.href = pdfPreview.url; a.download = pdfPreview.name ?? 'document.pdf'; document.body.appendChild(a); a.click(); a.remove(); } }} />

      <ConfirmModal open={!!confirmDeleteFolderId} title="Eliminar carpeta" description="¿Deseas eliminar esta carpeta y todo su contenido?" onCancel={() => setConfirmDeleteFolderId(null)} onConfirm={handleDeleteFolderConfirmed} />

      <ConfirmModal open={!!confirmDeleteItem} title="Eliminar ítem" description="¿Deseas eliminar este ítem?" onCancel={() => setConfirmDeleteItem(null)} onConfirm={handleDeleteItemConfirmed} />

      {toast && (
        <div className="fixed right-6 bottom-6 z-50">
          <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${toast.type === "success" ? "bg-gray-900 text-white" : "bg-red-600 text-white"}`}>
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiciosTecnologicosRealizadosPage;
