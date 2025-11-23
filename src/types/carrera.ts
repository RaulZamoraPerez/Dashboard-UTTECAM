// Tipos para Carreras
export interface Carrera {
  id: number;
  nombre: string;
  siglas: string;
  nivel: 'Ingenieria' | 'Licenciatura';
  duracion: string;
  objetivo: string;
  perfil_ingreso: string;
  perfil_egreso: string;
  campo_laboral: string;
  imagen: string;
  imagen_portada?: string;
  video_url?: string;
  plan_estudios_url?: string;
  mapa_curricular?: any;
  competencias?: string;
  atributos_egreso?: string;
  objetivos_educacionales?: string;
  orden: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCarreraRequest {
  nombre: string;
  siglas: string;
  nivel: 'Ingenieria' | 'Licenciatura';
  duracion: string;
  objetivo: string;
  perfil_ingreso: string;
  perfil_egreso: string;
  campo_laboral: string;
  imagen: File;
  imagen_portada?: File;
  video?: File;
  plan_estudios?: File;
  mapa_curricular?: any;
  competencias?: string;
  atributos_egreso?: string;
  objetivos_educacionales?: string;
  orden: number;
  activo: boolean;
}

export interface UpdateCarreraRequest {
  nombre?: string;
  siglas?: string;
  nivel?: 'Ingenieria' | 'Licenciatura';
  duracion?: string;
  objetivo?: string;
  perfil_ingreso?: string;
  perfil_egreso?: string;
  campo_laboral?: string;
  imagen?: File;
  imagen_portada?: File;
  video?: File;
  plan_estudios?: File;
  mapa_curricular?: any;
  competencias?: string;
  atributos_egreso?: string;
  objetivos_educacionales?: string;
  orden?: number;
  activo?: boolean;
}
