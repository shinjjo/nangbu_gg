import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { Match } from '../types';

export interface HeadToHeadStats {
	leftWins: number;
	rightWins: number;
	draws: number;
	totalMatches: number;
	recentMatches: Match[];
}

export const useHeadToHeadStats = (leftChefId: string | undefined, rightChefId: string | undefined) => {
	return useQuery({
		queryKey: ['headToHead', leftChefId, rightChefId],
		queryFn: async (): Promise<HeadToHeadStats> => {
			if (!leftChefId || !rightChefId) {
				return { leftWins: 0, rightWins: 0, draws: 0, totalMatches: 0, recentMatches: [] };
			}

			const { data, error } = await supabase
				.from('matches')
				.select(`
					*,
					chef_1:chefs!chef_1_id(name, image_url),
					chef_2:chefs!chef_2_id(name, image_url),
					episode:episodes!episode_id(aired_at),
					recipes(name, chef_id)
				`)
				.or(`and(chef_1_id.eq.${leftChefId},chef_2_id.eq.${rightChefId}),and(chef_1_id.eq.${rightChefId},chef_2_id.eq.${leftChefId})`);

			if (error) {
				console.error('Error fetching matches:', error);
				throw error;
			}

			const matches = (data as unknown as Match[]).sort((a, b) => {
				const dateA = a.episode?.aired_at || '';
				const dateB = b.episode?.aired_at || '';
				return dateB.localeCompare(dateA);
			});

			let leftWins = 0;
			let rightWins = 0;
			let draws = 0;

			matches.forEach(match => {
				if (match.winner_id === leftChefId) {
					leftWins++;
				} else if (match.winner_id === rightChefId) {
					rightWins++;
				} else {
					draws++;
				}
			});

			return {
				leftWins,
				rightWins,
				draws,
				totalMatches: matches.length,
				recentMatches: matches
			};
		},
		enabled: !!leftChefId && !!rightChefId,
		initialData: { leftWins: 0, rightWins: 0, draws: 0, totalMatches: 0, recentMatches: [] }
	});
};
