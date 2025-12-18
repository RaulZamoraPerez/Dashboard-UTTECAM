// React import not required with the new JSX transform
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

const RelojDigitalAdmin = () => {
  return (
    <>
      <PageMeta title="Reloj Digital | Dashboard UTTECAM" description="Reloj Digital removido" />
      <PageBreadcrumb pageTitle="Reloj Digital" />

      <div className="space-y-6">
        <ComponentCard title="Reloj Digital">
          <div className="p-6 text-center text-sm text-gray-700">
            El Reloj Digital ha sido eliminado del sistema. Esta página se mantiene por compatibilidad.
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default RelojDigitalAdmin;