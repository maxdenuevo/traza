import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we're in mock mode (no Supabase credentials)
export const isMockMode = !supabaseUrl || !supabaseAnonKey;

// Create a mock client that won't throw errors
const createMockClient = (): SupabaseClient => {
  console.warn('🔶 Running in MOCK MODE - No Supabase connection');

  // Return a proxy that handles all Supabase calls gracefully
  const mockHandler: ProxyHandler<object> = {
    get: (_target, prop) => {
      // Return chainable mock functions
      if (prop === 'from' || prop === 'rpc') {
        return () => new Proxy({}, mockHandler);
      }
      if (prop === 'auth') {
        return {
          getSession: async () => ({ data: { session: null }, error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
          signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Mock mode - use demo login' } }),
          signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Mock mode - use demo login' } }),
          signOut: async () => ({ error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        };
      }
      if (prop === 'channel') {
        return () => ({
          on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
          subscribe: () => ({ unsubscribe: () => {} }),
        });
      }
      if (prop === 'storage') {
        return {
          from: () => ({
            upload: async () => ({ data: null, error: null }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
            remove: async () => ({ data: null, error: null }),
          }),
        };
      }
      // For query methods, return empty results
      if (['select', 'insert', 'update', 'delete', 'upsert'].includes(prop as string)) {
        return () => new Proxy({}, mockHandler);
      }
      if (['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'is', 'in', 'order', 'limit', 'range', 'single', 'maybeSingle'].includes(prop as string)) {
        return () => new Proxy({}, mockHandler);
      }
      if (prop === 'then') {
        // Make it thenable with empty data
        return (resolve: (value: { data: null; error: null }) => void) => resolve({ data: null, error: null });
      }
      return () => new Proxy({}, mockHandler);
    },
  };

  return new Proxy({}, mockHandler) as unknown as SupabaseClient;
};

export const supabase: SupabaseClient = isMockMode
  ? createMockClient()
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
