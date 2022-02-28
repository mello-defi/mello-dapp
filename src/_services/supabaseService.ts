import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const supabaseUrl: string = process.env.REACT_APP_SUPABASE_URL;
// @ts-ignore
const supabaseAnonKey: string = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
