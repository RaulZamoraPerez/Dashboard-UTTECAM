// Reloj Digital API removed: feature deprecated and removed from the system.
// Keep a stub here to avoid build errors if any module still imports it.
const errorMessage = 'Reloj Digital feature has been removed from the system. This API is deprecated.';

export const relojDigitalApi = {
  getActive: async () => { throw new Error(errorMessage); },
  getAll: async () => { throw new Error(errorMessage); },
  create: async () => { throw new Error(errorMessage); },
  update: async () => { throw new Error(errorMessage); },
  delete: async () => { throw new Error(errorMessage); },
};