import { supabase } from './supabase';
import type { CheckboxItem, CheckboxCheck, Periodicidad } from '../types';

const isMockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Mock data
const mockItems: CheckboxItem[] = [
  {
    id: 'chk-1',
    proyectoId: 'proyecto-1',
    sectorNombre: 'General',
    descripcion: 'Verificar limpieza general de obra',
    periodicidad: 'diario',
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'chk-2',
    proyectoId: 'proyecto-1',
    sectorNombre: 'General',
    descripcion: 'Revisar señalización de seguridad',
    periodicidad: 'diario',
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'chk-3',
    proyectoId: 'proyecto-1',
    sectorNombre: 'Baño principal',
    descripcion: 'Verificar instalaciones sanitarias',
    periodicidad: 'semanal',
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'chk-4',
    proyectoId: 'proyecto-1',
    sectorNombre: 'Cocina',
    descripcion: 'Revisar avance de instalación eléctrica',
    periodicidad: 'semanal',
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'chk-5',
    proyectoId: 'proyecto-1',
    descripcion: 'Verificar extintores y equipos de emergencia',
    periodicidad: 'mensual',
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockChecks: CheckboxCheck[] = [];

export const checkboxService = {
  /**
   * Get all checkbox items for a project
   */
  async getItems(proyectoId: string): Promise<CheckboxItem[]> {
    if (isMockMode) {
      return mockItems.filter(i => i.proyectoId === proyectoId && i.activo);
    }

    const { data, error } = await supabase
      .from('checkbox_items')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .eq('activo', true)
      .order('sector_nombre', { ascending: true });

    if (error) throw error;

    return data.map((i) => ({
      id: i.id,
      proyectoId: i.proyecto_id,
      sectorNombre: i.sector_nombre,
      descripcion: i.descripcion,
      periodicidad: i.periodicidad as Periodicidad,
      activo: i.activo,
      createdAt: new Date(i.created_at),
      updatedAt: new Date(i.updated_at),
    }));
  },

  /**
   * Get items by periodicidad
   */
  async getItemsByPeriodicidad(proyectoId: string, periodicidad: Periodicidad): Promise<CheckboxItem[]> {
    const items = await this.getItems(proyectoId);
    return items.filter(i => i.periodicidad === periodicidad);
  },

  /**
   * Get checks for a specific date
   */
  async getChecksForDate(proyectoId: string, fecha: Date): Promise<CheckboxCheck[]> {
    const dateStr = fecha.toISOString().split('T')[0];

    if (isMockMode) {
      return mockChecks.filter(c => {
        const checkDateStr = c.fecha.toISOString().split('T')[0];
        return checkDateStr === dateStr;
      });
    }

    const { data, error } = await supabase
      .from('checkbox_checks')
      .select(`
        *,
        item:checkbox_items!inner(proyecto_id)
      `)
      .eq('item.proyecto_id', proyectoId)
      .eq('fecha', dateStr);

    if (error) throw error;

    return data.map((c) => ({
      id: c.id,
      itemId: c.item_id,
      fecha: new Date(c.fecha),
      completado: c.completado,
      checkedBy: c.checked_by,
      createdAt: new Date(c.created_at),
    }));
  },

  /**
   * Get items with their check status for a date
   */
  async getItemsWithStatus(proyectoId: string, fecha: Date): Promise<(CheckboxItem & { completado: boolean; checkId?: string })[]> {
    const items = await this.getItems(proyectoId);
    const checks = await this.getChecksForDate(proyectoId, fecha);

    return items.map(item => {
      const check = checks.find(c => c.itemId === item.id);
      return {
        ...item,
        completado: check?.completado || false,
        checkId: check?.id,
      };
    });
  },

  /**
   * Toggle a checkbox check
   */
  async toggleCheck(itemId: string, fecha: Date, userId: string): Promise<CheckboxCheck> {
    const dateStr = fecha.toISOString().split('T')[0];

    if (isMockMode) {
      const existingIdx = mockChecks.findIndex(
        c => c.itemId === itemId && c.fecha.toISOString().split('T')[0] === dateStr
      );

      if (existingIdx >= 0) {
        mockChecks[existingIdx].completado = !mockChecks[existingIdx].completado;
        return mockChecks[existingIdx];
      }

      const newCheck: CheckboxCheck = {
        id: `check-${Date.now()}`,
        itemId,
        fecha: new Date(dateStr),
        completado: true,
        checkedBy: userId,
        createdAt: new Date(),
      };
      mockChecks.push(newCheck);
      return newCheck;
    }

    // Check if exists
    const { data: existing } = await supabase
      .from('checkbox_checks')
      .select('*')
      .eq('item_id', itemId)
      .eq('fecha', dateStr)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('checkbox_checks')
        .update({ completado: !existing.completado })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        itemId: data.item_id,
        fecha: new Date(data.fecha),
        completado: data.completado,
        checkedBy: data.checked_by,
        createdAt: new Date(data.created_at),
      };
    }

    const { data, error } = await supabase
      .from('checkbox_checks')
      .insert({
        item_id: itemId,
        fecha: dateStr,
        completado: true,
        checked_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      itemId: data.item_id,
      fecha: new Date(data.fecha),
      completado: data.completado,
      checkedBy: data.checked_by,
      createdAt: new Date(data.created_at),
    };
  },

  /**
   * Create a new checkbox item
   */
  async createItem(item: Partial<CheckboxItem>): Promise<CheckboxItem> {
    if (isMockMode) {
      const newItem: CheckboxItem = {
        id: `chk-${Date.now()}`,
        proyectoId: item.proyectoId!,
        sectorNombre: item.sectorNombre,
        descripcion: item.descripcion!,
        periodicidad: item.periodicidad || 'diario',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockItems.push(newItem);
      return newItem;
    }

    const { data, error } = await supabase
      .from('checkbox_items')
      .insert({
        proyecto_id: item.proyectoId,
        sector_nombre: item.sectorNombre,
        descripcion: item.descripcion,
        periodicidad: item.periodicidad || 'diario',
        activo: true,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      proyectoId: data.proyecto_id,
      sectorNombre: data.sector_nombre,
      descripcion: data.descripcion,
      periodicidad: data.periodicidad as Periodicidad,
      activo: data.activo,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  /**
   * Delete (deactivate) a checkbox item
   */
  async deleteItem(id: string): Promise<void> {
    if (isMockMode) {
      const idx = mockItems.findIndex(i => i.id === id);
      if (idx >= 0) {
        mockItems[idx].activo = false;
      }
      return;
    }

    const { error } = await supabase
      .from('checkbox_items')
      .update({ activo: false })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get completion stats for a date range
   */
  async getStats(proyectoId: string, fecha: Date) {
    const items = await this.getItemsWithStatus(proyectoId, fecha);
    const diarios = items.filter(i => i.periodicidad === 'diario');
    const completados = items.filter(i => i.completado);

    return {
      total: items.length,
      completados: completados.length,
      pendientes: items.length - completados.length,
      porcentaje: items.length > 0 ? Math.round((completados.length / items.length) * 100) : 0,
      diarios: {
        total: diarios.length,
        completados: diarios.filter(i => i.completado).length,
      },
    };
  },
};
