import { supabase, isMockMode } from './supabase';
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

// Mock user for development
const MOCK_USER: User = {
  id: 'mock-user-1',
  email: 'demo@esantmaria.cl',
  nombre: 'Felipe Larraín',
  rol: 'admin',
  telefono: '+56912345678',
  especialidad: 'Arquitectura',
  avatar: undefined,
  proyectos: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const authService = {
  /**
   * Sign up a new user
   */
  async signUp(data: SignUpData): Promise<{ user: User; session: any }> {
    if (isMockMode) {
      // In mock mode, just return the mock user
      const mockUser: User = {
        ...MOCK_USER,
        email: data.email,
        nombre: data.nombre,
        telefono: data.telefono,
        rol: data.rol || 'especialista',
        especialidad: data.especialidad,
      };
      return { user: mockUser, session: { mock: true } };
    }

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

    const user = await this.getCurrentUser();
    if (!user) throw new Error('Failed to get user profile after signup');

    return { user, session: authData.session };
  },

  /**
   * Sign in an existing user
   */
  async signIn(email: string, password: string): Promise<{ user: User; session: any }> {
    if (isMockMode) {
      // In mock mode, accept any credentials
      console.log('🔶 Mock login - any credentials accepted');
      return { user: MOCK_USER, session: { mock: true } };
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!authData.user) throw new Error('No user returned from signin');

    const user = await this.getCurrentUser();
    if (!user) throw new Error('Failed to get user profile after signin');

    return { user, session: authData.session };
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    if (isMockMode) {
      return; // Nothing to do in mock mode
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get the current session
   */
  async getSession() {
    if (isMockMode) {
      return null; // No persistent session in mock mode
    }
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Get the current user with profile data
   */
  async getCurrentUser(): Promise<User | null> {
    if (isMockMode) {
      return null; // Will be set after mock login
    }

    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error) throw error;

    return {
      id: profile.id,
      email: profile.email,
      nombre: profile.nombre,
      rol: profile.rol as UserRole,
      telefono: profile.telefono,
      especialidad: profile.especialidad,
      avatar: profile.avatar,
      proyectos: [],
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at),
    };
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<User>) {
    if (isMockMode) {
      return { ...MOCK_USER, ...updates };
    }

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
    if (isMockMode) {
      // No real auth state changes in mock mode
      return { data: { subscription: { unsubscribe: () => {} } } };
    }

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
    if (isMockMode) {
      console.log('🔶 Mock password reset for:', email);
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    if (isMockMode) {
      console.log('🔶 Mock password update');
      return;
    }
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  },

  /**
   * Get mock user (for mock mode only)
   */
  getMockUser(): User {
    return MOCK_USER;
  },
};
