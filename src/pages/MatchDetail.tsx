import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Share2, Trophy, Utensils, Calendar, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../supabase';
import recipesData from '../data/recipes.json';

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>(); // Supabase Match UUID or YouTube ID
  const navigate = useNavigate();
  
  const [match, setMatch] = useState<any>(null); // Supabase Match + Recipes
  const [jsonMatch, setJsonMatch] = useState<any>(null); // from recipes.json
  const [loading, setLoading] = useState(true);
  
  const [myVote, setMyVote] = useState<number | null>(null);
  const [voteCounts, setVoteCounts] = useState<[number, number]>([0, 0]);
  const [showActualResult, setShowActualResult] = useState(false);

  useEffect(() => {
    async function fetchMatchData() {
      if (!id) return;
      setLoading(true);
      try {
        let dbMatch: any = null;
        
        // 1. Resolve match from Supabase
        const { data: directData } = await supabase
          .from('matches')
          .select(`
            *,
            chef_1:chefs!chef_1_id(name, image_url),
            chef_2:chefs!chef_2_id(name, image_url),
            episode:episodes!episode_id(season, aired_at),
            guest:guests!guest_id(name),
            recipes(*)
          `)
          .eq('id', id)
          .maybeSingle();

        if (directData) {
          dbMatch = directData;
        } else {
          const { data: viaRecipe } = await supabase
            .from('recipes')
            .select('match_id')
            .eq('id', id)
            .maybeSingle();
          
          if (viaRecipe?.match_id) {
             const { data: resolved } = await supabase
              .from('matches')
              .select(`
                *,
                chef_1:chefs!chef_1_id(name, image_url),
                chef_2:chefs!chef_2_id(name, image_url),
                episode:episodes!episode_id(season, aired_at),
                guest:guests!guest_id(name),
                recipes(*)
              `)
              .eq('id', viaRecipe.match_id)
              .single();
            dbMatch = resolved;
          }
        }

        if (!dbMatch) {
          console.error('Match not found');
          setLoading(false);
          return;
        }

        setMatch(dbMatch);

        // 2. Link to recipes.json
        const youtubeId = dbMatch.id;
        const matchingJson = (recipesData as any[]).find(r => r.id === youtubeId);
        if (matchingJson) {
           setJsonMatch(matchingJson);
        }

        // 3. Load vote
        const voteKey = `vote-${dbMatch.id}`;
        const savedVote = localStorage.getItem(voteKey);
        if (savedVote) {
          const parsed = JSON.parse(savedVote);
          setMyVote(parsed.myVote ?? null);
          setVoteCounts(parsed.voteCounts ?? [0, 0]);
        } else {
          setVoteCounts([Math.floor(Math.random() * 60) + 20, Math.floor(Math.random() * 60) + 20]);
        }
      } catch (err) {
        console.error('Error fetching match:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMatchData();
  }, [id]);

  const handleVote = (chefIdx: number) => {
    if (myVote !== null || !match) return;
    const newCounts: [number, number] = [voteCounts[0], voteCounts[1]];
    newCounts[chefIdx] += 1;
    setVoteCounts(newCounts);
    setMyVote(chefIdx);
    localStorage.setItem(`vote-${match.id}`, JSON.stringify({ myVote: chefIdx, voteCounts: newCounts }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-500">
        <p>매치를 찾을 수 없습니다.</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-slate-200 rounded-lg">뒤로 가기</button>
      </div>
    );
  }

  const totalVotes = voteCounts[0] + voteCounts[1];
  const ratio0 = totalVotes > 0 ? Math.round((voteCounts[0] / totalVotes) * 100) : 50;
  const ratio1 = 100 - ratio0;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans pb-20">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-sm font-black text-slate-900">매치 상세</div>
          <button className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-full">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-5 py-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full mb-3 uppercase tracking-wider">
            <Trophy className="w-3 h-3" /> Season Match
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">{match.topic || jsonMatch?.theme}</h1>
          <p className="text-sm text-slate-500 font-medium mb-4">게스트: {match.guest?.name || jsonMatch?.guest}</p>

          {/* ───────── Results Toggle Button ───────── */}
          <div className="flex justify-center mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <button
              onClick={() => setShowActualResult(!showActualResult)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors active:scale-95"
            >
              {showActualResult ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-xs font-black uppercase tracking-wider">
                {showActualResult ? '결과 숨기기' : '결과 보기'}
              </span>
            </button>
          </div>
        </div>

        <div className="relative mb-6">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center font-black italic shadow-xl border-4 border-slate-50">
              VS
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[0, 1].map((i) => {
              const chefId = i === 0 ? match.chef_1_id : match.chef_2_id;
              const dbChef = i === 0 ? match.chef_1 : match.chef_2;
              const dbRecipe = match.recipes?.find((r: any) => r.chef_id === chefId);
              const jsonChef = jsonMatch?.chefs?.find((c: any) => 
                c.chef_name.replace(/\s*셰프\s*$/, '').trim().toLowerCase() === dbChef?.name.replace(/\s*셰프\s*$/, '').trim().toLowerCase()
              );
              const thumbnail = dbRecipe?.image_url || jsonChef?.images?.[0];

              return (
                <div key={i} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm overflow-hidden relative group">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100 shadow-inner">
                      {thumbnail ? (
                        <img 
                          src={thumbnail.startsWith('http') ? thumbnail : `/recipe_images/${thumbnail}`} 
                          alt="Dish" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🍳</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col items-center w-full">
                      <p className={`text-[10px] font-bold mb-1 uppercase tracking-widest ${i === 0 ? 'text-red-500' : 'text-blue-500'}`}>
                        Chef {i + 1}
                      </p>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1 line-clamp-2 w-full">{dbRecipe?.name || '레시피 미등록'}</h3>
                      <div className="flex items-center gap-2 mb-4 justify-center">
                        <p className="text-sm text-slate-500 font-bold">{dbChef?.name.replace(/\s*셰프\s*$/, '')}</p>
                        {showActualResult && (
                          (i === 0 && match.winner_id === match.chef_1_id) ||
                          (i === 1 && match.winner_id === match.chef_2_id)
                        ) && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${i === 0 ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                            WINNER 🏆
                          </span>
                        )}
                      </div>
                      
                      {dbRecipe && (
                        <Link 
                          to={`/recipe/${dbRecipe.id}`}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-sm w-full sm:w-auto"
                        >
                          <Utensils className="w-3.5 h-3.5" /> 레시피 보기 <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">같은 재료라면</p>
              <h3 className="text-lg font-black text-slate-900">나라면 누구 편? 🥊</h3>
            </div>
          </div>

          {myVote === null && !showActualResult ? (
            <div className="grid grid-cols-2 bg-slate-50/30">
              {[0, 1].map((i) => {
                const dbChef = i === 0 ? match.chef_1 : match.chef_2;
                return (
                  <button
                    key={i}
                    onClick={() => handleVote(i)}
                    className={`flex flex-col items-center gap-4 py-10 px-6 transition-all hover:bg-white active:scale-95 group relative ${i === 0 ? 'border-r border-slate-100' : ''}`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black select-none transition-transform group-hover:scale-110 shadow-sm
                      ${i === 0 ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                      {dbChef?.name.charAt(0)}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-slate-900 mb-1">{dbChef?.name.replace(/\s*셰프\s*$/, '')}</p>
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all
                        ${i === 0 ? 'bg-red-500 text-white group-hover:bg-red-600' : 'bg-blue-500 text-white group-hover:bg-blue-600'}`}>
                        선택하기
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {[0, 1].map((i) => {
                const ratio = i === 0 ? ratio0 : ratio1;
                const isMyPick = myVote === i;
                const oppRatio = i === 0 ? ratio1 : ratio0;
                const isLeading = ratio >= oppRatio;
                const dbChef = i === 0 ? match.chef_1 : match.chef_2;
                const chefNameNormalized = dbChef?.name.replace(/\s*셰프\s*$/, '');
                return (
                  <div key={i} className={`p-4 rounded-2xl border ${isMyPick ? (i === 0 ? 'bg-red-50/30 border-red-100' : 'bg-blue-50/30 border-blue-100') : 'bg-slate-50/30 border-slate-100'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${isMyPick ? (i === 0 ? 'text-red-500' : 'text-blue-500') : 'text-slate-500'}`}>
                          {chefNameNormalized}
                        </span>
                        {isMyPick && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${i === 0 ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                            PICKED ✓
                          </span>
                        )}
                        {isLeading && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isMyPick ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                            BEST 🔥
                          </span>
                        )}
                      </div>
                      <span className={`text-base font-black tabular-nums ${isMyPick ? (i === 0 ? 'text-red-500' : 'text-blue-500') : 'text-slate-400'}`}>
                        {ratio}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out
                          ${i === 0 ? 'bg-red-400' : 'bg-blue-400'}
                          ${isMyPick ? 'opacity-100' : 'opacity-40'}`}
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
                <Calendar className="w-3 h-3" />
                <span>총 {totalVotes.toLocaleString()}명이 참여 중</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
