import GestorDocumentos from '../../components/documentos/GestorDocumentos';
import { AREAS, NOMBRES_AREAS } from '../../constants/areas';

export default function GestionCalidad() {
  return (
    <div className="p-6">
      <GestorDocumentos 
        areaId={AREAS.GESTION_CALIDAD} 
        areaNombre={NOMBRES_AREAS[AREAS.GESTION_CALIDAD]} 
      />
    </div>
  );
}
