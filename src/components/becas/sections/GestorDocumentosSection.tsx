import GestorDocumentos from '../../documentos/GestorDocumentos';

import { AlertTriangle } from 'lucide-react';

interface GestorDocumentosSectionProps {
    id: number;
    title: string;
    data: any;
}

export const GestorDocumentosSection = ({ title, data }: GestorDocumentosSectionProps) => {
    // El areaId debe venir en los datos de la seccion
    const areaId = data?.areaId;

    if (!areaId) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                <AlertTriangle className="text-red-500 mb-2" size={32} />
                <h3 className="text-lg font-bold text-red-700">Error de Configuración</h3>
                <p className="text-red-600">
                    Esta sección de repositorio no tiene un área vinculada.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    {title}
                    <span className="text-xs font-normal px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                        Repositorio
                    </span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Administra las carpetas y archivos visibles para esta sección.
                </p>
            </div>

            <div className="p-0">
                <GestorDocumentos
                    areaId={areaId}
                    areaNombre={title}
                />
            </div>
        </div>
    );
};
