import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface CalendarioData {
  titulo: string;
  archivo: File;
  fechaSubida: string;
  descripcion: string;
  previewUrl: string;
}

interface FormData {
  titulo: string;
  descripcion: string;
  archivo: File | null;
}

const CalendarioAcademico: React.FC = () => {
  const [calendario, setCalendario] = useState<CalendarioData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descripcion: '',
    archivo: null,
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
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const createPreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.archivo) return;

    const newCalendario: CalendarioData = {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      archivo: formData.archivo,
      fechaSubida: new Date().toLocaleDateString('es-ES'),
      previewUrl: createPreviewUrl(formData.archivo),
    };
    setCalendario(newCalendario);
    setIsEditing(false);
    setFormData({ titulo: '', descripcion: '', archivo: null });
  };

  const handleEdit = () => {
    if (calendario) {
      setFormData({
        titulo: calendario.titulo,
        descripcion: calendario.descripcion,
        archivo: calendario.archivo,
      });
      setIsEditing(true);
    }
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar el calendario académico?')) {
      if (calendario?.previewUrl) {
        URL.revokeObjectURL(calendario.previewUrl);
      }
      setCalendario(null);
      setFormData({ titulo: '', descripcion: '', archivo: null });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ titulo: '', descripcion: '', archivo: null });
  };

  const renderPreview = (file: File, previewUrl: string) => {
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    if (isImage) {
      return (
        <img 
          src={previewUrl} 
          alt="Preview del calendario" 
          className="max-w-full max-h-96 object-contain rounded-lg"
        />
      );
    } else if (isPDF) {
      return (
        <div className="flex flex-col items-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <svg className="w-16 h-16 text-red-500 mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Archivo PDF
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {file.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="rounded-sm border border-stroke  px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="mb-6 flex justify-between items-center">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            📅 Calendario Académico UTTECAM
          </h4>
        </div>

        {/* Estado cuando no hay calendario */}
        {!calendario && !isEditing && (
          <div className="text-center py-16">
            <div className="mb-6">
              <svg className="w-20 h-20 mx-auto text-gray-400 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              No hay calendario académico
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Sube el calendario académico de la universidad para que esté disponible para estudiantes y personal académico.
            </p>
            <button 
              onClick={() => setIsEditing(true)}
              className="inline-flex  items-center justify-center rounded-lg bg-indigo-500 py-3 px-8 font-medium text-white transition-all duration-200"
            >
             
              Subir Calendario
            </button>
          </div>
        )}

        {/* Formulario para subir/editar calendario */}
        {(!calendario || isEditing) && isEditing && (
          <div className="mb-8">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 mb-6">
              <h5 className="text-lg font-semibold text-black dark:text-white mb-4">
                {isEditing && calendario ? 'Editar Calendario' : 'Nuevo Calendario Académico'}
              </h5>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Grid de campos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Columna izquierda - Información */}
                  <div className="space-y-6">
                    {/* Campo Título */}
                    <div>
                      <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                        Título del Calendario *
                      </label>
                      <input
                        type="text"
                        value={formData.titulo}
                        onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                        placeholder="Ej: Calendario Académico 2025"
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        required
                      />
                    </div>

                    {/* Campo Descripción */}
                    <div>
                      <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                        Descripción
                      </label>
                      <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                        placeholder="Descripción opcional del calendario académico..."
                        rows={4}
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Columna derecha - Archivo */}
                  <div>
                    <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                      Archivo del Calendario *
                    </label>
                    
                    {/* Dropzone */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors dark:border-strokedark dark:hover:border-primary">
                      <div
                        {...getRootProps()}
                        className={`dropzone rounded-lg p-6 cursor-pointer transition-all duration-200
                          ${isDragActive 
                            ? "border-primary bg-primary/5 dark:bg-primary/10" 
                            : "bg-gray-50/50 dark:bg-form-input/50 hover:bg-gray-100/50 dark:hover:bg-form-input/70"
                          }`}
                      >
                        <input {...getInputProps()} />
                        <div className="text-center">
                          <div className="mb-4 flex justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                              </svg>
                            </div>
                          </div>
                          <h4 className="mb-2 font-medium text-gray-800 dark:text-white text-sm">
                            {isDragActive ? "Suelta el archivo aquí" : "Arrastra tu archivo aquí"}
                          </h4>
                          <p className="mb-3 text-xs text-gray-600 dark:text-gray-400">
                            PDF, PNG, JPG, WebP (máx. 10MB)
                          </p>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary text-white">
                            Buscar Archivo
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Preview del archivo seleccionado */}
                    {formData.archivo && (
                      <div className="mt-4 p-4 bg-white dark:bg-boxdark border border-stroke dark:border-strokedark rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h6 className="font-medium text-black dark:text-white text-sm">Archivo seleccionado:</h6>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, archivo: null }))}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Eliminar archivo"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {formData.archivo.type.startsWith('image/') ? (
                              <img 
                                src={URL.createObjectURL(formData.archivo)} 
                                alt="Preview" 
                                className="w-12 h-12 object-cover rounded border"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {formData.archivo.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formData.archivo.type} • {(formData.archivo.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          {formData.archivo.type.startsWith('image/') && (
                            <button
                              type="button"
                              onClick={() => setShowPreview(true)}
                              className="text-primary hover:text-primary/80 p-1"
                              title="Ver preview"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-stroke dark:border-strokedark">
                  <button
                    type="submit"
                    disabled={!formData.titulo || !formData.archivo}
                    className="flex-1 sm:flex-initial justify-center rounded-lg bg-primary py-3 px-8 font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17,12L12,17L7,12M12,1V16" />
                    </svg>
                    {isEditing && calendario ? 'Actualizar' : 'Subir'} Calendario
                  </button>
                  
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 sm:flex-initial justify-center rounded-lg border border-stroke py-3 px-8 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white transition-all duration-200"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Vista del calendario existente */}
        {calendario && !isEditing && (
          <div className="mb-8">
            <div className="bg-white dark:bg-boxdark rounded-lg border border-stroke dark:border-strokedark p-6 shadow-sm">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="text-lg font-semibold text-black dark:text-white">
                        {calendario.titulo}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        📅 Subido el {calendario.fechaSubida}
                      </p>
                    </div>
                  </div>
                  
                  {calendario.descripcion && (
                    <p className="text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">
                      {calendario.descripcion}
                    </p>
                  )}
                </div>
                
                {/* Acciones */}
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => setShowPreview(true)}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    title="Ver preview"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={handleEdit}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white hover:bg-opacity-90 transition-colors"
                    title="Editar"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={handleDelete}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                    title="Eliminar"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Información del archivo */}
              <div className="bg-gray-50 dark:bg-form-input rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {calendario.archivo.type.startsWith('image/') ? (
                        <img 
                          src={calendario.previewUrl} 
                          alt="Thumbnail" 
                          className="w-16 h-16 object-cover rounded-lg border border-stroke dark:border-strokedark"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center border border-stroke dark:border-strokedark">
                          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h6 className="font-medium text-black dark:text-white mb-1">
                        {calendario.archivo.name}
                      </h6>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {calendario.archivo.type} • {((calendario.archivo.size || 0) / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  
                  <a
                    href={calendario.previewUrl}
                    download={calendario.archivo.name}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                    title="Descargar"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Preview */}
      {showPreview && calendario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
          <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-boxdark rounded-lg overflow-hidden">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b border-stroke dark:border-strokedark">
              <h6 className="text-lg font-semibold text-black dark:text-white">
                Preview: {calendario.titulo}
              </h6>
              <button
                onClick={() => setShowPreview(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>
            
            {/* Contenido del modal */}
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-auto">
              {renderPreview(calendario.archivo, calendario.previewUrl)}
            </div>
          </div>
        </div>
      )}
    </>
  );
};export default CalendarioAcademico;