import { getAuthHeaders } from './authService';

const API_URL = import.meta.env.VITE_BACKENDURL || '';

type CategoryApi = {
  id: number | string;
  key?: string | null;
  titulo: string;
  documentos: Array<any>;
};

export default {
  async getAll(): Promise<CategoryApi[]> {
    const res = await fetch(`${API_URL}/api/quienes-somos/normatividad`);
    if (!res.ok) throw new Error('Error fetching normatividad');
    return res.json();
  },

  async createCategory(titulo: string) {
    const body = { key: titulo.toLowerCase().replace(/\s+/g, '_'), titulo };
    const res = await fetch(`${API_URL}/api/quienes-somos/normatividad/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Error creating category');
    return res.json();
  },

  async uploadDocument(categoriaId: string | number, file: File, titulo?: string) {
    const fd = new FormData();
    fd.append('archivo', file);
    if (titulo) fd.append('titulo', titulo);

    const token = getAuthHeaders().Authorization;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = token as string;

    const res = await fetch(`${API_URL}/api/quienes-somos/normatividad/categories/${categoriaId}/documents/upload`, {
      method: 'POST',
      headers,
      body: fd,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error uploading document');
    }
    return res.json();
  },

  async createDocumentJson(categoriaId: string | number, payload: { titulo: string; archivo: string; archivo_name?: string }) {
    const res = await fetch(`${API_URL}/api/quienes-somos/normatividad/categories/${categoriaId}/documents`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Error creating document');
    return res.json();
  },

  async deleteDocument(id: number | string) {
    const res = await fetch(`${API_URL}/api/quienes-somos/normatividad/documents/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error deleting document');
    return res.json();
  },

  async deleteCategory(id: number | string) {
    const res = await fetch(`${API_URL}/api/quienes-somos/normatividad/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error deleting category');
    return res.json();
  },

  async updateCategory(id: number | string, titulo: string) {
    const res = await fetch(`${API_URL}/api/quienes-somos/normatividad/categories/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ titulo })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error updating category');
    }
    return res.json();
  },

  async updateDocument(id: number | string, data: { titulo?: string; file?: File }) {
    const headers = getAuthHeaders();
    // Always use FormData because the backend route uses multer
    const fd = new FormData();
    if (data.titulo) fd.append('titulo', data.titulo);
    if (data.file) fd.append('archivo', data.file);

    // Remove Content-Type to allow browser to set boundary for FormData
    delete headers['Content-Type'];

    const res = await fetch(`${API_URL}/api/quienes-somos/normatividad/documents/${id}`, {
      method: 'PUT',
      headers,
      body: fd
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error updating document');
    }
    return res.json();
  }
};
