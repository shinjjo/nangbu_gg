import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      chef:chefs!chef_id(*),
      match:matches!match_id(id, topic, guest:guests!guest_id(name))
    `)
    .eq('id', '01da8007-0b83-4374-98a0-99d02d6ebaa6')
    .single();
    
  console.log('Error:', error);
  console.log('Data:', JSON.stringify(data, null, 2));
}

main();
