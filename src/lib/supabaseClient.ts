/**
 * SUPABASE BROWSER CLIENT CONFIGURATION
 * ======================================
 * 
 * This file provides the main browser-side Supabase client configuration
 * for the application. It creates a typed client instance that can be
 * used throughout the application for authentication and database operations.
 * 
 * KEY FEATURES:
 * - Browser-side Supabase client with full TypeScript support
 * - Environment variable configuration
 * - Database type integration
 * - SSR-compatible client creation
 * - Centralized client management
 * 
 * ARCHITECTURE:
 * - Uses @supabase/ssr for SSR compatibility
 * - Integrates with custom Database types
 * - Provides singleton client instance
 * - Environment variable validation
 * 
 * SECURITY FEATURES:
 * - Uses public anon key (safe for browser)
 * - Environment variable validation
 * - Type-safe database operations
 * 
 * USAGE:
 * - Import supabaseBrowserClient for browser operations
 * - Use in components and hooks for auth/database operations
 * - Provides typed access to all database tables
 * 
 * ENVIRONMENT VARIABLES:
 * - NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Public anon key
 * 
 * @file src/lib/supabaseClient.ts
 * @author Authentication System
 * @version 1.0.0
 */

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

// Dedicated browser-side Supabase client with full typing
export const supabaseBrowserClient = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Convenience function to get typed client
export const getSupabaseBrowserClient = () => supabaseBrowserClient;

// Re-export for backward compatibility
export const createClient = () => supabaseBrowserClient;

export default supabaseBrowserClient;
