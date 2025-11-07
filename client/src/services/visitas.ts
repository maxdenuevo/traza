import { supabase } from './supabase';
import type { Visita, Asunto } from '../types';

export const visitasService = {
  /**
   * Get all visitas for a project
   */
  async getAll(proyectoId: string): Promise<Visita[]> {
    const { data, error } = await supabase
      .from('visitas')
      .select(`
        *,
        asuntos(*)
      `)
      .eq('proyecto_id', proyectoId)
      .order('fecha', { ascending: false });

    if (error) throw error;

    return data.map((visita) => ({
      id: visita.id,
      proyectoId: visita.proyecto_id,
      fecha: new Date(visita.fecha),
      hora: visita.hora,
      estado: visita.estado,
      notasGenerales: visita.notas_generales,
      asuntos: visita.asuntos.map((a: any) => ({
        id: a.id,
        visitaId: a.visita_id,
        area: a.area,
        descripcion: a.descripcion,
        encargadoId: a.encargado_id,
        notasAdicionales: a.notas_adicionales,
        convertidoAPendiente: a.convertido_a_pendiente,
        pendienteId: a.pendiente_id,
        createdAt: new Date(a.created_at),
      })),
      creadoPor: visita.creado_por,
      createdAt: new Date(visita.created_at),
      updatedAt: new Date(visita.updated_at),
    }));
  },

  /**
   * Get a single visita by ID
   */
  async getById(id: string): Promise<Visita> {
    const { data, error } = await supabase
      .from('visitas')
      .select(`
        *,
        asuntos(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      proyectoId: data.proyecto_id,
      fecha: new Date(data.fecha),
      hora: data.hora,
      estado: data.estado,
      notasGenerales: data.notas_generales,
      asuntos: data.asuntos.map((a: any) => ({
        id: a.id,
        visitaId: a.visita_id,
        area: a.area,
        descripcion: a.descripcion,
        encargadoId: a.encargado_id,
        notasAdicionales: a.notas_adicionales,
        convertidoAPendiente: a.convertido_a_pendiente,
        pendienteId: a.pendiente_id,
        createdAt: new Date(a.created_at),
      })),
      creadoPor: data.creado_por,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  /**
   * Create a new visita
   */
  async create(visita: Partial<Visita>, userId: string) {
    const { data, error } = await supabase
      .from('visitas')
      .insert({
        proyecto_id: visita.proyectoId,
        fecha: visita.fecha,
        hora: visita.hora,
        estado: visita.estado || 'en_curso',
        notas_generales: visita.notasGenerales,
        creado_por: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a visita
   */
  async update(id: string, updates: Partial<Visita>) {
    const { data, error } = await supabase
      .from('visitas')
      .update({
        fecha: updates.fecha,
        hora: updates.hora,
        estado: updates.estado,
        notas_generales: updates.notasGenerales,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a visita
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('visitas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get next scheduled visita for a project
   */
  async getProxima(proyectoId: string): Promise<Visita | null> {
    const { data, error } = await supabase
      .from('visitas')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .eq('estado', 'programada')
      .gt('fecha', new Date().toISOString())
      .order('fecha', { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    if (!data) return null;

    return {
      id: data.id,
      proyectoId: data.proyecto_id,
      fecha: new Date(data.fecha),
      hora: data.hora,
      estado: data.estado,
      notasGenerales: data.notas_generales,
      asuntos: [],
      creadoPor: data.creado_por,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  /**
   * Add an asunto to a visita
   */
  async addAsunto(visitaId: string, asunto: Partial<Asunto>) {
    const { data, error } = await supabase
      .from('asuntos')
      .insert({
        visita_id: visitaId,
        area: asunto.area,
        descripcion: asunto.descripcion,
        encargado_id: asunto.encargadoId,
        notas_adicionales: asunto.notasAdicionales,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an asunto
   */
  async updateAsunto(asuntoId: string, updates: Partial<Asunto>) {
    const { data, error } = await supabase
      .from('asuntos')
      .update({
        area: updates.area,
        descripcion: updates.descripcion,
        encargado_id: updates.encargadoId,
        notas_adicionales: updates.notasAdicionales,
      })
      .eq('id', asuntoId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete an asunto
   */
  async deleteAsunto(asuntoId: string) {
    const { error } = await supabase
      .from('asuntos')
      .delete()
      .eq('id', asuntoId);

    if (error) throw error;
  },

  /**
   * Convert all asuntos from a visita to pendientes
   */
  async convertToPendientes(visitaId: string, userId: string) {
    // Get all asuntos from the visita
    const { data: asuntos, error: asuntosError } = await supabase
      .from('asuntos')
      .select('*')
      .eq('visita_id', visitaId)
      .eq('convertido_a_pendiente', false);

    if (asuntosError) throw asuntosError;

    if (!asuntos || asuntos.length === 0) {
      return { count: 0, pendientes: [] };
    }

    // Get visita to get proyecto_id
    const { data: visita, error: visitaError } = await supabase
      .from('visitas')
      .select('proyecto_id')
      .eq('id', visitaId)
      .single();

    if (visitaError) throw visitaError;

    // Create pendientes for each asunto
    const pendientesData = asuntos.map((asunto) => ({
      proyecto_id: visita.proyecto_id,
      area: asunto.area,
      tarea: asunto.descripcion,
      descripcion: asunto.notas_adicionales,
      encargado_id: asunto.encargado_id,
      estado: 'pausa' as const,
      creado_por: userId,
      visita_id: visitaId,
      asunto_id: asunto.id,
      fecha_creacion: new Date().toISOString(),
    }));

    const { data: pendientes, error: pendientesError } = await supabase
      .from('pendientes')
      .insert(pendientesData)
      .select();

    if (pendientesError) throw pendientesError;

    // Mark asuntos as converted
    const { error: updateError } = await supabase
      .from('asuntos')
      .update({ convertido_a_pendiente: true })
      .in('id', asuntos.map((a) => a.id));

    if (updateError) throw updateError;

    return {
      count: pendientes.length,
      pendientes,
    };
  },
};
