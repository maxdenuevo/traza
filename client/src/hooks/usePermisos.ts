import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permisosService } from '../services/permisos';

/**
 * Get all permisos for a project
 */
export const usePermisos = (proyectoId: string) => {
  return useQuery({
    queryKey: ['permisos', proyectoId],
    queryFn: () => permisosService.getAll(proyectoId),
    enabled: !!proyectoId,
  });
};

/**
 * Get permisos expiring soon
 */
export const usePermisosExpiringSoon = (proyectoId: string) => {
  return useQuery({
    queryKey: ['permisos', 'expiring-soon', proyectoId],
    queryFn: () => permisosService.getExpiringSoon(proyectoId),
    enabled: !!proyectoId,
  });
};

/**
 * Get a single permiso by ID
 */
export const usePermiso = (id: string) => {
  return useQuery({
    queryKey: ['permisos', id],
    queryFn: () => permisosService.getById(id),
    enabled: !!id,
  });
};

/**
 * Create a permiso
 */
export const useCreatePermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (permiso: Parameters<typeof permisosService.create>[0]) =>
      permisosService.create(permiso),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permisos'] });
    },
  });
};

/**
 * Update a permiso
 */
export const useUpdatePermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof permisosService.update>[1] }) =>
      permisosService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permisos'] });
    },
  });
};

/**
 * Delete a permiso
 */
export const useDeletePermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => permisosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permisos'] });
    },
  });
};
