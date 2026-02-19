import { Swords } from 'lucide-react';

interface VsFloatingButtonProps {
    onClick: () => void;
}

const VsFloatingButton = ({ onClick }: VsFloatingButtonProps) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 w-14 h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center group z-40 active:scale-95"
            title="가상 대결"
        >
            <Swords className="w-6 h-6 group-hover:scale-110 transition-transform" />

            {/* Tooltip */}
            <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                가상 대결
                <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
            </span>
        </button>
    );
};

export default VsFloatingButton;
