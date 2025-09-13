import { createClient } from '@supabase/supabase-js';

// Environment variables for React - NO FALLBACKS
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Environment variables confirmed working

// Validate environment variables before creating client
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables:');
  console.error('URL:', supabaseUrl ? '✅ SET' : '❌ MISSING');
  console.error('Key:', supabaseAnonKey ? '✅ SET' : '❌ MISSING');
  throw new Error('Missing required Supabase environment variables');
}

// Create Supabase client with optimized session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sb-auth-token',
    flowType: 'pkce'
  }
});

// Connection working properly

// For admin operations on the server side
export const createAdminClient = (serviceRoleKey) => {
  if (!serviceRoleKey) {
    throw new Error('Service role key is required for admin operations');
  }
  return createClient(supabaseUrl, serviceRoleKey);
};
