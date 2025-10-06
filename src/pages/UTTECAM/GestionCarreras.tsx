import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import ControlledSelect from "../../components/form/ControlledSelect";

interface CarreraData {
  id: number;
  nombre: string;
  codigo: string;
  modalidad: string;
  duracion: string;
  creditos: number;
  coordinador: string;
  fechaCreacion: string;
  estado: 'Activa' | 'Inactiva' | 'En Revision';
  descripcion?: string;
  visitas?: number;
}

export default function GestionCarreras() {
  const [carreras, setCarreras] = useState<CarreraData[]>([
    {
      id: 1,
      nombre: "Ingeniería en Sistemas Computacionales",
      codigo: "ISC",
      modalidad: "Escolarizada",
      duracion: "9 cuatrimestres",
      creditos: 256,
      coordinador: "Ing. Laura Morales",
      fechaCreacion: "2015-08-15",
      estado: "Activa",
      descripcion: "Carrera enfocada en el desarrollo de sistemas computacionales",
      visitas: 1250
    },
    {
      id: 2,
      nombre: "Ingeniería en Mecatrónica",
      codigo: "IMT",
      modalidad: "Escolarizada",
      duracion: "9 cuatrimestres",
      creditos: 268,
      coordinador: "Ing. Carlos Ruiz",
      fechaCreacion: "2016-01-20",
      estado: "Activa",
      descripcion: "Carrera que combina mecánica, electrónica y sistemas de control",
      visitas: 980
    },
    {
      id: 3,
      nombre: "Ingeniería en Gestión Empresarial",
      codigo: "IGE",
      modalidad: "Escolarizada",
      duracion: "9 cuatrimestres",
      creditos: 240,
      coordinador: "Lic. María González",
      fechaCreacion: "2017-09-10",
      estado: "Activa",
      descripcion: "Carrera orientada a la administración y gestión de empresas",
      visitas: 750
    },
    {
      id: 4,
      nombre: "Técnico Superior Universitario en Tecnologías de la Información",
      codigo: "TSU-TI",
      modalidad: "Escolarizada",
      duracion: "6 cuatrimestres",
      creditos: 180,
      coordinador: "Ing. Roberto Hernández",
      fechaCreacion: "2018-01-15",
      estado: "Activa",
      descripcion: "Programa técnico en tecnologías de la información",
      visitas: 650
    },
    {
      id: 5,
      nombre: "Ingeniería en Energías Renovables",
      codigo: "IER",
      modalidad: "Mixta",
      duracion: "9 cuatrimestres",
      creditos: 260,
      coordinador: "Dr. Juan Pérez",
      fechaCreacion: "2020-08-01",
      estado: "En Revision",
      descripcion: "Carrera enfocada en tecnologías sustentables y energía limpia",
      visitas: 420
    }
  ]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<CarreraData | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroModalidad, setFiltroModalidad] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  // Datos para filtros
  const modalidadOptions = [
    { value: "", label: "Todas las modalidades" },
    { value: "Escolarizada", label: "Escolarizada" },
    { value: "Mixta", label: "Mixta" },
    { value: "En Línea", label: "En Línea" }
  ];

  const estadoOptions = [
    { value: "", label: "Todos los estados" },
    { value: "Activa", label: "Activa" },
    { value: "Inactiva", label: "Inactiva" },
    { value: "En Revision", label: "En Revisión" }
  ];

  const coordinadoresOptions = [
    { value: "Ing. Laura Morales", label: "Ing. Laura Morales" },
    { value: "Ing. Carlos Ruiz", label: "Ing. Carlos Ruiz" },
    { value: "Lic. María González", label: "Lic. María González" },
    { value: "Ing. Roberto Hernández", label: "Ing. Roberto Hernández" },
    { value: "Dr. Juan Pérez", label: "Dr. Juan Pérez" }
  ];

  // Estadísticas simplificadas
  const carrerasActivas = carreras.filter(c => c.estado === "Activa").length;
  const totalVisitas = carreras.reduce((total, c) => total + (c.visitas || 0), 0);

  // Filtrado
  const carrerasFiltradas = carreras.filter(carrera => {
    const cumpleBusqueda = carrera.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          carrera.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
                          carrera.coordinador.toLowerCase().includes(busqueda.toLowerCase());
    
    const cumpleModalidad = filtroModalidad === "" || carrera.modalidad === filtroModalidad;
    const cumpleEstado = filtroEstado === "" || carrera.estado === filtroEstado;
    
    return cumpleBusqueda && cumpleModalidad && cumpleEstado;
  });

  return (
    <>
      <PageMeta title="Gestión de Carreras - UTTECAM Admin" description="Panel de administración para gestionar carreras y programas educativos de UTTECAM" />
      <div className="space-y-8">
        <PageBreadcrumb pageTitle="Gestión de Carreras - UTTECAM" />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Carreras</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Administra las carreras y programas educativos de UTTECAM</p>
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

          <ComponentCard title="Total Visitas">
            <div className="text-3xl font-bold text-blue-600">{totalVisitas.toLocaleString()}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Vistas del sitio</p>
          </ComponentCard>

          <ComponentCard title="Modalidades">
            <div className="text-3xl font-bold text-purple-600">3</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tipos disponibles</p>
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
                placeholder="Buscar por nombre, código o coordinador..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
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

            <div>
              <Label>Filtrar por Estado</Label>
              <ControlledSelect
                options={estadoOptions}
                placeholder="Seleccionar estado"
                value={filtroEstado}
                onChange={(value) => setFiltroEstado(value)}
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
          {carrerasFiltradas.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200 dark:border-white/[0.05]">
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Carrera
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Información
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Coordinador
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Visitas
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Estado
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {carrerasFiltradas.map((carrera) => (
                    <TableRow key={carrera.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div>
                          <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {carrera.nombre}
                          </div>
                          <div className="text-xs text-primary font-medium">
                            {carrera.codigo}
                          </div>
                          {carrera.descripcion && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs truncate">
                              {carrera.descripcion}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="font-medium">Modalidad:</span> {carrera.modalidad}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Duración:</span> {carrera.duracion}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Créditos:</span> {carrera.creditos}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="font-medium">
                          {carrera.coordinador}
                        </div>
                        <div className="text-xs text-gray-400">
                          Desde {new Date(carrera.fechaCreacion).getFullYear()}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="font-medium text-blue-600">
                          {carrera.visitas?.toLocaleString() || 0}
                        </div>
                        <div className="text-xs text-gray-400">
                          vistas del sitio
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <Badge 
                          color={carrera.estado === 'Activa' ? 'success' : 
                                  carrera.estado === 'Inactiva' ? 'error' : 'warning'}
                        >
                          {carrera.estado}
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
                            <svg className="w-4 h-4 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Estás seguro de eliminar esta carrera?')) {
                                setCarreras(carreras.filter(c => c.id !== carrera.id));
                              }
                            }}
                            className="inline-flex items-center px-2 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Eliminar carrera"
                          >
                            <svg className="w-4 h-4 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">No se encontraron carreras</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Intenta ajustar los filtros de búsqueda.
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
            onGuardar={(nuevaCarrera) => {
              if (editando) {
                setCarreras(carreras.map(c => c.id === editando.id ? nuevaCarrera : c));
              } else {
                setCarreras([...carreras, { ...nuevaCarrera, id: Date.now() }]);
              }
              setModalAbierto(false);
              setEditando(null);
            }}
            modalidadOptions={modalidadOptions.filter(m => m.value !== "")}
            coordinadoresOptions={coordinadoresOptions}
          />
        )}
      </div>
    </>
  );
}

// Modal Component
interface ModalCarreraProps {
  carrera: CarreraData | null;
  onCerrar: () => void;
  onGuardar: (carrera: CarreraData) => void;
  modalidadOptions: { value: string; label: string }[];
  coordinadoresOptions: { value: string; label: string }[];
}

function ModalCarrera({ carrera, onCerrar, onGuardar, modalidadOptions, coordinadoresOptions }: ModalCarreraProps) {
  const [formData, setFormData] = useState<CarreraData>(
    carrera || {
      id: 0,
      nombre: '',
      codigo: '',
      modalidad: '',
      duracion: '',
      creditos: 0,
      coordinador: '',
      fechaCreacion: new Date().toISOString().split('T')[0],
      estado: 'En Revision',
      descripcion: '',
      visitas: 0
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-24">
      <div className="w-full max-w-4xl max-h-[calc(100vh-10rem)] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {carrera ? 'Editar Carrera' : 'Nueva Carrera / Programa Educativo'}
            </h2>
            <button
              type="button"
              onClick={onCerrar}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                  placeholder="Ej: Ingeniería en Sistemas Computacionales"
                />
              </div>

              <div>
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  type="text"
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                  placeholder="Ej: ISC, IMT, IGE"
                />
              </div>

              <div>
                <Label>Modalidad *</Label>
                <ControlledSelect
                  options={modalidadOptions}
                  placeholder="Seleccionar modalidad"
                  value={formData.modalidad}
                  onChange={(value) => setFormData({ ...formData, modalidad: value })}
                />
              </div>

              <div>
                <Label htmlFor="duracion">Duración *</Label>
                <Input
                  type="text"
                  id="duracion"
                  value={formData.duracion}
                  onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                  placeholder="Ej: 9 cuatrimestres, 8 semestres"
                />
              </div>

              <div>
                <Label htmlFor="creditos">Créditos Totales *</Label>
                <Input
                  type="number"
                  id="creditos"
                  value={formData.creditos}
                  onChange={(e) => setFormData({ ...formData, creditos: parseInt(e.target.value) || 0 })}
                  placeholder="240"
                  min="1"
                />
              </div>

              <div>
                <Label>Coordinador *</Label>
                <ControlledSelect
                  options={coordinadoresOptions}
                  placeholder="Seleccionar coordinador"
                  value={formData.coordinador}
                  onChange={(value) => setFormData({ ...formData, coordinador: value })}
                />
              </div>

              <div>
                <Label htmlFor="fechaCreacion">Fecha de Creación *</Label>
                <Input
                  type="date"
                  id="fechaCreacion"
                  value={formData.fechaCreacion}
                  onChange={(e) => setFormData({ ...formData, fechaCreacion: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="visitas">Visitas del Sitio</Label>
                <Input
                  type="number"
                  id="visitas"
                  value={formData.visitas || 0}
                  onChange={(e) => setFormData({ ...formData, visitas: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <textarea
                  id="descripcion"
                  rows={3}
                  value={formData.descripcion || ''}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción breve de la carrera..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 bg-indigo-500"
              >
                {carrera ? 'Actualizar' : 'Crear Carrera'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}