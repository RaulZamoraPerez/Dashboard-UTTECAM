// Tipos compartidos para el sistema de gestión de apartados y documentos

export interface Documento {
  id: string;
  nombre: string;
  archivo: string;
  fechaSubida: Date;
}

export interface Apartado {
  id: string;
  titulo: string;
  descripcion?: string;
  fechaCreacion: Date;
  documentos: Documento[];
}

export interface ApartadoFormData {
  titulo: string;
  descripcion?: string;
}

export interface DocumentoFormData {
  nombre: string;
  archivo: File | null;
}
