import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkboxService } from '../services/checkbox';
import type { CheckboxItem, Periodicidad } from '../types';

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

export const useToggleCheckbox = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, fecha, userId }: { itemId: string; fecha: Date; userId: string }) =>
      checkboxService.toggleCheck(itemId, fecha, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkbox', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['checkbox', 'stats'] });
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
