import { useQuery } from '@tanstack/react-query';
import { materialesService } from '../services/materiales';
import { useOfflineMutation } from './useOfflineMutation';
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
  return useOfflineMutation<unknown, Error, Partial<Material>>({
    entity: 'material',
    mutationType: 'create',
    queryKeysToInvalidate: [['materiales']],
    mutationFn: (material) => materialesService.create(material),
    toPayload: (material) => ({ material }),
  });
};

export const useUpdateMaterial = () => {
  return useOfflineMutation<unknown, Error, { id: string; updates: Partial<Material> }>({
    entity: 'material',
    mutationType: 'update',
    queryKeysToInvalidate: [['materiales']],
    mutationFn: ({ id, updates }) => materialesService.update(id, updates),
    toPayload: ({ id, updates }) => ({ id, updates }),
  });
};

export const useDeleteMaterial = () => {
  return useOfflineMutation<unknown, Error, string>({
    entity: 'material',
    mutationType: 'delete',
    queryKeysToInvalidate: [['materiales']],
    mutationFn: (id) => materialesService.delete(id),
    toPayload: (id) => ({ id }),
  });
};

export const useMaterialesStats = (proyectoId: string) => {
  return useQuery({
    queryKey: ['materiales', 'stats', proyectoId],
    queryFn: () => materialesService.getStats(proyectoId),
    enabled: !!proyectoId,
  });
};
