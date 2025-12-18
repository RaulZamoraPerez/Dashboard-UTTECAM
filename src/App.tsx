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
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PublicRoute } from "./components/auth/PublicRoute";

// UTTECAM Pages
import {
  GestionCarreras,
  CalendarioAcademico,
  Becas,
} from "./pages/UTTECAM";
import ExtensionSection from "./pages/UTTECAM/ExtensionUniversitaria/ExtensionSection";
import ExtensionDocuments from "./pages/UTTECAM/ExtensionUniversitaria/ExtensionDocuments";

import Organigrama from "./pages/quienes-somos/Organigrama";
import Directorio from "./pages/quienes-somos/Directorio";
import Nosotros from "./pages/quienes-somos/Nosotros";
import Normatividad from "./pages/quienes-somos/Normatividad";
import PortalEstudiantes from "./pages/Accesos/PortalEstudiantes";

// Home Content Pages
import HeroSlidesAdmin from "./pages/HomeContent/HeroSlides";
import EventosAdmin from "./pages/HomeContent/Eventos";
import NoticiasAdmin from "./pages/HomeContent/Noticias";
import AnunciosAdmin from "./pages/HomeContent/Anuncios";
import VideoInstitucionalAdmin from "./pages/HomeContent/VideoInstitucional";
import RelojDigitalAdmin from "./pages/HomeContent/RelojDigital";
import HomeContentDashboard from "./pages/HomeContent/HomeContentDashboard";
import ComiteDocumentsManager from './pages/Comites/ComiteDocumentsManager';
import ProgramasDesarrollo from "./pages/ProgramasDesarrollo";

// Servicios y Gestión Pages
import {
  Finanzas,
  RecursosHumanos,
  GestionAmbiental,
  InformacionEstadia,
  GestionCalidad,
  CordinacionGenero,
  Vinculacion,
  ServicioSocial
} from "./pages/ServiciosGestion";
import Pit from "./pages/Accesos/Pit";
import ProcesoAdmisionPage from "./pages/ServiciosEscolares/ProcesoAdmisionPage";
import ConvocatoriaTituloPage from "./pages/ServiciosEscolares/ConvocatoriaTituloPage";
import TramitesPage from "./pages/ServiciosEscolares/TramitesPage";
import TramiteFormularioPage from "./pages/ServiciosEscolares/TramiteFormularioPage";
import ReinscripcionPage from "./pages/ServiciosEscolares/ReinscripcionPage";


export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Auth Layout - Rutas públicas */}
          <Route path="/signin" element={
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          } />

          {/* Dashboard Layout - Rutas protegidas */}
          <Route element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            {/* Home Content Management - Ruta raíz */}
            <Route index path="/" element={<HeroSlidesAdmin />} />
            <Route path="/home/hero-slides" element={<HeroSlidesAdmin />} />
            <Route path="/home/eventos" element={<EventosAdmin />} />
            <Route path="/home/noticias" element={<NoticiasAdmin />} />
            <Route path="/home/anuncios" element={<AnunciosAdmin />} />
            <Route path="/home-content" element={<HomeContentDashboard />} />
            <Route path="/home-content/video-institucional" element={<VideoInstitucionalAdmin />} />
            <Route path="/home-content/reloj-digital" element={<RelojDigitalAdmin />} />
            <Route path="/programas-desarrollo" element={<ProgramasDesarrollo />} />

            {/* Comites Routes */}
            <Route path="/comites-academico" element={<ComiteDocumentsManager slug="academico" pageTitle="Comité Académico" />} />
            <Route path="/comites-vinculacion" element={<ComiteDocumentsManager slug="vinculacion" pageTitle="Comité de Vinculación" />} />
            <Route path="/comites-calidad" element={<ComiteDocumentsManager slug="calidad" pageTitle="Comité de Calidad" />} />
            <Route path="/comites-investigacion" element={<ComiteDocumentsManager slug="investigacion" pageTitle="Comité de Investigación" />} />

            {/* Dashboard Overview */}
            <Route path="/dashboard" element={<Home />} />

            {/* UTTECAM Pages */}
            <Route path="/organigrama" element={<Organigrama />} />
            <Route path="/directorio" element={<Directorio />} />
            <Route path="/carreras" element={<GestionCarreras />} />

            <Route path="/calendar" element={<CalendarioAcademico />} />
            <Route path="/Nosotros" element={<Nosotros />} />
            <Route path="/disposicion-juridica" element={<Normatividad />} />

            {/* Accesos Pages */}
            <Route path="/accesos/pit" element={<Pit />} />
            <Route path="/Accesos/PortalEstudiantes" element={<PortalEstudiantes />} />

            {/* Extension Universitaria */}
            <Route path="/uttecam/extension/section/:slug" element={<ExtensionSection />} />
            <Route path="/uttecam/extension/documents/:category" element={<ExtensionDocuments />} />

            {/* Servicios y Gestión Pages */}
            <Route path="/ServiciosGestion/Finanzas" element={<Finanzas />} />
            <Route path="/ServiciosGestion/RecursosHumanos" element={<RecursosHumanos />} />
            <Route path="/ServiciosGestion/InformacionEstadia" element={<InformacionEstadia />} />
            <Route path="/ServiciosGestion/GestionAmbiental" element={<GestionAmbiental />} />
            <Route path="/ServiciosGestion/GestionCalidad" element={<GestionCalidad />} />
            <Route path="/ServiciosGestion/CordinacionGenero" element={<CordinacionGenero />} />

            <Route path="/admision/becas" element={<Becas />} />

            {/* Rutas de Servicios Escolares */}
            <Route path="ServiciosEscolares/ProcesoAdmision" element={<ProcesoAdmisionPage />} />
            <Route path="ServiciosEscolares/ConvocatoriaTitulo" element={<ConvocatoriaTituloPage />} />
            <Route path="ServiciosEscolares/Tramites" element={<TramitesPage />} />
            <Route path="ServiciosEscolares/Tramites/:tramiteId" element={<TramiteFormularioPage />} />
            <Route path="ServiciosEscolares/Tramites/Reinscripcion" element={<ReinscripcionPage />} />



            <Route path="/ServiciosGestion/Vinculacion" element={<Vinculacion />} />
            <Route path="/ServiciosGestion/ServicioSocial" element={<ServicioSocial />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            {/* <Route path="/calendar" element={<Calendar />} /> */}
            <Route path="/blank" element={<Blank />} />
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

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}