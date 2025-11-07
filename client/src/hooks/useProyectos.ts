import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proyectosService } from '../services/proyectos';
import type { Proyecto, ProyectoListItem } from '../types';

/**
 * Get all projects for current user (lightweight list items)
 *
 * Returns ProyectoListItem[] with basic info and team members only.
 * Does NOT include visitas, pendientes, documentos, notas, or presupuestoItems.
 *
 * For full project data, use useProyecto(id) instead.
 */
export const useProyectos = () => {
  return useQuery<ProyectoListItem[]>({
    queryKey: ['proyectos'],
    queryFn: () => proyectosService.getAll(),
  });
};

/**
 * Get a single project by ID with all relationships
 *
 * Returns complete Proyecto with visitas, pendientes, documentos, notas, etc.
 */
export const useProyecto = (id: string) => {
  return useQuery<Proyecto>({
    queryKey: ['proyectos', id],
    queryFn: () => proyectosService.getById(id),
    enabled: !!id,
  });
};

export const useCreateProyecto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (proyecto: Partial<Proyecto>) => proyectosService.create(proyecto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proyectos'] });
    },
  });
};

export const useUpdateProyecto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Proyecto> }) =>
      proyectosService.update(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['proyectos'] });
      queryClient.invalidateQueries({ queryKey: ['proyectos', variables.id] });
    },
  });
};

export const useDeleteProyecto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => proyectosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proyectos'] });
    },
  });
};
