import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import Badge from '../../components/ui/badge/Badge';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import ControlledSelect from '../../components/form/ControlledSelect';
import {
  getAllCarreras,
  createCarrera,
  updateCarrera,
  deleteCarrera,
  getCarreraImageUrl,
} from '../../services/carreraService';
import type { Carrera, CreateCarreraRequest } from '../../types/carrera';

export default function GestionCarreras() {
  const { token } = useAuth();
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Carrera | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');
  const [filtroModalidad, setFiltroModalidad] = useState('');

  // Opciones para filtros y selects
  const nivelOptions = [
    { value: '', label: 'Todos los niveles' },
    { value: 'TSU', label: 'TSU' },
    { value: 'Ingenieria', label: 'Ingeniería' },
    { value: 'Licenciatura', label: 'Licenciatura' },
  ];

  const modalidadOptions = [
    { value: '', label: 'Todas las modalidades' },
    { value: 'Escolarizada', label: 'Escolarizada' },
    { value: 'Ejecutiva', label: 'Ejecutiva' },
    { value: 'Mixta', label: 'Mixta' },
  ];

  // Cargar carreras
  useEffect(() => {
    cargarCarreras();
  }, [token]);

  const cargarCarreras = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getAllCarreras(token);
      setCarreras(data);
    } catch (error) {
      console.error('Error al cargar carreras:', error);
    } finally {
      setLoading(false);
    }
  };

  // Estadísticas
  const carrerasActivas = carreras.filter((c) => c.activo).length;
  const carrerasPorNivel = {
    TSU: carreras.filter((c) => c.nivel === 'TSU').length,
    Ingenieria: carreras.filter((c) => c.nivel === 'Ingenieria').length,
    Licenciatura: carreras.filter((c) => c.nivel === 'Licenciatura').length,
  };

  // Filtrado
  const carrerasFiltradas = carreras.filter((carrera) => {
    const cumpleBusqueda =
      carrera.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      carrera.siglas.toLowerCase().includes(busqueda.toLowerCase());

    const cumpleNivel = filtroNivel === '' || carrera.nivel === filtroNivel;
    const cumpleModalidad = filtroModalidad === '' || carrera.modalidad === filtroModalidad;

    return cumpleBusqueda && cumpleNivel && cumpleModalidad;
  });

  const handleEliminar = async (id: number) => {
    if (!token) return;
    if (!confirm('¿Estás seguro de eliminar esta carrera? Esta acción no se puede deshacer.')) return;

    try {
      await deleteCarrera(id, token);
      await cargarCarreras();
    } catch (error) {
      console.error('Error al eliminar carrera:', error);
      alert('Error al eliminar la carrera');
    }
  };

  return (
    <>
      <PageMeta
        title="Gestión de Carreras - UTTECAM Admin"
        description="Panel de administración para gestionar carreras y programas educativos de UTTECAM"
      />
      <div className="space-y-8">
        <PageBreadcrumb pageTitle="Gestión de Carreras" />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Carreras</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Administra las carreras y programas educativos de UTTECAM
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ComponentCard title="Total Carreras">
            <div className="text-3xl font-bold text-primary dark:text-white">{carreras.length}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Programas educativos</p>
          </ComponentCard>

          <ComponentCard title="Carreras Activas">
            <div className="text-3xl font-bold text-green-600">{carrerasActivas}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">En oferta actual</p>
          </ComponentCard>

          <ComponentCard title="TSU">
            <div className="text-3xl font-bold text-blue-600">{carrerasPorNivel.TSU}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Técnico Superior</p>
          </ComponentCard>

          <ComponentCard title="Ingenierías">
            <div className="text-3xl font-bold text-purple-600">{carrerasPorNivel.Ingenieria}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Programas de Ingeniería</p>
          </ComponentCard>
        </div>

        {/* Panel de Control */}
        <ComponentCard title="Gestión de Carreras y Programas Educativos">
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="busqueda">Buscar Carreras</Label>
              <Input
                type="text"
                id="busqueda"
                placeholder="Buscar por nombre o siglas..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div>
              <Label>Filtrar por Nivel</Label>
              <ControlledSelect
                options={nivelOptions}
                placeholder="Seleccionar nivel"
                value={filtroNivel}
                onChange={(value) => setFiltroNivel(value)}
              />
            </div>

            <div>
              <Label>Filtrar por Modalidad</Label>
              <ControlledSelect
                options={modalidadOptions}
                placeholder="Seleccionar modalidad"
                value={filtroModalidad}
                onChange={(value) => setFiltroModalidad(value)}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setEditando(null);
                  setModalAbierto(true);
                }}
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                Agregar Carrera
              </button>
            </div>
          </div>

          {/* Tabla de Carreras */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando carreras...</p>
            </div>
          ) : carrerasFiltradas.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200 dark:border-white/[0.05]">
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Carrera
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Nivel / Modalidad
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Duración
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Orden
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Estado
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {carrerasFiltradas.map((carrera) => (
                    <TableRow key={carrera.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex items-center space-x-3">
                          {carrera.imagen && (
                            <img
                              src={getCarreraImageUrl(carrera.imagen)}
                              alt={carrera.nombre}
                              className="w-12 h-12 rounded-lg object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {carrera.nombre}
                            </div>
                            <div className="text-xs text-primary font-medium">{carrera.siglas}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{carrera.nivel}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {carrera.modalidad}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{carrera.duracion}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="text-center font-medium">{carrera.orden}</div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <Badge color={carrera.activo ? 'success' : 'error'}>
                          {carrera.activo ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => {
                              setEditando(carrera);
                              setModalAbierto(true);
                            }}
                            className="inline-flex items-center px-2 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Editar carrera"
                          >
                            <svg
                              className="w-4 h-4 dark:text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEliminar(carrera.id!)}
                            className="inline-flex items-center px-2 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Eliminar carrera"
                          >
                            <svg
                              className="w-4 h-4 dark:text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
                No se encontraron carreras
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Intenta ajustar los filtros de búsqueda o agrega una nueva carrera.
              </p>
            </div>
          )}
        </ComponentCard>

        {/* Modal para Agregar/Editar */}
        {modalAbierto && (
          <ModalCarrera
            carrera={editando}
            onCerrar={() => {
              setModalAbierto(false);
              setEditando(null);
            }}
            onGuardar={async () => {
              await cargarCarreras();
              setModalAbierto(false);
              setEditando(null);
            }}
            token={token!}
            nivelOptions={nivelOptions.filter((n) => n.value !== '')}
            modalidadOptions={modalidadOptions.filter((m) => m.value !== '')}
          />
        )}
      </div>
    </>
  );
}

// Modal Component
interface ModalCarreraProps {
  carrera: Carrera | null;
  onCerrar: () => void;
  onGuardar: () => void;
  token: string;
  nivelOptions: { value: string; label: string }[];
  modalidadOptions: { value: string; label: string }[];
}

function ModalCarrera({
  carrera,
  onCerrar,
  onGuardar,
  token,
  nivelOptions,
  modalidadOptions,
}: ModalCarreraProps) {
  const [formData, setFormData] = useState({
    nombre: carrera?.nombre || '',
    siglas: carrera?.siglas || '',
    nivel: carrera?.nivel || 'TSU',
    modalidad: carrera?.modalidad || 'Escolarizada',
    duracion: carrera?.duracion || '',
    objetivo: carrera?.objetivo || '',
    perfil_ingreso: carrera?.perfil_ingreso || '',
    perfil_egreso: carrera?.perfil_egreso || '',
    campo_laboral: carrera?.campo_laboral || '',
    orden: carrera?.orden || 0,
    activo: carrera?.activo ?? true,
  });

  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [planFile, setPlanFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (carrera) {
        // Actualizar
        await updateCarrera(
          carrera.id!,
          {
            ...formData,
            ...(imagenFile && { imagen: imagenFile }),
            ...(videoFile && { video: videoFile }),
            ...(planFile && { plan_estudios: planFile }),
          },
          token
        );
      } else {
        // Crear
        if (!imagenFile) {
          alert('Debe seleccionar una imagen para la carrera');
          setSaving(false);
          return;
        }

        await createCarrera(
          {
            ...formData,
            imagen: imagenFile,
            ...(videoFile && { video: videoFile }),
            ...(planFile && { plan_estudios: planFile }),
          } as CreateCarreraRequest,
          token
        );
      }
      onGuardar();
    } catch (error) {
      console.error('Error al guardar carrera:', error);
      alert('Error al guardar la carrera');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-24 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-lg my-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {carrera ? 'Editar Carrera' : 'Nueva Carrera'}
            </h2>
            <button
              type="button"
              onClick={onCerrar}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="nombre">Nombre de la Carrera *</Label>
                <Input
                  type="text"
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="siglas">Siglas *</Label>
                <Input
                  type="text"
                  id="siglas"
                  value={formData.siglas}
                  onChange={(e) =>
                    setFormData({ ...formData, siglas: e.target.value.toUpperCase() })
                  }
                  required
                />
              </div>

              <div>
                <Label>Nivel *</Label>
                <ControlledSelect
                  options={nivelOptions}
                  value={formData.nivel}
                  onChange={(value) => setFormData({ ...formData, nivel: value as any })}
                />
              </div>

              <div>
                <Label>Modalidad *</Label>
                <ControlledSelect
                  options={modalidadOptions}
                  value={formData.modalidad}
                  onChange={(value) => setFormData({ ...formData, modalidad: value as any })}
                />
              </div>

              <div>
                <Label htmlFor="duracion">Duración *</Label>
                <Input
                  type="text"
                  id="duracion"
                  value={formData.duracion}
                  onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                  placeholder="Ej: 2 años (6 cuatrimestres)"
                  required
                />
              </div>

              <div>
                <Label htmlFor="orden">Orden de visualización</Label>
                <Input
                  type="number"
                  id="orden"
                  value={formData.orden}
                  onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) })}
                  min="0"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="objetivo">Objetivo *</Label>
                <textarea
                  id="objetivo"
                  rows={3}
                  value={formData.objetivo}
                  onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="perfil_ingreso">Perfil de Ingreso *</Label>
                <textarea
                  id="perfil_ingreso"
                  rows={3}
                  value={formData.perfil_ingreso}
                  onChange={(e) => setFormData({ ...formData, perfil_ingreso: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="perfil_egreso">Perfil de Egreso *</Label>
                <textarea
                  id="perfil_egreso"
                  rows={3}
                  value={formData.perfil_egreso}
                  onChange={(e) => setFormData({ ...formData, perfil_egreso: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="campo_laboral">Campo Laboral *</Label>
                <textarea
                  id="campo_laboral"
                  rows={3}
                  value={formData.campo_laboral}
                  onChange={(e) => setFormData({ ...formData, campo_laboral: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary"
                />
              </div>

              <div>
                <Label htmlFor="imagen">Imagen {!carrera && '*'}</Label>
                <input
                  type="file"
                  id="imagen"
                  accept="image/*"
                  onChange={(e) => setImagenFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
                {carrera?.imagen && (
                  <p className="mt-1 text-xs text-gray-500">
                    Archivo actual: {carrera.imagen}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="video">Video Promocional (MP4, WEBM, AVI)</Label>
                <input
                  type="file"
                  id="video"
                  accept="video/mp4,video/webm,video/x-msvideo"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
                {carrera?.video_url && (
                  <p className="mt-1 text-xs text-gray-500">
                    Archivo actual: {carrera.video_url}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Opcional. Máximo 50MB. Formatos: MP4, WEBM, AVI
                </p>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="plan_estudios">Plan de Estudios (PDF)</Label>
                <input
                  type="file"
                  id="plan_estudios"
                  accept=".pdf"
                  onChange={(e) => setPlanFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
                {carrera?.plan_estudios_url && (
                  <p className="mt-1 text-xs text-gray-500">
                    Archivo actual: {carrera.plan_estudios_url}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Carrera activa</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onCerrar}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : carrera ? 'Actualizar' : 'Crear Carrera'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
