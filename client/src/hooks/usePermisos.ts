import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permisosService } from '../services/permisos';
import type { Permiso, PermisoEstado, PermisoTipo } from '../types';

export const usePermisos = (proyectoId: string) => {
  return useQuery({
    queryKey: ['permisos', proyectoId],
    queryFn: () => permisosService.getAll(proyectoId),
    enabled: !!proyectoId,
  });
};

export const usePermiso = (id: string) => {
  return useQuery({
    queryKey: ['permisos', 'detail', id],
    queryFn: async () => {
      const all = await permisosService.getAll('');
      return all.find(p => p.id === id) || null;
    },
    enabled: !!id,
  });
};

export const useCreatePermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      proyectoId: string;
      nombre: string;
      tipo: PermisoTipo;
      estado?: PermisoEstado;
      notas?: string;
      fechaVencimiento?: Date;
    }) => permisosService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['permisos', variables.proyectoId] });
    },
  });
};

export const useUpdatePermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { 
      id: string; 
      updates: Partial<Omit<Permiso, 'id' | 'proyectoId' | 'createdAt'>> 
    }) => permisosService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permisos'] });
    },
  });
};

export const useDeletePermiso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => permisosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permisos'] });
    },
  });
};
