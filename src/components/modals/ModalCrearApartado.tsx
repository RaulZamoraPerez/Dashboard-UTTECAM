import React, { useEffect } from 'react';

interface ModalCrearApartadoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (titulo: string, descripcion: string) => void;
  titulo: string;
  setTitulo: (value: string) => void;
  descripcion: string;
  setDescripcion: (value: string) => void;
}

export const ModalCrearApartado: React.FC<ModalCrearApartadoProps> = ({
  isOpen,
  onClose,
  onSubmit,
  titulo,
  setTitulo,
  descripcion,
  // setDescripcion no se usa actualmente pero está en la interfaz para consistencia
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
    onSubmit(titulo, descripcion);
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
            Crear Nuevo Apartado
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
              Título del Apartado <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#0a9782] focus:border-[#0a9782] dark:bg-gray-700 dark:text-white transition-all outline-none text-sm sm:text-base"
              placeholder="Ej: Presupuestos 2025"
              autoFocus
            />
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
              className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-[#0a9782] text-white rounded-lg sm:rounded-xl hover:bg-[#088c75] transition-all font-medium shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              Crear Apartado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
