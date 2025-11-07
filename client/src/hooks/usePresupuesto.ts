import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { presupuestoService } from '../services/presupuesto';

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: Parameters<typeof presupuestoService.create>[0]) =>
      presupuestoService.create(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presupuesto'] });
    },
  });
};

/**
 * Update a budget item
 */
export const useUpdatePresupuestoItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof presupuestoService.update>[1] }) =>
      presupuestoService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presupuesto'] });
    },
  });
};

/**
 * Delete a budget item
 */
export const useDeletePresupuestoItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => presupuestoService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presupuesto'] });
    },
  });
};
