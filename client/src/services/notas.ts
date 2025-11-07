import { supabase } from './supabase';
import type { Nota } from '../types';

export const notasService = {
  /**
   * Get all notas for a project
   */
  async getAll(proyectoId: string): Promise<Nota[]> {
    const { data, error } = await supabase
      .from('notas')
      .select(`
        *,
        autor:profiles!notas_autor_id_fkey(id, nombre)
      `)
      .eq('proyecto_id', proyectoId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((n) => ({
      id: n.id,
      proyectoId: n.proyecto_id,
      contenido: n.contenido,
      area: n.area,
      autorId: n.autor_id,
      autor: n.autor ? {
        id: n.autor.id,
        nombre: n.autor.nombre,
      } : undefined,
      convertidaAPendiente: n.convertida_a_pendiente,
      pendienteId: n.pendiente_id,
      createdAt: new Date(n.created_at),
      updatedAt: new Date(n.updated_at),
    }));
  },

  /**
   * Get a single nota by ID
   */
  async getById(id: string): Promise<Nota> {
    const { data, error } = await supabase
      .from('notas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      proyectoId: data.proyecto_id,
      contenido: data.contenido,
      area: data.area,
      autorId: data.autor_id,
      convertidaAPendiente: data.convertida_a_pendiente,
      pendienteId: data.pendiente_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  /**
   * Create a nota
   */
  async create(nota: Partial<Nota>, userId: string) {
    const { data, error } = await supabase
      .from('notas')
      .insert({
        proyecto_id: nota.proyectoId,
        contenido: nota.contenido,
        area: nota.area,
        autor_id: userId,
        convertida_a_pendiente: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a nota
   */
  async update(id: string, updates: Partial<Nota>) {
    const { data, error } = await supabase
      .from('notas')
      .update({
        contenido: updates.contenido,
        area: updates.area,
        convertida_a_pendiente: updates.convertidaAPendiente,
        pendiente_id: updates.pendienteId,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a nota
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('notas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
