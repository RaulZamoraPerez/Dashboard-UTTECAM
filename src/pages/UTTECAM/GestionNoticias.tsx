import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import ControlledSelect from "../../components/form/ControlledSelect";

interface NoticiaData {
  id: number;
  titulo: string;
  resumen: string;
  contenido: string;
  categoria: string;
  autor: string;
  fechaCreacion: string;
  fechaPublicacion?: string;
  estado: 'Borrador' | 'Publicada' | 'Archivada';
  destacada: boolean;
  imagenUrl?: string;
  visitas: number;
  tags: string[];
}

export default function GestionNoticias() {
  const [noticias, setNoticias] = useState<NoticiaData[]>([
    {
      id: 1,
      titulo: "Inauguración del nuevo laboratorio de Mecatrónica",
      resumen: "UTTECAM inaugura modernas instalaciones para el programa de Mecatrónica con tecnología de punta.",
      contenido: "La Universidad Tecnológica de la Selva (UTTECAM) inauguró oficialmente el nuevo laboratorio de Mecatrónica...",
      categoria: "Infraestructura",
      autor: "Dr. Juan Carlos Pérez",
      fechaCreacion: "2024-01-15",
      fechaPublicacion: "2024-01-16",
      estado: "Publicada",
      destacada: true,
      imagenUrl: "/images/news/lab-mecatronica.jpg",
      visitas: 245,
      tags: ["mecatrónica", "laboratorio", "tecnología"]
    },
    {
      id: 2,
      titulo: "Convocatoria de becas para el cuatrimestre septiembre-diciembre 2024",
      resumen: "Abierta la convocatoria para becas de excelencia académica y apoyo económico para estudiantes.",
      contenido: "La UTTECAM anuncia la apertura de la convocatoria de becas para el período académico...",
      categoria: "Becas",
      autor: "Lic. María González",
      fechaCreacion: "2024-01-12",
      fechaPublicacion: "2024-01-13",
      estado: "Publicada",
      destacada: true,
      imagenUrl: "/images/news/becas-2024.jpg",
      visitas: 180,
      tags: ["becas", "estudiantes", "apoyo económico"]
    },
    {
      id: 3,
      titulo: "Firma de convenio con empresas locales para prácticas profesionales",
      resumen: "UTTECAM establece alianzas estratégicas con el sector empresarial de la región.",
      contenido: "En una ceremonia realizada en el auditorio principal, se firmaron convenios de colaboración...",
      categoria: "Vinculación",
      autor: "Ing. Roberto Hernández",
      fechaCreacion: "2024-01-10",
      fechaPublicacion: "2024-01-11",
      estado: "Publicada",
      destacada: false,
      imagenUrl: "/images/news/convenio-empresas.jpg",
      visitas: 95,
      tags: ["convenio", "empresas", "prácticas profesionales"]
    },
    {
      id: 4,
      titulo: "Proceso de reinscripciones cuatrimestre mayo-agosto 2024",
      resumen: "Información importante sobre fechas y requisitos para el proceso de reinscripciones.",
      contenido: "La Secretaría Académica informa a la comunidad estudiantil sobre el proceso de reinscripciones...",
      categoria: "Servicios Escolares",
      autor: "Lic. Ana Patricia Vázquez",
      fechaCreacion: "2024-01-08",
      estado: "Borrador",
      destacada: false,
      visitas: 0,
      tags: ["reinscripciones", "servicios escolares", "estudiantes"]
    },
    {
      id: 5,
      titulo: "Ganadores del concurso de innovación tecnológica",
      resumen: "Estudiantes de UTTECAM destacan en competencia regional de proyectos tecnológicos.",
      contenido: "Los estudiantes de la carrera de Sistemas Computacionales obtuvieron el primer lugar...",
      categoria: "Reconocimientos",
      autor: "Ing. Laura Morales",
      fechaCreacion: "2024-01-05",
      fechaPublicacion: "2024-01-06",
      estado: "Archivada",
      destacada: false,
      imagenUrl: "/images/news/concurso-innovacion.jpg",
      visitas: 156,
      tags: ["concurso", "innovación", "estudiantes", "tecnología"]
    }
  ]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<NoticiaData | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [vista, setVista] = useState<'tarjetas' | 'lista'>('tarjetas');

  const categoriaOptions = [
    { value: "", label: "Todas las categorías" },
    { value: "Infraestructura", label: "Infraestructura" },
    { value: "Becas", label: "Becas" },
    { value: "Vinculación", label: "Vinculación" },
    { value: "Servicios Escolares", label: "Servicios Escolares" },
    { value: "Reconocimientos", label: "Reconocimientos" },
    { value: "Eventos", label: "Eventos" },
    { value: "Académico", label: "Académico" },
    { value: "Deportes", label: "Deportes" },
    { value: "Cultural", label: "Cultural" },
  ];

  const estadoOptions = [
    { value: "", label: "Todos los estados" },
    { value: "Borrador", label: "Borrador" },
    { value: "Publicada", label: "Publicada" },
    { value: "Archivada", label: "Archivada" },
  ];

  const autoresOptions = [
    { value: "Dr. Juan Carlos Pérez", label: "Dr. Juan Carlos Pérez" },
    { value: "Lic. María González", label: "Lic. María González" },
    { value: "Ing. Roberto Hernández", label: "Ing. Roberto Hernández" },
    { value: "Lic. Ana Patricia Vázquez", label: "Lic. Ana Patricia Vázquez" },
    { value: "Ing. Laura Morales", label: "Ing. Laura Morales" },
    { value: "Ing. Carlos Ruiz", label: "Ing. Carlos Ruiz" },
  ];

  const noticiasFiltradas = noticias.filter(n => {
    const coincideBusqueda = n.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      n.resumen.toLowerCase().includes(busqueda.toLowerCase()) ||
      n.autor.toLowerCase().includes(busqueda.toLowerCase()) ||
      n.tags.some(tag => tag.toLowerCase().includes(busqueda.toLowerCase()));
    
    const coincideCategoria = filtroCategoria === "" || n.categoria === filtroCategoria;
    const coincideEstado = filtroEstado === "" || n.estado === filtroEstado;
    
    return coincideBusqueda && coincideCategoria && coincideEstado;
  });

  const handleEliminar = (id: number) => {
    if (confirm('¿Está seguro de eliminar esta noticia? Esta acción no se puede deshacer.')) {
      setNoticias(noticias.filter(n => n.id !== id));
    }
  };

  const cambiarEstado = (id: number, nuevoEstado: 'Borrador' | 'Publicada' | 'Archivada') => {
    const fechaActual = new Date().toISOString().split('T')[0];
    setNoticias(noticias.map(n => 
      n.id === id ? { 
        ...n, 
        estado: nuevoEstado,
        fechaPublicacion: nuevoEstado === 'Publicada' && !n.fechaPublicacion ? fechaActual : n.fechaPublicacion
      } : n
    ));
  };

  const toggleDestacada = (id: number) => {
    setNoticias(noticias.map(n => 
      n.id === id ? { ...n, destacada: !n.destacada } : n
    ));
  };

  const totalVisitas = noticias.reduce((total, n) => total + n.visitas, 0);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <PageMeta
        title="Gestión de Noticias - UTTECAM Admin"
        description="Administración de noticias y comunicados de UTTECAM"
      />
      <PageBreadcrumb pageTitle="Gestión de Noticias UTTECAM" />
      
      <div className="space-y-6">
        {/* Panel de Control */}
        <ComponentCard title="Panel de Control de Noticias">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="busqueda">Buscar Noticias</Label>
                <Input
                  type="text"
                  id="busqueda"
                  placeholder="Buscar por título, resumen, autor o tags..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              
              <div>
                <Label>Filtrar por Categoría</Label>
                <ControlledSelect
                  options={categoriaOptions}
                  placeholder="Seleccionar categoría"
                  value={filtroCategoria}
                  onChange={(value) => setFiltroCategoria(value)}
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
              
              <div className="flex items-end gap-2">
                <button
                  onClick={() => {
                    setEditando(null);
                    setModalAbierto(true);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
                >
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nueva Noticia
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label>Vista:</Label>
                <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
                  <button
                    onClick={() => setVista('tarjetas')}
                    className={`px-3 py-1 text-sm rounded-l-lg ${vista === 'tarjetas' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                  >
                    Tarjetas
                  </button>
                  <button
                    onClick={() => setVista('lista')}
                    className={`px-3 py-1 text-sm rounded-r-lg ${vista === 'lista' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                  >
                    Lista
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ComponentCard title="Total Noticias">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-primary dark:text-white">{noticias.length}</div>
              <div className="rounded-full bg-primary/10 p-2">
                <svg className="size-6 text-primary dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Noticias Publicadas">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-success dark:text-white">{noticias.filter(n => n.estado === 'Publicada').length}</div>
              <div className="rounded-full bg-success/10 p-2">
                <svg className="size-6 text-success dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Borradores">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-warning dark:text-white">{noticias.filter(n => n.estado === 'Borrador').length}</div>
              <div className="rounded-full bg-warning/10 p-2">
                <svg className="size-6 text-warning dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Total Visitas">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-info dark:text-white">{totalVisitas}</div>
              <div className="rounded-full bg-info/10 p-2">
                <svg className="size-6 text-info dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* Lista de Noticias */}
        <ComponentCard title={`Noticias (${noticiasFiltradas.length})`}>
          {vista === 'tarjetas' ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {noticiasFiltradas.map((noticia) => (
                <div
                  key={noticia.id}
                  className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-white/[0.05] dark:bg-white/[0.03]"
                >
                  {noticia.imagenUrl && (
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={noticia.imagenUrl}
                        alt={noticia.titulo}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          size="sm"
                          color={
                            noticia.estado === 'Publicada' ? 'success' : 
                            noticia.estado === 'Borrador' ? 'warning' : 
                            'error'
                          }
                        >
                          {noticia.estado}
                        </Badge>
                        <Badge size="sm" color="info">
                          {noticia.categoria}
                        </Badge>
                        {noticia.destacada && (
                          <Badge size="sm" color="warning">
                            ⭐ Destacada
                          </Badge>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {noticia.titulo}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {noticia.resumen}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {noticia.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                      {noticia.tags.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{noticia.tags.length - 3} más
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center justify-between">
                        <span>Por: {noticia.autor}</span>
                        <span>{noticia.visitas} visitas</span>
                      </div>
                      <div>
                        Creado: {formatearFecha(noticia.fechaCreacion)}
                      </div>
                      {noticia.fechaPublicacion && (
                        <div>
                          Publicado: {formatearFecha(noticia.fechaPublicacion)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/[0.05]">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditando(noticia);
                            setModalAbierto(true);
                          }}
                          className="rounded p-1.5 text-primary hover:bg-primary/10"
                          title="Editar noticia"
                        >
                          <svg className="size-4 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => toggleDestacada(noticia.id)}
                          className={`rounded p-1.5 ${noticia.destacada ? 'text-warning hover:bg-warning/10' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                          title={noticia.destacada ? "Quitar destacado" : "Marcar como destacada"}
                        >
                          <svg className="size-4 dark:text-white" fill={noticia.destacada ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleEliminar(noticia.id)}
                          className="rounded p-1.5 text-error hover:bg-error/10"
                          title="Eliminar noticia"
                        >
                          <svg className="size-4 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                        {/**Publicar */}
                      <div className="flex items-center gap-1 dark:text-white">
                        <button
                          onClick={() => cambiarEstado(noticia.id, noticia.estado === 'Publicada' ? 'Borrador' : 'Publicada')}
                          className={`px-3 py-1 text-xs rounded-full ${
                            noticia.estado === 'Publicada' 
                              ? 'bg-warning text-warning-foreground hover:bg-warning/90' 
                              : 'bg-success text-success-foreground hover:bg-success/90'
                          }`}
                        >
                          {noticia.estado === 'Publicada' ? 'Despublicar' : 'Publicar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {noticiasFiltradas.map((noticia) => (
                <div
                  key={noticia.id}
                  className="flex gap-4 p-4 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]"
                >
                  {noticia.imagenUrl && (
                    <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={noticia.imagenUrl}
                        alt={noticia.titulo}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            size="sm"
                            color={
                              noticia.estado === 'Publicada' ? 'success' : 
                              noticia.estado === 'Borrador' ? 'warning' : 
                              'error'
                            }
                          >
                            {noticia.estado}
                          </Badge>
                          <Badge size="sm" color="info">
                            {noticia.categoria}
                          </Badge>
                          {noticia.destacada && (
                            <Badge size="sm" color="warning">
                              ⭐ Destacada
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                          {noticia.titulo}
                        </h3>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {noticia.resumen}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>Por: {noticia.autor}</span>
                          <span>{noticia.visitas} visitas</span>
                          <span>{formatearFecha(noticia.fechaCreacion)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            setEditando(noticia);
                            setModalAbierto(true);
                          }}
                          className="rounded p-1.5 text-primary hover:bg-primary/10"
                          title="Editar"
                        >
                          <svg className="size-4 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => cambiarEstado(noticia.id, noticia.estado === 'Publicada' ? 'Borrador' : 'Publicada')}
                          className={`px-3 py-1 text-xs  rounded-full ${
                            noticia.estado === 'Publicada' 
                              ? 'bg-warning text-warning-foreground hover:bg-warning/90' 
                              : 'bg-success text-success-foreground hover:bg-success/90'
                          }`}
                        >
                          {noticia.estado === 'Publicada' ? 'Despublicar' : 'Publicar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {noticiasFiltradas.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full dark:bg-gray-800">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">No se encontraron noticias</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Intenta ajustar los filtros de búsqueda.
              </p>
            </div>
          )}
        </ComponentCard>

        {/* Modal para Agregar/Editar */}
        {modalAbierto && (
          <ModalNoticia
            noticia={editando}
            onCerrar={() => {
              setModalAbierto(false);
              setEditando(null);
            }}
            onGuardar={(nuevaNoticia) => {
              if (editando) {
                setNoticias(noticias.map(n => n.id === editando.id ? nuevaNoticia : n));
              } else {
                setNoticias([...noticias, { ...nuevaNoticia, id: Date.now(), visitas: 0 }]);
              }
              setModalAbierto(false);
              setEditando(null);
            }}
            categoriaOptions={categoriaOptions.filter(c => c.value !== "")}
            autoresOptions={autoresOptions}
          />
        )}
      </div>
    </>
  );
}

// Modal Component
interface ModalNoticiaProps {
  noticia: NoticiaData | null;
  onCerrar: () => void;
  onGuardar: (noticia: NoticiaData) => void;
  categoriaOptions: { value: string; label: string }[];
  autoresOptions: { value: string; label: string }[];
}

function ModalNoticia({ noticia, onCerrar, onGuardar, categoriaOptions, autoresOptions }: ModalNoticiaProps) {
  const [formData, setFormData] = useState<NoticiaData>(
    noticia || {
      id: 0,
      titulo: '',
      resumen: '',
      contenido: '',
      categoria: '',
      autor: '',
      fechaCreacion: new Date().toISOString().split('T')[0],
      estado: 'Borrador',
      destacada: false,
      imagenUrl: '',
      visitas: 0,
      tags: []
    }
  );

  const [tagsInput, setTagsInput] = useState(formData.tags.join(', '));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    onGuardar({ ...formData, tags: tagsArray });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-24">
      <div className="w-full max-w-4xl max-h-[calc(100vh-10rem)] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {noticia ? 'Editar Noticia' : 'Nueva Noticia / Comunicado'}
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
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  type="text"
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Título de la noticia"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <Label>Categoría *</Label>
                  <ControlledSelect
                    options={categoriaOptions}
                    placeholder="Seleccionar categoría"
                    value={formData.categoria}
                    onChange={(value) => setFormData({ ...formData, categoria: value })}
                  />
                </div>

                <div>
                  <Label>Autor *</Label>
                  <ControlledSelect
                    options={autoresOptions}
                    placeholder="Seleccionar autor"
                    value={formData.autor}
                    onChange={(value) => setFormData({ ...formData, autor: value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="resumen">Resumen *</Label>
                <textarea
                  id="resumen"
                  rows={3}
                  value={formData.resumen}
                  onChange={(e) => setFormData({ ...formData, resumen: e.target.value })}
                  placeholder="Resumen breve de la noticia..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary"
                />
              </div>

              <div>
                <Label htmlFor="contenido">Contenido *</Label>
                <textarea
                  id="contenido"
                  rows={8}
                  value={formData.contenido}
                  onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                  placeholder="Contenido completo de la noticia..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <Label htmlFor="imagenUrl">URL de Imagen</Label>
                  <Input
                    type="url"
                    id="imagenUrl"
                    value={formData.imagenUrl || ''}
                    onChange={(e) => setFormData({ ...formData, imagenUrl: e.target.value })}
                    placeholder="https://ejemplo.com/imagen.jpg"
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
              </div>

              <div>
                <Label htmlFor="tags">Tags (separados por comas)</Label>
                <Input
                  type="text"
                  id="tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="tecnología, educación, innovación"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ejemplo: tecnología, educación, innovación, estudiantes
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="destacada"
                    checked={formData.destacada}
                    onChange={(e) => setFormData({ ...formData, destacada: e.target.checked })}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="destacada">Noticia destacada</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 bg-indigo-500 "
              >
                {noticia ? 'Actualizar' : 'Crear Noticia'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}