import { useState } from 'react';
import { useCarreras } from '../../../hooks/useCarreras';
import { getCarreraImageUrl, getCarreraPlanUrl } from '../../../services/carreraService';
import type { Carrera } from '../../../types/carrera';

const CarrerasAdmin = () => {
  const { carreras, loading, error, createItem, updateItem, deleteItem } = useCarreras();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCarrera, setEditingCarrera] = useState<Carrera | null>(null);
  const [selectedNivel, setSelectedNivel] = useState<'all' | 'TSU' | 'Ingenieria' | 'Licenciatura'>('all');
  
  const [formData, setFormData] = useState({
    nombre: '',
    siglas: '',
    nivel: 'TSU' as 'TSU' | 'Ingenieria' | 'Licenciatura',
    modalidad: 'Escolarizada' as 'Escolarizada' | 'Ejecutiva' | 'Mixta',
    duracion: '',
    objetivo: '',
    perfil_ingreso: '',
    perfil_egreso: '',
    campo_laboral: '',
    orden: 0,
    activo: true,
  });
  
  const [imagen, setImagen] = useState<File | null>(null);
  const [planEstudios, setPlanEstudios] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imagen && !editingCarrera) {
      alert('Debe seleccionar una imagen');
      return;
    }

    let success = false;

    if (editingCarrera) {
      const updateData: any = {
        ...formData,
        ...(imagen && { imagen }),
        ...(planEstudios && { plan_estudios: planEstudios }),
      };
      success = await updateItem(editingCarrera.id, updateData);
    } else if (imagen) {
      const createData: any = {
        ...formData,
        imagen,
        ...(planEstudios && { plan_estudios: planEstudios }),
      };
      success = await createItem(createData);
    }

    if (success) {
      resetForm();
      setIsModalOpen(false);
    }
  };

  const handleEdit = (carrera: Carrera) => {
    setEditingCarrera(carrera);
    setFormData({
      nombre: carrera.nombre,
      siglas: carrera.siglas,
      nivel: carrera.nivel,
      modalidad: carrera.modalidad,
      duracion: carrera.duracion,
      objetivo: carrera.objetivo,
      perfil_ingreso: carrera.perfil_ingreso,
      perfil_egreso: carrera.perfil_egreso,
      campo_laboral: carrera.campo_laboral,
      orden: carrera.orden,
      activo: carrera.activo,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar esta carrera?')) {
      await deleteItem(id);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      siglas: '',
      nivel: 'TSU',
      modalidad: 'Escolarizada',
      duracion: '',
      objetivo: '',
      perfil_ingreso: '',
      perfil_egreso: '',
      campo_laboral: '',
      orden: 0,
      activo: true,
    });
    setImagen(null);
    setPlanEstudios(null);
    setEditingCarrera(null);
  };

  const filteredCarreras = selectedNivel === 'all' 
    ? carreras 
    : carreras.filter(c => c.nivel === selectedNivel);

  if (loading) return <div className="p-4">Cargando...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Carreras</h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Nueva Carrera
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setSelectedNivel('all')}
          className={`px-4 py-2 rounded ${selectedNivel === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Todas ({carreras.length})
        </button>
        <button
          onClick={() => setSelectedNivel('TSU')}
          className={`px-4 py-2 rounded ${selectedNivel === 'TSU' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
        >
          TSU ({carreras.filter(c => c.nivel === 'TSU').length})
        </button>
        <button
          onClick={() => setSelectedNivel('Ingenieria')}
          className={`px-4 py-2 rounded ${selectedNivel === 'Ingenieria' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
        >
          Ingenierías ({carreras.filter(c => c.nivel === 'Ingenieria').length})
        </button>
        <button
          onClick={() => setSelectedNivel('Licenciatura')}
          className={`px-4 py-2 rounded ${selectedNivel === 'Licenciatura' ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}
        >
          Licenciaturas ({carreras.filter(c => c.nivel === 'Licenciatura').length})
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imagen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carrera</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nivel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modalidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCarreras.map((carrera) => (
              <tr key={carrera.id}>
                <td className="px-6 py-4">
                  <img 
                    src={getCarreraImageUrl(carrera.imagen)} 
                    alt={carrera.nombre}
                    className="h-16 w-24 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{carrera.nombre}</div>
                  <div className="text-sm text-gray-500">{carrera.siglas}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded ${
                    carrera.nivel === 'TSU' ? 'bg-green-100 text-green-800' :
                    carrera.nivel === 'Ingenieria' ? 'bg-purple-100 text-purple-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {carrera.nivel}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{carrera.modalidad}</td>
                <td className="px-6 py-4">
                  {carrera.plan_estudios_url ? (
                    <a 
                      href={getCarreraPlanUrl(carrera.plan_estudios_url)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Ver PDF
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm">Sin plan</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded ${carrera.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {carrera.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => handleEdit(carrera)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(carrera.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingCarrera ? 'Editar Carrera' : 'Nueva Carrera'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                {/* Nombre */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Siglas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Siglas *
                  </label>
                  <input
                    type="text"
                    value={formData.siglas}
                    onChange={(e) => setFormData({ ...formData, siglas: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Nivel */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nivel *
                  </label>
                  <select
                    value={formData.nivel}
                    onChange={(e) => setFormData({ ...formData, nivel: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TSU">TSU</option>
                    <option value="Ingenieria">Ingeniería</option>
                    <option value="Licenciatura">Licenciatura</option>
                  </select>
                </div>

                {/* Modalidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modalidad *
                  </label>
                  <select
                    value={formData.modalidad}
                    onChange={(e) => setFormData({ ...formData, modalidad: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Escolarizada">Escolarizada</option>
                    <option value="Ejecutiva">Ejecutiva</option>
                    <option value="Mixta">Mixta</option>
                  </select>
                </div>

                {/* Duración */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración *
                  </label>
                  <input
                    type="text"
                    value={formData.duracion}
                    onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                    placeholder="Ej: 2 años (6 cuatrimestres)"
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Objetivo */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objetivo *
                  </label>
                  <textarea
                    value={formData.objetivo}
                    onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>

                {/* Perfil de Ingreso */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Perfil de Ingreso *
                  </label>
                  <textarea
                    value={formData.perfil_ingreso}
                    onChange={(e) => setFormData({ ...formData, perfil_ingreso: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>

                {/* Perfil de Egreso */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Perfil de Egreso *
                  </label>
                  <textarea
                    value={formData.perfil_egreso}
                    onChange={(e) => setFormData({ ...formData, perfil_egreso: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>

                {/* Campo Laboral */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campo Laboral *
                  </label>
                  <textarea
                    value={formData.campo_laboral}
                    onChange={(e) => setFormData({ ...formData, campo_laboral: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>

                {/* Imagen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen {editingCarrera && '(dejar vacío para mantener actual)'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImagen(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required={!editingCarrera}
                  />
                </div>

                {/* Plan de Estudios */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan de Estudios (PDF) {editingCarrera && '(opcional)'}
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setPlanEstudios(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Orden */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orden
                  </label>
                  <input
                    type="number"
                    value={formData.orden}
                    onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Activo */}
                <div className="flex items-center">
                  <label className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Activo</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingCarrera ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarrerasAdmin;
