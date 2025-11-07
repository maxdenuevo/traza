import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { NOTIFICACION_TIPO_COLORS } from '../../constants';
import { Icon } from '../../components/common/Icon';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  useNotificaciones,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotificacion,
} from '../../hooks/useNotificaciones';
import { notificacionesService } from '../../services/notificaciones';
import { useAuthStore } from '../../store/useAuthStore';
import type { Notificacion } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const NotificacionesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Fetch data
  const { data: notificaciones = [], isLoading } = useNotificaciones();

  // Mutations
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteMutation = useDeleteNotificacion();

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const subscription = notificacionesService.subscribeToNotifications(
      user.id,
      (payload) => {
        console.log('Nueva notificación:', payload);
        toast.info('Nueva notificación recibida');
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al marcar como leída';
      toast.error(errorMessage);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al marcar todas como leídas';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Notificación eliminada');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar';
      toast.error(errorMessage);
    }
  };

  const handleNotificationClick = async (notificacion: Notificacion) => {
    // Mark as read if not already
    if (!notificacion.leida) {
      await handleMarkAsRead(notificacion.id);
    }

    // Navigate to linked action if exists
    if (notificacion.enlaceAccion) {
      navigate(notificacion.enlaceAccion);
    }
  };

  // Filter notifications
  const filteredNotificaciones = filter === 'unread'
    ? notificaciones.filter(n => !n.leida)
    : notificaciones;

  const unreadCount = notificaciones.filter(n => !n.leida).length;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-xl text-esant-black">Notificaciones</h2>
            {unreadCount > 0 && (
              <p className="text-sm text-esant-gray-600 mt-1">
                Tienes {unreadCount} notificación{unreadCount !== 1 ? 'es' : ''} sin leer
              </p>
            )}
          </div>
          {notificaciones.length > 0 && unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-esant-black font-medium hover:underline"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        {notificaciones.length > 0 && (
          <div className="flex gap-2 border-t border-esant-gray-200 pt-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-esant-black text-esant-white'
                  : 'bg-esant-gray-100 text-esant-gray-600 hover:bg-esant-gray-200'
              }`}
            >
              Todas ({notificaciones.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'unread'
                  ? 'bg-esant-black text-esant-white'
                  : 'bg-esant-gray-100 text-esant-gray-600 hover:bg-esant-gray-200'
              }`}
            >
              Sin leer ({unreadCount})
            </button>
          </div>
        )}
      </Card>

      {/* Notifications List */}
      {filteredNotificaciones.length === 0 ? (
        <Card className="p-8 text-center">
          <Icon name="bell-off" size={48} className="text-esant-gray-400 mx-auto mb-3" />
          <p className="text-esant-gray-600 mb-1">
            {filter === 'unread' ? 'No tienes notificaciones sin leer' : 'No hay notificaciones'}
          </p>
          <p className="text-sm text-esant-gray-400">
            {filter === 'unread'
              ? 'Las notificaciones sin leer aparecerán aquí'
              : 'Recibirás notificaciones sobre tareas, visitas y más'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotificaciones.map((notificacion) => {
            const colors = NOTIFICACION_TIPO_COLORS[notificacion.tipo];
            const isUnread = !notificacion.leida;

            return (
              <div
                key={notificacion.id}
                className={`bg-esant-white rounded-xl shadow-esant overflow-hidden ${
                  isUnread ? 'border-l-4 border-esant-red' : ''
                }`}
              >
                <div
                  onClick={() => handleNotificationClick(notificacion)}
                  className={`p-5 ${notificacion.enlaceAccion ? 'cursor-pointer hover:bg-esant-gray-100 smooth-transition' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${colors.indicator}`}></div>
                        <h3 className={`font-medium text-base ${isUnread ? 'text-esant-black' : 'text-esant-gray-600'}`}>
                          {notificacion.titulo}
                        </h3>
                      </div>
                      <p className={`text-sm mb-2 ${isUnread ? 'text-esant-gray-800' : 'text-esant-gray-600'}`}>
                        {notificacion.mensaje}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-esant-gray-400">
                        <span>
                          {formatDistanceToNow(notificacion.createdAt, {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                        <span className={`px-2 py-0.5 rounded ${colors.bg} ${colors.text} font-medium`}>
                          {notificacion.tipo.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      {isUnread && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notificacion.id);
                          }}
                          className="p-2 hover:bg-esant-gray-100 rounded-lg transition-colors"
                          title="Marcar como leída"
                        >
                          <Icon name="check" size={16} className="text-esant-green" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notificacion.id);
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Icon name="trash-2" size={16} className="text-esant-red" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
