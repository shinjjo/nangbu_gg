import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, Circle, Star, Swords, Heart } from 'lucide-react';
import { supabase } from '../supabase';
import recipesData from '../data/recipes.json';
import { useFridge, parseIngredients } from '../hooks/useFridge';
import RecipeFloatingUI from '../components/RecipeFloatingUI';

interface RecipeStep {
  text: string;
  completed: boolean;
}

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>(); // Supabase Recipe UUID
  const navigate = useNavigate();
  const { has: hasFridge, toggle: toggleFridge, matchCount, matchPct } = useFridge();
  
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isSaved, setIsSaved] = useState(false);
  const [hasCooked, setHasCooked] = useState(false);
  const [rating, setRating] = useState(0);
  const [steps, setSteps] = useState<RecipeStep[]>([]);
  
  useEffect(() => {
    async function fetchRecipeData() {
      if (!id) return;
      setLoading(true);
      try {
        // 1. Fetch recipe from Supabase
        const { data: dbRecipe, error: recipeError } = await supabase
          .from('recipes')
          .select(`
            *,
            chef:chefs!chef_id(*),
            match:matches!match_id(id, topic, guest:guests!guest_id(name))
          `)
          .eq('id', id)
          .single();

        if (recipeError || !dbRecipe) {
          console.error('Error fetching recipe:', recipeError);
          setLoading(false);
          return;
        }

        // 1.5 Fetch string names for ingredients if they are UUIDs
        if (dbRecipe.ingredients && Array.isArray(dbRecipe.ingredients) && dbRecipe.ingredients.length > 0) {
          const { data: ingredientsData } = await supabase
            .from('ingredients')
            .select('id, name')
            .in('id', dbRecipe.ingredients);

          if (ingredientsData && ingredientsData.length > 0) {
            dbRecipe.ingredients = dbRecipe.ingredients.map((ingId: string) => {
              const matched = ingredientsData.find(i => i.id === ingId);
              return matched ? matched.name : ingId;
            });
          }
        }

        setRecipe(dbRecipe);

        // 2. Link to recipes.json using match.id (YouTube ID)
        const matchYoutubeId = dbRecipe.match?.id;
        const matchingJson = (recipesData as any[]).find(r => r.id === matchYoutubeId);
        
          // Set steps directly from dbRecipe if available
          let initialSteps = [];
          if (dbRecipe.steps && Array.isArray(dbRecipe.steps) && dbRecipe.steps.length > 0) {
            initialSteps = dbRecipe.steps.map((s: string) => ({ text: s, completed: false }));
            setSteps(initialSteps);
          } else if (matchingJson) {
            // Find the specific chef index in JSON for steps
            const normalizedChef = dbRecipe.chef?.name?.replace(/\s*셰프\s*$/, '').trim().toLowerCase() || '';
            const chefData = matchingJson.chefs.find((c: any) => 
              c.chef_name?.replace(/\s*셰프\s*$/, '').trim().toLowerCase() === normalizedChef
            );

            if (chefData && chefData.steps) {
              initialSteps = chefData.steps.map((s: string) => ({ text: s, completed: false }));
              setSteps(initialSteps);
            }
          }
          
          // 3. Load user state from localStorage
          const storageKey = `recipe-${id}`;
          const savedState = localStorage.getItem(storageKey);
          if (savedState) {
            try {
              const parsed = JSON.parse(savedState);
              setIsSaved(parsed.isSaved || false);
              setHasCooked(parsed.hasCooked || false);
              setRating(parsed.rating || 0);
              if (parsed.stepsCompleted && initialSteps.length > 0) {
                setSteps(initialSteps.map((s: any, i: number) => ({ text: s.text, completed: parsed.stepsCompleted[i] || false })));
              }
            } catch (e) {
              // Ignore parse errors from localStorage
            }
          }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipeData();
  }, [id]);
  
  const updateStorage = (updates: any) => {
    const storageKey = `recipe-${id}`;
    const currentState = JSON.parse(localStorage.getItem(storageKey) || '{}');
    localStorage.setItem(storageKey, JSON.stringify({ ...currentState, ...updates }));
  };

  const toggleSave = () => { setIsSaved(!isSaved); updateStorage({ isSaved: !isSaved }); };
  const toggleCooked = () => { setHasCooked(!hasCooked); updateStorage({ hasCooked: !hasCooked }); };
  const handleRate = (val: number) => { setRating(val); updateStorage({ rating: val }); };
  const toggleStep = (index: number) => {
    const newSteps = [...steps];
    newSteps[index].completed = !newSteps[index].completed;
    setSteps(newSteps);
    updateStorage({ stepsCompleted: newSteps.map(s => s.completed) });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-500">
        <p>레시피를 찾을 수 없습니다.</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-slate-200 rounded-lg">뒤로 가기</button>
      </div>
    );
  }

  const displayImages = recipe.image_url ? [recipe.image_url] : [];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans pb-20">
      {/* ───────── Top Navigation ───────── */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-sm font-black text-slate-900 truncate px-2">{recipe.name || '레시피 상세'}</div>
          {recipe.match_id && (
            <button 
              onClick={() => navigate(`/match/${recipe.match_id}`)}
              className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-full"
              title="대결 상세 보기"
            >
              <Swords className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ───────── Recipe Images ───────── */}
      {displayImages.length > 0 && (
        <div className="w-full max-w-2xl mx-auto px-5 mb-8">
          <div className="grid grid-cols-1">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-sm border border-slate-100">
              <img 
                src={displayImages[0].startsWith('http') ? displayImages[0] : `/recipe_images/${displayImages[0]}`} 
                alt="Main dish shot" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 max-w-2xl mx-auto w-full px-5 py-6">

        {/* ───────── Recipe Info ───────── */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 mb-1">{recipe.name}</h1>
          <p className="text-sm text-slate-500 font-medium">{recipe.chef?.name} • 게스트: {recipe.match?.guest?.name}</p>
          {recipe.match?.topic && (
            <div className="inline-block mt-3 px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-md">
              주제: {recipe.match.topic}
            </div>
          )}
        </div>
        
        {/* ───────── Interaction Bar ───────── */}
        <div className="flex items-center gap-3 mb-8 border-y border-slate-200 py-4">
          <button onClick={toggleSave} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${isSaved ? 'bg-rose-50 text-rose-600' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            <Heart className={`w-6 h-6 mb-1 ${isSaved ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-bold">스크랩</span>
          </button>
          <button onClick={toggleCooked} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${hasCooked ? 'bg-emerald-50 text-emerald-600' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            <CheckCircle2 className={`w-6 h-6 mb-1 ${hasCooked ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-bold">만들어봤어요</span>
          </button>
          <div className="flex-1 flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200">
            <div className="flex gap-0.5 mb-1.5">
              {[1, 2, 3, 4, 5].map(val => (
                <Star key={val} onClick={() => handleRate(val)} className={`w-4 h-4 cursor-pointer ${rating >= val ? 'text-amber-400 fill-current' : 'text-slate-300'}`} />
              ))}
            </div>
            <span className="text-[10px] font-bold text-slate-600">별점</span>
          </div>
        </div>


        {/* ───────── Ingredients + Fridge Match ───────── */}
        {(() => {
          const ingredients = parseIngredients(recipe.ingredients || '');
          const count = matchCount(ingredients);
          const pct = matchPct(ingredients);
          const fridgeMsg =
            pct === 0 ? '냉장고가 텅 비어있나요? 🥲' :
            pct < 40  ? '장 봐야겠는데요 🛒' :
            pct < 70  ? '조금만 더 사면 돼요!' :
            pct < 100 ? '거의 다 있어요! 🤩' :
                        '지금 바로 만들 수 있어요! 🎉';
          return (
            <div className="mb-8">
              {/* Header row */}
              <div className="flex items-end justify-between mb-3">
                <h3 className="text-base font-bold text-slate-900">재료</h3>
                {ingredients.length > 0 && (
                  <span className="text-xs font-bold text-slate-500">
                    내 냉장고 {count}/{ingredients.length}
                  </span>
                )}
              </div>

              {/* Match bar */}
              {ingredients.length > 0 && (
                <div className="mb-3">
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">{fridgeMsg}</p>
                </div>
              )}

              {/* Ingredient tag chips */}
              <div className="flex flex-wrap gap-2">
                {ingredients.length > 0 ? ingredients.map((ing) => {
                  const inFridge = hasFridge(ing);
                  return (
                    <button
                      key={ing}
                      onClick={() => toggleFridge(ing)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95
                        ${inFridge
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'}`}
                    >
                      {inFridge && <span className="text-[10px]">✓</span>}
                      {ing}
                    </button>
                  );
                }) : (
                  <span className="text-sm text-slate-400">재료 정보 없음</span>
                )}
              </div>
            </div>
          );
        })()}

        {/* ───────── Interactive Checklist ───────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">조리 과정</h3>
            <span className="text-xs font-bold text-slate-400">
              {steps.filter(s => s.completed).length} / {steps.length} 완료
            </span>
          </div>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <button
                key={index}
                onClick={() => toggleStep(index)}
                className={`w-full text-left flex items-start p-4 rounded-2xl border transition-all
                  ${step.completed ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 shadow-sm hover:border-blue-300'}`}
              >
                <div className="mr-3 mt-0.5 flex-shrink-0">
                  {step.completed
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    : <Circle className="w-5 h-5 text-slate-300" />}
                </div>
                <p className={`text-sm leading-relaxed ${step.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  <span className="font-bold mr-2 text-slate-400">{index + 1}.</span>
                  {step.text}
                </p>
              </button>
            ))}
          </div>
        </div>

      </div>

      {recipe.match_id && <RecipeFloatingUI matchId={recipe.match_id} />}
    </div>
  );
}
