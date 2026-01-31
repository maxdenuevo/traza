import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { get, set, del } from 'idb-keyval';

// Create a custom IDB persister
function createIDBPersister() {
  return {
    persistClient: async (client: any) => {
      await set('esant-maria-query-cache', client);
    },
    restoreClient: async () => {
      return await get<any>('esant-maria-query-cache');
    },
    removeClient: async () => {
      await del('esant-maria-query-cache');
    },
  };
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours - keep cache longer for offline
      retry: 1,
      refetchOnWindowFocus: false,
      networkMode: 'offlineFirst', // Support offline mode
    },
    mutations: {
      retry: 2, // Retry failed mutations
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: 'offlineFirst',
    },
  },
});

// Set up persistence with IndexedDB
if (typeof window !== 'undefined') {
  const persister = createIDBPersister();

  persistQueryClient({
    queryClient,
    persister,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    buster: '', // Change this to force cache invalidation
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        // Only persist successful queries
        return query.state.status === 'success';
      },
    },
  });
}
