import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  BoltIcon,
  BoxCubeIcon,
  BoxIconLine,
  CalenderIcon,
  CheckLineIcon,
  ChevronDownIcon,
  GridIcon,
  GroupIcon,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};
// Standardized icon styles
const ICON_COLOR_CLASS = "text-[#0A9782]";
const ICON_STANDARD_CLASS = `w-4 h-4 mr-2 ${ICON_COLOR_CLASS}`;
const ICON_COLLAPSED_CLASS = `w-6 h-6 ${ICON_COLOR_CLASS}`;

type MenuType = "main" | "uttecam" | "quienes" | "vinculacion" | "serviciosGestion" | "extension" | "admission" | "academia" | "access";

type GroupConfig = {
  key: MenuType;
  title: string;
  icon: React.ReactNode;
  items: NavItem[];
  collapsedIcon?: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Contenido del Sitio",
    subItems: [
      { name: "Panel Principal", path: "/", pro: false },
      {
        name: "Contenido Homepage",
        path: "/home-content",
        pro: false,
        new: true
      },
      { name: "Reloj Digital", path: "/home-content/reloj-digital", pro: false },
      { name: "Video Institucional", path: "/home-content/video-institucional", pro: false },
      { name: "Eventos", path: "/home/eventos", pro: false },
      { name: "Hero Slides", path: "/home/hero-slides", pro: false },
      { name: "Noticias", path: "/home/noticias", pro: false },
      { name: "Anuncios", path: "/home/anuncios", pro: false },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "Quienes somos",
    subItems: [
      { name: "Nosotros", path: "/Nosotros", pro: false },
      // Ajuste de rutas para que coincidan con las rutas definidas en App.tsx
      { name: "Directorio", path: "/uttecam/directorio", pro: false },
      { name: "Organigrama", path: "/uttecam/organigrama", pro: false },
      { name: "Calendario", path: "/calendar", pro: false },
      { name: "Disposición Juridica", path: "/disposicion-juridica", pro: false },
      { name: "Programas de desarrollo", path: "/programas-desarrollo", pro: false },
    ],
  },
  {
    icon: <GroupIcon />,
    name: "Comites",
    path: "/comites",
    subItems:[
      { name: "Comité Académico", path: "/comites-academico", pro: false },
      { name: "Comité  de Vinculación", path: "/comites-vinculacion", pro: false },
      { name: "Comité de calidad", path: "/comites-calidad", pro: false },
      { name: "Comité de investigación", path: "/comites-investigacion", pro: false },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "Servicios Escolares",
    subItems:[
      { name: "Proceso de admisión", path: "/proceso-admision", pro: false },
      { name: "Trámites", path: "/tramites", pro: false },
      { name: "Convocatoria a trámite de título profesional", path: "/convocatoria-titulo", pro: false },
      { name: "Becas y apoyo", path: "/becas", pro: false },
    ],
  },
  {
    icon: <ListIcon />,
    name: "Academia",
    subItems: [
      { name: "Gestión de Carreras", path: "/uttecam/carreras", pro: false },
    ],
  },
  {
    icon: <CalenderIcon />,
    name: "Calendario",
    path: "/calendar",
  },
];

// Extracted groups from navItems for explicit rendering order
const quienesSomosItems: NavItem[] = [navItems[1]];

// UTTECAM specific items
const uttecamItems: NavItem[] = [
  {
    icon: (
      <svg className={`w-5 h-5 ${ICON_COLOR_CLASS}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    name: "Organigrama",
    path: "/uttecam/organigrama",
  },
  {
    icon: (
      <svg className={`w-5 h-5 ${ICON_COLOR_CLASS}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2m0 0V7a2 2 0 012-2h14a2 2 0 012 2v2M7 12l3 3-3-3m4 0l3-3-3 3m2-3v6" />
      </svg>
    ),
    name: "Directorio",
    path: "/uttecam/directorio",
  },
  {
    icon: (
      <svg className={`w-5 h-5 ${ICON_COLOR_CLASS}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
    name: "Gestión de Noticias",
    path: "/uttecam/noticias",
  },
  {
    icon: (
      <svg className={`w-5 h-5 ${ICON_COLOR_CLASS}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    name: "Calendario Académico",
    path: "/uttecam/calendario",
  },
];

// Admission (Servicios Escolares) - extracted to match UTTECAM navbar semantics
const admissionItems: NavItem[] = [
  {
    icon: <UserCircleIcon />,
    name: "Admisión",
    subItems: [
      { name: "Proceso de admisión", path: "/proceso-admision", pro: false },
      { name: "Trámites", path: "/tramites", pro: false },
      { name: "Convocatoria a trámite de título profesional", path: "/convocatoria-titulo", pro: false },
      { name: "Becas y apoyo", path: "/becas", pro: false },
    ],
  },
];

// Academia - extracted group
const academiaItems: NavItem[] = [
  {
    icon: <ListIcon />,
    name: "Academia",
    subItems: [{ name: "Gestión de Carreras", path: "/uttecam/carreras", pro: false }],
  },
];

// Accesos group
const accessItems: NavItem[] = [
  {
    icon: <BoxCubeIcon />,
    name: "Accesos",
    subItems: [
      { name: "Portal estudiantes", path: "/portal-estudiantes" },
      { name: "PIT - Programa Institucional de Tutorías/Portal docentes", path: "/programa-institucional-tutorias" },
      { name: "Portal administrativo", path: "/portal-administrativo" },
      { name: "Biblioteca digital", path: "https://elibro.net/es/lc/uttecam/login_usuario/?next=/es/lc/uttecam/inicio/" },
    ],
  },
];

const vinculacionItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Practicas y estadias",
    subItems: [
      { name: "Catalogo de empresas para estadia", path: "/catalogo-estadia", pro: false },
      { name: "Documentos para la getión de estadias", path: "/ServiciosGestion/InformacionEstadia", pro: false },
      { name: "Servicio social", path: "/ServiciosGestion/ServicioSocial", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Servicios Tecnológicos",
    subItems: [
      { name: "Catalogo de servicios tecnologicos", path: "/catalodo-servicios", pro: false },
      { name: "Servicios tecnologicos realizados", path: "/servicios-realizados", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Educación Continua",
    subItems: [
      { name: "Catalogo de cursos y talleres", path: "/catalogo-talleres", pro: false },
      { name: "Cursos y talleres realizados", path: "/cursos-realizados", pro: false },
    ],
  },
  {
    icon: <BoltIcon />,
    name: "Movilidad internacional",
    path:"/movilidad-internacional",
  },
  {
    icon: <BoxIconLine />,
    name: "Desempeño de egresados",
    subItems: [
      { name: "Bolsa de trabajo", path: "/bolsa-trabajo", pro: false },
      { name: "Encuentro de egresados", path: "/encuentro-egresados", pro: false },
    ],
  },
  {
    icon: <PageIcon />,
    name: "Entidad de certificación y evaluación",
    path:"/entidad-certificacion-evaluacion",
  },
  {
    icon: <GroupIcon />,
    name: "Docente miembros del Sistema Nacional de Investigadoras e Investigadores SNII",
    path:"/docente-snii",
  },
  {
    icon: (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-microscope-icon lucide-microscope ${ICON_COLOR_CLASS}`}>
      <path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>
    </svg>),
    name: "Repositorio digital de productos de investigación",
    path:"/ServiciosGestion/Vinculacion",
  },
  {
    icon: (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-coffee-icon lucide-coffee ${ICON_COLOR_CLASS}`}>
      <path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>
    </svg>),
    name: "Seminario café científico",
    path:"/seminario-cafe-cientifico",
  },
];

const serviciosGestionItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Finanzas",
    path: "/ServiciosGestion/Finanzas",
  },
  {
    icon: (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-user-round-cog-icon lucide-user-round-cog ${ICON_COLOR_CLASS}`}>
        <path d="m14.305 19.53.923-.382"/><path d="m15.228 16.852-.923-.383"/><path d="m16.852 15.228-.383-.923"/><path d="m16.852 20.772-.383.924"/><path d="m19.148 15.228.383-.923"/><path d="m19.53 21.696-.382-.924"/><path d="M2 21a8 8 0 0 1 10.434-7.62"/><path d="m20.772 16.852.924-.383"/><path d="m20.772 19.148.924.383"/><circle cx="10" cy="8" r="5"/><circle cx="18" cy="18" r="3"/>
      </svg>
    ),
    name: "Recursos Humanos",
    path: "/ServiciosGestion/RecursosHumanos",
  },
  {
    icon: (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-briefcase-business-icon lucide-briefcase-business ${ICON_COLOR_CLASS}`}>
        <path d="M12 12h.01"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M22 13a18.15 18.15 0 0 1-20 0"/><rect width="20" height="14" x="2" y="6" rx="2"/>
      </svg>
    ),
    name: "Información y estadia",
    path: "/ServiciosGestion/InformacionEstadia",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-leaf-icon ${ICON_COLOR_CLASS}`}>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14 12 13 13 12"/>
      </svg>
    ),
    name: "Sistema de gestion ambiental",
    path: "/ServiciosGestion/GestionAmbiental",
  },
  {
    icon: <CheckLineIcon />,
    name: "Sistema de gestion de la calidad",
    path: "/ServiciosGestion/GestionCalidad",
  },
  {
    icon: (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-venus-and-mars-icon lucide-venus-and-mars ${ICON_COLOR_CLASS}`}>
        <path d="M10 20h4"/><path d="M12 16v6"/><path d="M17 2h4v4"/><path d="m21 2-5.46 5.46"/><circle cx="12" cy="11" r="5"/>
      </svg>
    ),
    name: "Coordinación de género",
    path: "/ServiciosGestion/CordinacionGenero",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-link ${ICON_COLOR_CLASS}`}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    name: "Vinculación",
    path: "/ServiciosGestion/Vinculacion",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-users ${ICON_COLOR_CLASS}`}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    name: "Servicio Social",
    path: "/ServiciosGestion/ServicioSocial",
  }
];

