import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Key is missing");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Starting DB Cleanup...");

    // 1. Remove "unknown"
    console.log("Looking for 'Unknown' chef...");
    const { data: unknownChefs, error: unknownErr } = await supabase.from('chefs').select('*').eq('name', 'Unknown');

    if (unknownErr) {
        console.error("Error fetching 'Unknown':", unknownErr);
    } else if (unknownChefs && unknownChefs.length > 0) {
        for (const chef of unknownChefs) {
            console.log(`Found 'Unknown' chef with ID: ${chef.id}. Deleting...`);
            // Optionally could delete recipes/matches, but usually unknown has none or we should handle it.
            // Assuming RLS or foreign key cascade handles it, or we delete directly.
            const { error: delErr } = await supabase.from('chefs').delete().eq('id', chef.id);
            if (delErr) console.error("Error deleting 'Unknown':", delErr);
            else console.log("'Unknown' chef deleted successfully.");
        }
    } else {
        console.log("No 'Unknown' chef found.");
    }


    // 2. Merge "에이미 팍" into "박은영"
    console.log("Looking for '에이미 팍' and '박은영'...");
    const { data: sourceChefs, error: err1 } = await supabase.from('chefs').select('id, name').eq('name', '에이미 팍');
    const { data: targetChefs, error: err2 } = await supabase.from('chefs').select('id, name').eq('name', '박은영');

    if (err1 || err2) {
        console.error("Error fetching chefs:", err1 || err2);
        return;
    }

    if (!sourceChefs || sourceChefs.length === 0) {
        console.log("Chef '에이미 팍' not found. Already merged or doesn't exist.");
        return;
    }

    if (!targetChefs || targetChefs.length === 0) {
        console.log("Chef '박은영' not found. Cannot merge.");
        return;
    }

    const sourceId = sourceChefs[0].id;
    const targetId = targetChefs[0].id;

    console.log(`Merging 에이미 팍 (ID: ${sourceId}) into 박은영 (ID: ${targetId})...`);

    // Update matches where chef_1_id is 에이미 팍
    const { error: m1Err } = await supabase.from('matches').update({ chef_1_id: targetId }).eq('chef_1_id', sourceId);
    if (m1Err) console.error("Error updating matches chef_1_id:", m1Err);

    // Update matches where chef_2_id is 에이미 팍
    const { error: m2Err } = await supabase.from('matches').update({ chef_2_id: targetId }).eq('chef_2_id', sourceId);
    if (m2Err) console.error("Error updating matches chef_2_id:", m2Err);

    // Update matches where winner_id is 에이미 팍
    const { error: wErr } = await supabase.from('matches').update({ winner_id: targetId }).eq('winner_id', sourceId);
    if (wErr) console.error("Error updating matches winner_id:", wErr);

    // Update recipes where chef_id is 에이미 팍
    const { error: rErr } = await supabase.from('recipes').update({ chef_id: targetId }).eq('chef_id', sourceId);
    if (rErr) console.error("Error updating recipes chef_id:", rErr);

    // Finally, delete '에이미 팍'
    console.log("Deleting '에이미 팍'...");
    const { error: delSourceErr } = await supabase.from('chefs').delete().eq('id', sourceId);
    if (delSourceErr) {
        console.error("Error deleting '에이미 팍':", delSourceErr);
    } else {
        console.log("'에이미 팍' deleted successfully. Merge complete.");
    }
}

run();
