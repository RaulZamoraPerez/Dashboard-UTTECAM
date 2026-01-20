import React, { useEffect, useState } from "react";
import ImageViewModal from "./ImageViewModal";
import ConfirmModal from "./ConfirmModal";
import { vinculacionBannerService, VinculacionBannerDocumento } from "../../services/vinculacionBannerService";
import { Image as ImageIcon, Upload, Trash2, Eye, Plus, X } from "lucide-react";

const API_URL = import.meta.env.VITE_BACKENDURL || '';

const VinculacionBannerPage: React.FC = () => {
  // --- ESTADOS IMAGENES ---
  const [imagenes, setImagenes] = useState<VinculacionBannerDocumento[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    loadImagenes();
  }, []);

  const loadImagenes = async () => {
    setIsLoading(true);
    try {
      const docs = await vinculacionBannerService.getAll();
      setImagenes(docs);
    } catch (error) {
      console.error(error);
      setToast({ type: "error", message: "Error al cargar imágenes." });
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGICA IMAGENES ---
  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Solo se permiten archivos de imagen.");
        return;
      }
      setNewFile(file);
      if (!newTitle) {
        setNewTitle(file.name.split('.')[0]);
      }
    }
  };

  const handleCreateImage = async () => {
    if (!newFile) {
      alert("Selecciona una imagen.");
      return;
    }
    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append("titulo", newTitle || newFile.name);
      formData.append("imagen", newFile);
      
      await vinculacionBannerService.create(formData);
      await loadImagenes();
      
      setIsModalOpen(false);
      setNewFile(null);
      setNewTitle("");
      setToast({ type: "success", message: "Imagen subida correctamente." });
    } catch (error) {
      console.error(error);
      setToast({ type: "error", message: "Error al subir imagen." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast(null), 2500);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDeleteId) return;
    try {
      await vinculacionBannerService.delete(confirmDeleteId);
      setImagenes(prev => prev.filter(d => d.id !== confirmDeleteId));
      setToast({ type: "success", message: "Imagen eliminada." });
    } catch (error) {
      console.error(error);
      setToast({ type: "error", message: "Error al eliminar imagen." });
    } finally {
      setConfirmDeleteId(null);
      setTimeout(() => setToast(null), 2500);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      
      {/* SECCIÓN IMAGENES BANNER */}
      <section>
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Imágenes del Banner</h2>
            <p className="text-sm text-gray-500 mt-1">Gestiona las imágenes que aparecen en el banner de Vinculación.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            Nueva Imagen
          </button>
        </header>

        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Cargando imágenes...</div>
          ) : imagenes.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No hay imágenes</h3>
              <p className="text-gray-500 mt-1 mb-6">Sube imágenes para que aparezcan en el banner.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-blue-600 hover:underline font-medium"
              >
                Subir la primera imagen
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 font-medium text-gray-700">Vista Previa</th>
                    <th className="px-6 py-3 font-medium text-gray-700">Título</th>
                    <th className="px-6 py-3 font-medium text-gray-700">Archivo</th>
                    <th className="px-6 py-3 font-medium text-gray-700 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {imagenes.map((img) => (
                    <tr key={img.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-20 h-12 bg-gray-100 rounded overflow-hidden border">
                          <img 
                            src={`${API_URL}/uploads/${img.imagen}`} 
                            alt={img.titulo}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{img.titulo}</td>
                      <td className="px-6 py-4 text-gray-500 truncate max-w-xs">
                        {img.imagen.split('/').pop()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setViewImageUrl(`${API_URL}/uploads/${img.imagen}`)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Ver"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => setConfirmDeleteId(img.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* MODAL NUEVA IMAGEN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-3 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800">Subir Imagen</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Archivo de Imagen</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click para subir</span></p>
                      <p className="text-xs text-gray-500">JPG, PNG, WEBP (MAX. 10MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFilePick} />
                  </label>
                </div>
                {newFile && (
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <ImageIcon size={14} /> {newFile.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ej. Banner Principal"
                />
              </div>
            </div>
            <div className="px-5 py-3 bg-gray-50 flex justify-end gap-2 border-t">
              <button onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-md">Cancelar</button>
              <button 
                onClick={handleCreateImage} 
                disabled={!newFile || isSaving}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                {isSaving ? "Subiendo..." : "Subir Imagen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modales Auxiliares */}
      <ImageViewModal open={!!viewImageUrl} imageUrl={viewImageUrl} onClose={() => setViewImageUrl(null)} />
      
      <ConfirmModal 
        open={!!confirmDeleteId} 
        title="Eliminar Imagen" 
        description="¿Estás seguro de que deseas eliminar esta imagen?" 
        onCancel={() => setConfirmDeleteId(null)} 
        onConfirm={handleDeleteConfirmed} 
      />

      {/* Toast */}
      {toast && (
        <div className="fixed right-4 bottom-6 z-50">
          <div className={`px-4 py-2 rounded-md shadow-md ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>{toast.message}</div>
        </div>
      )}
    </div>
  );
};

export default VinculacionBannerPage;
