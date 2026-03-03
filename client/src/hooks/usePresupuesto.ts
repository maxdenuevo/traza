import { useQuery } from '@tanstack/react-query';
import { presupuestoService } from '../services/presupuesto';
import { useOfflineMutation } from './useOfflineMutation';

/**
 * Get all budget items for a project
 */
export const usePresupuestoItems = (proyectoId: string) => {
  return useQuery({
    queryKey: ['presupuesto', proyectoId],
    queryFn: () => presupuestoService.getAll(proyectoId),
    enabled: !!proyectoId,
  });
};

/**
 * Get items grouped by category
 */
export const usePresupuestoByCategory = (proyectoId: string) => {
  return useQuery({
    queryKey: ['presupuesto', 'by-category', proyectoId],
    queryFn: () => presupuestoService.getByCategory(proyectoId),
    enabled: !!proyectoId,
  });
};

/**
 * Get budget summary
 */
export const usePresupuestoSummary = (proyectoId: string) => {
  return useQuery({
    queryKey: ['presupuesto', 'summary', proyectoId],
    queryFn: () => presupuestoService.getSummary(proyectoId),
    enabled: !!proyectoId,
  });
};

/**
 * Get a single budget item by ID
 */
export const usePresupuestoItem = (id: string) => {
  return useQuery({
    queryKey: ['presupuesto', 'item', id],
    queryFn: () => presupuestoService.getById(id),
    enabled: !!id,
  });
};

/**
 * Create a budget item
 */
export const useCreatePresupuestoItem = () => {
  return useOfflineMutation<unknown, Error, Parameters<typeof presupuestoService.create>[0]>({
    entity: 'presupuesto',
    mutationType: 'create',
    queryKeysToInvalidate: [['presupuesto']],
    mutationFn: (item) => presupuestoService.create(item),
    toPayload: (item) => ({ item }),
  });
};

/**
 * Update a budget item
 */
export const useUpdatePresupuestoItem = () => {
  return useOfflineMutation<unknown, Error, { id: string; updates: Parameters<typeof presupuestoService.update>[1] }>({
    entity: 'presupuesto',
    mutationType: 'update',
    queryKeysToInvalidate: [['presupuesto']],
    mutationFn: ({ id, updates }) => presupuestoService.update(id, updates),
    toPayload: ({ id, updates }) => ({ id, updates }),
  });
};

/**
 * Delete a budget item
 */
export const useDeletePresupuestoItem = () => {
  return useOfflineMutation<unknown, Error, string>({
    entity: 'presupuesto',
    mutationType: 'delete',
    queryKeysToInvalidate: [['presupuesto']],
    mutationFn: (id) => presupuestoService.delete(id),
    toPayload: (id) => ({ id }),
  });
};
