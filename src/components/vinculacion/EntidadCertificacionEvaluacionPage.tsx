// src/components/vinculacion/EntidadCertificacionEvaluacionPage.tsx
import React, { useEffect, useRef, useState } from "react";
import ImageViewModal from "./ImageViewModal";
import ConfirmModal from "./ConfirmModal";
import PdfViewModal from "./PdfViewModal";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Trash2,
  Eye,
  Download,
  Save,
} from "lucide-react";
import {
  getEntidadResources,
  uploadEntidadResource,
  deleteEntidadResource,
} from "../../services/entidadService";

type GalleryImage = {
  id: string;
  title: string;
  description?: string;
  url: string;
};

type PdfItem = {
  id: string;
  title: string;
  url: string;
};

const BACKEND_URL = import.meta.env.VITE_BACKENDURL || "http://localhost:3002";

// Small internal modal to capture title + description for images
const ImageMetaModal: React.FC<{
  open: boolean;
  preview?: string;
  defaultTitle?: string;
  defaultDescription?: string;
  onCancel: () => void;
  onConfirm: (title: string, description: string) => void;
}> = ({ open, preview, defaultTitle = "", defaultDescription = "", onCancel, onConfirm }) => {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);

  useEffect(() => {
    if (open) {
      setTitle(defaultTitle);
      setDescription(defaultDescription);
    }
  }, [open, defaultTitle, defaultDescription]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Agregar metadatos de la imagen</h3>
        <div className="flex gap-4">
          <div className="w-1/3">
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-md" />
            ) : (
              <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">Vista previa</div>
            )}
          </div>
          <div className="w-2/3 space-y-3">
            <div>
              <label className="text-sm font-medium">Título</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-md text-sm" placeholder="Título de la imagen" />
            </div>
            <div>
              <label className="text-sm font-medium">Descripción</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-md text-sm h-20" placeholder="Descripción (opcional)"></textarea>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-md border text-sm">Cancelar</button>
          <button onClick={() => onConfirm(title || "Sin título", description || "")} className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm">Agregar</button>
        </div>
      </div>
    </div>
  );
};

