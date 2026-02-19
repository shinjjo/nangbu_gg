import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
	console.warn(
		'Missing Supabase URL or Anon Key. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env',
	);
}

// TODO: Generate Database definitions with Supabase CLI
export const supabase = createClient<Database>(
	supabaseUrl || '',
	supabaseKey || '',
);
