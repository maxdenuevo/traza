import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SectorStatus = 'pendiente' | 'en_curso' | 'pausado' | 'entregado' | 'cancelado';

// Sectors from CLAUDE.md specification
export const SECTORS = [
  'General',
  'Cocina',
  'Comedor',
  'Entrada',
  'Pieza principal',
  'Baño principal',
  'Pieza de servicio',
  'Baño de servicio',
  'Sala de estar',
  'Living',
  'Pieza niños',
  'Baño niños',
  'Jardín',
  'Patio servicio',
  'Baño de visitas',
  'Terraza',
] as const;

export type SectorName = typeof SECTORS[number];

export interface SectorData {
  status: SectorStatus;
  updatedAt: string;
  fechaInicio?: string;
  fechaEntregaPropuesta?: string;
  fechaEntregaReal?: string;
  obras?: string;
  valorEstimado?: number;
  valorActual?: number;
}

interface ProgramaState {
  // Map of projectId -> sectorName -> status data
  projectSectors: Record<string, Record<string, SectorData>>;

  // Actions
  getSectorStatus: (projectId: string, sectorName: string) => SectorStatus;
  getSectorData: (projectId: string, sectorName: string) => SectorData | null;
  setSectorStatus: (projectId: string, sectorName: string, status: SectorStatus) => void;
  updateSectorData: (projectId: string, sectorName: string, data: Partial<SectorData>) => void;
  initializeProjectSectors: (projectId: string) => void;
}

export const useProgramaStore = create<ProgramaState>()(
  persist(
    (set, get) => ({
      projectSectors: {},

      getSectorStatus: (projectId: string, sectorName: string): SectorStatus => {
        const projectData = get().projectSectors[projectId];
        if (!projectData || !projectData[sectorName]) {
          return 'pausado'; // Default status
        }
        return projectData[sectorName].status;
      },

      getSectorData: (projectId: string, sectorName: string): SectorData | null => {
        const projectData = get().projectSectors[projectId];
        if (!projectData || !projectData[sectorName]) {
          return null;
        }
        return projectData[sectorName];
      },

      setSectorStatus: (projectId: string, sectorName: string, status: SectorStatus) => {
        set((state) => {
          const existingData = state.projectSectors[projectId]?.[sectorName] || {};
          return {
            projectSectors: {
              ...state.projectSectors,
              [projectId]: {
                ...(state.projectSectors[projectId] || {}),
                [sectorName]: {
                  ...existingData,
                  status,
                  updatedAt: new Date().toISOString(),
                  // Auto-set fechaEntregaReal when marking as entregado
                  ...(status === 'entregado' && !existingData.fechaEntregaReal
                    ? { fechaEntregaReal: new Date().toISOString().split('T')[0] }
                    : {}),
                },
              },
            },
          };
        });
      },

      updateSectorData: (projectId: string, sectorName: string, data: Partial<SectorData>) => {
        set((state) => {
          const existingData = state.projectSectors[projectId]?.[sectorName] || {
            status: 'pausado' as SectorStatus,
            updatedAt: new Date().toISOString(),
          };
          return {
            projectSectors: {
              ...state.projectSectors,
              [projectId]: {
                ...(state.projectSectors[projectId] || {}),
                [sectorName]: {
                  ...existingData,
                  ...data,
                  updatedAt: new Date().toISOString(),
                },
              },
            },
          };
        });
      },

      initializeProjectSectors: (projectId: string) => {
        const currentData = get().projectSectors[projectId];
        if (currentData) return; // Already initialized

        const initialSectors: Record<string, SectorData> = {};
        SECTORS.forEach((sector) => {
          initialSectors[sector] = {
            status: 'pausado',
            updatedAt: new Date().toISOString(),
          };
        });

        set((state) => ({
          projectSectors: {
            ...state.projectSectors,
            [projectId]: initialSectors,
          },
        }));
      },
    }),
    {
      name: 'esant-programa',
    }
  )
);
