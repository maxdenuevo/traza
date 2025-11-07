import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visitasService } from '../services/visitas';
import type { Visita, Asunto } from '../types';

export const useVisitas = (proyectoId: string) => {
  return useQuery({
    queryKey: ['visitas', proyectoId],
    queryFn: () => visitasService.getAll(proyectoId),
    enabled: !!proyectoId,
  });
};

export const useVisita = (id: string) => {
  return useQuery({
    queryKey: ['visitas', 'detail', id],
    queryFn: () => visitasService.getById(id),
    enabled: !!id,
  });
};

export const useProximaVisita = (proyectoId: string) => {
  return useQuery({
    queryKey: ['visitas', 'proxima', proyectoId],
    queryFn: () => visitasService.getProxima(proyectoId),
    enabled: !!proyectoId,
  });
};

export const useCreateVisita = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ visita, userId }: { visita: Partial<Visita>; userId: string }) =>
      visitasService.create(visita, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['visitas', variables.visita.proyectoId] });
      queryClient.invalidateQueries({ queryKey: ['visitas', 'proxima', variables.visita.proyectoId] });
    },
  });
};

export const useUpdateVisita = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Visita> }) =>
      visitasService.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['visitas'] });
      queryClient.invalidateQueries({ queryKey: ['visitas', 'detail', data.id] });
    },
  });
};

export const useDeleteVisita = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => visitasService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitas'] });
    },
  });
};

export const useAddAsunto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ visitaId, asunto }: { visitaId: string; asunto: Partial<Asunto> }) =>
      visitasService.addAsunto(visitaId, asunto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['visitas', 'detail', variables.visitaId] });
    },
  });
};

export const useUpdateAsunto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ asuntoId, updates }: { asuntoId: string; updates: Partial<Asunto> }) =>
      visitasService.updateAsunto(asuntoId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitas'] });
    },
  });
};

export const useDeleteAsunto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (asuntoId: string) => visitasService.deleteAsunto(asuntoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitas'] });
    },
  });
};

export const useConvertToPendientes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ visitaId, userId }: { visitaId: string; userId: string }) =>
      visitasService.convertToPendientes(visitaId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitas'] });
      queryClient.invalidateQueries({ queryKey: ['pendientes'] });
    },
  });
};
