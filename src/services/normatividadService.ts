export type DocumentItem = {
  id: string;
  titulo: string;
  archivo: string; // path or data URL
  archivoName?: string;
};

export type Category = {
  id: string;
  titulo: string;
  documentos: DocumentItem[];
};

const STORAGE_KEY = 'normatividad.v1';

const initialDatos: Category[] = [
    {
        id: "leyes",
        titulo: "Leyes",
        documentos: [
            { id: "ley1", titulo: "LEY DE EGRESOS 2023", archivo: "/Leyes/LEY_DE_EGRESOS_2023.pdf" },
            { id: "ley2", titulo: "LEY DE PRESUPUESTO Y GASTO PÚBLICO RESPONSABLE DEL ESTADO DE PUEBLA", archivo: "/Leyes/LEY_DE_PRESUPUESTO_Y_GASTO_PÚBLICO_RESPONSABLE_DEL_ESTADO_DE_PUEBLA_T_210112020 (7).pdf" },
            { id: "ley3", titulo: "LEY GENERAL DE CONTABILIDAD GUBERNAMENTAL", archivo: "/Leyes/LEY_GENERAL_CONTABILIDAD_GUBERNAMENTAL.pdf" },
            { id: "ley4", titulo: "LEY PARA EL ACCESO DE LAS MUJERES A UNA VIDA LIBRE DE VIOLENCIA", archivo: "/Leyes/LEY_PARA_EL_ACCESO_DE_LAS_MUJERES_A_UNA_VIDA_LIBRE_DE_VIOLENCIA_EV_05082024.pdf" },
            { id: "ley5", titulo: "LEY PARA LA IGUALDAD ENTRE MUJERES Y HOMBRES DEL ESTADO DE PUEBLA", archivo: "/Leyes/LEY_PARA_LA_IGUALDAD_ENTRE_MUJERES_Y_HOMBRES_DEL_ESTADO_DE_PUEBLA_T4_01122023.pdf" },
        ],
    },
    {
        id: "lineamientos",
        titulo: "Lineamientos",
        documentos: [
            { id: "lin1", titulo: "LINEAMIENTOS GENERALES PARA EL SEGUIMIENTO Y EVALUACIÓN DE LOS DOCUMENTOS RECTORES Y PROGRAMAS PRESUPUESTARIOS DE LA ADMINISTRACIÓN PÚBLICA DE PUEBLA", archivo: "/Lineaminetos/LINEAMIENTOS_GENERALES_PARA_EL_SEGUIMIENTO_EVALUACIÓN_DE_LOS_DOCUMENTOS_RECTORES_Y_PROGRAMAS_PRESUPUESTARIOS_DE_LA_ADMINISTRACIÓN_PÚBLICA_DE_PUEBLA_T_6_01092020.pdf" },
            { id: "lin2", titulo: "LINEAMIENTOS PARA EL MONITOREO Y SEGUIMIENTO DEL AVANCE FÍSICO Y FINANCIERO DE LOS INDICADORES DE DESEMPEÑO DE LOS PROGRAMAS PRESUPUESTARIOS", archivo: "/Lineaminetos/LINEAMIENTOS_PARA_EL_MONITOREO_Y_SEGUIMIENTO_DEL_AVANCE_FÍSICO_Y_FINANCIERO_DE_LOS_INDICADORES_DE_DESEMPEÑO_DE_LOS_PROGRAMAS_PRESUPUESTARIOS.pdf" },
            { id: "lin3", titulo: "LINEAMIENTOS PARA LA OPERACIÓN DEL SISTEMA DE INFORMACIÓN PARA EL SEGUIMIENTO A LA PLANEACIÓN Y EVALUACIÓN DEL DESARROLLO EN EL ESTADO", archivo: "/Lineaminetos/LINEAMIENTOS_GENERALES_PARA_EL_SEGUIMIENTO_EVALUACIÓN_DE_LOS_DOCUMENTOS_RECTORES_Y_PROGRAMAS_PRESUPUESTARIOS_DE_LA_ADMINISTRACIÓN_PÚBLICA_DE_PUEBLA_T_6_01092020.pdf" },
            { id: "lin4", titulo: "LINEAMIENTOS PARA LOS PROGRAMAS PRESUPUESTARIOS DE LAS DEPENDENCIAS Y ENTIDADES DE LA ADMINISTRACIÓN PÚBLICA ESTATAL", archivo: "/Lineaminetos/LINEAMIENTOS_PARA_LOS_PROGRAMAS_PRESUPUESTARIOS_DE_LAS_DEPENDENCIAS_Y_ENTIDADES_DE_LA_ADMINISTRACIÓN_PÚBLICA_ESTATAL_09MAR2021.pdf" },
            { id: "lin5", titulo: "LINEAMIENTOS QUE DEBERÁN OBSERVAR LAS DEPENDENCIAS Y ENTIDADES PARAESTATALES DEL GOBIERNO DEL ESTADO DE PUEBLA EN MATERIA DE IGUALDAD SUSTANTIVA", archivo: "/Lineaminetos/LINEAMIENTOS_QUE_DEBERAN_OBSERVAR_LAS_DEPENDENCIAS_Y_ENTIDADES_PARAESTATALES_DEL_GOB_DEL_EDO_DE_PUEBLA_EN_MATERIA_DE_IGUALDAD_SUSTANTIVA_2032020.pdf" },
            { id: "lin6", titulo: "LINEAMIENTOS CILyND UTTECAM", archivo: "/Lineaminetos/LINEAMIENTOS CILyND UTTTECAM.pdf" },
        ],
    },
    {
        id: "codigo",
        titulo: "Código",
        documentos: [
            { id: "cod1", titulo: "CÓDIGO DE CONDUCTA UTTECAM", archivo: "/Codigo/CÓDIGO DE CONDUCTA UTTECAM.pdf" },
            { id: "cod2", titulo: "CÓDIGO DE ÉTICA", archivo: "/Codigo/CODIGO DE ÉTICA.pdf" },
            { id: "cod3", titulo: "CÓDIGO DE ÉTICA Y LAS REGLAS DE INTEGRIDAD PARA EL EJERCICIO DE LA FUNCIÓN PÚBLICA", archivo: "/Codigo/CODIGO_DE_ETICA_Y_LAS_REGLAS_DE_INTEGRIDAD_PARA_EL_EJERCICIO_DE_LA_FUNCION_PUBLICA_17042020.pdf" },
            { id: "cod4", titulo: "CÓDIGO DE CONDUCTA 2025", archivo: "/Codigo/Código de conducta 2025.pdf" },
        ],
    },
    {
        id: "guias",
        titulo: "Guías",
        documentos: [
            { id: "gui1", titulo: "GUÍA PARA ELABORAR PLANES INSTITUCIONALES DE IGUALDAD SUSTANTIVA", archivo: "/Guias/GUÍA_PARA_ELABORAR_PLANES_INSTITUCIONALES_DE_IGUALDAD_SUSTANTIVA.pdf" },
        ],
    },
    {
        id: "decreto_creacion",
        titulo: "Decreto de Creación",
        documentos: [
            { id: "dec1", titulo: "DECRETO DE CREACIÓN DE LA UTTECAM", archivo: "/DecretoCreacion/1 DECRETO DE CREACIÓN DE LA UTTECAM.pdf" },
            { id: "dec2", titulo: "DECRETO QUE REFORMA LA CONSTITUCIÓN DEL CONSEJO DIRECTIVO (ART. 6)", archivo: "/DecretoCreacion/2 DECRETO QUE REFORMA LA CONSTITUCIÓN DEL CONSEJO DIRECTIVO (ART. 6).pdf" },
            { id: "dec3", titulo: "DECRETO QUE REFORMA LOS OBJETIVOS DE LA UTTECAM", archivo: "/DecretoCreacion/3 DECRETO QUE REFORMA LOS OBJETIVOS DE LA UTTECAM.pdf" },
        ],
    },
    {
        id: "manuales",
        titulo: "Manuales",
        documentos: [
            { id: "man1", titulo: "MANUAL DE ORGANIZACIÓN DE LA UTT", archivo: "/Manuales/MANUAL DE ORGANIZACIÓN DE LA UTT.pdf" },
            { id: "man2", titulo: "MANUAL DE PROCEDIMIENTO PARA LA ATENCIÓN DE QUEJAS POR HOSTIGAMIENTO, ACOSO SEXUAL, LABORAL Y DISCRIMINACIÓN", archivo: "/Manuales/MANUAL DE PROCEDIMIENTO PARA LA ATENCIÓN DE QUEJAS POR HOSTIGAMIENTO, ACOSO SEXUAL, LABORAL Y DISCRIMINACIÓN.pdf" },
            { id: "man3", titulo: "MANUAL DE PROCEDIMIENTOS DE TUTORÍAS", archivo: "/Manuales/MANUAL DE PROCEDIMIENTOS DE TUTORÍAS.pdf" },
            { id: "man4", titulo: "MANUAL DE PROCEDIMIENTOS UTTECAM", archivo: "/Manuales/MANUAL DE PROCEDIMIENTOS UTTECAM.pdf" },
            { id: "man5", titulo: "MANUAL DE SEGURIDAD EN INSTITUCIONES DE EDUCACIÓN SUPERIOR ANUIES", archivo: "/Manuales/MANUAL, SEGURIDAD INSTITUCIONES EDUCACIÓN SUPERIOR ANUIES.pdf" },
            { id: "man6", titulo: "MANUAL PARA LA INSTALACIÓN DE UNIDADES DE IGUALDAD SUSTANTIVA", archivo: "/Manuales/MANUAL_PARA_LA_INSTALACIÓN_DE_UNIDADES_DE_IGUALDAD_SUSTANTIVA.pdf" },
        ],
    },
    {
        id: "politicas",
        titulo: "Políticas",
        documentos: [
            { id: "pol1", titulo: "POLÍTICA GENERAL DE IGUALDAD, NO DISCRIMINACIÓN Y DERECHOS HUMANOS", archivo: "/Politicas/POLÍTICA GENERAL DE IGUALDAD, NO DISCRIMINACIÓN Y DERECHOS HUMANOS.pdf" },
        ],
    }, 
    {
        id: "protocolos",
        titulo: "Protocolos",
        documentos: [
            { id: "pro1", titulo: "PROTOCOLO DE PREVENCIÓN, ACTUACIÓN Y SANCIÓN EN CASOS DE VIOLENCIA", archivo: "/Protocolos/PROTOCOLO DE PREVENCION, ACTUACION Y SANCION EN CASOS DE VIOLENCIA.pdf" },
        ],
    },
    {
        id: "reglamentos",
        titulo: "Reglamentos",
        documentos: [
            { id: "reg1", titulo: "REGLAMENTO DE LA LEY PARA LA IGUALDAD ENTRE MUJERES Y HOMBRES DEL ESTADO DE PUEBLA", archivo: "/Reglamentos/REGLAMENTO_DE_LA_LEY_PARA_LA_IGUALDAD_ENTRE_MUJERES_Y_HOMBRES_DEL_ESTADO_DE_PUEBLA_1122010.pdf" },
            { id: "reg2", titulo: "REGLAMENTO DE ACADEMIAS", archivo: "/Reglamentos/1 REGLAMENTO DE ACADEMIAS.pdf" },
            { id: "reg3", titulo: "REGLAMENTO DE CERTIFICACIÓN, ACREDITACIÓN Y TITULACIÓN", archivo: "/Reglamentos/2 REGLAMENTO DE CERTIFICACIÓN, ACREDITACIÓN Y TITULACIÓN.pdf" },
            { id: "reg4", titulo: "REGLAMENTO DE ESTADÍAS DE LOS ALUMNOS EN EL SECTOR PRODUCTIVO", archivo: "/Reglamentos/3 REGLAMENTO DE ESTADÍAS DE LOS ALUMNOS EN EL SECTOR PRODUCTIVO.pdf" },
            { id: "reg5", titulo: "REGLAMENTO DE INGRESO, PROMOCIÓN Y PERMANENCIA DEL PERSONAL ACADÉMICO (RIPPPA)", archivo: "/Reglamentos/4 REGLAMENTO DE INGRESO, PROMOCIÓN Y PERMANENCIA DEL PERSONAL ACADÉMICO (RIPPPA).pdf" },
            { id: "reg6", titulo: "REGLAMENTO DE LA INCUBADORA DE EMPRESAS DE LA UTTECAM", archivo: "/Reglamentos/5 REGLAMENTO DE LA INCUBADORA DE EMPRESAS DE LA UTTECAM.pdf" },
            { id: "reg7", titulo: "REGLAMENTO DE PROTECCIÓN CONTRA EXPOSICIÓN AL HUMO DE TABACO DENTRO DE LAS INSTALACIONES DE LA UNIVERSIDAD", archivo: "/Reglamentos/6 REGLAMENTO DE PROTECCIÓN CONTRA EXPOSICIÓN AL HUMO DE TABACO DENTRO DE LAS INSTALACIONES DE LA UNIVERSIDAD.pdf" },
            { id: "reg8", titulo: "REGLAMENTO DE RESPONSABILIDADES", archivo: "/Reglamentos/7 REGLAMENTO DE RESPONSABILIDADES.pdf" },
            { id: "reg9", titulo: "REGLAMENTO DE VISITAS INDUSTRIALES", archivo: "/Reglamentos/8 REGLAMENTO DE VISITAS INDUSTRIALES.pdf" },
            { id: "reg10", titulo: "REGLAMENTO DEL COMITÉ DE ADQUISICIONES, ARRENDAMIENTOS Y SERVICIOS DE LA UTTECAM", archivo: "/Reglamentos/9 REGLAMENTO DEL COMITÉ DE ADQUISICIONES, ARRENDAMIENTOS Y SERVICIOS DE LA UTTECAM.pdf" },
            { id: "reg11", titulo: "REGLAMENTO DEL CONSEJO DIRECTIVO DE LA UTTECAM", archivo: "/Reglamentos/10 REGLAMENTO DEL CONSEJO DIRECTIVO DE LA UTTECAM.pdf" },
            { id: "reg12", titulo: "REGLAMENTO DEL CONSEJO EDITORIAL", archivo: "/Reglamentos/11 REGLAMENTO DEL CONSEJO EDITORIAL.pdf" },
            { id: "reg13", titulo: "REGLAMENTO DEL PROGRAMA INSTITUCIONAL DE TUTORÍAS", archivo: "/Reglamentos/12 REGLAMENTO DEL PROGRAMA INSTITUCIONAL DE TUTORÍAS.pdf" },
            { id: "reg14", titulo: "REGLAMENTO DE SERVICIO SOCIAL DE LA UTTECAM", archivo: "/Reglamentos/13 REGLAMENTO DE SERVICIO SOCIAL DE LA UTTECAM.pdf" },
            { id: "reg15", titulo: "REGLAMENTO GENERAL SOBRE EL USO Y FUNCIONAMIENTO DE LA BIBLIOTECA", archivo: "/Reglamentos/14 REGLAMENTO GENERAL SOBRE EL USO Y FUNCIONAMIENTO DE LA BIBLIOTECA.pdf" },
            { id: "reg16", titulo: "REGLAMENTO INTERIOR DE LA UTTECAM", archivo: "/Reglamentos/15 REGLAMENTO INTERIOR DE LA UTTECAM.pdf" },
            { id: "reg17", titulo: "REGLAMENTO INTERIOR DE TRABAJO DEL PERSONAL DE LA UTTECAM", archivo: "/Reglamentos/16 REGLAMENTO INTERIOR DE TRABAJO DEL PERSONAL DE LA UTTECAM.pdf" },
            { id: "reg18", titulo: "REGLAMENTO PARA LA EVALUACIÓN DE LOS APRENDIZAJES", archivo: "/Reglamentos/17 REGLAMENTO PARA LA EVALUACIÓN DE LOS APRENDIZAJES.pdf" },
            { id: "reg19", titulo: "REGLAMENTO PARA LA REGULARIZACIÓN DE BECAS Y CRÉDITOS EDUCATIVOS", archivo: "/Reglamentos/18 REGLAMENTO PARA LA REGULARIZACIÓN DE BECAS Y CRÉDITOS EDUCATIVOS.pdf" },
            { id: "reg20", titulo: "REGLAMENTO QUE NORMA EL USO DE LOS LABORATORIOS Y EL TALLER DE LA CARRERA DE TECNOLOGÍA DE ALIMENTOS", archivo: "/Reglamentos/19 REGLAMENTO QUE NORMA EL SUO DE LOS LABORATORIOS Y EL TALLER DE LA CARRERA DE TECNOLOGÍA DE ALIMENTOS.pdf" },
            { id: "reg21", titulo: "REGLAMENTO QUE NORMA EL USO DE LOS LABORATORIOS Y EL TALLER DE LA CARRERA DE MANTENIMIENTO INDUSTRIAL", archivo: "/Reglamentos/20 REGLAMENTO QUE NORMA EL USO DE LOS LABORATORIOS Y EL TALLER DE LA CARRERA DE MANTENIMIENTO INDUSTRIAL.pdf" },
            { id: "reg22", titulo: "REGLAMENTO QUE NORMA EL USO DE LOS LABORATORIOS Y TALLERES DE LA CARRERA DE PROCESOS DE PRODUCCIÓN", archivo: "/Reglamentos/21 REGLAMENTO QUE NORMA EL USO DE LOS LABORATORIOS Y TALLERES DE LA CARRERA DE PROCESOS DE PRODUCCIÓN.pdf" },
            { id: "reg23", titulo: "REGLAMENTO QUE REGULA EL USO DE VEHÍCULOS OFICIALES DE LA UTTECAM", archivo: "/Reglamentos/22 REGLAMENTO QUE REGULA EL USO DE VEHÍCULOS OFICIALES DE LA UTTECAM.pdf" },
            { id: "reg24", titulo: "REGLAMENTO QUE REGULA LOS DERECHOS Y OBLIGACIONES DE LOS ALUMNOS", archivo: "/Reglamentos/23 REGLAMENTO QUE REGULA LOS DERECHOS Y OBLIGACIONES DE LOS ALUMNOS.pdf" },
            { id: "reg25", titulo: "REQUISITOS DE EQUIVALENCIA ENTRE OTROS SISTEMAS DE EDUCACIÓN SUPERIOR AL DE UTs", archivo: "/Reglamentos/Requisitos de Equivalencia entre otros Sistemas de Educacion Superior al de UTs.pdf" },
            { id: "reg26", titulo: "REQUISITOS DE EQUIVALENCIA ENTRE UTs", archivo: "/Reglamentos/Requisitos de Equivalencia entre UTs.pdf" },
        ],
    },
    {
        id: "convocatoria_personal_academico",
        titulo: "Convocatoria de Personal Académico",
        documentos: [
            { id: "conv1", titulo: "CONVOCATORIA PA", archivo: "/Convocatoria/ConvocatoriaPA.pdf" },
        ],
    },
];

