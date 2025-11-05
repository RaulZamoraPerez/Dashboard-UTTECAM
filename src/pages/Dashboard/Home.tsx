import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import DigitalClock from "../../components/common/DigitalClock";
import InstitutionalVideo from "../../components/common/InstitutionalVideo";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Inicio | Uttecam dashboard"
        description="Esta es la página de inicio del panel de control de Uttecam"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Video Institucional y Reloj */}
        <div className="col-span-12 xl:col-span-8">
          <InstitutionalVideo />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <DigitalClock />
        </div>

        {/* Métricas y gráficos existentes */}
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />
          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}
