import { create } from 'zustand';
import type { MutationEntityType, QueuedMutation } from '../services/offlineQueue';

export type SyncState = 'idle' | 'syncing' | 'error' | 'offline';

interface SyncStats {
  total: number;
  byEntity: Record<MutationEntityType, number>;
}

interface SyncStore {
  // Connection state
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;

  // Sync state
  syncState: SyncState;
  setSyncState: (state: SyncState) => void;

  // Queue stats
  pendingCount: SyncStats;
  setPendingCount: (stats: SyncStats) => void;

  // Failed mutations
  failedMutations: QueuedMutation[];
  setFailedMutations: (mutations: QueuedMutation[]) => void;

  // Last sync timestamp
  lastSyncAt: number | null;
  setLastSyncAt: (timestamp: number) => void;

  // Current syncing mutation
  currentlySyncing: QueuedMutation | null;
  setCurrentlySyncing: (mutation: QueuedMutation | null) => void;

  // Sync error message
  lastError: string | null;
  setLastError: (error: string | null) => void;

  // Trigger manual sync
  triggerSync: () => void;
  syncTrigger: number;

  // Reset store
  reset: () => void;
}

const initialState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  syncState: 'idle' as SyncState,
  pendingCount: {
    total: 0,
    byEntity: {
      pendiente: 0,
      asistencia: 0,
      checkbox: 0,
      material: 0,
      factura: 0,
    },
  },
  failedMutations: [],
  lastSyncAt: null,
  currentlySyncing: null,
  lastError: null,
  syncTrigger: 0,
};

export const useSyncStore = create<SyncStore>((set) => ({
  ...initialState,

  setIsOnline: (online) =>
    set({
      isOnline: online,
      syncState: online ? 'idle' : 'offline',
    }),

  setSyncState: (state) => set({ syncState: state }),

  setPendingCount: (stats) => set({ pendingCount: stats }),

  setFailedMutations: (mutations) => set({ failedMutations: mutations }),

  setLastSyncAt: (timestamp) => set({ lastSyncAt: timestamp }),

  setCurrentlySyncing: (mutation) => set({ currentlySyncing: mutation }),

  setLastError: (error) => set({ lastError: error }),

  triggerSync: () =>
    set((state) => ({
      syncTrigger: state.syncTrigger + 1,
    })),

  reset: () => set(initialState),
}));

// Selectors for convenience
export const selectIsOnline = (state: SyncStore) => state.isOnline;
export const selectSyncState = (state: SyncStore) => state.syncState;
export const selectPendingCount = (state: SyncStore) => state.pendingCount;
export const selectHasPendingMutations = (state: SyncStore) => state.pendingCount.total > 0;
export const selectFailedMutations = (state: SyncStore) => state.failedMutations;
export const selectLastSyncAt = (state: SyncStore) => state.lastSyncAt;
