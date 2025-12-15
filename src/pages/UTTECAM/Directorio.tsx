import { useState } from "react";
import { confirmDialog, toastSuccess } from '../../utils/alert';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import ControlledSelect from "../../components/form/ControlledSelect";

interface DirectorioData {
  id: number;
  nombre: string;
  puesto: string;
  area: string;
  email: string;
  telefono: string;
  extension?: string;
  ubicacion: string;
  horario: string;
  foto?: string;
  activo: boolean;
}

export default function Directorio() {
  const [directorio, setDirectorio] = useState<DirectorioData[]>([
    {
      id: 1,
      nombre: "Dr. Juan Carlos Pérez",
      puesto: "Rector",
      area: "Rectoría",
      email: "rector@uttecam.edu.mx",
      telefono: "961-123-4567",
      extension: "1001",
      ubicacion: "Edificio Administrativo - Planta Alta",
      horario: "Lunes a Viernes 8:00-16:00",
      foto: "/images/user/user-01.png",
      activo: true
    },
    {
      id: 2,
      nombre: "Ing. María González",
      puesto: "Secretaria Académica",
      area: "Secretaría Académica",
      email: "academica@uttecam.edu.mx",
      telefono: "961-123-4568",
      extension: "1002",
      ubicacion: "Edificio Administrativo - Planta Baja",
      horario: "Lunes a Viernes 8:00-16:00",
      foto: "/images/user/user-02.png",
      activo: true
    },
    {
      id: 3,
      nombre: "Lic. Roberto Hernández",
      puesto: "Director de Administración",
      area: "Administración",
      email: "admin@uttecam.edu.mx",
      telefono: "961-123-4569",
      extension: "1003",
      ubicacion: "Edificio Administrativo - 2do Piso",
      horario: "Lunes a Viernes 8:00-15:00",
      foto: "/images/user/user-03.png",
      activo: true
    },
    {
      id: 4,
      nombre: "Ing. Laura Morales",
      puesto: "Coordinadora de Sistemas",
      area: "Sistemas y Computación",
      email: "sistemas@uttecam.edu.mx",
      telefono: "961-123-4570",
      extension: "2001",
      ubicacion: "Centro de Cómputo",
      horario: "Lunes a Viernes 7:00-15:00",
      foto: "/images/user/user-04.png",
      activo: true
    },
    {
      id: 5,
      nombre: "Ing. Carlos Ruiz",
      puesto: "Coordinador de Mecatrónica",
      area: "Mecatrónica",
      email: "mecatronica@uttecam.edu.mx",
      telefono: "961-123-4571",
      extension: "3001",
      ubicacion: "Laboratorio de Mecatrónica",
      horario: "Lunes a Viernes 7:30-15:30",
      foto: "/images/user/user-05.png",
      activo: true
    },
    {
      id: 6,
      nombre: "Lic. Ana Patricia Vázquez",
      puesto: "Jefa de Servicios Escolares",
      area: "Servicios Escolares",
      email: "escolares@uttecam.edu.mx",
      telefono: "961-123-4572",
      extension: "1004",
      ubicacion: "Edificio Administrativo - Planta Baja",
      horario: "Lunes a Viernes 8:00-16:00",
      foto: "/images/user/user-06.png",
      activo: false
    }
  ]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<DirectorioData | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroArea, setFiltroArea] = useState("");

  const areasOptions = [
    { value: "", label: "Todas las áreas" },
    { value: "Rectoría", label: "Rectoría" },
    { value: "Secretaría Académica", label: "Secretaría Académica" },
    { value: "Administración", label: "Administración" },
    { value: "Sistemas y Computación", label: "Sistemas y Computación" },
    { value: "Mecatrónica", label: "Mecatrónica" },
    { value: "Gestión Empresarial", label: "Gestión Empresarial" },
    { value: "Servicios Escolares", label: "Servicios Escolares" },
    { value: "Recursos Humanos", label: "Recursos Humanos" },
    { value: "Biblioteca", label: "Biblioteca" },
    { value: "Mantenimiento", label: "Mantenimiento" },
  ];

  const ubicacionesOptions = [
    { value: "Edificio Administrativo - Planta Alta", label: "Edificio Administrativo - Planta Alta" },
    { value: "Edificio Administrativo - Planta Baja", label: "Edificio Administrativo - Planta Baja" },
    { value: "Edificio Administrativo - 2do Piso", label: "Edificio Administrativo - 2do Piso" },
    { value: "Centro de Cómputo", label: "Centro de Cómputo" },
    { value: "Laboratorio de Mecatrónica", label: "Laboratorio de Mecatrónica" },
    { value: "Laboratorio de Sistemas", label: "Laboratorio de Sistemas" },
    { value: "Biblioteca", label: "Biblioteca" },
    { value: "Cafetería", label: "Cafetería" },
    { value: "Área de Mantenimiento", label: "Área de Mantenimiento" },
  ];

  const directorioFiltrado = directorio.filter(d => {
    const coincideBusqueda = d.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      d.puesto.toLowerCase().includes(busqueda.toLowerCase()) ||
      d.area.toLowerCase().includes(busqueda.toLowerCase()) ||
      d.email.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideArea = filtroArea === "" || d.area === filtroArea;
    
    return coincideBusqueda && coincideArea;
  });

  const handleEliminar = async (id: number) => {
    const confirmed = await confirmDialog({ title: 'Eliminar registro', text: '¿Está seguro de eliminar este registro del directorio?' });
    if (!confirmed) return;
    setDirectorio(directorio.filter(d => d.id !== id));
    toastSuccess('Registro eliminado del directorio');
  };

  const toggleActivo = (id: number) => {
    setDirectorio(directorio.map(d => 
      d.id === id ? { ...d, activo: !d.activo } : d
    ));
  };

  return (
    <>
      <PageMeta
        title="Directorio Institucional - UTTECAM Admin"
        description="Directorio completo del personal de UTTECAM"
      />
      <PageBreadcrumb pageTitle="Directorio Institucional - UTTECAM" />
      
      <div className="space-y-6">
        {/* Filtros y Acciones */}
        <ComponentCard title="Gestión de Directorio Institucional">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label htmlFor="busqueda">Buscar Personal</Label>
                <Input
                  type="text"
                  id="busqueda"
                  placeholder="Buscar por nombre, puesto, área o email..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              
              <div>
                <Label>Filtrar por Área</Label>
                <ControlledSelect
                  options={areasOptions}
                  placeholder="Seleccionar área"
                  value={filtroArea}
                  onChange={(value) => setFiltroArea(value)}
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setEditando(null);
                    setModalAbierto(true);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
                >
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar Contacto
                </button>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ComponentCard title="Total Contactos">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-primary dark:text-white">{directorio.length}</div>
              <div className="rounded-full bg-primary/10 p-2">
                <svg className="size-6 text-primary dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Personal Activo">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-success dark:text-white">{directorio.filter(d => d.activo).length}</div>
              <div className="rounded-full bg-success/10 p-2">
                <svg className="size-6 text-success dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Áreas Registradas">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-info dark:text-white">{[...new Set(directorio.map(d => d.area))].length}</div>
              <div className="rounded-full bg-info/10 p-2">
                <svg className="size-6 text-info dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Con Extensión">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-warning dark:text-white">{directorio.filter(d => d.extension).length}</div>
              <div className="rounded-full bg-warning/10 p-2">
                <svg className="size-6 text-warning dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* Lista de Contactos */}
        <ComponentCard title={`Directorio Institucional (${directorioFiltrado.length} contactos)`}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {directorioFiltrado.map((contacto) => (
              <div
                key={contacto.id}
                className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 overflow-hidden rounded-full">
                      <img
                        width={64}
                        height={64}
                        src={contacto.foto || "/images/user/user-01.png"}
                        alt={contacto.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {contacto.nombre}
                      </h3>
                      <p className="text-sm text-primary font-medium">
                        {contacto.puesto}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {contacto.area}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge
                      size="sm"
                      color={contacto.activo ? "success" : "warning"}
                    >
                      {contacto.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <svg className="size-4 flex-shrink-0 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <a
                      href={`mailto:${contacto.email}`}
                      className="hover:text-primary transition-colors"
                    >
                      {contacto.email}
                    </a>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <svg className="size-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>
                      {contacto.telefono}
                      {contacto.extension && <span className="text-primary font-medium"> ext. {contacto.extension}</span>}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <svg className="size-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs">{contacto.ubicacion}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <svg className="size-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs">{contacto.horario}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditando(contacto);
                        setModalAbierto(true);
                      }}
                      className="rounded p-1.5 text-primary hover:bg-primary/10"
                      title="Editar contacto"
                    >
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => toggleActivo(contacto.id)}
                      className={`rounded p-1.5 hover:bg-opacity-10 ${contacto.activo ? 'text-warning hover:bg-warning/10' : 'text-success hover:bg-success/10'}`}
                      title={contacto.activo ? "Desactivar" : "Activar"}
                    >
                      {contacto.activo ? (
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
                      onClick={() => handleEliminar(contacto.id)}
                      className="rounded p-1.5 text-error hover:bg-error/10"
                      title="Eliminar contacto"
                    >
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${contacto.telefono}`}
                      className="rounded p-1.5 text-success hover:bg-success/10"
                      title="Llamar"
                    >
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </a>
                    <a
                      href={`mailto:${contacto.email}`}
                      className="rounded p-1.5 text-info hover:bg-info/10"
                      title="Enviar email"
                    >
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {directorioFiltrado.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full dark:bg-gray-800">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">No se encontraron contactos</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Intenta ajustar los filtros de búsqueda.
              </p>
            </div>
          )}
        </ComponentCard>

        {/* Modal para Agregar/Editar */}
        {modalAbierto && (
          <ModalDirectorio
            contacto={editando}
            onCerrar={() => {
              setModalAbierto(false);
              setEditando(null);
            }}
            onGuardar={(nuevoContacto) => {
              if (editando) {
                setDirectorio(directorio.map(d => d.id === editando.id ? nuevoContacto : d));
              } else {
                setDirectorio([...directorio, { ...nuevoContacto, id: Date.now() }]);
              }
              setModalAbierto(false);
              setEditando(null);
            }}
            areasOptions={areasOptions.filter(a => a.value !== "")}
            ubicacionesOptions={ubicacionesOptions}
          />
        )}
      </div>
    </>
  );
}

// Modal Component
interface ModalDirectorioProps {
  contacto: DirectorioData | null;
  onCerrar: () => void;
  onGuardar: (contacto: DirectorioData) => void;
  areasOptions: { value: string; label: string }[];
  ubicacionesOptions: { value: string; label: string }[];
}

function ModalDirectorio({ contacto, onCerrar, onGuardar, areasOptions, ubicacionesOptions }: ModalDirectorioProps) {
  const [formData, setFormData] = useState<DirectorioData>(
    contacto || {
      id: 0,
      nombre: '',
      puesto: '',
      area: '',
      email: '',
      telefono: '',
      extension: '',
      ubicacion: '',
      horario: '',
      foto: '',
      activo: true
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar(formData);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-start justify-center bg-black/50 p-4 pt-24">
      <div className="w-full max-w-4xl max-h-[calc(100vh-10rem)] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {contacto ? 'Editar Contacto' : 'Agregar Contacto al Directorio'}
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
                <Label htmlFor="puesto">Puesto *</Label>
                <Input
                  type="text"
                  id="puesto"
                  value={formData.puesto}
                  onChange={(e) => setFormData({ ...formData, puesto: e.target.value })}
                  
                  placeholder="Ej: Director, Coordinador, Jefe"
                />
              </div>

              <div>
                <Label>Área *</Label>
                <ControlledSelect
                  options={areasOptions}
                  placeholder="Seleccionar área"
                  value={formData.area}
                  onChange={(value) => setFormData({ ...formData, area: value })}
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
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  type="tel"
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                
                  placeholder="961-123-4567"
                />
              </div>

              <div>
                <Label htmlFor="extension">Extensión</Label>
                <Input
                  type="text"
                  id="extension"
                  value={formData.extension || ''}
                  onChange={(e) => setFormData({ ...formData, extension: e.target.value })}
                  placeholder="1001"
                />
              </div>

              <div className="sm:col-span-2">
                <Label>Ubicación *</Label>
                <ControlledSelect
                  options={ubicacionesOptions}
                  placeholder="Seleccionar ubicación"
                  value={formData.ubicacion}
                  onChange={(value) => setFormData({ ...formData, ubicacion: value })}
                />
              </div>

              <div>
                <Label htmlFor="horario">Horario de Atención *</Label>
                <Input
                  type="text"
                  id="horario"
                  value={formData.horario}
                  onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                 
                  placeholder="Lunes a Viernes 8:00-16:00"
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
              <Label htmlFor="activo">Contacto activo en el directorio</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                {contacto ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}