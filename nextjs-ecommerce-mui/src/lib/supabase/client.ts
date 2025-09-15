import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

// Client component Supabase client with typing
export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
