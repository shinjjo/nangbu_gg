import { useState, useEffect } from 'react';
import { Trophy, ChevronDown, Calendar, Utensils } from 'lucide-react';
import RivalryRow from '../components/home/RivalryRow';
import ChefAvatarGrid from '../components/ChefAvatarGrid';
import SeasonToggle from '../components/ranking/SeasonToggle';
import VsFloatingButton from '../components/vs/VsFloatingButton';
import { useRankings, SeasonFilter } from '../hooks/useRankings';
import { useHeadToHeadStats } from '../hooks/useHeadToHeadStats';
import { Chef } from '../types';
import { getChefAvatar } from '../utils/chefAvatars';



export default function Home() {
  /* ─── Season & Rankings ─── */
  const [season, setSeason] = useState<SeasonFilter>('2');
  const { rankings, isLoading: isRankingsLoading } = useRankings(season);

  /* ─── VS Simulator State ─── */
  const [vsOpen, setVsOpen] = useState(false);
  const [leftChef, setLeftChef] = useState<Chef | null>(null);
  const [rightChef, setRightChef] = useState<Chef | null>(null);
  const [chefPickerOpen, setChefPickerOpen] = useState(false);
  const [targetSide, setTargetSide] = useState<'left' | 'right' | null>(null);

  const { data: stats, isLoading: isStatsLoading } = useHeadToHeadStats(leftChef?.id, rightChef?.id);

  useEffect(() => {
    if (rankings.length >= 2 && !leftChef && !rightChef) {
      setLeftChef(rankings[0]);
      setRightChef(rankings[1]);
    }
  }, [rankings, leftChef, rightChef]);

  const openChefPicker = (side: 'left' | 'right') => {
    setTargetSide(side);
    setChefPickerOpen(true);
  };

  const selectChef = (chef: Chef) => {
    if (targetSide === 'left') setLeftChef(chef);
    else if (targetSide === 'right') setRightChef(chef);
    setChefPickerOpen(false);
    setTargetSide(null);
  };

  const handleSelectRivalry = (c1: Chef, c2: Chef) => {
    setLeftChef(c1);
    setRightChef(c2);
  };

  const leftWinRate = stats && stats.totalMatches > 0
    ? Math.round((stats.leftWins / stats.totalMatches) * 100) : 0;
  const rightWinRate = stats && stats.totalMatches > 0
    ? 100 - leftWinRate : 0;

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
            <Trophy className="w-4 h-4 text-amber-500" /> 셰프 랭킹
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
        </div>

        {/* ── Chef Avatar Grid ── */}
        {rankings.length > 0 ? (
          <div className="mb-6">
            <ChefAvatarGrid chefs={rankings} />
          </div>
        ) : (
          <div className="text-center text-slate-400 text-sm py-8">
            등록된 셰프가 없습니다.
          </div>
        )}
      </div>

      {/* ───────── VS Simulator FAB ───────── */}
      <VsFloatingButton onClick={() => setVsOpen(true)} />

      {/* ───────── VS Simulator Modal ───────── */}
      {vsOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">⚔️ 가상 대결</h3>
              <button
                onClick={() => setVsOpen(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-500"
              >
                ✕
              </button>
            </div>

            {rankings.length > 0 && <RivalryRow chefs={rankings} onSelectRivalry={handleSelectRivalry} />}

            <div className="px-5 py-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <button onClick={() => openChefPicker('left')} className="flex flex-col items-center gap-1.5 group flex-1">
                  {leftChef ? (
                    <>
                      <img src={getChefAvatar(leftChef.name, leftChef.image_url)} alt={leftChef.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 group-hover:border-blue-400 transition-colors" />
                      <span className="font-bold text-slate-900 text-xs">{leftChef.name}</span>
                      {stats && stats.totalMatches > 0 && (
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">{leftWinRate}%</span>
                      )}
                      <span className="text-[9px] text-slate-400 flex items-center gap-0.5"><ChevronDown className="w-2.5 h-2.5" />변경</span>
                    </>
                  ) : (
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[10px]">선택</div>
                  )}
                </button>

                <div className="flex flex-col items-center px-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-blue-600 font-mono tabular-nums">{stats ? stats.leftWins : 0}</span>
                    <span className="text-sm font-bold text-slate-300">:</span>
                    <span className="text-3xl font-black text-red-500 font-mono tabular-nums">{stats ? stats.rightWins : 0}</span>
                  </div>
                  {stats && stats.draws > 0 && (
                    <span className="text-[9px] text-slate-400 font-medium">무 {stats.draws}</span>
                  )}
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">{stats ? stats.totalMatches : 0} 경기</span>
                  {stats && stats.totalMatches > 0 && (
                    <div className="w-24 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden flex">
                      <div className="bg-blue-500 h-full" style={{ width: `${leftWinRate}%` }} />
                      <div className="bg-red-500 h-full" style={{ width: `${rightWinRate}%` }} />
                    </div>
                  )}
                </div>

                <button onClick={() => openChefPicker('right')} className="flex flex-col items-center gap-1.5 group flex-1">
                  {rightChef ? (
                    <>
                      <img src={getChefAvatar(rightChef.name, rightChef.image_url)} alt={rightChef.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 group-hover:border-red-400 transition-colors" />
                      <span className="font-bold text-slate-900 text-xs">{rightChef.name}</span>
                      {stats && stats.totalMatches > 0 && (
                        <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">{rightWinRate}%</span>
                      )}
                      <span className="text-[9px] text-slate-400 flex items-center gap-0.5"><ChevronDown className="w-2.5 h-2.5" />변경</span>
                    </>
                  ) : (
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[10px]">선택</div>
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Utensils className="w-3 h-3" /> 매치 히스토리
                {stats && stats.totalMatches > 0 && <span className="font-normal">({stats.totalMatches})</span>}
              </h4>
              <div className="space-y-1.5">
                {isStatsLoading ? (
                  <div className="text-center text-slate-400 py-8 text-xs">로딩 중...</div>
                ) : !stats || stats.totalMatches === 0 ? (
                  <div className="text-center text-slate-400 py-6 text-xs">대결 기록이 없습니다.</div>
                ) : (
                  stats.recentMatches.map((match) => {
                    const isLeftWinner = match.winner_id === leftChef?.id;
                    const isRightWinner = match.winner_id === rightChef?.id;

                    return (
                      <div key={match.id} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg text-xs">
                        <Calendar className="w-3 h-3 text-slate-300 flex-shrink-0" />
                        <span className="text-[10px] text-slate-400 flex-shrink-0">{match.episode?.aired_at?.slice(0, 10)}</span>
                        {match.topic && <span className="text-[10px] text-slate-500 font-medium truncate">{match.topic}</span>}
                        <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
                          <span className={`font-bold ${isLeftWinner ? 'text-blue-600' : 'text-slate-400'}`}>{leftChef?.name}</span>
                          <span className="text-slate-300 font-bold">vs</span>
                          <span className={`font-bold ${isRightWinner ? 'text-red-500' : 'text-slate-400'}`}>{rightChef?.name}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────── Chef Picker Sub-Modal ───────── */}
      {chefPickerOpen && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-sm sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
            <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">셰프 선택</h3>
              <button onClick={() => setChefPickerOpen(false)} className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-500">✕</button>
            </div>
            <div className="p-3 grid grid-cols-3 gap-2 overflow-y-auto">
              {rankings.map(chef => (
                <button
                  key={chef.id}
                  onClick={() => selectChef(chef)}
                  className="flex flex-col items-center p-2 bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-xl transition-all group"
                >
                  <img src={getChefAvatar(chef.name, chef.image_url)} alt={chef.name} className="w-10 h-10 rounded-full bg-slate-200 mb-1 object-cover group-hover:scale-105 transition-transform" />
                  <span className="font-semibold text-[10px] text-slate-700">{chef.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
