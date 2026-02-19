import { Chef } from '../../types';
import { RIVALRIES } from '../../data/rivalries';
import { getChefAvatar } from '../../utils/chefAvatars';

interface RivalryRowProps {
    chefs: Chef[];
    onSelectRivalry: (chef1: Chef, chef2: Chef) => void;
}

const RivalryRow = ({ chefs, onSelectRivalry }: RivalryRowProps) => {
    return (
        <div className="w-full bg-slate-50 border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4 py-3">
                <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
                    <span className="flex-shrink-0 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        🔥 라이벌
                    </span>
                    <div className="w-px h-5 bg-slate-300 flex-shrink-0" />
                    {RIVALRIES.map((rivalry, index) => {
                        const c1 = chefs.find((c) => c.name === rivalry.chef1);
                        const c2 = chefs.find((c) => c.name === rivalry.chef2);

                        if (!c1 || !c2) return null;

                        return (
                            <button
                                key={index}
                                onClick={() => onSelectRivalry(c1, c2)}
                                className="flex-shrink-0 flex items-center gap-2 bg-white border border-slate-200 rounded-full pl-1 pr-3 py-1 hover:border-blue-300 hover:shadow-sm transition-all group"
                            >
                                <div className="flex items-center -space-x-1.5">
                                    <img
                                        src={getChefAvatar(c1.name, c1.image_url)}
                                        alt={c1.name}
                                        className="w-6 h-6 rounded-full border border-white object-cover"
                                    />
                                    <img
                                        src={getChefAvatar(c2.name, c2.image_url)}
                                        alt={c2.name}
                                        className="w-6 h-6 rounded-full border border-white object-cover"
                                    />
                                </div>
                                <span className="text-xs font-semibold text-slate-700 whitespace-nowrap group-hover:text-blue-600 transition-colors">
                                    {rivalry.title}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default RivalryRow;
