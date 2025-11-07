import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { authService } from '../services/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        isLoading: false
      }),

      setLoading: (loading) => set({ isLoading: loading }),

      initialize: async () => {
        try {
          set({ isLoading: true });
          const user = await authService.getCurrentUser();
          set({
            user,
            isAuthenticated: !!user,
            isLoading: false
          });

          // Subscribe to auth changes
          authService.onAuthStateChange((user) => {
            get().setUser(user);
          });
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      signOut: async () => {
        try {
          await authService.signOut();
          set({ user: null, isAuthenticated: false });
        } catch (error) {
          console.error('Sign out failed:', error);
          throw error;
        }
      },
    }),
    {
      name: 'esant-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
