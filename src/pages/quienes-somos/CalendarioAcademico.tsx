import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { getFileUrl, createCalendario, getAllCalendarios, updateCalendario, deleteCalendario } from '../../services/calendarioService';
import { Calendario } from '../../types/calendario';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Edit2, 
  Eye, 
  Upload, 
  FileText, 
 
  X,
  Save,
 
  Search
} from 'lucide-react';
import Swal from 'sweetalert2';

interface FormData {
  titulo: string;
  archivo: File | null;
}

const CalendarioAcademico: React.FC = () => {
  // Frontend-only state: usamos localStorage + URL.createObjectURL para preview en sesión
  const [calendarios, setCalendarios] = useState<Calendario[]>(() => {
    try {
      const raw = localStorage.getItem('calendarios_v1');
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Partial<Calendario>[];
      return parsed.map((c) => ({
        id: c.id || Date.now(),
        titulo: c.titulo || '',
        archivo: c.archivo || '',
        fechaSubida: c.fechaSubida || new Date().toISOString(),
        createdAt: c.createdAt || new Date().toISOString(),
        updatedAt: c.updatedAt || new Date().toISOString(),
      })) as Calendario[];
    } catch (err) {
      console.error('Error leyendo calendarios de localStorage', err);
      return [];
    }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCalendario, setEditingCalendario] = useState<Calendario | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    archivo: null,
  });
  const [loading, ] = useState<boolean>(false);
  const [tempFileUrl, setTempFileUrl] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const persistToLocalStorage = (items: Calendario[]) => {
    try {
      const toStore = items.map(({ id, titulo, archivo, fechaSubida, createdAt, updatedAt }) => ({ id, titulo, archivo, fechaSubida, createdAt, updatedAt }));
      localStorage.setItem('calendarios_v1', JSON.stringify(toStore));
    } catch (err) {
      console.error('Error guardando calendarios en localStorage', err);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await getAllCalendarios();
        if (!mounted) return;
        const mapped = items.map((c) => ({
          id: c.id,
          titulo: c.titulo,
          archivo: c.archivo,
          fechaSubida: c.fechaSubida || c.createdAt,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        } as Calendario));
        setCalendarios(mapped);
      } catch (err) {
        console.warn('No se pudo cargar calendarios desde API, usando localStorage', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onDrop = (acceptedFiles: File[], fileRejections: any[]) => {
    if (fileRejections.length > 0) {
      const error = fileRejections[0].errors[0];
      if (error.code === 'file-too-large') {
        Swal.fire({
          icon: 'error',
          title: 'Archivo demasiado grande',
          text: 'El tamaño máximo permitido es de 5MB.',
          confirmButtonColor: '#3b82f6'
        });
      } else if (error.code === 'file-invalid-type') {
        Swal.fire({
          icon: 'error',
          title: 'Tipo de archivo no válido',
          text: 'Solo se permiten archivos PDF e imágenes (JPG, PNG, WEBP).',
          confirmButtonColor: '#3b82f6'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar archivo',
          text: error.message,
          confirmButtonColor: '#3b82f6'
        });
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const tituloGenerado = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      const archivoUrl = URL.createObjectURL(file);
      setTempFileUrl(archivoUrl);
      setFormData(prev => ({
        ...prev,
        archivo: file,
        titulo: prev.titulo || tituloGenerado,
      }));
      
      // Feedback visual
      Swal.fire({
        icon: 'success',
        title: editingCalendario ? 'Archivo actualizado para reemplazo' : 'Archivo cargado',
        text: `Seleccionado: ${file.name}`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });

      if (!editingCalendario && !formData.titulo) {
        setFormData(prev => ({ ...prev, titulo: tituloGenerado }));
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCalendario && !formData.archivo) {
      Swal.fire({
        icon: 'warning',
        title: 'Archivo requerido',
        text: 'Por favor selecciona un archivo para subir.',
        position: 'center',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }
    if (!formData.titulo.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Título requerido',
        text: 'El calendario debe tener un título.',
        position: 'center',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    setUploading(true);
    try {
      if (editingCalendario) {
        try {
          const updated = await updateCalendario(editingCalendario.id, {
            titulo: formData.titulo.trim(),
            descripcion: undefined,
            archivo: formData.archivo || undefined,
          });
          const next = calendarios.map(c => c.id === updated.id ? {
            ...c,
            ...updated,
            fechaSubida: updated.fechaSubida || updated.createdAt
          } as Calendario : c);
          setCalendarios(next);
          persistToLocalStorage(next);
          handleCloseModal();
          Swal.fire({
            icon: 'success',
            title: '¡Actualizado!',
            text: 'El calendario ha sido actualizado correctamente.',
            position: 'center',
            showConfirmButton: false,
            timer: 1500
          });
        } catch (err) {
          console.error('Error actualizando calendario:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el calendario.',
            position: 'center',
            confirmButtonColor: '#d33'
          });
        }
      } else {
        try {
          if (!formData.archivo) throw new Error('Archivo requerido');
          const created = await createCalendario({
            titulo: formData.titulo.trim(),
            descripcion: undefined,
            archivo: formData.archivo,
          });

          const archivoField = (created as any).archivo || '';
          const item: Calendario = {
            id: created.id,
            titulo: created.titulo,
            archivo: archivoField,
            fechaSubida: created.fechaSubida || created.createdAt,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
          } as Calendario;

          const next = [item, ...calendarios];
          setCalendarios(next);
          persistToLocalStorage(next);
          handleCloseModal();
          Swal.fire({
            icon: 'success',
            title: '¡Subido!',
            text: 'El calendario se ha subido exitosamente.',
            position: 'center',
            showConfirmButton: false,
            timer: 1500
          });
        } catch (err) {
          console.error('Error subiendo calendario:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo subir el calendario.',
            position: 'center',
            confirmButtonColor: '#d33'
          });
        }
      }
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (calendario: Calendario) => {
    setEditingCalendario(calendario);
    setFormData({
      titulo: calendario.titulo,
      archivo: null,
    });
    const url = getFileUrl(calendario.archivo);
    setTempFileUrl(url);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Eliminar calendario?',
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
      await deleteCalendario(id);
      const next = calendarios.filter(c => c.id !== id);
      setCalendarios(next);
      persistToLocalStorage(next);
      Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        text: 'El calendario ha sido eliminado.',
        position: 'center',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err) {
      console.error('Error eliminando calendario en API, aplicando cambio local como fallback:', err);
      const next = calendarios.filter(c => c.id !== id);
      setCalendarios(next);
      persistToLocalStorage(next);
      Swal.fire({
        icon: 'warning',
        title: 'Eliminado localmente',
        text: 'No se pudo eliminar del servidor, pero se ha eliminado de tu vista local.',
        position: 'center',
        showConfirmButton: false,
        timer: 2000
      });
    }
  };

  const handlePreview = (calendario: Calendario) => {
    const temp = (calendario as any).url || (calendario as any).archivo_url as string | undefined;
    if (temp) {
      window.open(temp, '_blank', 'noopener,noreferrer');
      return;
    }
    if (calendario.archivo) {
      const fileUrl = getFileUrl(calendario.archivo);
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    Swal.fire({
      icon: 'info',
      title: 'No disponible',
      text: 'El archivo no está disponible para previsualizar en esta sesión.',
      position: 'center',
      confirmButtonColor: '#3b82f6'
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCalendario(null);
    setFormData({ titulo: '', archivo: null });
    setTempFileUrl(null);
  };

  const renderFilePreview = (calendario: Calendario) => {
    const temp = (calendario as any).url || (calendario as any).archivo_url as string | undefined;
    const archivoName = calendario.archivo || '';
    const isPDF = archivoName.toLowerCase().endsWith('.pdf');
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(archivoName);

    if ((temp || calendario.archivo) && isImage) {
      const src = temp || getFileUrl(calendario.archivo);
      return (
        <div className="w-full h-full relative group">
          <img src={src} alt={calendario.titulo} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      );
    }
    
    if (isPDF) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-gray-800 p-6">
          <div className="relative w-16 h-20 bg-white dark:bg-gray-700 shadow-lg rounded-sm border-t-[3px] border-red-500 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
             <FileText className="w-8 h-8 text-red-500" />
             {/* Decorative lines to simulate document */}
             <div className="absolute bottom-3 left-2 right-2 space-y-1">
                <div className="h-[2px] w-full bg-slate-100 dark:bg-gray-600"></div>
                <div className="h-[2px] w-2/3 bg-slate-100 dark:bg-gray-600"></div>
             </div>
          </div>
          <span className="text-[9px] font-black mt-3 text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded uppercase tracking-widest">Documento PDF</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-slate-50 dark:bg-gray-800">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center text-slate-400">
          <Calendar className="w-6 h-6" />
        </div>
      </div>
    );
  };

  const filteredCalendars = calendarios.filter(c => 
    c.titulo.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Calendario Académico</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gestión y publicación de calendarios escolares.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Subir Calendario
        </button>
      </header>

      {/* Toolbar */}
      <div className="mb-8 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar calendario..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 px-3 py-1 rounded-lg shadow-sm">
            Total: <strong className="text-slate-800 dark:text-slate-200">{calendarios.length}</strong>
          </span>
        </div>
      </div>

      {/* Adaptive List Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className={`grid gap-6 ${filteredCalendars.length === 1 ? 'grid-cols-1 max-w-3xl' : 'grid-cols-1 xl:grid-cols-2'}`}>
            {filteredCalendars.map((calendario) => {
            const archivoName = calendario.archivo || '';
            const isPDF = archivoName.toLowerCase().endsWith('.pdf');

            return ( 
              <div 
                key={calendario.id} 
                className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-gray-700 hover:shadow-xl hover:shadow-blue-500/5 transition-all flex flex-col sm:flex-row h-full min-h-[180px]"
              >
                {/* Preview Area (Left side) */}
                <div 
                  className="w-full sm:w-56 lg:w-64 bg-slate-50 dark:bg-gray-700 relative overflow-hidden flex items-center justify-center border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-gray-700 shrink-0 cursor-pointer"
                  onClick={() => handlePreview(calendario)}
                >
                  {renderFilePreview(calendario)}
                  
                  {/* ID Badge */}
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-full px-3 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-gray-700">
                    ID #{calendario.id}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <div className="w-10 h-10 rounded-full bg-white text-slate-800 flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Info Area (Right side) */}
                <div className="p-5 flex-1 flex flex-col justify-between bg-white dark:bg-gray-800">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                       <h3 className="font-bold text-slate-800 dark:text-white text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                        {calendario.titulo}
                      </h3>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-medium bg-slate-50 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                        <Calendar className="w-3 h-3" />
                        <span>Publicado: {new Date(calendario.fechaSubida).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-blue-500 font-bold bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md border border-blue-100/30">
                        <FileText className="w-3 h-3" />
                        <span>{isPDF ? 'PDF' : 'Imagen'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - More compact and modern */}
                  <div className="mt-4 pt-4 border-t border-slate-50 dark:border-gray-700/50 flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(calendario)}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold uppercase tracking-wider py-2 rounded-xl transition-all shadow-sm shadow-blue-100 dark:shadow-none active:scale-95"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePreview(calendario)}
                        className="w-9 h-9 inline-flex items-center justify-center bg-slate-50 dark:bg-gray-700/50 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-slate-100 dark:border-gray-600"
                        title="Ver Pantalla Completa"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(calendario.id)}
                        className="w-9 h-9 inline-flex items-center justify-center bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-100 dark:border-red-900/30"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </>
      )}

      {filteredCalendars.length === 0 && !loading && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-gray-600">
            <Calendar className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No hay calendarios</h3>
          <p className="text-slate-500 dark:text-slate-400">Sube un nuevo calendario para comenzar.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                {editingCalendario ? <Edit2 className="w-5 h-5 text-blue-600" /> : <Upload className="w-5 h-5 text-blue-600" />}
                {editingCalendario ? 'Editar Calendario' : 'Subir Calendario'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Archivo</label>
                <div
                  {...getRootProps()}
                  className={`mt-1 flex justify-center rounded-xl border-2 border-dashed px-6 pt-8 pb-8 transition-all ${
                    uploading 
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50' 
                      : isDragActive 
                        ? 'border-blue-500 bg-blue-50 cursor-pointer scale-[1.02]' 
                        : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  <div className="space-y-2 text-center">
                    {tempFileUrl ? (
                      <div className="relative w-full max-w-[200px] mx-auto">
                        {formData.archivo?.type.includes('image') ? (
                          <img src={tempFileUrl} alt="Preview" className="rounded-lg shadow-sm max-h-32 mx-auto" />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 bg-red-50 text-red-500 rounded-lg border border-red-100">
                            <FileText className="w-10 h-10 mb-2" />
                            <span className="text-xs font-bold">PDF Seleccionado</span>
                          </div>
                        )}
                        <p className="text-xs text-slate-500 mt-2 truncate max-w-full">{formData.archivo?.name}</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="text-sm text-slate-600">
                          <p className="font-medium">
                            {uploading 
                              ? 'Subiendo...' 
                              : isDragActive 
                                ? 'Suelta el archivo aquí' 
                                : 'Arrastra o haz clic para seleccionar'
                            }
                          </p>
                        </div>
                        <p className="text-xs text-slate-400">PDF, PNG, JPG hasta 5MB</p>
                      </>
                    )}
                    <input {...getInputProps()} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Título</label>
                <input 
                  value={formData.titulo}
                  onChange={e => setFormData({...formData, titulo: e.target.value})}
                  maxLength={255}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  placeholder="Ej. Calendario Escolar 2024-2025"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  disabled={uploading}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={uploading || (!formData.archivo && !editingCalendario) || !formData.titulo}
                  className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all flex items-center gap-2"
                >
                  {uploading ? 'Subiendo...' : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingCalendario ? 'Guardar Cambios' : 'Subir'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioAcademico;