// src/components/vinculacion/CatalogosServiciosPage.tsx
import React, { useEffect, useRef, useState } from "react";
import ImageViewModal from "./ImageViewModal";
import ConfirmModal from "./ConfirmModal";
import TitleModal from "./TitleModal";
import PdfViewModal from "./PdfViewModal";
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  Eye, 
  Download, 
  Save 
} from "lucide-react";
import { 
  getServicios, 
  createServicio, 
  deleteServicio, 
  ServicioTecnologico 
} from "../../services/serviciosTecnologicosService";

const API_URL = import.meta.env.VITE_BACKENDURL || 'http://localhost:3000';

const CatalogosServiciosPage: React.FC = () => {
  // --- PDF State ---
  const [pdfService, setPdfService] = useState<ServicioTecnologico | null>(null);
  const [pdfViewOpen, setPdfViewOpen] = useState(false);
  const [pdfConfirmDeleteOpen, setPdfConfirmDeleteOpen] = useState(false);

  // --- Images Gallery State ---
  const [imageServices, setImageServices] = useState<ServicioTecnologico[]>([]);
  const [titleModalOpen, setTitleModalOpen] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);
  const [confirmDeleteImageId, setConfirmDeleteImageId] = useState<number | null>(null);

  // --- UI State ---
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // --- Refs ---
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const imagesInputRef = useRef<HTMLInputElement | null>(null);

  // --- Load Data ---
  const loadData = async () => {
    try {
      const data = await getServicios();
      // Find the first service with a PDF
      const pdf = data.find(s => s.pdf);
      setPdfService(pdf || null);

      // Filter services with images
      const images = data.filter(s => s.imagen);
      setImageServices(images);
    } catch (error) {
      console.error("Error loading services:", error);
      setToast({ type: "error", message: "Error al cargar los datos." });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ---------- PDF Handlers ----------
  const onPdfPicked: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (f.type !== "application/pdf") {
      alert("El archivo debe ser un PDF.");
      e.target.value = "";
      return;
    }

    setIsSaving(true);
    try {
      if (pdfService) {
        await deleteServicio(pdfService.id);
      }

      const formData = new FormData();
      formData.append('pdf', f);
      formData.append('titulo', 'Catálogo de Servicios');
      formData.append('activo', 'true');

      await createServicio(formData);
      await loadData();
      setToast({ type: "success", message: "PDF cargado correctamente." });
    } catch (error) {
      console.error("Error uploading PDF:", error);
      setToast({ type: "error", message: "Error al subir el PDF." });
    } finally {
      setIsSaving(false);
      e.target.value = "";
    }
  };

  const handlePdfDownload = () => {
    if (!pdfService?.pdf) return;
    const url = `${API_URL}/uploads/${pdfService.pdf}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = pdfService.pdf.split('/').pop() || "documento.pdf";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handlePdfDeleteConfirmed = async () => {
    if (!pdfService) return;
    
    setIsSaving(true);
    try {
      await deleteServicio(pdfService.id);
      setPdfService(null);
      setPdfConfirmDeleteOpen(false);
      setToast({ type: "success", message: "PDF eliminado." });
      await loadData();
    } catch (error) {
      console.error("Error deleting PDF:", error);
      setToast({ type: "error", message: "Error al eliminar el PDF." });
    } finally {
      setIsSaving(false);
    }
  };

  // ---------- Image Handlers ----------
  const onImagePicked: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Solo se permiten imágenes.");
      e.target.value = "";
      return;
    }
    setPendingImageFile(f);
    setTitleModalOpen(true);
    e.target.value = "";
  };

  const handleTitleConfirmed = async (title: string) => {
    if (!pendingImageFile) {
      setTitleModalOpen(false);
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('imagen', pendingImageFile);
      formData.append('titulo', title || "Sin título");
      formData.append('activo', 'true');

      await createServicio(formData);
      await loadData();
      setToast({ type: "success", message: "Imagen añadida a la galería." });
    } catch (error) {
      console.error("Error uploading image:", error);
      setToast({ type: "error", message: "Error al subir la imagen." });
    } finally {
      setIsSaving(false);
      setPendingImageFile(null);
      setTitleModalOpen(false);
    }
  };

  const handleTitleCancel = () => {
    setPendingImageFile(null);
    setTitleModalOpen(false);
  };

  const handleDeleteImageConfirmed = async (id: number) => {
    setIsSaving(true);
    try {
      await deleteServicio(id);
      setConfirmDeleteImageId(null);
      setToast({ type: "success", message: "Imagen eliminada." });
      await loadData();
    } catch (error) {
      console.error("Error deleting image:", error);
      setToast({ type: "error", message: "Error al eliminar la imagen." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageDownload = (img: ServicioTecnologico) => {
    if (!img.imagen) return;
    const url = `${API_URL}/uploads/${img.imagen}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = img.imagen.split('/').pop() || "imagen.jpg";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // ---------- Save All ----------
  const handleSaveAll = () => {
    loadData();
    setToast({ type: "success", message: "Datos actualizados." });
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans text-gray-800">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catálogo de Servicios Tecnológicos</h1>
          <p className="text-sm text-gray-500 mt-2">Gestiona el documento informativo y la galería de eventos de los servicios Tecnológicos .</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Hidden Inputs */}
          <input ref={pdfInputRef} type="file" accept="application/pdf" onChange={onPdfPicked} className="hidden" />
          <input ref={imagesInputRef} type="file" accept="image/*" onChange={onImagePicked} className="hidden" />
          
          <button 
            onClick={() => pdfInputRef.current?.click()} 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
            disabled={isSaving}
          >
            <Upload size={16} />
            Subir PDF
          </button>

          <button 
            onClick={() => imagesInputRef.current?.click()} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            disabled={isSaving}
          >
            <ImageIcon size={16} />
            Subir Imagen
          </button>

          <button 
            onClick={handleSaveAll} 
            disabled={isSaving} 
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            <Save size={16} />
            Actualizar
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: PDF ÚNICO */}
        <section className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="text-gray-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-800">Documento PDF</h3>
          </div>

          <div className="bg-white border rounded-xl shadow-sm p-4">
            {pdfService ? (
              <div className="space-y-4">
                <div className="bg-gray-50 border rounded-lg p-3 flex flex-col items-center justify-center text-center h-48 relative overflow-hidden group">
                  <FileText size={48} className="text-red-500 mb-2" />
                  <span className="text-sm font-medium text-gray-700 line-clamp-2 px-2">
                    {pdfService.titulo}
                  </span>
                  <div className="text-xs text-gray-400 mt-1">PDF Cargado</div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => setPdfViewOpen(true)}>
                    <span className="bg-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">Vista Previa</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setPdfViewOpen(true)} 
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm transition-colors"
                  >
                    <Eye size={16} /> Ver
                  </button>
                  <button 
                    onClick={handlePdfDownload} 
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm transition-colors"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    onClick={() => setPdfConfirmDeleteOpen(true)} 
                    className="flex-none flex items-center justify-center px-3 py-2 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 bg-gray-50/50">
                <FileText size={32} className="mb-2 opacity-50" />
                <span className="text-sm">No hay PDF cargado</span>
                <button onClick={() => pdfInputRef.current?.click()} className="mt-2 text-xs text-blue-600 font-medium hover:underline">
                  Seleccionar archivo
                </button>
              </div>
            )}
          </div>
        </section>

        {/* COLUMNA DERECHA: GALERÍA DE IMÁGENES */}
        <section className="lg:col-span-2 space-y-4">
           <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="text-gray-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">Galería de Imágenes</h3>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{imageServices.length}</span>
            </div>
          </div>

          <div className="bg-white border rounded-xl shadow-sm p-4 min-h-[300px]">
            {imageServices.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 bg-gray-50/50">
                <ImageIcon size={48} className="mb-3 opacity-50" />
                <p className="text-sm">La galería está vacía.</p>
                <button onClick={() => imagesInputRef.current?.click()} className="mt-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                  Añadir primera imagen
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {imageServices.map((img) => (
                  <div key={img.id} className="group border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow relative">
                    <div className="h-40 bg-gray-100 overflow-hidden relative cursor-pointer" onClick={() => setViewImageUrl(`${API_URL}/uploads/${img.imagen}`)}>
                      <img src={`${API_URL}/uploads/${img.imagen}`} alt={img.titulo} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="text-white drop-shadow-md" size={24} />
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <h4 className="text-sm font-semibold text-gray-800 truncate" title={img.titulo}>
                        {img.titulo}
                      </h4>
                      
                      <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-gray-100">
                        <button 
                          onClick={() => handleImageDownload(img)}
                          className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Descargar"
                        >
                          <Download size={16} />
                        </button>
                        <button 
                          onClick={() => setConfirmDeleteImageId(img.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar"
                        >
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

      {/* ---------- Modals ---------- */}
      
      {/* Title Modal (Para poner nombre a la imagen) */}
      {titleModalOpen && pendingImageFile && (
        <TitleModal 
          open={titleModalOpen} 
          defaultTitle="" 
          onCancel={handleTitleCancel} 
          onConfirm={(t) => handleTitleConfirmed(t)} 
        />
      )}

      {/* Image Viewer */}
      <ImageViewModal 
        open={!!viewImageUrl} 
        imageUrl={viewImageUrl ?? undefined} 
        onClose={() => setViewImageUrl(null)} 
      />

      {/* Confirm Delete Image */}
      <ConfirmModal 
        open={!!confirmDeleteImageId} 
        title="Eliminar imagen" 
        description="¿Deseas eliminar esta imagen de la galería?" 
        onCancel={() => setConfirmDeleteImageId(null)} 
        onConfirm={() => confirmDeleteImageId && handleDeleteImageConfirmed(confirmDeleteImageId)} 
      />

      {/* Confirm Delete PDF */}
      <ConfirmModal 
        open={pdfConfirmDeleteOpen} 
        title="Eliminar PDF" 
        description="¿Deseas eliminar el PDF cargado?" 
        onCancel={() => setPdfConfirmDeleteOpen(false)} 
        onConfirm={handlePdfDeleteConfirmed} 
      />

      {/* PDF Viewer */}
      {pdfViewOpen && pdfService && (
        <PdfViewModal 
          open={pdfViewOpen} 
          pdfUrl={`${API_URL}/uploads/${pdfService.pdf}`} 
          fileName={pdfService.titulo} 
          onClose={() => setPdfViewOpen(false)} 
          onDownload={handlePdfDownload} 
        />
      )}

      {/* Toast Notification */}
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

export default CatalogosServiciosPage;