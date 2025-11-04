// services/organigramaService.ts
import { fetchWithAuth } from './apiService';
import { Organigrama, CreateOrganigramaRequest, OrganigramaNode } from '../types/organigrama';

const API_BASE_URL = import.meta.env.VITE_BACKENDURL || '';

export const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) {
    return '/images/default-avatar.png';
  }
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return `${API_BASE_URL}/uploads/organigrama/${imagePath}`;
};

export const getAllOrganigrama = async (): Promise<Organigrama[]> => {
  const response = await fetchWithAuth<{ data: Organigrama[] }>('/api/organigrama/flat');
  return response.data;
};

export const getOrganigramaTree = async (): Promise<OrganigramaNode[]> => {
  const response = await fetchWithAuth<{ data: OrganigramaNode[] }>('/api/organigrama');
  return response.data;
};

export const getOrganigramaById = async (id: number): Promise<Organigrama> => {
  const response = await fetchWithAuth<{ data: Organigrama }>(`/api/organigrama/${id}`);
  return response.data;
};

export const createOrganigrama = async (
  data: CreateOrganigramaRequest,
  imagen?: File
): Promise<Organigrama> => {
  const formData = new FormData();
  if (data.key) formData.append('key', data.key);
  if (data.parent_id) formData.append('parent_id', data.parent_id.toString());
  if (data.expanded !== undefined) formData.append('expanded', data.expanded.toString());
  formData.append('type', data.type);
  formData.append('name', data.name);
  formData.append('title', data.title);
  if (data.text) formData.append('text', data.text);
  if (data.order_position) formData.append('order_position', data.order_position.toString());
  if (imagen) formData.append('imagen', imagen);

  const response = await fetchWithAuth<{ data: Organigrama }>('/api/organigrama', {
    method: 'POST',
    body: formData,
    headers: {
      // No establecer Content-Type, el navegador lo hará automáticamente con boundary
    },
  });

  return response.data;
};

export const updateOrganigrama = async (
  id: number,
  data: CreateOrganigramaRequest,
  imagen?: File
): Promise<Organigrama> => {
  const formData = new FormData();
  if (data.key) formData.append('key', data.key);
  if (data.parent_id) formData.append('parent_id', data.parent_id.toString());
  if (data.expanded !== undefined) formData.append('expanded', data.expanded.toString());
  formData.append('type', data.type);
  formData.append('name', data.name);
  formData.append('title', data.title);
  if (data.text) formData.append('text', data.text);
  if (data.order_position) formData.append('order_position', data.order_position.toString());
  if (imagen) formData.append('imagen', imagen);

  const response = await fetchWithAuth<{ data: Organigrama }>(`/api/organigrama/${id}`, {
    method: 'PUT',
    body: formData,
    headers: {
      // No establecer Content-Type, el navegador lo hará automáticamente con boundary
    },
  });

  return response.data;
};

export const deleteOrganigrama = async (id: number): Promise<void> => {
  await fetchWithAuth(`/api/organigrama/${id}`, {
    method: 'DELETE',
  });
};
