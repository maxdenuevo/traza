import { supabase } from './supabase';
import type { Permiso, PermisoEstado, PermisoTipo } from '../types';

const isMockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Mock data for development
const mockPermisos: Permiso[] = [
  {
    id: 'permiso-1',
    proyectoId: 'project-1',
    nombre: 'Permiso de Edificación',
    tipo: 'edificacion',
    estado: 'aprobado',
    notas: 'Aprobado sin observaciones',
    createdAt: new Date('2025-12-01'),
    updatedAt: new Date('2025-12-15'),
  },
  {
    id: 'permiso-2',
    proyectoId: 'project-1',
    nombre: 'Permiso Municipal Obras Menores',
    tipo: 'municipal',
    estado: 'en_tramite',
    notas: 'En proceso de revisión',
    fechaVencimiento: new Date('2026-06-01'),
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-01-10'),
  },
  {
    id: 'permiso-3',
    proyectoId: 'project-1',
    nombre: 'Recepción Final de Obra',
    tipo: 'recepcion_obra',
    estado: 'pendiente',
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-15'),
  },
];

export const permisosService = {
  async getAll(proyectoId: string): Promise<Permiso[]> {
    if (isMockMode) {
      return mockPermisos.filter(p => p.proyectoId === proyectoId);
    }

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
      tipo: p.tipo as PermisoTipo,
      estado: p.estado as PermisoEstado,
      notas: p.notas,
      fechaVencimiento: p.fecha_vencimiento ? new Date(p.fecha_vencimiento) : undefined,
      createdAt: new Date(p.created_at),
      updatedAt: new Date(p.updated_at),
    }));
  },

  async create(permiso: {
    proyectoId: string;
    nombre: string;
    tipo: PermisoTipo;
    estado?: PermisoEstado;
    notas?: string;
    fechaVencimiento?: Date;
  }): Promise<Permiso> {
    if (isMockMode) {
      const newPermiso: Permiso = {
        id: 'permiso-' + Date.now(),
        proyectoId: permiso.proyectoId,
        nombre: permiso.nombre,
        tipo: permiso.tipo,
        estado: permiso.estado || 'pendiente',
        notas: permiso.notas,
        fechaVencimiento: permiso.fechaVencimiento,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPermisos.push(newPermiso);
      return newPermiso;
    }

    const { data, error } = await supabase
      .from('permisos')
      .insert({
        proyecto_id: permiso.proyectoId,
        nombre: permiso.nombre,
        tipo: permiso.tipo,
        estado: permiso.estado || 'pendiente',
        notas: permiso.notas,
        fecha_vencimiento: permiso.fechaVencimiento?.toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      proyectoId: data.proyecto_id,
      nombre: data.nombre,
      tipo: data.tipo as PermisoTipo,
      estado: data.estado as PermisoEstado,
      notas: data.notas,
      fechaVencimiento: data.fecha_vencimiento ? new Date(data.fecha_vencimiento) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  async update(id: string, updates: Partial<Omit<Permiso, 'id' | 'proyectoId' | 'createdAt'>>): Promise<Permiso> {
    if (isMockMode) {
      const idx = mockPermisos.findIndex(p => p.id === id);
      if (idx < 0) throw new Error('Permiso no encontrado');

      mockPermisos[idx] = {
        ...mockPermisos[idx],
        ...updates,
        updatedAt: new Date(),
      };
      return mockPermisos[idx];
    }

    const updateData: Record<string, unknown> = {};
    if (updates.nombre !== undefined) updateData.nombre = updates.nombre;
    if (updates.tipo !== undefined) updateData.tipo = updates.tipo;
    if (updates.estado !== undefined) updateData.estado = updates.estado;
    if (updates.notas !== undefined) updateData.notas = updates.notas;
    if (updates.fechaVencimiento !== undefined) {
      updateData.fecha_vencimiento = updates.fechaVencimiento?.toISOString().split('T')[0] || null;
    }

    const { data, error } = await supabase
      .from('permisos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      proyectoId: data.proyecto_id,
      nombre: data.nombre,
      tipo: data.tipo as PermisoTipo,
      estado: data.estado as PermisoEstado,
      notas: data.notas,
      fechaVencimiento: data.fecha_vencimiento ? new Date(data.fecha_vencimiento) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  async delete(id: string): Promise<void> {
    if (isMockMode) {
      const idx = mockPermisos.findIndex(p => p.id === id);
      if (idx >= 0) mockPermisos.splice(idx, 1);
      return;
    }

    const { error } = await supabase
      .from('permisos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
