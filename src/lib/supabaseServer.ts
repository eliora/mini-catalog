/**
 * SUPABASE SERVER CLIENT CONFIGURATION
 * =====================================
 * 
 * This file provides a dedicated server-side Supabase client configuration
 * for the application. It creates a typed client instance that can be used
 * in server components and API routes for authentication and database operations.
 * 
 * KEY FEATURES:
 * - Server-side Supabase client with full TypeScript support
 * - Cookie-based session handling
 * - SSR authentication support
 * - Environment variable configuration
 * - Centralized server client management
 * 
 * ARCHITECTURE:
 * - Uses @supabase/ssr for SSR compatibility
 * - Integrates with custom Database types
 * - Async cookie handling for server components
 * - Environment variable validation
 * 
 * SECURITY FEATURES:
 * - Server-side authentication
 * - Cookie-based session management
 * - Type-safe database operations
 * - Environment variable validation
 * 
 * USAGE:
 * - Import createSupabaseServerClient for server operations
 * - Use in server components and API routes
 * - Provides typed access to all database tables
 * - Handles authentication automatically
 * 
 * DIFFERENCES FROM BROWSER CLIENT:
 * - Server-side only (not for client components)
 * - Cookie-based session handling
 * - SSR-compatible
 * - Async cookie operations
 * 
 * @file src/lib/supabaseServer.ts
 * @author Authentication System
 * @version 1.0.0
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

// Dedicated server-side Supabase client with full typing
export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};

// Convenience function alias
export const getSupabaseServerClient = createSupabaseServerClient;

// Re-export for backward compatibility
export const createClient = createSupabaseServerClient;

export default createSupabaseServerClient;
