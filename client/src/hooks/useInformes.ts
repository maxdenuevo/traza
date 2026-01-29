import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { informesService } from '../services/informes';
import type { InformeContenido, Periodicidad, Informe } from '../types';

export const useInformes = (proyectoId: string) => {
  return useQuery({
    queryKey: ['informes', proyectoId],
    queryFn: () => informesService.getAll(proyectoId),
    enabled: !!proyectoId,
  });
};

export const useInforme = (id: string) => {
  return useQuery({
    queryKey: ['informes', 'detail', id],
    queryFn: () => informesService.getById(id),
    enabled: !!id,
  });
};

export const useInformesStats = (proyectoId: string) => {
  return useQuery({
    queryKey: ['informes', 'stats', proyectoId],
    queryFn: () => informesService.getStats(proyectoId),
    enabled: !!proyectoId,
  });
};

export const useGenerateInforme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      proyectoId: string;
      periodicidad: Periodicidad;
      contenido: InformeContenido;
      userId: string;
    }) => informesService.generate(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['informes', variables.proyectoId] });
      queryClient.invalidateQueries({ queryKey: ['informes', 'stats', variables.proyectoId] });
    },
  });
};

export const useDeleteInforme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => informesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['informes'] });
    },
  });
};

export const useExportInformePDF = () => {
  return useMutation({
    mutationFn: (informe: Informe) => informesService.exportPDF(informe),
  });
};
