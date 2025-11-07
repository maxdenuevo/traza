import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificacionesService } from '../services/notificaciones';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Get all notifications for current user
 */
export const useNotificaciones = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['notificaciones', user?.id],
    queryFn: () => notificacionesService.getAll(user?.id || ''),
    enabled: !!user?.id,
  });
};

/**
 * Get unread notifications count
 */
export const useUnreadCount = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['notificaciones', 'unread-count', user?.id],
    queryFn: () => notificacionesService.getUnreadCount(user?.id || ''),
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

/**
 * Get unread notifications
 */
export const useUnreadNotificaciones = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['notificaciones', 'unread', user?.id],
    queryFn: () => notificacionesService.getUnread(user?.id || ''),
    enabled: !!user?.id,
  });
};

/**
 * Mark notification as read
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificacionesService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    },
  });
};

/**
 * Mark all notifications as read
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: () => notificacionesService.markAllAsRead(user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    },
  });
};

/**
 * Delete a notification
 */
export const useDeleteNotificacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificacionesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    },
  });
};

/**
 * Create a notification
 */
export const useCreateNotificacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificacion: Parameters<typeof notificacionesService.create>[0]) =>
      notificacionesService.create(notificacion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    },
  });
};
