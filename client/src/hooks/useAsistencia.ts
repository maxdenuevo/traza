import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { asistenciaService, type TrabajadorAsistencia } from '../services/asistencia';
import { useOfflineMutation } from './useOfflineMutation';

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

interface ToggleAsistenciaVariables {
  proyectoId: string;
  trabajadorId: string;
  fecha: Date;
  userId: string;
}

export const useToggleAsistencia = () => {
  return useOfflineMutation<unknown, Error, ToggleAsistenciaVariables, { previousStatus?: TrabajadorAsistencia[]; previousStats?: unknown }>({
    entity: 'asistencia',
    mutationType: 'toggle',
    priority: 'critical', // Asistencia is a critical field operation

    mutationFn: ({ proyectoId, trabajadorId, fecha, userId }) =>
      asistenciaService.toggleAsistencia(proyectoId, trabajadorId, fecha, userId),

    toPayload: ({ proyectoId, trabajadorId, fecha, userId }) => ({
      proyectoId,
      trabajadorId,
      fecha: fecha.toISOString(),
      userId,
    }),

    queryKeysToInvalidate: undefined, // We handle this in onOptimisticUpdate

    onOptimisticUpdate: (variables, qc) => {
      const dateKey = variables.fecha.toISOString().split('T')[0];
      const statusKey = ['asistencia', 'status', variables.proyectoId, dateKey];
      const statsKey = ['asistencia', 'stats', variables.proyectoId, dateKey];

      // Cancel any outgoing refetches
      qc.cancelQueries({ queryKey: statusKey });
      qc.cancelQueries({ queryKey: statsKey });

      // Snapshot current values
      const previousStatus = qc.getQueryData<TrabajadorAsistencia[]>(statusKey);
      const previousStats = qc.getQueryData(statsKey);

      // Optimistically update status
      if (previousStatus) {
        qc.setQueryData<TrabajadorAsistencia[]>(statusKey, (old) =>
          old?.map((t) =>
            t.trabajadorId === variables.trabajadorId
              ? { ...t, presente: !t.presente }
              : t
          )
        );
      }

      // Optimistically update stats
      if (previousStats && previousStatus) {
        const worker = previousStatus.find(t => t.trabajadorId === variables.trabajadorId);
        const wasPresent = worker?.presente ?? false;
        const change = wasPresent ? -1 : 1;

        qc.setQueryData(statsKey, (old: any) => {
          if (!old) return old;
          const newPresentes = old.presentes + change;
          return {
            ...old,
            presentes: newPresentes,
            ausentes: old.total - newPresentes,
            porcentaje: old.total > 0 ? Math.round((newPresentes / old.total) * 100) : 0,
          };
        });
      }

      return { previousStatus, previousStats };
    },

    onRollback: (_context, qc) => {
      // We need the variables to rollback, but we don't have them here
      // So we just invalidate to refetch
      qc.invalidateQueries({ queryKey: ['asistencia'] });
    },
  });
};

interface MarkAllPresentVariables {
  proyectoId: string;
  fecha: Date;
  userId: string;
}

export const useMarkAllPresent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ proyectoId, fecha, userId }: MarkAllPresentVariables) =>
      asistenciaService.markAllPresent(proyectoId, fecha, userId),

    onMutate: async (variables) => {
      const dateKey = variables.fecha.toISOString().split('T')[0];
      const statusKey = ['asistencia', 'status', variables.proyectoId, dateKey];
      const statsKey = ['asistencia', 'stats', variables.proyectoId, dateKey];

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: statusKey });
      await queryClient.cancelQueries({ queryKey: statsKey });

      // Snapshot current values
      const previousStatus = queryClient.getQueryData<TrabajadorAsistencia[]>(statusKey);
      const previousStats = queryClient.getQueryData(statsKey);

      // Optimistically mark all as present
      if (previousStatus) {
        queryClient.setQueryData<TrabajadorAsistencia[]>(statusKey, (old) =>
          old?.map((t) => ({ ...t, presente: true }))
        );
      }

      // Optimistically update stats
      if (previousStats) {
        queryClient.setQueryData(statsKey, (old: any) => {
          if (!old) return old;
          return {
            ...old,
            presentes: old.total,
            ausentes: 0,
            porcentaje: 100,
          };
        });
      }

      return { previousStatus, previousStats };
    },

    onError: (_error, variables, context) => {
      // Rollback on error
      if (context) {
        const dateKey = variables.fecha.toISOString().split('T')[0];
        if (context.previousStatus) {
          queryClient.setQueryData(
            ['asistencia', 'status', variables.proyectoId, dateKey],
            context.previousStatus
          );
        }
        if (context.previousStats) {
          queryClient.setQueryData(
            ['asistencia', 'stats', variables.proyectoId, dateKey],
            context.previousStats
          );
        }
      }
    },

    onSettled: (_, __, variables) => {
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
