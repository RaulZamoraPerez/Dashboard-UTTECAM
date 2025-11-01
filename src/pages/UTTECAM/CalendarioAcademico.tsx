import React, { useState } from 'react';
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
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    archivo: null,
  });

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      // Generar título automáticamente basado en el nombre del archivo (sin extensión)
      const tituloGenerado = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      
      setFormData(prev => ({
        ...prev,
        archivo: file,
        titulo: tituloGenerado,
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
    if (!editingCalendario && !formData.archivo) return;
    if (!formData.titulo.trim()) return;

    setUploading(true);
    try {
      let data: any = {
        titulo: formData.titulo.trim(),
      };

      // Solo incluir archivo si hay uno nuevo (para creación o edición con nuevo archivo)
      if (formData.archivo) {
        data.archivo = formData.archivo;
      }

      let success = false;
      if (editingCalendario) {
        success = await updateItem(editingCalendario.id, data);
      } else {
        success = await createItem(data as CreateCalendarioRequest);
      }

      if (success) {
        handleCloseModal();
      }
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (calendario: Calendario) => {
    setEditingCalendario(calendario);
    setFormData({
      titulo: calendario.titulo,
      archivo: null, // No pre-cargar archivo existente
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este calendario?')) {
      await deleteItem(id);
    }
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

  const renderFilePreview = (calendario: Calendario) => {
    const fileUrl = getFileUrl(calendario.archivo);
    const isPDF = calendario.archivo.toLowerCase().endsWith('.pdf');
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(calendario.archivo);

    if (isImage) {
      return (
        <img
          src={fileUrl}
          alt={calendario.titulo}
          className="w-16 h-16 object-cover rounded border"
        />
      );
    } else if (isPDF) {
      return (
        <div className="w-16 h-16 bg-red-100 rounded border flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
        <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Calendario Académico</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestiona los calendarios académicos de la institución.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Agregar Calendario
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Archivo
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Título
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Fecha de Subida
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {calendarios.map((calendario) => (
                    <tr key={calendario.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        {renderFilePreview(calendario)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {calendario.titulo}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(calendario.fechaSubida).toLocaleDateString('es-ES')}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handlePreview(calendario)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => handleEdit(calendario)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(calendario.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {calendarios.length === 0 && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay calendarios</h3>
                  <p className="mt-1 text-sm text-gray-500">Comienza agregando un nuevo calendario académico.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:flex sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>
            <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle relative z-10">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    {editingCalendario ? 'Editar Calendario' : 'Subir Nuevo Calendario'}
                  </h3>
                  <div className="mt-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Archivo *
                        </label>
                        <div
                          {...getRootProps()}
                          className={`mt-1 flex justify-center rounded-md border-2 border-dashed px-6 pt-5 pb-6 transition-colors ${
                            uploading 
                              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50' 
                              : isDragActive 
                                ? 'border-blue-400 bg-blue-50 cursor-pointer' 
                                : 'border-gray-300 hover:border-gray-400 cursor-pointer'
                          }`}
                        >
                          <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="text-sm text-gray-600">
                              <p className="font-medium">
                                {uploading 
                                  ? 'Subiendo archivo...' 
                                  : isDragActive 
                                    ? 'Suelta el archivo aquí' 
                                    : 'Arrastra y suelta un archivo aquí, o haz clic para seleccionar'
                                }
                              </p>
                            </div>
                            <p className="text-xs text-gray-500">PDF, PNG, JPG, WEBP hasta 10MB</p>
                            <input {...getInputProps()} />
                          </div>
                        </div>
                        {formData.archivo && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-700">
                              <strong>Archivo seleccionado:</strong> {formData.archivo.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Título generado:</strong> {formData.titulo}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={handleCloseModal}
                          disabled={uploading}
                          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={uploading || (!formData.archivo && !editingCalendario)}
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {uploading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Subiendo...
                            </>
                          ) : (
                            editingCalendario ? 'Actualizar' : 'Subir Calendario'
                          )}
                        </button>
                      </div>
                    </form>
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

export default CalendarioAcademico;