const extensionItems: NavItem[] = [
  {
    icon: <GroupIcon className={ICON_STANDARD_CLASS} />,
    name: "Talleres Culturales",
    path: "/uttecam/extension/section/talleres-culturales",
  },
  {
    icon: <BoltIcon className={ICON_STANDARD_CLASS} />,
    name: "Talleres Deportivos",
    path: "/uttecam/extension/section/talleres-deportivos",
  },
  {
    icon: <CheckLineIcon className={ICON_STANDARD_CLASS} />,
    name: "Servicio Médico",
    path: "/uttecam/extension/section/servicio-medico",
  },
  {
    icon: <CalenderIcon className={ICON_STANDARD_CLASS} />,
    name: "Ferias Profesiográficas",
    path: "/uttecam/extension/section/ferias-profesiograficas",
  },
  {
    icon: <GroupIcon className={ICON_STANDARD_CLASS} />,
    name: "Visitas Guiadas",
    path: "/uttecam/extension/section/visitas-guiadas",
  },
  {
    icon: <PageIcon className={ICON_STANDARD_CLASS} />,
    name: "Gaceta",
    path: "/uttecam/extension/documents/gaceta",
  },
  {
    icon: <GridIcon className={ICON_STANDARD_CLASS} />,
    name: "Promoción Institucional",
    path: "/uttecam/extension/documents/promocion",
  },
];

