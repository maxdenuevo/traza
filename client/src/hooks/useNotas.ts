import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notasService } from '../services/notas';

/**
 * Get all notas for a project
 */
export const useNotas = (proyectoId: string) => {
  return useQuery({
    queryKey: ['notas', proyectoId],
    queryFn: () => notasService.getAll(proyectoId),
    enabled: !!proyectoId,
  });
};

/**
 * Get a single nota by ID
 */
export const useNota = (id: string) => {
  return useQuery({
    queryKey: ['notas', id],
    queryFn: () => notasService.getById(id),
    enabled: !!id,
  });
};

/**
 * Create a nota
 */
export const useCreateNota = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nota, userId }: { nota: Parameters<typeof notasService.create>[0]; userId: string }) =>
      notasService.create(nota, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas'] });
    },
  });
};

/**
 * Update a nota
 */
export const useUpdateNota = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof notasService.update>[1] }) =>
      notasService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas'] });
    },
  });
};

/**
 * Delete a nota
 */
export const useDeleteNota = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notasService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas'] });
    },
  });
};