const EntidadCertificacionEvaluacionPage: React.FC = () => {
  // Images
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [pendingImageForMeta, setPendingImageForMeta] = useState<{ file: File; preview: string } | null>(null);
  const [imageMetaOpen, setImageMetaOpen] = useState(false);
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);
  const [confirmDeleteImageId, setConfirmDeleteImageId] = useState<string | null>(null);

  // PDFs (multiple)
  const [pdfs, setPdfs] = useState<PdfItem[]>([]);
  const [selectedPdfForView, setSelectedPdfForView] = useState<PdfItem | null>(null);
  const [confirmDeletePdfId, setConfirmDeletePdfId] = useState<string | null>(null);

  // UI
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const imagesInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  const loadResources = async () => {
    try {
      const resources: any[] = await getEntidadResources();

      const imgs = resources
        .filter((r) => r.tipo === "image")
        .map((r) => ({ id: r.id.toString(), title: r.titulo, description: r.descripcion ?? "", url: `${BACKEND_URL}${r.url}` }));

      const pdfList = resources
        .filter((r) => r.tipo === "pdf")
        .map((r) => ({ id: r.id.toString(), title: r.titulo, url: `${BACKEND_URL}${r.url}` }));

      setImages(imgs);
      setPdfs(pdfList);
    } catch (error) {
      console.error("Error loading entidad resources:", error);
      setToast({ type: "error", message: "Error al cargar los recursos." });
      setTimeout(() => setToast(null), 3000);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  // Image flow
  const onImagePicked: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Solo se permiten imágenes.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const preview = reader.result as string;
      setPendingImageForMeta({ file: f, preview });
      setImageMetaOpen(true);
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  const handleImageMetaConfirm = async (title: string, description: string) => {
    if (!pendingImageForMeta) return;
    setImageMetaOpen(false);
    setIsSaving(true);
    try {
      const form = new FormData();
      form.append("archivo", pendingImageForMeta.file);
      form.append("titulo", title);
      form.append("descripcion", description);
      form.append("tipo", "image");

      await uploadEntidadResource(form);
      setToast({ type: "success", message: "Imagen subida correctamente." });
      await loadResources();
    } catch (error) {
      console.error("Error uploading image:", error);
      setToast({ type: "error", message: "Error al subir la imagen." });
    } finally {
      setIsSaving(false);
      setPendingImageForMeta(null);
      setTimeout(() => setToast(null), 2500);
    }
  };

  const handleDeleteImageConfirmed = async (id: string) => {
    setConfirmDeleteImageId(null);
    setIsSaving(true);
    try {
      await deleteEntidadResource(parseInt(id));
      setToast({ type: "success", message: "Imagen eliminada." });
      await loadResources();
    } catch (error) {
      console.error("Error deleting image:", error);
      setToast({ type: "error", message: "Error al eliminar la imagen." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast(null), 2500);
    }
  };

  const handleImageDownload = (img: GalleryImage) => {
    const a = document.createElement("a");
    a.href = img.url;
    a.download = `${img.title || "imagen"}.png`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // PDFs flow (multiple allowed)
  const onPdfPicked: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const invalid = files.find((f) => f.type !== "application/pdf");
    if (invalid) {
      alert("Todos los archivos seleccionados deben ser PDFs.");
      e.target.value = "";
      return;
    }

    setIsSaving(true);
    let successCount = 0;
    try {
      for (const f of files) {
        const form = new FormData();
        form.append("archivo", f);
        form.append("titulo", f.name);
        form.append("tipo", "pdf");
        try {
          await uploadEntidadResource(form);
          successCount++;
        } catch (err) {
          console.error("Error uploading one pdf:", err);
        }
      }

      if (successCount > 0) {
        setToast({ type: "success", message: `${successCount} PDF(s) subido(s) correctamente.` });
      } else {
        setToast({ type: "error", message: "No se pudieron subir los PDFs." });
      }

      await loadResources();
    } catch (error) {
      console.error("Error uploading pdfs:", error);
      setToast({ type: "error", message: "Error al subir los PDFs." });
    } finally {
      setIsSaving(false);
      e.target.value = "";
      setTimeout(() => setToast(null), 2500);
    }
  };

  const handlePdfView = (pdf: PdfItem) => {
    setSelectedPdfForView(pdf);
  };

  const handlePdfDownload = (pdf: PdfItem) => {
    const a = document.createElement("a");
    a.href = pdf.url;
    a.download = pdf.title ?? "documento.pdf";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDeletePdfConfirmed = async (id: string) => {
    setConfirmDeletePdfId(null);
    setIsSaving(true);
    try {
      await deleteEntidadResource(parseInt(id));
      setToast({ type: "success", message: "PDF eliminado." });
      await loadResources();
    } catch (error) {
      console.error("Error deleting pdf:", error);
      setToast({ type: "error", message: "Error al eliminar el PDF." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast(null), 2500);
    }
  };

  const handleSaveAll = () => {
    loadResources();
    setToast({ type: "success", message: "Datos actualizados." });
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans text-gray-800">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entidad de Certificación y Evaluación</h1>
          <p className="text-sm text-gray-500 mt-2">Gestiona imágenes (con título y descripción) y múltiples documentos PDF relacionados a la entidad.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input ref={pdfInputRef} type="file" accept="application/pdf" multiple onChange={onPdfPicked} className="hidden" />
          <input ref={imagesInputRef} type="file" accept="image/*" onChange={onImagePicked} className="hidden" />

          <button onClick={() => pdfInputRef.current?.click()} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50">
            <Upload size={16} /> Subir PDF(s)
          </button>

          <button onClick={() => imagesInputRef.current?.click()} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50">
            <ImageIcon size={16} /> Subir Imagen
          </button>

          <button onClick={handleSaveAll} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50">
            <Save size={16} /> Actualizar
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PDFs column */}
        <section className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="text-gray-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-800">Documentos (PDF)</h3>
          </div>

          <div className="bg-white border rounded-xl shadow-sm p-4 min-h-[200px]">
            {pdfs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 bg-gray-50/50">
                <FileText size={32} className="mb-2 opacity-50" />
                <span className="text-sm">No hay PDFs cargados</span>
                <button onClick={() => pdfInputRef.current?.click()} className="mt-2 text-xs text-blue-600 font-medium hover:underline">Subir PDF(s)</button>
              </div>
            ) : (
              <div className="space-y-3">
                {pdfs.map((pdf) => (
                  <div key={pdf.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText size={22} className="text-red-500" />
                      <div>
                        <div className="text-sm font-medium truncate max-w-xs" title={pdf.title}>{pdf.title}</div>
                        <div className="text-xs text-gray-400">PDF</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => handlePdfView(pdf)} className="p-2 rounded hover:bg-gray-50">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handlePdfDownload(pdf)} className="p-2 rounded hover:bg-gray-50">
                        <Download size={16} />
                      </button>
                      <button onClick={() => setConfirmDeletePdfId(pdf.id)} className="p-2 rounded hover:bg-red-50 text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Images gallery */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="text-gray-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">Galería de Imágenes</h3>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{images.length}</span>
            </div>
          </div>

          <div className="bg-white border rounded-xl shadow-sm p-4 min-h-[300px]">
            {images.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 bg-gray-50/50">
                <ImageIcon size={48} className="mb-3 opacity-50" />
                <p className="text-sm">La galería está vacía.</p>
                <button onClick={() => imagesInputRef.current?.click()} className="mt-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">Añadir primera imagen</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="group border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow relative">
                    <div className="h-40 bg-gray-100 overflow-hidden relative cursor-pointer" onClick={() => setViewImageUrl(img.url)}>
                      <img src={img.url} alt={img.title} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="text-white drop-shadow-md" size={24} />
                      </div>
                    </div>

                    <div className="p-3">
                      <h4 className="text-sm font-semibold text-gray-800 truncate" title={img.title}>{img.title}</h4>
                      {img.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{img.description}</p>}

                      <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-gray-100">
                        <button onClick={() => handleImageDownload(img)} className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Descargar">
                          <Download size={16} />
                        </button>
                        <button onClick={() => setConfirmDeleteImageId(img.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Modals */}
      {imageMetaOpen && pendingImageForMeta && (
        <ImageMetaModal
          open={imageMetaOpen}
          preview={pendingImageForMeta.preview}
          onCancel={() => { setImageMetaOpen(false); setPendingImageForMeta(null); }}
          onConfirm={handleImageMetaConfirm}
        />
      )}

      <ImageViewModal open={!!viewImageUrl} imageUrl={viewImageUrl ?? undefined} onClose={() => setViewImageUrl(null)} />

      <ConfirmModal open={!!confirmDeleteImageId} title="Eliminar imagen" description="¿Deseas eliminar esta imagen?" onCancel={() => setConfirmDeleteImageId(null)} onConfirm={() => confirmDeleteImageId && handleDeleteImageConfirmed(confirmDeleteImageId)} />

      <ConfirmModal open={!!confirmDeletePdfId} title="Eliminar PDF" description="¿Deseas eliminar este PDF?" onCancel={() => setConfirmDeletePdfId(null)} onConfirm={() => confirmDeletePdfId && handleDeletePdfConfirmed(confirmDeletePdfId)} />

      {selectedPdfForView && (
        <PdfViewModal open={true} pdfUrl={selectedPdfForView.url} fileName={selectedPdfForView.title} onClose={() => setSelectedPdfForView(null)} onDownload={() => selectedPdfForView && handlePdfDownload(selectedPdfForView)} />
      )}

      {/* Toast */}
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

export default EntidadCertificacionEvaluacionPage;
