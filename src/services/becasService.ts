import { fetchWithAuth } from './apiService';

export interface BecaSection {
    id: number;
    type: 'header' | 'requirements' | 'documents' | 'links' | 'platform' | 'results' | 'banner' | 'avisos' | 'convocatoria' | 'footer' | 'repository';
    title: string;
    data: any;
    order: number;
    active: boolean;
}

export interface CreateSectionData {
    title: string;
    type: 'header' | 'requirements' | 'documents' | 'links' | 'platform' | 'results' | 'banner' | 'avisos' | 'convocatoria' | 'footer' | 'repository';
    data: any;
}

export interface UpdateSectionData {
    title?: string;
    data?: any;
    active?: boolean;
}

export interface ReorderSection {
    id: number;
    order: number;
}

const becasService = {
    // ============================================
    // SECTIONS
    // ============================================

    /**
     * Obtener todas las secciones activas
     */
    async getAllSections(): Promise<BecaSection[]> {
        return fetchWithAuth<BecaSection[]>('/api/becas/sections', {
            method: 'GET',
        });
    },

    /**
     * Obtener una sección específica por ID
     */
    async getSection(id: number): Promise<BecaSection> {
        return fetchWithAuth<BecaSection>(`/api/becas/sections/${id}`, {
            method: 'GET',
        });
    },

    /**
     * Crear una nueva sección
     */
    async createSection(data: CreateSectionData): Promise<BecaSection> {
        return fetchWithAuth<BecaSection>('/api/becas/sections', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Actualizar una sección existente
     */
    async updateSection(id: number, data: UpdateSectionData): Promise<BecaSection> {
        return fetchWithAuth<BecaSection>(`/api/becas/sections/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Eliminar una sección
     */
    async deleteSection(id: number): Promise<{ message: string }> {
        return fetchWithAuth<{ message: string }>(`/api/becas/sections/${id}`, {
            method: 'DELETE',
        });
    },

    /**
     * Reordenar secciones
     */
    async reorderSections(sections: ReorderSection[]): Promise<BecaSection[]> {
        return fetchWithAuth<BecaSection[]>('/api/becas/sections/reorder', {
            method: 'PUT',
            body: JSON.stringify({ sections }),
        });
    },

    // ============================================
    // DOCUMENTS (OBSOLETE - Handled inside section data now)
    // ============================================

    /**
     * Subir archivo para banner (imagen o PDF)
     */
    async uploadBannerFile(file: File): Promise<{ url: string }> {
        const formData = new FormData();
        formData.append('bannerUpload', file);

        return fetchWithAuth<{ url: string }>('/api/becas/upload-file', {
            method: 'POST',
            body: formData,
        });
    },
};

export default becasService;
