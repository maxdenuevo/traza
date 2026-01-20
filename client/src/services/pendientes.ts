import { supabase } from './supabase';
import type { Pendiente, PendienteEstado } from '../types';

export const pendientesService = {
  /**
   * Get all pendientes for a project
   */
  async getAll(proyectoId: string): Promise<Pendiente[]> {
    const { data, error } = await supabase
      .from('pendientes')
      .select(`
        *,
        encargado:profiles!pendientes_encargado_id_fkey(id, nombre, especialidad, telefono),
        creador:profiles!pendientes_creado_por_fkey(id, nombre)
      `)
      .eq('proyecto_id', proyectoId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((p) => ({
      id: p.id,
      proyectoId: p.proyecto_id,
      area: p.area,
      tarea: p.tarea,
      descripcion: p.descripcion,
      encargadoId: p.encargado_id,
      encargado: p.encargado ? {
        id: p.encargado.id,
        nombre: p.encargado.nombre,
        especialidad: p.encargado.especialidad,
        telefono: p.encargado.telefono,
      } : undefined,
      estado: p.estado,
      prioridad: p.prioridad,
      fechaCreacion: new Date(p.fecha_creacion),
      fechaVencimiento: p.fecha_vencimiento ? new Date(p.fecha_vencimiento) : undefined,
      fechaCompletado: p.fecha_completado ? new Date(p.fecha_completado) : undefined,
      notasAdicionales: p.notas_adicionales,
      creadoPor: p.creado_por,
      visitaId: p.visita_id,
      asuntoId: p.asunto_id,
      createdAt: new Date(p.created_at),
      updatedAt: new Date(p.updated_at),
    }));
  },

  /**
   * Get pendientes grouped by area
   */
  async getByArea(proyectoId: string) {
    const pendientes = await this.getAll(proyectoId);

    const grouped = pendientes.reduce((acc, pendiente) => {
      const area = pendiente.area || 'Sin área';
      if (!acc[area]) {
        acc[area] = [];
      }
      acc[area].push(pendiente);
      return acc;
    }, {} as Record<string, Pendiente[]>);

    return Object.entries(grouped).map(([area, items]) => ({
      area,
      pendientes: items,
    }));
  },

  /**
   * Get pendientes grouped by responsable (encargado)
   */
  async getByResponsable(proyectoId: string) {
    const pendientes = await this.getAll(proyectoId);

    const grouped = pendientes.reduce((acc, pendiente) => {
      const encargadoId = pendiente.encargadoId || 'sin-asignar';
      const encargadoNombre = pendiente.encargado?.nombre || 'Sin asignar';

      if (!acc[encargadoId]) {
        acc[encargadoId] = {
          encargadoId,
          encargadoNombre,
          encargado: pendiente.encargado,
          pendientes: [],
        };
      }
      acc[encargadoId].pendientes.push(pendiente);
      return acc;
    }, {} as Record<string, { encargadoId: string; encargadoNombre: string; encargado?: Pendiente['encargado']; pendientes: Pendiente[] }>);

    return Object.values(grouped);
  },

  /**
   * Get pendientes for a specific user
   */
  async getByUser(userId: string): Promise<Pendiente[]> {
    const { data, error } = await supabase
      .from('pendientes')
      .select(`
        *,
        proyecto:proyectos(nombre)
      `)
      .eq('encargado_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((p) => ({
      id: p.id,
      proyectoId: p.proyecto_id,
      area: p.area,
      tarea: p.tarea,
      descripcion: p.descripcion,
      encargadoId: p.encargado_id,
      estado: p.estado,
      prioridad: p.prioridad,
      fechaCreacion: new Date(p.fecha_creacion),
      fechaVencimiento: p.fecha_vencimiento ? new Date(p.fecha_vencimiento) : undefined,
      fechaCompletado: p.fecha_completado ? new Date(p.fecha_completado) : undefined,
      notasAdicionales: p.notas_adicionales,
      creadoPor: p.creado_por,
      visitaId: p.visita_id,
      asuntoId: p.asunto_id,
      createdAt: new Date(p.created_at),
      updatedAt: new Date(p.updated_at),
    }));
  },

  /**
   * Get a single pendiente by ID
   */
  async getById(id: string): Promise<Pendiente> {
    const { data, error } = await supabase
      .from('pendientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      proyectoId: data.proyecto_id,
      area: data.area,
      tarea: data.tarea,
      descripcion: data.descripcion,
      encargadoId: data.encargado_id,
      estado: data.estado,
      prioridad: data.prioridad,
      fechaCreacion: new Date(data.fecha_creacion),
      fechaVencimiento: data.fecha_vencimiento ? new Date(data.fecha_vencimiento) : undefined,
      fechaCompletado: data.fecha_completado ? new Date(data.fecha_completado) : undefined,
      notasAdicionales: data.notas_adicionales,
      creadoPor: data.creado_por,
      visitaId: data.visita_id,
      asuntoId: data.asunto_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  /**
   * Create a new pendiente
   */
  async create(pendiente: Partial<Pendiente>, userId: string) {
    const { data, error } = await supabase
      .from('pendientes')
      .insert({
        proyecto_id: pendiente.proyectoId,
        area: pendiente.area,
        tarea: pendiente.tarea,
        descripcion: pendiente.descripcion,
        encargado_id: pendiente.encargadoId,
        estado: pendiente.estado || 'pausa',
        prioridad: pendiente.prioridad,
        fecha_creacion: pendiente.fechaCreacion || new Date().toISOString(),
        fecha_vencimiento: pendiente.fechaVencimiento,
        notas_adicionales: pendiente.notasAdicionales,
        creado_por: userId,
        visita_id: pendiente.visitaId,
        asunto_id: pendiente.asuntoId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a pendiente
   */
  async update(id: string, updates: Partial<Pendiente>) {
    const updateData: any = {
      area: updates.area,
      tarea: updates.tarea,
      descripcion: updates.descripcion,
      encargado_id: updates.encargadoId,
      estado: updates.estado,
      prioridad: updates.prioridad,
      fecha_vencimiento: updates.fechaVencimiento,
      notas_adicionales: updates.notasAdicionales,
    };

    // If marking as completed, set fecha_completado
    if (updates.estado === 'terminado') {
      updateData.fecha_completado = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('pendientes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update only the estado of a pendiente
   */
  async updateEstado(id: string, estado: PendienteEstado) {
    const updateData: any = { estado };

    // If marking as completed, set fecha_completado
    if (estado === 'terminado') {
      updateData.fecha_completado = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('pendientes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a pendiente
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('pendientes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get count of active pendientes for a user
   */
  async getActiveCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('pendientes')
      .select('*', { count: 'exact', head: true })
      .eq('encargado_id', userId)
      .in('estado', ['pausa', 'en_obra']);

    if (error) throw error;
    return count || 0;
  },

  /**
   * Get statistics for a project
   */
  async getStats(proyectoId: string) {
    const { data, error } = await supabase
      .from('pendientes')
      .select('estado')
      .eq('proyecto_id', proyectoId);

    if (error) throw error;

    const stats = {
      total: data.length,
      pausa: data.filter((p) => p.estado === 'pausa').length,
      en_obra: data.filter((p) => p.estado === 'en_obra').length,
      terminado: data.filter((p) => p.estado === 'terminado').length,
    };

    return stats;
  },
};
