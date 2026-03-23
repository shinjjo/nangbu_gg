import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFridge, parseIngredients } from '../hooks/useFridge';
import recipesData from '../data/recipes.json';

function matchBadgeColor(pct: number) {
  if (pct === 100) return 'bg-emerald-500 text-white';
  if (pct >= 70)   return 'bg-emerald-100 text-emerald-700';
  if (pct >= 40)   return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-500';
}

function matchLabel(pct: number) {
  if (pct === 100) return '🎉 지금 가능!';
  if (pct >= 70)   return `${pct}% 매칭`;
  if (pct >= 40)   return `${pct}% 매칭`;
  return `${pct}% 매칭`;
}

export default function RecipeList() {
  const { matchPct, size: fridgeSize, items, toggle, clear } = useFridge();

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('ingredient') as HTMLInputElement;
    const value = input.value.trim();
    if (value) {
      toggle(value);
      input.value = '';
    }
  };

  // Flatten all recipes × chefs into cards, compute match pct
  const cards = useMemo(() => {
    const result: {
      recipeId: string;
      chefIndex: number;
      chefName: string;
      dishName: string;
      guest: string;
      theme: string;
      thumbnail: string;
      ingredients: string[];
      pct: number;
    }[] = [];

    for (const recipe of recipesData as any[]) {
      recipe.chefs.forEach((chef: any, i: number) => {
        const ingredients = parseIngredients(chef.ingredients || '');
        const pct = matchPct(ingredients);
        result.push({
          recipeId: recipe.id,
          chefIndex: i,
          chefName: chef.chef_name,
          dishName: chef.dish_name,
          guest: recipe.guest,
          theme: recipe.theme,
          thumbnail: chef.images?.[0] || '',
          ingredients,
          pct,
        });
      });
    }
    return result;
  }, [matchPct]);

  // Sort: highest pct first, then alphabetical
  const sorted = useMemo(
    () => [...cards].sort((a, b) => b.pct - a.pct || a.dishName.localeCompare(b.dishName, 'ko')),
    [cards]
  );

  const canMakeNow = sorted.filter(c => c.pct === 100).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">🧊 내 냉장고로 만들기</h1>
        <p className="text-sm text-slate-500 mt-1">
          {fridgeSize === 0
            ? '레시피 페이지에서 재료를 탭하면 냉장고에 추가돼요'
            : `냉장고에 ${fridgeSize}가지 재료가 있어요`}
        </p>

        {/* My Fridge Section */}
        <div className="mt-6 p-5 bg-slate-50 rounded-3xl border border-slate-200/60 shadow-inner">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              🛒 나의 재료
              <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-md">{fridgeSize}</span>
            </h2>
            {fridgeSize > 0 && (
              <button
                onClick={clear}
                className="text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors"
              >
                비우기
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {items.map((item) => (
              <button
                key={item}
                onClick={() => toggle(item)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all group"
              >
                {item}
                <span className="text-slate-300 group-hover:text-red-400">×</span>
              </button>
            ))}
            {fridgeSize === 0 && (
              <p className="text-xs text-slate-400 italic py-2">아직 추가된 재료가 없어요</p>
            )}
          </div>

          <form onSubmit={handleAdd} className="relative">
            <input
              name="ingredient"
              type="text"
              placeholder="재료를 추가해보세요 (예: 고등어, 대파)"
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors shadow-sm"
            >
              추가
            </button>
          </form>
        </div>

        {canMakeNow > 0 && (
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100/80 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200/50 backdrop-blur-sm">
            🎉 지금 바로 만들 수 있는 레시피 {canMakeNow}개!
          </div>
        )}
      </div>

      {/* Recipe Cards */}
      <div className="space-y-3">
        {sorted.map((card) => (
          <Link
            key={`${card.recipeId}-${card.chefIndex}`}
            to={`/recipe/${card.recipeId}?chefIdx=${card.chefIndex}`}
            className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-3 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group"
          >
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
              {card.thumbnail ? (
                <img
                  src={`/recipe_images/${card.thumbnail}`}
                  alt={card.dishName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🍳</div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-900 truncate">{card.dishName}</p>
              <p className="text-xs text-slate-400 truncate mt-0.5">{card.chefName} · {card.guest} 편</p>

              {/* Match bar */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${card.pct}%` }}
                  />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${matchBadgeColor(card.pct)}`}>
                  {matchLabel(card.pct)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
