import { fetchWithAuth } from './apiService';

const API_BASE = '/api/quienes-somos/organigrama';

export interface OrganigramaNode {
  id?: number;
  key?: string;
  parent_id?: number | null;
  expanded?: boolean;
  type?: string;
  data: {
    image: string;
    name: string;
    title: string;
    text?: string;
  };
  children?: OrganigramaNode[];
  order_position?: number;
}

export const getOrganigrama = async (): Promise<OrganigramaNode[]> => {
  const res = await fetch(`${import.meta.env.VITE_BACKENDURL || ''}${API_BASE}`);
  if (!res.ok) throw new Error('Error fetching organigrama');
  const json = await res.json();
  return json.data;
};

export const createNode = async (formData: FormData): Promise<any> => {
  // Use fetchWithAuth to handle token and headers correctly
  // Note: fetchWithAuth handles FormData correctly (doesn't set Content-Type)
  return fetchWithAuth(API_BASE, {
    method: 'POST',
    body: formData
  });
};

export const updateNode = async (id: number, formData: FormData): Promise<any> => {
  return fetchWithAuth(`${API_BASE}/${id}`, {
    method: 'PUT',
    body: formData
  });
};

export const deleteNode = async (id: number): Promise<any> => {
  return fetchWithAuth(`${API_BASE}/${id}`, {
    method: 'DELETE'
  });
};

// Adapters for useOrganigrama hook
export const getAllOrganigrama = getOrganigrama;

export const createOrganigrama = async (data: any, image?: File | null) => {
  const fd = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) fd.append(key, String(data[key]));
  });
  if (image) fd.append('imagen', image);
  return createNode(fd);
};

export const updateOrganigrama = async (id: number, data: any, image?: File | null) => {
  const fd = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) fd.append(key, String(data[key]));
  });
  if (image) fd.append('imagen', image);
  return updateNode(id, fd);
};

export const deleteOrganigrama = deleteNode;
