import { supabase } from './supabase';
import type { Asistencia } from '../types';

const isMockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Mock data
const mockAsistencia: Asistencia[] = [];

// Mock workers (subset of team for attendance tracking)
const mockTrabajadores = [
  { id: 'user-3', nombre: 'Pedro Soto', especialidad: 'Albañil' },
  { id: 'user-4', nombre: 'José Muñoz', especialidad: 'Electricista' },
  { id: 'user-5', nombre: 'Miguel Reyes', especialidad: 'Gasfiter' },
];

export interface TrabajadorAsistencia {
  trabajadorId: string;
  nombre: string;
  especialidad?: string;
  presente: boolean;
  asistenciaId?: string;
}

export const asistenciaService = {
  /**
   * Get workers available for attendance (trabajadores and subcontratados)
   */
  async getTrabajadores(proyectoId: string): Promise<{ id: string; nombre: string; especialidad?: string }[]> {
    if (isMockMode) {
      return mockTrabajadores;
    }

    const { data, error } = await supabase
      .from('proyecto_usuarios')
      .select(`
        user_id,
        profiles!inner(id, nombre, especialidad, rol)
      `)
      .eq('proyecto_id', proyectoId)
      .in('profiles.rol', ['trabajador', 'subcontratado']);

    if (error) throw error;

    // Supabase returns profiles as an object (single) due to the foreign key relationship
    return (data || []).map((pu) => {
      const profile = pu.profiles as unknown as { id: string; nombre: string; especialidad?: string };
      return {
        id: profile.id,
        nombre: profile.nombre,
        especialidad: profile.especialidad,
      };
    });
  },

  /**
   * Get attendance for a specific date
   */
  async getForDate(proyectoId: string, fecha: Date): Promise<Asistencia[]> {
    const dateStr = fecha.toISOString().split('T')[0];

    if (isMockMode) {
      return mockAsistencia.filter(a => {
        const aDateStr = a.fecha.toISOString().split('T')[0];
        return a.proyectoId === proyectoId && aDateStr === dateStr;
      });
    }

    const { data, error } = await supabase
      .from('asistencia')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .eq('fecha', dateStr);

    if (error) throw error;

    return data.map((a) => ({
      id: a.id,
      proyectoId: a.proyecto_id,
      trabajadorId: a.trabajador_id,
      fecha: new Date(a.fecha),
      presente: a.presente,
      registradoPor: a.registrado_por,
      createdAt: new Date(a.created_at),
    }));
  },

  /**
   * Get workers with attendance status for a date
   */
  async getTrabajadoresWithStatus(proyectoId: string, fecha: Date): Promise<TrabajadorAsistencia[]> {
    const trabajadores = await this.getTrabajadores(proyectoId);
    const asistencias = await this.getForDate(proyectoId, fecha);

    return trabajadores.map(t => {
      const asistencia = asistencias.find(a => a.trabajadorId === t.id);
      return {
        trabajadorId: t.id,
        nombre: t.nombre,
        especialidad: t.especialidad,
        presente: asistencia?.presente || false,
        asistenciaId: asistencia?.id,
      };
    });
  },

  /**
   * Toggle attendance for a worker
   */
  async toggleAsistencia(
    proyectoId: string,
    trabajadorId: string,
    fecha: Date,
    userId: string
  ): Promise<Asistencia> {
    const dateStr = fecha.toISOString().split('T')[0];

    if (isMockMode) {
      const existingIdx = mockAsistencia.findIndex(
        a => a.proyectoId === proyectoId &&
             a.trabajadorId === trabajadorId &&
             a.fecha.toISOString().split('T')[0] === dateStr
      );

      if (existingIdx >= 0) {
        mockAsistencia[existingIdx].presente = !mockAsistencia[existingIdx].presente;
        return mockAsistencia[existingIdx];
      }

      const newAsistencia: Asistencia = {
        id: `asist-${Date.now()}`,
        proyectoId,
        trabajadorId,
        fecha: new Date(dateStr),
        presente: true,
        registradoPor: userId,
        createdAt: new Date(),
      };
      mockAsistencia.push(newAsistencia);
      return newAsistencia;
    }

    // Check if exists
    const { data: existing } = await supabase
      .from('asistencia')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .eq('trabajador_id', trabajadorId)
      .eq('fecha', dateStr)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('asistencia')
        .update({ presente: !existing.presente })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        proyectoId: data.proyecto_id,
        trabajadorId: data.trabajador_id,
        fecha: new Date(data.fecha),
        presente: data.presente,
        registradoPor: data.registrado_por,
        createdAt: new Date(data.created_at),
      };
    }

    const { data, error } = await supabase
      .from('asistencia')
      .insert({
        proyecto_id: proyectoId,
        trabajador_id: trabajadorId,
        fecha: dateStr,
        presente: true,
        registrado_por: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      proyectoId: data.proyecto_id,
      trabajadorId: data.trabajador_id,
      fecha: new Date(data.fecha),
      presente: data.presente,
      registradoPor: data.registrado_por,
      createdAt: new Date(data.created_at),
    };
  },

  /**
   * Mark all workers as present for a date
   */
  async markAllPresent(proyectoId: string, fecha: Date, userId: string): Promise<void> {
    const trabajadores = await this.getTrabajadores(proyectoId);
    const dateStr = fecha.toISOString().split('T')[0];

    if (isMockMode) {
      for (const t of trabajadores) {
        const existing = mockAsistencia.find(
          a => a.proyectoId === proyectoId &&
               a.trabajadorId === t.id &&
               a.fecha.toISOString().split('T')[0] === dateStr
        );

        if (existing) {
          existing.presente = true;
        } else {
          mockAsistencia.push({
            id: `asist-${Date.now()}-${t.id}`,
            proyectoId,
            trabajadorId: t.id,
            fecha: new Date(dateStr),
            presente: true,
            registradoPor: userId,
            createdAt: new Date(),
          });
        }
      }
      return;
    }

    // Upsert all workers
    const records = trabajadores.map(t => ({
      proyecto_id: proyectoId,
      trabajador_id: t.id,
      fecha: dateStr,
      presente: true,
      registrado_por: userId,
    }));

    const { error } = await supabase
      .from('asistencia')
      .upsert(records, { onConflict: 'proyecto_id,trabajador_id,fecha' });

    if (error) throw error;
  },

  /**
   * Get attendance stats for a date
   */
  async getStats(proyectoId: string, fecha: Date) {
    const trabajadores = await this.getTrabajadoresWithStatus(proyectoId, fecha);
    const presentes = trabajadores.filter(t => t.presente);

    return {
      total: trabajadores.length,
      presentes: presentes.length,
      ausentes: trabajadores.length - presentes.length,
      porcentaje: trabajadores.length > 0
        ? Math.round((presentes.length / trabajadores.length) * 100)
        : 0,
    };
  },

  /**
   * Get attendance history for date range
   */
  async getHistory(proyectoId: string, startDate: Date, endDate: Date) {
    if (isMockMode) {
      return mockAsistencia.filter(a => {
        return a.proyectoId === proyectoId &&
               a.fecha >= startDate &&
               a.fecha <= endDate;
      });
    }

    const { data, error } = await supabase
      .from('asistencia')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .gte('fecha', startDate.toISOString().split('T')[0])
      .lte('fecha', endDate.toISOString().split('T')[0])
      .order('fecha', { ascending: false });

    if (error) throw error;

    return data.map((a) => ({
      id: a.id,
      proyectoId: a.proyecto_id,
      trabajadorId: a.trabajador_id,
      fecha: new Date(a.fecha),
      presente: a.presente,
      registradoPor: a.registrado_por,
      createdAt: new Date(a.created_at),
    }));
  },
};
