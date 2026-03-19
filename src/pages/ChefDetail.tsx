import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, Trophy, TrendingUp, Users, ChevronLeft } from 'lucide-react';
import { supabase } from '../supabase';
import { Chef } from '../types';
import { useNavigate } from 'react-router-dom';
import { getChefAvatar } from '../utils/chefAvatars';

/* ──────────────────────────── Types ──────────────────────────── */

interface MatchDetail {
    id: string;
    topic: string | null;
    winner_id: string | null;
    chef_1_id: string;
    chef_2_id: string;
    episode_id: string;
    chef_1: { name: string; image_url: string } | null;
    chef_2: { name: string; image_url: string } | null;
    episode: { season: number; aired_at: string } | null;
    guest: { name: string } | null;
    recipes: { id: string; name: string; chef_id: string }[] | null;
}

interface OpponentRecord {
    id: string;
    name: string;
    imageUrl: string;
    wins: number;
    losses: number;
    total: number;
    winRate: number;
}

type Tab = 'history' | 'headtohead' | 'season';

/* ──────────────────────────── Component ──────────────────────────── */

const ChefDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>('history');

    /* ── Fetch Chef ── */
    const { data: chef, isLoading: chefLoading } = useQuery({
        queryKey: ['chef', id],
        queryFn: async () => {
            const { data, error } = await supabase.from('chefs').select('*').eq('id', id!).single();
            if (error) throw error;
            return data as unknown as Chef;
        },
        enabled: !!id,
    });

    /* ── Fetch All Matches For This Chef ── */
    const { data: matches = [], isLoading: matchesLoading } = useQuery({
        queryKey: ['chefMatches', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('matches')
                .select(`
          id, topic, winner_id, chef_1_id, chef_2_id, episode_id,
          chef_1:chefs!chef_1_id(name, image_url),
          chef_2:chefs!chef_2_id(name, image_url),
          episode:episodes!episode_id(season, aired_at),
          guest:guests(name),
          recipes(id, name, chef_id)
        `)
                .or(`chef_1_id.eq.${id},chef_2_id.eq.${id}`);
            if (error) throw error;
            const matches = data as unknown as MatchDetail[];
            matches.sort((a, b) => {
                const dateA = a.episode?.aired_at || '';
                const dateB = b.episode?.aired_at || '';
                return dateB.localeCompare(dateA);
            });
            return matches;
        },
        enabled: !!id,
    });

    const isLoading = chefLoading || matchesLoading;

    /* ── Compute stats ── */
    const totalWins = matches.filter((m) => m.winner_id === id).length;
    const totalMatches = matches.filter((m) => m.winner_id !== null).length;
    const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

    /* ── Head-to-head records ── */
    const opponentMap = new Map<string, OpponentRecord>();
    matches.forEach((m) => {
        if (!m.winner_id) return;
        const isChef1 = m.chef_1_id === id;
        const oppId = isChef1 ? m.chef_2_id : m.chef_1_id;
        const oppData = isChef1 ? m.chef_2 : m.chef_1;
        if (!opponentMap.has(oppId)) {
            opponentMap.set(oppId, {
                id: oppId,
                name: oppData?.name || '상대',
                imageUrl: getChefAvatar(oppData?.name, oppData?.image_url),
                wins: 0,
                losses: 0,
                total: 0,
                winRate: 0,
            });
        }
        const rec = opponentMap.get(oppId)!;
        rec.total++;
        if (m.winner_id === id) rec.wins++;
        else rec.losses++;
        rec.winRate = Math.round((rec.wins / rec.total) * 100);
    });
    const opponents = Array.from(opponentMap.values()).sort((a, b) => b.total - a.total);

    // 영혼의 라이벌: 가장 많이 대결한 상대
    const soulmate = opponents.length > 0 ? opponents[0] : null;

    // 승점 자판기: 승률이 가장 높은 상대 (최소 3경기)
    const wallet = opponents
        .filter((o) => o.total >= 3)
        .sort((a, b) => b.winRate - a.winRate)[0] || null;

    // 통곡의 벽: 승률이 가장 낮은 상대 (최소 3경기)
    const wall = opponents
        .filter((o) => o.total >= 3)
        .sort((a, b) => a.winRate - b.winRate)[0] || null;

    /* ── Season breakdown (using episode.season) ── */
    const seasonMap = new Map<string, { wins: number; losses: number; matches: number }>();
    matches.forEach((m) => {
        if (!m.winner_id) return;
        const seasonLabel = m.episode?.season ? `시즌 ${m.episode.season}` : 'Unknown';
        if (!seasonMap.has(seasonLabel)) seasonMap.set(seasonLabel, { wins: 0, losses: 0, matches: 0 });
        const s = seasonMap.get(seasonLabel)!;
        s.matches++;
        if (m.winner_id === id) s.wins++;
        else s.losses++;
    });
    const seasons = Array.from(seasonMap.entries())
        .map(([year, stats]) => ({ year, ...stats, winRate: Math.round((stats.wins / stats.matches) * 100) }))
        .sort((a, b) => b.year.localeCompare(a.year));

    /* ── Tab definitions ── */
    const tabs: { key: Tab; label: string; icon: typeof Trophy }[] = [
        { key: 'history', label: '매치 히스토리', icon: Trophy },
        { key: 'headtohead', label: '상대 전적', icon: Users },
        { key: 'season', label: '시즌 분석', icon: TrendingUp },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!chef) {
        return <div className="text-center py-20 text-slate-400">셰프를 찾을 수 없습니다.</div>;
    }

    return (
        <div className="max-w-2xl mx-auto pb-20">
            {/* ── Back Button ── */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4 mt-2"
            >
                <ChevronLeft className="w-4 h-4" />
                돌아가기
            </button>

            {/* ── Hero Header ── */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
                <div className="flex items-center gap-5">
                    <img
                        src={getChefAvatar(chef.name, chef.image_url)}
                        alt={chef.name}
                        className="w-20 h-20 rounded-full border-2 border-slate-200 object-cover"
                    />
                    <div className="flex-1">
                        <h1 className="text-2xl font-black text-slate-900">{chef.name}</h1>
                        {chef.bio && (
                            <p className="text-sm text-slate-500 font-medium mt-0.5">{chef.bio}</p>
                        )}
                    </div>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-3 gap-3 mt-5">
                    <div className="bg-amber-50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        </div>
                        <div className="text-2xl font-black text-amber-600">{totalWins}</div>
                        <div className="text-[10px] text-slate-500 font-medium">승</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-black text-slate-700">{winRate}%</div>
                        <div className="text-[10px] text-slate-500 font-medium">승률</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-black text-slate-700">{totalMatches}</div>
                        <div className="text-[10px] text-slate-500 font-medium">매치</div>
                    </div>
                </div>
            </div>

            {/* ── Tab Navigation ── */}
            <div className="flex bg-white rounded-xl border border-slate-200 p-1 mb-4">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold transition-all ${isActive
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ── Tab Content ── */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">

                {/* ── Tab 1: Match History ── */}
                {activeTab === 'history' && (
                    <div className="divide-y divide-slate-100">
                        {matches.filter((m) => m.winner_id !== null).length === 0 ? (
                            <p className="text-center text-slate-400 py-10 text-sm">전적이 없습니다.</p>
                        ) : (
                            matches
                                .filter((m) => m.winner_id !== null)
                                .map((m) => {
                                    const isChef1 = m.chef_1_id === id;
                                    const isWin = m.winner_id === id;
                                    const opponent = isChef1 ? m.chef_2 : m.chef_1;
                                    const myRecipe = m.recipes?.find(r => r.chef_id === id) || null;
                                    return (
                                        <div key={m.id} className="grid grid-cols-[72px_56px_1fr_52px] md:grid-cols-[100px_120px_1fr_60px] items-center px-4 py-3 gap-2 md:gap-3">
                                            {/* Column 1: Date & Guest */}
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[10px] sm:text-xs font-medium text-slate-400">
                                                    {m.episode?.aired_at?.slice(0, 10)}
                                                </span>
                                                {m.guest?.name && (
                                                    <span className="text-[11px] font-bold text-slate-600 truncate mt-0.5">
                                                        {m.guest.name} 편
                                                    </span>
                                                )}
                                            </div>

                                            {/* Column 2: Opponent (Vs) */}
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[10px] text-slate-400 font-medium">vs</span>
                                                <span className="text-xs sm:text-sm md:text-base font-black text-slate-800 line-clamp-2 leading-snug">
                                                    {opponent?.name || '상대'}
                                                </span>
                                            </div>

                                            {/* Column 3: Recipe & Topic */}
                                            <div className="flex flex-col min-w-0 border-l border-slate-100 pl-3">
                                                <span className="text-xs sm:text-sm font-bold text-slate-700 line-clamp-2 leading-snug">
                                                    {myRecipe?.name || '레시피 미등록'}
                                                </span>
                                                {m.topic && (
                                                    <span className="text-[11px] text-slate-500 truncate mt-0.5">{m.topic}</span>
                                                )}
                                            </div>

                                            {/* Column 4: Outcome */}
                                            <div className="flex justify-end flex-shrink-0">
                                                <div className={`w-11 sm:w-14 text-center text-[10px] sm:text-xs font-bold py-1.5 rounded ${isWin ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {isWin ? '승리' : '패배'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                        )}
                    </div>
                )}

                {/* ── Tab 2: Head-to-Head ── */}
                {activeTab === 'headtohead' && (
                    <div className="p-4 space-y-4">
                        {/* Rivalry Badge Cards */}
                        {(soulmate || wallet || wall) && (
                            <div className="grid grid-cols-3 gap-2">
                                {soulmate && (
                                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                                        <div className="text-2xl mb-1">🔥</div>
                                        <div className="text-[11px] font-black text-purple-600 leading-tight">영혼의 라이벌</div>
                                        <div className="text-[9px] text-slate-400 font-medium mb-2">최다 매치 상대</div>
                                        <img src={soulmate.imageUrl} alt={soulmate.name} className="w-10 h-10 rounded-full object-cover border-2 border-purple-200 mx-auto mb-1" />
                                        <div className="text-xs font-bold text-slate-800 truncate">{soulmate.name}</div>
                                        <div className="text-[10px] text-purple-500 font-bold">{soulmate.total}전 {soulmate.wins}승 {soulmate.losses}패</div>
                                    </div>
                                )}
                                {wallet && (
                                    <div className="bg-emerald-50 rounded-xl p-3 text-center">
                                        <div className="text-2xl mb-1">💰</div>
                                        <div className="text-[11px] font-black text-emerald-600 leading-tight">승점 자판기</div>
                                        <div className="text-[9px] text-slate-400 font-medium mb-2">최고 승률 상대</div>
                                        <img src={wallet.imageUrl} alt={wallet.name} className="w-10 h-10 rounded-full object-cover border-2 border-emerald-200 mx-auto mb-1" />
                                        <div className="text-xs font-bold text-slate-800 truncate">{wallet.name}</div>
                                        <div className="text-[10px] text-emerald-500 font-bold">{wallet.winRate}% 승률 ({wallet.wins}승 {wallet.losses}패)</div>
                                    </div>
                                )}
                                {wall && (
                                    <div className="bg-red-50 rounded-xl p-3 text-center">
                                        <div className="text-2xl mb-1">🧱</div>
                                        <div className="text-[11px] font-black text-red-500 leading-tight">통곡의 벽</div>
                                        <div className="text-[9px] text-slate-400 font-medium mb-2">최저 승률 상대</div>
                                        <img src={wall.imageUrl} alt={wall.name} className="w-10 h-10 rounded-full object-cover border-2 border-red-200 mx-auto mb-1" />
                                        <div className="text-xs font-bold text-slate-800 truncate">{wall.name}</div>
                                        <div className="text-[10px] text-red-400 font-bold">{wall.winRate}% 승률 ({wall.wins}승 {wall.losses}패)</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Full Opponent List */}
                        <div className="divide-y divide-slate-100">
                            {opponents.map((opp) => (
                                <div key={opp.id} className="flex items-center py-3 gap-3">
                                    <img src={opp.imageUrl} alt={opp.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-bold text-slate-800 block truncate">{opp.name}</span>
                                        <span className="text-xs text-slate-400">{opp.total}전</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className="text-sm font-bold text-amber-600">{opp.wins}승</span>
                                        <span className="text-sm font-bold text-slate-400">{opp.losses}패</span>
                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-400 rounded-full"
                                                style={{ width: `${opp.winRate}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Tab 3: Season Stats ── */}
                {activeTab === 'season' && (
                    <div className="p-4">
                        {seasons.length === 0 ? (
                            <p className="text-center text-slate-400 py-10 text-sm">시즌 데이터가 없습니다.</p>
                        ) : (
                            <div className="space-y-3">
                                {seasons.map((s) => (
                                    <div key={s.year} className="flex items-center gap-4">
                                        <span className="text-sm font-bold text-slate-700 w-16 flex-shrink-0">{s.year}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-slate-500">
                                                    <span className="font-bold text-amber-600">{s.wins}승</span>
                                                    {' '}<span className="text-slate-400">{s.losses}패</span>
                                                </span>
                                                <span className="text-xs font-bold text-slate-600">{s.winRate}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                                    style={{ width: `${s.winRate}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChefDetail;
