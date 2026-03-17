import { Check, X } from 'lucide-react';
import { Score } from '../lib/db';

interface ScoreButtonProps {
  score: Score;
  onChange: (score: Score) => void;
}

export function ScoreButton({ score, onChange }: ScoreButtonProps) {
  const cycleScore = () => {
    switch (score) {
      case null: onChange('PASS'); break;
      case 'PASS': onChange('FAIL'); break;
      case 'FAIL': onChange('NA'); break;
      case 'NA': onChange(null); break;
    }
  };

  let content = null;
  let bgClass = 'bg-gray-100 border-gray-300';

  if (score === 'PASS') {
    content = <Check className="w-5 h-5 text-white" />;
    bgClass = 'bg-emerald-500 border-emerald-600';
  } else if (score === 'FAIL') {
    content = <X className="w-5 h-5 text-white" />;
    bgClass = 'bg-red-500 border-red-600';
  } else if (score === 'NA') {
    content = <span className="text-xs font-bold text-gray-600">NA</span>;
    bgClass = 'bg-gray-200 border-gray-400';
  }

  return (
    <button
      type="button"
      onClick={cycleScore}
      className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-md border-2 transition-colors ${bgClass}`}
    >
      {content}
    </button>
  );
}
