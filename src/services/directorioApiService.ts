import { fetchWithAuth, fetchWithAuthResponse } from './apiService';

const PREFIX = '/api/directorios';

export async function getAll() {
  return await fetchWithAuth<any>(`${PREFIX}`, {}, false);
}

export async function create(data: {
  titulo: string;
  nombre: string;
  telefono?: string;
  extension?: string;
  correo?: string;
  imagenFile?: File | null;
  orden?: number;
  activo?: boolean;
}) {
  const fd = new FormData();
  fd.append('titulo', data.titulo);
  fd.append('nombre', data.nombre);
  if (data.telefono) fd.append('telefono', data.telefono);
  if (data.extension) fd.append('extension', data.extension);
  if (data.correo) fd.append('correo', data.correo);
  if (data.imagenFile) fd.append('imagen', data.imagenFile as Blob);
  if (data.orden !== undefined) fd.append('orden', String(data.orden));
  if (data.activo !== undefined) fd.append('activo', String(data.activo));

  // Usar fetchWithAuthResponse para evitar redirección automática en 401
  const resp = await fetchWithAuthResponse(`${PREFIX}`, { method: 'POST', body: fd }, false);
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ message: 'Error creando directorio' }));
    throw new Error(err.message || 'Error creando directorio');
  }
  return await resp.json();
}

export async function update(id: number, data: {
  titulo: string;
  nombre: string;
  telefono?: string;
  extension?: string;
  correo?: string;
  imagenFile?: File | null;
  orden?: number;
  activo?: boolean;
}) {
  const fd = new FormData();
  fd.append('titulo', data.titulo);
  fd.append('nombre', data.nombre);
  if (data.telefono) fd.append('telefono', data.telefono);
  if (data.extension) fd.append('extension', data.extension);
  if (data.correo) fd.append('correo', data.correo);
  if (data.imagenFile) fd.append('imagen', data.imagenFile as Blob);
  if (data.orden !== undefined) fd.append('orden', String(data.orden));
  if (data.activo !== undefined) fd.append('activo', String(data.activo));

  const resp = await fetchWithAuthResponse(`${PREFIX}/${id}`, { method: 'PUT', body: fd }, false);
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ message: 'Error actualizando directorio' }));
    throw new Error(err.message || 'Error actualizando directorio');
  }
  return await resp.json();
}

export async function remove(id: number) {
  const resp = await fetchWithAuthResponse(`${PREFIX}/${id}`, { method: 'DELETE' }, false);
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ message: 'Error eliminando directorio' }));
    throw new Error(err.message || 'Error eliminando directorio');
  }
  return await resp.json();
}

export async function updateOrder(listaIds: number[]) {
  const resp = await fetchWithAuthResponse(`${PREFIX}/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listaIds })
  }, false);
  if (!resp.ok) {
    throw new Error('Error actualizando el orden');
  }
  return await resp.json();
}
