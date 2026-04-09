interface ChoiceButtonProps {
  label: string;
  index: number;
  onClick: () => void;
  state: 'default' | 'selected' | 'correct' | 'wrong' | 'disabled';
  isJapanese?: boolean;
}

const labels = ['A', 'B', 'C', 'D'];

const stateStyles: Record<string, string> = {
  default: 'bg-white/90 border-gray-200 hover:border-sakura-300 hover:bg-sakura-50/50 hover:shadow-lg hover:-translate-y-1 cursor-pointer',
  selected: 'bg-sakura-50 border-sakura-400 shadow-lg shadow-sakura-100 -translate-y-1 cursor-default',
  correct: 'bg-emerald-50 border-emerald-400 shadow-lg shadow-emerald-100 cursor-default animate-correct-bounce',
  wrong: 'bg-rose-50 border-rose-400 shadow-lg shadow-rose-100 cursor-default animate-wrong-shake',
  disabled: 'bg-gray-50 border-gray-200 text-gray-400 cursor-default opacity-60',
};

const labelColors: Record<string, string> = {
  default: 'bg-gray-100 text-gray-500',
  selected: 'bg-sakura-100 text-sakura-700',
  correct: 'bg-emerald-100 text-emerald-700',
  wrong: 'bg-rose-100 text-rose-700',
  disabled: 'bg-gray-100 text-gray-400',
};

export default function ChoiceButton({ label, index, onClick, state, isJapanese }: ChoiceButtonProps) {
  return (
    <button
      onClick={state === 'default' ? onClick : undefined}
      disabled={state === 'disabled'}
      className={`group w-full p-5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-5 backdrop-blur-md ${stateStyles[state]}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 transition-colors ${labelColors[state]}`}>
        {labels[index]}
      </div>
      <span className={`text-lg font-bold text-gray-800 text-left flex-1 ${isJapanese ? 'jp-text text-2xl' : ''}`}>
        {label}
      </span>
      {state === 'correct' && (
        <span className="text-2xl animate-bounce">✓</span>
      )}
      {state === 'wrong' && (
        <span className="text-2xl">✗</span>
      )}
    </button>
  );
}
