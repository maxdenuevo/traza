import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkboxService } from '../services/checkbox';
import { useOfflineMutation } from './useOfflineMutation';
import type { CheckboxItem, Periodicidad } from '../types';

// Extended type for checkbox items with status
type CheckboxItemWithStatus = CheckboxItem & { completado: boolean; checkId?: string };

export const useCheckboxItems = (proyectoId: string) => {
  return useQuery({
    queryKey: ['checkbox', 'items', proyectoId],
    queryFn: () => checkboxService.getItems(proyectoId),
    enabled: !!proyectoId,
  });
};

export const useCheckboxItemsByPeriodicidad = (proyectoId: string, periodicidad: Periodicidad) => {
  return useQuery({
    queryKey: ['checkbox', 'items', proyectoId, periodicidad],
    queryFn: () => checkboxService.getItemsByPeriodicidad(proyectoId, periodicidad),
    enabled: !!proyectoId,
  });
};

export const useCheckboxItemsWithStatus = (proyectoId: string, fecha: Date) => {
  const dateKey = fecha.toISOString().split('T')[0];

  return useQuery({
    queryKey: ['checkbox', 'status', proyectoId, dateKey],
    queryFn: () => checkboxService.getItemsWithStatus(proyectoId, fecha),
    enabled: !!proyectoId,
  });
};

export const useCheckboxStats = (proyectoId: string, fecha: Date) => {
  const dateKey = fecha.toISOString().split('T')[0];

  return useQuery({
    queryKey: ['checkbox', 'stats', proyectoId, dateKey],
    queryFn: () => checkboxService.getStats(proyectoId, fecha),
    enabled: !!proyectoId,
  });
};

interface ToggleCheckboxVariables {
  itemId: string;
  fecha: Date;
  userId: string;
  proyectoId: string; // Added for optimistic update
}

export const useToggleCheckbox = () => {
  return useOfflineMutation<unknown, Error, ToggleCheckboxVariables, { previousStatus?: CheckboxItemWithStatus[]; previousStats?: unknown }>({
    entity: 'checkbox',
    mutationType: 'toggle',
    priority: 'critical', // Checkbox is a critical field operation

    mutationFn: ({ itemId, fecha, userId }) =>
      checkboxService.toggleCheck(itemId, fecha, userId),

    toPayload: ({ itemId, fecha, userId }) => ({
      itemId,
      fecha: fecha.toISOString(),
      userId,
    }),

    onOptimisticUpdate: (variables, qc) => {
      const dateKey = variables.fecha.toISOString().split('T')[0];
      const statusKey = ['checkbox', 'status', variables.proyectoId, dateKey];
      const statsKey = ['checkbox', 'stats', variables.proyectoId, dateKey];

      // Cancel any outgoing refetches
      qc.cancelQueries({ queryKey: statusKey });
      qc.cancelQueries({ queryKey: statsKey });

      // Snapshot current values
      const previousStatus = qc.getQueryData<CheckboxItemWithStatus[]>(statusKey);
      const previousStats = qc.getQueryData(statsKey);

      // Optimistically update status
      if (previousStatus) {
        qc.setQueryData<CheckboxItemWithStatus[]>(statusKey, (old) =>
          old?.map((item) =>
            item.id === variables.itemId
              ? { ...item, completado: !item.completado }
              : item
          )
        );
      }

      // Optimistically update stats
      if (previousStats && previousStatus) {
        const item = previousStatus.find(i => i.id === variables.itemId);
        const wasCompleted = item?.completado ?? false;
        const change = wasCompleted ? -1 : 1;

        qc.setQueryData(statsKey, (old: any) => {
          if (!old) return old;
          const newCompletados = old.completados + change;
          const newDiariosCompletados = item?.periodicidad === 'diario'
            ? old.diarios.completados + change
            : old.diarios.completados;

          return {
            ...old,
            completados: newCompletados,
            pendientes: old.total - newCompletados,
            porcentaje: old.total > 0 ? Math.round((newCompletados / old.total) * 100) : 0,
            diarios: {
              ...old.diarios,
              completados: newDiariosCompletados,
            },
          };
        });
      }

      return { previousStatus, previousStats };
    },

    onRollback: (_context, qc) => {
      // Invalidate to refetch on error
      qc.invalidateQueries({ queryKey: ['checkbox', 'status'] });
      qc.invalidateQueries({ queryKey: ['checkbox', 'stats'] });
    },
  });
};

export const useCreateCheckboxItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: Partial<CheckboxItem>) =>
      checkboxService.createItem(item),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checkbox', 'items', variables.proyectoId] });
      queryClient.invalidateQueries({ queryKey: ['checkbox', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['checkbox', 'stats'] });
    },
  });
};

export const useDeleteCheckboxItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => checkboxService.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkbox'] });
    },
  });
};
