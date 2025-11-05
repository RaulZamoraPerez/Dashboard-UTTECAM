import GestorDocumentos from '../../components/documentos/GestorDocumentos';
import { AREAS, NOMBRES_AREAS } from '../../constants/areas';

export default function CordinacionGenero() {
  return (
    <div className="p-6">
      <GestorDocumentos 
        areaId={AREAS.COORDINACION_GENERO} 
        areaNombre={NOMBRES_AREAS[AREAS.COORDINACION_GENERO]} 
      />
    </div>
  );
}
