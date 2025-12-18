import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import ComponentCard from '../../components/common/ComponentCard';
import { toastSuccess, toastError, confirmDialog } from '../../utils/alert';
import * as reinscripcionService from '../../services/opcionesReinscripcionService';

// Interface para el formulario (sin archivo, que se maneja por separado)
interface OpcionFormData {
  id?: string;
  titulo: string;
  subtitulo?: string;
  activo: boolean;
}

const ReinscripcionPage = () => {
  const navigate = useNavigate();

  // Estados para la sección principal
  const [seccion, setSeccion] = useState<reinscripcionService.SeccionReinscripcion>({
    titulo: 'Opciones de Reinscripción',
    subtitulo: 'Selecciona el tipo de reinscripción que corresponda a tu situación'
  });
  const [isEditingSeccion, setIsEditingSeccion] = useState(false);
  const [isSavingSeccion, setIsSavingSeccion] = useState(false);
  const [seccionFormData, setSeccionFormData] = useState({
    titulo: '',
    subtitulo: ''
  });

  // Estados para las opciones
  const [opciones, setOpciones] = useState<reinscripcionService.OpcionReinscripcion[]>([]);
  const [isLoadingOpciones, setIsLoadingOpciones] = useState(true);
  const [showOpcionForm, setShowOpcionForm] = useState(false);
  const [editingOpcionId, setEditingOpcionId] = useState<string | null>(null);
  const [isSavingOpcion, setIsSavingOpcion] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [opcionFormData, setOpcionFormData] = useState<OpcionFormData>({
    titulo: '',
    subtitulo: '',
    activo: true
  });

  // Cargar datos al montar
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadSeccion(), loadOpciones()]);
  };

  const loadSeccion = async () => {
    try {
      const data = await reinscripcionService.getSeccion();
      setSeccion(data);
    } catch (error) {
      console.error('Error al cargar sección:', error);
    }
  };

  const loadOpciones = async () => {
    try {
      setIsLoadingOpciones(true);
      const data = await reinscripcionService.getOpciones();
      setOpciones(data);
    } catch (error) {
      console.error('Error al cargar opciones:', error);
      toastError('Error al cargar las opciones de reinscripción');
    } finally {
      setIsLoadingOpciones(false);
    }
  };

  // === HANDLERS PARA SECCIÓN ===
  const handleEditarSeccion = () => {
    setSeccionFormData({
      titulo: seccion.titulo,
      subtitulo: seccion.subtitulo || ''
    });
    setIsEditingSeccion(true);
  };

  const handleCancelarSeccion = () => {
    setIsEditingSeccion(false);
    setSeccionFormData({ titulo: '', subtitulo: '' });
  };

  const handleGuardarSeccion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!seccionFormData.titulo.trim()) {
      toastError('El título es requerido');
      return;
    }

    try {
      setIsSavingSeccion(true);
      await reinscripcionService.createOrUpdateSeccion(seccionFormData);
      await loadSeccion();
      setIsEditingSeccion(false);
      toastSuccess('Sección actualizada correctamente');
    } catch (error: unknown) {
      console.error('Error al guardar sección:', error);
      toastError(error instanceof Error ? error.message : 'Error al guardar la sección');
    } finally {
      setIsSavingSeccion(false);
    }
  };

  // === HANDLERS PARA OPCIONES ===
  const handleAgregarOpcion = () => {
    setOpcionFormData({
      titulo: '',
      subtitulo: '',
      activo: true
    });
    setSelectedFile(null);
    setEditingOpcionId(null);
    setShowOpcionForm(true);
  };

  const handleEditarOpcion = (opcion: reinscripcionService.OpcionReinscripcion) => {
    setOpcionFormData({
      id: opcion.id,
      titulo: opcion.titulo,
      subtitulo: opcion.subtitulo || '',
      activo: opcion.activo
    });
    setSelectedFile(null);
    setEditingOpcionId(opcion.id);
    setShowOpcionForm(true);
  };

  const handleCancelarOpcion = () => {
    setShowOpcionForm(false);
    setEditingOpcionId(null);
    setSelectedFile(null);
    setOpcionFormData({ titulo: '', subtitulo: '', activo: true });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validar tipo de archivo
    if (file.type !== 'application/pdf') {
      toastError('Solo se permiten archivos PDF');
      e.target.value = '';
      setSelectedFile(null);
      return;
    }

    // Validar tamaño (10 MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toastError('El archivo no puede superar los 10 MB');
      e.target.value = '';
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleGuardarOpcion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!opcionFormData.titulo.trim()) {
      toastError('El título es requerido');
      return;
    }

    // El archivo siempre es requerido (incluso al editar)
    if (!selectedFile) {
      toastError('Debes seleccionar un archivo PDF');
      return;
    }

    try {
      setIsSavingOpcion(true);
      
      // TypeScript ya sabe que selectedFile no es null aquí
      const dataToSend: reinscripcionService.CreateOpcionData = {
        titulo: opcionFormData.titulo,
        subtitulo: opcionFormData.subtitulo,
        activo: opcionFormData.activo,
        archivo: selectedFile, // No es null gracias a la validación arriba
        ...(opcionFormData.id && { id: opcionFormData.id })
      };
      
      console.log('Datos a enviar:', {
        titulo: dataToSend.titulo,
        subtitulo: dataToSend.subtitulo,
        activo: dataToSend.activo,
        archivo: dataToSend.archivo.name,
        id: dataToSend.id
      });
      
      await reinscripcionService.createOrUpdateOpcion(dataToSend);
      await loadOpciones();
      setShowOpcionForm(false);
      setEditingOpcionId(null);
      setSelectedFile(null);
      toastSuccess(editingOpcionId ? 'Opción actualizada correctamente' : 'Opción creada correctamente');
    } catch (error: unknown) {
      console.error('Error al guardar opción:', error);
      toastError(error instanceof Error ? error.message : 'Error al guardar la opción');
    } finally {
      setIsSavingOpcion(false);
    }
  };

  const handleToggleActivoOpcion = async (opcion: reinscripcionService.OpcionReinscripcion) => {
    const nuevoEstado = !opcion.activo;
    const confirmar = await confirmDialog({
      title: `¿${nuevoEstado ? 'Activar' : 'Desactivar'} opción?`,
      text: `La opción "${opcion.titulo}" será ${nuevoEstado ? 'visible' : 'ocultada'} para los usuarios.`
    });

    if (!confirmar) return;

    try {
      await reinscripcionService.toggleActivoOpcion(opcion.id, nuevoEstado);
      await loadOpciones();
      toastSuccess(`Opción ${nuevoEstado ? 'activada' : 'desactivada'} correctamente`);
    } catch (error: unknown) {
      console.error('Error al cambiar estado:', error);
      toastError(error instanceof Error ? error.message : 'Error al cambiar el estado');
    }
  };

  const handleEliminarOpcion = async (opcion: reinscripcionService.OpcionReinscripcion) => {
    const confirmar = await confirmDialog({
      title: '¿Eliminar opción?',
      text: `Se eliminará permanentemente la opción "${opcion.titulo}". Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar'
    });

    if (!confirmar) return;

    try {
      await reinscripcionService.deleteOpcion(opcion.id);
      await loadOpciones();
      toastSuccess('Opción eliminada correctamente');
    } catch (error: unknown) {
      console.error('Error al eliminar opción:', error);
      toastError(error instanceof Error ? error.message : 'Error al eliminar la opción');
    }
  };

  return (
    <div className="space-y-6">
      {/* Botón volver */}
      <button
        onClick={() => navigate('/ServiciosEscolares/Tramites')}
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
        </svg>
        Volver a Trámites
      </button>

      {/* Card 1: Información de la Sección */}
      <ComponentCard
        title="Información Principal"
        desc="Configura el título y subtítulo que se mostrará a los usuarios"
      >
        {!isEditingSeccion ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {seccion.titulo}
              </h3>
              {seccion.subtitulo && (
                <p className="text-gray-600 dark:text-gray-400">
                  {seccion.subtitulo}
                </p>
              )}
            </div>
            <button
              onClick={handleEditarSeccion}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
              </svg>
              Editar Información
            </button>
          </div>
        ) : (
          <form onSubmit={handleGuardarSeccion} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Título Principal *
              </label>
              <input
                type="text"
                value={seccionFormData.titulo}
                onChange={(e) => setSeccionFormData(prev => ({ ...prev, titulo: e.target.value }))}
                maxLength={300}
                disabled={isSavingSeccion}
                className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 transition-all disabled:opacity-50"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Subtítulo
              </label>
              <textarea
                value={seccionFormData.subtitulo}
                onChange={(e) => setSeccionFormData(prev => ({ ...prev, subtitulo: e.target.value }))}
                maxLength={500}
                rows={3}
                disabled={isSavingSeccion}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 transition-all disabled:opacity-50"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSavingSeccion}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium disabled:opacity-50 transition-all"
              >
                {isSavingSeccion ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={handleCancelarSeccion}
                disabled={isSavingSeccion}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </ComponentCard>

      {/* Card 2: Gestión de Opciones */}
      <ComponentCard
        title="Opciones de Reinscripción"
        desc="Administra las opciones que verán los usuarios"
      >
        {isLoadingOpciones ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="animate-spin w-10 h-10 mx-auto text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Cargando opciones...</p>
          </div>
        ) : (
          <>
            {/* Header con botón agregar */}
            {!showOpcionForm && (
              <div className="flex justify-between items-center mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">
                  {opciones.length} opción{opciones.length !== 1 ? 'es' : ''}
                </span>
                <button
                  onClick={handleAgregarOpcion}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium shadow-theme-xs hover:shadow-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                  </svg>
                  Agregar Opción
                </button>
              </div>
            )}

            {/* Formulario */}
            {showOpcionForm && (
              <div className="mb-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-6">
                <h5 className="text-base font-semibold text-gray-800 dark:text-white mb-5">
                  {editingOpcionId ? 'Editar Opción' : 'Nueva Opción'}
                </h5>
                
                <form onSubmit={handleGuardarOpcion} className="space-y-5">
                  <div>
                    <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Título *
                    </label>
                    <input
                      type="text"
                      value={opcionFormData.titulo}
                      onChange={(e) => setOpcionFormData(prev => ({ ...prev, titulo: e.target.value }))}
                      maxLength={300}
                      placeholder="Ej: Alumnos de la UTTecam"
                      disabled={isSavingOpcion}
                      className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 transition-all disabled:opacity-50"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Subtítulo
                    </label>
                    <textarea
                      value={opcionFormData.subtitulo}
                      onChange={(e) => setOpcionFormData(prev => ({ ...prev, subtitulo: e.target.value }))}
                      maxLength={500}
                      rows={3}
                      placeholder="Descripción de la opción..."
                      disabled={isSavingOpcion}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 shadow-theme-xs focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 transition-all disabled:opacity-50"
                    />
                  </div>

                  {/* Campo de archivo PDF */}
                  <div>
                    <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Archivo PDF *
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        disabled={isSavingOpcion}
                        required
                        className="block w-full text-sm text-gray-700 dark:text-gray-300
                          file:mr-4 file:py-2.5 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-medium
                          file:bg-brand-50 file:text-brand-700
                          dark:file:bg-brand-900/30 dark:file:text-brand-400
                          hover:file:bg-brand-100 dark:hover:file:bg-brand-900/50
                          file:cursor-pointer cursor-pointer
                          disabled:opacity-50 disabled:cursor-not-allowed
                          border border-gray-300 dark:border-gray-700 rounded-lg
                          bg-white dark:bg-gray-900 px-4 py-2"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedFile ? (
                          <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                            </svg>
                            {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        ) : (
                          'Solo archivos PDF. Tamaño máximo: 10 MB.'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <input
                      type="checkbox"
                      id="opcion-activa"
                      checked={opcionFormData.activo}
                      onChange={(e) => setOpcionFormData(prev => ({ ...prev, activo: e.target.checked }))}
                      disabled={isSavingOpcion}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 disabled:opacity-50"
                    />
                    <label htmlFor="opcion-activa" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                      Opción activa (visible para usuarios)
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="submit"
                      disabled={isSavingOpcion}
                      className="inline-flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 py-2.5 px-6 font-medium text-white text-sm shadow-theme-xs hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isSavingOpcion ? 'Guardando...' : (editingOpcionId ? 'Actualizar' : 'Guardar')}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelarOpcion}
                      disabled={isSavingOpcion}
                      className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2.5 px-6 font-medium text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Lista de opciones */}
            {opciones.length === 0 && !showOpcionForm ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9,10H7V12H9V10M13,10H11V12H13V10M17,10H15V12H17V10M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  No hay opciones registradas
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Agrega las opciones de reinscripción que verán los usuarios.
                </p>
              </div>
            ) : !showOpcionForm && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opciones.map((opcion) => (
                  <div
                    key={opcion.id}
                    className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-lg transition-all duration-200"
                  >
                    {/* Badge de estado */}
                    <div className="absolute top-4 right-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        opcion.activo
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {opcion.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>

                    {/* Icono */}
                    <div className="mb-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
                        </svg>
                      </div>
                    </div>

                    {/* Contenido */}
                    <h6 className="text-base font-bold text-gray-800 dark:text-white mb-2 pr-20">
                      {opcion.titulo}
                    </h6>
                    {opcion.subtitulo && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {opcion.subtitulo}
                      </p>
                    )}

                    {/* Acciones */}
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => handleEditarOpcion(opcion)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 text-xs font-medium transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                        </svg>
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleActivoOpcion(opcion)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          opcion.activo
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                        </svg>
                        {opcion.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleEliminarOpcion(opcion)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 text-xs font-medium transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </ComponentCard>
    </div>
  );
};

export default ReinscripcionPage;
