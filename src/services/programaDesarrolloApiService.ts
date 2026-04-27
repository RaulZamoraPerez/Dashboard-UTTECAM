const API_URL = import.meta.env.VITE_BACKENDURL || '';

export default {
  async getAll(admin = false) {
    const res = await fetch(`${API_URL}/api/programas-desarrollo${admin ? '?admin=true' : ''}`);
    if (!res.ok) throw new Error('Error fetching programs');
    return res.json();
  },

  async createCategory(titulo: string) {
    const res = await fetch(`${API_URL}/api/programas-desarrollo/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo }),
    });
    if (!res.ok) throw new Error('Error creating category');
    return res.json();
  },

  async updateCategory(id: string | number, titulo: string) {
    const res = await fetch(`${API_URL}/api/programas-desarrollo/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo }),
    });
    if (!res.ok) throw new Error('Error updating category');
    return res.json();
  },

  async deleteCategory(id: string | number) {
    const res = await fetch(`${API_URL}/api/programas-desarrollo/categories/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error deleting category');
    return res.json();
  },

  async uploadDocument(categoriaId: string | number, file: File, titulo?: string, descripcion?: string) {
    const fd = new FormData();
    fd.append('archivo', file);
    fd.append('categoria_id', String(categoriaId));
    if (titulo) fd.append('titulo', titulo);
    if (descripcion) fd.append('descripcion', descripcion || '');
    fd.append('activo', 'true');

    const res = await fetch(`${API_URL}/api/programas-desarrollo`, {
      method: 'POST',
      body: fd,
    });
    if (!res.ok) throw new Error('Error uploading document');
    return res.json();
  },

  async updateDocument(id: string | number, data: { titulo?: string; descripcion?: string; activo?: boolean; file?: File; categoria_id?: number }) {
    const fd = new FormData();
    if (data.titulo) fd.append('titulo', data.titulo);
    if (data.descripcion !== undefined) fd.append('descripcion', data.descripcion);
    if (data.activo !== undefined) fd.append('activo', String(data.activo));
    if (data.categoria_id) fd.append('categoria_id', String(data.categoria_id));
    if (data.file) fd.append('archivo', data.file);

    const res = await fetch(`${API_URL}/api/programas-desarrollo/${id}`, {
      method: 'PUT',
      body: fd,
    });
    if (!res.ok) throw new Error('Error updating document');
    return res.json();
  },

  async deleteDocument(id: string | number) {
    const res = await fetch(`${API_URL}/api/programas-desarrollo/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error deleting document');
    return res.json();
  }
};
