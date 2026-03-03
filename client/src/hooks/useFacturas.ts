import { useQuery } from '@tanstack/react-query';
import { facturasService } from '../services/facturas';
import { useOfflineMutation } from './useOfflineMutation';
import type { Factura } from '../types';

export const useFacturas = (proyectoId: string) => {
  return useQuery({
    queryKey: ['facturas', proyectoId],
    queryFn: () => facturasService.getAll(proyectoId),
    enabled: !!proyectoId,
  });
};

export const useFacturasByProveedor = (proyectoId: string) => {
  return useQuery({
    queryKey: ['facturas', 'by-proveedor', proyectoId],
    queryFn: () => facturasService.getByProveedor(proyectoId),
    enabled: !!proyectoId,
  });
};

export const useFactura = (id: string) => {
  return useQuery({
    queryKey: ['facturas', 'detail', id],
    queryFn: () => facturasService.getById(id),
    enabled: !!id,
  });
};

export const useCreateFactura = () => {
  return useOfflineMutation<unknown, Error, Partial<Factura>>({
    entity: 'factura',
    mutationType: 'create',
    queryKeysToInvalidate: [['facturas']],
    mutationFn: (factura) => facturasService.create(factura),
    toPayload: (factura) => ({ factura }),
  });
};

export const useUpdateFactura = () => {
  return useOfflineMutation<unknown, Error, { id: string; updates: Partial<Factura> }>({
    entity: 'factura',
    mutationType: 'update',
    queryKeysToInvalidate: [['facturas']],
    mutationFn: ({ id, updates }) => facturasService.update(id, updates),
    toPayload: ({ id, updates }) => ({ id, updates }),
  });
};

export const useDeleteFactura = () => {
  return useOfflineMutation<unknown, Error, string>({
    entity: 'factura',
    mutationType: 'delete',
    queryKeysToInvalidate: [['facturas']],
    mutationFn: (id) => facturasService.delete(id),
    toPayload: (id) => ({ id }),
  });
};

export const useFacturasStats = (proyectoId: string) => {
  return useQuery({
    queryKey: ['facturas', 'stats', proyectoId],
    queryFn: () => facturasService.getStats(proyectoId),
    enabled: !!proyectoId,
  });
};
