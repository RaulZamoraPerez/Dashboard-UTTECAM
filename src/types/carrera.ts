// Tipos para Carreras
export interface Carrera {
  id: number;
  nombre: string;
  siglas: string;
  nivel: 'TSU' | 'Ingenieria' | 'Licenciatura';
  modalidad: 'Escolarizada' | 'Ejecutiva' | 'Mixta';
  duracion: string;
  objetivo: string;
  perfil_ingreso: string;
  perfil_egreso: string;
  campo_laboral: string;
  imagen: string;
  plan_estudios_url?: string;
  orden: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCarreraRequest {
  nombre: string;
  siglas: string;
  nivel: 'TSU' | 'Ingenieria' | 'Licenciatura';
  modalidad: 'Escolarizada' | 'Ejecutiva' | 'Mixta';
  duracion: string;
  objetivo: string;
  perfil_ingreso: string;
  perfil_egreso: string;
  campo_laboral: string;
  imagen: File;
  plan_estudios?: File;
  orden: number;
  activo: boolean;
}

export interface UpdateCarreraRequest {
  nombre?: string;
  siglas?: string;
  nivel?: 'TSU' | 'Ingenieria' | 'Licenciatura';
  modalidad?: 'Escolarizada' | 'Ejecutiva' | 'Mixta';
  duracion?: string;
  objetivo?: string;
  perfil_ingreso?: string;
  perfil_egreso?: string;
  campo_laboral?: string;
  imagen?: File;
  plan_estudios?: File;
  orden?: number;
  activo?: boolean;
}