// Helper component for collapsible group headers
const GroupHeader: React.FC<{
  title: string;
  icon: React.ReactNode;
  collapsedIcon?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  isExpanded: boolean;
  isHovered: boolean;
  isMobileOpen: boolean;
  contentId?: string;
}> = ({ title, icon, collapsedIcon, isOpen, onToggle, isExpanded, isHovered, isMobileOpen, contentId }) => (
  <div className="flex items-center justify-between">
    <h2
      className={`mb-4 text-xs uppercase flex leading-[20px] text-primary font-semibold ${
        !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
      }`}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      {isExpanded || isHovered || isMobileOpen ? (
        <>{icon} {title}</>
      ) : (
        // Show the icon (without margin) when collapsed to help recognition
        <span className="flex items-center justify-center w-6 h-6">{collapsedIcon ?? icon}</span>
      )}
    </h2>
    <button
      className={`ml-2 text-[#0A9782] hover:text-[#0A9782]/80 p-1 rounded transition-transform duration-200 ${
        isOpen ? "rotate-180" : ""
      }`}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      aria-controls={contentId}
      aria-expanded={isOpen}
      aria-label={`Toggle ${title}`}
    >
      <ChevronDownIcon className="w-4 h-4" />
    </button>
  </div>
);

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: MenuType;
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [openGroups, setOpenGroups] = useState<Record<MenuType, boolean>>({
    quienes: true,
    admission: true,
    academia: true,
    vinculacion: true,
    uttecam: true,
    extension: true,
    access: true,
    main: true,
    serviciosGestion: true,
  });

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    const menuTypeMap: Record<MenuType, NavItem[]> = {
      main: [navItems[0]],
      quienes: quienesSomosItems,
      admission: admissionItems,
      academia: academiaItems,
      vinculacion: vinculacionItems,
      uttecam: uttecamItems,
      access: accessItems,
      extension: extensionItems,
      serviciosGestion: serviciosGestionItems,
    };

    (Object.keys(menuTypeMap) as MenuType[]).forEach((menuType) => {
      const items = menuTypeMap[menuType];
      items.forEach((nav: NavItem, index: number) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem: { name: string; path: string; pro?: boolean; new?: boolean }) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type: menuType, index });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: MenuType) => {
    setOpenSubmenu((prev) => {
      if (
        prev &&
        prev.type === menuType &&
        prev.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const toggleGroup = (menuType: MenuType) => {
    setOpenGroups((prev) => ({ ...prev, [menuType]: !prev[menuType] }));
  };

  // Configuration for all collapsible groups
  const groupsConfig: GroupConfig[] = [
    {
      key: "quienes",
      title: "Quiénes somos",
      icon: <UserCircleIcon className={ICON_STANDARD_CLASS} />,
      collapsedIcon: <UserCircleIcon className={ICON_COLLAPSED_CLASS} />,
      items: quienesSomosItems,
    },
    {
      key: "admission",
      title: "Admisión",
      icon: <UserCircleIcon className={ICON_STANDARD_CLASS} />,
      collapsedIcon: <UserCircleIcon className={ICON_COLLAPSED_CLASS} />,
      items: admissionItems,
    },
    {
      key: "academia",
      title: "Academia",
      icon: <ListIcon className={ICON_STANDARD_CLASS} />,
      collapsedIcon: <ListIcon className={ICON_COLLAPSED_CLASS} />,
      items: academiaItems,
    },
    {
      key: "vinculacion",
      title: "Vinculación",
      icon: <PieChartIcon className={ICON_STANDARD_CLASS} />,
      collapsedIcon: <PieChartIcon className={ICON_COLLAPSED_CLASS} />,
      items: vinculacionItems,
    },
    {
      key: "uttecam",
      title: "UTTECAM",
      icon: <GridIcon className={ICON_STANDARD_CLASS} />,
      collapsedIcon: <GridIcon className={ICON_COLLAPSED_CLASS} />,
      items: uttecamItems,
    },
    {
      key: "access",
      title: "Accesos",
      icon: <BoxCubeIcon className={ICON_STANDARD_CLASS} />,
      collapsedIcon: <BoxCubeIcon className={ICON_COLLAPSED_CLASS} />,
      items: accessItems,
    },
    {
      key: "main",
      title: "Contenido del Sitio",
      icon: <GridIcon className={ICON_STANDARD_CLASS} />,
      collapsedIcon: <GridIcon className={ICON_COLLAPSED_CLASS} />,
      items: [navItems[0]],
    },
    {
      key: "extension",
      title: "Extensión Universitaria",
      icon: <PlugInIcon className={ICON_STANDARD_CLASS} />,
      collapsedIcon: <PlugInIcon className={ICON_COLLAPSED_CLASS} />,
      items: extensionItems,
    },
    {
      key: "serviciosGestion",
      title: "Servicios y Gestión",
      icon: <BoxIconLine className={ICON_STANDARD_CLASS} />,
      collapsedIcon: <BoxIconLine className={ICON_COLLAPSED_CLASS} />,
      items: serviciosGestionItems,
    },
  ];

  const renderMenuItems = (items: NavItem[], menuType: MenuType) => (
    <ul className="flex flex-col gap-2">
      {items.map((nav, index) => (
        <li key={nav.name}>
            {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              aria-controls={`${menuType}-${index}-submenu`}
              aria-expanded={openSubmenu?.type === menuType && openSubmenu?.index === index}
              aria-haspopup={true}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active text-[#0A9782] bg-[#0A9782]/10"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size ${ICON_COLOR_CLASS} ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active text-[#0A9782]"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-[#0A9782]"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path)
                    ? "menu-item-active text-[#0A9782] bg-[#0A9782]/10"
                    : "menu-item-inactive"
                }`}
                aria-current={isActive(nav.path) ? "page" : undefined}
              >
                <span
                  className={`menu-item-icon-size ${
                      isActive(nav.path)
                        ? "menu-item-icon-active text-[#0A9782]"
                        : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              id={`${menuType}-${index}-submenu`}
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active text-[#0A9782]"
                          : "menu-dropdown-item-inactive"
                      }`}
                      aria-current={isActive(subItem.path) ? "page" : undefined}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >

        {/*sidebar - lgo */}
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                
                src="/images/logo/logo_uttecam.png"
                alt="Logo"
                width={150}
                height={40}
              />
             
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div
        className="flex flex-col overflow-y-auto overscroll-contain touch-pan-y duration-300 ease-linear no-scrollbar"
        style={{ maxHeight: 'calc(100vh - 64px)', WebkitOverflowScrolling: 'touch' }}
        onWheel={(e) => e.stopPropagation()}
      >
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {groupsConfig.map((group) => (
              <div key={group.key}>
                <GroupHeader
                  title={group.title}
                  icon={group.icon}
                  collapsedIcon={group.collapsedIcon}
                  isOpen={!!openGroups[group.key]}
                  onToggle={() => toggleGroup(group.key)}
                  isExpanded={isExpanded}
                  isHovered={isHovered}
                  isMobileOpen={isMobileOpen}
                  contentId={`${group.key}-content`}
                />
                {openGroups[group.key] && (
                  <div id={`${group.key}-content`} className="pl-1 transition-all duration-150">
                    {renderMenuItems(group.items, group.key)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
