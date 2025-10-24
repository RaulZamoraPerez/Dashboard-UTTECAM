import GestorDocumentos from '../../components/documentos/GestorDocumentos';
import { AREAS, NOMBRES_AREAS } from '../../constants/areas';

export default function GestionAmbiental() {
  return (
    <div className="p-6">
      <GestorDocumentos 
        areaId={AREAS.GESTION_AMBIENTAL} 
        areaNombre={NOMBRES_AREAS[AREAS.GESTION_AMBIENTAL]} 
      />
    </div>
  );
}
