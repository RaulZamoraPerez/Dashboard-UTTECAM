import React, { useState } from 'react';
import { confirmDialog, toastSuccess } from '../../utils/alert';
import { useDropzone } from 'react-dropzone';

interface ProcesoAdmision {
  id: string;
  titulo: string;
  descripcion: string;
  archivo: File;
  fechaInicio: string;
  fechaFin: string;
  año: string;
  fechaCreacion: string;
  previewUrl: string;
  activo: boolean;
}

interface FormData {
  titulo: string;
  descripcion: string;
  archivo: File | null;
  fechaInicio: string;
  fechaFin: string;
  año: string;
  activo: boolean;
}

const ProcesoAdmision: React.FC = () => {
  const [procesos, setProcesos] = useState<ProcesoAdmision[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewItem, setPreviewItem] = useState<ProcesoAdmision | null>(null);
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descripcion: '',
    archivo: null,
    fechaInicio: '',
    fechaFin: '',
    año: new Date().getFullYear().toString(),
    activo: true,
  });

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFormData(prev => ({
        ...prev,
        archivo: file,
      }));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      archivo: null,
      fechaInicio: '',
      fechaFin: '',
      año: new Date().getFullYear().toString(),
      activo: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.archivo) return;

    const newProceso: ProcesoAdmision = {
      id: editingId || Date.now().toString(),
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      archivo: formData.archivo,
      fechaInicio: formData.fechaInicio,
      fechaFin: formData.fechaFin,
      año: formData.año,
      fechaCreacion: new Date().toLocaleDateString('es-ES'),
      previewUrl: URL.createObjectURL(formData.archivo),
      activo: formData.activo,
    };

    if (editingId) {
      setProcesos(prev => prev.map(p => p.id === editingId ? newProceso : p));
    } else {
      setProcesos(prev => [...prev, newProceso]);
    }

    setIsEditing(false);
    setEditingId(null);
    resetForm();
  };

  const handleEdit = (proceso: ProcesoAdmision) => {
    setFormData({
      titulo: proceso.titulo,
      descripcion: proceso.descripcion,
      archivo: proceso.archivo,
      fechaInicio: proceso.fechaInicio,
      fechaFin: proceso.fechaFin,
      año: proceso.año,
      activo: proceso.activo,
    });
    setEditingId(proceso.id);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDialog({ title: 'Eliminar proceso de admisión', text: '¿Estás seguro de que deseas eliminar este proceso de admisión?' });
    if (!confirmed) return;
    const proceso = procesos.find(p => p.id === id);
    if (proceso?.previewUrl) {
      URL.revokeObjectURL(proceso.previewUrl);
    }
    setProcesos(prev => prev.filter(p => p.id !== id));
    toastSuccess('Proceso de admisión eliminado');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    resetForm();
  };

  const toggleActivo = (id: string) => {
    setProcesos(prev => prev.map(p => 
      p.id === id ? { ...p, activo: !p.activo } : p
    ));
  };

  const openPreview = (proceso: ProcesoAdmision) => {
    setPreviewItem(proceso);
    setShowPreview(true);
  };

  return (
    <div className="bg-white dark:bg-black min-h-screen">
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-gray-600 dark:bg-black sm:px-7.5 xl:pb-1">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h4 className="text-xl font-semibold text-black dark:text-white">
              🎓 Servicios Escolares - Proceso de Admisión
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Gestiona las indicaciones y documentos del proceso de admisión
            </p>
          </div>
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 py-3 px-6 font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200 border border-primary dark:border-primary dark:bg-primary dark:hover:bg-primary/90"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
              Nuevo Proceso
            </button>
          )}
        </div>

        {/* Formulario */}
        {isEditing && (
          <div className="mb-8">
            <div className="bg-gray-50 dark:bg-black rounded-lg p-6 border border-stroke dark:border-gray-600">
              <h5 className="text-lg font-semibold text-black dark:text-white mb-6">
                {editingId ? 'Editar Proceso de Admisión' : 'Nuevo Proceso de Admisión'}
              </h5>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Grid principal */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Columna izquierda - Información básica */}
                  <div className="space-y-6">
                    {/* Título */}
                    <div>
                      <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                        Título del Proceso *
                      </label>
                      <input
                        type="text"
                        value={formData.titulo}
                        onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                        placeholder="Ej: Proceso de Admisión 2025"
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-white py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-gray-600 dark:bg-black dark:text-white dark:focus:border-primary placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        required
                      />
                    </div>

                    {/* Año */}
                    <div>
                      <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                        Año *
                      </label>
                      <input
                        type="number"
                        value={formData.año}
                        onChange={(e) => setFormData(prev => ({ ...prev, año: e.target.value }))}
                        min="2020"
                        max="2030"
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-white py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-gray-600 dark:bg-black dark:text-white dark:focus:border-primary"
                        required
                      />
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                          Fecha de Inicio *
                        </label>
                        <input
                          type="date"
                          value={formData.fechaInicio}
                          onChange={(e) => setFormData(prev => ({ ...prev, fechaInicio: e.target.value }))}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-white py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-gray-600 dark:bg-black dark:text-white dark:focus:border-primary [color-scheme:light] dark:[color-scheme:dark]"
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                          Fecha de Fin *
                        </label>
                        <input
                          type="date"
                          value={formData.fechaFin}
                          onChange={(e) => setFormData(prev => ({ ...prev, fechaFin: e.target.value }))}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-white py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-gray-600 dark:bg-black dark:text-white dark:focus:border-primary [color-scheme:light] dark:[color-scheme:dark]"
                          required
                        />
                      </div>
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="mb-2.5 block text-sm font-medium text-black dark:text-gray-100">
                        Descripción e Indicaciones
                      </label>
                      <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                        placeholder="Describe las indicaciones y requisitos del proceso de admisión..."
                        rows={5}
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-white py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-gray-600 dark:bg-black dark:text-white dark:focus:border-primary placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>

                    {/* Estado */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="activo"
                        checked={formData.activo}
                        onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                        className="h-5 w-5 rounded border border-stroke bg-white text-primary focus:ring-primary dark:border-gray-600 dark:bg-black"
                      />
                      <label htmlFor="activo" className="text-sm font-medium text-black dark:text-white">
                        Proceso activo (visible para estudiantes)
                      </label>
                    </div>
                  </div>

                  {/* Columna derecha - Imagen/Archivo */}
                  <div>
                    <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                      Imagen de Indicaciones *
                    </label>
                    
                    {/* Dropzone */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors dark:border-strokedark dark:hover:border-primary">
                      <div
                        {...getRootProps()}
                        className={`dropzone rounded-lg p-6 cursor-pointer transition-all duration-200
                          ${isDragActive 
                            ? "border-primary bg-primary/5 dark:bg-primary/10" 
                            : "bg-gray-50/50 dark:bg-black/50 hover:bg-gray-100/50 dark:hover:bg-gray-900/50"
                          }`}
                      >
                        <input {...getInputProps()} />
                        <div className="text-center">
                          <div className="mb-4 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19M19,19H5V5H19M13.96,12.29L11.21,15.83L9.25,13.47L6.5,17H17.5L13.96,12.29Z" />
                              </svg>
                            </div>
                          </div>
                          <h4 className="mb-2 font-medium text-gray-800 dark:text-gray-200">
                            {isDragActive ? "Suelta la imagen aquí" : "Arrastra tu imagen aquí"}
                          </h4>
                          <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                            PNG, JPG, WebP, GIF (máx. 5MB)
                          </p>
                          <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors">
                            Buscar Imagen
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Preview del archivo seleccionado */}
                    {formData.archivo && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-black border border-stroke dark:border-gray-600 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h6 className="font-medium text-black dark:text-white text-sm">Imagen seleccionada:</h6>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, archivo: null }))}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                            title="Eliminar imagen"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {/* Imagen preview */}
                          <img 
                            src={URL.createObjectURL(formData.archivo)} 
                            alt="Preview" 
                            className="w-full h-48 object-cover rounded-lg border border-stroke dark:border-strokedark bg-gray-100 dark:bg-gray-900"
                          />
                          
                          {/* Info del archivo */}
                          <div className="flex items-center justify-between text-sm bg-white dark:bg-black p-3 rounded border border-stroke dark:border-gray-600">
                            <span className="text-gray-700 dark:text-gray-300 truncate">
                              {formData.archivo.name}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 ml-2">
                              {(formData.archivo.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-stroke dark:border-strokedark">
                  <button
                    type="submit"
                    disabled={!formData.titulo || !formData.archivo || !formData.fechaInicio || !formData.fechaFin}
                    className="flex-1 sm:flex-initial justify-center rounded-lg bg-primary hover:bg-primary/90 py-3 px-8 font-medium text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transition-all duration-200 border border-primary dark:border-primary"
                  >
                    <svg className="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17,12L12,17L7,12M12,1V16" />
                    </svg>
                    {editingId ? 'Actualizar' : 'Crear'} Proceso
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 sm:flex-initial justify-center rounded-lg border-2 border-stroke dark:border-gray-600 bg-white dark:bg-black py-3 px-8 font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 hover:shadow-lg transition-all duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de procesos */}
        {procesos.length > 0 && (
          <div className="mb-8">
            <h5 className="text-lg font-semibold text-black dark:text-white mb-4">
              Procesos de Admisión Registrados ({procesos.length})
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {procesos.map((proceso) => (
                <div key={proceso.id} className="bg-white dark:bg-black rounded-lg border border-stroke dark:border-gray-600 overflow-hidden shadow-sm hover:shadow-lg dark:hover:shadow-xl transition-all duration-200">
                  {/* Imagen */}
                  <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
                    <img 
                      src={proceso.previewUrl} 
                      alt={proceso.titulo}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Badge de estado */}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shadow-sm ${
                        proceso.activo 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-700'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                      }`}>
                        {proceso.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    
                    {/* Overlay con botón preview */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                      <button
                        onClick={() => openPreview(proceso)}
                        className="bg-white dark:bg-black text-black dark:text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg border border-stroke dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                      >
                        Ver Completo
                      </button>
                    </div>
                  </div>
                  
                  {/* Contenido */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h6 className="font-semibold text-black dark:text-white text-sm line-clamp-2">
                        {proceso.titulo}
                      </h6>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                        {proceso.año}
                      </span>
                    </div>
                    
                    {proceso.descripcion && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {proceso.descripcion}
                      </p>
                    )}
                    
                    {/* Fechas */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 space-y-1">
                      <div className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" />
                        </svg>
                        {new Date(proceso.fechaInicio).toLocaleDateString('es-ES')} - {new Date(proceso.fechaFin).toLocaleDateString('es-ES')}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z" />
                        </svg>
                        Creado: {proceso.fechaCreacion}
                      </div>
                    </div>
                    
                    {/* Acciones */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleActivo(proceso.id)}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200 border ${
                          proceso.activo 
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700 hover:shadow-sm'
                            : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-700 hover:shadow-sm'
                        }`}
                      >
                        {proceso.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(proceso)}
                          className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md border border-primary"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => handleDelete(proceso.id)}
                          className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm hover:shadow-md border border-red-500"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {procesos.length === 0 && !isEditing && (
          <div className="text-center py-16">
            <div className="mb-6">
              <svg className="w-20 h-20 mx-auto text-gray-400 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              No hay procesos de admisión
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Crea el primer proceso de admisión con las indicaciones e información necesaria para los estudiantes.
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 py-4 px-8 font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200 border border-primary dark:border-primary"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
              Crear Primer Proceso
            </button>
          </div>
        )}
      </div>

      {/* Modal de Preview */}
      {showPreview && previewItem && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm">
          <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-black rounded-lg overflow-hidden shadow-2xl border border-stroke dark:border-gray-600">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-800/50">
              <div>
                <h6 className="text-lg font-semibold text-black dark:text-white">
                  {previewItem.titulo}
                </h6>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {previewItem.año} • {new Date(previewItem.fechaInicio).toLocaleDateString('es-ES')} - {new Date(previewItem.fechaFin).toLocaleDateString('es-ES')}
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-stroke dark:border-strokedark"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>
            
            {/* Contenido del modal */}
            <div className="p-6 max-h-[calc(90vh-140px)] overflow-auto">
              <div className="space-y-6">
                {/* Imagen completa */}
                <img 
                  src={previewItem.previewUrl} 
                  alt={previewItem.titulo}
                  className="w-full max-h-96 object-contain rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-gray-900"
                />
                
                {/* Descripción */}
                {previewItem.descripcion && (
                  <div>
                    <h6 className="font-semibold text-black dark:text-white mb-2">Descripción e Indicaciones:</h6>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-stroke dark:border-strokedark">
                      {previewItem.descripcion}
                    </p>
                  </div>
                )}
                
                {/* Información adicional */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-stroke dark:border-strokedark">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Estado:</span>
                    <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      previewItem.activo 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-700'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                    }`}>
                      {previewItem.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Creado:</span>
                    <span className="ml-2 text-sm text-black dark:text-white">{previewItem.fechaCreacion}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcesoAdmision;