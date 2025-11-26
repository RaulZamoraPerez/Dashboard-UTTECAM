import GestorDocumentos from '../../components/documentos/GestorDocumentos';
import { AREAS, NOMBRES_AREAS } from '../../constants/areas';

export default function ServicioSocial() {
  return (
    <div className="p-6">
      <GestorDocumentos 
        areaId={AREAS.SERVICIO_SOCIAL} 
        areaNombre={NOMBRES_AREAS[AREAS.SERVICIO_SOCIAL]} 
      />
    </div>
  );
}
