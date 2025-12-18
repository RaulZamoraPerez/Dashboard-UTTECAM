import type { HeroSlide, CreateHeroSlideRequest, UpdateHeroSlideRequest, Evento, CreateEventoRequest, UpdateEventoRequest, Noticia, CreateNoticiaRequest, UpdateNoticiaRequest, Anuncio, CreateAnuncioRequest, UpdateAnuncioRequest } from '../types/home';

const API_URL = import.meta.env.VITE_API_URL || '';

// ==================== HERO SLIDES ====================
export const getHeroSlides = async (includeInactive: boolean = false): Promise<HeroSlide[]> => {
  const response = await fetch(`${API_URL}/api/hero-slides${includeInactive ? '?includeInactive=true' : ''}`);
  if (!response.ok) throw new Error('Error al obtener hero slides');
  return response.json();
};

export const createHeroSlide = async (data: CreateHeroSlideRequest, token: string): Promise<HeroSlide> => {
  const formData = new FormData();
  formData.append('titulo', data.titulo);
  formData.append('tipo', data.tipo);
  formData.append('archivo', data.archivo);

  const response = await fetch(`${API_URL}/api/hero-slides`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    let message = `Status ${response.status}`;
    try {
      const data = await response.json();
      message += ` - ${data.error || data.message || JSON.stringify(data)}`;
    } catch (e) {
      const text = await response.text();
      if (text) message += ` - ${text}`;
    }
    throw new Error(`Error al crear hero slide: ${message}`);
  }

  return response.json();
};

export const updateHeroSlide = async (id: number, data: UpdateHeroSlideRequest, token: string): Promise<HeroSlide> => {
  const formData = new FormData();
  if (data.titulo) formData.append('titulo', data.titulo);
  if (data.tipo) formData.append('tipo', data.tipo);
  if (data.orden !== undefined) formData.append('orden', data.orden.toString());
  if (data.activo !== undefined) formData.append('activo', data.activo.toString());
  if (data.archivo) formData.append('archivo', data.archivo);

  const response = await fetch(`${API_URL}/api/hero-slides/${id}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) throw new Error('Error al actualizar hero slide');
  return response.json();
};

export const deleteHeroSlide = async (id: number, token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/hero-slides/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) throw new Error('Error al eliminar hero slide');
};

export const getHeroSlideFileUrl = (filename: string): string => {
  if (!filename) return '';
  if (filename.startsWith('http')) return filename;
  if (filename.startsWith('/')) return `${API_URL}${filename}`;
  return `${API_URL}/uploads/hero/${filename}`;
};

// ==================== EVENTOS ====================
export const getEventos = async (includeInactive: boolean = false, includePast: boolean = false): Promise<Evento[]> => {
  const params = new URLSearchParams();
  if (includeInactive) params.set('includeInactive', 'true');
  if (includePast) params.set('includePast', 'true');
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_URL}/api/eventos${query}`);
  if (!response.ok) throw new Error('Error al obtener eventos');
  return response.json();
};

export const getEventoActivo = async (): Promise<Evento> => {
  const response = await fetch(`${API_URL}/api/eventos/activo`);
  if (!response.ok) throw new Error('Error al obtener evento activo');
  return response.json();
};

export const createEvento = async (data: CreateEventoRequest, token: string): Promise<Evento> => {
  const formData = new FormData();
  formData.append('titulo', data.titulo);
  formData.append('fecha_evento', data.fecha_evento);
  if (data.descripcion) formData.append('descripcion', data.descripcion);
  if (data.tema) formData.append('tema', data.tema);
  if (data.color) formData.append('color', data.color);
  if (data.activo !== undefined) formData.append('activo', data.activo.toString());
  if (data.imagen_fondo) formData.append('imagen_fondo', data.imagen_fondo);
  if ((data as any).imagen_fondo_remove) formData.append('imagen_fondo_remove', 'true');
  // Allow empty strings to be sent so the server can clear previous values
  formData.append('texto_boton', data.texto_boton !== undefined ? data.texto_boton : '');
  formData.append('url_boton', data.url_boton !== undefined ? data.url_boton : '');

  const response = await fetch(`${API_URL}/api/eventos`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) throw new Error('Error al crear evento');
  return response.json();
};

