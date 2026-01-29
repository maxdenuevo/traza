import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { asistenciaService } from '../services/asistencia';

export const useTrabajadores = (proyectoId: string) => {
  return useQuery({
    queryKey: ['asistencia', 'trabajadores', proyectoId],
    queryFn: () => asistenciaService.getTrabajadores(proyectoId),
    enabled: !!proyectoId,
  });
};

export const useAsistenciaForDate = (proyectoId: string, fecha: Date) => {
  const dateKey = fecha.toISOString().split('T')[0];

  return useQuery({
    queryKey: ['asistencia', proyectoId, dateKey],
    queryFn: () => asistenciaService.getForDate(proyectoId, fecha),
    enabled: !!proyectoId,
  });
};

export const useTrabajadoresWithStatus = (proyectoId: string, fecha: Date) => {
  const dateKey = fecha.toISOString().split('T')[0];

  return useQuery({
    queryKey: ['asistencia', 'status', proyectoId, dateKey],
    queryFn: () => asistenciaService.getTrabajadoresWithStatus(proyectoId, fecha),
    enabled: !!proyectoId,
  });
};

export const useAsistenciaStats = (proyectoId: string, fecha: Date) => {
  const dateKey = fecha.toISOString().split('T')[0];

  return useQuery({
    queryKey: ['asistencia', 'stats', proyectoId, dateKey],
    queryFn: () => asistenciaService.getStats(proyectoId, fecha),
    enabled: !!proyectoId,
  });
};

export const useToggleAsistencia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      proyectoId,
      trabajadorId,
      fecha,
      userId,
    }: {
      proyectoId: string;
      trabajadorId: string;
      fecha: Date;
      userId: string;
    }) => asistenciaService.toggleAsistencia(proyectoId, trabajadorId, fecha, userId),
    onSuccess: (_, variables) => {
      const dateKey = variables.fecha.toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: ['asistencia', 'status', variables.proyectoId, dateKey] });
      queryClient.invalidateQueries({ queryKey: ['asistencia', 'stats', variables.proyectoId, dateKey] });
    },
  });
};

export const useMarkAllPresent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      proyectoId,
      fecha,
      userId,
    }: {
      proyectoId: string;
      fecha: Date;
      userId: string;
    }) => asistenciaService.markAllPresent(proyectoId, fecha, userId),
    onSuccess: (_, variables) => {
      const dateKey = variables.fecha.toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: ['asistencia', 'status', variables.proyectoId, dateKey] });
      queryClient.invalidateQueries({ queryKey: ['asistencia', 'stats', variables.proyectoId, dateKey] });
    },
  });
};

export const useAsistenciaHistory = (proyectoId: string, startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ['asistencia', 'history', proyectoId, startDate.toISOString(), endDate.toISOString()],
    queryFn: () => asistenciaService.getHistory(proyectoId, startDate, endDate),
    enabled: !!proyectoId,
  });
};
