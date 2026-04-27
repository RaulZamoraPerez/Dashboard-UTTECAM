import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Eye, 
  Calendar as CalendarIcon, 
  FileText, 
  Download, 
  AlertCircle,
  FileUp,
  Image as ImageIcon,
  X,
  Search,
  Filter
} from 'lucide-react';
import { confirmDialog, toastSuccess, toastError } from '../../utils/alert';
import { useDropzone } from 'react-dropzone';
import { useCalendario } from '../../hooks/useCalendario';
import { getFileUrl } from '../../services/calendarioService';
import { Calendario, CreateCalendarioRequest } from '../../types/calendario';

interface FormData {
  titulo: string;
  archivo: File | null;
}

const CalendarioAcademico: React.FC = () => {
  const { calendarios, loading, error, createItem, updateItem, deleteItem } = useCalendario();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCalendario, setEditingCalendario] = useState<Calendario | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    archivo: null,
  });

  // Filtrado de calendarios
  const filteredCalendarios = calendarios.filter(cal => 
    cal.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onDrop = (acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        toastError('El archivo es demasiado pesado (máx. 10MB)');
      } else if (error.code === 'file-invalid-type') {
        toastError('Tipo de archivo no permitido. Solo PDF e imágenes.');
      } else {
        toastError('Error al cargar el archivo');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      // Generar título automáticamente basado en el nombre del archivo (sin extensión)
      const tituloGenerado = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      
      setFormData(prev => ({
        ...prev,
        archivo: file,
        titulo: prev.titulo || tituloGenerado, // Solo autogenerar si está vacío
      }));
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
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCalendario && !formData.archivo) {
      toastError('Debes seleccionar un archivo');
      return;
    }
    if (!formData.titulo.trim()) {
      toastError('El título es requerido');
      return;
    }

    setUploading(true);
    try {
      let data: any = {
        titulo: formData.titulo.trim(),
      };

      if (formData.archivo) {
        data.archivo = formData.archivo;
      }

      let success = false;
      if (editingCalendario) {
        success = await updateItem(editingCalendario.id, data);
        if (success) toastSuccess('Calendario actualizado satisfactoriamente');
      } else {
        success = await createItem(data as CreateCalendarioRequest);
        if (success) toastSuccess('Nuevo calendario agregado correctamente');
      }

      if (success) {
        handleCloseModal();
      }
    } catch (err: any) {
      toastError(err.message || 'Error al procesar el calendario');
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
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDialog({ 
      title: '¿Eliminar calendario?', 
      text: 'Esta acción no se puede deshacer y borrará el archivo físico del servidor.',
      confirmText: 'Sí, eliminar'
    });
    
    if (!confirmed) return;
    
    const ok = await deleteItem(id);
    if (ok) toastSuccess('Calendario eliminado correctamente');
  };

  const handlePreview = (calendario: Calendario) => {
    const fileUrl = getFileUrl(calendario.archivo);
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCalendario(null);
    setFormData({ titulo: '', archivo: null });
  };

  if (loading && calendarios.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[400px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-slate-500 animate-pulse">Cargando calendarios institucionales...</p>
      </div>
    );
  }

  return (
    <div className="p-1 sm:p-4 lg:p-6 bg-slate-50/30 min-h-screen">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-blue-600" />
            Calendario Académico
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Administra los calendarios de ciclos escolares y periodos vacacionales.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-sm shadow-blue-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Nuevo Calendario
        </button>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar calendario por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span>Mostrando {filteredCalendarios.length} resultados</span>
        </div>
      </div>

      {/* Horizontal List/Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCalendarios.map((cal) => {
          const isPDF = cal.archivo.toLowerCase().endsWith('.pdf');
          const fileUrl = getFileUrl(cal.archivo);
          
          return (
            <div key={cal.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col sm:flex-row h-full min-h-[160px]">
              {/* Preview Area (Left side) */}
              <div className="w-full sm:w-48 lg:w-56 bg-slate-50 relative overflow-hidden flex items-center justify-center border-b sm:border-b-0 sm:border-r border-slate-100 shrink-0">
                {isPDF ? (
                   <div className="flex flex-col items-center gap-2 p-4">
                     <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 transform group-hover:scale-110 transition-transform">
                       <FileText className="w-7 h-7" />
                     </div>
                     <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">PDF</span>
                   </div>
                ) : (
                  <img 
                    src={fileUrl} 
                    alt={cal.titulo} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                )}
                
                {/* ID Badge */}
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur rounded-lg px-2 py-1 text-[9px] font-black text-slate-500 shadow-sm border border-slate-100">
                  #{cal.id}
                </div>

                {/* Quick Actions Hover Overlay */}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                   <button 
                    onClick={() => handlePreview(cal)}
                    className="w-8 h-8 rounded-full bg-white text-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all transform scale-90 group-hover:scale-100 duration-200"
                    title="Previsualizar"
                   >
                     <Eye className="w-4 h-4" />
                   </button>
                   <a 
                    href={fileUrl} 
                    download 
                    className="w-8 h-8 rounded-full bg-white text-slate-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all transform scale-90 group-hover:scale-100 duration-200 delay-[30ms]"
                    title="Descargar"
                    onClick={(e) => e.stopPropagation()}
                   >
                     <Download className="w-4 h-4" />
                   </a>
                </div>
              </div>

              {/* Info Area (Right side) */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-base leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                    {cal.titulo}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                    <CalendarIcon className="w-3 h-3" />
                    <span>Publicado: {new Date(cal.fechaSubida).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-4 flex items-center gap-2">
                   <button 
                    onClick={() => handleEdit(cal)}
                    className="flex-1 text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50/50 hover:bg-blue-100 py-2 rounded-xl transition-all border border-blue-100/20"
                   >
                     Editar Registro
                   </button>
                   <button 
                    onClick={() => handleDelete(cal.id)}
                    className="w-9 h-9 flex items-center justify-center text-red-400 bg-red-50/50 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all border border-red-100/20"
                    title="Eliminar"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCalendarios.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <Search className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">No se encontraron calendarios</h3>
            <p className="text-slate-400 text-sm">Prueba con otro término de búsqueda o agrega uno nuevo.</p>
          </div>
        )}
      </div>

      {/* Modal - Modern Design */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={handleCloseModal}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {editingCalendario ? (
                  <><FileText className="w-5 h-5 text-blue-600" /> Editar Calendario</>
                ) : (
                  <><Plus className="w-5 h-5 text-blue-600" /> Nuevo Calendario</>
                )}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Título del Calendario</label>
                <input 
                  type="text" 
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ej: Calendario Escolar 2024-2025"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>

              {/* Dropzone Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Archivo {editingCalendario ? '(Opcional)' : '*'}
                </label>
                <div
                  {...getRootProps()}
                  className={`relative group border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center gap-3 ${
                    uploading
                      ? 'border-slate-100 bg-slate-50 cursor-not-allowed'
                      : isDragActive
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer'
                  }`}
                >
                  <input {...getInputProps()} />
                  
                  {formData.archivo ? (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in-95">
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-2">
                        {formData.archivo.type === 'application/pdf' ? <FileText className="w-8 h-8" /> : <ImageIcon className="w-8 h-8" />}
                      </div>
                      <p className="text-sm font-semibold text-slate-700 line-clamp-1 px-10 text-center">
                        {formData.archivo.name}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">
                        {(formData.archivo.size / 1024 / 1024).toFixed(2)} MB • {formData.archivo.type.split('/')[1]}
                      </p>
                    </div>
                  ) : editingCalendario ? (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3">
                         <FileUp className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-medium text-slate-500">Haz clic para reemplazar el archivo actual</p>
                      <p className="text-[10px] text-slate-300 mt-1">Si no seleccionas nada, se mantendrá el archivo anterior</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileUp className="w-7 h-7" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-700">Subir archivo</p>
                        <p className="text-xs text-slate-400 mt-1">Suelte el archivo aquí o haga click</p>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold text-slate-500 uppercase">PDF</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold text-slate-500 uppercase">PNG</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold text-slate-500 uppercase">JPG</span>
                      </div>
                    </>
                  )}

                  {/* Weight Warning */}
                  {!formData.archivo && <p className="text-[10px] text-slate-300 absolute bottom-2">Tamaño máximo: 10MB</p>}
                </div>
              </div>

              {/* Warning box if needed */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 font-medium leading-relaxed">{error}</p>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={uploading}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading || (!formData.archivo && !editingCalendario)}
                  className="flex-[2] py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {editingCalendario ? 'Actualizando...' : 'Subiendo...'}
                    </>
                  ) : (
                    <>
                      {editingCalendario ? 'Guardar Cambios' : 'Publicar Calendario'}
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