import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateChefTypes() {
    console.log("Fetching all chefs...");

    const { data: chefs, error: fetchErr } = await supabase.from('chefs').select('id, name');

    if (fetchErr) {
        console.error("Error fetching chefs:", fetchErr);
        process.exit(1);
    }

    const teamIds = [];
    const individualIds = [];

    chefs.forEach(chef => {
        if (chef.name.includes('&')) {
            teamIds.push(chef.id);
        } else {
            individualIds.push(chef.id);
        }
    });

    if (teamIds.length > 0) {
        console.log("Updating teams: ", teamIds.length);
        const { error: updateTeamErr } = await supabase
            .from('chefs')
            .update({ type: 'team' })
            .in('id', teamIds);

        if (updateTeamErr) {
            console.error("Error updating team types:", updateTeamErr);
        } else {
            console.log("Successfully updated teams!");
        }
    }

    if (individualIds.length > 0) {
        console.log("Updating individuals: ", individualIds.length);
        const { error: updateIndErr } = await supabase
            .from('chefs')
            .update({ type: 'individual' })
            .in('id', individualIds);

        if (updateIndErr) {
            console.error("Error updating individual types:", updateIndErr);
        } else {
            console.log("Successfully updated individuals!");
        }
    }

    console.log("Done");
}

updateChefTypes();
