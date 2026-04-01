import { Camera, Loader2, X } from 'lucide-react';
import { ScoreButton } from '../ScoreButton';
import { Score } from '../../lib/db';

interface AuditItemRowProps {
  item: { id: string; text: string };
  score: Score | null;
  comment: string;
  images: string[];
  isProcessingImage: boolean;
  onScoreChange: (score: Score) => void;
  onCommentChange: (comment: string) => void;
  onImageUploadClick: () => void;
  onRemoveImage: (index: number) => void;
}

export function AuditItemRow({
  item,
  score,
  comment,
  images,
  isProcessingImage,
  onScoreChange,
  onCommentChange,
  onImageUploadClick,
  onRemoveImage
}: AuditItemRowProps) {
  return (
    <div className="flex flex-col p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 pr-4 gap-2">
          <span className="text-gray-800 text-sm">{item.text}</span>
          {score === 'FAIL' && (
            <button 
              onClick={onImageUploadClick}
              disabled={isProcessingImage}
              className={`p-1.5 rounded-full transition-colors shrink-0 ${isProcessingImage ? 'bg-brand/10 text-brand cursor-not-allowed' : 'text-gray-400 hover:text-brand bg-gray-50 hover:bg-red-50'}`}
              title="Add Image Evidence"
            >
              {isProcessingImage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        <ScoreButton 
          score={score} 
          onChange={onScoreChange} 
        />
      </div>
      {score === 'FAIL' && (
        <div className="mt-3 space-y-3">
          <input
            type="text"
            placeholder="Reason for urgent attention..."
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            className="w-full p-2 text-sm border border-red-200 rounded-md focus:ring-1 focus:ring-brand focus:border-brand bg-red-50 placeholder-red-300 text-red-900"
          />
          
          {images && images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img src={img} alt="Evidence" className="w-full aspect-square object-cover rounded-lg border border-gray-200" />
                  <button 
                    onClick={() => onRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500 text-white rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
