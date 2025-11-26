import axios from 'axios';
import { fetchWithAuth, API_BASE } from './apiService';

// Use shared normalized base from apiService (which returns API base without '/api'); append '/api' here
const API_URL = `${String(API_BASE)}/api`;

// Types
export interface ExtensionItem {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  order_index: number;
  is_active: boolean;
}

export interface ExtensionSection {
  id: number;
  slug: string;
  title: string;
  description?: string;
  items: ExtensionItem[];
  banner_url?: string;
}

export interface ExtensionDocument {
  id: number;
  title: string;
  file_url: string;
  category: string;
  publication_date: string;
  is_active: boolean;
}

// Section Service
export const getSection = async (slug: string): Promise<ExtensionSection> => {
  const response = await axios.get(`${API_URL}/extension/sections/${slug}`);
  return response.data;
};

export const updateSection = async (slug: string, data: Partial<ExtensionSection>) => {
  const response = await axios.put(`${API_URL}/extension/sections/${slug}`, data);
  return response.data;
};

export const uploadSectionBanner = async (slug: string, file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  // Use fetchWithAuth to ensure Authorization header is included
  const result = await fetchWithAuth(`/api/extension/sections/${slug}/upload-image`, {
    method: 'POST',
    body: formData
  }, false);
  return result as any;
};

// Item Service
export const createItem = async (slug: string, data: FormData) => {
  const response = await axios.post(`${API_URL}/extension/sections/${slug}/items`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateItem = async (id: number, data: FormData) => {
  const response = await axios.put(`${API_URL}/extension/items/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteItem = async (id: number) => {
  const response = await axios.delete(`${API_URL}/extension/items/${id}`);
  return response.data;
};

// Document Service
export const getDocuments = async (category: string): Promise<ExtensionDocument[]> => {
  const response = await axios.get(`${API_URL}/extension/documents/${category}`);
  return response.data;
};

export const createDocument = async (data: FormData) => {
  const response = await axios.post(`${API_URL}/extension/documents`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteDocument = async (id: number) => {
  const response = await axios.delete(`${API_URL}/extension/documents/${id}`);
  return response.data;
};
