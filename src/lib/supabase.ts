import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL: Missing Supabase environment variables! Authentication and database features will fail. Please check your .env.local file or Vercel Environment Variables.');
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://missing-url.supabase.co',
  supabaseAnonKey || 'missing-key'
);
