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
