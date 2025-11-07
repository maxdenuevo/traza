import { supabase } from './supabase';
import type { User, UserRole } from '../types';

export interface SignUpData {
  email: string;
  password: string;
  nombre: string;
  telefono: string;
  rol?: UserRole;
  especialidad?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const authService = {
  /**
   * Sign up a new user
   */
  async signUp(data: SignUpData): Promise<{ user: User; session: any }> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          nombre: data.nombre,
          telefono: data.telefono,
          rol: data.rol || 'especialista',
          especialidad: data.especialidad,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user returned from signup');

    // Get the full user profile
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Failed to get user profile after signup');

    return { user, session: authData.session };
  },

  /**
   * Sign in an existing user
   */
  async signIn(email: string, password: string): Promise<{ user: User; session: any }> {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!authData.user) throw new Error('No user returned from signin');

    // Get the full user profile
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Failed to get user profile after signin');

    return { user, session: authData.session };
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get the current session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Get the current user with profile data
   */
  async getCurrentUser(): Promise<User | null> {
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error) throw error;

    // Transform to match User type
    return {
      id: profile.id,
      email: profile.email,
      nombre: profile.nombre,
      rol: profile.rol as UserRole,
      telefono: profile.telefono,
      especialidad: profile.especialidad,
      avatar: profile.avatar,
      proyectos: [], // Will be loaded separately
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at),
    };
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        nombre: updates.nombre,
        telefono: updates.telefono,
        especialidad: updates.especialidad,
        avatar: updates.avatar,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  },

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  },
};
