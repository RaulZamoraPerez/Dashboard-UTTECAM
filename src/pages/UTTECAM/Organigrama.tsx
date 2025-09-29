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

interface PersonalData {
  id: number;
  nombre: string;
  cargo: string;
  departamento: string;
  email: string;
  telefono: string;
  foto?: string;
  activo: boolean;
}

export default function Organigrama() {
  const [personal, setPersonal] = useState<PersonalData[]>([
    {
      id: 1,
      nombre: "Dr. Juan Carlos Pérez",
      cargo: "Rector",
      departamento: "Rectoría",
      email: "rector@uttecam.edu.mx",
      telefono: "961-123-4567",
      foto: "/images/user/user-01.png",
      activo: true
    },
    {
      id: 2,
      nombre: "Ing. María González",
      cargo: "Secretaria Académica",
      departamento: "Secretaría Académica",
      email: "academica@uttecam.edu.mx",
      telefono: "961-123-4568",
      foto: "/images/user/user-02.png",
      activo: true
    },
    {
      id: 3,
      nombre: "Lic. Roberto Hernández",
      cargo: "Director de Administración",
      departamento: "Administración",
      email: "admin@uttecam.edu.mx",
      telefono: "961-123-4569",
      foto: "/images/user/user-03.png",
      activo: true
    },
    {
      id: 4,
      nombre: "Ing. Laura Morales",
      cargo: "Coordinadora de Sistemas",
      departamento: "Sistemas y Computación",
      email: "sistemas@uttecam.edu.mx",
      telefono: "961-123-4570",
      foto: "/images/user/user-04.png",
      activo: false
    }
  ]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<PersonalData | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const departamentosOptions = [
    { value: "Rectoría", label: "Rectoría" },
    { value: "Secretaría Académica", label: "Secretaría Académica" },
    { value: "Administración", label: "Administración" },
    { value: "Sistemas y Computación", label: "Sistemas y Computación" },
    { value: "Mecatrónica", label: "Mecatrónica" },
    { value: "Gestión Empresarial", label: "Gestión Empresarial" },
    { value: "Recursos Humanos", label: "Recursos Humanos" },
    { value: "Servicios Escolares", label: "Servicios Escolares" },
  ];

  const personalFiltrado = personal.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.cargo.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.departamento.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleEliminar = (id: number) => {
    if (confirm('¿Está seguro de eliminar este registro?')) {
      setPersonal(personal.filter(p => p.id !== id));
    }
  };

  const toggleActivo = (id: number) => {
    setPersonal(personal.map(p => 
      p.id === id ? { ...p, activo: !p.activo } : p
    ));
  };

  return (
    <>
      <PageMeta
        title="Gestión de Organigrama - UTTECAM Admin"
        description="Gestión del organigrama institucional de UTTECAM"
      />
      <PageBreadcrumb pageTitle="Organigrama Institucional - UTTECAM" />
      
      <div className="space-y-6">
        {/* Filtros y Acciones */}
        <ComponentCard title="Gestión de Personal Directivo">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1">
              <Label htmlFor="busqueda">Buscar Personal</Label>
              <Input
                type="text"
                id="busqueda"
                placeholder="Buscar por nombre, cargo o departamento..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditando(null);
                  setModalAbierto(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Personal
              </button>
            </div>
          </div>
        </ComponentCard>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ComponentCard title="Total Personal">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-primary">{personal.length}</div>
              <div className="rounded-full bg-primary/10 p-2">
                <svg className="size-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Personal Activo">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-success">{personal.filter(p => p.activo).length}</div>
              <div className="rounded-full bg-success/10 p-2">
                <svg className="size-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Personal Inactivo">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-warning">{personal.filter(p => !p.activo).length}</div>
              <div className="rounded-full bg-warning/10 p-2">
                <svg className="size-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Departamentos">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-info">{departamentosOptions.length}</div>
              <div className="rounded-full bg-info/10 p-2">
                <svg className="size-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* Tabla de Personal */}
        <ComponentCard title={`Lista de Personal (${personalFiltrado.length})`}>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Personal
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Cargo
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Departamento
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Contacto
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Estado
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {personalFiltrado.map((persona) => (
                    <TableRow key={persona.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 overflow-hidden rounded-full">
                            <img
                              width={40}
                              height={40}
                              src={persona.foto || "/images/user/user-01.png"}
                              alt={persona.nombre}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {persona.nombre}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {persona.cargo}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {persona.departamento}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div>
                          <div className="text-sm font-medium">{persona.email}</div>
                          <div className="text-xs text-gray-400">{persona.telefono}</div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Badge
                          size="sm"
                          color={persona.activo ? "success" : "warning"}
                        >
                          {persona.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditando(persona);
                              setModalAbierto(true);
                            }}
                            className="rounded p-1 text-primary hover:bg-primary/10"
                            title="Editar"
                          >
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => toggleActivo(persona.id)}
                            className={`rounded p-1 hover:bg-opacity-10 ${persona.activo ? 'text-warning hover:bg-warning/10' : 'text-success hover:bg-success/10'}`}
                            title={persona.activo ? "Desactivar" : "Activar"}
                          >
                            {persona.activo ? (
                              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                              </svg>
                            ) : (
                              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => handleEliminar(persona.id)}
                            className="rounded p-1 text-error hover:bg-error/10"
                            title="Eliminar"
                          >
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          </div>
        </ComponentCard>

        {/* Modal para Agregar/Editar */}
        {modalAbierto && (
          <ModalPersonal
            persona={editando}
            onCerrar={() => {
              setModalAbierto(false);
              setEditando(null);
            }}
            onGuardar={(nuevoPersonal) => {
              if (editando) {
                setPersonal(personal.map(p => p.id === editando.id ? nuevoPersonal : p));
              } else {
                setPersonal([...personal, { ...nuevoPersonal, id: Date.now() }]);
              }
              setModalAbierto(false);
              setEditando(null);
            }}
            departamentosOptions={departamentosOptions}
          />
        )}
      </div>
    </>
  );
}

// Modal Component
interface ModalPersonalProps {
  persona: PersonalData | null;
  onCerrar: () => void;
  onGuardar: (personal: PersonalData) => void;
  departamentosOptions: { value: string; label: string }[];
}

function ModalPersonal({ persona, onCerrar, onGuardar, departamentosOptions }: ModalPersonalProps) {
  const [formData, setFormData] = useState<PersonalData>(
    persona || {
      id: 0,
      nombre: '',
      cargo: '',
      departamento: '',
      email: '',
      telefono: '',
      foto: '',
      activo: true
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-24">
      <div className="w-full max-w-2xl max-h-[calc(100vh-10rem)] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {persona ? 'Editar Personal' : 'Agregar Personal'}
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
              <div>
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  type="text"
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ingrese el nombre completo"
                />
              </div>

              <div>
                <Label htmlFor="cargo">Cargo *</Label>
                <Input
                  type="text"
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  placeholder="Ej: Director, Coordinador"
                />
              </div>

              <div>
                <Label>Departamento *</Label>
                <ControlledSelect
                  options={departamentosOptions}
                  placeholder="Seleccionar departamento"
                  value={formData.departamento}
                  onChange={(value) => setFormData({ ...formData, departamento: value })}
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="correo@uttecam.edu.mx"
                />
              </div>

              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  type="tel"
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="961-123-4567"
                />
              </div>

              <div>
                <Label htmlFor="foto">URL de Foto</Label>
                <Input
                  type="url"
                  id="foto"
                  value={formData.foto || ''}
                  onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
                  placeholder="https://ejemplo.com/foto.jpg"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="activo">Personal activo</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                {persona ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}