import React, { useEffect } from 'react';

interface ModalSubirDocumentoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (nombre: string, archivo: File | null) => void;
  nombre: string;
  setNombre: (value: string) => void;
  archivo: File | null;
  setArchivo: (value: File | null) => void;
  isEditing?: boolean;
  documentoId?: string;
}

export const ModalSubirDocumento: React.FC<ModalSubirDocumentoProps> = ({
  isOpen,
  onClose,
  onSubmit,
  nombre,
  setNombre,
  archivo,
  setArchivo,
  isEditing = false,
  documentoId: _documentoId,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(nombre, archivo);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-[95%] sm:max-w-md mx-auto max-h-[90vh] overflow-y-auto animate-fadeIn">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Actualizar Documento' : 'Subir Documento'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full flex-shrink-0"
            aria-label="Cerrar modal"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Nombre del Documento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#d1672a] focus:border-[#d1672a] dark:bg-gray-700 dark:text-white transition-all outline-none text-sm sm:text-base"
              placeholder="Ej: Reporte Mensual Enero 2025"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Seleccionar Archivo {!isEditing && <span className="text-red-500">*</span>}
              {isEditing && <span className="text-gray-400 text-xs ml-1">(Opcional)</span>}
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl p-4 sm:p-8 text-center hover:border-[#d1672a] dark:hover:border-[#d1672a] transition-all bg-gray-50 dark:bg-gray-700/50">
              <input
                type="file"
                onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                <div className="flex flex-col items-center">
                  <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-[#d1672a]/10 rounded-full">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#d1672a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {archivo ? (
                      <span className="text-[#d1672a] font-semibold flex items-center justify-center gap-2">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="truncate max-w-[200px]">{archivo.name}</span>
                      </span>
                    ) : (
                      <span className="block">
                        <span className="text-[#d1672a] font-semibold">Clic para seleccionar</span>
                        <span className="text-gray-500 hidden sm:inline"> o arrastra un archivo</span>
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1 sm:mt-2">
                    PDF, DOC, XLS, TXT, ZIP (Max. 10MB)
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
            <button
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-sm sm:text-base"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-[#d1672a] text-white rounded-lg sm:rounded-xl hover:bg-[#b85822] transition-all font-medium shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              {isEditing ? 'Actualizar' : 'Subir Documento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
