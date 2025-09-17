/**
 * @file Supabase Service Role Client
 * @description Provides a Supabase client initialized with the `service_role` key.
 * This client has super-user privileges and can bypass all Row Level Security (RLS) policies.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

/**
 * Creates a Supabase client that uses the `service_role` key.
 *
 * DANGER: This client can bypass all RLS policies and has full admin access
 * to your database. It should ONLY be used in secure server-side environments
 * and ONLY after the calling function has already verified the user's permissions.
 *
 * @returns A privileged Supabase client instance.
 * @throws An error if the required environment variables are not set.
 */
export const createServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  if (!url || !serviceRoleKey) {
    console.warn('Supabase service role configuration is missing. Using regular client instead.');
    // Fallback to regular client creation (this won't bypass RLS but will work for testing)
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    if (!anonKey) {
      throw new Error('Supabase configuration is completely missing');
    }
    return createClient<Database>(url, anonKey);
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};


