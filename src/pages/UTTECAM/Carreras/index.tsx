import { useState } from 'react';
import { confirmDialog, toastSuccess, toastError } from '../../../utils/alert';
import { useCarreras } from '../../../hooks/useCarreras';
import { getCarreraImageUrl } from '../../../services/carreraService';
import type { Carrera } from '../../../types/carrera';
import ModalCarrera from './ModalCarrera';

const CarrerasAdmin = () => {
  const { carreras, loading, error, createItem, updateItem, deleteItem } = useCarreras();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCarrera, setEditingCarrera] = useState<Carrera | null>(null);
  const [selectedNivel, setSelectedNivel] = useState<'all' | 'Ingenieria' | 'Licenciatura'>('all');

  const handleSave = async (data: any) => {
    let result: any = null;
    if (editingCarrera) {
      result = await updateItem(editingCarrera.id, data);
    } else {
      result = await createItem(data);
    }
    const success = !!result;
    if (success) {
      setIsModalOpen(false);
      setEditingCarrera(null);
    }
    return success;
  };

  const handleEdit = (carrera: Carrera) => {
    setEditingCarrera(carrera);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDialog({ title: 'Eliminar carrera', text: '¿Está seguro de eliminar esta carrera?' });
    if (confirmed) {
      const ok = await deleteItem(id);
      if (ok) toastSuccess('Carrera eliminada correctamente');
      else toastError('Error al eliminar la carrera');
    }
  };

  const handleToggleActive = async (carrera: Carrera) => {
    const newStatus = !carrera.activo;
    const confirmed = await confirmDialog({
      title: `${newStatus ? 'Activar' : 'Desactivar'} carrera`,
      text: `¿Desea ${newStatus ? 'activar' : 'desactivar'} la carrera ${carrera.nombre}?`,
      confirmText: newStatus ? 'Activar' : 'Desactivar'
    });
    if (confirmed) {
      const ok = await updateItem(carrera.id, { activo: newStatus });
      if (ok) toastSuccess(`Carrera ${newStatus ? 'activada' : 'desactivada'} correctamente`); else toastError('Error al actualizar estado');
    }
  };

  const handleCreate = () => {
    setEditingCarrera(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCarrera(null);
  };

  const filteredCarreras = selectedNivel === 'all' 
    ? carreras 
    : carreras.filter(c => c.nivel === selectedNivel);

  if (loading) return <div className="p-4 dark:text-white">Cargando...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 font-sans dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight dark:text-white">Gestión de Carreras</h1>
            <p className="text-gray-500 mt-1 dark:text-gray-400">Administra la oferta académica de la institución</p>
          </div>
          <button
            onClick={handleCreate}
            className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            <span className="mr-2 text-xl leading-none">+</span> Nueva Carrera
          </button>
        </div>

        {/* Filtros Estilo "Pill/Tabs" */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="inline-flex p-1 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
            {[
              { id: 'all', label: 'Todas', count: carreras.length },
              { id: 'Ingenieria', label: 'Ingenierías', count: carreras.filter(c => c.nivel === 'Ingenieria').length, color: 'text-purple-600 dark:text-purple-400' },
              { id: 'Licenciatura', label: 'Licenciaturas', count: carreras.filter(c => c.nivel === 'Licenciatura').length, color: 'text-orange-600 dark:text-orange-400' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedNivel(tab.id as any)}
                className={`
                  flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
                  ${selectedNivel === tab.id 
                    ? 'bg-gray-100 text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                <span className={selectedNivel === tab.id && tab.color ? tab.color : ''}>{tab.label}</span>
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${selectedNivel === tab.id ? 'bg-white shadow-sm dark:bg-gray-600' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCarreras.map((carrera) => (
            <div 
              key={carrera.id} 
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden h-full dark:bg-gray-800 dark:border-gray-700"
            >
              {/* Imagen Header */}
              <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={getCarreraImageUrl(carrera.imagen_portada || carrera.imagen)}
                  alt={carrera.nombre}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';
                  }}
                />
                <div className="absolute top-3 right-3">
                  <span className={`
                    px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm backdrop-blur-md
                    ${carrera.activo 
                      ? 'bg-green-100/90 text-green-700 border border-green-200 dark:bg-green-900/80 dark:text-green-300 dark:border-green-800' 
                      : 'bg-red-100/90 text-red-700 border border-red-200 dark:bg-red-900/80 dark:text-red-300 dark:border-red-800'}
                  `}>
                    {carrera.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className={`
                    px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded border
                    ${carrera.nivel === 'Ingenieria' ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800' :
                      'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800'
                    }
                  `}>
                    {carrera.nivel}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 line-clamp-2 dark:text-white" title={carrera.nombre}>
                  {carrera.nombre}
                </h3>
                <p className="text-sm text-gray-500 font-medium mb-4 dark:text-gray-400">{carrera.siglas}</p>

                <div className="space-y-2 mt-auto text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span className="truncate">{carrera.duracion}</span>
                  </div>
                </div>

                {/* Footer Botones */}
                <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => handleToggleActive(carrera)}
                    aria-pressed={carrera.activo}
                    aria-label={carrera.activo ? 'Desactivar carrera' : 'Activar carrera'}
                    className={`flex items-center justify-center p-2 text-xs font-medium border rounded-lg transition-colors ${
                      carrera.activo 
                        ? 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800 dark:hover:bg-orange-900/30' 
                        : 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800 dark:hover:bg-green-900/30'
                    }`}
                    title={carrera.activo ? 'Desactivar' : 'Activar'}
                  >
                    {carrera.activo ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    )}
                    <span className="sr-only">{carrera.activo ? 'Desactivar' : 'Activar'}</span>
                  </button>
                  <button
                    onClick={() => handleEdit(carrera)}
                    title="Editar"
                    aria-label="Editar carrera"
                    className="flex items-center justify-center p-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    <span className="sr-only">Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(carrera.id)}
                    title="Eliminar"
                    aria-label="Eliminar carrera"
                    className="flex items-center justify-center p-2 text-xs font-medium text-red-600 bg-red-50 border border-transparent rounded-lg hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    <span className="sr-only">Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <ModalCarrera
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          carrera={editingCarrera}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default CarrerasAdmin;