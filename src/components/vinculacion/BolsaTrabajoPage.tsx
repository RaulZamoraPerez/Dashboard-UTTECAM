import React, { useEffect, useRef, useState } from "react";
import ImageViewModal from "./ImageViewModal";
import PdfViewModal from "./PdfViewModal";
import { FileText, Trash2, Eye, Download, Save, Plus, X, Image as ImageIcon } from "lucide-react";
import { 
    getBolsaTrabajo, 
    createHeader, 
    updateHeader, 
    deleteHeader, 
    createItem, 
    deleteItem, 
    BolsaTrabajoHeader
} from "../../services/bolsaTrabajoService";

const API_URL = import.meta.env.VITE_BACKENDURL || 'http://localhost:3004';

// --- Sub-components ---

const ItemMetaModal: React.FC<{
  open: boolean;
  type: 'pdf' | 'image';
  defaultTitle?: string;
  defaultDescription?: string;
  onCancel: () => void;
  onConfirm: (title: string, description: string) => void;
}> = ({ open, type, defaultTitle = "", defaultDescription = "", onCancel, onConfirm }) => {
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
        <h3 className="text-lg font-semibold mb-3">Información del {type === 'pdf' ? 'PDF' : 'Archivo'}</h3>
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

const SectionEditor: React.FC<{
    section: BolsaTrabajoHeader;
    onUpdate: () => void;
    onDelete: () => void;
    setToast: (t: { type: "success" | "error"; message: string } | null) => void;
}> = ({ section, onUpdate, onDelete, setToast }) => {
    const [title, setTitle] = useState(section.titulo);
    const [description, setDescription] = useState(section.descripcion);
    const [externalUrl, setExternalUrl] = useState(section.url_externa);
    const [bannerUrl, setBannerUrl] = useState<string | null>(section.imagen_banner ? `${API_URL}/uploads/${section.imagen_banner}` : null);
    const [pendingBanner, setPendingBanner] = useState<File | null>(null);
    const [deleteBannerFlag, setDeleteBannerFlag] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Item State
    const [itemMetaOpen, setItemMetaOpen] = useState(false);
    const [pendingItem, setPendingItem] = useState<File | null>(null);
    const [itemType, setItemType] = useState<'pdf' | 'image'>('pdf');
    
    const [pdfPreview, setPdfPreview] = useState<{url: string, name: string} | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const bannerInputRef = useRef<HTMLInputElement>(null);
    const itemInputRef = useRef<HTMLInputElement>(null);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('titulo', title);
            formData.append('descripcion', description);
            formData.append('url_externa', externalUrl);
            if (pendingBanner) formData.append('imagen_banner', pendingBanner);
            if (deleteBannerFlag) formData.append('delete_banner', 'true');

            await updateHeader(section.id, formData);
            setToast({ type: "success", message: "Sección actualizada" });
            onUpdate();
        } catch (e) {
            setToast({ type: "error", message: "Error al guardar sección" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleBannerPick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setPendingBanner(f);
        setDeleteBannerFlag(false);
        const reader = new FileReader();
        reader.onload = () => setBannerUrl(reader.result as string);
        reader.readAsDataURL(f);
    };

    const handleItemPick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        
        const isPdf = f.type === "application/pdf";
        const isImage = f.type.startsWith("image/");
        
        if (!isPdf && !isImage) { 
            alert("Solo se permiten archivos PDF o Imágenes"); 
            return; 
        }
        
        setPendingItem(f);
        setItemType(isPdf ? 'pdf' : 'image');
        setItemMetaOpen(true);
        e.target.value = "";
    };

    const handleAddItem = async (t: string, d: string) => {
        if (!pendingItem) return;
        const formData = new FormData();
        formData.append('titulo', t);
        formData.append('descripcion', d);
        formData.append('archivo_pdf', pendingItem); // Backend expects 'archivo_pdf' for both
        formData.append('header_id', String(section.id));
        
        try {
            await createItem(formData);
            setToast({ type: "success", message: "Elemento agregado" });
            onUpdate();
        } catch (e) {
            setToast({ type: "error", message: "Error al agregar elemento" });
        } finally {
            setPendingItem(null);
            setItemMetaOpen(false);
        }
    };

    const handleDeleteItem = async (id: number) => {
        if (!confirm("¿Eliminar elemento?")) return;
        try {
            await deleteItem(id);
            setToast({ type: "success", message: "Elemento eliminado" });
            onUpdate();
        } catch (e) {
            setToast({ type: "error", message: "Error al eliminar elemento" });
        }
    };

    const isImageFile = (filename: string) => {
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
    };

    return (
        <div className="bg-white border rounded-xl shadow-sm p-6 mb-8">
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-800">Sección #{section.id}</h3>
                <button onClick={onDelete} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={20} /></button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Info Column */}
                <div className="lg:col-span-1 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Título</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 w-full border rounded-md px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">URL Externa</label>
                        <input value={externalUrl} onChange={e => setExternalUrl(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" placeholder="https://..." />
                    </div>
                    
                    {/* Banner */}
                    <div className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Banner</span>
                            <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerPick} />
                            <button onClick={() => bannerInputRef.current?.click()} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Cambiar</button>
                        </div>
                        {bannerUrl ? (
                            <div className="relative group">
                                <img src={bannerUrl} className="w-full h-32 object-cover rounded cursor-pointer" onClick={() => setImagePreview(bannerUrl)} />
                                <button onClick={() => { setBannerUrl(null); setDeleteBannerFlag(true); setPendingBanner(null); }} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                            </div>
                        ) : (
                            <div className="h-32 flex items-center justify-center border-2 border-dashed text-gray-400 text-sm">Sin Banner</div>
                        )}
                    </div>

                    <button onClick={handleSave} disabled={isSaving} className="w-full bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                        <Save size={18} /> {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>

                {/* Items Column */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold flex items-center gap-2"><FileText size={18} /> Multimedia ({section.items?.length || 0})</h4>
                        <input ref={itemInputRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={handleItemPick} />
                        <button onClick={() => itemInputRef.current?.click()} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded flex items-center gap-1 hover:bg-blue-700"><Plus size={16} /> Agregar Archivo</button>
                    </div>

                    <div className="space-y-2">
                        {section.items && section.items.length > 0 ? (
                            section.items.map(item => {
                                const isImg = isImageFile(item.archivo_pdf);
                                return (
                                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-white transition-colors">
                                        <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                                            <div className="w-10 h-10 flex-shrink-0 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                                                {isImg ? <ImageIcon size={20} /> : <FileText size={20} />}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-medium truncate">{item.titulo}</div>
                                                {item.descripcion && <div className="text-xs text-gray-500 truncate">{item.descripcion}</div>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => isImg 
                                                    ? setImagePreview(`${API_URL}/uploads/${item.archivo_pdf}`) 
                                                    : setPdfPreview({ url: `${API_URL}/uploads/${item.archivo_pdf}`, name: item.titulo })
                                                } 
                                                className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <a href={`${API_URL}/uploads/${item.archivo_pdf}`} download target="_blank" className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"><Download size={16} /></a>
                                            <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">No hay elementos en esta sección</div>
                        )}
                    </div>
                </div>
            </div>

            <ItemMetaModal open={itemMetaOpen} type={itemType} onCancel={() => setItemMetaOpen(false)} onConfirm={handleAddItem} />
            <PdfViewModal open={!!pdfPreview} pdfUrl={pdfPreview?.url} fileName={pdfPreview?.name} onClose={() => setPdfPreview(null)} />
            <ImageViewModal open={!!imagePreview} imageUrl={imagePreview || undefined} onClose={() => setImagePreview(null)} />
        </div>
    );
};

// --- Main Page ---

const BolsaTrabajoPage: React.FC = () => {
    const [sections, setSections] = useState<BolsaTrabajoHeader[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const loadData = async () => {
        try {
            const data = await getBolsaTrabajo();
            setSections(data);
        } catch (error) {
            console.error(error);
            setToast({ type: "error", message: "Error al cargar datos" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddSection = async () => {
        const formData = new FormData();
        formData.append('titulo', 'Nueva Sección');
        formData.append('descripcion', '');
        formData.append('url_externa', '');
        
        try {
            await createHeader(formData);
            setToast({ type: "success", message: "Sección creada" });
            loadData();
        } catch (e) {
            setToast({ type: "error", message: "Error al crear sección" });
        }
    };

    const handleDeleteSection = async (id: number) => {
        if (!confirm("¿Estás seguro de eliminar esta sección y todos sus documentos?")) return;
        try {
            await deleteHeader(id);
            setToast({ type: "success", message: "Sección eliminada" });
            loadData();
        } catch (e) {
            setToast({ type: "error", message: "Error al eliminar sección" });
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto font-sans text-gray-800">
            <header className="flex justify-between items-center mb-8 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Bolsa de Trabajo</h1>
                    <p className="text-sm text-gray-500 mt-2">Gestiona las secciones y vacantes de la bolsa de trabajo.</p>
                </div>
                <button onClick={handleAddSection} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all">
                    <Plus size={20} /> Nueva Sección
                </button>
            </header>

            {loading ? (
                <div className="text-center py-12">Cargando...</div>
            ) : (
                <div className="space-y-8">
                    {sections.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed">
                            <p className="text-gray-500 mb-4">No hay secciones creadas.</p>
                            <button onClick={handleAddSection} className="text-blue-600 font-medium hover:underline">Crear la primera sección</button>
                        </div>
                    ) : (
                        sections.map(section => (
                            <SectionEditor 
                                key={section.id} 
                                section={section} 
                                onUpdate={loadData} 
                                onDelete={() => handleDeleteSection(section.id)}
                                setToast={setToast}
                            />
                        ))
                    )}
                </div>
            )}

            {toast && (
                <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-gray-900' : 'bg-red-600'} z-50 animate-in slide-in-from-bottom-5`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default BolsaTrabajoPage;
