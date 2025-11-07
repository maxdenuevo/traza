import { supabase } from './supabase';
import type { Notificacion } from '../types';

export const notificacionesService = {
  /**
   * Get all notifications for a user
   */
  async getAll(usuarioId: string): Promise<Notificacion[]> {
    const { data, error } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((n) => ({
      id: n.id,
      usuarioId: n.usuario_id,
      tipo: n.tipo,
      titulo: n.titulo,
      mensaje: n.mensaje,
      leida: n.leida,
      metadata: n.metadata,
      enlaceAccion: n.enlace_accion,
      createdAt: new Date(n.created_at),
    }));
  },

  /**
   * Get unread notifications count
   */
  async getUnreadCount(usuarioId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notificaciones')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', usuarioId)
      .eq('leida', false);

    if (error) throw error;
    return count || 0;
  },

  /**
   * Get unread notifications
   */
  async getUnread(usuarioId: string): Promise<Notificacion[]> {
    const { data, error } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('usuario_id', usuarioId)
      .eq('leida', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((n) => ({
      id: n.id,
      usuarioId: n.usuario_id,
      tipo: n.tipo,
      titulo: n.titulo,
      mensaje: n.mensaje,
      leida: n.leida,
      metadata: n.metadata,
      enlaceAccion: n.enlace_accion,
      createdAt: new Date(n.created_at),
    }));
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id: string) {
    const { error } = await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(usuarioId: string) {
    const { error } = await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('usuario_id', usuarioId)
      .eq('leida', false);

    if (error) throw error;
  },

  /**
   * Delete a notification
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('notificaciones')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Create a notification
   */
  async create(notificacion: Partial<Notificacion>) {
    const { data, error } = await supabase
      .from('notificaciones')
      .insert({
        usuario_id: notificacion.usuarioId,
        tipo: notificacion.tipo,
        titulo: notificacion.titulo,
        mensaje: notificacion.mensaje,
        leida: false,
        metadata: notificacion.metadata,
        enlace_accion: notificacion.enlaceAccion,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Subscribe to real-time notifications
   */
  subscribeToNotifications(
    usuarioId: string,
    callback: (payload: any) => void
  ) {
    const subscription = supabase
      .channel('notificaciones')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones',
          filter: `usuario_id=eq.${usuarioId}`,
        },
        callback
      )
      .subscribe();

    return subscription;
  },
};
