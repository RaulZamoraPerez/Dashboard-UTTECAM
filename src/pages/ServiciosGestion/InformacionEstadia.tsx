import { useState } from 'react';
import GestorEstadias from '../../components/estadias/GestorEstadias';
import GestorTiposEstadia from '../../components/estadias/GestorTiposEstadia';
import { BecasDashboard } from '../../components/becas/BecasDashboard';
import { FolderOpen, Tags, LayoutDashboard } from 'lucide-react';

export default function InformacionEstadia() {
  const [vistaActiva, setVistaActiva] = useState<'documentos' | 'tipos' | 'secciones'>('documentos');

  return (
    <div className="p-6">
      {/* Tabs de navegación */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setVistaActiva('documentos')}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
              vistaActiva === 'documentos'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FolderOpen className="h-5 w-5" />
            Documentos
          </button>
          <button
            onClick={() => setVistaActiva('tipos')}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
              vistaActiva === 'tipos'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Tags className="h-5 w-5" />
            Tipos de Estadía
          </button>
          <button
            onClick={() => setVistaActiva('secciones')}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
              vistaActiva === 'secciones'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            Secciones Dashboard
          </button>
        </nav>
      </div>

      {/* Contenido */}
      {vistaActiva === 'documentos' && <GestorEstadias />}
      {vistaActiva === 'tipos' && <GestorTiposEstadia />}
      {vistaActiva === 'secciones' && <BecasDashboard module="estadia" />}
    </div>
  );
}
