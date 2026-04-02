import { Score } from '../lib/db';

export function ScoreButton({ score, onChange, readOnly }: { score: Score, onChange: (score: Score) => void, readOnly?: boolean }) {
  const handleClick = () => {
    if (readOnly) return;
    if (score === null) onChange('PASS');
    else if (score === 'PASS') onChange('FAIL');
    else if (score === 'FAIL') onChange('NA');
    else if (score === 'NA') onChange(null);
  };

  const getProps = () => {
    switch (score) {
      case 'PASS': return { text: 'Pass', className: 'bg-green-500 text-white' };
      case 'FAIL': return { text: 'Fail', className: 'bg-red-500 text-white' };
      case 'NA': return { text: 'N/A', className: 'bg-gray-500 text-white' };
      default: return { text: 'Not Answered', className: 'bg-gray-100 text-gray-600 hover:bg-gray-200' };
    }
  };

  const { text, className } = getProps();

  return (
    <button 
      onClick={handleClick}
      className={`px-3 py-1 text-xs font-bold rounded min-w-[100px] transition-colors ${className} ${readOnly ? 'cursor-default' : ''}`}
    >
      {text}
    </button>
  );
}
