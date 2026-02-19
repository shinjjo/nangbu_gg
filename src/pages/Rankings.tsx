import { useState, useMemo } from 'react';
import { Trophy, ChevronDown, ChevronUp, Star, Percent, Swords } from 'lucide-react';
import UnifiedRankingList from '../components/ranking/UnifiedRankingList';
import SeasonToggle from '../components/ranking/SeasonToggle';
import { useRankings, SeasonFilter, RankedChef } from '../hooks/useRankings';

type SortKey = 'winRate' | 'wins' | 'matches';
type SortDir = 'asc' | 'desc';

const SORT_OPTIONS: { key: SortKey; label: string; icon: React.ReactNode }[] = [
    { key: 'wins', label: '별', icon: <Star className="w-3.5 h-3.5" /> },
    { key: 'winRate', label: '승률', icon: <Percent className="w-3.5 h-3.5" /> },
    { key: 'matches', label: '매치수', icon: <Swords className="w-3.5 h-3.5" /> },
];

const SORT_KEY_MAP: Record<SortKey, keyof RankedChef> = {
    winRate: 'seasonWinRate',
    wins: 'seasonWins',
    matches: 'seasonMatches',
};

export default function Rankings() {
    /* ─── Season & Rankings ─── */
    const [season, setSeason] = useState<SeasonFilter>('2');
    const { rankings, isLoading: isRankingsLoading } = useRankings(season);

    /* ─── Sort State ─── */
    const [sortKey, setSortKey] = useState<SortKey>('wins');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    const handleSortClick = (key: SortKey) => {
        if (key === sortKey) {
            setSortDir((prev) => (prev === 'desc' ? 'asc' : 'desc'));
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    };

    const sortedRankings = useMemo(() => {
        const prop = SORT_KEY_MAP[sortKey];
        const dir = sortDir === 'desc' ? -1 : 1;
        return [...rankings].sort((a, b) => {
            const va = a[prop] as number;
            const vb = b[prop] as number;
            if (va !== vb) return (va - vb) * dir;
            // secondary sort: wins desc as tiebreaker
            return b.seasonWins - a.seasonWins;
        });
    }, [rankings, sortKey, sortDir]);

    /* ─── Loading ─── */
    if (isRankingsLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-amber-500" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
            {/* ───────── Header + Season Toggle ───────── */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-amber-500" /> 상세 순위표
                    </h2>
                    <SeasonToggle value={season} onChange={setSeason} />
                </div>
            </div>

            {/* ───────── Main Content ───────── */}
            <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {season === 'all' ? '역대 전체' : `시즌 ${season}`} · {rankings.length}명
                    </h3>

                    {/* ── Sort Controls ── */}
                    <div className="flex items-center gap-1">
                        {SORT_OPTIONS.map(({ key, label, icon }) => {
                            const isActive = sortKey === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handleSortClick(key)}
                                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive
                                        ? 'bg-slate-800 text-white shadow-sm'
                                        : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                                        }`}
                                >
                                    {icon}
                                    {label}
                                    {isActive && (
                                        sortDir === 'desc'
                                            ? <ChevronDown className="w-3 h-3 ml-0.5" />
                                            : <ChevronUp className="w-3 h-3 ml-0.5" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {sortedRankings.length > 0 ? (
                    <UnifiedRankingList chefs={sortedRankings} />
                ) : (
                    <div className="text-center text-slate-400 text-sm py-8">
                        등록된 셰프가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
