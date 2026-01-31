import { queryClient } from './queryClient';
import {
  getQueue,
  getNextMutation,
  markAsSyncing,
  markAsFailed,
  removeFromQueue,
  getPendingCount,
  getFailedMutations,
  type QueuedMutation,
} from './offlineQueue';
import { useSyncStore } from '../store/useSyncStore';
import { asistenciaService } from './asistencia';
import { checkboxService } from './checkbox';
import { pendientesService } from './pendientes';

let isSyncing = false;
let syncInterval: ReturnType<typeof setInterval> | null = null;

// Delay between processing mutations (ms)
const SYNC_DELAY = 500;
// Interval to check for pending mutations when online (ms)
const SYNC_CHECK_INTERVAL = 30000;
// Delay before retrying failed mutations (ms)
const RETRY_DELAY = 5000;

/**
 * Execute a single mutation against the backend
 */
async function executeMutation(mutation: QueuedMutation): Promise<void> {
  const { entity, type, payload } = mutation;

  switch (entity) {
    case 'asistencia': {
      const p = payload as {
        proyectoId: string;
        trabajadorId: string;
        fecha: string;
        userId: string;
      };
      await asistenciaService.toggleAsistencia(
        p.proyectoId,
        p.trabajadorId,
        new Date(p.fecha),
        p.userId
      );
      break;
    }

    case 'checkbox': {
      if (type === 'toggle') {
        const p = payload as { itemId: string; fecha: string; userId: string };
        await checkboxService.toggleCheck(p.itemId, new Date(p.fecha), p.userId);
      }
      break;
    }

    case 'pendiente': {
      const p = payload as any;
      switch (type) {
        case 'create':
          await pendientesService.create(p.pendiente, p.userId);
          break;
        case 'update':
          await pendientesService.update(p.id, p.updates);
          break;
        case 'delete':
          await pendientesService.delete(p.id);
          break;
      }
      break;
    }

    default:
      throw new Error(`Unknown entity type: ${entity}`);
  }
}

/**
 * Process a single mutation from the queue
 */
async function processMutation(mutation: QueuedMutation): Promise<boolean> {
  const store = useSyncStore.getState();

  try {
    // Mark as syncing
    await markAsSyncing(mutation.id);
    store.setCurrentlySyncing(mutation);

    // Execute the mutation
    await executeMutation(mutation);

    // Success - remove from queue
    await removeFromQueue(mutation.id);

    // Invalidate relevant query keys
    if (mutation.queryKeysToInvalidate) {
      for (const queryKey of mutation.queryKeysToInvalidate) {
        queryClient.invalidateQueries({ queryKey });
      }
    }

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await markAsFailed(mutation.id, errorMessage);
    store.setLastError(errorMessage);
    return false;
  } finally {
    store.setCurrentlySyncing(null);
  }
}

/**
 * Process all pending mutations in the queue
 */
async function processQueue(): Promise<void> {
  const store = useSyncStore.getState();

  if (isSyncing || !store.isOnline) {
    return;
  }

  isSyncing = true;
  store.setSyncState('syncing');

  try {
    let mutation = await getNextMutation();
    let processedCount = 0;
    let failedCount = 0;

    while (mutation && store.isOnline) {
      const success = await processMutation(mutation);

      if (success) {
        processedCount++;
      } else {
        failedCount++;
        // Wait before retrying to avoid hammering the server
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }

      // Update pending count
      const pendingStats = await getPendingCount();
      store.setPendingCount(pendingStats);

      // Small delay between mutations
      await new Promise((resolve) => setTimeout(resolve, SYNC_DELAY));

      // Get next mutation
      mutation = await getNextMutation();
    }

    // Update failed mutations list
    const failed = await getFailedMutations();
    store.setFailedMutations(failed);

    // Set final state
    if (failedCount > 0 && processedCount === 0) {
      store.setSyncState('error');
    } else {
      store.setSyncState('idle');
      if (processedCount > 0) {
        store.setLastSyncAt(Date.now());
      }
    }
  } catch (error) {
    store.setSyncState('error');
    store.setLastError(error instanceof Error ? error.message : 'Sync error');
  } finally {
    isSyncing = false;
  }
}

/**
 * Update the sync store with current queue stats
 */
async function updateQueueStats(): Promise<void> {
  const store = useSyncStore.getState();
  const pendingStats = await getPendingCount();
  const failed = await getFailedMutations();

  store.setPendingCount(pendingStats);
  store.setFailedMutations(failed);
}

/**
 * Handle online/offline events
 */
function handleOnline(): void {
  const store = useSyncStore.getState();
  store.setIsOnline(true);

  // Start syncing when back online
  processQueue();
}

function handleOffline(): void {
  const store = useSyncStore.getState();
  store.setIsOnline(false);
  store.setSyncState('offline');
}

/**
 * Initialize the sync manager
 * Sets up event listeners and starts periodic sync checks
 */
export function initSyncManager(): () => void {
  // Set initial online status
  const store = useSyncStore.getState();
  store.setIsOnline(navigator.onLine);

  // Listen to online/offline events
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Load initial queue stats
  updateQueueStats();

  // Start periodic sync check
  syncInterval = setInterval(() => {
    if (navigator.onLine) {
      processQueue();
    }
  }, SYNC_CHECK_INTERVAL);

  // Process any pending mutations on startup
  if (navigator.onLine) {
    processQueue();
  }

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);

    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
  };
}

/**
 * Manually trigger a sync
 */
export function triggerSync(): void {
  if (navigator.onLine) {
    processQueue();
  }
}

/**
 * Check if currently syncing
 */
export function isSyncInProgress(): boolean {
  return isSyncing;
}

/**
 * Get current queue for debugging
 */
export async function getQueueForDebug(): Promise<QueuedMutation[]> {
  return getQueue();
}
