import GestorDocumentos from '../../components/documentos/GestorDocumentos';
import { AREAS, NOMBRES_AREAS } from '../../constants/areas';

export default function Pit() {
  return (
    <div className="p-6">
      <GestorDocumentos 
        areaId={AREAS.PIT} 
        areaNombre={NOMBRES_AREAS[AREAS.PIT]} 
      />
    </div>
  );
}
