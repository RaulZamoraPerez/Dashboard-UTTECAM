import React, { useState, useEffect, useRef } from "react";
import * as directorioApi from '../../services/directorioApiService';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit2, 
  Phone, 
  Mail, 
  User, 
  Briefcase, 
  X, 
  Save, 
  ImageIcon,
  Eye,
  EyeOff
} from 'lucide-react';
import Swal from 'sweetalert2';

const BACKEND = (import.meta.env.VITE_BACKENDURL || '').replace(/\/$/, '');
const ItemTypes = { CARD: 'contact_card' };

// ... (Interface ContactItem remains)

interface DraggableContactProps {
  contact: ContactItem;
  index: number;
  moveContact: (dragIndex: number, hoverIndex: number) => void;
  onDropEnd: () => void;
  toggleActivo: (c: ContactItem) => void;
  handleOpenModal: (c: ContactItem) => void;
  handleDelete: (id: number) => void;
  isDraggable: boolean;
}

const DraggableContact = ({ 
  contact, 
  index, 
  moveContact, 
  onDropEnd,
  toggleActivo, 
  handleOpenModal, 
  handleDelete,
  isDraggable 
}: DraggableContactProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any) {
      if (!ref.current) return;
      if (!isDraggable) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      // Dragging downwards
      // if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      // Dragging upwards
      // if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      // Grid logic is more complex than simple Y sort, but simple swap works okay for now.
      
      moveContact(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    drop() {
       onDropEnd();
    }
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id: contact.id, index };
    },
    canDrag: isDraggable,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div 
      ref={ref}
      data-handler-id={handlerId}
      className={`group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border transition-all hover:shadow-md ${
        !contact.activo 
          ? 'border-slate-200 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 opacity-75' 
          : 'border-slate-100 dark:border-gray-700'
      } ${isDragging ? 'opacity-0' : 'opacity-100'} ${isDraggable ? 'cursor-move' : ''}`}
    >
        <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 dark:bg-gray-700 border border-slate-200 dark:border-gray-600">
                  {contact.imagenUrl ? (
                    <img src={contact.imagenUrl} alt={contact.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                </div>
                {!contact.activo && (
                  <div className="absolute -bottom-1 -right-1 bg-slate-500 text-white p-1 rounded-full border-2 border-white dark:border-gray-800" title="Inactivo / Oculto">
                    <EyeOff className="w-3 h-3" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white truncate text-lg" title={contact.name}>
                  {contact.name}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium truncate flex items-center gap-1.5 mb-2">
                  <Briefcase className="w-3.5 h-3.5" />
                  {contact.title}
                </p>
                
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate" title={contact.email}>{contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {contact.phone}
                      {contact.extension && <span className="text-slate-400 dark:text-slate-500 ml-1">ext. {contact.extension}</span>}
                    </span>
                  </div>
                  {/*
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                     <span className="text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Orden: {contact.orden}</span>
                  </div>
                  */}
                </div>
              </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-gray-700 flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
               <button 
                onClick={() => toggleActivo(contact)}
                className={`p-2 rounded-lg transition-colors ${
                  !contact.activo 
                    ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-gray-700'
                }`}
                title={!contact.activo ? "Activar (Hacer visible)" : "Desactivar (Ocultar)"}
              >
                {!contact.activo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => handleOpenModal(contact)}
                className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDelete(contact.id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
        </div>
    </div>
  );
};

// Interface Update
interface ContactItem {
  id: number;
  title: string;
  name: string;
  phone: string;
  extension?: string;
  email: string;
  imagenUrl?: string;
  activo: boolean;
  orden: number;
}

export default function DirectorioPage() {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactItem | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<ContactItem>>({});
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  
  // Validation State
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validación de campo individual
  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value?.trim()) return 'El nombre es obligatorio';
        if (value.length > 100) return 'Máximo 100 caracteres';
        break;
      case 'title':
        if (!value?.trim()) return 'El cargo es obligatorio';
        if (value.length > 100) return 'Máximo 100 caracteres';
        break;
      case 'email':
        if (!value?.trim()) return 'El correo es obligatorio';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Formato de correo inválido';
        break;
      case 'phone':
        if (value?.trim()) {
          const phoneRegex = /^[\d\s\-\(\)\+]+$/;
          if (!phoneRegex.test(value)) return 'Solo números, espacios y guiones';
          if (value.length > 20) return 'Máximo 20 caracteres';
        }
        break;
      case 'extension':
        if (value?.trim()) {
          if (!/^\d*$/.test(value)) return 'Solo números';
          if (value.length > 10) return 'Máximo 10 dígitos';
        }
        break;
    }
    return undefined;
  };

  // Manejar cambio con validación en tiempo real
  const handleFieldChange = (field: string, value: string) => {
    setFormData({...formData, [field]: value});
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setFieldErrors(prev => ({ ...prev, [field]: error }));
  };

  const buildImageUrl = (filename?: string) => {
    if (!filename) return undefined;
    const base = BACKEND || window.location.origin;
    if (filename.startsWith('http')) return filename;
    if (filename.startsWith('/uploads')) return `${base}${filename}`;
    if (filename.startsWith('uploads/')) return `${base}/${filename}`;
    if (filename.includes('/')) return `${base}/${filename}`;
    return `${base}/uploads/directorios/${filename}`;
  };

  const fetchContacts = async () => {
    try {
      const res = await directorioApi.getAll();
      const rows = res.data || res;
      const items = (rows || []).map((row: any) => ({
        id: row.id,
        title: row.titulo || '',
        name: row.nombre || '',
        phone: row.telefono || '',
        extension: row.extension,
        email: row.correo || '',
        imagenUrl: row.imagen ? buildImageUrl(row.imagen) : row.imagen,
        activo: row.activo !== undefined ? row.activo : true,
        orden: row.orden || 0
      }));
      setContacts(items);
    } catch (err) {
      console.error('Error cargando directorio', err);
      // ... (swal)
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter(c => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.title || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q)
    );
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
    setFormData({});
    setFileToUpload(null);
    setPreviewUrl(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileToUpload(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }; 

  const handleOpenModal = (contact?: ContactItem) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({ ...contact });
      setPreviewUrl(contact.imagenUrl || null);
    } else {
      setEditingContact(null);
      setFormData({ activo: true, orden: 0 });
      setPreviewUrl(null);
    }
    setFileToUpload(null);
    setIsModalOpen(true);
  };
  
  // ...

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.title || !formData.email) {
       // ... (swal)
       return;
    }

    setBusy(true);
    try {
      const payload: any = {
        titulo: formData.title,
        nombre: formData.name,
        telefono: formData.phone || '',
        extension: formData.extension || '',
        correo: formData.email,
        orden: formData.orden ? Number(formData.orden) : 0,
        activo: formData.activo !== undefined ? formData.activo : true
      };

      if (editingContact) {
        await directorioApi.update(editingContact.id, { ...payload, imagenFile: fileToUpload });
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'El contacto ha sido actualizado correctamente.',
          position: 'center',
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        await directorioApi.create({ ...payload, imagenFile: fileToUpload });
        Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: 'El nuevo contacto ha sido agregado.',
          position: 'center',
          showConfirmButton: false,
          timer: 1500
        });
      }
      await fetchContacts();
      handleCloseModal();
    } catch (err) {
       // ...
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Eliminar contacto?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      position: 'center'
    });

    if (!result.isConfirmed) return;

    try {
      await directorioApi.remove(id);
      await fetchContacts();
      Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        text: 'El contacto ha sido eliminado.',
        position: 'center',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el contacto.',
        position: 'center',
        confirmButtonColor: '#d33'
      });
    }
  };

  const toggleActivo = async (contact: ContactItem) => {
    try {
       const payload = {
         titulo: contact.title,
         nombre: contact.name,
         telefono: contact.phone,
         extension: contact.extension,
         correo: contact.email,
         activo: !contact.activo,
         orden: contact.orden
       };
       await directorioApi.update(contact.id, payload);
       await fetchContacts();
       Swal.fire({
         icon: 'success',
         title: contact.activo ? 'Ocultado' : 'Visible',
         text: `El contacto ahora está ${contact.activo ? 'oculto' : 'visible'}.`,
         position: 'center',
         showConfirmButton: false,
         timer: 1000,
         toast: true
       });
    } catch (err) {
       console.error(err);
       Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el estado.',
        position: 'center',
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  const moveContact = (dragIndex: number, hoverIndex: number) => {
    if (search.trim()) return; 

    // Note: React DnD might trigger this rapidly. 
    // We are mutating state, which is fine for UI feedback but heavy.
    // For smoother exp, we might want separate local state for "dragged list" vs "saved list", 
    // but updating 'contacts' directly is simplest for now.
    
    setContacts((prevContacts) => {
        const updated = [...prevContacts];
        const [draggedItem] = updated.splice(dragIndex, 1);
        if (!draggedItem) return prevContacts;
        updated.splice(hoverIndex, 0, draggedItem);
        return updated;
    });
  };



  // We actually need a useEffect to save? or just call it?
  // Easier: updateOrder(currentContacts.map(c=>c.id)).
  // But inside handleDropSave, 'contacts' is the list at the time handleDropSave was passed down.
  // Since 'moveContact' triggers re-render, a NEW handleDropSave is created with NEW contacts.
  // So it works.
  
  const saveOrder = async (currentContacts: ContactItem[]) => {
      const ids = currentContacts.map(c => c.id);
      try {
        await directorioApi.updateOrder(ids);
        Swal.fire({
          icon: 'success',
          title: 'Orden guardado',
          text: 'El orden de prioridad se ha actualizado.',
          position: 'top-end',
          showConfirmButton: false,
          timer: 1000,
          toast: true
        });
      } catch(e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-6 md:p-8 font-sans text-slate-800 dark:text-slate-200">
      <style>{`
        .swal2-container {
          z-index: 99999 !important;
        }
      `}</style>

      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Directorio Institucional</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Arrastra y suelta las tarjetas para ordenar la prioridad en el sitio web.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Nuevo Contacto
        </button>
      </header>

      {/* Toolbar */}
      <div className="mb-8 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, cargo, correo..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 px-3 py-1 rounded-lg shadow-sm">
            Total: <strong className="text-slate-800 dark:text-slate-200">{contacts.length}</strong>
          </span>
        </div>
      </div>

      {/* Grid */}
      <DndProvider backend={HTML5Backend}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredContacts.map((contact, index) => (
             <DraggableContact 
                key={contact.id} 
                contact={contact} 
                index={index}
                moveContact={moveContact}
                onDropEnd={() => saveOrder(contacts)}
                toggleActivo={toggleActivo} 
                handleOpenModal={handleOpenModal} 
                handleDelete={handleDelete}
                isDraggable={!search.trim()} 
             />
          ))}
        </div>
      </DndProvider>

      {filteredContacts.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-gray-600">
            <Search className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No se encontraron contactos</h3>
          <p className="text-slate-500 dark:text-slate-400">Intenta con otros términos de búsqueda.</p>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-lg">
                {editingContact ? <Edit2 className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
                {editingContact ? 'Editar Contacto' : 'Nuevo Contacto'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="contact-form" onSubmit={handleSave} className="space-y-6">
                
                {/* Image Upload */}
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 group hover:border-blue-500 transition-colors">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon className="w-8 h-8 mb-1" />
                        <span className="text-[10px]">Foto</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Click para subir foto (Opcional)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre */}
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${touched.name && fieldErrors.name ? 'text-red-600' : 'text-slate-700'}`}>
                      Nombre Completo <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${touched.name && fieldErrors.name ? 'text-red-400' : 'text-slate-400'}`} />
                      <input 
                        value={formData.name || ''}
                        onChange={e => handleFieldChange('name', e.target.value)}
                        className={`w-full pl-10 border-2 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                          touched.name && fieldErrors.name 
                            ? 'border-red-500 bg-red-50 focus:ring-red-500/20 focus:border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' 
                            : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                        }`}
                        placeholder="Ej. Juan Pérez"
                      />
                    </div>
                    {touched.name && fieldErrors.name && (
                      <p className="text-sm text-red-600 font-medium bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Cargo */}
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${touched.title && fieldErrors.title ? 'text-red-600' : 'text-slate-700'}`}>
                      Cargo / Título <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${touched.title && fieldErrors.title ? 'text-red-400' : 'text-slate-400'}`} />
                      <input 
                        value={formData.title || ''}
                        onChange={e => handleFieldChange('title', e.target.value)}
                        className={`w-full pl-10 border-2 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                          touched.title && fieldErrors.title 
                            ? 'border-red-500 bg-red-50 focus:ring-red-500/20 focus:border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' 
                            : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                        }`}
                        placeholder="Ej. Director Académico"
                      />
                    </div>
                    {touched.title && fieldErrors.title && (
                      <p className="text-sm text-red-600 font-medium bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                        {fieldErrors.title}
                      </p>
                    )}
                  </div>

                  {/* Correo */}
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${touched.email && fieldErrors.email ? 'text-red-600' : 'text-slate-700'}`}>
                      Correo Electrónico <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${touched.email && fieldErrors.email ? 'text-red-400' : 'text-slate-400'}`} />
                      <input 
                        type="email"
                        value={formData.email || ''}
                        onChange={e => handleFieldChange('email', e.target.value)}
                        className={`w-full pl-10 border-2 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                          touched.email && fieldErrors.email 
                            ? 'border-red-500 bg-red-50 focus:ring-red-500/20 focus:border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' 
                            : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                        }`}
                        placeholder="ejemplo@uttecam.edu.mx"
                      />
                    </div>
                    {touched.email && fieldErrors.email && (
                      <p className="text-sm text-red-600 font-medium bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Teléfono, Extensión, Orden */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Teléfono */}
                    <div className="space-y-2">
                      <label className={`text-sm font-medium ${touched.phone && fieldErrors.phone ? 'text-red-600' : 'text-slate-700'}`}>
                        Teléfono
                      </label>
                      <div className="relative">
                        <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${touched.phone && fieldErrors.phone ? 'text-red-400' : 'text-slate-400'}`} />
                        <input 
                          value={formData.phone || ''}
                          onChange={e => handleFieldChange('phone', e.target.value)}
                          className={`w-full pl-10 border-2 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                            touched.phone && fieldErrors.phone 
                              ? 'border-red-500 bg-red-50 focus:ring-red-500/20 focus:border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' 
                              : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                          }`}
                          placeholder="249..."
                        />
                      </div>
                      {touched.phone && fieldErrors.phone && (
                        <p className="text-xs text-red-600 font-medium">
                          {fieldErrors.phone}
                        </p>
                      )}
                    </div>
                    
                    {/* Extensión */}
                    <div className="space-y-2">
                      <label className={`text-sm font-medium ${touched.extension && fieldErrors.extension ? 'text-red-600' : 'text-slate-700'}`}>
                        Extensión
                      </label>
                      <input 
                        value={formData.extension || ''}
                        onChange={e => handleFieldChange('extension', e.target.value)}
                        className={`w-full border-2 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                          touched.extension && fieldErrors.extension 
                            ? 'border-red-500 bg-red-50 focus:ring-red-500/20 focus:border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' 
                            : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                        }`}
                        placeholder="101"
                      />
                      {touched.extension && fieldErrors.extension && (
                        <p className="text-xs text-red-600 font-medium">
                          {fieldErrors.extension}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="activo"
                    checked={formData.activo !== undefined ? formData.activo : true}
                    onChange={e => setFormData({...formData, activo: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="activo" className="text-sm text-slate-700 select-none cursor-pointer">
                    Visible en el sitio público (Activo)
                  </label>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                form="contact-form"
                disabled={busy}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all flex items-center gap-2"
              >
                {busy ? 'Guardando...' : (
                  <>
                    <Save className="w-4 h-4" />
                    {editingContact ? 'Guardar Cambios' : 'Crear Contacto'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}