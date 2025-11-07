import { supabase } from './supabase';
import type { Proyecto, ProyectoListItem } from '../types';

export const proyectosService = {
  /**
   * Get all projects for the current user
   *
   * Returns lightweight project list items optimized for list views.
   * Only includes basic project info and team members.
   *
   * @returns ProyectoListItem[] - Projects without full relationship data
   *
   * **Note:** For complete project data including visitas, pendientes, documentos, etc.,
   * use `getById()` instead. This method is optimized for performance by not fetching
   * large relationship arrays that aren't needed in list views.
   */
  async getAll(): Promise<ProyectoListItem[]> {
    const { data, error } = await supabase
      .from('proyectos')
      .select(`
        *,
        usuarios:proyecto_usuarios!inner(
          user:profiles(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((proyecto) => ({
      id: proyecto.id,
      nombre: proyecto.nombre,
      cliente: proyecto.cliente,
      estado: proyecto.estado,
      fechaInicio: new Date(proyecto.fecha_inicio),
      fechaEstimadaFin: proyecto.fecha_estimada_fin ? new Date(proyecto.fecha_estimada_fin) : undefined,
      direccion: proyecto.direccion,
      descripcion: proyecto.descripcion,
      presupuestoTotal: proyecto.presupuesto_total,
      usuarios: proyecto.usuarios.map((u: any) => u.user),
      createdAt: new Date(proyecto.created_at),
      updatedAt: new Date(proyecto.updated_at),
    }));
  },

  /**
   * Get a single project by ID with all relationships
   *
   * Returns complete project data including all visitas, pendientes, documentos,
   * notas, and presupuestoItems.
   *
   * @param id - Project ID
   * @returns Proyecto - Full project with all relationships loaded
   *
   * **Note:** This method fetches significantly more data than `getAll()`.
   * Use this only when you need the complete project data.
   */
  async getById(id: string): Promise<Proyecto> {
    const { data, error } = await supabase
      .from('proyectos')
      .select(`
        *,
        usuarios:proyecto_usuarios(
          user:profiles(*)
        ),
        visitas(*),
        pendientes(*),
        documentos(*),
        notas(*),
        presupuesto_items:presupuesto_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      nombre: data.nombre,
      cliente: data.cliente,
      estado: data.estado,
      fechaInicio: new Date(data.fecha_inicio),
      fechaEstimadaFin: data.fecha_estimada_fin ? new Date(data.fecha_estimada_fin) : undefined,
      direccion: data.direccion,
      descripcion: data.descripcion,
      presupuestoTotal: data.presupuesto_total,
      usuarios: data.usuarios?.map((u: any) => u.user) || [],
      visitas: data.visitas || [],
      pendientes: data.pendientes || [],
      documentos: data.documentos || [],
      notas: data.notas || [],
      presupuestoItems: data.presupuesto_items || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  /**
   * Create a new project and automatically assign current user
   */
  async create(proyecto: Partial<Proyecto>): Promise<Proyecto> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // Create project
    const { data: newProject, error: projectError } = await supabase
      .from('proyectos')
      .insert({
        nombre: proyecto.nombre,
        cliente: proyecto.cliente,
        estado: proyecto.estado || 'planificacion',
        fecha_inicio: proyecto.fechaInicio,
        fecha_estimada_fin: proyecto.fechaEstimadaFin,
        direccion: proyecto.direccion,
        descripcion: proyecto.descripcion,
        presupuesto_total: proyecto.presupuestoTotal,
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Assign current user to project
    const { error: assignError } = await supabase
      .from('proyecto_usuarios')
      .insert({
        proyecto_id: newProject.id,
        user_id: user.id,
      });

    if (assignError) throw assignError;

    // Return formatted project
    return {
      id: newProject.id,
      nombre: newProject.nombre,
      cliente: newProject.cliente,
      estado: newProject.estado,
      fechaInicio: new Date(newProject.fecha_inicio),
      fechaEstimadaFin: newProject.fecha_estimada_fin ? new Date(newProject.fecha_estimada_fin) : undefined,
      direccion: newProject.direccion,
      descripcion: newProject.descripcion,
      presupuestoTotal: newProject.presupuesto_total,
      usuarios: [],
      visitas: [],
      pendientes: [],
      documentos: [],
      notas: [],
      presupuestoItems: [],
      createdAt: new Date(newProject.created_at),
      updatedAt: new Date(newProject.updated_at),
    };
  },

  /**
   * Update a project
   */
  async update(id: string, updates: Partial<Proyecto>) {
    const { data, error } = await supabase
      .from('proyectos')
      .update({
        nombre: updates.nombre,
        cliente: updates.cliente,
        estado: updates.estado,
        fecha_estimada_fin: updates.fechaEstimadaFin,
        direccion: updates.direccion,
        descripcion: updates.descripcion,
        presupuesto_total: updates.presupuestoTotal,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a project
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('proyectos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Add a user to a project
   */
  async addUser(proyectoId: string, userId: string) {
    const { error } = await supabase
      .from('proyecto_usuarios')
      .insert({
        proyecto_id: proyectoId,
        user_id: userId,
      });

    if (error) throw error;
  },

  /**
   * Remove a user from a project
   */
  async removeUser(proyectoId: string, userId: string) {
    const { error } = await supabase
      .from('proyecto_usuarios')
      .delete()
      .eq('proyecto_id', proyectoId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  /**
   * Get project summary for dashboard
   */
  async getSummary(id: string) {
    const { data, error } = await supabase
      .from('proyectos')
      .select(`
        *,
        pendientes(count),
        visitas(count),
        documentos(count)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },
};
