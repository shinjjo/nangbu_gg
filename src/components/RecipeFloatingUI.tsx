import { Swords } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecipeFloatingUIProps {
  matchId: string;
}

const RecipeFloatingUI = ({ matchId }: RecipeFloatingUIProps) => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      <button
        onClick={() => navigate(`/match/${matchId}`)}
        className="w-14 h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center group active:scale-95 border border-slate-700/50"
        title="투표하러 가기"
      >
        <Swords className="w-6 h-6 group-hover:scale-110 transition-transform" />
        
        {/* Tooltip */}
        <span className="absolute right-full mr-3 bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
          나라면 누구 편?
          <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
        </span>
      </button>
    </div>
  );
};

export default RecipeFloatingUI;
