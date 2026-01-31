import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { addToQueue, type MutationEntityType, type MutationType, type MutationPriority } from '../services/offlineQueue';
import { useSyncStore } from '../store/useSyncStore';
import { triggerSync } from '../services/syncManager';
import { getPendingCount } from '../services/offlineQueue';

interface OfflineMutationOptions<TData, TError, TVariables, TContext> {
  // Entity type for the offline queue
  entity: MutationEntityType;
  // Mutation type (create, update, delete, toggle)
  mutationType: MutationType;
  // Priority level (critical operations sync first)
  priority?: MutationPriority;
  // Query keys to invalidate after sync
  queryKeysToInvalidate?: string[][];
  // The actual mutation function (called when online)
  mutationFn: (variables: TVariables) => Promise<TData>;
  // Transform variables to payload for offline storage
  toPayload?: (variables: TVariables) => unknown;
  // Optimistic update function
  onOptimisticUpdate?: (variables: TVariables, queryClient: ReturnType<typeof useQueryClient>) => TContext;
  // Rollback function for failed mutations
  onRollback?: (context: TContext, queryClient: ReturnType<typeof useQueryClient>) => void;
  // Additional React Query mutation options
  mutationOptions?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn' | 'onMutate' | 'onError' | 'onSettled'>;
}

/**
 * Hook that wraps useMutation with offline support
 * - When online: executes mutation directly, queues if it fails
 * - When offline: queues mutation and applies optimistic update
 */
export function useOfflineMutation<TData = unknown, TError = Error, TVariables = void, TContext = unknown>({
  entity,
  mutationType,
  priority = 'normal',
  queryKeysToInvalidate,
  mutationFn,
  toPayload,
  onOptimisticUpdate,
  onRollback,
  mutationOptions = {},
}: OfflineMutationOptions<TData, TError, TVariables, TContext>) {
  const queryClient = useQueryClient();
  const { isOnline, setPendingCount, triggerSync: triggerSyncState } = useSyncStore();

  return useMutation<TData, TError, TVariables, TContext>({
    ...mutationOptions,

    mutationFn: async (variables) => {
      const payload = toPayload ? toPayload(variables) : variables;

      if (!isOnline) {
        // Queue mutation for later sync
        await addToQueue({
          type: mutationType,
          entity,
          payload,
          priority,
          queryKeysToInvalidate,
        });

        // Update pending count in store
        const stats = await getPendingCount();
        setPendingCount(stats);

        // Return a fake response for optimistic update
        // The actual data will be fetched after sync
        return undefined as TData;
      }

      // Online: try to execute directly
      try {
        return await mutationFn(variables);
      } catch (error) {
        // If network error, queue for later
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          await addToQueue({
            type: mutationType,
            entity,
            payload,
            priority,
            queryKeysToInvalidate,
          });

          const stats = await getPendingCount();
          setPendingCount(stats);

          return undefined as TData;
        }

        throw error;
      }
    },

    onMutate: async (variables) => {
      // Apply optimistic update
      if (onOptimisticUpdate) {
        return onOptimisticUpdate(variables, queryClient);
      }
      return undefined as TContext;
    },

    onError: (_error, _variables, context) => {
      // Rollback optimistic update on error
      if (context && onRollback) {
        onRollback(context, queryClient);
      }
    },

    onSettled: () => {
      // Invalidate queries after mutation settles
      if (queryKeysToInvalidate && isOnline) {
        for (const queryKey of queryKeysToInvalidate) {
          queryClient.invalidateQueries({ queryKey });
        }
      }

      // Trigger sync state update
      triggerSyncState();

      // If online, trigger sync to process any queued mutations
      if (isOnline) {
        triggerSync();
      }
    },
  });
}

/**
 * Helper to create optimistic toggle for boolean fields
 */
export function createOptimisticToggle<T extends { id: string }>(
  queryKey: string[],
  getId: (item: T) => string,
  getNewValue: (item: T) => T
) {
  return (variables: { id: string } & Record<string, unknown>, queryClient: ReturnType<typeof useQueryClient>) => {
    // Cancel outgoing refetches
    queryClient.cancelQueries({ queryKey });

    // Get current data
    const previousData = queryClient.getQueryData<T[]>(queryKey);

    // Optimistically update
    if (previousData) {
      queryClient.setQueryData<T[]>(queryKey, (old) =>
        old?.map((item) =>
          getId(item) === variables.id ? getNewValue(item) : item
        )
      );
    }

    return { previousData };
  };
}

/**
 * Helper to rollback optimistic update
 */
export function createRollback<T>(queryKey: string[]) {
  return (context: { previousData?: T[] }, queryClient: ReturnType<typeof useQueryClient>) => {
    if (context?.previousData) {
      queryClient.setQueryData(queryKey, context.previousData);
    }
  };
}
