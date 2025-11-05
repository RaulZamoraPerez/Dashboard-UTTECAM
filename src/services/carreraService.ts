import type { Carrera, CreateCarreraRequest, UpdateCarreraRequest } from '../types/carrera';

const API_URL = import.meta.env.VITE_API_URL || '';

// GET - Obtener todas las carreras (admin - incluye inactivas)
export const getAllCarreras = async (token: string): Promise<Carrera[]> => {
  const response = await fetch(`${API_URL}/api/carreras/admin/all`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) throw new Error('Error al obtener carreras');
  return response.json();
};

// GET - Obtener carreras activas (público)
export const getCarreras = async (): Promise<Carrera[]> => {
  const response = await fetch(`${API_URL}/api/carreras`);
  if (!response.ok) throw new Error('Error al obtener carreras');
  return response.json();
};

// GET - Obtener carreras por nivel
export const getCarrerasByNivel = async (nivel: string): Promise<Carrera[]> => {
  const response = await fetch(`${API_URL}/api/carreras/nivel/${nivel}`);
  if (!response.ok) throw new Error('Error al obtener carreras por nivel');
  return response.json();
};

// GET - Obtener una carrera por ID
export const getCarreraById = async (id: number): Promise<Carrera> => {
  const response = await fetch(`${API_URL}/api/carreras/${id}`);
  if (!response.ok) throw new Error('Error al obtener carrera');
  return response.json();
};

// POST - Crear carrera
export const createCarrera = async (data: CreateCarreraRequest, token: string): Promise<Carrera> => {
  const formData = new FormData();
  formData.append('nombre', data.nombre);
  formData.append('siglas', data.siglas);
  formData.append('nivel', data.nivel);
  formData.append('modalidad', data.modalidad);
  formData.append('duracion', data.duracion);
  formData.append('objetivo', data.objetivo);
  formData.append('perfil_ingreso', data.perfil_ingreso);
  formData.append('perfil_egreso', data.perfil_egreso);
  formData.append('campo_laboral', data.campo_laboral);
  formData.append('orden', data.orden.toString());
  formData.append('activo', data.activo.toString());
  formData.append('imagen', data.imagen);
  
  if (data.plan_estudios) {
    formData.append('plan_estudios', data.plan_estudios);
  }

  const response = await fetch(`${API_URL}/api/carreras`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) throw new Error('Error al crear carrera');
  return response.json();
};

// PUT - Actualizar carrera
export const updateCarrera = async (id: number, data: UpdateCarreraRequest, token: string): Promise<Carrera> => {
  const formData = new FormData();
  
  if (data.nombre) formData.append('nombre', data.nombre);
  if (data.siglas) formData.append('siglas', data.siglas);
  if (data.nivel) formData.append('nivel', data.nivel);
  if (data.modalidad) formData.append('modalidad', data.modalidad);
  if (data.duracion) formData.append('duracion', data.duracion);
  if (data.objetivo) formData.append('objetivo', data.objetivo);
  if (data.perfil_ingreso) formData.append('perfil_ingreso', data.perfil_ingreso);
  if (data.perfil_egreso) formData.append('perfil_egreso', data.perfil_egreso);
  if (data.campo_laboral) formData.append('campo_laboral', data.campo_laboral);
  if (data.orden !== undefined) formData.append('orden', data.orden.toString());
  if (data.activo !== undefined) formData.append('activo', data.activo.toString());
  if (data.imagen) formData.append('imagen', data.imagen);
  if (data.plan_estudios) formData.append('plan_estudios', data.plan_estudios);

  const response = await fetch(`${API_URL}/api/carreras/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) throw new Error('Error al actualizar carrera');
  return response.json();
};

// DELETE - Eliminar carrera
export const deleteCarrera = async (id: number, token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/carreras/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error('Error al eliminar carrera');
};

// Helpers para obtener URLs de archivos
export const getCarreraImageUrl = (filename: string): string => {
  return `${API_URL}/uploads/carreras/${filename}`;
};

export const getCarreraPlanUrl = (filename: string): string => {
  return `${API_URL}/uploads/carreras/planes/${filename}`;
};
