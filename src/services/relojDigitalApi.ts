// Reloj Digital API removed: feature deprecated and removed from the system.
// Keep a stub here to avoid build errors if any module still imports it.
const errorMessage = 'Reloj Digital feature has been removed from the system. This API is deprecated.';

export interface RelojDigital {
  id?: number;
  zonaHoraria: string;
  formato24Horas: boolean;
  mostrarFecha: boolean;
  mostrarDiaSemana: boolean;
  activo: boolean;
  estilo: 'digital' | 'analogico';
}

export const relojDigitalApi = {
  getActive: async (): Promise<RelojDigital> => { throw new Error(errorMessage); },
  getAll: async (): Promise<RelojDigital[]> => { throw new Error(errorMessage); },
  create: async (data: RelojDigital): Promise<RelojDigital> => {
    console.log('Mock create:', data);
    throw new Error(errorMessage);
  },
  update: async (id: number, data: Partial<RelojDigital>): Promise<RelojDigital> => {
    console.log('Mock update:', id, data);
    throw new Error(errorMessage);
  },
  delete: async (id: number): Promise<void> => {
    console.log('Mock delete:', id);
    throw new Error(errorMessage);
  },
};