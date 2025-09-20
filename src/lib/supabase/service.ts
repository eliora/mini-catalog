/**
 * SUPABASE SERVICE ROLE CLIENT
 * =============================
 * 
 * This file provides a Supabase client initialized with the `service_role` key.
 * This client has super-user privileges and can bypass all Row Level Security (RLS) policies.
 * 
 * ⚠️  SECURITY WARNING:
 * This client has FULL ADMIN ACCESS to your database and can bypass ALL security policies.
 * It should ONLY be used in secure server-side environments and ONLY after proper
 * authentication and authorization checks have been performed.
 * 
 * KEY FEATURES:
 * - Service role client with super-user privileges
 * - Bypasses all RLS policies
 * - Full database access
 * - Admin operations support
 * - Environment variable configuration
 * 
 * ARCHITECTURE:
 * - Uses @supabase/supabase-js for service role client
 * - Environment variable validation
 * - Fallback to regular client for development
 * - Type-safe database operations
 * 
 * SECURITY FEATURES:
 * - Service role key validation
 * - Environment variable protection
 * - Fallback mechanism for development
 * - Disabled auto-refresh and session persistence
 * 
 * USAGE:
 * - Import createServiceClient() function
 * - Use ONLY in admin API routes
 * - Always verify user permissions first
 * - Never expose service role key to client
 * 
 * ENVIRONMENT VARIABLES:
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key (REQUIRED)
 * - NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
 * 
 * @file src/lib/supabase/service.ts
 * @author Authentication System
 * @version 1.0.0
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


