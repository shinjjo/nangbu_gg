import { Match } from '../types';
import { getChefAvatar } from '../utils/chefAvatars';

interface RecentMatchCardProps {
	match: Match;
}

const RecentMatchCard = ({ match }: RecentMatchCardProps) => {
	return (
		<div className="w-full bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all">
			{/* Header: Date & Topic */}
			<div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-50">
				<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
					{match.episode?.aired_at ? new Date(match.episode.aired_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }) : '날짜 미정'}
				</span>
				<span className="text-[10px] font-medium text-slate-500 truncate max-w-[200px]">
					{match.topic}
				</span>
			</div>

			{/* Match Content */}
			<div className="flex items-center justify-between">
				{/* Chef 1 (Red) */}
				<div className={`flex flex-col items-center w-24 transition-opacity ${match.winner_id === match.chef_2_id ? 'opacity-50 grayscale' : 'opacity-100'}`}>
					<div className={`relative w-14 h-14 rounded-full border-2 ${match.winner_id === match.chef_1_id ? 'border-red-500 shadow-md' : 'border-slate-200'} overflow-hidden`}>
						<img src={getChefAvatar(match.chef_1?.name, match.chef_1?.image_url)} alt={match.chef_1?.name} className="w-full h-full object-cover" />
					</div>
					<span className={`text-xs font-bold mt-2 ${match.winner_id === match.chef_1_id ? 'text-slate-900' : 'text-slate-500'}`}>
						{match.chef_1?.name || '셰프 1'}
					</span>
					{match.winner_id === match.chef_1_id && <span className="text-[9px] font-black text-red-500 mt-0.5">WINNER</span>}
				</div>

				{/* VS / Score Badge */}
				<div className="flex flex-col items-center pb-4">
					<span className="text-2xl font-black italic text-slate-200">VS</span>
				</div>

				{/* Chef 2 (Blue) */}
				<div className={`flex flex-col items-center w-24 transition-opacity ${match.winner_id === match.chef_1_id ? 'opacity-50 grayscale' : 'opacity-100'}`}>
					<div className={`relative w-14 h-14 rounded-full border-2 ${match.winner_id === match.chef_2_id ? 'border-blue-500 shadow-md' : 'border-slate-200'} overflow-hidden`}>
						<img src={getChefAvatar(match.chef_2?.name, match.chef_2?.image_url)} alt={match.chef_2?.name} className="w-full h-full object-cover" />
					</div>
					<span className={`text-xs font-bold mt-2 ${match.winner_id === match.chef_2_id ? 'text-slate-900' : 'text-slate-500'}`}>
						{match.chef_2?.name || '셰프 2'}
					</span>
					{match.winner_id === match.chef_2_id && <span className="text-[9px] font-black text-blue-500 mt-0.5">WINNER</span>}
				</div>
			</div>
		</div>
	);
};

export default RecentMatchCard;
