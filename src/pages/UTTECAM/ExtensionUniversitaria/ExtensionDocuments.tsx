import { useParams } from 'react-router';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import ComponentCard from '../../../components/common/ComponentCard';
import GestorDocumentos from '../../../components/documentos/GestorDocumentos';
import { AREAS, NOMBRES_AREAS } from '../../../constants/areas';

const ExtensionDocuments = () => {
  const { category } = useParams<{ category: string }>();

  // Map category param to area id and name
  const areaId = category === 'promocion' ? AREAS.EXTENSION_PROMOCION : AREAS.EXTENSION_GACETAS;
  const categoryName = NOMBRES_AREAS[areaId];

  return (
    <>
      <PageBreadcrumb pageTitle={categoryName} />
      <ComponentCard title={`Gestión de ${categoryName}`}>
        <GestorDocumentos areaId={areaId} areaNombre={categoryName} />
      </ComponentCard>
    </>
  );
};

export default ExtensionDocuments;
