import { useEffect, useState} from 'react';
import { 
  getOrganigrama, 
  createNode, 
  updateNode, 
  deleteNode, 
  OrganigramaNode 
} from '../../services/organigramaService';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  User, 
  ChevronDown, 
  ChevronRight,
  Loader2,
  X,
  Save,
  Upload,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info
} from 'lucide-react';
import Swal from 'sweetalert2';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

const BACKEND_URL = (import.meta.env.VITE_BACKENDURL || '').replace(/\/$/, '');
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

// --- Node Card Component ---

interface NodeCardProps {
  node: OrganigramaNode;
  onEdit: (node: OrganigramaNode) => void;
  onAddChild: (parentId: number) => void;
  onDelete: (id: number) => void;
  level: number;
}

function NodeCard({ node, onEdit, onAddChild, onDelete, level }: NodeCardProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const imageUrl = node.data?.image 
    ? (node.data.image.startsWith('http') ? node.data.image : 
       node.data.image.startsWith('/uploads') ? `${BACKEND_URL}${node.data.image}` :
       `${BACKEND_URL}/uploads/organigrama/${node.data.image}`)
    : null;

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        {/* Connection Top */}
        {level > 0 && <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-px h-4 bg-gray-300 dark:bg-gray-600"></div>}

        {/* Card */}
        <div className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 w-56 transition-all hover:shadow-md 
          ${level === 0 ? 'border-t-4 border-t-[#0a9782]' : 'hover:border-[#0a9782]/30'}`}>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 mb-3 overflow-hidden border-2 border-white dark:border-gray-600 shadow-sm flex-shrink-0">
               {imageUrl ? (
                 <img src={imageUrl} alt={node.data.name} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-300">
                   <User className="w-7 h-7" />
                 </div>
               )}
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-[11px] leading-tight mb-1">{node.data.name}</h3>
            <p className="text-[9px] text-[#0a9782] font-black uppercase tracking-widest">{node.data.title}</p>
          </div>

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
             <button onClick={() => onEdit(node)} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 className="w-3 h-3" /></button>
             <button onClick={() => node.id && onAddChild(node.id)} className="p-1 text-gray-400 hover:text-green-600"><Plus className="w-3 h-3" /></button>
             <button onClick={() => node.id && onDelete(node.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
          </div>

          {hasChildren && (
            <button 
              onClick={() => setExpanded(!expanded)}
              className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-[#0a9782] shadow-sm z-10"
            >
              {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="flex flex-col items-center">
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
          <div className="relative flex pt-4">
            {node.children!.length > 1 && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-gray-300 dark:bg-gray-600" style={{ width: `calc(100% - 14rem)` }}></div> 
            )}
            <div className="flex items-start gap-6">
              {node.children!.map((child, idx) => (
                <div key={child.id || idx} className="flex flex-col items-center relative">
                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 -mt-4 mb-4"></div>
                  <NodeCard node={child} onEdit={onEdit} onAddChild={onAddChild} onDelete={onDelete} level={level + 1} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Modal Component ---

interface NodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => Promise<void>;
  initialData?: OrganigramaNode | null;
  parentId?: number | null;
}

function NodeModal({ isOpen, onClose, onSave, initialData, parentId }: NodeModalProps) {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{name?:string, title?:string, text?:string}>({});

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (initialData) {
        setName(initialData.data.name);
        setTitle(initialData.data.title);
        setText(initialData.data.text || '');
        const img = initialData.data.image;
        setPreviewUrl(img ? (img.startsWith('http') ? img : `${BACKEND_URL}/uploads/organigrama/${img}`) : null);
      } else {
        setName(''); setTitle(''); setText(''); setFile(null); setPreviewUrl(null);
      }
    }
  }, [isOpen, initialData]);

  const validate = () => {
    const newErrors: any = {};
    if (!name.trim()) newErrors.name = 'El nombre es obligatorio';
    else if (name.length > 200) newErrors.name = 'Máximo 200 caracteres';

    if (!title.trim()) newErrors.title = 'El cargo es obligatorio';
    else if (title.length > 200) newErrors.title = 'Máximo 200 caracteres';

    if (text.length > 2000) newErrors.text = 'Descripción muy larga (máx 2000)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    if (!initialData && !file) {
      Swal.fire({ icon: 'error', title: 'Imagen faltante', text: 'Debes subir una imagen para el nuevo perfil.' });
      return;
    }

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('name', name.trim());
      fd.append('title', title.trim());
      fd.append('text', text.trim());
      if (file) fd.append('imagen', file);
      if (parentId) fd.append('parent_id', String(parentId));
      await onSave(fd);
      onClose();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar la información.' });
    } finally { setBusy(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-tight">{initialData ? 'Editar Perfil' : 'Añadir Persona'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 dark:border-gray-600 overflow-hidden group shadow-inner">
              {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><User size={30} /></div>}
              <label className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                <Upload size={16} /><input type="file" className="hidden" accept="image/*" onChange={e => {
                  const f = e.target.files?.[0];
                  if(f) {
                    if (f.size > MAX_FILE_SIZE) {
                      Swal.fire({ icon: 'warning', title: 'Muy pesado', text: 'El límite es de 3MB.' });
                      return;
                    }
                    if (!f.type.startsWith('image/')) {
                      Swal.fire({ icon: 'error', title: 'Formato inválido', text: 'Solo se permiten imágenes.' });
                      return;
                    }
                    setFile(f); setPreviewUrl(URL.createObjectURL(f));
                  }
                }} />
              </label>
            </div>
            <p className="text-[9px] text-gray-400 mt-2 uppercase font-bold tracking-widest">Máximo 3MB</p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between px-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre Completo</label>
              <span className={`text-[9px] ${name.length > 200 ? 'text-red-500' : 'text-gray-400'}`}>{name.length}/200</span>
            </div>
            <input value={name} onChange={e => setName(e.target.value)} className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#0a9782] dark:bg-gray-900/50`} placeholder="Ej. Dr. Luis Morales" required />
            {errors.name && <p className="text-[9px] text-red-500 font-bold px-1">{errors.name}</p>}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between px-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cargo / Puesto</label>
              <span className={`text-[9px] ${title.length > 200 ? 'text-red-500' : 'text-gray-400'}`}>{title.length}/200</span>
            </div>
            <input value={title} onChange={e => setTitle(e.target.value)} className={`w-full border ${errors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#0a9782] dark:bg-gray-900/50`} placeholder="Ej. Dirección Académica" required />
            {errors.title && <p className="text-[9px] text-red-500 font-bold px-1">{errors.title}</p>}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between px-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descripción / Semblanza</label>
              <span className={`text-[9px] ${text.length > 2000 ? 'text-red-500' : 'text-gray-400'}`}>{text.length}/2000</span>
            </div>
            <textarea value={text} onChange={e => setText(e.target.value)} className={`w-full border ${errors.text ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#0a9782] dark:bg-gray-900/50 resize-none`} rows={3} placeholder="Trayectoria profesional..." />
            {errors.text && <p className="text-[9px] text-red-500 font-bold px-1">{errors.text}</p>}
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 text-xs font-bold text-gray-400 hover:text-gray-600 uppercase">Cancelar</button>
            <button type="submit" disabled={busy} className="flex-2 py-2 bg-[#0a9782] text-white rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 px-6">
              {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// --- Main Page ---

export default function OrganigramaPage() {
  const [nodes, setNodes] = useState<OrganigramaNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<OrganigramaNode | null>(null);
  const [parentIdForNew, setParentIdForNew] = useState<number | null>(null);
  const [scale, setScale] = useState(0.8);
  const [position, setPosition] = useState({ x: 0, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const fetchData = async () => {
    try { setLoading(true); const data = await getOrganigrama(); setNodes(data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (formData: FormData) => {
    if (editingNode) await updateNode(editingNode.id!, formData);
    else await createNode(formData);
    await fetchData();
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: '¿Eliminar Persona?', text: 'Se borrarán subordinados.', icon: 'warning', showCancelButton: true });
    if (result.isConfirmed) { await deleteNode(id); await fetchData(); }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <PageMeta title="Gestión Organigrama" description="Administra jerarquía institucional" />
      <PageBreadcrumb pageTitle="Organigrama" />

      <NodeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} initialData={editingNode} parentId={parentIdForNew} />

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-[700px] relative">
        <div className="absolute top-6 left-6 z-20">
          <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900 dark:text-white">Organigrama</h2>
          <div className="flex items-center gap-2 mt-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Modo Administrador</p></div>
        </div>

        <div className="absolute top-6 right-6 z-20">
          <button onClick={() => { setEditingNode(null); setParentIdForNew(null); setModalOpen(true); }} className="px-4 py-2 bg-[#0a9782] text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-[#0a9782]/20"><Plus size={14} /> Nueva Raíz</button>
        </div>

        <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-1 border dark:border-gray-700">
           <button onClick={() => setScale(s => Math.min(s+0.1, 1.5))} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"><ZoomIn size={16}/></button>
           <button onClick={() => setScale(s => Math.max(s-0.1, 0.4))} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"><ZoomOut size={16}/></button>
           <button onClick={() => { setScale(0.8); setPosition({x:0, y:20}); }} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"><Maximize2 size={16}/></button>
        </div>

        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

        {loading ? <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-[#0a9782]" /></div> : nodes.length === 0 ? <div className="flex flex-col items-center justify-center h-full text-center p-8"><Info size={40} className="mb-4 text-gray-200" /><h3 className="font-bold text-gray-300 uppercase tracking-widest text-xs">Sin Estructura</h3><button onClick={() => setModalOpen(true)} className="mt-4 text-blue-500 text-[10px] font-bold uppercase underline">Crear primer nodo</button></div> : (
          <div className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center" onMouseDown={e => { if(!(e.target as HTMLElement).closest('button')){ setIsDragging(true); setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y }); } }} onMouseMove={e => { if(isDragging) setPosition({ x: e.clientX - startPos.x, y: e.clientY - startPos.y }); }} onMouseUp={() => setIsDragging(false)} onMouseLeave={() => setIsDragging(false)}>
            <div style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)', transformOrigin: 'top center' }} className="absolute top-24">
              <div className="flex justify-center pb-20">{nodes.map(n => <NodeCard key={n.id} node={n} onEdit={node => { setEditingNode(node); setParentIdForNew(null); setModalOpen(true); }} onAddChild={pid => { setEditingNode(null); setParentIdForNew(pid); setModalOpen(true); }} onDelete={handleDelete} level={0} />)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
