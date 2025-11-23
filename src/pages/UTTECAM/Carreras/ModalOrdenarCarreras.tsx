import { useState, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { Carrera } from '../../../types/carrera';

// Componente para item sortable
interface SortableItemProps {
  carrera: Carrera;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
}

const SortableItem = ({ carrera, index, moveItem }: SortableItemProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'item',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      moveItem(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'item',
    item: () => ({ id: carrera.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.5 : 1;
  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{ opacity }}
      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-move"
      data-handler-id={handlerId}
    >
      <div className="text-gray-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
      <div className="flex-1">
        <div className="font-medium text-gray-900 dark:text-white">{carrera.nombre}</div>
        <div className="text-sm text-gray-500">{carrera.siglas}</div>
      </div>
    </div>
  );
};

interface ModalOrdenarCarrerasProps {
  carreras: Carrera[];
  onCerrar: () => void;
  onGuardar: (ordenData: { id: number; orden: number }[]) => void;
}

export default function ModalOrdenarCarreras({ carreras, onCerrar, onGuardar }: ModalOrdenarCarrerasProps) {
  const [ingenierias, setIngenierias] = useState<Carrera[]>([]);
  const [licenciaturas, setLicenciaturas] = useState<Carrera[]>([]);

  useEffect(() => {
    const ing = carreras.filter(c => c.nivel === 'Ingenieria').sort((a, b) => a.orden - b.orden);
    const lic = carreras.filter(c => c.nivel === 'Licenciatura').sort((a, b) => a.orden - b.orden);
    setIngenierias(ing);
    setLicenciaturas(lic);
  }, [carreras]);

  const moveItem = (list: Carrera[], setList: (list: Carrera[]) => void, dragIndex: number, hoverIndex: number) => {
    const updatedList = [...list];
    const [draggedItem] = updatedList.splice(dragIndex, 1);
    updatedList.splice(hoverIndex, 0, draggedItem);
    setList(updatedList);
  };

  const handleGuardar = () => {
    const allOrdered = [...ingenierias, ...licenciaturas];
    const ordenData = allOrdered.map((c, index) => ({ id: c.id!, orden: index + 1 }));
    onGuardar(ordenData);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-start justify-center bg-black/50 p-4 pt-24 overflow-y-auto">
      <div className="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-lg shadow-lg my-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Ordenar Carreras</h2>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ingenierías</h3>
              <DndProvider backend={HTML5Backend}>
                <div className="space-y-2">
                  {ingenierias.map((carrera, index) => (
                    <SortableItem
                      key={carrera.id}
                      carrera={carrera}
                      index={index}
                      moveItem={(dragIndex, hoverIndex) => moveItem(ingenierias, setIngenierias, dragIndex, hoverIndex)}
                    />
                  ))}
                </div>
              </DndProvider>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Licenciaturas</h3>
              <DndProvider backend={HTML5Backend}>
                <div className="space-y-2">
                  {licenciaturas.map((carrera, index) => (
                    <SortableItem
                      key={carrera.id}
                      carrera={carrera}
                      index={index}
                      moveItem={(dragIndex, hoverIndex) => moveItem(licenciaturas, setLicenciaturas, dragIndex, hoverIndex)}
                    />
                  ))}
                </div>
              </DndProvider>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onCerrar}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleGuardar}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Guardar Orden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
