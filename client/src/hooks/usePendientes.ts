import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pendientesService } from '../services/pendientes';
import type { Pendiente, PendienteEstado } from '../types';

export const usePendientes = (proyectoId: string) => {
  return useQuery({
    queryKey: ['pendientes', proyectoId],
    queryFn: () => pendientesService.getAll(proyectoId),
    enabled: !!proyectoId,
  });
};

export const usePendientesByArea = (proyectoId: string) => {
  return useQuery({
    queryKey: ['pendientes', 'by-area', proyectoId],
    queryFn: () => pendientesService.getByArea(proyectoId),
    enabled: !!proyectoId,
  });
};

export const usePendientesByUser = (userId: string) => {
  return useQuery({
    queryKey: ['pendientes', 'by-user', userId],
    queryFn: () => pendientesService.getByUser(userId),
    enabled: !!userId,
  });
};

export const usePendiente = (id: string) => {
  return useQuery({
    queryKey: ['pendientes', 'detail', id],
    queryFn: () => pendientesService.getById(id),
    enabled: !!id,
  });
};

export const useCreatePendiente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pendiente, userId }: { pendiente: Partial<Pendiente>; userId: string }) =>
      pendientesService.create(pendiente, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendientes', variables.pendiente.proyectoId] });
      queryClient.invalidateQueries({ queryKey: ['pendientes', 'by-area', variables.pendiente.proyectoId] });
      if (variables.pendiente.encargadoId) {
        queryClient.invalidateQueries({ queryKey: ['pendientes', 'by-user', variables.pendiente.encargadoId] });
      }
    },
  });
};

export const useUpdatePendiente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Pendiente> }) =>
      pendientesService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendientes'] });
    },
  });
};

export const useUpdatePendienteEstado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: PendienteEstado }) =>
      pendientesService.updateEstado(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendientes'] });
    },
  });
};

export const useDeletePendiente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pendientesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendientes'] });
    },
  });
};

export const usePendientesStats = (proyectoId: string) => {
  return useQuery({
    queryKey: ['pendientes', 'stats', proyectoId],
    queryFn: () => pendientesService.getStats(proyectoId),
    enabled: !!proyectoId,
  });
};
