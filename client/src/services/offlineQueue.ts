import { get, set, del } from 'idb-keyval';

// Types for queued mutations
export type MutationEntityType = 'pendiente' | 'asistencia' | 'checkbox' | 'material' | 'factura';
export type MutationType = 'create' | 'update' | 'delete' | 'toggle';
export type MutationPriority = 'critical' | 'normal';
export type MutationStatus = 'pending' | 'syncing' | 'failed';

export interface QueuedMutation {
  id: string;
  type: MutationType;
  entity: MutationEntityType;
  payload: unknown;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: MutationPriority;
  status: MutationStatus;
  error?: string;
  queryKeysToInvalidate?: string[][];
}

const QUEUE_KEY = 'esant-maria-offline-queue';
const MAX_RETRIES = 3;

// Generate unique ID for mutations
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Get all queued mutations from IndexedDB
export async function getQueue(): Promise<QueuedMutation[]> {
  const queue = await get<QueuedMutation[]>(QUEUE_KEY);
  return queue || [];
}

// Save queue to IndexedDB
async function saveQueue(queue: QueuedMutation[]): Promise<void> {
  await set(QUEUE_KEY, queue);
}

// Add a mutation to the queue
export async function addToQueue(
  mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount' | 'status' | 'maxRetries'>
): Promise<QueuedMutation> {
  const queue = await getQueue();

  const queuedMutation: QueuedMutation = {
    ...mutation,
    id: generateId(),
    timestamp: Date.now(),
    retryCount: 0,
    maxRetries: MAX_RETRIES,
    status: 'pending',
  };

  // Add to queue, sorted by priority (critical first) then timestamp
  queue.push(queuedMutation);
  queue.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority === 'critical' ? -1 : 1;
    }
    return a.timestamp - b.timestamp;
  });

  await saveQueue(queue);
  return queuedMutation;
}

// Update a mutation in the queue
export async function updateMutation(
  id: string,
  updates: Partial<QueuedMutation>
): Promise<QueuedMutation | null> {
  const queue = await getQueue();
  const index = queue.findIndex(m => m.id === id);

  if (index === -1) return null;

  queue[index] = { ...queue[index], ...updates };
  await saveQueue(queue);
  return queue[index];
}

// Remove a mutation from the queue
export async function removeFromQueue(id: string): Promise<boolean> {
  const queue = await getQueue();
  const newQueue = queue.filter(m => m.id !== id);

  if (newQueue.length === queue.length) return false;

  await saveQueue(newQueue);
  return true;
}

// Get pending mutations (not syncing or failed with retries left)
export async function getPendingMutations(): Promise<QueuedMutation[]> {
  const queue = await getQueue();
  return queue.filter(
    m => m.status === 'pending' || (m.status === 'failed' && m.retryCount < m.maxRetries)
  );
}

// Get count of pending mutations by entity type
export async function getPendingCount(): Promise<{ total: number; byEntity: Record<MutationEntityType, number> }> {
  const pending = await getPendingMutations();

  const byEntity: Record<MutationEntityType, number> = {
    pendiente: 0,
    asistencia: 0,
    checkbox: 0,
    material: 0,
    factura: 0,
  };

  pending.forEach(m => {
    byEntity[m.entity]++;
  });

  return {
    total: pending.length,
    byEntity,
  };
}

// Get failed mutations that exceeded max retries
export async function getFailedMutations(): Promise<QueuedMutation[]> {
  const queue = await getQueue();
  return queue.filter(m => m.status === 'failed' && m.retryCount >= m.maxRetries);
}

// Clear failed mutations (manual cleanup)
export async function clearFailedMutations(): Promise<number> {
  const queue = await getQueue();
  const failed = queue.filter(m => m.status === 'failed' && m.retryCount >= m.maxRetries);
  const newQueue = queue.filter(m => !(m.status === 'failed' && m.retryCount >= m.maxRetries));

  await saveQueue(newQueue);
  return failed.length;
}

// Clear entire queue (use with caution)
export async function clearQueue(): Promise<void> {
  await del(QUEUE_KEY);
}

// Mark mutation as syncing
export async function markAsSyncing(id: string): Promise<void> {
  await updateMutation(id, { status: 'syncing' });
}

// Mark mutation as failed and increment retry count
export async function markAsFailed(id: string, error: string): Promise<QueuedMutation | null> {
  const queue = await getQueue();
  const mutation = queue.find(m => m.id === id);

  if (!mutation) return null;

  return await updateMutation(id, {
    status: 'failed',
    retryCount: mutation.retryCount + 1,
    error,
  });
}

// Reset failed mutation to pending (for retry)
export async function resetToPending(id: string): Promise<void> {
  await updateMutation(id, { status: 'pending', error: undefined });
}

// Get the next mutation to process
export async function getNextMutation(): Promise<QueuedMutation | null> {
  const pending = await getPendingMutations();
  return pending.length > 0 ? pending[0] : null;
}

// Check if queue has any pending items
export async function hasPendingMutations(): Promise<boolean> {
  const pending = await getPendingMutations();
  return pending.length > 0;
}