export const updateEvento = async (id: number, data: UpdateEventoRequest, token: string): Promise<Evento> => {
  const formData = new FormData();
  if (data.titulo) formData.append('titulo', data.titulo);
  if (data.descripcion) formData.append('descripcion', data.descripcion);
  if (data.fecha_evento) formData.append('fecha_evento', data.fecha_evento);
  if (data.tema) formData.append('tema', data.tema);
  if (data.color) formData.append('color', data.color);
  if (data.activo !== undefined) formData.append('activo', data.activo.toString());
  if (data.imagen_fondo) formData.append('imagen_fondo', data.imagen_fondo);
  if ((data as any).imagen_fondo_remove) formData.append('imagen_fondo_remove', 'true');
  // Important: append even empty strings (''), so the server can clear stored values
  formData.append('texto_boton', data.texto_boton !== undefined ? data.texto_boton : '');
  formData.append('url_boton', data.url_boton !== undefined ? data.url_boton : '');

  const response = await fetch(`${API_URL}/api/eventos/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) throw new Error('Error al actualizar evento');
  return response.json();
};

export const deleteEvento = async (id: number, token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/eventos/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) throw new Error('Error al eliminar evento');
};

// ==================== NOTICIAS ====================
export const getNoticias = async (includeInactive: boolean = false): Promise<Noticia[]> => {
  const params = new URLSearchParams();
  if (includeInactive) params.set('includeInactive', 'true');
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_URL}/api/noticias${query}`);
  if (!response.ok) throw new Error('Error al obtener noticias');
  return response.json();
};

export const createNoticia = async (data: CreateNoticiaRequest, token: string): Promise<Noticia> => {
  const formData = new FormData();
  formData.append('titulo', data.titulo);
  formData.append('imagen', data.imagen);

  const response = await fetch(`${API_URL}/api/noticias`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) throw new Error('Error al crear noticia');
  return response.json();
};

export const updateNoticia = async (id: number, data: UpdateNoticiaRequest, token: string): Promise<Noticia> => {
  const formData = new FormData();
  if (data.titulo) formData.append('titulo', data.titulo);
  if (data.orden !== undefined) formData.append('orden', data.orden.toString());
  if (data.activo !== undefined) formData.append('activo', data.activo.toString());
  if (data.imagen) formData.append('imagen', data.imagen);

  const response = await fetch(`${API_URL}/api/noticias/${id}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) throw new Error('Error al actualizar noticia');
  return response.json();
};

export const deleteNoticia = async (id: number, token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/noticias/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) throw new Error('Error al eliminar noticia');
};

export const getNoticiaFileUrl = (filename: string): string => {
  return `${API_URL}/uploads/noticias/${filename}`;
};

// ==================== ANUNCIOS ====================
export const getAnuncios = async (): Promise<Anuncio[]> => {
  const response = await fetch(`${API_URL}/api/anuncios`);
  if (!response.ok) throw new Error('Error al obtener anuncios');
  return response.json();
};

export const getAnuncioActivo = async (): Promise<Anuncio> => {
  const response = await fetch(`${API_URL}/api/anuncios/activo`);
  if (!response.ok) throw new Error('Error al obtener anuncio activo');
  return response.json();
};

export const createAnuncio = async (data: CreateAnuncioRequest, token: string): Promise<Anuncio> => {
  const formData = new FormData();
  formData.append('titulo', data.titulo);
  formData.append('fecha_inicio', data.fecha_inicio);
  formData.append('fecha_fin', data.fecha_fin);
  if (data.activo !== undefined) formData.append('activo', data.activo.toString());
  formData.append('imagen', data.imagen);

  const response = await fetch(`${API_URL}/api/anuncios`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) throw new Error('Error al crear anuncio');
  return response.json();
};

export const updateAnuncio = async (id: number, data: UpdateAnuncioRequest, token: string): Promise<Anuncio> => {
  const formData = new FormData();
  if (data.titulo) formData.append('titulo', data.titulo);
  if (data.fecha_inicio) formData.append('fecha_inicio', data.fecha_inicio);
  if (data.fecha_fin) formData.append('fecha_fin', data.fecha_fin);
  if (data.activo !== undefined) formData.append('activo', data.activo.toString());
  if (data.imagen) formData.append('imagen', data.imagen);

  const response = await fetch(`${API_URL}/api/anuncios/${id}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) throw new Error('Error al actualizar anuncio');
  return response.json();
};

export const deleteAnuncio = async (id: number, token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/anuncios/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) throw new Error('Error al eliminar anuncio');
};

export const getAnuncioFileUrl = (filename: string): string => {
  return `${API_URL}/uploads/anuncios/${filename}`;
};
