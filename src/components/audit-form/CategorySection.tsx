import { AuditItemRow } from './AuditItemRow';
import { Audit, Score } from '../../lib/db';
import { getCategoryScore } from '../../lib/score';

interface CategorySectionProps {
  category: { id: string; title: string; items: { id: string; text: string }[] };
  audit: Audit;
  isProcessingImageId: string | null;
  onItemChange: (itemId: string, score: Score) => void;
  onItemCommentChange: (itemId: string, comment: string) => void;
  onImageUploadClick: (itemId: string) => void;
  onRemoveImage: (itemId: string, index: number) => void;
}

export function CategorySection({
  category,
  audit,
  isProcessingImageId,
  onItemChange,
  onItemCommentChange,
  onImageUploadClick,
  onRemoveImage
}: CategorySectionProps) {
  const score = getCategoryScore(audit, category.id);
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end border-b-2 border-black pb-2">
        <h3 className="font-heading font-bold text-lg text-black">
          {category.title}
        </h3>
        <div className="text-sm font-bold text-brand bg-brand/10 px-2 py-1 rounded">
          {score.valid > 0 ? `${score.percentage}%` : '0%'}
        </div>
      </div>
      <div className="space-y-2">
        {category.items.map(item => (
          <AuditItemRow
            key={item.id}
            item={item}
            score={audit.items[item.id] || null}
            comment={audit.itemComments?.[item.id] || ''}
            images={audit.itemImages?.[item.id] || []}
            isProcessingImage={isProcessingImageId === item.id}
            onScoreChange={(score) => onItemChange(item.id, score)}
            onCommentChange={(comment) => onItemCommentChange(item.id, comment)}
            onImageUploadClick={() => onImageUploadClick(item.id)}
            onRemoveImage={(index) => onRemoveImage(item.id, index)}
          />
        ))}
      </div>
    </div>
  );
}
