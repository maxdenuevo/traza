import { supabase } from './supabase';
import type { User } from '../types';

export const equipoService = {
  /**
   * Get all team members for a project
   */
  async getTeamMembers(proyectoId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('proyecto_usuarios')
      .select(`
        user:profiles(*)
      `)
      .eq('proyecto_id', proyectoId);

    if (error) throw error;

    return data.map((item: any) => ({
      id: item.user.id,
      email: item.user.email,
      nombre: item.user.nombre,
      rol: item.user.rol,
      telefono: item.user.telefono,
      especialidad: item.user.especialidad,
      avatar: item.user.avatar,
      proyectos: [],
      createdAt: new Date(item.user.created_at),
      updatedAt: new Date(item.user.updated_at),
    }));
  },

  /**
   * Get team members grouped by role
   */
  async getTeamMembersByRole(proyectoId: string) {
    const members = await this.getTeamMembers(proyectoId);

    const grouped = members.reduce((acc, member) => {
      const rol = member.rol;
      if (!acc[rol]) {
        acc[rol] = [];
      }
      acc[rol].push(member);
      return acc;
    }, {} as Record<string, User[]>);

    return Object.entries(grouped).map(([rol, users]) => ({
      rol,
      users,
    }));
  },

  /**
   * Get team members grouped by especialidad (for specialists)
   */
  async getTeamMembersByEspecialidad(proyectoId: string) {
    const members = await this.getTeamMembers(proyectoId);
    const specialists = members.filter(m => m.especialidad);

    const grouped = specialists.reduce((acc, member) => {
      const especialidad = member.especialidad || 'Sin especialidad';
      if (!acc[especialidad]) {
        acc[especialidad] = [];
      }
      acc[especialidad].push(member);
      return acc;
    }, {} as Record<string, User[]>);

    return Object.entries(grouped).map(([especialidad, users]) => ({
      especialidad,
      users,
    }));
  },

  /**
   * Search for users to add to project (not already in team)
   */
  async searchUsers(proyectoId: string, searchTerm: string): Promise<User[]> {
    // First get current team member IDs
    const { data: currentMembers, error: membersError } = await supabase
      .from('proyecto_usuarios')
      .select('user_id')
      .eq('proyecto_id', proyectoId);

    if (membersError) throw membersError;

    const memberIds = currentMembers.map(m => m.user_id);

    // Then search users not in the team
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`nombre.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .not('id', 'in', `(${memberIds.join(',')})`)
      .limit(10);

    if (error) throw error;

    return data.map((user: any) => ({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
      telefono: user.telefono,
      especialidad: user.especialidad,
      avatar: user.avatar,
      proyectos: [],
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
    }));
  },

  /**
   * Add a user to the project team
   */
  async addMember(proyectoId: string, userId: string) {
    const { error } = await supabase
      .from('proyecto_usuarios')
      .insert({
        proyecto_id: proyectoId,
        user_id: userId,
      });

    if (error) throw error;
  },

  /**
   * Remove a user from the project team
   */
  async removeMember(proyectoId: string, userId: string) {
    const { error } = await supabase
      .from('proyecto_usuarios')
      .delete()
      .eq('proyecto_id', proyectoId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  /**
   * Get team statistics
   */
  async getTeamStats(proyectoId: string) {
    const members = await this.getTeamMembers(proyectoId);

    return {
      total: members.length,
      admins: members.filter(m => m.rol === 'admin').length,
      jefes: members.filter(m => m.rol === 'jefe_proyecto').length,
      especialistas: members.filter(m => m.rol === 'especialista').length,
      clientes: members.filter(m => m.rol === 'cliente').length,
    };
  },
};
