import React from 'react';
import { Apartado } from '../../types/apartados';

interface ListaApartadosProps {
  apartados: Apartado[];
  onVerApartado: (apartado: Apartado) => void;
  onEliminarApartado: (id: string) => void;
  onCrearApartado: () => void;
  titulo: string;
  subtitulo: string;
  colorPrimario?: string;
}

export const ListaApartados: React.FC<ListaApartadosProps> = ({
  apartados,
  onVerApartado,
  onEliminarApartado,
  onCrearApartado,
  titulo,
  subtitulo,
  colorPrimario = '#0a9782',
}) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">
            {titulo}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base break-words">
            {subtitulo}
          </p>
        </div>
        <button
          onClick={onCrearApartado}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap text-sm sm:text-base flex-shrink-0"
          style={{ backgroundColor: colorPrimario }}
          onMouseEnter={(e) => {
            const color = parseInt(colorPrimario.substring(1), 16);
            const darkerColor = Math.max(0, color - 0x111111).toString(16).padStart(6, '0');
            e.currentTarget.style.backgroundColor = `#${darkerColor}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colorPrimario;
          }}
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear Apartado
        </button>
      </div>

      {/* Lista de Apartados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {apartados.map((apartado) => (
          <div
            key={apartado.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 hover:shadow-xl transition-all cursor-pointer border border-gray-200 dark:border-gray-700 group"
          >
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="flex-1 min-w-0 pr-2" onClick={() => onVerApartado(apartado)}>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 group-hover:text-[#0a9782] transition-colors break-words">
                  {apartado.titulo}
                </h3>
                {apartado.descripcion && (
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm line-clamp-2 break-words">
                    {apartado.descripcion}
                  </p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEliminarApartado(apartado.id);
                }}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 transition-colors flex-shrink-0"
                title="Eliminar apartado"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="truncate">{apartado.documentos.length} {apartado.documentos.length === 1 ? 'doc' : 'docs'}</span>
              </span>
              <span className="text-[10px] sm:text-xs whitespace-nowrap">
                {apartado.fechaCreacion.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {apartados.length === 0 && (
        <div className="text-center py-12 sm:py-16 px-4">
          <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg font-medium">
            No hay apartados creados
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1 sm:mt-2">
            Crea tu primer apartado para organizar tus documentos
          </p>
        </div>
      )}
    </div>
  );
};
