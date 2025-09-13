import { createClient } from '@supabase/supabase-js';

// Environment variables for React - NO FALLBACKS
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Create Supabase client - ONLY with environment variables
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For admin operations on the server side
export const createAdminClient = (serviceRoleKey) => {
  if (!serviceRoleKey) {
    throw new Error('Service role key is required for admin operations');
  }
  return createClient(supabaseUrl, serviceRoleKey);
};
