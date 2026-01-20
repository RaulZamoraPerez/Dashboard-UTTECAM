import { fetchWithAuth } from './apiService';

export interface MovilidadItem {
    id?: number;
    titulo: string;
    archivo: string | File;
    tipo: 'pdf' | 'image';
    orden: number;
    activo: boolean;
}

export const getMovilidadItems = async (): Promise<MovilidadItem[]> => {
    return await fetchWithAuth<MovilidadItem[]>('/api/movilidad-internacional');
};

export const createMovilidadItem = async (item: MovilidadItem): Promise<MovilidadItem> => {
    const formData = new FormData();
    formData.append('titulo', item.titulo);
    formData.append('tipo', item.tipo);
    formData.append('orden', item.orden.toString());
    formData.append('activo', String(item.activo));
    
    if (item.archivo instanceof File) {
        formData.append('archivo', item.archivo);
    }

    return await fetchWithAuth<MovilidadItem>('/api/movilidad-internacional', {
        method: 'POST',
        body: formData
    });
};

export const updateMovilidadItem = async (id: number, item: MovilidadItem): Promise<MovilidadItem> => {
    const formData = new FormData();
    formData.append('titulo', item.titulo);
    formData.append('tipo', item.tipo);
    formData.append('orden', item.orden.toString());
    formData.append('activo', String(item.activo));

    if (item.archivo instanceof File) {
        formData.append('archivo', item.archivo);
    }

    return await fetchWithAuth<MovilidadItem>(`/api/movilidad-internacional/${id}`, {
        method: 'PUT',
        body: formData
    });
};

export const deleteMovilidadItem = async (id: number): Promise<{ message: string }> => {
    return await fetchWithAuth<{ message: string }>(`/api/movilidad-internacional/${id}`, {
        method: 'DELETE'
    });
};
