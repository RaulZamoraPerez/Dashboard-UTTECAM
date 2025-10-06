import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";

// UTTECAM Pages
import { 
  Organigrama, 
  Directorio, 
  GestionCarreras, 
  GestionNoticias 
} from "./pages/UTTECAM";

// Servicios y Gestión Pages
import {
  Finanzas,
  RecursosHumanos,
  GestionAmbiental,
  InformacionEstadia,
  GestionCalidad,
  CordinacionGenero
} from "./pages/ServiciosGestion";


export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* UTTECAM Pages */}
            <Route path="/uttecam/organigrama" element={<Organigrama />} />
            <Route path="/uttecam/directorio" element={<Directorio />} />
            <Route path="/uttecam/carreras" element={<GestionCarreras />} />
            <Route path="/uttecam/noticias" element={<GestionNoticias />} />

            {/* Servicios y Gestión Pages */}
            <Route path="/ServiciosGestion/Finanzas" element={<Finanzas />} />
            <Route path="/ServiciosGestion/RecursosHumanos" element={<RecursosHumanos />} />
            <Route path="/ServiciosGestion/InformacionEstadia" element={<InformacionEstadia />} />
            <Route path="/ServiciosGestion/GestionAmbiental" element={<GestionAmbiental />} />
            <Route path="/ServiciosGestion/GestionCalidad" element={<GestionCalidad />} />
            <Route path="/ServiciosGestion/CordinacionGenero" element={<CordinacionGenero />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
