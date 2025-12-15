import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface Beca {
  id: string;
  titulo: string;
  descripcion: string;
  archivo?: string;
  fechaCreacion?: string;
  activa?: boolean;
  categoria?: 'requisitos' | 'convocatoria' | 'programa' | 'recurso';
}

interface Seccion {
  id: string;
  titulo: string;
  descripcion?: string;
  items: Beca[];
}

const BecasApoyo = () => {
  const [becas, setBecas] = useState<Beca[]>([
    // Requisitos
    {
      id: 'req-1',
      titulo: 'Requisitos para obtener una beca',
      descripcion: 'Documentación y criterios necesarios para solicitar cualquier tipo de beca en UTTECAM',
      archivo: 'becas/requisitos.pdf',
      fechaCreacion: '2024-12-01',
      activa: true,
      categoria: 'requisitos'
    },
    // Convocatorias
    {
      id: 'conv-1',
      titulo: 'Beca de Exención de Pago - Sep-Dic 2025',
      descripcion: 'Convocatoria oficial para becas de exención de pago para el cuatrimestre Sep-Dic 2025',
      archivo: 'becas/convocatoria-exencion-2025.pdf',
      fechaCreacion: '2025-09-01',
      activa: true,
      categoria: 'convocatoria'
    },
    // Programas especiales
    {
      id: 'prog-1',
      titulo: 'Programa S283 - Jóvenes Escribiendo el Futuro',
      descripcion: 'Programa de apoyo económico directo del Gobierno de México para estudiantes de educación superior',
      archivo: 'becas/s283-guia-completa.pdf',
      fechaCreacion: '2025-09-15',
      activa: true,
      categoria: 'programa'
    },
    {
      id: 'prog-2',
      titulo: 'Becas de Excelencia Académica',
      descripcion: 'Becas para estudiantes con promedio mayor a 8.5',
      archivo: 'becas/excelencia.pdf',
      fechaCreacion: '2025-01-10',
      activa: true,
      categoria: 'programa'
    },
    {
      id: 'prog-3',
      titulo: 'Programa de Apoyo Socioeconómico',
      descripcion: 'Apoyo para estudiantes de bajos recursos',
      archivo: 'becas/apoyo-socioeconomico.pdf',
      fechaCreacion: '2025-01-15',
      activa: true,
      categoria: 'programa'
    },
    // Recursos
    {
      id: 'rec-1',
      titulo: 'Guía Paso a Paso para Registro - S283',
      descripcion: 'Instrucciones detalladas con capturas de pantalla para realizar el registro en el programa',
      archivo: 'becas/guia-paso-a-paso-s283.pdf',
      fechaCreacion: '2025-09-10',
      activa: true,
      categoria: 'recurso'
    },
    {
      id: 'rec-2',
      titulo: 'Comunicado Oficial 2025-2 - Estudiantes S283',
      descripcion: 'Información oficial del programa con fechas, requisitos actualizados y procedimientos',
      archivo: 'becas/comunicado-oficial-2025-2.pdf',
      fechaCreacion: '2025-09-01',
      activa: true,
      categoria: 'recurso'
    }
  ]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [becaEditando, setBecaEditando] = useState<string | null>(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [nuevaBeca, setNuevaBeca] = useState<{
    titulo: string;
    descripcion: string;
    archivo: string;
    activa: boolean;
    categoria: 'requisitos' | 'convocatoria' | 'programa' | 'recurso';
  }>({
    titulo: '',
    descripcion: '',
    archivo: '',
    activa: true,
    categoria: 'programa'
  });

  // Agrupar becas por categoría
  const secciones: Seccion[] = [
    {
      id: 'requisitos',
      titulo: '📋 Requisitos para Obtener una Beca',
      descripcion: 'Documentación y criterios necesarios para solicitar becas',
      items: becas.filter(b => b.categoria === 'requisitos')
    },
    {
      id: 'convocatoria',
      titulo: '📢 Convocatorias Activas - Cuatrimestre Sep-Dic 2025',
      descripcion: 'Convocatorias oficiales abiertas para el periodo actual',
      items: becas.filter(b => b.categoria === 'convocatoria')
    },
    {
      id: 'programa',
      titulo: '🎓 Programas de Becas y Apoyo',
      descripcion: 'Programas disponibles para nuestros estudiantes',
      items: becas.filter(b => b.categoria === 'programa')
    },
    {
      id: 'recurso',
      titulo: '📚 Recursos y Documentos Complementarios',
      descripcion: 'Guías, manuales y documentos informativos',
      items: becas.filter(b => b.categoria === 'recurso')
    }
  ];

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10485760, // 10MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setArchivoSeleccionado(acceptedFiles[0]);
        setNuevaBeca(prev => ({
          ...prev,
          archivo: acceptedFiles[0].name
        }));
      }
    }
  });

  const handleAgregarBeca = () => {
    if (nuevaBeca.titulo.trim() && nuevaBeca.descripcion.trim() && (archivoSeleccionado || modoEdicion)) {
      if (modoEdicion && becaEditando) {
        // Modo edición
        setBecas(becas.map(b => 
          b.id === becaEditando 
            ? {
                ...b,
                titulo: nuevaBeca.titulo,
                descripcion: nuevaBeca.descripcion,
                activa: nuevaBeca.activa,
                categoria: nuevaBeca.categoria as 'requisitos' | 'convocatoria' | 'programa' | 'recurso'
              }
            : b
        ));
        setModoEdicion(false);
        setBecaEditando(null);
      } else {
        // Modo crear nuevo
        const becaNueva: Beca = {
          id: `beca-${Date.now()}`,
          titulo: nuevaBeca.titulo,
          descripcion: nuevaBeca.descripcion,
          archivo: nuevaBeca.archivo,
          fechaCreacion: new Date().toISOString().split('T')[0],
          activa: nuevaBeca.activa,
          categoria: nuevaBeca.categoria as 'requisitos' | 'convocatoria' | 'programa' | 'recurso'
        };
        setBecas([...becas, becaNueva]);
      }
      setNuevaBeca({ titulo: '', descripcion: '', archivo: '', activa: true, categoria: 'programa' });
      setArchivoSeleccionado(null);
      setMostrarFormulario(false);
    }
  };

  const handleIniciarEdicionBeca = (beca: Beca) => {
    setNuevaBeca({
      titulo: beca.titulo,
      descripcion: beca.descripcion,
      archivo: beca.archivo || '',
      activa: beca.activa || true,
      categoria: beca.categoria || 'programa'
    });
    setBecaEditando(beca.id);
    setModoEdicion(true);
    setMostrarFormulario(true);
    setArchivoSeleccionado(null);
  };

  const handleCancelarEdicionBeca = () => {
    setModoEdicion(false);
    setBecaEditando(null);
    setNuevaBeca({ titulo: '', descripcion: '', archivo: '', activa: true, categoria: 'programa' });
    setArchivoSeleccionado(null);
    setMostrarFormulario(false);
  };

  const handleEliminarBeca = (id: string) => {
    setBecas(becas.filter(b => b.id !== id));
  };

  return (
    <div className="bg-white dark:bg-black min-h-screen">
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-gray-600 dark:bg-black sm:px-7.5 xl:pb-1">
        
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h4 className="text-xl font-semibold text-black dark:text-white">
              🎓 Servicios Escolares - Becas y Apoyo
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gestiona programas de becas, requisitos y recursos para estudiantes - Cuatrimestre Sep-Dic 2025
            </p>
          </div>
          <button
            onClick={() => {
              setMostrarFormulario(true);
              setModoEdicion(false);
              setNuevaBeca({ titulo: '', descripcion: '', archivo: '', activa: true, categoria: 'programa' });
              setArchivoSeleccionado(null);
            }}
            className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 py-3 px-6 font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200 border border-primary dark:border-primary dark:bg-primary dark:hover:bg-primary/90"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Agregar Recurso
          </button>
        </div>

        {/* Formulario de Nueva Beca */}
        {mostrarFormulario && (
          <div className="mb-8 rounded-lg border border-stroke bg-gray-50 dark:bg-black dark:border-gray-600 p-6">
            <h5 className="text-lg font-semibold text-black dark:text-white mb-6">
              {modoEdicion ? 'Editar Beca/Recurso' : 'Crear Nueva Beca/Recurso'}
            </h5>
            <div className="space-y-6">
              {/* Categoría */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                  Categoría *
                </label>
                <select
                  value={nuevaBeca.categoria}
                  onChange={(e) => setNuevaBeca({ ...nuevaBeca, categoria: e.target.value as any })}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-white py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-gray-600 dark:bg-black dark:text-white dark:focus:border-primary"
                >
                  <option value="requisitos">📋 Requisitos</option>
                  <option value="convocatoria">📢 Convocatoria</option>
                  <option value="programa">🎓 Programa de Beca</option>
                  <option value="recurso">📚 Recurso/Documento</option>
                </select>
              </div>

              {/* Título */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                  Título del Programa *
                </label>
                <input
                  type="text"
                  value={nuevaBeca.titulo}
                  onChange={(e) => setNuevaBeca({ ...nuevaBeca, titulo: e.target.value })}
                  placeholder="Ej: Becas de Excelencia Académica"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-white py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-gray-600 dark:bg-black dark:text-white dark:focus:border-primary placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                  Descripción *
                </label>
                <textarea
                  value={nuevaBeca.descripcion}
                  onChange={(e) => setNuevaBeca({ ...nuevaBeca, descripcion: e.target.value })}
                  placeholder="Describe los detalles del programa de beca, requisitos, montos, etc..."
                  rows={4}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-white py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-gray-600 dark:bg-black dark:text-white dark:focus:border-primary placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Dropzone para PDF */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors dark:border-gray-600 dark:hover:border-primary">
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
                          <path d="M19,2H5C3.9,2 3,2.9 3,4V20C3,21.1 3.9,22 5,22H19C20.1,22 21,21.1 21,20V4C21,2.9 20.1,2 19,2M19,20H5V4H19V20M7,18H17V16H7V18M7,14H17V12H7V14M7,10H17V6H7V10Z" />
                        </svg>
                      </div>
                    </div>
                    <h4 className="mb-2 font-medium text-gray-800 dark:text-gray-200">
                      {isDragActive ? "Suelta el PDF aquí" : "Arrastra tu PDF aquí"}
                    </h4>
                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                      PDF (máx. 10MB)
                    </p>
                    <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors">
                      Seleccionar Documento
                    </span>
                  </div>
                </div>
              </div>

              {/* Archivo Seleccionado */}
              {archivoSeleccionado && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-black border border-stroke dark:border-gray-600 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h6 className="font-medium text-black dark:text-white text-sm">Documento seleccionado:</h6>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{archivoSeleccionado.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {(archivoSeleccionado.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setArchivoSeleccionado(null);
                        setNuevaBeca(prev => ({ ...prev, archivo: '' }));
                      }}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Estado Activo */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="activa"
                  checked={nuevaBeca.activa}
                  onChange={(e) => setNuevaBeca({ ...nuevaBeca, activa: e.target.checked })}
                  className="h-5 w-5 rounded border border-stroke bg-white text-primary focus:ring-primary dark:border-gray-600 dark:bg-black"
                />
                <label htmlFor="activa" className="text-sm font-medium text-black dark:text-white">
                  Activo (visible para estudiantes)
                </label>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={handleAgregarBeca}
                  disabled={!archivoSeleccionado && !modoEdicion}
                  className="flex-1 sm:flex-initial justify-center rounded-lg bg-primary hover:bg-primary/90 py-3 px-8 font-medium text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {modoEdicion ? 'Actualizar' : 'Guardar'}
                </button>
                <button
                  onClick={() => {
                    handleCancelarEdicionBeca();
                    setMostrarFormulario(false);
                  }}
                  className="flex-1 sm:flex-initial justify-center rounded-lg border-2 border-stroke dark:border-gray-600 bg-white dark:bg-black py-3 px-8 font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Introducción */}
        <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <h5 className="text-lg font-semibold text-black dark:text-white mb-3">
            💡 Becas y Apoyos Económicos
          </h5>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            La Universidad Tecnológica de Tecamachalco ofrece diversas opciones de apoyo económico para nuestros estudiantes. Explora las oportunidades disponibles y los requisitos para acceder a ellas.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            📞 <strong>Departamento de Becas - UTTECAM</strong> | Para dudas adicionales, contáctanos directamente.
          </p>
        </div>

        {/* Secciones */}
        {secciones.map((seccion) => (
          <div key={seccion.id} className="mb-8">
            {/* Encabezado de Sección */}
            <div className="mb-4 pb-4 border-b-2 border-stroke dark:border-gray-700">
              <h3 className="text-2xl font-bold text-black dark:text-white mb-2">
                {seccion.titulo}
              </h3>
              {seccion.descripcion && (
                <p className="text-gray-700 dark:text-gray-300">
                  {seccion.descripcion}
                </p>
              )}
            </div>

            {/* Grid de Items */}
            {seccion.items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {seccion.items.map((beca) => (
                  <div
                    key={beca.id}
                    className="bg-white dark:bg-black rounded-lg border border-stroke dark:border-gray-600 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200"
                  >
                    {/* Card Header */}
                    <div className="p-4 border-b border-stroke dark:border-gray-600 bg-gray-50 dark:bg-black/50">
                      <div className="flex items-start justify-between mb-2">
                        <h6 className="font-semibold text-black dark:text-white text-sm line-clamp-2">
                          {beca.titulo}
                        </h6>
                        {beca.activa && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-700">
                            Activa
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {beca.fechaCreacion || 'N/A'}
                      </p>
                    </div>

                    {/* Card Body */}
                    <div className="p-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4">
                        {beca.descripcion}
                      </p>
                    </div>

                    {/* Card Actions */}
                    <div className="border-t border-stroke dark:border-gray-600 p-4 flex gap-2 justify-end">
                      {beca.archivo && (
                        <a
                          href={`#download-${beca.id}`}
                          className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md border border-primary"
                          title="Descargar PDF"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19,12A7,7 0 0,0 12,5V13H8L13,18L18,13H14A5,5 0 0,1 19,12Z" />
                          </svg>
                        </a>
                      )}
                      <button
                        onClick={() => handleIniciarEdicionBeca(beca)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors shadow-sm hover:shadow-md border border-yellow-500"
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3,17.25V21h3.75L17.81,9.94l-3.75-3.75L3,17.25Z" />
                          <path d="M20.71,7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83,1.83l3.75,3.75l1.83-1.83Z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEliminarBeca(beca.id)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm hover:shadow-md border border-red-500"
                        title="Eliminar"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-black/50 rounded-lg border border-dashed border-stroke dark:border-gray-600">
                <p className="text-gray-600 dark:text-gray-400">
                  No hay elementos en esta sección. Crea el primero.
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Sin Becas Totales */}
        {becas.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-6">
              <svg className="w-20 h-20 mx-auto text-gray-400 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              No hay becas registradas
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Crea el primer programa de beca o documento informativo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BecasApoyo;
