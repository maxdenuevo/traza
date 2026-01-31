import { useEffect } from 'react';
import { useSyncStore } from '../store/useSyncStore';
import { triggerSync } from '../services/syncManager';
import { getPendingCount, getFailedMutations, clearFailedMutations } from '../services/offlineQueue';

/**
 * Hook for accessing sync status and controls
 */
export function useSyncStatus() {
  const {
    isOnline,
    syncState,
    pendingCount,
    failedMutations,
    lastSyncAt,
    currentlySyncing,
    lastError,
    syncTrigger,
    setPendingCount,
    setFailedMutations,
  } = useSyncStore();

  // Refresh stats when sync trigger changes
  useEffect(() => {
    const refreshStats = async () => {
      const stats = await getPendingCount();
      const failed = await getFailedMutations();
      setPendingCount(stats);
      setFailedMutations(failed);
    };

    refreshStats();
  }, [syncTrigger, setPendingCount, setFailedMutations]);

  // Manual sync trigger
  const manualSync = () => {
    triggerSync();
  };

  // Clear failed mutations
  const clearFailed = async () => {
    const cleared = await clearFailedMutations();
    const stats = await getPendingCount();
    const failed = await getFailedMutations();
    setPendingCount(stats);
    setFailedMutations(failed);
    return cleared;
  };

  // Format last sync time
  const getLastSyncText = () => {
    if (!lastSyncAt) return null;

    const now = Date.now();
    const diff = now - lastSyncAt;

    if (diff < 60000) {
      return 'Hace un momento';
    } else if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      return new Date(lastSyncAt).toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  return {
    // State
    isOnline,
    syncState,
    pendingCount,
    hasPendingMutations: pendingCount.total > 0,
    failedMutations,
    hasFailedMutations: failedMutations.length > 0,
    lastSyncAt,
    lastSyncText: getLastSyncText(),
    currentlySyncing,
    lastError,
    isSyncing: syncState === 'syncing',

    // Actions
    manualSync,
    clearFailed,
  };
}
