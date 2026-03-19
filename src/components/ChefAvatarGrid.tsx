import { useNavigate } from 'react-router-dom';
import { Star, Swords, Percent } from 'lucide-react';
import { RankedChef } from '../hooks/useRankings';
import { getChefAvatar } from '../utils/chefAvatars';

interface ChefAvatarGridProps {
    chefs: RankedChef[];
}

export default function ChefAvatarGrid({ chefs }: ChefAvatarGridProps) {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-3 gap-3">
            {chefs.map((chef, idx) => (
                <button
                    key={chef.id}
                    onClick={() => navigate(`/chef/${chef.id}`)}
                    className="group relative flex flex-col items-center focus:outline-none"
                >
                    {/* Avatar container */}
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-md
                          ring-1 ring-slate-200 group-hover:ring-amber-400
                          group-active:scale-95 transition-all duration-200">
                        {/* Image */}
                        <img
                            src={getChefAvatar(chef.name, chef.image_url)}
                            alt={chef.name}
                            className="w-full h-full object-cover"
                        />

                        {/* Rank badge (top-left) */}
                        {idx < 3 && (
                            <div className={`absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center
                              text-[10px] font-black text-white shadow-lg
                              ${idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : 'bg-amber-700'}`}>
                                {idx + 1}
                            </div>
                        )}

                        {/* Stats overlay (bottom) */}
                        <div className="absolute inset-x-0 bottom-0
                            bg-gradient-to-t from-black/80 via-black/50 to-transparent
                            pt-6 pb-2 px-1.5">
                            <div className="flex items-center justify-center gap-2 text-white">
                                <span className="flex items-center gap-0.5 text-[10px] font-bold">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    {chef.seasonWins}
                                </span>
                                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-white/80">
                                    <Swords className="w-3 h-3" />
                                    {chef.seasonMatches}
                                </span>
                                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-white/80">
                                    <Percent className="w-2.5 h-2.5" />
                                    {chef.seasonWinRate}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Name */}
                    <span className="mt-1.5 text-xs font-bold text-slate-800 group-hover:text-amber-600 transition-colors truncate w-full text-center">
                        {chef.name}
                    </span>
                </button>
            ))}
        </div>
    );
}
