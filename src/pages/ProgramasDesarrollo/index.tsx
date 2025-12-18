import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";

const API_URL = import.meta.env.VITE_BACKENDURL || '';

interface Programa {
  id: number;
  titulo: string;
  descripcion: string;
  archivo: string;
  activo: boolean; // Orden removed
}

const ProgramasDesarrollo = () => {
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    archivo: null as File | null,
    activo: true,
  });

  useEffect(() => {
    fetchProgramas();
  }, []);

  const fetchProgramas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/programas-desarrollo?admin=true`);
      if (!response.ok) {
        // Si es 404 o error de BD vacía, simplemente dejamos array vacío
        if (response.status === 404) {
          setProgramas([]);
          setLoading(false);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProgramas(Array.isArray(data) ? data : []);
      setError(''); // Limpiar errores previos
      setLoading(false);
    } catch (err: any) {
      // Network error o BD vacía - no mostramos error, solo lista vacía
      console.warn('Error al cargar programas:', err.message);
      setProgramas([]);
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, archivo: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('titulo', formData.titulo);
    data.append('descripcion', formData.descripcion);
    data.append('activo', String(formData.activo));
    // Orden removed from submission
    if (formData.archivo) {
      data.append('archivo', formData.archivo);
    }

    try {
      let response;
      if (editingId) {
        response = await fetch(`${API_URL}/api/programas-desarrollo/${editingId}`, {
            method: 'PUT',
            body: data
        });
      } else {
        response = await fetch(`${API_URL}/api/programas-desarrollo`, {
            method: 'POST',
            body: data
        });
      }
      
      if (!response.ok) throw new Error('Action failed');
      
      Swal.fire({
        icon: 'success',
        title: editingId ? 'Actualizado' : 'Creado',
        text: `Programa ${editingId ? 'actualizado' : 'creado'} correctamente`,
        timer: 2000,
        showConfirmButton: false
      });
      
      fetchProgramas();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      Swal.fire('Error', 'No se pudo guardar el programa', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Eliminar programa?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/api/programas-desarrollo/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Delete failed');
        
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El programa ha sido eliminado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
        fetchProgramas();
      } catch (err) {
        Swal.fire('Error', 'No se pudo eliminar el programa', 'error');
      }
    }
  };

  const handleEdit = (programa: Programa) => {
    setEditingId(programa.id);
    setFormData({
      titulo: programa.titulo,
      descripcion: programa.descripcion || '',
      archivo: null,
      activo: programa.activo,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      titulo: '',
      descripcion: '',
      archivo: null,
      activo: true,
    });
  };

  if (loading) return (
      <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
  );

  return (
    <>
      <PageMeta
        title="Programas de Desarrollo | UTTECAM Dashboard"
        description="Gestión de Programas de Desarrollo"
      />
      <PageBreadcrumb pageTitle="Programas de Desarrollo" />

      <div className="mb-6 flex justify-end">
          <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-center font-medium text-white hover:bg-opacity-90 transition-colors shadow-sm hover:shadow"
        >
          <svg className="fill-current w-4 h-4 mr-2" viewBox="0 0 20 20">
            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
          </svg>
          Nuevo Programa
        </button>
      </div>

      {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-xl border border-red-100 dark:border-red-800">
              {error}
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {programas.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No hay programas de desarrollo</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-4">
              Comienza agregando tu primer programa de desarrollo usando el botón "Nuevo Programa".
            </p>
            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="text-blue-600 font-medium hover:underline"
            >
              Crear primer programa
            </button>
          </div>
        ) : programas.map((programa) => (
          <div key={programa.id} className="group relative rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
             
             {/* Header Card */}
             <div className="flex justify-between items-start mb-4">
                 <div className="flex-1 pr-4">
                     <h3 className="text-lg font-bold text-gray-800 dark:text-white line-clamp-2 leading-tight">
                        {programa.titulo}
                     </h3>
                 </div>
                 <Badge
                    size="sm"
                    color={programa.activo ? "success" : "error"}
                 >
                    {programa.activo ? "Activo" : "Inactivo"}
                 </Badge>
             </div>
             
             {/* Description */}
             <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-3 h-15">
                {programa.descripcion || "Sin descripción disponible."}
             </p>

             {/* Footer Actions */}
             <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                {programa.archivo ? (
                    <a href={`${API_URL}${programa.archivo}`} target="_blank" rel="noopener noreferrer" 
                       className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 px-3 py-1.5 rounded-lg shadow-sm">
                       <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                       Ver PDF
                    </a>
                ) : (
                    <span className="text-xs text-gray-400 italic py-2">Sin archivo</span>
                )}

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handleEdit(programa)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Editar"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button 
                        onClick={() => handleDelete(programa.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Eliminar"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto transform transition-all">
            <h2 className="mb-6 text-xl font-bold text-gray-800">
                {editingId ? 'Editar Programa' : 'Nuevo Programa'}
            </h2>
            
            <form onSubmit={handleSubmit}>
                <div className="mb-5">
                    <label className="mb-3 block text-sm font-medium text-gray-700">Título del Programa</label>
                    <input
                        type="text"
                        name="titulo"
                        value={formData.titulo}
                        onChange={handleInputChange}
                        placeholder="Ingrese el título"
                        className="w-full rounded-lg border border-gray-300 bg-white py-3 px-5 font-medium outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                    />
                </div>
                
                <div className="mb-5">
                    <label className="mb-3 block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Breve descripción del documento..."
                        className="w-full rounded-lg border border-gray-300 bg-white py-3 px-5 font-medium outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div className="mb-5">
                    <label className="flex cursor-pointer items-center justify-between p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                        <span className="text-sm font-medium text-gray-700">Visible al público (Activo)</span>
                        <div className="relative">
                            <input
                                type="checkbox"
                                name="activo"
                                checked={formData.activo}
                                onChange={handleInputChange}
                                className="sr-only peer"
                            />
                            <div className="block h-8 w-14 rounded-full bg-gray-200 peer-checked:bg-blue-600 transition-colors"></div>
                            <div className="absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition peer-checked:translate-x-full shadow-sm"></div>
                        </div>
                    </label>
                </div>

                <div className="mb-8">
                    <label className="mb-3 block text-sm font-medium text-gray-700">
                        {editingId ? 'Actualizar Archivo (Opcional)' : 'Archivo (PDF)'}
                    </label>
                    <input
                        type="file"
                        name="archivo"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white font-medium outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:px-5 file:hover:bg-gray-100 file:text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required={!editingId}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all transform active:scale-95"
                    >
                         {editingId ? 'Guardar Cambios' : 'Crear Programa'}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
export default ProgramasDesarrollo;
