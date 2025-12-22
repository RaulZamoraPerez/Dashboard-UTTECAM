import React, { useEffect, useState } from 'react';
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
  
} from 'lucide-react';
import Swal from 'sweetalert2';

const BACKEND_URL = (import.meta.env.VITE_BACKENDURL || '').replace(/\/$/, '');

// --- Components ---

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
      {/* Card */}
      <div className={`relative group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 p-3 w-56 transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-600 ${level === 0 ? 'border-t-4 border-t-blue-600' : ''}`}>
        
        {/* Actions Dropdown/Buttons */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button 
            onClick={() => onEdit(node)}
            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Editar"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button 
            onClick={() => node.id && onAddChild(node.id)}
            className="p-1 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded"
            title="Agregar subordinado"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button 
            onClick={() => node.id && onDelete(node.id)}
            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Eliminar"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-gray-700 mb-2 overflow-hidden border-2 border-white dark:border-gray-600 shadow-sm flex-shrink-0">
            {imageUrl ? (
              <img src={imageUrl} alt={node.data.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <User className="w-6 h-6" />
              </div>
            )}
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-xs leading-tight mb-0.5">{node.data.name}</h3>
          <p className="text-[10px] text-blue-600 font-medium mb-1">{node.data.title}</p>
          {node.data.text && (
            <div className="relative group/tooltip w-full">
              <p className="text-[9px] text-slate-400 line-clamp-2 leading-tight cursor-help transition-colors hover:text-slate-600 dark:hover:text-slate-300">
                {node.data.text}
              </p>
              {/* Tooltip on hover */}
              <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none scale-95 group-hover/tooltip:scale-100">
                <div className="relative z-10 text-[11px] text-slate-600 dark:text-gray-300 leading-relaxed text-left max-h-48 overflow-y-auto custom-scrollbar">
                  {node.data.text}
                </div>
                {/* Arrow */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-800 border-r border-b border-slate-200 dark:border-gray-700 rotate-45"></div>
              </div>
            </div>
          )}
        </div>

        {/* Expand/Collapse Toggle */}
        {hasChildren && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 shadow-sm z-10"
          >
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="flex flex-col items-center animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Vertical Line from parent */}
          <div className="w-px h-6 bg-slate-300"></div>
          
          {/* Horizontal Line connecting children */}
          <div className="relative flex gap-6 pt-4">
            {/* Top horizontal bar logic: needs to span from first child center to last child center */}
            {node.children!.length > 1 && (
              // adjusted for w-56 (14rem) => half is 7rem
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-slate-300" style={{ width: `calc(100% - 14rem)` }}></div> 
            )}
            
             <div className="flex items-start gap-6">
                {node.children!.map((child, index) => (
                  <div key={child.id || index} className="flex flex-col items-center relative">
                    {/* Vertical connector to child */}
                    <div className="w-px h-4 bg-slate-300 -mt-4 mb-4"></div>
                    
                    <NodeCard 
                      node={child} 
                      onEdit={onEdit} 
                      onAddChild={onAddChild} 
                      onDelete={onDelete} 
                      level={level + 1} 
                    />
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.data.name);
        setTitle(initialData.data.title);
        setText(initialData.data.text || '');
        const img = initialData.data.image;
        setPreviewUrl(img ? (img.startsWith('http') ? img : 
          img.startsWith('/uploads') ? `${BACKEND_URL}${img}` :
          `${BACKEND_URL}/uploads/organigrama/${img}`) : null);
      } else {
        setName('');
        setTitle('');
        setText('');
        setFile(null);
        setPreviewUrl(null);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !title) return;
    
    // Validate image for new items
    if (!initialData && !file) {
      Swal.fire({
        icon: 'warning',
        title: 'Imagen requerida',
        text: 'Debes subir una imagen para crear una nueva persona.',
      });
      return;
    }

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('title', title);
      fd.append('text', text);
      if (file) fd.append('imagen', file); // 'imagen' matches backend multer config
      if (parentId) fd.append('parent_id', String(parentId));
      
      await onSave(fd);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            {initialData ? <Edit2 className="w-4 h-4 text-blue-600" /> : <Plus className="w-4 h-4 text-blue-600" />}
            {initialData ? 'Editar Persona' : 'Agregar Persona'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex justify-center mb-4">
            <div className={`relative w-24 h-24 rounded-full bg-slate-100 border-2 overflow-hidden group cursor-pointer ${!previewUrl && !initialData ? 'border-red-300' : 'border-slate-200'}`}>
               {previewUrl ? (
                 <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-300">
                   <User className="w-10 h-10" />
                 </div>
               )}
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Upload className="w-6 h-6 text-white" />
               </div>
               <input 
                 type="file" 
                 accept="image/*" 
                 className="absolute inset-0 opacity-0 cursor-pointer"
                 onChange={handleFileChange}
               />
            </div>
          </div>
          {!previewUrl && !initialData && (
            <p className="text-xs text-center text-red-500 -mt-2">La imagen es obligatoria</p>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nombre Completo</label>
            <input 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Ej. Dr. Juan Pérez"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Cargo / Título</label>
            <input 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Ej. Rector"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Descripción (Opcional)</label>
            <textarea 
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              rows={3}
              placeholder="Breve descripción..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={busy || !name || !title || (!initialData && !file)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all flex items-center gap-2"
            >
              {busy ? 'Guardando...' : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar
                </>
              )}
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
  
  // Pan & Zoom State
  const [scale, setScale] = useState(0.6);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Check if we are clicking on a button or action inside the card to avoid dragging when clicking button
    // But usually simple check is enough.
    if ((e.target as HTMLElement).closest('button')) return;

    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getOrganigrama();
      setNodes(data);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar el organigrama',
        toast: true,
        position: 'center',
        showConfirmButton: false,
        timer: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddRoot = () => {
    setEditingNode(null);
    setParentIdForNew(null);
    setModalOpen(true);
  };

  const handleAddChild = (parentId: number) => {
    setEditingNode(null);
    setParentIdForNew(parentId);
    setModalOpen(true);
  };

  const handleEdit = (node: OrganigramaNode) => {
    setEditingNode(node);
    setParentIdForNew(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Eliminar persona?',
      text: "Si tiene subordinados, no se podrá eliminar hasta que los elimines o muevas primero.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      await deleteNode(id);
      await fetchData();
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        toast: true,
        position: 'center',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo eliminar',
      });
    }
  };

  const handleSave = async (formData: FormData) => {
    try {
      if (editingNode && editingNode.id) {
        await updateNode(editingNode.id, formData);
      } else {
        await createNode(formData);
      }
      await fetchData();
      Swal.fire({
        icon: 'success',
        title: editingNode ? 'Actualizado' : 'Creado',
        toast: true,
        position: 'center',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err: any) {
      // Extract error message from backend response if possible
      const msg = err.message || 'Ocurrió un error al guardar';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg,
      });
      throw err; // Re-throw to keep modal open if needed, or handle inside modal
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-6 md:p-8 font-sans text-slate-800 dark:text-slate-200">
      <style>{`
        .swal2-container {
          z-index: 99999 !important;
        }
      `}</style>

      <NodeModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleSave} 
        initialData={editingNode}
        parentId={parentIdForNew}
      />

      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Organigrama</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gestiona la estructura jerárquica de la institución.</p>
        </div>
        <button 
          onClick={handleAddRoot}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Agregar Nodo Raíz
        </button>
      </header>

      {/* Main Content - Strictly contained Pan/Zoom Area */}
      <div className="w-full bg-slate-50/50 dark:bg-gray-800/50 rounded-3xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden h-[650px] relative select-none">
        
        {/* Transform Controls */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2 bg-white dark:bg-gray-800 shadow-lg border border-slate-100 dark:border-gray-700 rounded-xl p-2">
            <button 
              onClick={() => setScale(s => Math.min(s + 0.1, 2))}
              className="p-2 hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300 rounded-lg transition-colors"
              title="Acercar"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setScale(s => Math.max(s - 0.1, 0.2))}
              className="p-2 hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300 rounded-lg transition-colors"
              title="Alejar"
            >
              <div className="w-5 h-5 flex items-center justify-center font-bold text-lg">-</div>
            </button>
           <div className="h-px bg-slate-100 dark:bg-gray-700 my-1"></div>
           <button 
             onClick={() => { setScale(0.6); setPosition({x:0, y:0}); }}
             className="p-2 hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300 rounded-lg transition-colors"
             title="Resetear Vista"
           >
             <div className="text-xs font-bold">RST</div>
           </button>
        </div>
        
        {/* Background Grid Pattern */}
         <div className="absolute inset-0 z-0 opacity-30 pointer-events-none" 
            style={{ 
              backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', 
              backgroundSize: '24px 24px' 
            }}>
         </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-full relative z-10">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500">Cargando estructura...</p>
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center relative z-10">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <User className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Organigrama Vacío</h3>
            <p className="text-slate-500 max-w-sm mb-6">
              Comienza agregando el puesto más alto (ej. Rectoría) para construir el árbol.
            </p>
            <button 
              onClick={handleAddRoot}
              className="text-blue-600 font-medium hover:underline"
            >
              Crear primer nodo
            </button>
          </div>
        ) : (
          <div 
            className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center relative z-10"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div 
              style={{ 
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                transformOrigin: 'top center'
              }}
              className="absolute top-20" 
            >
              <div className="flex justify-center pb-20"> {/* Add padding bottom to ensure bottom nodes are reachable */}
                {nodes.map(node => (
                  <NodeCard 
                    key={node.id} 
                    node={node} 
                    onEdit={handleEdit} 
                    onAddChild={handleAddChild} 
                    onDelete={handleDelete}
                    level={0}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
