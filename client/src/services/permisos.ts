import { supabase } from './supabase';
import type { Permiso } from '../types';

export const permisosService = {
  /**
   * Get all permisos for a project
   */
  async getAll(proyectoId: string): Promise<Permiso[]> {
    const { data, error } = await supabase
      .from('permisos')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((p) => ({
      id: p.id,
      proyectoId: p.proyecto_id,
      nombre: p.nombre,
      tipo: p.tipo,
      estado: p.estado,
      fechaSolicitud: p.fecha_solicitud ? new Date(p.fecha_solicitud) : undefined,
      fechaAprobacion: p.fecha_aprobacion ? new Date(p.fecha_aprobacion) : undefined,
      fechaVencimiento: p.fecha_vencimiento ? new Date(p.fecha_vencimiento) : undefined,
      vigenciaMeses: p.vigencia_meses,
      documentoId: p.documento_id,
      notas: p.notas,
      createdAt: new Date(p.created_at),
      updatedAt: new Date(p.updated_at),
    }));
  },

  /**
   * Get a single permiso by ID
   */
  async getById(id: string): Promise<Permiso> {
    const { data, error } = await supabase
      .from('permisos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      proyectoId: data.proyecto_id,
      nombre: data.nombre,
      tipo: data.tipo,
      estado: data.estado,
      fechaSolicitud: data.fecha_solicitud ? new Date(data.fecha_solicitud) : undefined,
      fechaAprobacion: data.fecha_aprobacion ? new Date(data.fecha_aprobacion) : undefined,
      fechaVencimiento: data.fecha_vencimiento ? new Date(data.fecha_vencimiento) : undefined,
      vigenciaMeses: data.vigencia_meses,
      documentoId: data.documento_id,
      notas: data.notas,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  /**
   * Create a permiso
   */
  async create(permiso: Partial<Permiso>) {
    const { data, error } = await supabase
      .from('permisos')
      .insert({
        proyecto_id: permiso.proyectoId,
        nombre: permiso.nombre,
        tipo: permiso.tipo,
        estado: permiso.estado || 'pendiente',
        fecha_solicitud: permiso.fechaSolicitud,
        fecha_aprobacion: permiso.fechaAprobacion,
        fecha_vencimiento: permiso.fechaVencimiento,
        vigencia_meses: permiso.vigenciaMeses,
        documento_id: permiso.documentoId,
        notas: permiso.notas,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a permiso
   */
  async update(id: string, updates: Partial<Permiso>) {
    const { data, error } = await supabase
      .from('permisos')
      .update({
        nombre: updates.nombre,
        tipo: updates.tipo,
        estado: updates.estado,
        fecha_solicitud: updates.fechaSolicitud,
        fecha_aprobacion: updates.fechaAprobacion,
        fecha_vencimiento: updates.fechaVencimiento,
        vigencia_meses: updates.vigenciaMeses,
        documento_id: updates.documentoId,
        notas: updates.notas,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a permiso
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('permisos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get permisos that are expiring soon (within 30 days)
   */
  async getExpiringSoon(proyectoId: string): Promise<Permiso[]> {
    const permisos = await this.getAll(proyectoId);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return permisos.filter((p) => {
      if (!p.fechaVencimiento) return false;
      return p.fechaVencimiento >= now && p.fechaVencimiento <= thirtyDaysFromNow;
    });
  },
};
