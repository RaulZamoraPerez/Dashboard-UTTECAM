// Tipos para Hero Slides
export interface HeroSlide {
  id: number;
  titulo: string;
  tipo: 'imagen' | 'video';
  archivo: string;
  orden: number;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface CreateHeroSlideRequest {
  titulo: string;
  tipo: 'imagen' | 'video';
  archivo: File;
}

export interface UpdateHeroSlideRequest {
  titulo?: string;
  tipo?: 'imagen' | 'video';
  orden?: number;
  activo?: boolean;
  archivo?: File;
}

// Tipos para Eventos
export interface Evento {
  id: number;
  titulo: string;
  descripcion?: string;
  fecha_evento: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface CreateEventoRequest {
  titulo: string;
  descripcion?: string;
  fecha_evento: string;
  activo?: boolean;
}

export interface UpdateEventoRequest {
  titulo?: string;
  descripcion?: string;
  fecha_evento?: string;
  activo?: boolean;
}

// Tipos para Noticias
export interface Noticia {
  id: number;
  titulo: string;
  imagen: string;
  orden: number;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface CreateNoticiaRequest {
  titulo: string;
  imagen: File;
}

export interface UpdateNoticiaRequest {
  titulo?: string;
  orden?: number;
  activo?: boolean;
  imagen?: File;
}

// Tipos para Anuncios
export interface Anuncio {
  id: number;
  titulo: string;
  imagen: string;
  activo: boolean;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface CreateAnuncioRequest {
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo?: boolean;
  imagen: File;
}

export interface UpdateAnuncioRequest {
  titulo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  activo?: boolean;
  imagen?: File;
}
