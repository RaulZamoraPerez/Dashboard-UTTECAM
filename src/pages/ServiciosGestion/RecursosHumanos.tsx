import GestorDocumentos from '../../components/documentos/GestorDocumentos';
import { AREAS, NOMBRES_AREAS } from '../../constants/areas';

export default function RecursosHumanos() {
  return (
    <div className="p-6">
      <GestorDocumentos 
        areaId={AREAS.RECURSOS_HUMANOS} 
        areaNombre={NOMBRES_AREAS[AREAS.RECURSOS_HUMANOS]} 
      />
    </div>
  );
}
