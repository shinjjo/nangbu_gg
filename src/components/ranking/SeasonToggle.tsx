import { SeasonFilter } from '../../hooks/useRankings';

interface SeasonToggleProps {
    value: SeasonFilter;
    onChange: (season: SeasonFilter) => void;
}

const options: { value: SeasonFilter; label: string }[] = [
    { value: '1', label: '시즌 1' },
    { value: '2', label: '시즌 2' },
    { value: 'all', label: '전체' },
];

const SeasonToggle = ({ value, onChange }: SeasonToggleProps) => {
    return (
        <div className="relative inline-flex bg-slate-100 rounded-full p-0.5">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`relative z-10 w-20 py-1.5 text-xs font-bold rounded-full text-center transition-all duration-200 ${value === opt.value
                        ? 'text-white'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    {opt.label}
                </button>
            ))}
            {/* Sliding pill */}
            <div
                className="absolute top-0.5 bottom-0.5 bg-slate-900 rounded-full transition-all duration-300 ease-out"
                style={{
                    left: value === '1' ? '2px' : value === '2' ? 'calc(33.33% + 1px)' : 'calc(66.66% - 1px)',
                    width: 'calc(33.33% - 1px)',
                }}
            />
        </div>
    );
};

export default SeasonToggle;
