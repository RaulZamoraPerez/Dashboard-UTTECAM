import GestorDocumentos from '../../components/documentos/GestorDocumentos';
import { AREAS, NOMBRES_AREAS } from '../../constants/areas';

export default function InformacionEstadia() {
  return (
    <div className="p-6">
      <GestorDocumentos 
        areaId={AREAS.INFORMACION_ESTADIA} 
        areaNombre={NOMBRES_AREAS[AREAS.INFORMACION_ESTADIA]} 
      />
    </div>
  );
}
