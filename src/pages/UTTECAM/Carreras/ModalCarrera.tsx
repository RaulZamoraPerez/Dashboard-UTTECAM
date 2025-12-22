import React, { useState, useEffect } from 'react';
import { getCarreraImageUrl } from '../../../services/carreraService';
import { toastError } from '../../../utils/alert';
import type { Carrera } from '../../../types/carrera';

interface StudyPlanSemester {
  semester: string;
  subjects: string[];
}

interface ModalCarreraProps {
  isOpen: boolean;
  onClose: () => void;
  carrera: Carrera | null;
  onSave: (data: any) => Promise<Carrera | null | boolean>;
}

export default function ModalCarrera({
  isOpen,
  onClose,
  carrera,
  onSave,
}: ModalCarreraProps) {
  const API_URL = import.meta.env.VITE_API_URL || '';
  
  const [formData, setFormData] = useState({
    nombre: '',
    siglas: '',
    nivel: 'Ingenieria' as 'Ingenieria' | 'Licenciatura',
    duracion: '',
    objetivo: '',
    perfil_ingreso: '',
    perfil_egreso: '',
    campo_laboral: '',
    competencias: '',
    atributos_egreso: '',
    objetivos_educacionales: '',
    mapa_curricular: '',
    activo: true,
  });

  const [mapaBuilder, setMapaBuilder] = useState<StudyPlanSemester[]>([]);
  const [imagen, setImagen] = useState<File | null>(null);
  const [imagenPortada, setImagenPortada] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [planEstudios, setPlanEstudios] = useState<File | null>(null);
  
  const [previews, setPreviews] = useState({
    imagen: null as string | null,
    portada: null as string | null,
    video: null as string | null,
  });

  const [saving, setSaving] = useState(false);

  // Resetear y cargar datos cuando cambia la carrera o se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (carrera) {
        setFormData({
          nombre: carrera.nombre,
          siglas: carrera.siglas,
          nivel: carrera.nivel,
          duracion: carrera.duracion,
          objetivo: carrera.objetivo,
          perfil_ingreso: carrera.perfil_ingreso,
          perfil_egreso: carrera.perfil_egreso,
          campo_laboral: carrera.campo_laboral,
          competencias: carrera.competencias || '',
          atributos_egreso: carrera.atributos_egreso || '',
          objetivos_educacionales: carrera.objetivos_educacionales || '',
          mapa_curricular: typeof carrera.mapa_curricular === 'string' 
            ? carrera.mapa_curricular 
            : JSON.stringify(carrera.mapa_curricular),
          activo: carrera.activo,
        });

        // Inicializar mapa curricular
        try {
          const parsed = carrera.mapa_curricular 
            ? (typeof carrera.mapa_curricular === 'string' ? JSON.parse(carrera.mapa_curricular) : carrera.mapa_curricular) 
            : [];
          setMapaBuilder(Array.isArray(parsed) ? parsed : []);
        } catch {
          setMapaBuilder([]);
        }

        // Inicializar previews
        setPreviews({
          imagen: carrera.imagen ? getCarreraImageUrl(carrera.imagen) : null,
          portada: carrera.imagen_portada ? getCarreraImageUrl(carrera.imagen_portada) : null,
          video: carrera.video_url ? (carrera.video_url.startsWith('http') ? carrera.video_url : `${API_URL}/uploads/carreras/videos/${carrera.video_url}`) : null,
        });
      } else {
        // Reset para nueva carrera
        setFormData({
          nombre: '',
          siglas: '',
          nivel: 'Ingenieria',
          duracion: '',
          objetivo: '',
          perfil_ingreso: '',
          perfil_egreso: '',
          campo_laboral: '',
          competencias: '',
          atributos_egreso: '',
          objetivos_educacionales: '',
          mapa_curricular: '',
          activo: true,
        });
        setMapaBuilder([]);
        setPreviews({ imagen: null, portada: null, video: null });
        setImagen(null);
        setImagenPortada(null);
        setVideo(null);
        setPlanEstudios(null);
      }
    }
  }, [carrera, isOpen]);

  // Sincronizar mapaBuilder con formData
  useEffect(() => {
    setFormData(prev => ({ ...prev, mapa_curricular: JSON.stringify(mapaBuilder) }));
  }, [mapaBuilder]);

  // Manejo de archivos y previews
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'imagen' | 'portada' | 'video' | 'plan') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'video' && file.size > 200 * 1024 * 1024) {
      toastError('El video supera el tamaño máximo permitido de 200MB');
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    switch (type) {
      case 'imagen':
        setImagen(file);
        setPreviews(prev => ({ ...prev, imagen: objectUrl }));
        break;
      case 'portada':
        setImagenPortada(file);
        setPreviews(prev => ({ ...prev, portada: objectUrl }));
        break;
      case 'video':
        setVideo(file);
        setPreviews(prev => ({ ...prev, video: objectUrl }));
        break;
      case 'plan':
        setPlanEstudios(file);
        break;
    }
  };

  // Helpers Mapa Curricular
  const addSemester = () => setMapaBuilder([...mapaBuilder, { semester: `Cuatrimestre ${mapaBuilder.length + 1}`, subjects: [] }]);
  const removeSemester = (index: number) => {
    const newSemesters = [...mapaBuilder];
    newSemesters.splice(index, 1);
    setMapaBuilder(newSemesters);
  };
  const updateSemesterName = (index: number, name: string) => {
    const newSemesters = [...mapaBuilder];
    newSemesters[index].semester = name;
    setMapaBuilder(newSemesters);
  };
  const addSubject = (semesterIndex: number) => {
    const newSemesters = [...mapaBuilder];
    newSemesters[semesterIndex].subjects.push('');
    setMapaBuilder(newSemesters);
  };
  const updateSubject = (semesterIndex: number, subjectIndex: number, value: string) => {
    const newSemesters = [...mapaBuilder];
    newSemesters[semesterIndex].subjects[subjectIndex] = value;
    setMapaBuilder(newSemesters);
  };
  const removeSubject = (semesterIndex: number, subjectIndex: number) => {
    const newSemesters = [...mapaBuilder];
    newSemesters[semesterIndex].subjects.splice(subjectIndex, 1);
    setMapaBuilder(newSemesters);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imagen && !carrera) {
      toastError('Debe seleccionar una imagen de cabecera (Carátula)');
      return;
    }

    setSaving(true);
    try {
      const data: any = {
        ...formData,
        ...(imagen && { imagen }),
        ...(imagenPortada && { imagen_portada: imagenPortada }),
        ...(video && { video }),
        ...(planEstudios && { plan_estudios: planEstudios }),
      };
      
      const result = await onSave(data);
      // onSave may return the created Carrera object or boolean success for updates
      if (result) onClose();
    } catch (error) {
      console.error(error);
      toastError('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full dark:bg-gray-800">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center dark:bg-gray-700 dark:border-gray-600">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {carrera ? 'Editar Carrera' : 'Crear Nueva Carrera'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <span className="text-2xl">&times;</span>
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="px-6 py-6 max-h-[75vh] overflow-y-auto custom-scrollbar dark:text-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Información Básica */}
              <div className="md:col-span-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b pb-1 dark:border-gray-600">Información Básica</h3>
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">Nombre Completo *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ej. Ingeniería en Software"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">Siglas *</label>
                <input
                  type="text"
                  value={formData.siglas}
                  onChange={(e) => setFormData({ ...formData, siglas: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ej. ISO"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">Nivel Académico *</label>
                <select
                  value={formData.nivel}
                  onChange={(e) => setFormData({ ...formData, nivel: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="Ingenieria">Ingeniería</option>
                  <option value="Licenciatura">Licenciatura</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">Duración *</label>
                <input
                  type="text"
                  value={formData.duracion}
                  onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                  placeholder="Ej: 3 años y 4 meses"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              {/* Detalles Académicos */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b pb-1 dark:border-gray-600">Detalles Académicos</h3>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">Objetivo *</label>
                <textarea
                  value={formData.objetivo}
                  onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">Perfil de Ingreso *</label>
                <textarea
                  value={formData.perfil_ingreso}
                  onChange={(e) => setFormData({ ...formData, perfil_ingreso: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">Perfil de Egreso *</label>
                <textarea
                  value={formData.perfil_egreso}
                  onChange={(e) => setFormData({ ...formData, perfil_egreso: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Campo Laboral *</label>
                <textarea
                  value={formData.campo_laboral}
                  onChange={(e) => setFormData({ ...formData, campo_laboral: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                  required
                />
              </div>

              {/* Plan de Estudios (Mapa Curricular) */}
              <div className="col-span-2 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plan de Estudios (Materias por Cuatrimestre)</label>
                  <button
                    type="button"
                    onClick={addSemester}
                    className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                  >
                    + Agregar Cuatrimestre
                  </button>
                </div>
                
                <div className="space-y-4 border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto dark:bg-gray-700/50 dark:border-gray-600">
                  {mapaBuilder.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">No hay cuatrimestres definidos.</p>
                  )}
                  {mapaBuilder.map((sem, sIdx) => (
                    <div key={sIdx} className="bg-white p-3 rounded shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-600">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={sem.semester}
                          onChange={(e) => updateSemesterName(sIdx, e.target.value)}
                          className="flex-1 text-sm font-bold border-none focus:ring-0 p-0 text-gray-800 dark:bg-transparent dark:text-white"
                          placeholder="Nombre del Cuatrimestre"
                        />
                        <button
                          type="button"
                          onClick={() => removeSemester(sIdx)}
                          className="text-red-400 hover:text-red-600"
                          title="Eliminar Cuatrimestre"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                      <div className="space-y-2 pl-2 border-l-2 border-gray-100 dark:border-gray-700">
                        {sem.subjects.map((subj, subIdx) => (
                          <div key={subIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={subj}
                              onChange={(e) => updateSubject(sIdx, subIdx, e.target.value)}
                              className="flex-1 text-xs border-gray-200 rounded focus:ring-blue-500 focus:border-blue-500 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                              placeholder="Nombre de la materia"
                            />
                            <button
                              type="button"
                              onClick={() => removeSubject(sIdx, subIdx)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addSubject(sIdx)}
                          className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1 mt-1 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          + Agregar Materia
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Archivos Multimedia */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b pb-1 dark:border-gray-600">Multimedia y Archivos</h3>
              </div>

              {/* Imagen Carátula */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">
                  Imagen Cabecera (Carátula) {carrera && <span className="text-gray-400 font-normal">(Opcional)</span>}
                </label>
                <div className="mt-1 border-2 border-gray-300 border-dashed rounded-lg p-4 hover:bg-gray-50 transition-colors text-center dark:border-gray-600 dark:hover:bg-gray-700/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'imagen')}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                  />
                  {previews.imagen && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Vista Previa:</p>
                      <img src={previews.imagen} alt="Preview" className="h-32 mx-auto object-cover rounded shadow-sm" />
                    </div>
                  )}
                </div>
              </div>

              {/* Imagen Portada */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">
                  Imagen Cuadrícula (Portada) {carrera && <span className="text-gray-400 font-normal">(Opcional)</span>}
                </label>
                <div className="mt-1 border-2 border-gray-300 border-dashed rounded-lg p-4 hover:bg-gray-50 transition-colors text-center dark:border-gray-600 dark:hover:bg-gray-700/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'portada')}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                  />
                  {previews.portada && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Vista Previa:</p>
                      <img src={previews.portada} alt="Preview" className="h-32 mx-auto object-cover rounded shadow-sm" />
                    </div>
                  )}
                </div>
              </div>

              {/* Video */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-300">
                  Video Promocional (Max 200MB) {carrera && <span className="text-gray-400 font-normal">(Opcional)</span>}
                </label>
                <div className="mt-1 border-2 border-gray-300 border-dashed rounded-lg p-4 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:hover:bg-gray-700/50">
                  <input
                    type="file"
                    name="video"
                    accept="video/mp4,video/webm,video/x-msvideo"
                    onChange={(e) => handleFileChange(e, 'video')}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                  />
                  {previews.video && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Vista Previa:</p>
                      <video src={previews.video} controls className="w-full max-h-64 rounded-lg border border-gray-200 dark:border-gray-600" />
                    </div>
                  )}
                </div>
              </div>

              {/* Estado Activo */}
              <div className="md:col-span-2 mt-2">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-700/50 dark:border-gray-600">
                  <input
                    id="active-check"
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-500 dark:bg-gray-700"
                  />
                  <label htmlFor="active-check" className="ml-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
                    Carrera activa (Visible al público)
                  </label>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-600">
              <button
                type="button"
                onClick={onClose}
                title="Cancelar"
                aria-label="Cancelar"
                className="flex items-center justify-center p-3 bg-white text-gray-700 font-medium border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                <span className="sr-only">Cancelar</span>
              </button>
              <button
                type="submit"
                disabled={saving}
                title={carrera ? 'Guardar Cambios' : 'Crear Carrera'}
                aria-label={saving ? 'Guardando' : carrera ? 'Guardar Cambios' : 'Crear Carrera'}
                className="flex items-center justify-center p-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="sr-only">{saving ? 'Guardando...' : carrera ? 'Guardar Cambios' : 'Crear Carrera'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
