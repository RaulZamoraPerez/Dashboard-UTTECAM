import { fetchWithAuth } from "./apiService";

export interface BolsaTrabajoItem {
  id: number;
  titulo: string;
  descripcion: string;
  archivo_pdf: string;
  orden: number;
  header_id: number;
}

export interface BolsaTrabajoHeader {
  id: number;
  titulo: string;
  descripcion: string;
  url_externa: string;
  imagen_banner: string | null;
  items?: BolsaTrabajoItem[];
}

export const getBolsaTrabajo = async (): Promise<BolsaTrabajoHeader[]> => {
  return await fetchWithAuth<BolsaTrabajoHeader[]>('/api/bolsa-trabajo');
};

export const createHeader = async (formData: FormData): Promise<BolsaTrabajoHeader> => {
  return await fetchWithAuth<BolsaTrabajoHeader>('/api/bolsa-trabajo/header', {
    method: "POST",
    body: formData,
  });
};

export const updateHeader = async (id: number, formData: FormData): Promise<BolsaTrabajoHeader> => {
  return await fetchWithAuth<BolsaTrabajoHeader>(`/api/bolsa-trabajo/header/${id}`, {
    method: "PUT",
    body: formData,
  });
};

export const deleteHeader = async (id: number): Promise<void> => {
  await fetchWithAuth<void>(`/api/bolsa-trabajo/header/${id}`, {
    method: "DELETE",
  });
};

export const createItem = async (formData: FormData): Promise<BolsaTrabajoItem> => {
  return await fetchWithAuth<BolsaTrabajoItem>('/api/bolsa-trabajo/items', {
    method: "POST",
    body: formData,
  });
};

export const updateItem = async (id: number, formData: FormData): Promise<BolsaTrabajoItem> => {
  return await fetchWithAuth<BolsaTrabajoItem>(`/api/bolsa-trabajo/items/${id}`, {
    method: "PUT",
    body: formData,
  });
};

export const deleteItem = async (id: number): Promise<void> => {
  await fetchWithAuth<void>(`/api/bolsa-trabajo/items/${id}`, {
    method: "DELETE",
  });
};
