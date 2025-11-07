import { supabase } from './supabase';
import type { PresupuestoItem } from '../types';

export const presupuestoService = {
  /**
   * Get all budget items for a project
   */
  async getAll(proyectoId: string): Promise<PresupuestoItem[]> {
    const { data, error } = await supabase
      .from('presupuesto_items')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((item) => ({
      id: item.id,
      proyectoId: item.proyecto_id,
      categoria: item.categoria,
      descripcion: item.descripcion,
      montoEstimado: item.monto_estimado,
      montoReal: item.monto_real,
      porcentajeEjecutado: item.porcentaje_ejecutado,
      archivoUrl: item.archivo_url,
      notificaCambios: item.notifica_cambios,
      ultimaActualizacion: item.ultima_actualizacion ? new Date(item.ultima_actualizacion) : undefined,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    }));
  },

  /**
   * Get items grouped by category
   */
  async getByCategory(proyectoId: string) {
    const items = await this.getAll(proyectoId);

    const grouped = items.reduce((acc, item) => {
      const categoria = item.categoria;
      if (!acc[categoria]) {
        acc[categoria] = [];
      }
      acc[categoria].push(item);
      return acc;
    }, {} as Record<string, PresupuestoItem[]>);

    return Object.entries(grouped).map(([categoria, items]) => ({
      categoria,
      items,
      totalEstimado: items.reduce((sum, item) => sum + item.montoEstimado, 0),
      totalReal: items.reduce((sum, item) => sum + (item.montoReal || 0), 0),
    }));
  },

  /**
   * Get a single item by ID
   */
  async getById(id: string): Promise<PresupuestoItem> {
    const { data, error } = await supabase
      .from('presupuesto_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      proyectoId: data.proyecto_id,
      categoria: data.categoria,
      descripcion: data.descripcion,
      montoEstimado: data.monto_estimado,
      montoReal: data.monto_real,
      porcentajeEjecutado: data.porcentaje_ejecutado,
      archivoUrl: data.archivo_url,
      notificaCambios: data.notifica_cambios,
      ultimaActualizacion: data.ultima_actualizacion ? new Date(data.ultima_actualizacion) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  /**
   * Create a budget item
   */
  async create(item: Partial<PresupuestoItem>) {
    const { data, error } = await supabase
      .from('presupuesto_items')
      .insert({
        proyecto_id: item.proyectoId,
        categoria: item.categoria,
        descripcion: item.descripcion,
        monto_estimado: item.montoEstimado,
        monto_real: item.montoReal || 0,
        porcentaje_ejecutado: item.porcentajeEjecutado || 0,
        archivo_url: item.archivoUrl,
        notifica_cambios: item.notificaCambios || false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a budget item
   */
  async update(id: string, updates: Partial<PresupuestoItem>) {
    const updateData: any = {
      descripcion: updates.descripcion,
      categoria: updates.categoria,
      monto_estimado: updates.montoEstimado,
      monto_real: updates.montoReal,
      porcentaje_ejecutado: updates.porcentajeEjecutado,
      archivo_url: updates.archivoUrl,
      notifica_cambios: updates.notificaCambios,
    };

    // Update ultima_actualizacion if monto_real or porcentaje changes
    if (updates.montoReal !== undefined || updates.porcentajeEjecutado !== undefined) {
      updateData.ultima_actualizacion = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('presupuesto_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a budget item
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('presupuesto_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get budget summary for a project
   */
  async getSummary(proyectoId: string) {
    const items = await this.getAll(proyectoId);

    const totalEstimado = items.reduce((sum, item) => sum + item.montoEstimado, 0);
    const totalGastado = items.reduce((sum, item) => sum + (item.montoReal || 0), 0);
    const disponible = totalEstimado - totalGastado;
    const porcentajeGastado = totalEstimado > 0 ? (totalGastado / totalEstimado) * 100 : 0;

    // Group by category
    const porCategoria = items.reduce((acc, item) => {
      if (!acc[item.categoria]) {
        acc[item.categoria] = {
          estimado: 0,
          gastado: 0,
          count: 0,
        };
      }
      acc[item.categoria].estimado += item.montoEstimado;
      acc[item.categoria].gastado += item.montoReal || 0;
      acc[item.categoria].count += 1;
      return acc;
    }, {} as Record<string, { estimado: number; gastado: number; count: number }>);

    return {
      totalEstimado,
      totalGastado,
      disponible,
      porcentajeGastado,
      totalItems: items.length,
      porCategoria,
    };
  },
};
