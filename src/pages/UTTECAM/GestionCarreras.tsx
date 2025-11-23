import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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
  deleteCarrera,
  getCarreraImageUrl,
  updateCarrerasOrder,
} from '../../services/carreraService';
import { confirmDialog, toastSuccess, toastError } from '../../utils/alert';
import type { Carrera } from '../../types/carrera';
import ModalCarrera from './Carreras/ModalCarrera';
import ModalOrdenarCarreras from './Carreras/ModalOrdenarCarreras';

// Draggable Row Component
interface DraggableRowProps {
  carrera: Carrera;
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (carrera: Carrera) => void;
  onDelete: (id: number) => void;
}

const DraggableRow = ({ carrera, index, moveRow, onEdit, onDelete }: DraggableRowProps) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'row',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveRow(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'row',
    item: () => {
      return { id: carrera.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  return (
    <TableRow ref={ref} style={{ opacity }} data-handler-id={handlerId} className="cursor-grab hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <TableCell className="px-5 py-4 sm:px-6 text-start">
        <div className="flex items-center space-x-3">
          <div className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
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
            <div className="text-xs text-blue-600 font-medium dark:text-blue-400">{carrera.siglas}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        <div className="space-y-1">
          <div className="text-sm font-medium">{carrera.nivel}</div>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{carrera.duracion}</TableCell>
      <TableCell className="px-4 py-3 text-start">
        <Badge color={carrera.activo ? 'success' : 'error'}>
          {carrera.activo ? 'Activa' : 'Inactiva'}
        </Badge>
      </TableCell>
      <TableCell className="px-4 py-3 text-center">
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => onEdit(carrera)}
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
            onClick={() => onDelete(carrera.id!)}
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
  );
};

export default function GestionCarreras() {
  const { token } = useAuth();
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Carrera | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');
  const [modalOrdenarAbierto, setModalOrdenarAbierto] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);

  // Opciones para filtros y selects
  const nivelOptions = [
    { value: '', label: 'Todos los niveles' },
    { value: 'Ingenieria', label: 'Ingeniería' },
    { value: 'Licenciatura', label: 'Licenciatura' },
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
      setOrderChanged(false);
    } catch (error) {
      console.error('Error al cargar carreras:', error);
    } finally {
      setLoading(false);
    }
  };

  const moveRow = useCallback((dragIndex: number, hoverIndex: number) => {
    setCarreras((prevCarreras) => {
      const updatedCarreras = [...prevCarreras];
      const [draggedRow] = updatedCarreras.splice(dragIndex, 1);
      updatedCarreras.splice(hoverIndex, 0, draggedRow);
      return updatedCarreras;
    });
    setOrderChanged(true);
  }, []);

  const handleSaveOrder = async () => {
    if (!token) return;
    try {
      const orderData = carreras.map((c, index) => ({
        id: c.id!,
        orden: index + 1,
      }));
      await updateCarrerasOrder(orderData, token);
      setOrderChanged(false);
      toastSuccess('Orden actualizado correctamente');
    } catch (error) {
      console.error('Error al guardar orden:', error);
      toastError('Error al guardar el orden');
    }
  };

  // Estadísticas
  const carrerasActivas = carreras.filter((c) => c.activo).length;
  const carrerasPorNivel = {
    Ingenieria: carreras.filter((c) => c.nivel === 'Ingenieria').length,
    Licenciatura: carreras.filter((c) => c.nivel === 'Licenciatura').length,
  };

  // Filtrado
  const carrerasFiltradas = carreras.filter((carrera) => {
    const cumpleBusqueda =
      carrera.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      carrera.siglas.toLowerCase().includes(busqueda.toLowerCase());

    const cumpleNivel = filtroNivel === '' || carrera.nivel === filtroNivel;

    return cumpleBusqueda && cumpleNivel;
  });

  const handleEliminar = async (id: number) => {
    if (!token) return;
    const confirmed = await confirmDialog({ title: 'Eliminar carrera', text: '¿Estás seguro de eliminar esta carrera? Esta acción no se puede deshacer.' });
    if (!confirmed) return;

    try {
      await deleteCarrera(id, token);
      await cargarCarreras();
      toastSuccess('Carrera eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar carrera:', error);
      toastError('Error al eliminar la carrera');
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
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
            <div className="text-3xl font-bold text-blue-600 dark:text-white">{carreras.length}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Programas educativos</p>
          </ComponentCard>

          <ComponentCard title="Carreras Activas">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{carrerasActivas}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">En oferta actual</p>
          </ComponentCard>

          <ComponentCard title="Ingenierías">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{carrerasPorNivel.Ingenieria}</div>
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

            <div className="flex items-end gap-2">
              <button
                onClick={() => setModalOrdenarAbierto(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Ordenar Carreras
              </button>
              <button
                onClick={() => {
                  setEditando(null);
                  setModalAbierto(true);
                }}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                Agregar Carrera
              </button>
              {orderChanged && (
                <button
                  onClick={handleSaveOrder}
                  className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 animate-pulse"
                >
                  Guardar Orden
                </button>
              )}
            </div>
          </div>

          {/* Tabla de Carreras */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white" />
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
                      Nivel
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Duración
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
                  {carrerasFiltradas.map((carrera, index) => (
                    <DraggableRow
                      key={carrera.id}
                      index={index}
                      carrera={carrera}
                      moveRow={moveRow}
                      onEdit={(c) => {
                        setEditando(c);
                        setModalAbierto(true);
                      }}
                      onDelete={handleEliminar}
                    />
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

        {/* Modal para Ordenar */}
        {modalOrdenarAbierto && (
          <ModalOrdenarCarreras
            carreras={carreras}
            onCerrar={() => setModalOrdenarAbierto(false)}
            onGuardar={async (ordenData) => {
              if (!token) return;
              try {
                await updateCarrerasOrder(ordenData, token);
                await cargarCarreras();
                setModalOrdenarAbierto(false);
              } catch (error) {
                console.error('Error al guardar orden:', error);
                toastError('Error al guardar el orden');
              }
            }}
          />
        )}

        {/* Modal para Agregar/Editar */}
        {modalAbierto && (
          <ModalCarrera
            isOpen={modalAbierto}
            onClose={() => {
              setModalAbierto(false);
              setEditando(null);
            }}
            carrera={editando}
            onSave={async () => {
              await cargarCarreras();
              return true;
            }}
          />
        )}
      </div>
    </DndProvider>
  );
}
