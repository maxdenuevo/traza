import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SectorStatus = 'listo' | 'pausado' | 'en_obra';

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

interface SectorData {
  status: SectorStatus;
  updatedAt: string;
}

interface CronogramaState {
  // Map of projectId -> sectorName -> status data
  projectSectors: Record<string, Record<string, SectorData>>;

  // Actions
  getSectorStatus: (projectId: string, sectorName: string) => SectorStatus;
  setSectorStatus: (projectId: string, sectorName: string, status: SectorStatus) => void;
  initializeProjectSectors: (projectId: string) => void;
}

export const useCronogramaStore = create<CronogramaState>()(
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

      setSectorStatus: (projectId: string, sectorName: string, status: SectorStatus) => {
        set((state) => ({
          projectSectors: {
            ...state.projectSectors,
            [projectId]: {
              ...(state.projectSectors[projectId] || {}),
              [sectorName]: {
                status,
                updatedAt: new Date().toISOString(),
              },
            },
          },
        }));
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
      name: 'esant-cronograma',
    }
  )
);
