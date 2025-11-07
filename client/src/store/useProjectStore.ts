import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProyectoListItem } from '../types';

/**
 * Project Store
 *
 * Stores lightweight project list items for selection and context.
 * Individual pages fetch their own detailed data as needed.
 *
 * Note: currentProject and projects array contain ProyectoListItem (basic info only),
 * not full Proyecto with relationships. Pages should fetch visitas, pendientes, etc.
 * separately using their respective hooks.
 */
interface ProjectState {
  currentProject: ProyectoListItem | null;
  projects: ProyectoListItem[];

  // Actions
  setCurrentProject: (project: ProyectoListItem | null) => void;
  setProjects: (projects: ProyectoListItem[]) => void;
  addProject: (project: ProyectoListItem) => void;
  updateProject: (id: string, updates: Partial<ProyectoListItem>) => void;
  removeProject: (id: string) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      currentProject: null,
      projects: [],

      setCurrentProject: (project) => set({ currentProject: project }),

      setProjects: (projects) => set({ projects }),

      addProject: (project) => set((state) => ({
        projects: [project, ...state.projects],
      })),

      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
        currentProject:
          state.currentProject?.id === id
            ? { ...state.currentProject, ...updates }
            : state.currentProject,
      })),

      removeProject: (id) => set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject:
          state.currentProject?.id === id ? null : state.currentProject,
      })),
    }),
    {
      name: 'esant-project',
    }
  )
);
