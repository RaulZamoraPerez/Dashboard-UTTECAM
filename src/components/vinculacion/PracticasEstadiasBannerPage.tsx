// File: src/components/vinculacion/PracticasEstadiasBannerPage.tsx
import React, { useEffect, useRef, useState } from "react";
import ImagePreview from "./ImagePreview";
import ImageUploadModal from "./ImageUploadModal";
import ImageViewModal from "./ImageViewModal";
import ConfirmModal from "./ConfirmModal";
import { practicasEstadiasBannerService } from "../../services/practicasEstadiasBannerService";

const API_URL = import.meta.env.VITE_BACKENDURL || '';

const PracticasEstadiasBannerPage: React.FC = () => {
  const [id, setId] = useState<number | null>(null);
  const [title, setTitle] = useState<string>("Prácticas y Estadías");
  const [description, setDescription] = useState<string>("Las prácticas y estadías son una oportunidad para aplicar tus conocimientos en el entorno profesional y fortalecer tu desarrollo académico.");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cargar datos del backend
  useEffect(() => {
    loadBanner();
  }, []);

  const loadBanner = async () => {
    try {
      const banners = await practicasEstadiasBannerService.getAll();
      if (banners.length > 0) {
        const banner = banners[0]; // Tomamos el más reciente o el primero
        setId(banner.id);
        setTitle(banner.titulo);
        setDescription(banner.descripcion);
        setImageUrl(`${API_URL}/uploads/${banner.imagen}`);
      }
    } catch (error) {
      console.error("Error al cargar banner:", error);
      setToast({ type: "error", message: "Error al cargar datos del servidor." });
    }
  };

  // Leer archivo seleccionado desde input visible
  const handleLocalFilePick = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Sólo se permiten archivos de imagen (JPG/PNG).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImageFile(f);
      setImageUrl(dataUrl);
      setToast({ type: "success", message: "Imagen seleccionada." });
      setTimeout(() => setToast(null), 2500);
    };
    reader.readAsDataURL(f);
  };

  // Handler para input type=file (oculto)
  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    handleLocalFilePick(f);
    e.currentTarget.value = "";
  };

  const openFileDialog = () => fileInputRef.current?.click();

  // Handler usado por el modal de subida (reutilizable)
  const handleFileSelectedFromModal = (file: File | null, previewUrl?: string | null) => {
    setUploadModalOpen(false);
    if (!file || !previewUrl) return;
    setImageFile(file);
    setImageUrl(previewUrl);
    setToast({ type: "success", message: "Imagen seleccionada." });
    setTimeout(() => setToast(null), 2500);
  };

  const handleDeleteConfirmed = async () => {
    if (!id) return;
    setConfirmDeleteOpen(false);
    setIsSaving(true);
    try {
      await practicasEstadiasBannerService.delete(id);
      setId(null);
      setTitle("Prácticas y Estadías");
      setDescription("Las prácticas y estadías son una oportunidad para aplicar tus conocimientos en el entorno profesional y fortalecer tu desarrollo académico.");
      setImageFile(null);
      setImageUrl(null);
      setToast({ type: "success", message: "Banner eliminado." });
    } catch (e) {
      console.error(e);
      setToast({ type: "error", message: "Error al eliminar." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast(null), 2500);
    }
  };

  const handleSave = async () => {
    if (!title || !imageUrl) {
      setToast({ type: "error", message: "Título e imagen son requeridos." });
      setTimeout(() => setToast(null), 2500);
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("titulo", title);
      formData.append("descripcion", description);
      if (imageFile) {
        formData.append("imagen", imageFile);
      }

      if (id) {
        await practicasEstadiasBannerService.update(id, formData);
        setToast({ type: "success", message: "Banner actualizado correctamente." });
      } else {
        if (!imageFile) {
           setToast({ type: "error", message: "Debes seleccionar una imagen para crear." });
           setIsSaving(false);
           return;
        }
        const newBanner = await practicasEstadiasBannerService.create(formData);
        setId(newBanner.id);
        setToast({ type: "success", message: "Banner creado correctamente." });
      }
      // Recargar para asegurar consistencia
      await loadBanner();
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Error al guardar. Intenta de nuevo." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast(null), 2500);
    }
  };

  const handleViewImage = () => {
    if (!imageUrl) return;
    setViewModalOpen(true);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Prácticas y Estadías — Banner </h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona título, descripción e imagen para banners verticales largos.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setConfirmDeleteOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-red-300 text-sm text-red-700 bg-red-50 hover:bg-red-100 transition disabled:opacity-60"
            disabled={!id}
          >
            Borrar
          </button>

          <button
            onClick={handleViewImage}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm bg-white hover:bg-gray-50 transition disabled:opacity-60"
            disabled={!imageUrl}
          >
            Ver imagen
          </button>

          <button onClick={openFileDialog} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:brightness-95 transition">
            Seleccionar archivo (desde tu equipo)
          </button>

          <button onClick={handleSave} className="ml-2 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:brightness-95 transition disabled:opacity-60" disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </header>

      <main className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left / main: form + preview */}
        <section className="md:col-span-2 bg-white border rounded-lg p-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700">Título</label>
          <input
            className="mt-2 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="block text-sm font-medium text-gray-700 mt-4">Descripción</label>
          <textarea
            className="mt-2 w-full rounded-md border px-3 py-2 min-h-[120px] resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">Previsualización</label>
            <div className="mt-3 border rounded-lg overflow-hidden">
              <div className="w-full bg-gray-50 p-6">
                <div className="rounded-lg overflow-hidden bg-gradient-to-b from-slate-50 to-white shadow-inner transition-transform duration-200">
                  <div className="flex gap-6">
                    {/* For vertical banner preview, show image on top and text below */}
                    <div className="w-1/3 p-4 flex items-center justify-center bg-white">
                      <ImagePreview src={imageUrl} alt={title} placeholderText="Aquí se visualizará tu imagen" />
                    </div>

                    <div className="p-4 flex-1">
                      <h3 className="text-lg font-semibold">{title}</h3>
                      <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{description}</p>
                      <p className="text-xs text-gray-400 mt-4">Banner vertical — adapta a layouts largos.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right / aside: actions */}
        <aside className="md:col-span-1 bg-white border rounded-lg p-6 shadow-sm">
          <h4 className="text-sm font-medium">Acciones rápidas</h4>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Estado</span>
              <span className={`text-sm ${imageUrl ? "text-green-600" : "text-gray-500"}`}>{imageUrl ? "Imagen cargada" : "No hay imagen"}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tamaño recomendado</label>
              <p className="text-xs text-gray-500 mt-1">Vertical largo - ancho sugerido 600px, alto variable. Formato: JPG / PNG.</p>
            </div>

            <div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onInputChange} />
              <button onClick={openFileDialog} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white">Seleccionar archivo</button>
            </div>

            <div>
              <button onClick={() => setViewModalOpen(true)} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border" disabled={!imageUrl}>Ver imagen</button>
            </div>
          </div>
        </aside>
      </main>

      {/* Modales reutilizados */}
      <ImageUploadModal open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} onFileSelected={handleFileSelectedFromModal} />
      <ImageViewModal open={viewModalOpen} imageUrl={imageUrl} onClose={() => setViewModalOpen(false)} />
      <ConfirmModal open={confirmDeleteOpen} title="Eliminar banner" description="¿Deseas eliminar el banner de Prácticas y Estadías?" onCancel={() => setConfirmDeleteOpen(false)} onConfirm={handleDeleteConfirmed} />

      {/* Toast */}
      {toast && (
        <div className="fixed right-4 bottom-6 z-50">
          <div className={`px-4 py-2 rounded-md shadow-md ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>{toast.message}</div>
        </div>
      )}
    </div>
  );
};

export default PracticasEstadiasBannerPage;