function load(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      save(initialDatos);
      return initialDatos;
    }
    return JSON.parse(raw) as Category[];
  } catch (err) {
    console.warn('normatividadService: error loading, resetting', err);
    save(initialDatos);
    return initialDatos;
  }
}

function save(data: Category[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}

export const normatividadService = {
  getAll(): Category[] {
    return load();
  },
  addCategory(titulo: string) {
    const data = load();
    const id = titulo.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString(36);
    data.push({ id, titulo, documentos: [] });
    save(data);
    return id;
  },
  addDocument(categoryId: string, titulo: string, archivo: string, archivoName?: string) {
    const data = load();
    const cat = data.find(c => c.id === categoryId);
    if (!cat) throw new Error('Categoría no encontrada');
    const id = generateId('doc_');
    const doc: DocumentItem = { id, titulo, archivo, archivoName };
    cat.documentos.push(doc);
    save(data);
    return doc;
  },
  deleteDocument(categoryId: string, docId: string) {
    const data = load();
    const cat = data.find(c => c.id === categoryId);
    if (!cat) return false;
    cat.documentos = cat.documentos.filter(d => d.id !== docId);
    save(data);
    return true;
  },
  updateDocument(categoryId: string, docId: string, patch: Partial<DocumentItem>) {
    const data = load();
    const cat = data.find(c => c.id === categoryId);
    if (!cat) return false;
    const doc = cat.documentos.find(d => d.id === docId);
    if (!doc) return false;
    Object.assign(doc, patch);
    save(data);
    return true;
  }
};

export default normatividadService;
