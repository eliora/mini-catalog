import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables. Please configure .env.local file.');
  console.warn('Required variables: REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For admin operations on the server side
export const createAdminClient = (serviceRoleKey) => {
  if (!serviceRoleKey) {
    throw new Error('Service role key is required for admin operations');
  }
  return createClient(supabaseUrl, serviceRoleKey);
};
