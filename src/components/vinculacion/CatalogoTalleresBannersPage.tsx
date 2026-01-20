// src/components/vinculacion/CatalogoTalleresBannersPage.tsx
import React, { useEffect, useRef, useState } from "react";
import ImageViewModal from "./ImageViewModal";
import ConfirmModal from "./ConfirmModal";
import TitleModal from "./TitleModal";
import ImagePreview from "./ImagePreview";
import { educacionContinuaService, EducacionContinuaCurso } from "../../services/educacionContinuaService";

const CatalogoTalleresBannersPage: React.FC = () => {
  // meta
  const [mainTitle, setMainTitle] = useState<string>("Cursos de Educación Continua");
  const [finalDescription, setFinalDescription] = useState<string>("¡Descubre nuestros cursos y potencia tu desarrollo profesional!");

  // images (cursos)
  const [cursos, setCursos] = useState<EducacionContinuaCurso[]>([]);
  const [pendingImage, setPendingImage] = useState<{ file: File; preview: string } | null>(null);
  const [subtitleModalOpen, setSubtitleModalOpen] = useState(false);
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);
  const [confirmDeleteCursoId, setConfirmDeleteCursoId] = useState<number | null>(null);

  // UI
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // refs
  const imagesInputRef = useRef<HTMLInputElement | null>(null);

  // load data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [info, cursosData] = await Promise.all([
        educacionContinuaService.getInfo(),
        educacionContinuaService.getCursos()
      ]);
      
      if (info) {
        setMainTitle(info.titulo_principal);
        setFinalDescription(info.descripcion_final);
      }
      setCursos(cursosData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setToast({ type: "error", message: "Error al cargar los datos." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenImagePicker = () => imagesInputRef.current?.click();

  // when user picks an image file directly
  const onImagePicked: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Solo se permiten archivos de imagen.");
      e.currentTarget.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const preview = reader.result as string;
      setPendingImage({ file: f, preview });
      setSubtitleModalOpen(true);
    };
    reader.readAsDataURL(f);
    e.currentTarget.value = "";
  };

  // TitleModal used for subtitle input (Create new Curso)
  const handleSubtitleConfirm = async (subtitle: string) => {
    if (!pendingImage) {
      setSubtitleModalOpen(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('titulo', subtitle || "Sin título");
      formData.append('imagen', pendingImage.file);

      await educacionContinuaService.createCurso(formData);
      
      setPendingImage(null);
      setSubtitleModalOpen(false);
      setToast({ type: "success", message: "Curso añadido correctamente." });
      fetchData(); // Reload list
    } catch (error) {
      console.error("Error creating curso:", error);
      setToast({ type: "error", message: "Error al crear el curso." });
    }
  };

  const handleSubtitleCancel = () => {
    setPendingImage(null);
    setSubtitleModalOpen(false);
  };

  const handleDeleteCursoConfirmed = async (id: number) => {
    setConfirmDeleteCursoId(null);
    try {
      await educacionContinuaService.deleteCurso(id);
      setToast({ type: "success", message: "Curso eliminado." });
      fetchData(); // Reload list
    } catch (error) {
      console.error("Error deleting curso:", error);
      setToast({ type: "error", message: "Error al eliminar el curso." });
    }
  };

  const handleToggleStatus = async (curso: EducacionContinuaCurso) => {
    try {
      await educacionContinuaService.toggleStatus(curso.id, !curso.activo);
      // Optimistic update or reload
      const updatedCursos = cursos.map(c => 
        c.id === curso.id ? { ...c, activo: !c.activo } : c
      );
      setCursos(updatedCursos);
      setToast({ type: "success", message: `Curso ${!curso.activo ? 'activado' : 'desactivado'}.` });
    } catch (error) {
      console.error("Error toggling status:", error);
      setToast({ type: "error", message: "Error al cambiar estado." });
      fetchData(); // Revert on error
    }
  };

  const handleSaveInfo = async () => {
    setIsSaving(true);
    try {
      await educacionContinuaService.updateInfo({
        titulo_principal: mainTitle,
        descripcion_final: finalDescription
      });
      setToast({ type: "success", message: "Información guardada correctamente." });
    } catch (err) {
      console.error("Error saving info:", err);
      setToast({ type: "error", message: "Error al guardar la información." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast(null), 2000);
    }
  };

  const API_URL = import.meta.env.VITE_BACKENDURL || 'http://localhost:3004';

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_URL}/uploads/${path}`;
  };

  if (isLoading) {
    return <div className="p-6 text-center">Cargando...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Catálogo Talleres - Banners</h1>
          <p className="text-sm text-gray-500 mt-1">Administra banners verticales para el catálogo de talleres. Añade imágenes con subtítulos y una descripción final.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenImagePicker}
            className="px-3 py-1 rounded-md bg-blue-600 text-white text-xs"
            title="Añadir imagen"
          >
            Añadir curso
          </button>

          <button
            onClick={handleSaveInfo}
            disabled={isSaving}
            className="px-4 py-1 rounded-md bg-green-600 text-white text-xs disabled:opacity-60"
          >
            {isSaving ? "Guardando..." : "Guardar Info"}
          </button>
        </div>
      </header>

      <main className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-2 bg-white border rounded-md p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700">Título Principal</label>
          <input
            value={mainTitle}
            onChange={(e) => setMainTitle(e.target.value)}
            className="mt-2 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300"
          />

          <label className="block text-sm font-medium text-gray-700 mt-4">Descripción final</label>
          <textarea
            value={finalDescription}
            onChange={(e) => setFinalDescription(e.target.value)}
            className="mt-2 w-full rounded-md border px-3 py-2 text-sm min-h-[100px] resize-vertical focus:ring-2 focus:ring-blue-300"
          />

          <div className="mt-6">
            <h3 className="text-sm font-medium">Previsualización</h3>
            <div className="mt-3 border rounded-md overflow-hidden bg-gray-50 p-3">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/3 flex items-center justify-center bg-white p-2">
                  {cursos.length > 0 ? (
                    <ImagePreview 
                      src={getImageUrl(cursos[0].imagen)} 
                      alt={cursos[0].titulo} 
                      placeholderText="Aquí se visualizará la imagen principal" 
                    />
                  ) : (
                    <div className="text-gray-400 text-xs text-center p-4">Sin cursos</div>
                  )}
                </div>
                <div className="flex-1 p-2">
                  <h2 className="text-lg font-semibold">{mainTitle}</h2>
                  <p className="text-sm text-gray-600 mt-2">{finalDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="md:col-span-1 bg-white border rounded-md p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Galería de Cursos</h4>
            <div className="text-xs text-gray-500">{cursos.length} items</div>
          </div>

          <div className="mt-3 space-y-3 max-h-[600px] overflow-y-auto">
            {cursos.length === 0 ? (
              <div className="text-sm text-gray-500 p-3">No hay cursos. Añade uno para comenzar.</div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {cursos.map((curso) => (
                  <div key={curso.id} className={`border rounded-md overflow-hidden bg-white ${!curso.activo ? 'opacity-60' : ''}`}>
                    <div className="h-28 overflow-hidden bg-gray-100 relative">
                      <img src={getImageUrl(curso.imagen)} alt={curso.titulo} className="object-cover w-full h-full" />
                      {!curso.activo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 text-white text-xs font-bold">
                          INACTIVO
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <div className="text-sm font-semibold truncate">{curso.titulo}</div>
                      <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex gap-2">
                          <button onClick={() => setViewImageUrl(getImageUrl(curso.imagen))} className="px-2 py-1 rounded-md border text-xs hover:bg-gray-50">Ver</button>
                          <button 
                            onClick={() => handleToggleStatus(curso)} 
                            className={`px-2 py-1 rounded-md border text-xs ${curso.activo ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                          >
                            {curso.activo ? 'Ocultar' : 'Mostrar'}
                          </button>
                        </div>
                        <button onClick={() => setConfirmDeleteCursoId(curso.id)} className="px-2 py-1 rounded-md border text-xs text-red-600 hover:bg-red-50">Eliminar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Hidden file input for images */}
      <input ref={imagesInputRef} type="file" accept="image/*" onChange={onImagePicked} className="hidden" />

      {/* Modals */}
      <TitleModal open={subtitleModalOpen} defaultTitle="" onCancel={handleSubtitleCancel} onConfirm={handleSubtitleConfirm} />
      <ImageViewModal open={!!viewImageUrl} imageUrl={viewImageUrl ?? undefined} onClose={() => setViewImageUrl(null)} />
      <ConfirmModal 
        open={!!confirmDeleteCursoId} 
        title="Eliminar curso" 
        description="¿Deseas eliminar este curso? Esta acción no se puede deshacer." 
        onCancel={() => setConfirmDeleteCursoId(null)} 
        onConfirm={() => confirmDeleteCursoId && handleDeleteCursoConfirmed(confirmDeleteCursoId)} 
      />

      {/* Toast */}
      {toast && (
        <div className="fixed right-4 bottom-6 z-50">
          <div className={`px-4 py-2 rounded-md shadow-md ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"} text-xs`}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogoTalleresBannersPage;
