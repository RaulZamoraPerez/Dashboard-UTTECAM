// types/calendario.ts
export interface Calendario {
  id: number;
  titulo: string;
  descripcion?: string;
  archivo: string;
  fechaSubida: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalendarioRequest {
  titulo: string;
  descripcion?: string;
  archivo: File;
}