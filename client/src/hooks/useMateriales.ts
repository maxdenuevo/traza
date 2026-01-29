import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialesService } from '../services/materiales';
import type { Material } from '../types';

export const useMateriales = (proyectoId: string) => {
  return useQuery({
    queryKey: ['materiales', proyectoId],
    queryFn: () => materialesService.getAll(proyectoId),
    enabled: !!proyectoId,
  });
};

export const useMaterialesBySector = (proyectoId: string) => {
  return useQuery({
    queryKey: ['materiales', 'by-sector', proyectoId],
    queryFn: () => materialesService.getBySector(proyectoId),
    enabled: !!proyectoId,
  });
};

export const useMaterialesByProveedor = (proyectoId: string) => {
  return useQuery({
    queryKey: ['materiales', 'by-proveedor', proyectoId],
    queryFn: () => materialesService.getByProveedor(proyectoId),
    enabled: !!proyectoId,
  });
};

export const useMaterial = (id: string) => {
  return useQuery({
    queryKey: ['materiales', 'detail', id],
    queryFn: () => materialesService.getById(id),
    enabled: !!id,
  });
};

export const useCreateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (material: Partial<Material>) =>
      materialesService.create(material),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['materiales', variables.proyectoId] });
      queryClient.invalidateQueries({ queryKey: ['materiales', 'by-sector', variables.proyectoId] });
      queryClient.invalidateQueries({ queryKey: ['materiales', 'by-proveedor', variables.proyectoId] });
    },
  });
};

export const useUpdateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Material> }) =>
      materialesService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiales'] });
    },
  });
};

export const useDeleteMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => materialesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiales'] });
    },
  });
};

export const useMaterialesStats = (proyectoId: string) => {
  return useQuery({
    queryKey: ['materiales', 'stats', proyectoId],
    queryFn: () => materialesService.getStats(proyectoId),
    enabled: !!proyectoId,
  });
};
