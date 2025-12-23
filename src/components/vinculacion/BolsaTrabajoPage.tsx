import React, { useEffect, useRef, useState } from "react";
import ImageViewModal from "./ImageViewModal";
import ConfirmModal from "./ConfirmModal";
import TitleModal from "./TitleModal";
import PdfViewModal from "./PdfViewModal";
import { Upload, FileText, Image as ImageIcon, Link as LinkIcon, Trash2, Eye, Download, Save } from "lucide-react";

type PdfItem = { id: string; title: string; description?: string; url: string; fileName?: string };

const STORAGE_PAGE_KEY = "bolsa_trabajo_page";
const STORAGE_BANNER_KEY = "bolsa_trabajo_banner";
const STORAGE_PDFS_KEY = "bolsa_trabajo_pdfs";
const STORAGE_LINK_KEY = "bolsa_trabajo_external_url";

const PdfMetaModal: React.FC<{
  open: boolean;
  defaultTitle?: string;
  defaultDescription?: string;
  onCancel: () => void;
  onConfirm: (title: string, description: string) => void;
}> = ({ open, defaultTitle = "", defaultDescription = "", onCancel, onConfirm }) => {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  useEffect(() => {
    setTitle(defaultTitle);
    setDescription(defaultDescription);
  }, [defaultTitle, defaultDescription, open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-lg w-full p-6 z-10">
        <h3 className="text-lg font-semibold mb-3">Información del PDF</h3>
        <label className="block text-sm text-gray-600">Título</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 mb-3 w-full border rounded px-3 py-2" />
        <label className="block text-sm text-gray-600">Descripción (opcional)</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 mb-4 w-full border rounded px-3 py-2" rows={4} />
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded border">Cancelar</button>
          <button onClick={() => onConfirm(title.trim(), description.trim())} className="px-4 py-2 rounded bg-blue-600 text-white">Agregar</button>
        </div>
      </div>
    </div>
  );
};

const BolsaTrabajoPage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");

  // banner
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bannerName, setBannerName] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [confirmDeleteBanner, setConfirmDeleteBanner] = useState(false);

  // pdfs
  const [pdfs, setPdfs] = useState<PdfItem[]>([]);
  const [pendingPdfFile, setPendingPdfFile] = useState<File | null>(null);
  const [pendingPdfDataUrl, setPendingPdfDataUrl] = useState<string | null>(null);
  const [pdfMetaModalOpen, setPdfMetaModalOpen] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<{ url: string | null; name?: string | null } | null>(null);
  const [confirmDeletePdfId, setConfirmDeletePdfId] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const p = localStorage.getItem(STORAGE_PAGE_KEY);
      if (p) {
        const parsed = JSON.parse(p);
        setTitle(parsed.title ?? "");
        setDescription(parsed.description ?? "");
      }
    } catch (e) {}
    try {
      const b = localStorage.getItem(STORAGE_BANNER_KEY);
      if (b) {
        const parsed = JSON.parse(b) as { url?: string; name?: string } | null;
        if (parsed) {
          setBannerUrl(parsed.url ?? null);
          setBannerName(parsed.name ?? null);
        }
      }
    } catch (e) {}
    try {
      const ps = localStorage.getItem(STORAGE_PDFS_KEY);
      if (ps) setPdfs(JSON.parse(ps));
    } catch (e) {}
    try {
      const l = localStorage.getItem(STORAGE_LINK_KEY);
      if (l) setExternalUrl(l);
    } catch (e) {}
  }, []);

  const persistPdfs = (next: PdfItem[]) => {
    setPdfs(next);
    try { localStorage.setItem(STORAGE_PDFS_KEY, JSON.stringify(next)); } catch (e) {}
  };

  const onBannerPicked: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!f.type.startsWith("image/")) { alert("El banner debe ser una imagen."); e.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setBannerUrl(dataUrl);
      setBannerName(f.name);
      try { localStorage.setItem(STORAGE_BANNER_KEY, JSON.stringify({ url: dataUrl, name: f.name })); } catch (err) {}
      setToast({ type: "success", message: "Banner cargado." }); setTimeout(() => setToast(null), 1800);
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  const handleDeleteBannerConfirmed = () => { setConfirmDeleteBanner(false); setBannerUrl(null); setBannerName(null); try { localStorage.removeItem(STORAGE_BANNER_KEY); } catch (e) {} setToast({ type: "success", message: "Banner eliminado." }); setTimeout(() => setToast(null), 1500); };

  const onPdfPicked: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (f.type !== "application/pdf") { alert("El archivo debe ser un PDF."); e.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => { const dataUrl = reader.result as string; setPendingPdfFile(f); setPendingPdfDataUrl(dataUrl); setPdfMetaModalOpen(true); };
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  const handleAddPdf = (titleMeta: string, descriptionMeta: string) => {
    if (!pendingPdfDataUrl || !pendingPdfFile) { setPdfMetaModalOpen(false); return; }
    const newItem: PdfItem = { id: String(Date.now()) + "-" + Math.random().toString(36).slice(2, 9), title: titleMeta || "Sin título", description: descriptionMeta || "", url: pendingPdfDataUrl, fileName: pendingPdfFile.name };
    persistPdfs([...pdfs, newItem]);
    setPendingPdfFile(null); setPendingPdfDataUrl(null); setPdfMetaModalOpen(false); setToast({ type: "success", message: "PDF agregado." }); setTimeout(() => setToast(null), 1500);
  };

  const handleCancelPdfMeta = () => { setPendingPdfFile(null); setPendingPdfDataUrl(null); setPdfMetaModalOpen(false); };

  const handlePdfDownload = (item: PdfItem) => { const a = document.createElement("a"); a.href = item.url; a.download = item.fileName ?? `${item.title || "document"}.pdf`; document.body.appendChild(a); a.click(); a.remove(); };

  const handleDeletePdfConfirmed = (id: string) => { setConfirmDeletePdfId(null); persistPdfs(pdfs.filter(p => p.id !== id)); setToast({ type: "success", message: "PDF eliminado." }); setTimeout(() => setToast(null), 1500); };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      try {
        localStorage.setItem(STORAGE_PAGE_KEY, JSON.stringify({ title, description }));
        if (bannerUrl || bannerName) localStorage.setItem(STORAGE_BANNER_KEY, JSON.stringify({ url: bannerUrl, name: bannerName }));
        localStorage.setItem(STORAGE_PDFS_KEY, JSON.stringify(pdfs));
        localStorage.setItem(STORAGE_LINK_KEY, externalUrl);
      } catch (e) {}
      await new Promise(r => setTimeout(r, 500));
      setToast({ type: "success", message: "Cambios guardados." });
    } catch (err) { setToast({ type: "error", message: "Error al guardar." }); }
    finally { setIsSaving(false); setTimeout(() => setToast(null), 2000); }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans text-gray-800">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bolsa de Trabajo</h1>
          <p className="text-sm text-gray-500 mt-2">Gestiona la información, enlace externo y documentos relacionados a la bolsa de trabajo.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input ref={bannerInputRef} type="file" accept="image/*" onChange={onBannerPicked} className="hidden" />
          <input ref={pdfInputRef} type="file" accept="application/pdf" onChange={onPdfPicked} className="hidden" />

          <button onClick={() => bannerInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm"><Upload size={16} /> Subir Banner</button>
          <button onClick={() => pdfInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"><FileText size={16} /> Agregar PDF</button>
          <button onClick={handleSaveAll} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"><Save size={16} /> {isSaving ? "Guardando..." : "Guardar"}</button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-1 space-y-4">
          <div className="bg-white border rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-semibold mb-3">Información</h3>
            <label className="block text-sm text-gray-600">Título</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 mb-3 w-full border rounded px-3 py-2" />
            <label className="block text-sm text-gray-600">Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" rows={4} />

            <label className="block text-sm text-gray-600 mt-3">Enlace externo (URL)</label>
            <div className="mt-1">
              <input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="www.ejemplo.com/bolsa" />
              <p className="mt-2 text-xs text-gray-500">Se guardará exactamente como lo escribas (por ejemplo: <code>www.google.com</code>).</p>
            </div>
          </div>

          <div className="bg-white border rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3"><ImageIcon size={18} /><h4 className="font-semibold">Banner (opcional)</h4></div>
            {bannerUrl ? (
              <div className="space-y-3">
                <div className="h-40 bg-gray-50 rounded overflow-hidden cursor-pointer" onClick={() => setImagePreviewUrl(bannerUrl)}>
                  <img src={bannerUrl} alt={bannerName ?? 'banner'} className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2"><button onClick={() => setImagePreviewUrl(bannerUrl)} className="flex-1 px-3 py-2 rounded border text-sm">Ver</button><button onClick={() => setConfirmDeleteBanner(true)} className="px-3 py-2 rounded border text-red-600">Eliminar</button></div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 bg-gray-50/50">
                <ImageIcon size={36} className="mb-2 opacity-50" />
                <div className="text-sm">No hay banner</div>
                <button onClick={() => bannerInputRef.current?.click()} className="mt-2 text-xs text-blue-600 font-medium hover:underline">Seleccionar imagen</button>
              </div>
            )}
          </div>
        </section>

        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><FileText size={18} /><h3 className="text-lg font-semibold">Documentos PDF (opcionales)</h3><span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{pdfs.length}</span></div></div>
          <div className="bg-white border rounded-xl shadow-sm p-4 min-h-[200px]">
            {pdfs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 bg-gray-50/50">
                <FileText size={48} className="mb-3 opacity-50" />
                <p className="text-sm">No hay PDFs agregados.</p>
                <button onClick={() => pdfInputRef.current?.click()} className="mt-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">Agregar PDF</button>
              </div>
            ) : (
              <div className="space-y-3">
                {pdfs.map(p => (
                  <div key={p.id} className="flex items-center gap-4 border rounded-lg p-3">
                    <div className="flex-1"><div className="flex items-baseline gap-3"><div className="text-sm font-semibold truncate">{p.title}</div><div className="text-xs text-gray-500">{p.fileName}</div></div>{p.description && <div className="text-sm text-gray-600 mt-1">{p.description}</div>}</div>
                    <div className="flex items-center gap-2"><button onClick={() => setPdfPreview({ url: p.url, name: p.fileName || p.title })} className="p-2 rounded border" title="Ver"><Eye size={16} /></button><button onClick={() => handlePdfDownload(p)} className="p-2 rounded border" title="Descargar"><Download size={16} /></button><button onClick={() => setConfirmDeletePdfId(p.id)} className="p-2 rounded border text-red-600" title="Eliminar"><Trash2 size={16} /></button></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <PdfMetaModal open={pdfMetaModalOpen} onCancel={handleCancelPdfMeta} onConfirm={handleAddPdf} />
      <PdfViewModal open={!!pdfPreview} pdfUrl={pdfPreview?.url ?? undefined} fileName={pdfPreview?.name ?? undefined} onClose={() => setPdfPreview(null)} onDownload={() => { if (pdfPreview?.url) { const a = document.createElement('a'); a.href = pdfPreview.url; a.download = pdfPreview.name ?? 'document.pdf'; document.body.appendChild(a); a.click(); a.remove(); } }} />
      <ImageViewModal open={!!imagePreviewUrl} imageUrl={imagePreviewUrl ?? undefined} onClose={() => setImagePreviewUrl(null)} />
      <ConfirmModal open={confirmDeleteBanner} title="Eliminar banner" description="¿Deseas eliminar el banner?" onCancel={() => setConfirmDeleteBanner(false)} onConfirm={handleDeleteBannerConfirmed} />
      <ConfirmModal open={!!confirmDeletePdfId} title="Eliminar PDF" description="¿Deseas eliminar este PDF?" onCancel={() => setConfirmDeletePdfId(null)} onConfirm={() => confirmDeletePdfId && handleDeletePdfConfirmed(confirmDeletePdfId)} />

      {toast && (<div className="fixed right-6 bottom-6 z-50"><div className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${toast.type === "success" ? "bg-gray-900 text-white" : "bg-red-600 text-white"}`}><span className="text-sm font-medium">{toast.message}</span></div></div>)}
    </div>
  );
};

export default BolsaTrabajoPage;
