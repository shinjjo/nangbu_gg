import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Star, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import { RankedChef } from '../../hooks/useRankings';
import { getChefAvatar } from '../../utils/chefAvatars';

interface UnifiedRankingListProps {
    chefs: RankedChef[];
}

const UnifiedRankingList = ({ chefs }: UnifiedRankingListProps) => {
    const navigate = useNavigate();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState(12);

    const displayedChefs = chefs.slice(0, visibleCount);
    const hasMore = visibleCount < chefs.length;
    const maxWins = chefs.length > 0 ? chefs[0].seasonWins : 1;

    const toggle = (id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {displayedChefs.map((chef, index) => {
                const rank = index + 1;
                const isExpanded = expandedId === chef.id;
                const barPct = maxWins > 0 ? (chef.seasonWins / maxWins) * 100 : 0;

                return (
                    <div key={chef.id}>
                        {/* ── Row ── */}
                        <button
                            onClick={() => toggle(chef.id)}
                            className="group w-full bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors py-3 px-4 flex items-center justify-between text-left cursor-pointer"
                        >
                            {/* LEFT: Identity */}
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <span className={`text-lg font-bold w-6 text-center tabular-nums flex-shrink-0 ${rank <= 3 ? 'text-amber-500' : 'text-slate-400'
                                    }`}>
                                    {rank}
                                </span>
                                <img
                                    src={getChefAvatar(chef.name, chef.image_url)}
                                    alt={chef.name}
                                    className="w-11 h-11 rounded-full object-cover border border-slate-200 flex-shrink-0"
                                />
                                 <div className="flex flex-col min-w-0">
                                     <Link
                                         to={`/chef/${chef.id}`}
                                         onClick={(e) => e.stopPropagation()}
                                         className="text-base font-bold text-slate-800 hover:text-slate-900 underline decoration-slate-200 underline-offset-4 decoration-1 transition-colors truncate"
                                     >
                                         {chef.name}
                                     </Link>
                                     <span className="text-xs text-slate-400 font-medium">승률 {chef.seasonWinRate}%</span>
                                 </div>
                            </div>

                            {/* RIGHT: Data Graph */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1 text-sm">
                                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                        <span className="font-bold text-amber-500 tabular-nums">{chef.seasonWins}</span>
                                        <span className="text-slate-300">/</span>
                                        <span className="text-slate-400 tabular-nums">{chef.seasonMatches}전</span>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="w-28 sm:w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-400 rounded-full transition-all duration-700 ease-out"
                                            style={{ width: `${barPct}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Chevron */}
                                {isExpanded ? (
                                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                ) : (
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                                )}
                            </div>
                        </button>

                        {/* ── Expanded: Full Match History ── */}
                        {isExpanded && (
                            <div className="bg-slate-50 border-b border-slate-100 px-4 py-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                    최근 전적
                                </h4>

                                {chef.recentMatches.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {chef.recentMatches.map((match, i) => (
                                            <div
                                                key={`${match.matchId}-${i}`}
                                                className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3 shadow-sm"
                                            >
                                                {/* Outcome Badge */}
                                                <div className={`w-12 text-center text-[11px] font-bold py-1 rounded flex-shrink-0 ${match.result === 'win'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {match.result === 'win' ? 'WIN' : 'LOSE'}
                                                </div>

                                                 {/* Main Content */}
                                                 <div className="flex-1 px-3 flex flex-col min-w-0">
                                                     {match.topic && (
                                                         <span className="text-[11px] text-slate-500 truncate mb-0.5">
                                                             {match.topic}
                                                         </span>
                                                     )}
                                                     {match.recipeId ? (
                                                         <Link
                                                             to={`/recipe/${match.recipeId}`}
                                                             className="text-sm font-bold text-slate-800 hover:text-slate-900 underline decoration-slate-200 underline-offset-4 decoration-1 transition-colors truncate"
                                                         >
                                                             {match.recipeName}
                                                         </Link>
                                                     ) : (
                                                         <span className="text-sm font-bold text-slate-800 truncate">
                                                             {match.recipeName || '레시피 미등록'}
                                                         </span>
                                                     )}
                                                 </div>

                                                 {/* Opponent & Date */}
                                                 <div className="text-right flex flex-col flex-shrink-0">
                                                     <Link
                                                         to={`/chef/${match.opponentId}`}
                                                         className="text-xs font-bold text-slate-800 hover:text-slate-900 underline decoration-slate-200 underline-offset-4 decoration-1 transition-colors"
                                                     >
                                                         vs {match.opponentName}
                                                     </Link>
                                                     <span className="text-[10px] text-slate-400">{match.date}</span>
                                                 </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 text-center py-2">
                                        시즌 전적이 없습니다.
                                    </p>
                                )}

                                {/* View Full Stats Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/chef/${chef.id}`);
                                    }}
                                    className="w-full flex items-center justify-center gap-1.5 mt-3 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium text-slate-600 hover:text-slate-800"
                                >
                                    상세 전적 및 분석 보기
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Show More */}
            {hasMore && (
                <button
                    onClick={() => setVisibleCount(chefs.length)}
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-bold text-slate-500 hover:text-slate-700"
                >
                    <ChevronDown className="w-4 h-4" />
                    더 보기 ({chefs.length - visibleCount}명)
                </button>
            )}
        </div>
    );
};

export default UnifiedRankingList;
