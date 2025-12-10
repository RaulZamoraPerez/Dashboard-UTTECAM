import GestorDocumentos from '../../components/documentos/GestorDocumentos';
import { AREAS, NOMBRES_AREAS } from '../../constants/areas';

export default function Vinculacion() {
  return (
    <div className="p-6">
      <GestorDocumentos 
        areaId={AREAS.VINCULACION} 
        areaNombre={NOMBRES_AREAS[AREAS.VINCULACION]} 
      />
    </div>
  );
}
