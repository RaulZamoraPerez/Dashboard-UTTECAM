// hooks/useOrganigrama.ts
import { useState, useEffect, useCallback } from 'react';
import { Organigrama, OrganigramaFormData } from '../types/organigrama';
import * as organigramaService from '../services/organigramaService';

export const useOrganigrama = () => {
  const [organigrama, setOrganigrama] = useState<Organigrama[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganigrama = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await organigramaService.getAllOrganigrama();
      setOrganigrama(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar organigrama');
      console.error('Error fetching organigrama:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganigrama();
  }, [fetchOrganigrama]);

  const createItem = async (formData: OrganigramaFormData): Promise<boolean> => {
    try {
      setError(null);
      await organigramaService.createOrganigrama(
        {
          key: formData.key,
          parent_id: formData.parent_id,
          expanded: formData.expanded,
          type: formData.type,
          name: formData.name,
          title: formData.title,
          text: formData.text,
          order_position: formData.order_position,
        },
        formData.image || undefined
      );
      await fetchOrganigrama();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear nodo del organigrama');
      console.error('Error creating organigrama:', err);
      return false;
    }
  };

  const updateItem = async (id: number, formData: OrganigramaFormData): Promise<boolean> => {
    try {
      setError(null);
      await organigramaService.updateOrganigrama(
        id,
        {
          key: formData.key,
          parent_id: formData.parent_id,
          expanded: formData.expanded,
          type: formData.type,
          name: formData.name,
          title: formData.title,
          text: formData.text,
          order_position: formData.order_position,
        },
        formData.image || undefined
      );
      await fetchOrganigrama();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar nodo del organigrama');
      console.error('Error updating organigrama:', err);
      return false;
    }
  };

  const deleteItem = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await organigramaService.deleteOrganigrama(id);
      await fetchOrganigrama();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar nodo del organigrama');
      console.error('Error deleting organigrama:', err);
      return false;
    }
  };

  return {
    organigrama,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    refreshOrganigrama: fetchOrganigrama,
  };
};
