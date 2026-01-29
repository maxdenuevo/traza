import { supabase, isMockMode } from './supabase';
import type { Proyecto, ProyectoListItem } from '../types';

// Mock projects for development
const MOCK_PROJECTS: ProyectoListItem[] = [
  {
    id: 'mock-project-1',
    nombre: 'AGUA DEL PALO',
    cliente: 'Familia González',
    estado: 'en_obra',
    fechaInicio: new Date('2025-10-01'),
    fechaEstimadaFin: new Date('2026-03-30'),
    direccion: 'Av. Las Condes 1234, Santiago',
    descripcion: 'Remodelación completa de casa de 250m2',
    presupuestoTotal: 85000000,
    usuarios: [],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date(),
  },
  {
    id: 'mock-project-2',
    nombre: 'SANTA MARIA',
    cliente: 'Inmobiliaria Santa María',
    estado: 'planificacion',
    fechaInicio: new Date('2025-03-01'),
    fechaEstimadaFin: new Date('2025-12-31'),
    direccion: 'Camino El Alba 456, Lo Barnechea',
    descripcion: 'Construcción de edificio residencial de 4 pisos',
    presupuestoTotal: 450000000,
    usuarios: [],
    createdAt: new Date('2025-02-15'),
    updatedAt: new Date(),
  },
];

const MOCK_FULL_PROJECT: Proyecto = {
  ...MOCK_PROJECTS[0],
  usuarios: [],
  visitas: [],
  pendientes: [],
  documentos: [],
  presupuestoItems: [],
};

export const proyectosService = {
  async getAll(): Promise<ProyectoListItem[]> {
    if (isMockMode) {
      console.log('🔶 Mock: Returning mock projects');
      return MOCK_PROJECTS;
    }

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

  async getById(id: string): Promise<Proyecto> {
    if (isMockMode) {
      const project = MOCK_PROJECTS.find(p => p.id === id);
      if (!project) throw new Error('Project not found');
      return { ...MOCK_FULL_PROJECT, ...project };
    }

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
      presupuestoItems: data.presupuesto_items || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  async create(proyecto: Partial<Proyecto>): Promise<Proyecto> {
    if (isMockMode) {
      const newProject: Proyecto = {
        id: `mock-project-${Date.now()}`,
        nombre: proyecto.nombre || 'Nuevo Proyecto',
        cliente: proyecto.cliente || '',
        estado: proyecto.estado || 'planificacion',
        fechaInicio: proyecto.fechaInicio || new Date(),
        fechaEstimadaFin: proyecto.fechaEstimadaFin,
        direccion: proyecto.direccion,
        descripcion: proyecto.descripcion,
        presupuestoTotal: proyecto.presupuestoTotal || 0,
        usuarios: [],
        visitas: [],
        pendientes: [],
        documentos: [],
        presupuestoItems: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_PROJECTS.unshift(newProject);
      return newProject;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

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

    const { error: assignError } = await supabase
      .from('proyecto_usuarios')
      .insert({
        proyecto_id: newProject.id,
        user_id: user.id,
      });

    if (assignError) throw assignError;

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
      presupuestoItems: [],
      createdAt: new Date(newProject.created_at),
      updatedAt: new Date(newProject.updated_at),
    };
  },

  async update(id: string, updates: Partial<Proyecto>) {
    if (isMockMode) {
      const idx = MOCK_PROJECTS.findIndex(p => p.id === id);
      if (idx >= 0) {
        MOCK_PROJECTS[idx] = { ...MOCK_PROJECTS[idx], ...updates, updatedAt: new Date() };
        return MOCK_PROJECTS[idx];
      }
      return null;
    }

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

  async delete(id: string) {
    if (isMockMode) {
      const idx = MOCK_PROJECTS.findIndex(p => p.id === id);
      if (idx >= 0) MOCK_PROJECTS.splice(idx, 1);
      return;
    }

    const { error } = await supabase
      .from('proyectos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async addUser(proyectoId: string, userId: string) {
    if (isMockMode) return;

    const { error } = await supabase
      .from('proyecto_usuarios')
      .insert({
        proyecto_id: proyectoId,
        user_id: userId,
      });

    if (error) throw error;
  },

  async removeUser(proyectoId: string, userId: string) {
    if (isMockMode) return;

    const { error } = await supabase
      .from('proyecto_usuarios')
      .delete()
      .eq('proyecto_id', proyectoId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async getSummary(id: string) {
    if (isMockMode) {
      return {
        id,
        pendientes: { count: 5 },
        visitas: { count: 3 },
        documentos: { count: 8 },
      };
    }

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
