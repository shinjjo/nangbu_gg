import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const HAVE_AVATARS = [
    '정지선', '최강록', '이미영', '윤남노', '임태훈', '권성준', '정호영', '이연복', '에드워드 리', '에드워드리', '샘킴', '손종원', '김풍', '최현석', '이원일', '박은영'
];

async function main() {
    const { data: chefs, error } = await supabase
        .from('chefs')
        .select('name');

    if (error) {
        console.error('Error fetching chefs:', error);
        return;
    }

    const missing = chefs.filter(c => !HAVE_AVATARS.includes(c.name));
    console.log('Chefs missing avatars:', missing.map(c => c.name).join(', '));
}

main();
