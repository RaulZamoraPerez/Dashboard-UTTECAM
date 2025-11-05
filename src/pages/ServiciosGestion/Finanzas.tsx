import GestorDocumentos from '../../components/documentos/GestorDocumentos';
import { AREAS, NOMBRES_AREAS } from '../../constants/areas';

export default function Finanzas() {
  return (
    <div className="p-6">
      <GestorDocumentos 
        areaId={AREAS.FINANZAS} 
        areaNombre={NOMBRES_AREAS[AREAS.FINANZAS]} 
      />
    </div>
  );
}
