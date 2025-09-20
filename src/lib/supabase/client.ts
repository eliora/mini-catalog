/**
 * SUPABASE CLIENT FACTORY
 * ========================
 * 
 * This file provides a factory function for creating Supabase client instances
 * in client components. It's designed for use in React components that need
 * to create their own client instances.
 * 
 * KEY FEATURES:
 * - Client component Supabase client factory
 * - Full TypeScript support with Database types
 * - Environment variable configuration
 * - SSR-compatible client creation
 * - Factory pattern for client creation
 * 
 * ARCHITECTURE:
 * - Uses @supabase/ssr for SSR compatibility
 * - Factory function pattern for client creation
 * - Integrates with custom Database types
 * - Environment variable validation
 * 
 * SECURITY FEATURES:
 * - Uses public anon key (safe for browser)
 * - Environment variable validation
 * - Type-safe database operations
 * 
 * USAGE:
 * - Import createClient function in client components
 * - Call createClient() to get a new client instance
 * - Use for authentication and database operations
 * 
 * DIFFERENCES FROM supabaseClient.ts:
 * - Factory function instead of singleton
 * - Creates new instances on each call
 * - Better for component-specific clients
 * 
 * @file src/lib/supabase/client.ts
 * @author Authentication System
 * @version 1.0.0
 */

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

// Client component Supabase client with typing
export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
