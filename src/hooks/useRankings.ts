import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { Chef } from '../types';

export type SeasonFilter = '1' | '2' | 'all';

export interface RecentMatch {
    matchId: string;
    date: string;
    result: 'win' | 'loss';
    recipeName: string | null;
    recipeId: string | null;
    opponentName: string;
    opponentId: string;
    topic: string | null;
}

export interface RankedChef extends Chef {
    seasonWins: number;
    seasonLosses: number;
    seasonMatches: number;
    seasonWinRate: number;
    recentMatches: RecentMatch[];
}

interface RawRecipe {
    id: string;
    name: string;
    chef_id: string;
}

interface RawMatch {
    id: string;
    topic: string | null;
    chef_1_id: string;
    chef_2_id: string;
    winner_id: string | null;
    episode_id: string;
    chef_1: { name: string } | null;
    chef_2: { name: string } | null;
    episode: { season: number; aired_at: string } | null;
    recipes: RawRecipe[] | null;
}

export const useRankings = (season: SeasonFilter) => {
    const chefsQuery = useQuery({
        queryKey: ['chefs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('chefs')
                .select('*');
            if (error) throw new Error(error.message);
            return data as unknown as Chef[];
        },
    });

    const matchesQuery = useQuery({
        queryKey: ['allMatchesDetailed'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('matches')
                .select(`
          id, topic, chef_1_id, chef_2_id, winner_id, episode_id,
          chef_1:chefs!chef_1_id(name),
          chef_2:chefs!chef_2_id(name),
          episode:episodes!episode_id(season, aired_at),
          recipes(id, name, chef_id)
        `);
            if (error) throw new Error(error.message);
            const matches = data as unknown as RawMatch[];
            matches.sort((a, b) => {
                const dateA = a.episode?.aired_at || '';
                const dateB = b.episode?.aired_at || '';
                return dateB.localeCompare(dateA);
            });
            return matches;
        },
    });

    const isLoading = chefsQuery.isLoading || matchesQuery.isLoading;
    const error = chefsQuery.error || matchesQuery.error;

    let rankings: RankedChef[] = [];

    if (chefsQuery.data && matchesQuery.data) {
        const chefs = chefsQuery.data;
        const allMatches = matchesQuery.data;

        const filteredMatches = allMatches.filter((m) => {
            if (season === 'all') return true;
            return m.episode?.season === Number(season);
        });

        const statsMap = new Map<string, {
            wins: number;
            losses: number;
            matches: number;
            recentMatches: RecentMatch[];
        }>();

        chefs.forEach((c) => statsMap.set(c.id, { wins: 0, losses: 0, matches: 0, recentMatches: [] }));

        filteredMatches.forEach((m) => {
            const s1 = statsMap.get(m.chef_1_id);
            const s2 = statsMap.get(m.chef_2_id);

            const chef1Recipe = m.recipes?.find(r => r.chef_id === m.chef_1_id) || null;
            const chef2Recipe = m.recipes?.find(r => r.chef_id === m.chef_2_id) || null;

            if (s1 && m.winner_id) {
                s1.matches++;
                const isWin = m.winner_id === m.chef_1_id;
                if (isWin) s1.wins++;
                else s1.losses++;
                s1.recentMatches.push({
                    matchId: m.id,
                    date: m.episode?.aired_at?.slice(0, 10) || '',
                    result: isWin ? 'win' : 'loss',
                    recipeName: chef1Recipe?.name || null,
                    recipeId: chef1Recipe?.id || null,
                    opponentName: m.chef_2?.name || '상대',
                    opponentId: m.chef_2_id,
                    topic: m.topic,
                });
            }
            if (s2 && m.winner_id) {
                s2.matches++;
                const isWin = m.winner_id === m.chef_2_id;
                if (isWin) s2.wins++;
                else s2.losses++;
                s2.recentMatches.push({
                    matchId: m.id,
                    date: m.episode?.aired_at?.slice(0, 10) || '',
                    result: isWin ? 'win' : 'loss',
                    recipeName: chef2Recipe?.name || null,
                    recipeId: chef2Recipe?.id || null,
                    opponentName: m.chef_1?.name || '상대',
                    opponentId: m.chef_1_id,
                    topic: m.topic,
                });
            }
        });

        rankings = chefs
            .map((chef) => {
                const s = statsMap.get(chef.id) || { wins: 0, losses: 0, matches: 0, recentMatches: [] };
                return {
                    ...chef,
                    seasonWins: s.wins,
                    seasonLosses: s.losses,
                    seasonMatches: s.matches,
                    seasonWinRate: s.matches > 0 ? Math.round((s.wins / s.matches) * 100) : 0,
                    recentMatches: s.recentMatches.slice(0, 5),
                };
            })
            .filter((chef) => chef.seasonMatches > 0)
            .sort((a, b) => {
                if (b.seasonWins !== a.seasonWins) return b.seasonWins - a.seasonWins;
                return b.seasonWinRate - a.seasonWinRate;
            });
    }

    return { rankings, isLoading, error };
};
