import React from 'react';
import { Score } from '../lib/db';

export function ScoreButton({ score, onChange }: { score: Score, onChange: (score: Score) => void }) {
  return (
    <div className="flex gap-1">
      <button 
        onClick={() => onChange('PASS')}
        className={`px-3 py-1 text-xs font-bold rounded ${score === 'PASS' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
      >
        Pass
      </button>
      <button 
        onClick={() => onChange('FAIL')}
        className={`px-3 py-1 text-xs font-bold rounded ${score === 'FAIL' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
      >
        Fail
      </button>
      <button 
        onClick={() => onChange('NA')}
        className={`px-3 py-1 text-xs font-bold rounded ${score === 'NA' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
      >
        N/A
      </button>
    </div>
  );
}
