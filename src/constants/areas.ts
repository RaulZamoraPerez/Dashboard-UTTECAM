/**
 * IDs de Áreas en la base de datos
 * Estos deben coincidir con los IDs de la tabla 'area' en la BD
 */
export const AREAS = {
  FINANZAS: 1,
  RECURSOS_HUMANOS: 2,
  GESTION_AMBIENTAL: 3,
  INFORMACION_ESTADIA: 4,
  GESTION_CALIDAD: 5,
  COORDINACION_GENERO: 6,
  PIT: 7,
  SERVICIO_SOCIAL: 8,
  VINCULACION: 9,
  EXTENSION_PROMOCION: 10,
  EXTENSION_GACETAS: 11,
} as const;

export const NOMBRES_AREAS = {
  [AREAS.FINANZAS]: 'Finanzas',
  [AREAS.RECURSOS_HUMANOS]: 'Recursos Humanos',
  [AREAS.GESTION_AMBIENTAL]: 'Gestión Ambiental',
  [AREAS.INFORMACION_ESTADIA]: 'Información de Estadía',
  [AREAS.GESTION_CALIDAD]: 'Gestión de Calidad',
  [AREAS.COORDINACION_GENERO]: 'Coordinación de Género',
  [AREAS.PIT]: 'PIT',
  [AREAS.SERVICIO_SOCIAL]: 'Servicio Social',
  [AREAS.VINCULACION]: 'Vinculación',
  [AREAS.EXTENSION_PROMOCION]: 'Extensión - Promoción',
  [AREAS.EXTENSION_GACETAS]: 'Extensión - Gacetas',
} as const;
