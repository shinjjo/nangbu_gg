import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Fetching chefs like Edward Lee...');
    const { data: chefs, error } = await supabase
        .from('chefs')
        .select('*')
        .ilike('name', '%에드워드%');

    if (error) {
        console.error('Error fetching chefs:', error);
        return;
    }

    console.log('Chefs found:', chefs);
}

main();
