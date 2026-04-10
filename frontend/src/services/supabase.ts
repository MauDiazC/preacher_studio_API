import { createClient } from '@supabase/supabase-js';

// Estas variables deben estar en tu .env de frontend o se inyectarán en Railway
// Si no existen, el build fallará, lo cual es preferible a que falle en runtime
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
