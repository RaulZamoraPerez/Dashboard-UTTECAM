const API_URL = import.meta.env.VITE_BACKENDURL || '';

export default {
    async getBySlug(slug: string, admin = false) {
        const res = await fetch(`${API_URL}/api/comites/${slug}${admin ? '?admin=true' : ''}`);
        if (res.status === 404) return null;
        if (!res.ok) throw new Error('Error fetching comite');
        return res.json();
    },

    async initialize(data: { titulo: string, slug: string, descripcion: string }) {
        const res = await fetch(`${API_URL}/api/comites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, activo: true }),
        });
        if (!res.ok) throw new Error('Error initializing comite');
        return res.json();
    },

    async createCategory(comiteId: number, titulo: string) {
        const res = await fetch(`${API_URL}/api/comites/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comiteId, titulo }),
        });
        if (!res.ok) throw new Error('Error creating category');
        return res.json();
    },

    async updateCategory(id: number, titulo: string) {
        const res = await fetch(`${API_URL}/api/comites/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo }),
        });
        if (!res.ok) throw new Error('Error updating category');
        return res.json();
    },

    async deleteCategory(id: number) {
        const res = await fetch(`${API_URL}/api/comites/categories/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Error deleting category');
        return res.json();
    },

    async uploadDocument(comiteId: number, categoriaId: number, file: File, titulo?: string) {
        const fd = new FormData();
        fd.append('archivo', file);
        fd.append('comiteId', String(comiteId));
        fd.append('categoriaId', String(categoriaId));
        fd.append('titulo', titulo || file.name);
        fd.append('activo', 'true');

        const res = await fetch(`${API_URL}/api/comites/documentos`, {
            method: 'POST',
            body: fd,
        });
        if (!res.ok) throw new Error('Error uploading document');
        return res.json();
    },

    async updateDocument(id: number, data: { titulo: string, activo: boolean, categoriaId?: number, file?: File }) {
        const fd = new FormData();
        fd.append('titulo', data.titulo);
        fd.append('activo', String(data.activo));
        if (data.categoriaId) fd.append('categoriaId', String(data.categoriaId));
        if (data.file) fd.append('archivo', data.file);

        const res = await fetch(`${API_URL}/api/comites/documentos/${id}`, {
            method: 'PUT',
            body: fd,
        });
        if (!res.ok) throw new Error('Error updating document');
        return res.json();
    },

    async deleteDocument(id: number) {
        const res = await fetch(`${API_URL}/api/comites/documentos/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Error deleting document');
        return res.json();
    }
};
