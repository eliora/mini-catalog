import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ SUPABASE CONFIGURATION MISSING');
  console.error('Please create a .env.local file in your project root with:');
  console.error('REACT_APP_SUPABASE_URL=https://your-project.supabase.co');
  console.error('REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here');
  console.error('See SUPABASE_SETUP_GUIDE.md for detailed instructions.');
  console.error('Current NODE_ENV:', process.env.NODE_ENV);
}

// Create Supabase client with fallback for missing env vars
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

// For admin operations on the server side
export const createAdminClient = (serviceRoleKey) => {
  if (!serviceRoleKey) {
    throw new Error('Service role key is required for admin operations');
  }
  return createClient(supabaseUrl, serviceRoleKey);
};
