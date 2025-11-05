// types/directorio.ts

export interface Directorio {
  id: number;
  titulo: string;
  nombre: string;
  telefono?: string;
  extension?: string;
  correo?: string;
  imagen?: string;
}

export interface DirectorioFormData {
  titulo: string;
  nombre: string;
  telefono?: string;
  extension?: string;
  correo?: string;
  imagen?: File | null;
}

export interface CreateDirectorioRequest {
  titulo: string;
  nombre: string;
  telefono?: string;
  extension?: string;
  correo?: string;
}

export interface UpdateDirectorioRequest extends CreateDirectorioRequest {
  id: number;
}
