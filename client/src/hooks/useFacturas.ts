import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facturasService } from '../services/facturas';
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (factura: Partial<Factura>) =>
      facturasService.create(factura),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['facturas', variables.proyectoId] });
      queryClient.invalidateQueries({ queryKey: ['facturas', 'by-proveedor', variables.proyectoId] });
      queryClient.invalidateQueries({ queryKey: ['facturas', 'stats', variables.proyectoId] });
    },
  });
};

export const useUpdateFactura = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Factura> }) =>
      facturasService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
    },
  });
};

export const useDeleteFactura = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => facturasService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
    },
  });
};

export const useFacturasStats = (proyectoId: string) => {
  return useQuery({
    queryKey: ['facturas', 'stats', proyectoId],
    queryFn: () => facturasService.getStats(proyectoId),
    enabled: !!proyectoId,
  });
};
