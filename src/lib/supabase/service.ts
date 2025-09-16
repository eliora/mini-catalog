import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Service-role Supabase client for privileged admin operations (bypasses RLS)
// Use ONLY after the caller has passed strict application-level permission checks.
export const createServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase service role configuration is missing');
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};


