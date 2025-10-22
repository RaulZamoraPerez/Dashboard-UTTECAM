import React from 'react';
import { Apartado, Documento } from '../../types/apartados';

interface VistaApartadoProps {
  apartado: Apartado;
  onVolver: () => void;
  onSubirDocumento: () => void;
  onEliminarDocumento: (id: string) => void;
  onEditarDocumento?: (documento: Documento) => void;
  onDescargarDocumento?: (documento: Documento) => void;
  colorPrimario?: string;
}

export const VistaApartado: React.FC<VistaApartadoProps> = ({
  apartado,
  onVolver,
  onSubirDocumento,
  onEliminarDocumento,
  onEditarDocumento,
  onDescargarDocumento,
  colorPrimario = '#d1672a',
}) => {
  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <button
          onClick={onVolver}
          className="flex items-center gap-2 text-[#0a9782] hover:text-[#088c75] mb-3 sm:mb-4 transition-colors font-medium text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a apartados
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">
              {apartado.titulo}
            </h1>
            {apartado.descripcion && (
              <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base break-words">
                {apartado.descripcion}
              </p>
            )}
          </div>
          <button
            onClick={onSubirDocumento}
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Subir Documento
          </button>
        </div>
      </div>

      {/* Lista de Documentos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {apartado.documentos.length > 0 ? (
          <>
            {/* Vista de tabla para pantallas grandes */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nombre del Documento
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Archivo
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {apartado.documentos.map((documento) => (
                    <tr key={documento.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center">
                          <svg 
                            className="w-5 h-5 mr-3 flex-shrink-0" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            style={{ color: colorPrimario }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {documento.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                        {documento.archivo}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {documento.fechaSubida.toLocaleDateString('es-MX')}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          {onDescargarDocumento && (
                            <button 
                              onClick={() => onDescargarDocumento(documento)}
                              className="text-[#0a9782] hover:text-[#088c75] transition-colors p-1"
                              title="Descargar"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                          )}
                          {onEditarDocumento && (
                            <button 
                              onClick={() => onEditarDocumento(documento)}
                              className="hover:text-[#088c75] transition-colors p-1"
                              style={{ color: colorPrimario }}
                              title="Editar"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => onEliminarDocumento(documento.id)}
                            className="text-red-600 hover:text-red-800 dark:hover:text-red-400 transition-colors p-1"
                            title="Eliminar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista de tarjetas para móviles */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {apartado.documentos.map((documento) => (
                <div key={documento.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start gap-3">
                    <svg 
                      className="w-8 h-8 mt-1 flex-shrink-0" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      style={{ color: colorPrimario }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 break-words">
                        {documento.nombre}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
                        {documento.archivo}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {documento.fechaSubida.toLocaleDateString('es-MX')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                    {onDescargarDocumento && (
                      <button 
                        onClick={() => onDescargarDocumento(documento)}
                        className="flex-1 px-3 py-2 bg-[#0a9782] text-white rounded-lg hover:bg-[#088c75] transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Descargar
                      </button>
                    )}
                    {onEditarDocumento && (
                      <button 
                        onClick={() => onEditarDocumento(documento)}
                        className="flex-1 px-3 py-2 border-2 text-white rounded-lg hover:opacity-80 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                        style={{ 
                          backgroundColor: colorPrimario,
                          borderColor: colorPrimario
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                    )}
                    <button
                      onClick={() => onEliminarDocumento(documento.id)}
                      className="px-3 py-2 border-2 border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <svg className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
              No hay documentos en este apartado
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Sube tu primer documento para comenzar
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
