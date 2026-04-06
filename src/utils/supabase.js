import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'PLACEHOLDER_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'PLACEHOLDER_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
